// Package db manages the SQLite database: schema, connection, and pragmas.
package db

import (
	"database/sql"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite" // register sqlite3 driver
)

const schemaSQL = `
CREATE TABLE IF NOT EXISTS repos (
  id                    INTEGER PRIMARY KEY,
  name                  TEXT UNIQUE NOT NULL,
  path                  TEXT UNIQUE NOT NULL,
  graph_path            TEXT,
  graph_mtime           INTEGER,
  graph_node_count      INTEGER,
  graph_last_seen       INTEGER,
  code_graph_path       TEXT,
  code_graph_mtime      INTEGER,
  code_graph_node_count INTEGER
);

CREATE TABLE IF NOT EXISTS external_graphs (
  name        TEXT PRIMARY KEY,
  graph_path  TEXT NOT NULL,
  graph_mtime INTEGER,
  node_count  INTEGER,
  added_at    INTEGER,
  kind        TEXT NOT NULL DEFAULT 'graphify'
);

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
  modified  TEXT NOT NULL,
  size      INTEGER NOT NULL,
  ext       TEXT NOT NULL,
  content   TEXT DEFAULT '',
  UNIQUE(repo, path)
);

CREATE VIRTUAL TABLE IF NOT EXISTS specs_fts USING fts5(
  repo,
  name,
  title,
  tags,
  summary,
  content,
  content='',
  tokenize='porter unicode61'
);

CREATE TABLE IF NOT EXISTS spec_tags (
  spec_id INTEGER NOT NULL,
  tag     TEXT NOT NULL,
  FOREIGN KEY (spec_id) REFERENCES specs(id)
);
CREATE INDEX IF NOT EXISTS idx_tags ON spec_tags(tag);
CREATE INDEX IF NOT EXISTS idx_spec_tags_spec_id ON spec_tags(spec_id);
CREATE INDEX IF NOT EXISTS idx_specs_name_lower ON specs(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_tags_lower ON spec_tags(LOWER(tag));

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);
`

// Open opens (or creates) the SQLite database at dbPath with performance pragmas set.
func Open(dbPath string) (*sql.DB, error) {
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	// Single writer connection — keeps WAL locking simple
	db.SetMaxOpenConns(1)

	for _, pragma := range []string{
		"PRAGMA journal_mode=WAL",
		"PRAGMA synchronous=NORMAL",
		"PRAGMA cache_size=-32000", // 32 MB page cache
		"PRAGMA foreign_keys=ON",
		// temp_store intentionally left as default (FILE) so SQLite can spill
		// large sort/index scratch work to disk rather than holding it in RAM.
	} {
		if _, err := db.Exec(pragma); err != nil {
			db.Close()
			return nil, err
		}
	}

	return db, nil
}

// CreateSchema initialises all tables and indexes if they do not exist yet,
// and runs additive ALTER TABLE migrations to upgrade older databases that
// were created before code-review-graph integration columns existed.
func CreateSchema(db *sql.DB) error {
	if _, err := db.Exec(schemaSQL); err != nil {
		return err
	}
	return runMigrations(db)
}

// runMigrations applies additive column migrations idempotently. Each ALTER
// TABLE is wrapped in a column-existence check so re-running is safe.
func runMigrations(db *sql.DB) error {
	for _, m := range migrations {
		has, err := hasColumn(db, m.table, m.column)
		if err != nil {
			return err
		}
		if has {
			continue
		}
		if _, err := db.Exec(m.sql); err != nil {
			return err
		}
	}
	return nil
}

type columnMigration struct {
	table  string
	column string
	sql    string
}

// migrations is intentionally ordered by historical introduction: graphify
// columns were added before code-review-graph columns. Each entry is gated by
// hasColumn(), so re-running on an up-to-date DB is a no-op. DBs that pre-date
// any of these columns (older releases of local-search) get caught up here.
var migrations = []columnMigration{
	// Graphify integration (older release).
	{"repos", "graph_path", `ALTER TABLE repos ADD COLUMN graph_path TEXT`},
	{"repos", "graph_mtime", `ALTER TABLE repos ADD COLUMN graph_mtime INTEGER`},
	{"repos", "graph_node_count", `ALTER TABLE repos ADD COLUMN graph_node_count INTEGER`},
	{"repos", "graph_last_seen", `ALTER TABLE repos ADD COLUMN graph_last_seen INTEGER`},
	// External graphs (graphify standalone).
	{"external_graphs", "graph_mtime", `ALTER TABLE external_graphs ADD COLUMN graph_mtime INTEGER`},
	{"external_graphs", "node_count", `ALTER TABLE external_graphs ADD COLUMN node_count INTEGER`},
	{"external_graphs", "added_at", `ALTER TABLE external_graphs ADD COLUMN added_at INTEGER`},
	// Code-review-graph integration (this release).
	{"repos", "code_graph_path", `ALTER TABLE repos ADD COLUMN code_graph_path TEXT`},
	{"repos", "code_graph_mtime", `ALTER TABLE repos ADD COLUMN code_graph_mtime INTEGER`},
	{"repos", "code_graph_node_count", `ALTER TABLE repos ADD COLUMN code_graph_node_count INTEGER`},
	{"external_graphs", "kind", `ALTER TABLE external_graphs ADD COLUMN kind TEXT NOT NULL DEFAULT 'graphify'`},
}

// hasColumn reports whether the given column exists on the given table.
// Returns (false, nil) when the table itself does not yet exist (CREATE
// TABLE IF NOT EXISTS in schemaSQL will have created it before this runs).
func hasColumn(db *sql.DB, table, column string) (bool, error) {
	rows, err := db.Query("PRAGMA table_info(" + table + ")")
	if err != nil {
		return false, err
	}
	defer rows.Close()
	for rows.Next() {
		var (
			cid          int
			name         string
			ctype        string
			notnull      int
			dfltValue    sql.NullString
			pk           int
		)
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dfltValue, &pk); err != nil {
			return false, err
		}
		if name == column {
			return true, nil
		}
	}
	return false, rows.Err()
}

// GetMeta retrieves a value from the meta table. Returns "" if the key is absent.
func GetMeta(db *sql.DB, key string) string {
	var val string
	db.QueryRow("SELECT value FROM meta WHERE key=?", key).Scan(&val) //nolint:errcheck
	return val
}

// SetMeta stores a key/value pair in the meta table.
func SetMeta(db *sql.DB, key, value string) error {
	_, err := db.Exec("INSERT OR REPLACE INTO meta (key,value) VALUES (?,?)", key, value)
	return err
}
