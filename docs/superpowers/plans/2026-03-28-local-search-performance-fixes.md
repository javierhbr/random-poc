# local-search Performance Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 9 confirmed performance issues in the local-search Go CLI covering missing DB indexes, sequential git subprocess overhead, memory-heavy directory walk, and inefficient SQL patterns.

**Architecture:** All fixes are isolated to 4 files — `db/schema.go`, `db/index.go`, `db/query.go`, `extract/extract.go`. No public API signatures change. Each fix is independently compilable and testable with `go build ./...`.

**Tech Stack:** Go 1.21+, SQLite (modernc.org/sqlite, pure Go), FTS5, `filepath.WalkDir`

---

## File Map

| File | Tasks |
|------|-------|
| `local-doc-tool/code/db/schema.go` | Task 1 (missing indexes) |
| `local-doc-tool/code/db/index.go` | Task 2 (batchInsertFTSPaths), Task 3 (streaming walk), Task 4 (deleteRepoEntries cursor safety) |
| `local-doc-tool/code/extract/extract.go` | Task 5 (O(n) media companion scan), Task 6 (extractSummary allocation) |
| `local-doc-tool/code/db/query.go` | Task 7 (LOWER() indexes), Task 8 (Stats caching) |

---

## Task 1: Add missing DB indexes

**Files:**
- Modify: `local-doc-tool/code/db/schema.go:52`

### Context
`spec_tags` has `idx_tags ON spec_tags(tag)` but no index on `spec_id`. Every `DELETE FROM spec_tags WHERE spec_id=?` (called in `deleteSpecEntry` and `deleteRepoEntries`) does a full table scan. With 150K tag rows, each delete scans the entire table.

`ReadSpec` and `SpecsByTag` use `LOWER(col)=LOWER(?)` which bypasses any B-tree index on the column. Adding expression indexes on `LOWER(name)` and `LOWER(tag)` allows SQLite to use the index for these queries.

- [ ] **Step 1: Add the three missing indexes to `schemaSQL`**

In [db/schema.go](local-doc-tool/code/db/schema.go), after line 52 (`CREATE INDEX IF NOT EXISTS idx_tags ON spec_tags(tag);`), add:

```sql
CREATE INDEX IF NOT EXISTS idx_spec_tags_spec_id ON spec_tags(spec_id);
CREATE INDEX IF NOT EXISTS idx_specs_name_lower ON specs(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_tags_lower ON spec_tags(LOWER(tag));
```

The full updated `schemaSQL` constant's index block should look like:
```go
CREATE INDEX IF NOT EXISTS idx_tags ON spec_tags(tag);
CREATE INDEX IF NOT EXISTS idx_spec_tags_spec_id ON spec_tags(spec_id);
CREATE INDEX IF NOT EXISTS idx_specs_name_lower ON specs(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_tags_lower ON spec_tags(LOWER(tag));
```

- [ ] **Step 2: Build to verify no errors**

```bash
cd local-doc-tool/code && go build ./...
```
Expected: no output (clean build).

- [ ] **Step 3: Commit**

```bash
cd local-doc-tool/code
git add db/schema.go
git commit -m "perf: add missing spec_tags(spec_id) and LOWER() expression indexes"
```

---

## Task 2: Batch FTS inserts in IncrementalScan

**Files:**
- Modify: `local-doc-tool/code/db/index.go:425-442` (`batchInsertFTSPaths`)

### Context
`batchInsertFTSPaths` loops and executes one prepared statement per path. For 500 changed files that's 500 individual SQL executions. The `batchInsertTags`/`batchInsertTagsPaths` already uses `IN (...)` for the SELECT — apply the same pattern to FTS insert.

- [ ] **Step 1: Rewrite `batchInsertFTSPaths` to use a single IN-clause statement**

Replace the entire `batchInsertFTSPaths` function in [db/index.go](local-doc-tool/code/db/index.go):

```go
// batchInsertFTSPaths inserts FTS entries for a specific set of paths within a repo.
// Uses a single INSERT...SELECT with IN(...) instead of one exec per path.
func batchInsertFTSPaths(tx *sql.Tx, repoName string, paths []string) error {
	if len(paths) == 0 {
		return nil
	}
	placeholders := strings.Repeat("?,", len(paths))
	placeholders = placeholders[:len(placeholders)-1]
	args := make([]any, 0, len(paths)+1)
	args = append(args, repoName)
	for _, p := range paths {
		args = append(args, p)
	}
	_, err := tx.Exec(
		"INSERT INTO specs_fts(rowid,repo,name,title,tags,summary,content) "+
			"SELECT id,repo,name,title,tags,summary,content FROM specs WHERE repo=? AND path IN ("+placeholders+")",
		args...,
	)
	return err
}
```

- [ ] **Step 2: Build to verify**

```bash
cd local-doc-tool/code && go build ./...
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add db/index.go
git commit -m "perf: batch FTS inserts in IncrementalScan using IN(...) clause"
```

---

## Task 3: Stream items from WalkDir directly to workers

**Files:**
- Modify: `local-doc-tool/code/db/index.go:30-145` (`FullScan`, `walkItems`)

### Context
Phase 1 of `FullScan` calls `walkItems()` which: (a) accumulates the full `[]workItem` slice before any worker starts, and (b) keeps the `dirEntries` map alive for the entire walk (all directory listings in memory simultaneously). With 200K files and 5K directories, the dirEntries map can hold tens of thousands of `fs.DirEntry` values.

The fix: collapse Phase 1 (walk) and the feeder goroutine into one. Pass `workCh` into `walkItems` and send items directly from the WalkDir callback. Workers start as soon as the first item arrives. After each directory is fully processed, its entry in `dirEntries` can be evicted.

- [ ] **Step 1: Change `walkItems` signature to accept a send channel and evict dirEntries per directory**

Replace the `walkItems` function in [db/index.go](local-doc-tool/code/db/index.go):

```go
// walkItems walks repoRoot and sends indexable files to workCh.
// It caches directory listings to answer HasMediaCompanionInDir without extra stats,
// and evicts each directory's cache entry once that directory's files are processed.
// Permission-denied errors are skipped; other errors abort the walk.
func walkItems(repoRoot string, workCh chan<- workItem) error {
	dirEntries := map[string][]fs.DirEntry{}

	err := filepath.WalkDir(repoRoot, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			if os.IsPermission(err) {
				return nil
			}
			return err
		}
		if d.IsDir() {
			if rd, ok := d.(fs.ReadDirFile); ok {
				if entries, readErr := rd.ReadDir(-1); readErr == nil {
					dirEntries[path] = entries
				}
			} else {
				if entries, readErr := os.ReadDir(path); readErr == nil {
					dirEntries[path] = entries
				}
			}
			return nil
		}

		ext := strings.ToLower(filepath.Ext(path))
		dir := filepath.Dir(path)
		switch {
		case extract.TextExts[ext]:
			stem := strings.TrimSuffix(d.Name(), filepath.Ext(d.Name()))
			if entries, ok := dirEntries[dir]; ok {
				if extract.HasMediaCompanionInDir(stem, entries) {
					return nil
				}
			} else if extract.HasMediaCompanion(path) {
				return nil
			}
			workCh <- workItem{path, d, false}

		case extract.MediaExts[ext]:
			workCh <- workItem{path, d, true}
		}

		// Evict dirEntries for this directory if it won't be needed again.
		// We can safely evict once WalkDir moves past this directory's last entry.
		// Use a simple heuristic: evict when the parent directory changes.
		// (WalkDir visits directories depth-first, so once we've sent the last
		// file in a dir, WalkDir will never revisit that directory's entries.)
		delete(dirEntries, dir)
		return nil
	})
	return err
}
```

- [ ] **Step 2: Update `FullScan` to use the new streaming `walkItems`**

Replace the Phase 1 and feeder goroutine section of `FullScan`. The new version starts workers first, then calls `walkItems` directly (it IS the feeder):

```go
func FullScan(db *sql.DB, repoName, repoRoot string) (int, error) {
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

	// Close results channel once all workers finish.
	go func() {
		wg.Wait()
		close(resultsCh)
	}()

	// Walk and feed workers — walkItems now sends directly to workCh.
	walkErr := make(chan error, 1)
	go func() {
		err := walkItems(repoRoot, workCh)
		close(workCh)
		walkErr <- err
	}()

	// Phase 2: open transaction and stream Specs directly into the DB.
	tx, err := db.Begin()
	if err != nil {
		for range resultsCh {}
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

	if err := <-walkErr; err != nil {
		return 0, err
	}

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

	return count, tx.Commit()
}
```

- [ ] **Step 3: Build to verify**

```bash
cd local-doc-tool/code && go build ./...
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add db/index.go
git commit -m "perf: stream walkItems directly to workers, evict dirEntries per-directory"
```

---

## Task 4: Fix read-cursor + write-statement interleaving in `deleteRepoEntries`

**Files:**
- Modify: `local-doc-tool/code/db/index.go:366-411` (`deleteRepoEntries`)

### Context
`deleteRepoEntries` opens a `rows` cursor on `specs`, then calls `ftsStmt.Exec` for each row while that cursor is still open. In `modernc.org/sqlite` (single-connection, pure-Go), executing a write while a read cursor is open can serialize on internal locks. The safe pattern is: materialize the rows, close the cursor, then execute writes.

- [ ] **Step 1: Materialize rows before executing FTS deletes**

Replace `deleteRepoEntries` in [db/index.go](local-doc-tool/code/db/index.go):

```go
func deleteRepoEntries(tx *sql.Tx, repoName string) error {
	rows, err := tx.Query(
		"SELECT id,repo,name,title,tags,summary,content FROM specs WHERE repo=?", repoName,
	)
	if err != nil {
		return err
	}

	type specRow struct {
		id                               int64
		repo, name, title, tags, summary, content string
	}
	var toDelete []specRow
	for rows.Next() {
		var r specRow
		if err := rows.Scan(&r.id, &r.repo, &r.name, &r.title, &r.tags, &r.summary, &r.content); err != nil {
			rows.Close()
			return err
		}
		toDelete = append(toDelete, r)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return err
	}

	ftsStmt, err := tx.Prepare(
		"INSERT INTO specs_fts(specs_fts,rowid,repo,name,title,tags,summary,content) " +
			"VALUES('delete',?,?,?,?,?,?,?)",
	)
	if err != nil {
		return err
	}
	defer ftsStmt.Close()

	for _, r := range toDelete {
		if _, err := ftsStmt.Exec(r.id, r.repo, r.name, r.title, r.tags, r.summary, r.content); err != nil {
			return err
		}
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
```

- [ ] **Step 2: Build to verify**

```bash
cd local-doc-tool/code && go build ./...
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add db/index.go
git commit -m "perf: materialize rows before FTS deletes to avoid cursor/write interleaving"
```

---

## Task 5: O(1) media companion check with per-directory stem map

**Files:**
- Modify: `local-doc-tool/code/extract/extract.go:183-194` (`HasMediaCompanionInDir`)
- Modify: `local-doc-tool/code/db/index.go` (`walkItems` — builds stem map from cached entries)

### Context
`HasMediaCompanionInDir` linearly scans all directory entries for every `.md` file. In a directory with 500 entries and 100 `.md` files, that's 50K comparisons. The fix is to build a `map[string]bool` of media stems once per directory, then each lookup is O(1).

Since `walkItems` owns the `dirEntries` cache, we build a parallel `mediaStems` map in `walkItems` and pass it to an updated check function.

- [ ] **Step 1: Add `HasMediaStemInDir` accepting a pre-built stem map**

Add this function to [extract/extract.go](local-doc-tool/code/extract/extract.go) (near `HasMediaCompanionInDir`):

```go
// BuildMediaStems returns a set of file stems (without extension) that have a
// media extension in the given directory entries. Used for O(1) sidecar checks.
func BuildMediaStems(entries []fs.DirEntry) map[string]bool {
	stems := make(map[string]bool, len(entries)/4+1)
	for _, e := range entries {
		ext := strings.ToLower(filepath.Ext(e.Name()))
		if MediaExts[ext] {
			stems[strings.TrimSuffix(e.Name(), filepath.Ext(e.Name()))] = true
		}
	}
	return stems
}
```

- [ ] **Step 2: Update `walkItems` to build and use stem maps**

In `walkItems` in [db/index.go](local-doc-tool/code/db/index.go), add a parallel `mediaStems` map alongside `dirEntries`, populate it when directory entries are cached, and use it for the sidecar check:

```go
func walkItems(repoRoot string, workCh chan<- workItem) error {
	dirEntries  := map[string][]fs.DirEntry{}
	mediaStems  := map[string]map[string]bool{} // dir → stem → true

	err := filepath.WalkDir(repoRoot, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			if os.IsPermission(err) {
				return nil
			}
			return err
		}
		if d.IsDir() {
			var entries []fs.DirEntry
			if rd, ok := d.(fs.ReadDirFile); ok {
				if e, readErr := rd.ReadDir(-1); readErr == nil {
					entries = e
				}
			} else {
				if e, readErr := os.ReadDir(path); readErr == nil {
					entries = e
				}
			}
			if entries != nil {
				dirEntries[path] = entries
				mediaStems[path] = extract.BuildMediaStems(entries)
			}
			return nil
		}

		ext := strings.ToLower(filepath.Ext(path))
		dir := filepath.Dir(path)
		switch {
		case extract.TextExts[ext]:
			stem := strings.TrimSuffix(d.Name(), filepath.Ext(d.Name()))
			if stems, ok := mediaStems[dir]; ok {
				if stems[stem] {
					return nil // sidecar — skip
				}
			} else if extract.HasMediaCompanion(path) {
				return nil // fallback (rare: permission issue on dir)
			}
			workCh <- workItem{path, d, false}

		case extract.MediaExts[ext]:
			workCh <- workItem{path, d, true}
		}

		delete(dirEntries, dir)
		delete(mediaStems, dir)
		return nil
	})
	return err
}
```

- [ ] **Step 3: Build to verify**

```bash
cd local-doc-tool/code && go build ./...
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add extract/extract.go db/index.go
git commit -m "perf: O(1) media sidecar check using pre-built stem map per directory"
```

---

## Task 6: Eliminate full-line-split allocation in `extractSummary`

**Files:**
- Modify: `local-doc-tool/code/extract/extract.go:249-283` (`extractSummary`)

### Context
`strings.Split(body, "\n")` allocates a slice of all lines even when the summary is found in the first few. For a 5K-line file this allocates and then discards thousands of strings. The fix scans line-by-line using `strings.IndexByte`, stopping at the first blank line after content is collected.

- [ ] **Step 1: Rewrite `extractSummary` to scan without full split**

Replace `extractSummary` in [extract/extract.go](local-doc-tool/code/extract/extract.go):

```go
func extractSummary(content string) string {
	// Strip frontmatter without allocating a new string copy.
	body := content
	if loc := frontmatterRe.FindStringIndex(content); loc != nil {
		body = content[loc[1]:]
	}

	var lines []string
	collecting := false

	// Scan line-by-line without allocating a []string for all lines.
	for len(body) > 0 {
		var line string
		if i := strings.IndexByte(body, '\n'); i >= 0 {
			line = body[:i]
			body = body[i+1:]
		} else {
			line = body
			body = ""
		}
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "#") {
			continue
		}
		if trimmed == "" {
			if collecting {
				break
			}
			continue
		}
		collecting = true
		lines = append(lines, trimmed)
	}

	summary := strings.Join(lines, " ")
	runes := []rune(summary)
	if len(runes) > maxSummaryChars {
		return string(runes[:maxSummaryChars])
	}
	return summary
}
```

- [ ] **Step 2: Build to verify**

```bash
cd local-doc-tool/code && go build ./...
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add extract/extract.go
git commit -m "perf: extractSummary scans line-by-line without full split allocation"
```

---

## Task 7: Remove `LOWER()` wrapping now that expression indexes exist

**Files:**
- Modify: `local-doc-tool/code/db/query.go:89` (`ReadSpec`)
- Modify: `local-doc-tool/code/db/query.go:439` (`SpecsByTag`)

### Context
With the expression indexes `idx_specs_name_lower` and `idx_tags_lower` added in Task 1, SQLite CAN use them — but only if the query uses exactly `LOWER(col)=LOWER(?)`. Verify the existing queries already use this form; if they do, no query change is needed. If they use `col=?` they need to switch to `LOWER(col)=LOWER(?)` to hit the index.

Current code in `ReadSpec` (line 89):
```go
base := "SELECT fullpath, repo, project||'/'||name FROM specs WHERE LOWER(name)=LOWER(?)"
```
Current code in `SpecsByTag` (line 439):
```go
WHERE LOWER(t.tag) = LOWER(?)
```

Both already use `LOWER(col)=LOWER(?)` — the expression indexes added in Task 1 will be picked up automatically. **No query changes needed.** This task is a verification step only.

- [ ] **Step 1: Confirm the LOWER() form matches the index definitions**

Run a quick EXPLAIN to verify index usage (requires a populated database):
```bash
cd local-doc-tool/code
./local-search stats   # ensure DB exists
sqlite3 ~/.local-search/specs.db "EXPLAIN QUERY PLAN SELECT fullpath, repo, project||'/'||name FROM specs WHERE LOWER(name)=LOWER('foo')"
```
Expected output includes: `SEARCH specs USING INDEX idx_specs_name_lower`

If you don't have a DB yet, skip this step — the index will be used once data is present.

- [ ] **Step 2: Commit note**

No code change needed. The expression indexes in Task 1 cover this. Mark complete.

---

## Task 8: Cache aggregate stats in meta table

**Files:**
- Modify: `local-doc-tool/code/db/query.go:405-432` (`Stats`, `PrintStats`)
- Modify: `local-doc-tool/code/db/index.go` (`FullScan`, `IncrementalScan` — invalidate cache after scan)

### Context
`Stats()` runs 5 full-table subquery scans on every call. The stats are only meaningful after a scan, so computing them once after each scan and caching in `meta` makes the `stats` command near-instant.

- [ ] **Step 1: Add `RefreshStats` function to `query.go`**

Add this function to [db/query.go](local-doc-tool/code/db/query.go) after `Stats()`:

```go
// RefreshStats recomputes aggregate statistics and caches them in the meta table.
// Call after any scan that modifies the index.
func RefreshStats(db *sql.DB) error {
	var s StatsResult
	err := db.QueryRow(`
		SELECT
		  (SELECT COUNT(*) FROM repos),
		  (SELECT COUNT(*) FROM specs),
		  (SELECT COUNT(DISTINCT project) FROM specs),
		  (SELECT COUNT(DISTINCT tag) FROM spec_tags),
		  (SELECT COALESCE(SUM(size),0) FROM specs)
	`).Scan(&s.Repos, &s.TotalSpecs, &s.Projects, &s.UniqueTags, &s.TotalBytes)
	if err != nil {
		return err
	}
	type kv struct{ k, v string }
	pairs := []kv{
		{"stats_repos", strconv.Itoa(s.Repos)},
		{"stats_specs", strconv.Itoa(s.TotalSpecs)},
		{"stats_projects", strconv.Itoa(s.Projects)},
		{"stats_tags", strconv.Itoa(s.UniqueTags)},
		{"stats_bytes", strconv.FormatInt(s.TotalBytes, 10)},
	}
	for _, p := range pairs {
		if _, err := db.Exec("INSERT OR REPLACE INTO meta (key,value) VALUES (?,?)", p.k, p.v); err != nil {
			return err
		}
	}
	return nil
}
```

Note: `strconv` must be imported in `query.go`. Add `"strconv"` to the import block.

- [ ] **Step 2: Update `Stats()` to read from cache when available**

Replace `Stats()` in [db/query.go](local-doc-tool/code/db/query.go):

```go
// Stats returns aggregate index statistics. Reads from the meta cache when
// available (populated by RefreshStats after each scan). Falls back to live
// queries if the cache is absent.
func Stats(db *sql.DB) (StatsResult, error) {
	var s StatsResult

	// Try cache first.
	if v := getMeta(db, "stats_specs"); v != "" {
		s.Repos, _      = strconv.Atoi(getMeta(db, "stats_repos"))
		s.TotalSpecs, _ = strconv.Atoi(v)
		s.Projects, _   = strconv.Atoi(getMeta(db, "stats_projects"))
		s.UniqueTags, _  = strconv.Atoi(getMeta(db, "stats_tags"))
		s.TotalBytes, _  = strconv.ParseInt(getMeta(db, "stats_bytes"), 10, 64)
		s.LastScan       = getMeta(db, "last_scan")
		return s, nil
	}

	// Cache miss: compute live.
	err := db.QueryRow(`
		SELECT
		  (SELECT COUNT(*) FROM repos),
		  (SELECT COUNT(*) FROM specs),
		  (SELECT COUNT(DISTINCT project) FROM specs),
		  (SELECT COUNT(DISTINCT tag) FROM spec_tags),
		  (SELECT COALESCE(SUM(size),0) FROM specs),
		  (SELECT COALESCE(value,'never') FROM meta WHERE key='last_scan')
	`).Scan(&s.Repos, &s.TotalSpecs, &s.Projects, &s.UniqueTags, &s.TotalBytes, &s.LastScan)
	return s, err
}

// getMeta is a package-local helper to read a meta value without error propagation.
func getMeta(db *sql.DB, key string) string {
	var val string
	db.QueryRow("SELECT value FROM meta WHERE key=?", key).Scan(&val) //nolint:errcheck
	return val
}
```

- [ ] **Step 3: Call `RefreshStats` at end of `FullScan` and `IncrementalScan`**

In [db/index.go](local-doc-tool/code/db/index.go), after `tx.Commit()` in `FullScan`, add:
```go
if err := tx.Commit(); err != nil {
    return 0, err
}
RefreshStats(db) //nolint:errcheck  — best-effort cache update
return count, nil
```

And after `tx.Commit()` in `IncrementalScan`:
```go
if err := tx.Commit(); err != nil {
    return 0, lastCommit, err
}
RefreshStats(db) //nolint:errcheck
```

Note: `RefreshStats` runs outside the transaction (on the main `db`, not `tx`) so it reads the freshly-committed data.

- [ ] **Step 4: Build to verify**

```bash
cd local-doc-tool/code && go build ./...
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add db/query.go db/index.go
git commit -m "perf: cache stats in meta table, refresh after each scan"
```

---

## Verification

After all tasks are complete:

```bash
cd local-doc-tool/code
go build -o local-search .

# Smoke test: version still works
./local-search -v

# Add a test repo and scan (triggers FullScan with streaming walk + cached stats)
./local-search repo add ../examples/platform-docs test-repo

# Search (triggers IncrementalScan with batched FTS)
./local-search search "architecture"

# Stats should be instant (reads from cache)
./local-search stats

# Verify indexes exist in schema
sqlite3 ~/.local-search/specs.db ".indexes"
# Expected: idx_tags, idx_spec_tags_spec_id, idx_specs_name_lower, idx_tags_lower
```
