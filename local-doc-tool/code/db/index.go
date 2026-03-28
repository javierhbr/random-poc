package db

import (
	"database/sql"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"

	"local-search/extract"
	"local-search/git"
)

// workItem is a file discovered during directory walking.
type workItem struct {
	absPath string
	entry   fs.DirEntry
	isMedia bool
}

// FullScan indexes all spec files in repoRoot under repoName.
//
// Design: workers read files in parallel and stream parsed Specs through a
// channel. The main goroutine drains the channel and writes each Spec into the
// database immediately inside a single transaction, so memory usage is bounded
// by (workerCount × maxContentBytes) rather than (totalFiles × maxContentBytes).
func FullScan(db *sql.DB, repoName, repoRoot string) (int, error) {
	// Phase 1: walk the directory tree — collect file paths only (fast, no I/O).
	items, err := walkItems(repoRoot)
	if err != nil {
		return 0, err
	}

	// Phase 2: start worker pool — reads file content in parallel.
	// Cap workers between 2 and 16 to avoid overwhelming the kernel's dir cache.
	workerCount := runtime.NumCPU()
	if workerCount < 2 {
		workerCount = 2
	} else if workerCount > 16 {
		workerCount = 16
	}

	type result struct {
		sp  *extract.Spec
		err error
	}
	// Fixed-size channel buffers: backpressure keeps memory bounded.
	workCh    := make(chan workItem, workerCount*2)
	resultsCh := make(chan result,   workerCount*2)

	var wg sync.WaitGroup
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for item := range workCh {
				if item.isMedia {
					companion := extract.CompanionPath(item.absPath)
					sp, e := extract.FromCompanionEntry(repoName, repoRoot, item.absPath, item.entry, companion)
					if e == nil && sp == nil {
						fmt.Fprintf(os.Stderr, "warning: %s — skipped (no companion .md)\n", item.absPath)
					}
					resultsCh <- result{sp, e}
				} else {
					sp, e := extract.FromFileEntry(repoName, repoRoot, item.absPath, item.entry)
					resultsCh <- result{sp, e}
				}
			}
		}()
	}

	// Feed workers and close the work channel when done.
	go func() {
		for _, item := range items {
			workCh <- item
		}
		close(workCh)
	}()

	// Close results channel once all workers finish.
	go func() {
		wg.Wait()
		close(resultsCh)
	}()

	// Phase 3: open transaction and stream Specs directly into the DB.
	tx, err := db.Begin()
	if err != nil {
		// Drain the channel to unblock workers before returning.
		for range resultsCh {
		}
		return 0, err
	}
	defer tx.Rollback() //nolint:errcheck

	if err := deleteRepoEntries(tx, repoName); err != nil {
		return 0, err
	}

	stmt, err := tx.Prepare(
		"INSERT OR REPLACE INTO specs " +
			"(repo,path,project,name,title,tags,summary,fullpath,modified,size,ext,content) " +
			"VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
	)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	count := 0
	for r := range resultsCh {
		if r.sp == nil || r.err != nil {
			continue
		}
		sp := r.sp
		if _, err := stmt.Exec(
			sp.Repo, sp.Path, sp.Project, sp.Name, sp.Title,
			sp.Tags, sp.Summary, sp.FullPath, sp.Modified, sp.Size, sp.Ext, sp.Content,
		); err != nil {
			return 0, err
		}
		count++
	}

	// FTS and tags are cheap SELECT-driven operations; run after all specs are inserted.
	if err := batchInsertFTS(tx, repoName); err != nil {
		return 0, err
	}
	if err := batchInsertTags(tx, repoName); err != nil {
		return 0, err
	}

	if _, err := tx.Exec(
		"INSERT OR REPLACE INTO repos (name, path) VALUES (?,?)", repoName, repoRoot,
	); err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return count, nil
}

// IncrementalScan updates only changed files for a git repo.
// lastCommit is the previously stored HEAD hash (empty string = first scan).
// Returns the number of files updated and the new HEAD commit hash.
//
// Design: file reads happen outside the transaction (no DB lock held during I/O).
// All DB writes are batched into a single transaction after all files are read.
func IncrementalScan(db *sql.DB, repoName, repoRoot, lastCommit string) (int, string, error) {
	changed, err := git.ChangedFiles(repoRoot, lastCommit)
	if err != nil {
		return 0, lastCommit, err
	}
	if len(changed) == 0 {
		newCommit := git.CurrentCommit(repoRoot)
		if newCommit == "" {
			newCommit = lastCommit
		}
		return 0, newCommit, nil
	}

	// Phase 1: read all changed files OUTSIDE the transaction.
	type pendingSpec struct {
		relPath string
		sp      *extract.Spec // nil = file was deleted
	}
	var toDelete []string          // rel paths to remove from DB
	var toInsert []pendingSpec     // new/updated specs

	for _, rel := range changed {
		absPath := filepath.Join(repoRoot, filepath.FromSlash(rel))
		ext := strings.ToLower(filepath.Ext(rel))

		switch {
		case extract.MediaExts[ext]:
			toDelete = append(toDelete, rel)
			if git.FileExists(repoRoot, rel) {
				companion := extract.CompanionPath(absPath)
				sp, err := extract.FromCompanion(repoName, repoRoot, absPath, companion)
				if err != nil || sp == nil {
					fmt.Fprintf(os.Stderr, "warning: %s — skipped (no companion .md)\n", rel)
					continue
				}
				toInsert = append(toInsert, pendingSpec{rel, sp})
			}

		case extract.TextExts[ext]:
			// If this .md is a sidecar for a media file, re-index the media files instead.
			if extract.HasMediaCompanion(absPath) {
				mediaSpecs, mediaRels, err := readMediaForCompanion(repoName, repoRoot, absPath)
				if err != nil {
					return 0, lastCommit, err
				}
				for i, mrel := range mediaRels {
					toDelete = append(toDelete, mrel)
					if mediaSpecs[i] != nil {
						toInsert = append(toInsert, pendingSpec{mrel, mediaSpecs[i]})
					}
				}
				continue
			}
			toDelete = append(toDelete, rel)
			if git.FileExists(repoRoot, rel) {
				sp, err := extract.FromFile(repoName, repoRoot, absPath)
				if err != nil {
					continue
				}
				toInsert = append(toInsert, pendingSpec{rel, sp})
			}
		}
	}

	if len(toDelete) == 0 && len(toInsert) == 0 {
		newCommit := git.CurrentCommit(repoRoot)
		if newCommit == "" {
			newCommit = lastCommit
		}
		return 0, newCommit, nil
	}

	// Phase 2: single transaction for all DB writes.
	tx, err := db.Begin()
	if err != nil {
		return 0, lastCommit, err
	}
	defer tx.Rollback() //nolint:errcheck

	for _, rel := range toDelete {
		if err := deleteSpecEntry(tx, repoName, rel); err != nil {
			return 0, lastCommit, err
		}
	}

	insertStmt, err := tx.Prepare(
		"INSERT OR REPLACE INTO specs " +
			"(repo,path,project,name,title,tags,summary,fullpath,modified,size,ext,content) " +
			"VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
	)
	if err != nil {
		return 0, lastCommit, err
	}
	defer insertStmt.Close()

	for _, p := range toInsert {
		sp := p.sp
		if _, err := insertStmt.Exec(
			sp.Repo, sp.Path, sp.Project, sp.Name, sp.Title,
			sp.Tags, sp.Summary, sp.FullPath, sp.Modified, sp.Size, sp.Ext, sp.Content,
		); err != nil {
			return 0, lastCommit, err
		}
	}

	// Batch FTS and tags for all newly inserted specs in two SQL passes.
	insertedPaths := make([]string, len(toInsert))
	for i, p := range toInsert {
		insertedPaths[i] = p.relPath
	}
	if err := batchInsertFTSPaths(tx, repoName, insertedPaths); err != nil {
		return 0, lastCommit, err
	}
	if err := batchInsertTagsPaths(tx, repoName, insertedPaths); err != nil {
		return 0, lastCommit, err
	}

	if err := tx.Commit(); err != nil {
		return 0, lastCommit, err
	}

	newCommit := git.CurrentCommit(repoRoot)
	if newCommit == "" {
		newCommit = lastCommit
	}
	return len(toInsert), newCommit, nil
}

// DeleteRepo removes all database entries for the named repo and repopulates FTS
// for the remaining repos.
func DeleteRepo(db *sql.DB, repoName string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() //nolint:errcheck

	if err := deleteRepoEntries(tx, repoName); err != nil {
		return err
	}
	if _, err := tx.Exec("DELETE FROM repos WHERE name=?", repoName); err != nil {
		return err
	}
	if _, err := tx.Exec("DELETE FROM meta WHERE key=?", "git_commit_"+repoName); err != nil {
		return err
	}

	// deleteRepoEntries already removed only this repo's FTS entries via
	// "DELETE FROM specs_fts WHERE rowid IN (...)" — remaining repos' FTS data
	// is intact, so no re-index is needed.

	return tx.Commit()
}

// ── directory walk ────────────────────────────────────────────────────────────

// walkItems collects all indexable files from repoRoot.
// It caches directory listings to answer HasMediaCompanionInDir without extra stats.
// Permission-denied errors are skipped; other errors abort the walk.
func walkItems(repoRoot string) ([]workItem, error) {
	// dirEntries caches os.ReadDir results keyed by directory path.
	dirEntries := map[string][]fs.DirEntry{}

	var items []workItem
	err := filepath.WalkDir(repoRoot, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			if os.IsPermission(err) {
				return nil // skip unreadable dirs/files, continue walk
			}
			return err
		}
		if d.IsDir() {
			// d.ReadDir(-1) reuses the already-opened directory handle from
			// WalkDir, avoiding a second getdents syscall per directory.
			if rd, ok := d.(fs.ReadDirFile); ok {
				if entries, readErr := rd.ReadDir(-1); readErr == nil {
					dirEntries[path] = entries
				}
			} else {
				// Fallback for implementations that don't expose ReadDirFile.
				if entries, readErr := os.ReadDir(path); readErr == nil {
					dirEntries[path] = entries
				}
			}
			return nil
		}

		ext := strings.ToLower(filepath.Ext(path))
		switch {
		case extract.TextExts[ext]:
			// Skip .md/.mdx files that are sidecars for a media file.
			stem := strings.TrimSuffix(d.Name(), filepath.Ext(d.Name()))
			dir := filepath.Dir(path)
			if entries, ok := dirEntries[dir]; ok {
				if extract.HasMediaCompanionInDir(stem, entries) {
					return nil // sidecar — skip
				}
			} else if extract.HasMediaCompanion(path) {
				return nil // fallback
			}
			items = append(items, workItem{path, d, false})

		case extract.MediaExts[ext]:
			items = append(items, workItem{path, d, true})
		}
		return nil
	})
	return items, err
}

// ── batch DB operations ───────────────────────────────────────────────────────

func deleteRepoEntries(tx *sql.Tx, repoName string) error {
	// FTS5 contentless tables require the 'delete' command with explicit content.
	// Stream rows and issue the delete command inline — no intermediate slice needed.
	rows, err := tx.Query(
		"SELECT id,repo,name,title,tags,summary,content FROM specs WHERE repo=?", repoName,
	)
	if err != nil {
		return err
	}

	ftsStmt, err := tx.Prepare(
		"INSERT INTO specs_fts(specs_fts,rowid,repo,name,title,tags,summary,content) " +
			"VALUES('delete',?,?,?,?,?,?,?)",
	)
	if err != nil {
		rows.Close()
		return err
	}
	defer ftsStmt.Close()

	for rows.Next() {
		var id int64
		var repo, name, title, tags, summary, content string
		if err := rows.Scan(&id, &repo, &name, &title, &tags, &summary, &content); err != nil {
			rows.Close()
			return err
		}
		if _, err := ftsStmt.Exec(id, repo, name, title, tags, summary, content); err != nil {
			rows.Close()
			return err
		}
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return err
	}

	if _, err := tx.Exec(
		"DELETE FROM spec_tags WHERE spec_id IN (SELECT id FROM specs WHERE repo=?)", repoName,
	); err != nil {
		return err
	}
	if _, err := tx.Exec("DELETE FROM specs WHERE repo=?", repoName); err != nil {
		return err
	}
	return nil
}

func batchInsertFTS(tx *sql.Tx, repoName string) error {
	_, err := tx.Exec(
		"INSERT INTO specs_fts(rowid,repo,name,title,tags,summary,content) "+
			"SELECT id,repo,name,title,tags,summary,content FROM specs WHERE repo=?",
		repoName,
	)
	return err
}

// batchInsertFTSPaths inserts FTS entries for a specific set of paths within a repo.
// Used by IncrementalScan to avoid N+1 per-file SELECT round-trips.
func batchInsertFTSPaths(tx *sql.Tx, repoName string, paths []string) error {
	if len(paths) == 0 {
		return nil
	}
	stmt, err := tx.Prepare(
		"INSERT INTO specs_fts(rowid,repo,name,title,tags,summary,content) " +
			"SELECT id,repo,name,title,tags,summary,content FROM specs WHERE repo=? AND path=?",
	)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, p := range paths {
		if _, err := stmt.Exec(repoName, p); err != nil {
			return err
		}
	}
	return nil
}

// batchInsertTagsPaths inserts spec_tags rows for a specific set of paths within a repo.
// Used by IncrementalScan to avoid N+1 per-file SELECT round-trips.
func batchInsertTagsPaths(tx *sql.Tx, repoName string, paths []string) error {
	if len(paths) == 0 {
		return nil
	}
	placeholders := strings.Repeat("?,", len(paths))
	placeholders = placeholders[:len(placeholders)-1] // trim trailing comma
	args := make([]any, 0, len(paths)+1)
	args = append(args, repoName)
	for _, p := range paths {
		args = append(args, p)
	}
	rows, err := tx.Query(
		"SELECT id, tags FROM specs WHERE repo=? AND tags != '' AND path IN ("+placeholders+")",
		args...,
	)
	if err != nil {
		return err
	}
	defer rows.Close()

	stmt, err := tx.Prepare("INSERT INTO spec_tags (spec_id,tag) VALUES (?,?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for rows.Next() {
		var id int64
		var tags string
		if err := rows.Scan(&id, &tags); err != nil {
			return err
		}
		for _, tag := range splitTags(tags) {
			if _, err := stmt.Exec(id, tag); err != nil {
				return err
			}
		}
	}
	return rows.Err()
}

func batchInsertTags(tx *sql.Tx, repoName string) error {
	rows, err := tx.Query(
		"SELECT id, tags FROM specs WHERE repo=? AND tags != ''", repoName,
	)
	if err != nil {
		return err
	}
	defer rows.Close()

	stmt, err := tx.Prepare("INSERT INTO spec_tags (spec_id,tag) VALUES (?,?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for rows.Next() {
		var id int64
		var tags string
		if err := rows.Scan(&id, &tags); err != nil {
			return err
		}
		for _, tag := range splitTags(tags) {
			if _, err := stmt.Exec(id, tag); err != nil {
				return err
			}
		}
	}
	return rows.Err()
}

// ── single-file incremental helpers ─────────────────────────────────────────

func deleteSpecEntry(tx *sql.Tx, repoName, relPath string) error {
	var id int64
	var repo, name, title, tags, summary, content string
	err := tx.QueryRow(
		"SELECT id,repo,name,title,tags,summary,content FROM specs WHERE repo=? AND path=?",
		repoName, relPath,
	).Scan(&id, &repo, &name, &title, &tags, &summary, &content)
	if err == sql.ErrNoRows {
		return nil
	}
	if err != nil {
		return err
	}

	if _, err := tx.Exec(
		"INSERT INTO specs_fts(specs_fts,rowid,repo,name,title,tags,summary,content) "+
			"VALUES('delete',?,?,?,?,?,?,?)",
		id, repo, name, title, tags, summary, content,
	); err != nil {
		return err
	}
	if _, err := tx.Exec("DELETE FROM spec_tags WHERE spec_id=?", id); err != nil {
		return err
	}
	if _, err := tx.Exec("DELETE FROM specs WHERE id=?", id); err != nil {
		return err
	}
	return nil
}

// readMediaForCompanion reads media specs whose sidecar .md just changed.
// Returns parallel slices of specs and their relative paths.
func readMediaForCompanion(repoName, repoRoot, companionAbsPath string) ([]*extract.Spec, []string, error) {
	stem := strings.TrimSuffix(companionAbsPath, filepath.Ext(companionAbsPath))
	var specs []*extract.Spec
	var rels []string
	for ext := range extract.MediaExts {
		mediaAbs := stem + ext
		if _, err := os.Stat(mediaAbs); os.IsNotExist(err) {
			continue
		}
		rel, err := filepath.Rel(repoRoot, mediaAbs)
		if err != nil {
			continue
		}
		rel = filepath.ToSlash(rel)
		sp, err := extract.FromCompanion(repoName, repoRoot, mediaAbs, companionAbsPath)
		if err != nil {
			continue
		}
		specs = append(specs, sp) // may be nil if companion empty
		rels = append(rels, rel)
	}
	return specs, rels, nil
}

// ── tag helpers ───────────────────────────────────────────────────────────────

func splitTags(tags string) []string {
	var result []string
	for _, t := range strings.Split(tags, ",") {
		t = strings.TrimSpace(t)
		if t != "" {
			result = append(result, t)
		}
	}
	return result
}
