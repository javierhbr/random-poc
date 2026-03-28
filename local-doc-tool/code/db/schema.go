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
  id    INTEGER PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,
  path  TEXT UNIQUE NOT NULL
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

// CreateSchema initialises all tables and indexes if they do not exist yet.
func CreateSchema(db *sql.DB) error {
	_, err := db.Exec(schemaSQL)
	return err
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
