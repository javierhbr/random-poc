package main

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"

	localdb "local-search/db"
)

// setupScanEnv points the package-level appDir/reposFile/dbFile at a temp dir so
// cmdScan operates in isolation. Restored on cleanup. Not parallel-safe (mutates
// package globals), so these tests must not call t.Parallel().
func setupScanEnv(t *testing.T) {
	t.Helper()
	dir := t.TempDir()
	oldApp, oldRepos, oldDB := appDir, reposFile, dbFile
	appDir = dir
	reposFile = filepath.Join(dir, "repos")
	dbFile = filepath.Join(dir, "specs.db")
	t.Cleanup(func() {
		appDir, reposFile, dbFile = oldApp, oldRepos, oldDB
	})
}

// makeScanRepo creates a non-git repo dir with a single indexable spec file.
func makeScanRepo(t *testing.T, name string) repoEntry {
	t.Helper()
	dir := t.TempDir()
	writeSpec(t, filepath.Join(dir, name+".md"), "# "+name+"\n\nspec for "+name+"\n")
	return repoEntry{Name: name, Path: dir}
}

func countSpecs(t *testing.T, db *sql.DB, repo string) int {
	t.Helper()
	var n int
	if err := db.QueryRow("SELECT COUNT(*) FROM specs WHERE repo = ?", repo).Scan(&n); err != nil {
		t.Fatalf("count specs for %q: %v", repo, err)
	}
	return n
}

// R-2.3: with A/B/C registered, a surgical `scan A` leaves B and C rows still
// queryable — no intervening `scan all`. (The pre-overhaul body os.Remove'd the
// DB and full-scanned only A, which would drop B and C; this asserts against it.)
func TestCmdScan_Surgical_PreservesOtherRepos(t *testing.T) {
	setupScanEnv(t)
	a, b, c := makeScanRepo(t, "a"), makeScanRepo(t, "b"), makeScanRepo(t, "c")
	saveRepos([]repoEntry{a, b, c})

	cmdScan([]string{"all"}) // populate all three
	cmdScan([]string{"a"})   // surgical rescan of A only

	db, err := localdb.Open(dbFile)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	defer db.Close()
	for _, name := range []string{"a", "b", "c"} {
		if countSpecs(t, db, name) == 0 {
			t.Fatalf("repo %q has no rows after a surgical scan of a", name)
		}
	}
}

// R-2.2: a surgical scan must not delete the DB file. os.SameFile proves the
// underlying file identity (dev+inode) is unchanged — i.e. not removed+recreated.
func TestCmdScan_Surgical_DoesNotDeleteDBFile(t *testing.T) {
	setupScanEnv(t)
	a, b := makeScanRepo(t, "a"), makeScanRepo(t, "b")
	saveRepos([]repoEntry{a, b})

	cmdScan([]string{"all"}) // create the DB
	before, err := os.Stat(dbFile)
	if err != nil {
		t.Fatalf("stat db before surgical scan: %v", err)
	}

	cmdScan([]string{"a"}) // surgical

	after, err := os.Stat(dbFile)
	if err != nil {
		t.Fatalf("db file missing after surgical scan: %v", err)
	}
	if !os.SameFile(before, after) {
		t.Fatalf("surgical scan replaced the DB file (identity changed)")
	}
}

// R-2.4: a fresh (no DB file) surgical scan creates the schema and indexes ONLY
// the target repo — it must not fan out to the other registered repos.
func TestCmdScan_Surgical_FreshDBIndexesOnlyTarget(t *testing.T) {
	setupScanEnv(t)
	a, b := makeScanRepo(t, "a"), makeScanRepo(t, "b")
	saveRepos([]repoEntry{a, b})

	if _, err := os.Stat(dbFile); !os.IsNotExist(err) {
		t.Fatalf("expected no DB file before the fresh surgical scan")
	}

	cmdScan([]string{"a"}) // bootstrap schema + index only A

	db, err := localdb.Open(dbFile)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	defer db.Close()
	if countSpecs(t, db, "a") == 0 {
		t.Fatalf("target repo a was not indexed on a fresh surgical scan")
	}
	if n := countSpecs(t, db, "b"); n != 0 {
		t.Fatalf("non-target repo b was indexed on a fresh surgical scan (fan-out): %d rows", n)
	}
}

// R-2.6: `scan all` deletes the DB file and rebuilds from scratch. Proven
// deterministically: a repo indexed then deregistered is purged only if the DB
// was deleted and re-indexed from the (now shorter) repos file.
func TestCmdScan_All_RebuildsFromScratch(t *testing.T) {
	setupScanEnv(t)
	a, b := makeScanRepo(t, "a"), makeScanRepo(t, "b")
	saveRepos([]repoEntry{a, b})
	cmdScan([]string{"all"}) // DB has a and b

	saveRepos([]repoEntry{a}) // deregister b
	cmdScan([]string{"all"})  // full rebuild from the (a-only) repos file

	db, err := localdb.Open(dbFile)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	defer db.Close()
	if countSpecs(t, db, "a") == 0 {
		t.Fatalf("repo a missing after scan all")
	}
	if n := countSpecs(t, db, "b"); n != 0 {
		t.Fatalf("scan all did not purge deregistered repo b: %d rows", n)
	}
}
