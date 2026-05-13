package db

import (
	"database/sql"
	"path/filepath"
	"testing"

	_ "modernc.org/sqlite"
)

// preGraphifySchema is the bare repos/external_graphs schema as it existed
// before the graphify integration shipped — no graph_* columns, no kind.
// Used by TestCreateSchema_UpgradesPreGraphifyDB to prove that the additive
// migration catches an old database up to the current schema in one open.
const preGraphifySchema = `
CREATE TABLE IF NOT EXISTS repos (
  id   INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  path TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS external_graphs (
  name       TEXT PRIMARY KEY,
  graph_path TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS specs (
  id INTEGER PRIMARY KEY, repo TEXT NOT NULL, path TEXT NOT NULL,
  project TEXT NOT NULL, name TEXT NOT NULL, title TEXT NOT NULL,
  tags TEXT DEFAULT '', summary TEXT DEFAULT '', fullpath TEXT NOT NULL,
  modified TEXT NOT NULL, size INTEGER NOT NULL, ext TEXT NOT NULL,
  content TEXT DEFAULT '', UNIQUE(repo, path));
CREATE VIRTUAL TABLE IF NOT EXISTS specs_fts USING fts5(repo,name,title,tags,summary,content,content='',tokenize='porter unicode61');
CREATE TABLE IF NOT EXISTS spec_tags (spec_id INTEGER NOT NULL, tag TEXT NOT NULL, FOREIGN KEY(spec_id) REFERENCES specs(id));
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
`

// TestCreateSchema_UpgradesPreGraphifyDB regression-tests the bug a user hit
// when their pre-graphify specs.db was opened by the new binary:
//
//   Error: SQL logic error: no such column: r.graph_path
//
// CreateSchema must add every missing column via additive ALTER TABLE so
// queries that reference graph_path / graph_mtime / code_graph_* succeed
// without the user having to delete and rebuild their index.
func TestCreateSchema_UpgradesPreGraphifyDB(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "specs.db")

	// Phase 1: build a pre-graphify DB with only the original columns.
	older, err := sql.Open("sqlite", "file:"+path)
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	if _, err := older.Exec(preGraphifySchema); err != nil {
		older.Close()
		t.Fatalf("seed pre-graphify schema: %v", err)
	}
	older.Close()

	// Phase 2: open with the current code, which should run migrations.
	db, err := Open(path)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer db.Close()
	if err := CreateSchema(db); err != nil {
		t.Fatalf("CreateSchema (migration): %v", err)
	}

	// Phase 3: every column the new code queries must now exist.
	wantOnRepos := []string{
		"graph_path", "graph_mtime", "graph_node_count", "graph_last_seen",
		"code_graph_path", "code_graph_mtime", "code_graph_node_count",
	}
	for _, col := range wantOnRepos {
		has, err := hasColumn(db, "repos", col)
		if err != nil {
			t.Fatalf("hasColumn repos.%s: %v", col, err)
		}
		if !has {
			t.Errorf("after migration, repos.%s should exist", col)
		}
	}
	wantOnExternal := []string{"graph_mtime", "node_count", "added_at", "kind"}
	for _, col := range wantOnExternal {
		has, err := hasColumn(db, "external_graphs", col)
		if err != nil {
			t.Fatalf("hasColumn external_graphs.%s: %v", col, err)
		}
		if !has {
			t.Errorf("after migration, external_graphs.%s should exist", col)
		}
	}

	// Phase 4: the exact query that triggered the user's bug must succeed.
	if _, err := Repos(db); err != nil {
		t.Fatalf("Repos() after migration: %v", err)
	}
	if _, err := ExternalGraphs(db); err != nil {
		t.Fatalf("ExternalGraphs() after migration: %v", err)
	}
}

// TestCreateSchema_IsIdempotent ensures running migrations twice on an
// already-current DB is a no-op and never errors.
func TestCreateSchema_IsIdempotent(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "specs.db")

	db, err := Open(path)
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer db.Close()
	if err := CreateSchema(db); err != nil {
		t.Fatalf("CreateSchema #1: %v", err)
	}
	if err := CreateSchema(db); err != nil {
		t.Fatalf("CreateSchema #2: %v", err)
	}
	if err := CreateSchema(db); err != nil {
		t.Fatalf("CreateSchema #3: %v", err)
	}
}
