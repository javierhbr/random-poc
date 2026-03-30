# Performance Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all identified performance issues in the local-doc-tool indexer for large directory trees and high file counts.

**Architecture:** Nine targeted fixes applied to three files (`db/index.go`, `db/query.go`, `db/schema.go`, `extract/extract.go`) with one new test file. No structural reorganisation — all changes are surgical edits within existing function boundaries.

**Tech Stack:** Go 1.25, `modernc.org/sqlite`, SQLite FTS5, `database/sql`

---

## Files Changed

| File | Changes |
|---|---|
| `extract/extract.go` | Fix `extractSummary` rune alloc; remove unused `HasMediaCompanionInDir` export |
| `db/index.go` | Eliminate double `ReadDir`; stream FTS deletes in `deleteRepoEntries`; batch `deleteSpecEntry` deletes; fix read-cursor-during-write in `batchInsertTagsPaths` |
| `db/query.go` | Fix `Stats` subquery count; fix `RefreshStats` subquery count |
| `db/schema.go` | Add `modified` as INTEGER column (migration); add index on `modified`; add covering index on `(repo, project)` |
| `local-doc-tool/code/db/index_test.go` | New: tests for all fixed behaviours |

---

### Task 1: Fix `extractSummary` — skip rune allocation when not truncating

**Files:**
- Modify: `local-doc-tool/code/extract/extract.go:298-304`
- Test: `local-doc-tool/code/extract/extract_test.go` (create)

- [ ] **Step 1: Create the test file with a failing test**

Create `local-doc-tool/code/extract/extract_test.go`:

```go
package extract

import (
	"strings"
	"testing"
	"unicode/utf8"
)

func TestExtractSummaryNoAllocForShortText(t *testing.T) {
	// A summary well under 300 chars must not allocate a rune slice.
	// We verify the result is correct; allocation reduction is the side-effect.
	content := "# Title\n\nThis is a short summary paragraph."
	got := extractSummary(content)
	if got != "This is a short summary paragraph." {
		t.Fatalf("unexpected summary: %q", got)
	}
}

func TestExtractSummaryTruncatesAtMaxChars(t *testing.T) {
	// Build a paragraph of exactly 350 multibyte runes (€ = 3 bytes each).
	para := strings.Repeat("€", 350)
	content := "# Title\n\n" + para
	got := extractSummary(content)
	n := utf8.RuneCountInString(got)
	if n != maxSummaryChars {
		t.Fatalf("expected %d runes, got %d", maxSummaryChars, n)
	}
}

func TestExtractSummaryExactlyAtLimit(t *testing.T) {
	// Paragraph of exactly maxSummaryChars runes — must not be truncated.
	para := strings.Repeat("a", maxSummaryChars)
	content := "# Title\n\n" + para
	got := extractSummary(content)
	if got != para {
		t.Fatalf("expected untruncated para, got len %d", len(got))
	}
}
```

- [ ] **Step 2: Run tests to confirm they compile and the logic tests pass (they should — we're testing the existing behaviour before changing code)**

```
cd local-doc-tool/code && go test ./extract/... -run TestExtractSummary -v
```

Expected: all three PASS (the existing code is correct, just inefficient).

- [ ] **Step 3: Replace the rune-allocation block in `extractSummary`**

In `local-doc-tool/code/extract/extract.go`, replace lines 299–304:

Old:
```go
	summary := strings.Join(lines, " ")
	// Single rune conversion: convert once, slice if needed.
	runes := []rune(summary)
	if len(runes) > maxSummaryChars {
		return string(runes[:maxSummaryChars])
	}
	return summary
```

New:
```go
	summary := strings.Join(lines, " ")
	if utf8.RuneCountInString(summary) <= maxSummaryChars {
		return summary
	}
	// Only allocate rune slice when truncation is actually needed.
	return string([]rune(summary)[:maxSummaryChars])
```

Also add `"unicode/utf8"` to the import block in `extract.go` (it is not currently imported).

- [ ] **Step 4: Run tests to confirm they still pass**

```
cd local-doc-tool/code && go test ./extract/... -run TestExtractSummary -v
```

Expected: all three PASS.

- [ ] **Step 5: Commit**

```bash
cd local-doc-tool/code
git add extract/extract.go extract/extract_test.go
git commit -m "perf(extract): skip rune alloc in extractSummary when no truncation needed"
```

---

### Task 2: Eliminate double `os.ReadDir` in `walkItems`

**Files:**
- Modify: `local-doc-tool/code/db/index.go:352-406`

The current code calls `os.ReadDir(path)` explicitly inside the `WalkDir` callback every time it enters a directory. `filepath.WalkDir` already read those entries internally — this is a second kernel call per directory. The fix is to use the `fs.ReadDirFile` interface (available via `os.Open` + `ReadDir`) — but a simpler approach is to pre-populate `mediaStems` lazily from the entries already available through the `DirEntry` passed by `WalkDir` when `d.IsDir()` is true, using `os.ReadDir` only where we can't avoid it. Actually the cleanest fix is to switch from `filepath.WalkDir` to `fs.WalkDir` with `os.DirFS`, which passes pre-read `DirEntry` slices to the walk function — but that changes the API surface significantly.

The pragmatic fix: remove the explicit `os.ReadDir` call inside the directory branch and instead collect stems *lazily* — on the first non-directory file in a directory, read the directory once via `os.ReadDir` and cache it. This de-duplicates the directory read from WalkDir's internal read because the OS page cache absorbs the second call. However, to truly eliminate the duplicate we can use `fs.ReadDirFS`:

Replace `filepath.WalkDir` with a manual recursive walk using `os.ReadDir` once per directory, passing those cached entries into `BuildMediaStems`.

- [ ] **Step 1: Write a test for walkItems that counts directory reads**

Add to `local-doc-tool/code/db/index_test.go` (create the file):

```go
package db

import (
	"os"
	"path/filepath"
	"testing"

	"local-search/extract"
)

// TestWalkItemsNoDuplicateReadDir verifies walkItems sends the correct set of
// work items for a small fixture tree and does not panic.
func TestWalkItemsNoDuplicateReadDir(t *testing.T) {
	// Build a temp tree:
	//   root/
	//     a.md
	//     img.png
	//     img.md        <- sidecar, should be skipped
	//     sub/
	//       b.txt
	dir := t.TempDir()
	root := filepath.Join(dir, "root")
	sub := filepath.Join(root, "sub")
	if err := os.MkdirAll(sub, 0755); err != nil {
		t.Fatal(err)
	}
	write := func(path, content string) {
		if err := os.WriteFile(path, []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}
	write(filepath.Join(root, "a.md"), "# A\nContent A")
	write(filepath.Join(root, "img.png"), "fake png")
	write(filepath.Join(root, "img.md"), "# Img sidecar")
	write(filepath.Join(sub, "b.txt"), "Content B")

	workCh := make(chan workItem, 10)
	if err := walkItems(root, workCh); err != nil {
		t.Fatalf("walkItems error: %v", err)
	}
	close(workCh)

	var items []workItem
	for item := range workCh {
		items = append(items, item)
	}

	// Expect: a.md (text), img.png (media), sub/b.txt (text). img.md is sidecar → skipped.
	if len(items) != 3 {
		t.Fatalf("expected 3 items, got %d: %v", len(items), items)
	}

	byName := map[string]workItem{}
	for _, it := range items {
		byName[filepath.Base(it.absPath)] = it
	}

	if _, ok := byName["a.md"]; !ok {
		t.Error("a.md missing")
	}
	if it, ok := byName["img.png"]; !ok || !it.isMedia {
		t.Error("img.png missing or not marked isMedia")
	}
	if _, ok := byName["b.txt"]; !ok {
		t.Error("sub/b.txt missing")
	}
	if _, ok := byName["img.md"]; ok {
		t.Error("img.md (sidecar) should have been skipped")
	}

	// Verify extract.MediaExts is referenced so the package is used.
	_ = extract.MediaExts
}
```

- [ ] **Step 2: Run the test to confirm it passes with the current code**

```
cd local-doc-tool/code && go test ./db/... -run TestWalkItemsNoDuplicateReadDir -v
```

Expected: PASS (test checks correctness, not the number of ReadDir calls).

- [ ] **Step 3: Replace the `walkItems` implementation to eliminate the double ReadDir**

Replace the entire `walkItems` function in `local-doc-tool/code/db/index.go` (lines 352–406) with:

```go
// walkItems walks repoRoot and sends indexable files directly to workCh.
// Each directory is read exactly once: we use os.ReadDir ourselves and drive
// the recursion manually, so WalkDir's internal ReadDir is eliminated.
// Workers start consuming as soon as the first item arrives — no intermediate
// slice is built. Permission-denied errors are skipped; all other errors abort.
func walkItems(repoRoot string, workCh chan<- workItem) error {
	return walkDir(repoRoot, workCh)
}

func walkDir(dir string, workCh chan<- workItem) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsPermission(err) {
			return nil
		}
		return err
	}

	// Build the media-stem set for this directory in one pass over the entries
	// we already have — no second ReadDir needed.
	mediaStems := extract.BuildMediaStems(entries)

	for _, d := range entries {
		path := filepath.Join(dir, d.Name())

		if d.IsDir() {
			if err := walkDir(path, workCh); err != nil {
				return err
			}
			continue
		}

		ext := strings.ToLower(filepath.Ext(d.Name()))
		switch {
		case extract.TextExts[ext]:
			stem := strings.TrimSuffix(d.Name(), filepath.Ext(d.Name()))
			if mediaStems[stem] {
				continue // sidecar — skip
			}
			workCh <- workItem{path, d, false}

		case extract.MediaExts[ext]:
			workCh <- workItem{path, d, true}
		}
	}
	return nil
}
```

Remove the now-unused `lastDir` variable and the `mediaStems` map that were in the old closure. Also remove the import of `"io/fs"` if it is now unused (check — `workItem` uses `fs.DirEntry`, so keep it).

- [ ] **Step 4: Verify the test still passes and the build is clean**

```
cd local-doc-tool/code && go build ./... && go test ./db/... -run TestWalkItemsNoDuplicateReadDir -v
```

Expected: build succeeds, test PASS.

- [ ] **Step 5: Commit**

```bash
cd local-doc-tool/code
git add db/index.go db/index_test.go
git commit -m "perf(db): eliminate double os.ReadDir per directory in walkItems"
```

---

### Task 3: Stream FTS deletes in `deleteRepoEntries` — no full materialization

**Files:**
- Modify: `local-doc-tool/code/db/index.go:410-468`

Currently `deleteRepoEntries` loads every spec row for the repo into a `[]specRow` slice (unbounded RAM), then loops executing one FTS-delete statement per row. The fix replaces the individual-row FTS deletes with a single bulk SQL INSERT that the FTS engine handles internally — identical to the `batchInsertFTS` pattern already in use for inserts.

- [ ] **Step 1: Add a test for deleteRepoEntries**

Add to `local-doc-tool/code/db/index_test.go`:

```go
func TestDeleteRepoEntriesRemovesAllRows(t *testing.T) {
	db := openTestDB(t)

	// Insert two repos with one spec each.
	insertSpec(t, db, "repoA", "a/spec.md", "spec-a")
	insertSpec(t, db, "repoB", "b/spec.md", "spec-b")

	tx, err := db.Begin()
	if err != nil {
		t.Fatal(err)
	}
	if err := deleteRepoEntries(tx, "repoA"); err != nil {
		tx.Rollback()
		t.Fatal(err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatal(err)
	}

	var count int
	db.QueryRow("SELECT COUNT(*) FROM specs WHERE repo='repoA'").Scan(&count)
	if count != 0 {
		t.Fatalf("expected 0 specs for repoA after delete, got %d", count)
	}
	db.QueryRow("SELECT COUNT(*) FROM specs WHERE repo='repoB'").Scan(&count)
	if count != 1 {
		t.Fatalf("expected 1 spec for repoB to remain, got %d", count)
	}
}

// ── test helpers ─────────────────────────────────────────────────────────────

func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := Open(filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("openTestDB: %v", err)
	}
	if err := CreateSchema(db); err != nil {
		t.Fatalf("CreateSchema: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func insertSpec(t *testing.T, db *sql.DB, repo, path, name string) {
	t.Helper()
	tx, err := db.Begin()
	if err != nil {
		t.Fatal(err)
	}
	_, err = tx.Exec(
		"INSERT INTO specs (repo,path,project,name,title,tags,summary,fullpath,modified,size,ext,content) "+
			"VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
		repo, path, "_root", name, name+" title", "", "", "/fake/"+path, "1700000000", 100, "md", "content of "+name,
	)
	if err != nil {
		tx.Rollback()
		t.Fatal(err)
	}
	// also insert into FTS
	if err := batchInsertFTS(tx, repo); err != nil {
		tx.Rollback()
		t.Fatal(err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatal(err)
	}
}
```

Also add the `"database/sql"` import to the test file header:

```go
package db

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"

	"local-search/extract"
)
```

- [ ] **Step 2: Run the test to confirm it passes with current code**

```
cd local-doc-tool/code && go test ./db/... -run TestDeleteRepoEntriesRemovesAllRows -v
```

Expected: PASS.

- [ ] **Step 3: Replace `deleteRepoEntries` with the streaming bulk-delete version**

Replace the entire `deleteRepoEntries` function in `local-doc-tool/code/db/index.go` (lines 410–468) with:

```go
// deleteRepoEntries removes all specs, FTS entries, and tags for repoName.
// FTS is cleaned via a single bulk INSERT ... SELECT using the 'delete' command,
// which avoids materialising all rows into Go memory. Tags and specs are then
// removed with two DELETE statements.
func deleteRepoEntries(tx *sql.Tx, repoName string) error {
	// Delete FTS entries in one SQL pass — the FTS5 'delete' command accepts a
	// SELECT as the source; content is passed as '' because contentless tables
	// do not validate it on delete.
	if _, err := tx.Exec(
		"INSERT INTO specs_fts(specs_fts,rowid,repo,name,title,tags,summary,content) "+
			"SELECT 'delete',id,repo,name,title,tags,summary,'' FROM specs WHERE repo=?",
		repoName,
	); err != nil {
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
```

- [ ] **Step 4: Run tests**

```
cd local-doc-tool/code && go test ./db/... -v
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd local-doc-tool/code
git add db/index.go db/index_test.go
git commit -m "perf(db): stream FTS deletes in deleteRepoEntries, eliminate O(N) RAM materialization"
```

---

### Task 4: Batch `deleteSpecEntry` deletes in `IncrementalScan`

**Files:**
- Modify: `local-doc-tool/code/db/index.go:268-272` (the delete loop in `IncrementalScan`)
- Modify: `local-doc-tool/code/db/index.go:577-606` (the `deleteSpecEntry` helper itself)

Currently Phase 2 of `IncrementalScan` calls `deleteSpecEntry` once per path, issuing 4 SQL statements per file. The fix batches all deletes into the same two-statement pattern used by the refactored `deleteRepoEntries`.

- [ ] **Step 1: Add a test for incremental delete batching**

Add to `local-doc-tool/code/db/index_test.go`:

```go
func TestDeleteSpecEntriesBatch(t *testing.T) {
	db := openTestDB(t)
	insertSpec(t, db, "repoA", "a/one.md", "one")
	insertSpec(t, db, "repoA", "a/two.md", "two")
	insertSpec(t, db, "repoA", "a/three.md", "three")

	tx, err := db.Begin()
	if err != nil {
		t.Fatal(err)
	}
	if err := deleteSpecEntries(tx, "repoA", []string{"a/one.md", "a/three.md"}); err != nil {
		tx.Rollback()
		t.Fatal(err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatal(err)
	}

	var count int
	db.QueryRow("SELECT COUNT(*) FROM specs WHERE repo='repoA'").Scan(&count)
	if count != 1 {
		t.Fatalf("expected 1 remaining spec, got %d", count)
	}
	var name string
	db.QueryRow("SELECT name FROM specs WHERE repo='repoA'").Scan(&name)
	if name != "two" {
		t.Fatalf("expected 'two' to remain, got %q", name)
	}
}
```

- [ ] **Step 2: Run the test to confirm it fails (function does not exist yet)**

```
cd local-doc-tool/code && go test ./db/... -run TestDeleteSpecEntriesBatch -v
```

Expected: FAIL — compile error `deleteSpecEntries undefined`.

- [ ] **Step 3: Add `deleteSpecEntries` (batch) and update `IncrementalScan` to call it**

In `local-doc-tool/code/db/index.go`, replace the single-file `deleteSpecEntry` helper (lines 577–606) with the following two functions:

```go
// deleteSpecEntries removes the given relative paths (and their FTS/tag rows) for
// repoName in a single batch — two SQL statements regardless of how many paths.
// Paths are chunked to stay within SQLite's variable limit.
func deleteSpecEntries(tx *sql.Tx, repoName string, relPaths []string) error {
	if len(relPaths) == 0 {
		return nil
	}
	return chunkPaths(relPaths, func(chunk []string) error {
		placeholders := strings.Repeat("?,", len(chunk))
		placeholders = placeholders[:len(placeholders)-1]
		args := make([]any, 0, len(chunk)+1)
		args = append(args, repoName)
		for _, p := range chunk {
			args = append(args, p)
		}

		// FTS delete in one pass.
		if _, err := tx.Exec(
			"INSERT INTO specs_fts(specs_fts,rowid,repo,name,title,tags,summary,content) "+
				"SELECT 'delete',id,repo,name,title,tags,summary,'' FROM specs "+
				"WHERE repo=? AND path IN ("+placeholders+")",
			args...,
		); err != nil {
			return err
		}
		// spec_tags delete.
		if _, err := tx.Exec(
			"DELETE FROM spec_tags WHERE spec_id IN "+
				"(SELECT id FROM specs WHERE repo=? AND path IN ("+placeholders+"))",
			args...,
		); err != nil {
			return err
		}
		// specs delete.
		if _, err := tx.Exec(
			"DELETE FROM specs WHERE repo=? AND path IN ("+placeholders+")",
			args...,
		); err != nil {
			return err
		}
		return nil
	})
}
```

Remove the old `deleteSpecEntry` (single-file) function entirely.

Also update the delete loop in `IncrementalScan` (around line 268) from:

```go
	for _, rel := range toDelete {
		if err := deleteSpecEntry(tx, repoName, rel); err != nil {
			return 0, lastCommit, err
		}
	}
```

to:

```go
	if err := deleteSpecEntries(tx, repoName, toDelete); err != nil {
		return 0, lastCommit, err
	}
```

- [ ] **Step 4: Run all tests**

```
cd local-doc-tool/code && go test ./db/... -v
```

Expected: all tests PASS (including `TestDeleteSpecEntriesBatch`).

- [ ] **Step 5: Commit**

```bash
cd local-doc-tool/code
git add db/index.go db/index_test.go
git commit -m "perf(db): batch deleteSpecEntries — replace N×4 SQL statements with 3 per chunk"
```

---

### Task 5: Fix read-cursor-open-during-writes in `batchInsertTagsPaths`

**Files:**
- Modify: `local-doc-tool/code/db/index.go:503-543`

`batchInsertTagsPaths` holds a `rows` read cursor open while executing `stmt.Exec` writes inside the same transaction. This serializes reads and writes on a single connection and relies on driver-internal behaviour. Fix: materialize the `(id, tags)` pairs first, close the cursor, then execute the inserts.

- [ ] **Step 1: Add a test**

Add to `local-doc-tool/code/db/index_test.go`:

```go
func TestBatchInsertTagsPathsRoundtrip(t *testing.T) {
	db := openTestDB(t)
	// insertSpec uses batchInsertFTS but not tags — insert a spec with tags manually.
	tx, err := db.Begin()
	if err != nil {
		t.Fatal(err)
	}
	_, err = tx.Exec(
		"INSERT INTO specs (repo,path,project,name,title,tags,summary,fullpath,modified,size,ext,content) "+
			"VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
		"repoA", "a/doc.md", "_root", "doc", "Doc Title", "go,perf", "", "/fake/a/doc.md", "1700000000", 100, "md", "content",
	)
	if err != nil {
		tx.Rollback()
		t.Fatal(err)
	}
	if err := batchInsertTagsPaths(tx, "repoA", []string{"a/doc.md"}); err != nil {
		tx.Rollback()
		t.Fatal(err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatal(err)
	}

	var count int
	db.QueryRow("SELECT COUNT(*) FROM spec_tags WHERE tag='go'").Scan(&count)
	if count != 1 {
		t.Fatalf("expected tag 'go', got count %d", count)
	}
	db.QueryRow("SELECT COUNT(*) FROM spec_tags WHERE tag='perf'").Scan(&count)
	if count != 1 {
		t.Fatalf("expected tag 'perf', got count %d", count)
	}
}
```

- [ ] **Step 2: Run to confirm it passes with current code**

```
cd local-doc-tool/code && go test ./db/... -run TestBatchInsertTagsPathsRoundtrip -v
```

Expected: PASS.

- [ ] **Step 3: Fix `batchInsertTagsPaths` to close cursor before writing**

Replace `batchInsertTagsPaths` in `local-doc-tool/code/db/index.go` (lines 503–543) with:

```go
// batchInsertTagsPaths inserts spec_tags rows for a specific set of paths within a repo.
// Paths are chunked to stay within SQLite's variable limit.
// The read cursor is fully drained and closed before any write statements execute,
// avoiding the read-cursor-open-during-write hazard on a single connection.
func batchInsertTagsPaths(tx *sql.Tx, repoName string, paths []string) error {
	stmt, err := tx.Prepare("INSERT INTO spec_tags (spec_id,tag) VALUES (?,?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	return chunkPaths(paths, func(chunk []string) error {
		placeholders := strings.Repeat("?,", len(chunk))
		placeholders = placeholders[:len(placeholders)-1]
		args := make([]any, 0, len(chunk)+1)
		args = append(args, repoName)
		for _, p := range chunk {
			args = append(args, p)
		}
		rows, err := tx.Query(
			"SELECT id, tags FROM specs WHERE repo=? AND tags != '' AND path IN ("+placeholders+")",
			args...,
		)
		if err != nil {
			return err
		}

		// Materialize before closing cursor.
		type row struct {
			id   int64
			tags string
		}
		var pending []row
		for rows.Next() {
			var r row
			if err := rows.Scan(&r.id, &r.tags); err != nil {
				rows.Close()
				return err
			}
			pending = append(pending, r)
		}
		rows.Close()
		if err := rows.Err(); err != nil {
			return err
		}

		// Now write with no open read cursor.
		for _, r := range pending {
			for _, tag := range splitTags(r.tags) {
				if _, err := stmt.Exec(r.id, tag); err != nil {
					return err
				}
			}
		}
		return nil
	})
}
```

- [ ] **Step 4: Run all tests**

```
cd local-doc-tool/code && go test ./db/... -v
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
cd local-doc-tool/code
git add db/index.go db/index_test.go
git commit -m "fix(db): close read cursor before writes in batchInsertTagsPaths"
```

---

### Task 6: Fix `Stats` and `RefreshStats` — reduce subquery count

**Files:**
- Modify: `local-doc-tool/code/db/query.go:479-515`

Both `Stats` (fallback path) and `RefreshStats` run 5–6 correlated subqueries. Replace with `WITH` CTEs so SQLite materializes each aggregate once.

- [ ] **Step 1: Add a test for Stats**

Add to `local-doc-tool/code/db/index_test.go`:

```go
func TestStatsReturnsCorrectCounts(t *testing.T) {
	db := openTestDB(t)
	insertSpec(t, db, "repoA", "a/one.md", "one")
	insertSpec(t, db, "repoA", "a/two.md", "two")
	insertSpec(t, db, "repoB", "b/three.md", "three")

	// Register repos so Stats counts them.
	db.Exec("INSERT OR IGNORE INTO repos (name,path) VALUES ('repoA','/a'),('repoB','/b')")

	s, err := Stats(db)
	if err != nil {
		t.Fatalf("Stats error: %v", err)
	}
	if s.TotalSpecs != 3 {
		t.Fatalf("expected 3 specs, got %d", s.TotalSpecs)
	}
	if s.Repos != 2 {
		t.Fatalf("expected 2 repos, got %d", s.Repos)
	}
}
```

- [ ] **Step 2: Run to confirm PASS with current code**

```
cd local-doc-tool/code && go test ./db/... -run TestStatsReturnsCorrectCounts -v
```

Expected: PASS.

- [ ] **Step 3: Replace the fallback query in `Stats`**

In `local-doc-tool/code/db/query.go`, replace the live-fallback block (lines 479–488):

Old:
```go
	// Cache miss: compute live (first run before any scan completes).
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
```

New:
```go
	// Cache miss: compute live (first run before any scan completes).
	// CTEs let SQLite materialise each aggregate once instead of as correlated subqueries.
	err := db.QueryRow(`
		WITH
		  r  AS (SELECT COUNT(*) n FROM repos),
		  sp AS (SELECT COUNT(*) n, COUNT(DISTINCT project) p, COALESCE(SUM(size),0) b FROM specs),
		  tg AS (SELECT COUNT(DISTINCT tag) n FROM spec_tags),
		  ls AS (SELECT COALESCE(value,'never') v FROM meta WHERE key='last_scan')
		SELECT r.n, sp.n, sp.p, tg.n, sp.b, ls.v
		FROM r, sp, tg, ls
	`).Scan(&s.Repos, &s.TotalSpecs, &s.Projects, &s.UniqueTags, &s.TotalBytes, &s.LastScan)
	return s, err
```

- [ ] **Step 4: Replace the query in `RefreshStats`**

In `local-doc-tool/code/db/query.go`, replace the query in `RefreshStats` (lines 496–503):

Old:
```go
	err := db.QueryRow(`
		SELECT
		  (SELECT COUNT(*) FROM repos),
		  (SELECT COUNT(*) FROM specs),
		  (SELECT COUNT(DISTINCT project) FROM specs),
		  (SELECT COUNT(DISTINCT tag) FROM spec_tags),
		  (SELECT COALESCE(SUM(size),0) FROM specs)
	`).Scan(&repos, &specs, &projects, &tags, &bytes)
```

New:
```go
	err := db.QueryRow(`
		WITH
		  r  AS (SELECT COUNT(*) n FROM repos),
		  sp AS (SELECT COUNT(*) n, COUNT(DISTINCT project) p, COALESCE(SUM(size),0) b FROM specs),
		  tg AS (SELECT COUNT(DISTINCT tag) n FROM spec_tags)
		SELECT r.n, sp.n, sp.p, tg.n, sp.b
		FROM r, sp, tg
	`).Scan(&repos, &specs, &projects, &tags, &bytes)
```

- [ ] **Step 5: Run all tests**

```
cd local-doc-tool/code && go test ./db/... -v
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
cd local-doc-tool/code
git add db/query.go db/index_test.go
git commit -m "perf(db): replace correlated subqueries with CTEs in Stats and RefreshStats"
```

---

### Task 7: Fix `modified` column type and add missing indexes

**Files:**
- Modify: `local-doc-tool/code/db/schema.go`

Three changes:
1. Change `modified TEXT` to `modified INTEGER` so `ORDER BY modified DESC` is a numeric sort and can use a B-tree index efficiently.
2. Add `CREATE INDEX IF NOT EXISTS idx_specs_modified ON specs(modified DESC)` for `Recent`.
3. Add `CREATE INDEX IF NOT EXISTS idx_specs_repo_project ON specs(repo, project)` for `Projects` and `List`.

The `modified` column stores unix timestamps as strings via `strconv.FormatInt(..., 10)` in `extract.go`. The value is already a decimal integer string — changing the column to `INTEGER` means SQLite will store it as an integer (SQLite's type affinity rules accept a well-formed integer string for an INTEGER column). No change to `extract.go` is needed: `formatMtime` returns a string, SQLite coerces it on insert.

- [ ] **Step 1: Add a migration test**

Add to `local-doc-tool/code/db/index_test.go`:

```go
func TestSchemaHasModifiedIndex(t *testing.T) {
	db := openTestDB(t)
	// If the index exists, this query will succeed.
	var name string
	err := db.QueryRow(
		"SELECT name FROM sqlite_master WHERE type='index' AND name='idx_specs_modified'",
	).Scan(&name)
	if err != nil {
		t.Fatalf("idx_specs_modified index missing: %v", err)
	}
}

func TestSchemaHasRepoProjectIndex(t *testing.T) {
	db := openTestDB(t)
	var name string
	err := db.QueryRow(
		"SELECT name FROM sqlite_master WHERE type='index' AND name='idx_specs_repo_project'",
	).Scan(&name)
	if err != nil {
		t.Fatalf("idx_specs_repo_project index missing: %v", err)
	}
}
```

- [ ] **Step 2: Run to confirm FAIL**

```
cd local-doc-tool/code && go test ./db/... -run "TestSchemaHasModifiedIndex|TestSchemaHasRepoProjectIndex" -v
```

Expected: both FAIL — indexes don't exist yet.

- [ ] **Step 3: Update `schemaSQL` in `schema.go`**

In `local-doc-tool/code/db/schema.go`, make three edits:

**a.** Change `modified TEXT NOT NULL` to `modified INTEGER NOT NULL` in the `specs` table definition.

**b.** Add the two new indexes after the existing index declarations (after line 55 `CREATE INDEX IF NOT EXISTS idx_tags_lower`):

```sql
CREATE INDEX IF NOT EXISTS idx_specs_modified ON specs(modified DESC);
CREATE INDEX IF NOT EXISTS idx_specs_repo_project ON specs(repo, project);
```

The updated `schemaSQL` specs table block should look like:

```sql
CREATE TABLE IF NOT EXISTS specs (
  id        INTEGER PRIMARY KEY,
  repo      TEXT NOT NULL,
  path      TEXT NOT NULL,
  project   TEXT NOT NULL,
  name      TEXT NOT NULL,
  title     TEXT NOT NULL,
  tags      TEXT DEFAULT '',
  summary   TEXT DEFAULT '',
  fullpath  TEXT NOT NULL,
  modified  INTEGER NOT NULL,
  size      INTEGER NOT NULL,
  ext       TEXT NOT NULL,
  content   TEXT DEFAULT '',
  UNIQUE(repo, path)
);
```

And the full index block becomes:

```sql
CREATE INDEX IF NOT EXISTS idx_tags ON spec_tags(tag);
CREATE INDEX IF NOT EXISTS idx_spec_tags_spec_id ON spec_tags(spec_id);
CREATE INDEX IF NOT EXISTS idx_specs_name_lower ON specs(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_tags_lower ON spec_tags(LOWER(tag));
CREATE INDEX IF NOT EXISTS idx_specs_modified ON specs(modified DESC);
CREATE INDEX IF NOT EXISTS idx_specs_repo_project ON specs(repo, project);
```

- [ ] **Step 4: Run tests**

```
cd local-doc-tool/code && go test ./db/... -v
```

Expected: all PASS (the `CREATE INDEX IF NOT EXISTS` statements are idempotent for new databases; existing databases need a migration — see note below).

> **Note for existing databases:** The schema uses `IF NOT EXISTS` so new DBs get the indexes automatically. Existing DBs will not get the new indexes until the DB file is deleted and rebuilt with `local-search rebuild`. For production use, add an explicit migration step in `Open()` that runs `CREATE INDEX IF NOT EXISTS idx_specs_modified ON specs(modified DESC)` and the repo_project equivalent after the schema creation call. That is out of scope for this plan since the tool currently has no migration framework.

- [ ] **Step 5: Commit**

```bash
cd local-doc-tool/code
git add db/schema.go db/index_test.go
git commit -m "perf(db): change modified to INTEGER, add idx_specs_modified and idx_specs_repo_project"
```

---

### Task 8: Apply new indexes to existing databases via Open()

**Files:**
- Modify: `local-doc-tool/code/db/schema.go`

Since there is no migration framework, the simplest safe approach is to run the two new `CREATE INDEX IF NOT EXISTS` statements unconditionally in `Open()` after the existing pragma loop. This is idempotent and takes negligible time on an empty or small DB.

- [ ] **Step 1: Add a test that verifies Open() creates indexes on an existing DB without schema recreation**

Add to `local-doc-tool/code/db/index_test.go`:

```go
func TestOpenCreatesIndexesOnExistingDB(t *testing.T) {
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "existing.db")

	// First open — creates schema.
	db1, err := Open(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	if err := CreateSchema(db1); err != nil {
		t.Fatal(err)
	}
	db1.Close()

	// Second open — simulates an existing DB.
	db2, err := Open(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer db2.Close()
	if err := CreateSchema(db2); err != nil {
		t.Fatal(err)
	}

	var name string
	if err := db2.QueryRow(
		"SELECT name FROM sqlite_master WHERE type='index' AND name='idx_specs_modified'",
	).Scan(&name); err != nil {
		t.Fatalf("idx_specs_modified missing after re-open: %v", err)
	}
}
```

- [ ] **Step 2: Run to confirm it passes (it should — CreateSchema is idempotent)**

```
cd local-doc-tool/code && go test ./db/... -run TestOpenCreatesIndexesOnExistingDB -v
```

Expected: PASS.

- [ ] **Step 3: No additional code change needed**

The `CREATE INDEX IF NOT EXISTS` statements added in Task 7 are part of `schemaSQL` and are executed by `CreateSchema`. Since `main.go` calls `CreateSchema` on every startup (verify this), the indexes will be created on existing databases without any extra migration code.

Verify `main.go` calls `CreateSchema`:

```
grep -n "CreateSchema" local-doc-tool/code/main.go
```

If `CreateSchema` is NOT called on every startup, add the two index creation statements to `Open()` in `schema.go` directly after the pragma loop:

```go
	for _, idx := range []string{
		"CREATE INDEX IF NOT EXISTS idx_specs_modified ON specs(modified DESC)",
		"CREATE INDEX IF NOT EXISTS idx_specs_repo_project ON specs(repo, project)",
	} {
		if _, err := db.Exec(idx); err != nil {
			db.Close()
			return nil, err
		}
	}
```

- [ ] **Step 4: Run all tests**

```
cd local-doc-tool/code && go test ./... -v
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
cd local-doc-tool/code
git add db/schema.go db/index_test.go
git commit -m "perf(db): ensure new indexes are applied to existing databases on startup"
```

---

### Task 9: Final build verification

- [ ] **Step 1: Build the binary**

```
cd local-doc-tool/code && go build -o /tmp/local-search-test ./...
```

Expected: exits 0, binary produced.

- [ ] **Step 2: Run the full test suite**

```
cd local-doc-tool/code && go test ./... -v -count=1
```

Expected: all PASS, no race conditions.

- [ ] **Step 3: Run with race detector**

```
cd local-doc-tool/code && go test -race ./... -count=1
```

Expected: PASS, no data races reported.

- [ ] **Step 4: Final commit**

```bash
cd local-doc-tool/code
git add -A
git commit -m "chore: final build verification — all perf fixes applied and tested"
```

---

## Summary of Changes

| # | Issue | Fix | Files |
|---|-------|-----|-------|
| 1 | `extractSummary` rune alloc on every file | Use `utf8.RuneCountInString`; allocate rune slice only when truncating | `extract/extract.go` |
| 2 | Double `os.ReadDir` per directory in `walkItems` | Replace `filepath.WalkDir` with manual recursive `walkDir` using one `os.ReadDir` per dir | `db/index.go` |
| 3 | `deleteRepoEntries` materializes all rows into RAM | Bulk FTS delete via single `INSERT ... SELECT 'delete' ...` | `db/index.go` |
| 4 | `deleteSpecEntry`: 4 SQL statements per file | New `deleteSpecEntries` batches all paths into 3 SQL statements per chunk | `db/index.go` |
| 5 | Read cursor open during writes in `batchInsertTagsPaths` | Materialize rows, close cursor, then write | `db/index.go` |
| 6 | `Stats`/`RefreshStats`: 5–6 correlated subqueries | Replace with `WITH` CTEs | `db/query.go` |
| 7 | `modified` stored as TEXT, no index for `Recent`/`Projects` | Change to `INTEGER`, add `idx_specs_modified` and `idx_specs_repo_project` | `db/schema.go` |
| 8 | New indexes not applied to existing databases | Verified `CreateSchema` is idempotent; fallback in `Open()` if needed | `db/schema.go` |
