---
date: 2026-07-20T00:00:00-05:00
git_commit: 3231af46f29cc1ef5e2f24acdb9b7c12377e7121
branch: feat/local-search-vector-search
repository: random-poc
topic: "How does the Local Search `scan` command work today, and what indexing state is tracked per repository?"
tags: [research, codebase, scan, git, incremental, repos, cwd-resolution]
status: complete
---

# Research: The `local-search scan` command as it exists today

**Date**: 2026-07-20
**Git Commit**: 3231af4
**Branch**: feat/local-search-vector-search

This document describes **what the code does today**. It contains no recommendations — where the request mentions a desired future behavior, this doc only states whether a supporting mechanism currently exists.

---

## TL;DR of current behavior

- `local-search scan` **with no argument scans every registered repository** and **rebuilds the entire database from scratch**. There is currently no single-repo default and no CWD resolution on the `scan` path. (`main.go:61-66`, `main.go:525-563`)
- `scan`, `rebuild`, and `index` are **aliases for the same function** `cmdScan`. (`main.go:61`)
- Scanning is **not purely manual** in practice: most read commands (`search`, `find`, etc.) call `ensureDB()`, which **auto-detects git changes and runs an incremental update on every registered git repo before serving the query**. (`main.go:575-633`)
- Per-repo state that IS tracked today: the **last-scanned git commit hash** (`meta` key `git_commit_<repo>`) and a **single global `last_scan` timestamp** (not per-repo). (`main.go:556`, `main.go:561`)
- Per-repo state that is **NOT** tracked today: date added, per-repo last-scan time, per-repo last-index-update time. The `repos` table and the `repos` config file have no such columns/fields. (`db/schema.go:20-24`, `main.go:2193-2197`)
- A CWD→repo matcher **already exists** (`scope.NearestRepoForCWD`) but is currently used only for scope/config resolution on search — **not** by `scan`. (`scope/scope.go:357-387`)
- No git-hook / push-detection / watcher infrastructure exists anywhere in the repo today.

---

## 1. Command routing

`main()` dispatches on `os.Args[1]` (`main.go:45-111`):

```go
case "scan", "rebuild", "index":
    target := "all"
    if len(args) > 0 {
        target = args[0]
    }
    cmdScan(target)
```
(`main.go:61-66`)

So:
- `local-search scan` → `cmdScan("all")`
- `local-search scan <name>` → `cmdScan("<name>")`
- `rebuild` and `index` are exact aliases.

`cmdScan` is also invoked internally after `repo add` (`main.go:172`) and after `repo remove` (`main.go:280`), always with `"all"`.

---

## 2. What `cmdScan` does (`main.go:525-563`)

```go
func cmdScan(target string) {
    repos := loadReposOrDie()
    os.Remove(dbFile)                 // (1) deletes the whole DB
    db := openDB()
    localdb.CreateSchema(db)          // (2) recreates schema
    for _, r := range repos {
        if target != "all" && r.Name != target {
            continue                  // (3) filter to one repo if named
        }
        n, _ := localdb.FullScan(db, r.Name, r.Path, r.SkipDirectories)
        if git.IsRepo(r.Path) {
            if commit := git.CurrentCommit(r.Path); commit != "" {
                localdb.SetMeta(db, "git_commit_"+r.Name, commit)
            }
        }
    }
    localdb.SetMeta(db, "last_scan", time.Now().UTC().Format(time.RFC3339))
}
```

Key facts:
1. **The whole SQLite file is deleted at the start** (`os.Remove(dbFile)`, `main.go:529`) — every `scan` is a full teardown + rebuild of the derived cache, even when a single repo is targeted. Targeting one repo still wipes the DB, so **`scan <one-repo>` currently drops the index of all other repos** (they are re-added only for the named repo; others are skipped by the `continue` at line 542, so their specs do not come back until a full `scan`).
2. There is **no CWD logic** in this path — target is either `"all"` or a literal name passed as the first arg.
3. After each repo's `FullScan`, if it's a git repo, the **current HEAD is stored** as `meta["git_commit_<name>"]`.
4. A **single global** `meta["last_scan"]` RFC3339 timestamp is written at the end (not one per repo).

`FullScan` (`db/index.go:33-185`) walks the repo tree with a bounded worker pool, extracts spec files (`*.md,*.mdx,*.txt` + media with companion `.md`), inserts into `specs`/`specs_fts`/`spec_tags`/`spec_vectors`, and upserts one `repos` row with graphify/code-review-graph metadata and a `graph_last_seen = now` value (`db/index.go:166-175`).

---

## 3. Repository registration & where repos are stored

Repos are stored in a **flat text file**, not primarily in the DB:

- File: `~/.local-search/repos` (`main.go:32`, `reposFile`)
- One line per repo, pipe-delimited: `name|path|skipdir1,skipdir2` (`main.go:2216-2225`)
- In-memory struct (`main.go:2193-2197`):
  ```go
  type repoEntry struct {
      Name            string
      Path            string
      SkipDirectories []string
  }
  ```

There is **no timestamp of any kind** in this struct or file format — no added-at, no last-scan, no last-updated.

`repo add` (`main.go:135-173`): resolves path to absolute, checks for duplicate by name OR path, appends the entry, saves, then **runs `cmdScan("all")`** (a full rebuild).

The DB also has a `repos` **table** (`db/schema.go:20-24`), but it is a *derived* cache populated by `FullScan`; it is dropped on every `scan` and on schema-version bumps (`db/schema.go:88-91`). Its columns:
```sql
repos(id, name, path,
      graph_path, graph_mtime, graph_node_count, graph_last_seen,
      code_graph_path, code_graph_mtime, code_graph_node_count)
```
Note: **no `added_at`, `last_scan`, `last_commit`, or `last_updated` columns.** The only time-like column is `graph_last_seen` (set to `now` at scan time) and `graph_mtime`/`code_graph_mtime` (mtimes of graph artifact files).

---

## 4. What indexing state IS tracked today (vs. what the request wants)

The user wants the repo list to show: date added, most-recent-scan time, last-index-update time, and (for git) latest commit hash included in the last scan. Current state of each:

| Requested field | Tracked today? | Where / why not |
|---|---|---|
| Date/time repo was **added** | ❌ No | `repoEntry` and `repos` file have no timestamp (`main.go:2193-2197`). `repos` table has no `added_at` (`db/schema.go:20-24`). (`external_graphs` DOES have `added_at` — `db/schema.go:28` — but that's for external graphs, not repos.) |
| Date/time of **most recent scan** | ⚠️ Partial | Only a **single global** `meta["last_scan"]` exists (`main.go:561`), not per-repo. |
| Date/time index **last updated** | ⚠️ Indirect | `IncrementalScan` updates `specs.modified_unix` per file and rewrites `meta["git_commit_<repo>"]`, but there is no explicit "index last updated" timestamp per repo. Closest proxy is `repos.graph_last_seen` (set during FullScan only). |
| **Latest commit hash** in last scan (git) | ✅ Yes | `meta["git_commit_<repo>"]` holds the HEAD hash as of the last scan/incremental update (`main.go:556`, `main.go:614`, `db/index.go:379`). |

The `specs` table records `modified` / `modified_unix` per file (`db/schema.go:41-42`), so per-file freshness exists, but there is no per-repo rollup surfaced.

---

## 5. Current `repo list` output (`main.go:283-292`)

```go
func repoList() {
    repos := loadRepos()
    for _, r := range repos {
        fmt.Printf("  %-20s  %s\n", r.Name, r.Path)   // name + path ONLY
    }
}
```

`repo list` reads the flat file and prints **only name and path**. It does not open the DB and shows no timestamps or commit hashes.

Separately, `graphs list` (`main.go:316-374`) and `stats` (`db/query.go:708-720`) do surface some timing:
- `graphs list` shows graph `AGE` derived from `graph_mtime`/`code_graph_mtime` via `humanAge` (`main.go:335`, `main.go:507-524`).
- `stats` prints the single global `last_scan` value (`db/query.go:654`, `db/query.go:714`).

Neither shows per-repo add/scan/commit info in the way the request describes.

---

## 6. "Manual" vs. automatic scanning — how changes get picked up today

The request assumes scan is a manual action. In the current code it is **partly automatic**:

- `ensureDB()` (`main.go:575-633`) is called by the read/query commands. It:
  1. If the DB file is missing → `cmdScan("all")`.
  2. For each repo in the file **not yet in the `repos` table** → `FullScan` that one repo (bootstrap).
  3. For each **known git repo** → read `meta["git_commit_<name>"]`, call `git.ChangedFiles(path, lastCommit)`, and if anything changed run `localdb.IncrementalScan(...)`, then store the new commit.
- `runIncrementalUpdates()` (`main.go:1624-1671`) is the same logic invoked from the scope-resolution path (`resolveScope`), so a search from within a repo transparently triggers an incremental update for changed files.

So today, **committed/staged/unstaged/untracked spec-file changes are auto-detected on the next query**, without the user running `scan`. `scan` itself is the explicit *full rebuild*.

---

## 7. Git change detection internals (`git/git.go`)

`ChangedFiles(dir, lastCommit)` (`git/git.go:41-94`) determines which spec files changed:
- `lastCommit == ""` (first scan): `git ls-files` for all tracked spec globs.
- `lastCommit != current HEAD`: `git diff --name-only <lastCommit> <current>` for committed changes.
- **Always** also unions: `git diff --name-only` (unstaged), `git diff --cached --name-only` (staged), and `git ls-files --others --exclude-standard` (untracked).

Spec globs (`git/git.go:15-18`): `*.md, *.mdx, *.txt` + images (`*.jpg,*.jpeg,*.png,*.gif,*.webp,*.svg,*.pdf`).

`CurrentCommit(dir)` = `git rev-parse HEAD` (`git/git.go:28-34`). `IsRepo(dir)` = `git rev-parse --git-dir` succeeds (`git/git.go:21-24`).

**Observation relevant to the request's "detect after rebase/merge from main":** detection is purely `lastCommit` (stored HEAD) vs. current HEAD via `git diff`. It compares two commit hashes and does not distinguish local commits from pulled/merged/rebased commits — any HEAD movement that touches spec files is picked up. There is **no branch awareness, no remote/`origin` awareness, and no fetch** in this logic. `IncrementalScan` also has a **rebase-safety fallback**: if `git diff <lastCommit>..<current>` fails because `lastCommit` no longer exists (history rewritten), it is handled in `db/index.go` (see `IncrementalScan`, `db/index.go:193-380`, e.g. the `newCommit = lastCommit` fallbacks and the `DELETE FROM meta WHERE key='git_commit_<repo>'` reset at `db/index.go:379`).

---

## 8. CWD → repo resolution already exists (but not on `scan`)

`scope.NearestRepoForCWD(cwd, repos)` (`scope/scope.go:357-387`) implements exactly the "match cwd or a parent directory to a registered repo" behavior the request describes for `scan`:

- Cleans `cwd` and each repo path to absolute, separator-normalized form.
- Collects every repo whose path `== cwd` or is a **prefix** of `cwd` (i.e. cwd is inside the repo).
- Returns the **longest matching path** (deepest enclosing repo). `ok=false` if none enclose cwd.

This is currently used by:
- `autoInitLocalConfig` (`main.go:1680-1689`) to seed `.local-search.toml`.
- The scope `Resolver.Resolve()` chain for search (`scope/scope.go:131-...`), documented at `scope/scope.go:1-13`.

The `scope` package header (`scope/scope.go:1-12`) already encodes the design principle the request restates for scan:
> "Hard error — refuse to fan out across all repos by accident … Silently searching every registered repo turns local-search into a noisy global tool."

**But `cmdScan` does not call `NearestRepoForCWD` or any scope resolution.** The single-repo-by-CWD behavior exists for *search* and is absent from *scan*.

---

## 9. No hook / push / watcher infrastructure exists

Grep across the Go sources for `post-push`, `pre-push`, `post-merge`, `hooks`, `inotify`, `fsnotify`, `watch` returns **no matches**. There is:
- No git-hook installer.
- No file-system watcher.
- No remote/push detection.
- No Codex/agent integration for scan triggering.

The only "installer"-style command is `install-skill` (`main.go:99-100`, `skill.go`), which installs a Claude skill — unrelated to git hooks.

---

## Key files & symbols

| Area | Location |
|---|---|
| Command dispatch | `main.go:45-111` (scan alias at `:61-66`) |
| `cmdScan` (full teardown+rebuild) | `main.go:525-563` |
| Auto-incremental on query | `main.go:575-633` (`ensureDB`), `main.go:1624-1671` (`runIncrementalUpdates`) |
| Repo config storage (flat file) | `main.go:2193-2274`, file `~/.local-search/repos` |
| `repo add` / `repo remove` / `repo list` | `main.go:135-292` |
| DB schema (repos table, meta table) | `db/schema.go:19-83` |
| `FullScan` | `db/index.go:33-185` |
| `IncrementalScan` (+ rebase fallback, commit reset) | `db/index.go:187-380` |
| Git change detection | `git/git.go` (whole file) |
| CWD→repo matcher (exists, unused by scan) | `scope/scope.go:348-387` |
| `RepoRow` / `Repos()` query (no timestamps) | `db/query.go:727-772` |
| `meta` get/set (`git_commit_<repo>`, `last_scan`) | `db/schema.go:228-239` |
| README description of scan/incremental | `README.md:64-69`, `:232-259` |

---

## Summary answer to "confirm exactly how scan works"

1. `local-search scan` today = **delete DB → recreate schema → FullScan every registered repo → store each git HEAD + one global `last_scan` timestamp.** No CWD awareness, no single-repo default.
2. `scan <name>` scans only that repo but **still wipes the whole DB first**, so other repos' indexes are lost until the next full scan.
3. Change detection between scans is done automatically at query time via `ensureDB`/`runIncrementalUpdates`, using stored-HEAD-vs-current-HEAD `git diff` plus staged/unstaged/untracked unions.
4. Per-repo tracked state = last-scanned commit hash only. Added-date, per-repo scan time, and per-repo last-updated time are **not tracked**; `repo list` shows name + path only.
5. The building blocks the request wants for CWD resolution (`scope.NearestRepoForCWD`) and single-repo-refusal-by-default (scope package philosophy) already exist for *search*, but are not wired into *scan*. No hook/push/watch mechanism exists at all.
