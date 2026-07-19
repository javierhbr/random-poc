---
date: 2026-07-18T00:00:00Z
git_commit: da2aa99e2e838f42922aeaf712cfa037ade181a0
branch: main
repository: random-poc (local-doc-tool/code — module `local-search`)
topic: "How can local-search's SQLite content work as a graph or vector DB to optimize search, running locally, lightweight, low-CPU?"
tags: [research, codebase, sqlite, fts5, sqlite-vec, graph, vector-search, modernc]
status: complete
---

# Research: Making local-search's SQLite work like a graph / vector DB (local, light, low-CPU)

**Date**: 2026-07-18
**Git Commit**: da2aa99
**Branch**: main

## Research Question
> How can we make `local-search`'s SQLite store behave like a graph or vector DB — i.e. change *how content is inserted into the DB* — to optimize search, while running locally, staying lightweight, and not consuming CPU?

## Summary

`local-search` today is a **keyword** engine: on insert it writes each document to a `specs` table and mirrors the searchable columns into a **FTS5** virtual table (`specs_fts`), then ranks queries by **BM25** (`ORDER BY f.rank`). It already has *graph* capabilities, but only over **external** artifacts it does not own — graphify's NetworkX `graph.json` (`code/graph/graph.go`) and code-review-graph's SQLite (`code/codegraph/codegraph.go`). Those are read-only pointers; the graph is never built from the tool's own indexed content.

Three things found in the code are decisive for the question:

1. **The insert path is a single, well-isolated funnel** — `FullScan` / `IncrementalScan` in `code/db/index.go`. Anything "graph-like" or "vector-like" you want at insert time hangs off exactly these two functions plus the schema in `code/db/schema.go`. There is no scattered write logic.

2. **A pure-SQL graph already works here and is proven in-repo.** `codegraph.go` implements real graph traversal — one-hop neighbors (`CallersOf`/`CalleesOf`, `code/codegraph/codegraph.go:333-362`) and a bounded BFS "blast radius" (`code/codegraph/codegraph.go:367-448`) — using nothing but a `nodes` table, an `edges` table, and indexed `JOIN`s. This is the low-CPU "graph in SQLite" pattern, already running against `modernc.org/sqlite`.

3. **Vector search needs NO driver change or C toolchain.** The project pins `modernc.org/sqlite v1.48.0` (pure Go, CGO-free — `code/go.mod:5`). As of **v1.47.0 (2026-03-17)** that exact module bundles a CGO-free port of **sqlite-vec** (`modernc.org/sqlite/vec`, sqlite-vec v0.1.6). The `vec` subpackage is physically present in the pinned version's module cache, and its own test (`vec_test.go`) creates a `vec0` virtual table and runs a KNN query in-process. So "make it a vector DB locally and lightweight" is a `_ "modernc.org/sqlite/vec"` blank import plus a `vec0` table — not a rewrite.

The real CPU cost is **not** the search — FTS5 BM25 and sqlite-vec KNN are both cheap. It is **producing the embedding vectors** at insert time (and once per query). sqlite-vec stores and searches vectors; it does not generate them. That generation step is the only part of "make it a vector DB" that can "consume CPU," and it is optional/pluggable.

---

## Detailed Findings

### 1. How content is inserted today (the funnel you would change)

**Schema** — `code/db/schema.go:12-77`
- `specs` — one row per document: `repo, path, project, name, title, tags, summary, fullpath, modified, size, ext, content` (`schema.go:35-50`).
- `specs_fts` — `CREATE VIRTUAL TABLE ... USING fts5(repo, name, title, tags, summary, content, content='', tokenize='porter unicode61')` (`schema.go:52-61`). It is **contentless** (`content=''`) — FTS5 stores only the inverted index, not a copy of the text, which keeps the DB small.
- `spec_tags` + indexes (`schema.go:63-71`) — exploded tags for tag queries.
- Pragmas at open: WAL, `synchronous=NORMAL`, 32 MB page cache, single writer connection (`schema.go:90-105`).

**Insert pipeline** — `code/db/index.go`
- `FullScan` (`index.go:32-178`): walks the repo with a bounded worker pool (2–16 workers, `index.go:33-39`), `extract.FromFileEntry` parses each file, and rows stream into one transaction via a prepared `INSERT OR REPLACE INTO specs (...)` (`index.go:97-120`).
- After all specs are inserted, FTS and tags are populated in **set-based SQL passes**: `batchInsertFTS` does `INSERT INTO specs_fts(...) SELECT ... FROM specs WHERE repo=?` (`index.go:557-564`); `batchInsertTags` explodes the `tags` column into `spec_tags` (`index.go:632-660`).
- `IncrementalScan` (`index.go:186-352`) does the same for git-changed files only, reading outside the transaction then writing in one tx.
- **Implication:** a new per-document artifact (an embedding vector, or graph edges) would be produced in `extract` and written in a third batch pass right next to `batchInsertFTS` / `batchInsertTags`. The transaction boundary and worker pool already exist.

**What `extract` produces** — `code/extract/extract.go:26-40`, `:69-98`
- `Spec` carries `Title` (first `# heading`, `:244-249`), `Tags` (from `tags:` frontmatter, `:251-260`), `Summary` (first paragraph, capped 300 chars, `:262-305`), and full `Content` (capped 10 MB, `:46`, `:220-233`).
- This is the text a vectorizer or a link-extractor would consume.

### 2. Current search = FTS5 + BM25 only

- `Search` — `code/db/query.go:29-73`: `SELECT ... FROM specs_fts f JOIN specs s ON s.id=f.rowid WHERE specs_fts MATCH ? ORDER BY f.rank LIMIT 200`. `f.rank` is FTS5's built-in BM25 score. Optional `repo` and `path LIKE` filters (`query.go:45-53`).
- `SearchInRepos` (`query.go:78-115`), `Related` (`query.go:369-412`, tag/title-word OR query), `Recent`, `Tags`, `SpecsByTag` — all FTS5 or plain indexed SQL.
- There is **no** semantic/vector step and **no** edge/graph step over the tool's own content. "Related" is keyword overlap, not graph adjacency.

### 3. Graph capability already exists — but only over external graphs

**graphify integration** — `code/graph/graph.go`
- `Detect` finds `graphify-out/graph.json` (`graph.go:33-46`); `Load` parses NetworkX node-link JSON into an in-memory adjacency structure, computing node **degree** from links (`graph.go:129-188`), cached per `(path, mtime)` (`graph.go:118-137`).
- `CentralityBoost` (`graph.go:226-246`) multiplies a spec's BM25 score by `1 + log(1+degree)/8`, capped at 1.5×, when the spec name matches a graph node. **This is already a hybrid graph+keyword ranker** — but the graph comes from the external graphify binary, not from local-search's DB.
- Design note in the header comment (`graph.go:1-9`): "graphify is the source of truth… Parsed graph data is read on demand and never persisted."

**code-review-graph integration** — `code/codegraph/codegraph.go`
- Reads a per-repo SQLite (`.code-review-graph/graph.sqlite`) **read-only, immutable** (`codegraph.go:213-230`).
- Real graph queries in pure SQL over `nodes` + `edges`:
  - one-hop: `relatedNodes` joins `edges`→`nodes` (`codegraph.go:344-362`).
  - bounded BFS: `BlastRadius` / `expandFrontier` walk N hops with a visited-set and a cap (`codegraph.go:367-448`).
  - centrality: `HubNodes` = `nodes LEFT JOIN edges GROUP BY … ORDER BY deg` (`codegraph.go:477-515`).
- **This is the template for an internal graph.** The exact pattern (nodes table + edges table + indexed joins + recursive/BFS traversal) could be applied to `specs` without any new dependency.

### 4. The driver constraint — and why it is NOT a blocker

- `code/go.mod:5`: `require modernc.org/sqlite v1.48.0`. README (`code/README.md`) emphasizes "pure Go, no CGO, no C toolchain."
- Historically, adding vector search to a pure-Go SQLite meant abandoning that property (switch to CGO `mattn/go-sqlite3`, or WASM `ncruces/go-sqlite3`).
- **No longer true for this project.** `modernc.org/sqlite` v1.47.0 (CHANGELOG line 11, dated 2026-03-17) added a "CGO-free version of the vector extensions from sqlite-vec." Confirmed present in the pinned build: `~/go/pkg/mod/modernc.org/sqlite@v1.48.0/vec/` exists, bundling **sqlite-vec v0.1.6** (`vec_darwin_amd64.go:1060`, `m_SQLITE_VEC_VERSION = "v0.1.6"`).
- Usage (from the module's own `vec_test.go`):
  ```go
  import (
      "database/sql"
      _ "modernc.org/sqlite"
      _ "modernc.org/sqlite/vec"   // registers vec0 + vec_* functions, no CGO
  )
  // create virtual table vec_examples using vec0(sample_embedding float[8]);
  // insert ... values (1, '[-0.2, 0.25, ...]');
  // select rowid, distance from vec_examples
  //   where sample_embedding match '[...]' order by distance limit 2;
  ```
- Limits found in the bundled build: max **8192** dimensions (`m_SQLITE_VEC_VEC0_MAX_DIMENSIONS`), KNN K max **4096** (`m_SQLITE_VEC_VEC0_K_MAX`); supports float / int8 / binary vectors (CHANGELOG:13).
- **Caveats (from source + upstream):** sqlite-vec is pre-v1 ("expect breaking changes," CHANGELOG:12); search is **brute-force full-scan KNN**, not ANN (accurate, and fast for the small corpora this tool targets, but O(rows) per query); the modernc note recommends pinning the **same `modernc.org/libc` version** the `sqlite` go.mod uses.

### 5. Where the CPU actually goes

- **FTS5 BM25**: cheap, already in use.
- **sqlite-vec KNN**: a linear scan over stored float vectors with SIMD-friendly distance math. For a spec registry (hundreds–low thousands of docs) this is microseconds-to-low-ms and effectively free on modern CPUs.
- **Embedding generation** (text → float vector): this is the *only* heavy step, and it is **not** part of sqlite-vec. Options, lightest first:
  - Skip vectors entirely; get most of the "graph" benefit from an internal `edges` table (Finding 3 pattern) — zero new CPU, zero new deps.
  - Generate embeddings out-of-process / on demand (only when the user opts into semantic search), so a normal `scan` stays as fast as today (~30ms, per README).
  - Use a small local embedding model (e.g. a compact ONNX/GGUF sentence model). This is the part that "consumes CPU"; it runs once per document at insert and once per query. It can be gated behind a flag so the default path is untouched.

---

## Code References
- `code/db/schema.go:12-77` — `specs`, `specs_fts` (FTS5 contentless), `spec_tags`, indexes.
- `code/db/schema.go:80-108` — `Open` pragmas (WAL, cache_size, single writer).
- `code/db/index.go:32-178` — `FullScan`: worker pool + single-tx insert into `specs`, then FTS/tags batch passes.
- `code/db/index.go:557-660` — `batchInsertFTS` / `batchInsertTags` (set-based SELECT-driven passes; the natural home for a vector/edge pass).
- `code/db/query.go:29-73` — `Search`: FTS5 `MATCH` + BM25 `ORDER BY f.rank`.
- `code/db/query.go:369-432` — `Related`: keyword-overlap, not graph adjacency.
- `code/graph/graph.go:129-188` — in-memory adjacency + degree from external graphify JSON.
- `code/graph/graph.go:226-246` — `CentralityBoost`: existing hybrid graph×BM25 ranking multiplier.
- `code/codegraph/codegraph.go:333-362` — one-hop neighbor traversal in pure SQL (`edges` JOIN `nodes`).
- `code/codegraph/codegraph.go:367-448` — bounded BFS (`BlastRadius`/`expandFrontier`), low-CPU graph walk template.
- `code/codegraph/codegraph.go:477-515` — `HubNodes` centrality via `GROUP BY` on edges.
- `code/go.mod:5` — `modernc.org/sqlite v1.48.0` (pure Go).
- `~/go/pkg/mod/modernc.org/sqlite@v1.48.0/vec/` — bundled CGO-free sqlite-vec v0.1.6.
- `~/go/pkg/mod/modernc.org/sqlite@v1.48.0/vec_test.go` — canonical `vec0` create/insert/KNN example.
- `~/go/pkg/mod/modernc.org/sqlite@v1.48.0/CHANGELOG.md:11-16` — v1.47.0 sqlite-vec addition.

## Architecture Documentation (patterns found, not recommendations)

Three storage/search shapes are viable *within this codebase's existing constraints* (pure-Go, single binary, local, offline):

| Shape | How content is inserted | How search runs | New deps | CPU at insert | CPU at query |
|---|---|---|---|---|---|
| **Keyword (today)** | text → `specs` + `specs_fts` (BM25 index) | FTS5 `MATCH` + BM25 | none | low | very low |
| **Internal graph** | additionally derive links (tag co-occurrence, title/name refs, shared project) → `spec_nodes` + `spec_edges` | indexed `JOIN` / recursive-CTE / BFS like `codegraph.go` | none | low (string work) | low |
| **Vector / hybrid** | additionally embed text → `float[N]` in a `vec0` table linked by rowid | sqlite-vec KNN (`MATCH … ORDER BY distance`), optionally fused with FTS5 via Reciprocal Rank Fusion | `modernc.org/sqlite/vec` blank import (already vendored) | high **only** for embedding generation | very low (brute-force KNN) |

The graph and vector shapes are additive: both hang off the same `FullScan`/`IncrementalScan` transaction and coexist with the current FTS5 index. The existing `CentralityBoost` (`graph.go:226`) shows the project already blends a structural signal into BM25 ranking, so a fusion step is idiomatic here rather than novel.

The canonical hybrid pattern (FTS5 + `vec0` linked by `rowid`, combined with Reciprocal Rank Fusion in one SQL query) is documented by sqlite-vec's author and matches the `specs`/`specs_fts` rowid-join already used at `query.go:38`.

## Historical Context
- No `.uncle-dev/learns/` directory exists in this project (`ls .uncle-dev` → not found), so there is no captured prior knowledge on this topic. No historical context to reconcile against the live findings.

## Open Questions
1. **Corpus size** — how many specs across all repos in practice? Determines whether brute-force sqlite-vec KNN (O(rows)) is comfortable or whether the "internal edges table" graph route is the better lightweight fit.
2. **Embedding source** — is a local embedding model acceptable (the only real CPU cost), or must semantic vectors come from an external/opt-in step to keep `scan` at its current ~30ms?
3. **Graph semantics** — what should an *internal* edge mean for docs? Candidates visible in the schema: shared `tags` (`spec_tags`), shared `project`, title/name cross-references. This changes what `spec_edges` is built from at insert time.
4. **libc pinning** — enabling `modernc.org/sqlite/vec` requires matching the `modernc.org/libc` version from the sqlite module's go.mod; needs a dependency check before adoption.
5. **Pre-v1 risk** — sqlite-vec is pre-v1 with expected breaking changes; acceptable for a POC, worth flagging for anything durable.

## Sources (external)
- [modernc.org/sqlite Now Supports sqlite-vec — Gorse](https://gorse.io/posts/sqlite-vec)
- [modernc.org/sqlite — pkg.go.dev](https://pkg.go.dev/modernc.org/sqlite)
- [modernc.org/sqlite/vec — pkg.go.dev](https://pkg.go.dev/modernc.org/sqlite/vec)
- [asg017/sqlite-vec (upstream extension)](https://github.com/asg017/sqlite-vec)
- [Using sqlite-vec in Go — Alex Garcia](https://alexgarcia.xyz/sqlite-vec/go.html)
- [Hybrid full-text + vector search with SQLite (FTS5 + sqlite-vec + RRF) — Alex Garcia](https://alexgarcia.xyz/blog/2024/sqlite-vec-hybrid-search/index.html)
- [Hybrid full-text search and vector search with SQLite — Simon Willison](https://simonwillison.net/2024/Oct/4/hybrid-full-text-search-and-vector-search-with-sqlite/)
- [ncruces/go-sqlite3 (WASM alternative, FTS5 now a separate ext)](https://github.com/ncruces/go-sqlite3/releases)
