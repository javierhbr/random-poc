# local-search (Go)

A fast, offline spec registry with full-text search across multiple repos. Single Go binary, no runtime dependencies beyond the binary itself.

This is a full rewrite of `local-search.sh` in Go, addressing the core performance bottlenecks in the original bash script (N+1 sqlite3 subprocess spawns, no transactions, sequential file I/O).

## Why Go

The bash script launched a new `sqlite3` process for every SQL statement — ~20ms per spawn, 500+ spawns for a typical repo scan. The Go binary eliminates this entirely:

| Bottleneck | Bash | Go |
|---|---|---|
| SQLite calls | 1 subprocess per statement | In-process `database/sql` |
| Transactions | None (auto-commit per stmt) | Single transaction per scan |
| Batch inserts | Loop of individual INSERTs | Prepared stmt + `executemany` |
| File I/O | `stat` + `readfile()` subprocesses | `os.Stat` + `os.ReadFile` in-process |
| File walking | `find` subprocess | `filepath.WalkDir` |
| Parallelism | Sequential | 4-worker goroutine pool for file reads |
| Startup | ~20ms (bash) | ~5ms (compiled binary) |

**Result:** full scan runs in ~30ms for typical repos.

## Install

```bash
# Build
cd local-doc-tool/code
go build -o local-search .

# Install globally (optional)
cp local-search /usr/local/bin/local-search
```

**Requirements:** Go 1.21+ to build. No runtime dependencies — SQLite is compiled in via `modernc.org/sqlite` (pure Go, no CGO, no C toolchain needed).

## Quick start

```bash
# 1. Register your spec folders (auto-scans immediately)
local-search repo add ./product-specs product
local-search repo add ./platform-docs platform
local-search repo add ./docs docs --skip-directory .skills

# 2. Search — no manual scan needed, auto-detects changes
local-search search refund
```

The index auto-rebuilds when you add/remove repos and auto-detects file changes on git repos at query time.

## Commands

### Repo management

```bash
local-search repo add <folder> [name] [--skip-directory <folder-name>]   # Register a spec repo (auto-scans)
  # Example: local-search repo add /path/to/specs product
  # Example: local-search repo add ./docs docs --skip-directory .skills
  # Example: local-search repo add ~/code backend --skip-directory vendor --skip-directory .git
local-search repo remove <name>                                          # Unregister a repo (auto-rebuilds)
  # Example: local-search repo remove product
local-search repo list                                                   # Show all registered repos
```

### Scanning

```bash
local-search scan                       # Full rebuild of all repos
local-search scan <repo-name>           # Full rebuild of one repo
  # Example: local-search scan platform
```

### Searching

```bash
local-search search <query>             # Search all repos
  # Example: local-search search "payment refund"
local-search search <query> --repo <name>   # Search one repo (named flag)
  # Example: local-search search "webhook" --repo platform
local-search search <query> <repo>          # Search one repo (positional, legacy)
  # Example: local-search search "API endpoints" platform
local-search search <query> --directory <path>   # Focus to paths starting with <path>
  # Example: local-search search "checkpoint" --directory reference/
local-search search <query> --exclude-location <pattern>   # Exclude paths containing pattern
  # Example: local-search search "refund" --exclude-location deprecated/
local-search read <name>                                   # Print full spec content
  # Example: local-search read refund-flow
local-search read <name> <repo>                            # From a specific repo
  # Example: local-search read webhook-retry platform
local-search read <name> <repo> --directory <path>         # By repo and directory
  # Example: local-search read config backend --directory src/
local-search related <name>             # Find related specs by tags/title
  # Example: local-search related refund-flow
```

### Browsing

```bash
local-search list                       # All specs, grouped by repo
local-search list <repo-or-project>     # Filter by repo or project
  # Example: local-search list platform
local-search projects                   # All projects with spec counts
local-search tags                       # All tags with usage counts
local-search tags <tag>                 # Specs with a specific tag
  # Example: local-search tags billing
local-search recent [n]                 # Recently modified (default 10)
  # Example: local-search recent 20
```

### Maintenance

```bash
local-search stats                      # Index statistics
local-search db                         # Print database file path
local-search inspect                    # Dump full index contents
local-search reset                      # Delete everything and start over
local-search help                       # Full help text
```

### JSON output (for agent pipelines)

```bash
local-search json search <query> [repo]       # Search with optional repo
  # Example: local-search json search "payment" platform
local-search json read <name> [repo]          # Read with optional repo
  # Example: local-search json read refund-flow
local-search json list [repo-or-project]      # List by repo or project
local-search json repos                        # All registered repos
local-search json related <name>               # Related specs
local-search json tags                         # All tags
local-search json stats                        # Index statistics
```

### Command aliases

| Alias | Command |
|---|---|
| `s`, `find`, `f` | `search` |
| `r`, `get`, `show` | `read` |
| `ls` | `list` |
| `p` | `projects` |
| `rel` | `related` |
| `t` | `tags` |
| `j` | `json` |

## Search syntax

Uses SQLite FTS5 with Porter stemming — the same engine as the bash version.

```bash
local-search search refund                                   # keyword
local-search search "refund OR chargeback"                   # boolean OR
local-search search "billing NOT fraud"                      # exclude
local-search search refunding                                # stemming: matches "refund"
local-search search "payment*"                               # prefix
local-search search "refund eligibility"                     # phrase
local-search search "payment" --repo platform                # filter to one repo
local-search search "webhook" --directory billing/           # focus to directory
local-search search "event" --repo backend --directory integrations/  # combine repo and directory
local-search search "What Triggers a Checkpoint" --directory reference/  # multi-word search
```

## Supported file types

**Indexed directly** (content fully searchable):
- `.md`, `.mdx`, `.txt`

**Binary/media** (require a companion `.md` sidecar with the same base name):
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.pdf`

Example: `architecture/diagram.png` is indexed using `architecture/diagram.md` as the content source.

## Spec format

Files are indexed with these fields:

| Field | Source |
|---|---|
| `name` | Filename without extension |
| `title` | First `# Heading` in the file |
| `tags` | YAML frontmatter `tags:` line (inline, comma-separated) |
| `summary` | First paragraph after frontmatter (max 300 chars) |
| `content` | Full file text (FTS-indexed) |
| `project` | First subdirectory name within the repo |

**Frontmatter example:**

```markdown
---
tags: billing, refund, customer, payments
---

# Refund flow

Customers may request a refund within 30 days of purchase...
```

## File locations

| Path | Contents |
|---|---|
| `~/.local-search/repos` | Registered repo list (`name\|path` per line) |
| `~/.local-search/specs.db` | SQLite database (disposable cache — source files are truth) |

The database can be deleted at any time and will be rebuilt on the next command.

## Database schema

Identical to the original bash tool — the two are fully interoperable.

```sql
repos(id, name, path)
specs(id, repo, path, project, name, title, tags, summary, fullpath, modified, size, ext, content)
specs_fts            -- contentless FTS5, porter unicode61 tokenizer
spec_tags(spec_id, tag)
meta(key, value)     -- stores git_commit_<repo> and last_scan
```

## Git-based change detection

For repos that are git repositories, the tool tracks the last-scanned commit hash in the `meta` table. On each query, it checks for:

- Committed changes since last scan (`git diff <last>..<current>`)
- Staged changes (`git diff --cached`)
- Unstaged changes (`git diff`)
- Untracked spec files (`git ls-files --others`)

Only changed files are re-indexed. For non-git repos, falls back to filesystem mtime comparison.

## Project structure

```
code/
├── go.mod                  # Module: local-search, requires modernc.org/sqlite
├── main.go                 # CLI dispatch + repo file management
├── extract/
│   └── extract.go          # Metadata parsing: title, tags, summary, content
│                           # Companion sidecar logic for media files
├── git/
│   └── git.go              # Git change detection and repo detection
└── db/
    ├── schema.go           # DDL, Open(), CreateSchema(), GetMeta(), SetMeta()
    ├── index.go            # FullScan(), IncrementalScan(), DeleteRepo()
    │                       # Worker pool for parallel file I/O
    └── query.go            # Search(), Read(), List(), Tags(), Stats(), etc.
```

## SQLite driver

Uses [`modernc.org/sqlite`](https://pkg.go.dev/modernc.org/sqlite) — a pure Go port of SQLite with no CGO requirement. FTS5 with Porter stemming is built in. Cross-compiles to any GOOS/GOARCH without a C toolchain.

Performance pragmas applied on every connection:

```sql
PRAGMA journal_mode=WAL
PRAGMA synchronous=NORMAL
PRAGMA temp_store=MEMORY
PRAGMA cache_size=-32000   -- 32 MB page cache
```
