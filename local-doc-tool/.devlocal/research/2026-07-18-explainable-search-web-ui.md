---
date: 2026-07-18T00:00:00Z
git_commit: da2aa99e2e838f42922aeaf712cfa037ade181a0
branch: main
repository: random-poc (local-doc-tool/code — module `local-search`)
topic: "Lightweight explainable-search web UI over the local-search skill + Claude CLI, with knowledge-graph visualization"
tags: [research, codebase, web-ui, preact, claude-cli, knowledge-graph, provenance, vector-search]
status: complete
---

# Research: A lightweight explainable-search web UI over `local-search` + Claude CLI

**Date**: 2026-07-18 · **Git Commit**: da2aa99 · **Branch**: main

## Research Question
> How can I build a very lightweight web UI (e.g. Preact + minimal stack) where a user runs a
> search through the Local Search skill, the Claude CLI analyzes the results, and the UI shows
> (1) the final natural-language answer and (2) a knowledge-graph visualization of the nodes,
> relationships, contributing files/sources, and the retrieval path from vector DB → answer?
> Backend: every query invokes the Claude CLI with the `local-search` skill in the prompt; the
> CLI returns the answer + the graph metadata.

**This documents what IS in the repo today** and maps the existing CLI/JSON surface to each UI
requirement. It is not a design proposal; where the requirement has no backing surface today, that
gap is stated explicitly.

---

## Summary

Almost everything the UI needs is **already emitted by the `local-search` binary as JSON** — no
new Go code is required to get answers, ranked source specs, provenance, or a renderable graph.
The one thing that does **not** exist in the repo is any HTTP server, web UI, or `claude -p`
integration: the tool is a CLI + a passive Claude Code skill (`skills/local-search/SKILL.md`), and
the two `localDocGuide*.html` files at the repo root are static marketing/docs pages with no
backend (verified: no `net/http` / `http.ListenAndServe` anywhere in `code/`).

The build therefore reduces to a thin glue layer around commands that already exist:

| UI requirement | Existing surface that supplies it | Command |
|---|---|---|
| **Mandatory repo picker** (which indexed repos to include) | `RepoRow[]` registry with names, paths, spec counts, graph flags | `local-search json repos` (see §8) |
| Execute a search via the skill | `local-search` FTS + hybrid vector search | `local-search json search "<q>" --semantic` |
| Natural-language answer | Claude CLI headless, with the skill's pipeline | `claude -p` (see Gap G3) |
| Which files/sources contributed | `SearchResult` rows (`repo/project/name/path/fullpath/tags/relevance`) and the `find.Response` merged payload | `local-search json search`, `local-search json context` |
| Retrieval path (vector DB → answer) | Hybrid FTS+vector RRF fusion; `relevance` = fused score | `--semantic` path in `query.go:SemanticSearch` |
| Graph nodes + relationships | `graph`/`vgraph` command emits NetworkX node-link JSON (D3/Cytoscape-ready) | `local-search graph search "<q>"` / `graph tag <tag>` |
| Provenance / "what was reachable" | `find.Response.Scope`, `.ScopeSource`, `.Missing[]` | `local-search json context "<q>"` |

The natural data flow: the backend runs `local-search json search --semantic` (ranked source specs
+ provenance) **and** `local-search graph search` (similarity graph) **and** pipes the read specs
into `claude -p "<skill-guided prompt>"` for the answer; the frontend renders the answer plus the
node-link graph, joining tags/relevance onto graph nodes by spec `id`/`path`.

---

## Detailed Findings

### 1. The command surface a backend would shell out to

Dispatch is a single switch in `code/main.go:54-106`. The commands relevant to the UI:

- **`search` / `s`** (`main.go:660-781`) — FTS5 BM25, with opt-in `--semantic`/`--hybrid` (alias)
  hybrid re-ranking (`main.go:666-667,696`). Also `--repos`, `--source`, `--rank`,
  `--exclude-location`. Human-readable output.
- **`graph` / `vgraph`** (`main.go:59-60`, impl `cmdVectorGraph` `main.go:786-827`) — emits
  NetworkX node-link JSON. Two modes:
  - `graph tag <tag>` → `localdb.VectorGraphByTag(db, tag, 0.3, 8)` (`main.go:800`) — kNN graph over
    all specs carrying `<tag>`, cosine ≥ **0.3**, top-**8** edges/node.
  - `graph search <query> [--repo <name>]` → `localdb.VectorGraphBySearch(db, query, repo, 10, 8, 0.3)`
    (`main.go:818`) — ego graph: top-**10** seed specs by cosine to the query, each expanded to **8**
    nearest neighbors, cosine ≥ **0.3**.
- **`json` / `j`** (`main.go:1233-1386`) — the agent-facing surface. Subcommands: `search` (with
  `--semantic`), `read`, `list`, `repos`, `related`, `tags`, `stats`, **`find`**, **`context`**.
  All serialized via `localdb.PrintJSON` (indented JSON to stdout, `query.go` PrintJSON).

Binary + data locations: binary expected on PATH (`/usr/local/bin/local-search`); state under
`~/.local-search/` — `repos` (registry) and `specs.db` (SQLite cache) (`main.go:31-34`). DB is a
**disposable derived cache**; source files are the truth (rebuilt by `scan`).

### 2. What a search hit carries (contributing-files metadata)

`SearchResult` — `code/db/query.go:19-29` — one per hit from `json search`:

```go
type SearchResult struct {
	Repo      string  `json:"repo"`
	Project   string  `json:"project"`
	Name      string  `json:"name"`
	Title     string  `json:"title"`
	Tags      string  `json:"tags"`      // comma-separated
	Path      string  `json:"path"`      // repo-relative
	FullPath  string  `json:"fullpath"`  // absolute path on disk
	Ext       string  `json:"ext"`
	Relevance float64 `json:"relevance"` // FTS: BM25 f.rank (lower better); semantic: fused RRF (higher better)
}
```

This is the "which files contributed" list. `fullpath` + `path` identify the source doc;
`tags`/`title`/`project` are display metadata; `relevance` is the ranking signal.

### 3. The retrieval path: FTS → vector → fused rank

- **FTS stage** — `Search` (`query.go:31-76`): `SELECT ... FROM specs_fts f JOIN specs s ON s.id=f.rowid
  WHERE specs_fts MATCH ? ORDER BY f.rank LIMIT 200`. `f.rank` is FTS5 BM25. `Relevance = f.rank`.
- **Vector stage** — `embed` package (`code/embed/embed.go`): pure-Go, model-free. `const Dim = 256`
  (`embed.go:20`); `Embed()` is FNV-1a feature-hashing bag-of-words, L2-normalized
  (`embed.go:33-69`); vectors stored as little-endian float32 BLOBs (`Encode`/`Decode`
  `embed.go:71-90`) in `spec_vectors.vec`; `Cosine()` is a dot product of unit vectors
  (`embed.go:96-105`).
- **Fusion** — `SemanticSearch` (`query.go:83-174`): take the ≤200 BM25 candidates, embed the query,
  load `spec_vectors` for the candidates, cosine-rank them, then **Reciprocal Rank Fusion**:
  `rrf(rank) = 1.0 / (60.0 + rank)` (`query.go:185`); each hit's `Relevance = rrf(ftsRank) +
  rrf(cosineRank)`, re-sorted descending. Zero-vector queries fall back to FTS order.

So the "vector DB → answer" path is renderable as a pipeline: **query → FTS candidates (BM25) →
embed(256-d) → cosine over `spec_vectors` → RRF fuse → ranked source specs → Claude reads top N →
answer.** Every stage is observable from the CLI (`json search` vs `json search --semantic` show the
before/after ordering).

### 4. The graph payloads (nodes + relationships)

**Vector similarity graph** — `code/db/vgraph.go`. This is the primary "knowledge graph that powered
the answer" for the spec corpus:

```go
type GraphNode struct {                 // vgraph.go:13-19
	ID      string `json:"id"`           // = specs.id as string
	Label   string `json:"label"`        // title, else name (vgraph.go label())
	Repo    string `json:"repo"`
	Project string `json:"project,omitempty"`
	Path    string `json:"path,omitempty"`
}
type GraphLink struct {                  // vgraph.go:22-26
	Source string  `json:"source"`
	Target string  `json:"target"`
	Weight float64 `json:"weight"`        // cosine similarity, rounded to 4 dp
}
type NodeLinkGraph struct {              // vgraph.go:29-35
	Directed   bool           `json:"directed"`     // false
	Multigraph bool           `json:"multigraph"`   // false
	Graph      map[string]any `json:"graph"`
	Nodes      []GraphNode    `json:"nodes"`
	Links      []GraphLink    `json:"links"`
}
```

> **Gap for the UI (G1):** graph nodes carry `id/label/repo/project/path` but **not** `tags`
> (`node()` builder sets only ID/Label/Repo/Project — `vgraph.go:58-60`). To show tags/labels on
> nodes, the frontend must **join** the `graph` payload's node `id`/`path` against the `json search`
> results (which do carry `tags`). Same for `relevance` — it lives on `SearchResult`, not on the
> graph node.

**External graphify graph** — `code/graph/graph.go` (only present if a repo has `graphify-out/graph.json`):
`Node{ id, label, norm_label, community, file_type, Degree(computed) }` (`graph.go:82-89`). This
supplies richer node attributes (community, degree centrality) but only for repos that ran graphify.
`CentralityBoost = 1 + log(1+degree)/8`, capped 1.5× (`graph.go:226-246`) — an existing graph×BM25
blend precedent.

**Merged provenance payload** — `code/find/find.go`, emitted by `json find` / `json context`:

```go
type Result struct {                     // find.go:35-52
	Score   float64    `json:"score"`     // normalized, weighted, higher better
	Type    SourceType `json:"type"`      // "spec" | "graphify" | "codegraph"
	Repo, Name, Title, Path, Tags string
	Spec      *localdb.SearchResult `json:"spec,omitempty"`
	Graphify  *graph.LabelMatch     `json:"graphify,omitempty"`
	CodeGraph *codegraph.Node       `json:"code_node,omitempty"`
	Blast     []codegraph.Node      `json:"blast,omitempty"` // Context() only, top codegraph hit
}
type Response struct {                   // find.go:62-68
	Scope       []string  `json:"scope"`        // repos/graphs actually queried
	ScopeSource string    `json:"scope_source"` // where scope came from
	Results     []Result  `json:"results"`
	Missing     []Missing `json:"missing,omitempty"` // {repo, reason, fix}
}
```

`json context` (`main.go:1363-1381`) = `find.Context` = `Find` + inlined **blast radius** (bounded
BFS over the code graph) for the top code hit. `Scope`/`ScopeSource`/`Missing` give the UI an
honest "what sources were reachable and what was skipped (with fix hints)" panel — direct material
for the provenance view.

### 5. Scope governs what a query can reach

`code/scope/scope.go`: a **Scope** = the set of repos/graphs a query hits, resolved by precedence
`--scope flag > ./.local-search.toml (walk-up) > ~/.local-search/config.toml > nearest enclosing
repo > ErrNoScope` (`scope.go:131-190`). Config shape:

```toml
scope = ["repo1", "graph:external-name"]
[weights]  specs = 1.0   graphify = 0.7   codegraph = 0.8
[limits]   specs = 20    graphify = 10    codegraph = 10   blast_depth = 2   blast_cap = 50
```

`Weights` scale each source's contribution to `Result.Score`; `Limits` cap per-source hits and BFS
depth (`scope.go:68-81`). A backend that wants deterministic results should pass `--scope` explicitly
or ship a `.local-search.toml`, otherwise resolution depends on the server's CWD.

### 6. The demo corpus that already exists

`examples/` holds two registerable repos (`main` agent + directory listing):
- `examples/product-specs/` → projects `payments` (`refund.md` w/ frontmatter tags
  `billing, refund, customer, payments`; `chargeback.md`), `onboarding` (`signup.md`).
- `examples/platform-docs/` → project `architecture` (`database.txt`, plus `.pdf`/`.jpg` assets with
  companion `.md` sidecars: `FilingInfo-2.md`, `drive-license-front.md`), `api`
  (`authentication.mdx`).

Enough to demo multi-repo, tags, projects, and sidecar-asset provenance without new content.

### 7. The Claude-CLI + skill mechanism (what exists vs. what's assumed)

- The skill is **passive**: `skills/local-search/SKILL.md` defines a *search → read → reason*
  pipeline (`SKILL.md:35-119`) with a JSON-output note for "agent pipelines" (`SKILL.md:70-74`). It
  is prose that instructs a Claude agent which commands to run — it contains no executable code.
- `install.sh` / README document installing the binary and copying the skill into
  `.claude/skills/local-search/` (README skill section). No server, no daemon.
- **No repo reference to `claude -p`, `claude --print`, or MCP exists** (searched; none found). The
  "backend invokes the Claude CLI with the skill in the prompt" flow is *not implemented anywhere in
  this repo* — it is the thing to be built (Gap G3).

### 8. Repo selection surface (the mandatory picker)

**Populating the picker** — `local-search json repos` (`main.go:1310-1315`) returns `[]RepoRow`
(`code/db/query.go:725-735`), one per indexed repo:

```go
type RepoRow struct {
	Name               string `json:"repo"`                 // selection key + --repos/--scope value
	Path               string `json:"path"`                 // absolute repo path (display)
	Count              int    `json:"spec_count"`           // # indexed specs (show as a badge)
	GraphPath          string `json:"graph_path,omitempty"`
	GraphNodeCount     int    `json:"graph_node_count,omitempty"`      // >0 ⇒ graphify graph present
	CodeGraphPath      string `json:"code_graph_path,omitempty"`
	CodeGraphNodeCount int    `json:"code_graph_node_count,omitempty"` // >0 ⇒ code graph present
}
```

Example:
```json
[
  {"repo":"product","path":"/…/examples/product-specs","spec_count":3},
  {"repo":"platform","path":"/…/examples/platform-docs","spec_count":3}
]
```

So the picker renders a checklist of `repo` names with `spec_count` badges and a "has graph"
indicator (`graph_node_count > 0`). The `repo` field is the exact token every command wants.

**Passing the selection — the flags differ per command (integration wrinkle, G7).** There is no
single repo-filter convention across the JSON commands the UI needs:

| Command (JSON form the UI calls) | Repo-selection syntax | Multi-repo? |
|---|---|---|
| `search` (human output) | `--repos name1,name2` / `--repos all` / `--repos graph-only` (`main.go:663`) | **Yes**, native comma list |
| `json search "<q>" [repo]` | **positional single repo only** (`main.go:1259-1262`) | **No** — one repo per call |
| `graph search "<q>" --repo <name>` | single `--repo` → `VectorGraphBySearch(...,repoFilter,...)` (`main.go:812-818`, `vgraph.go:147,172-174`) | **No** — one repo (empty = all) |
| `graph tag <tag>` | none — tag spans all repos (`main.go:800`) | n/a |
| `json find` / `json context` | `--scope repo1,repo2` (`main.go:1347,1371`; `scope.go:131-190`) | **Yes**, native comma list |

Consequences for a mandatory multi-select picker:
- **`json find`/`json context --scope r1,r2` is the only JSON command with native multi-repo** — and
  it also returns `Scope`/`ScopeSource`/`Missing` (§4), so the UI can confirm back exactly which
  selected repos were honored vs skipped. This makes it the natural backbone for "mandatory repo
  selection + provenance."
- **`json search --semantic` and `graph search` are single-repo in JSON form.** For an N-repo
  selection the backend must **call once per selected repo and merge**: semantic `Relevance` is
  higher-is-better and mergeable by sort; graph node-link results union by node `id` (dedupe on
  `id`). Alternatively pass no repo filter (search all) and **filter client-side** to the selected
  set using each hit's `repo` field — simpler, but wastes work on unselected repos.
- **Enforcing "mandatory":** purely a frontend concern — disable the submit button until ≥1 repo is
  checked. The binary itself will happily search all repos if none is specified (or, for
  `find`/`context`, resolve scope from CWD/`.local-search.toml` — G4), so the requirement must be
  enforced in the UI/backend, not relied upon from the CLI default.

---

## What the UI build reduces to (grounded in the above)

Only glue is missing. The lightweight shape supported by the current surface:

1. **Backend (thin HTTP wrapper — does not exist yet, ~1 file):** one `POST /query {q}` endpoint that
   shells out to the existing binary:
   - `local-search json search "<q>" --semantic` → ranked source specs (contributing files + `relevance`).
   - `local-search graph search "<q>"` → node-link JSON for the graph view.
   - (optional richer provenance) `local-search json context "<q>"` → `Scope`/`Missing` + merged results.
   - Build the answer: feed the top specs' content (via `local-search json read <name>`) into
     `claude -p "<prompt embedding the local-search skill's search→read→reason instructions>"`, or run
     `claude -p` with the skill available and let it call the binary itself. Return `{answer, sources,
     graph, scope, missing}`.
2. **Frontend (Preact + a graph lib):** render `answer` (markdown) + a node-link graph. Because the
   graph payload is **NetworkX node-link** (`{nodes:[{id,label,...}], links:[{source,target,weight}]}`),
   it maps directly onto **Cytoscape.js**, **D3-force**, or **vis-network** with no transform. Join
   `graph.nodes[].id`/`.path` ⇢ `sources[].tags`/`.relevance` to color/size nodes by tag/rank and to
   mark which nodes are "contributing sources" for this answer (Gap G1 join).
3. **Retrieval-path view:** render the pipeline from §3 as stages, using the two orderings the CLI
   already exposes (`json search` vs `json search --semantic`) to show BM25 → fused re-rank, and the
   edge `weight`s (cosine) as the vector-similarity layer.

No changes to `code/` are required for a working POC; every datum above is already emitted.

---

## Gaps & Open Questions

- **G1 — Graph nodes lack `tags`/`relevance`.** `GraphNode` (`vgraph.go:13-19`) omits tags; join by
  `id`/`path` against `json search` results, or (if a code change is acceptable) add a `Tags` field
  in `vgraph.go` `node()`.
- **G2 — Two graph shapes, one question.** The similarity graph (`vgraph.go`) and the answer's
  contributing sources (`SearchResult[]`) are **separate** payloads produced by **separate**
  commands. There is no single call that returns "answer + its exact source subgraph." The UI must
  correlate them client-side (query seeds the graph ego + the search hits ≈ the same specs, but the
  mapping is by `id`/`path`, not guaranteed identical sets).
- **G3 — No Claude-CLI integration exists.** How `claude -p` is invoked (skill in prompt vs. skill
  installed + tool-calling), how the answer is captured, and how it's kept consistent with the
  `sources`/`graph` the UI shows, is entirely unbuilt. Decision needed: does Claude run the searches
  (agentic, skill-driven) or does the backend pre-run them and pass results into a constrained prompt
  (deterministic, cheaper)?
- **G4 — Scope determinism.** Without an explicit `--scope`/`.local-search.toml`, results depend on
  the server process CWD (`scope.go:131-190`). A server should pin scope.
- **G5 — Semantic quality is model-free.** Embeddings are FNV feature-hashing (`embed.go`), not a
  learned model — cosine edges reflect lexical overlap, not deep semantics. Fine for a POC; the graph
  "relationships" are token-overlap similarity, which should be labeled honestly in the UI.
- **G6 — `graph`/`vgraph` has no JSON-namespaced alias.** It prints node-link JSON directly (not under
  `json …`); backend parses stdout of `graph search`/`graph tag` (`main.go:786-827`).
- **G7 — No unified repo-filter convention (blocks the mandatory picker).** `search` uses `--repos`
  (multi), `json search` uses a positional single repo, `graph search` uses single `--repo`, and
  `find`/`context` use `--scope` (multi). To honor a multi-repo selection the backend must either
  standardize on `json context --scope …` (native multi + provenance) or fan out `json search` /
  `graph search` per selected repo and merge. "Mandatory" itself is UI-enforced — the CLI defaults to
  all-repos/scope-resolution when no repo is passed. See §8.

---

## Code References
- `code/main.go:54-106` — command dispatch (search, graph/vgraph, json).
- `code/main.go:660-781` — `cmdSearch`; `--semantic`/`--hybrid` at `:666-667,696`.
- `code/main.go:786-827` — `cmdVectorGraph`: `graph tag` → `VectorGraphByTag(...,0.3,8)`, `graph search`
  → `VectorGraphBySearch(...,10,8,0.3)`.
- `code/main.go:1233-1386` — `cmdJSON`: `search --semantic` (`:1244-1273`), `find` (`:1341-1361`),
  `context` (`:1363-1381`).
- `code/db/query.go:19-29` — `SearchResult` (per-hit provenance + `relevance`).
- `code/db/query.go:31-76` — `Search` (FTS5 BM25).
- `code/db/query.go:83-174` — `SemanticSearch` (hybrid); RRF `1/(60+rank)` at `:185`.
- `code/db/vgraph.go:13-35` — `GraphNode`/`GraphLink`/`NodeLinkGraph`; `node()` builder `:57-60`.
- `code/embed/embed.go:20` `Dim=256`; `:33-69` `Embed`; `:71-90` `Encode/Decode`; `:96-105` `Cosine`.
- `code/find/find.go:35-68` — `Result`/`Missing`/`Response` (merged payload + `Scope`/`Missing`).
- `code/find/find.go:157-187` — `Context` (Find + blast radius).
- `code/graph/graph.go:82-89` — external graphify `Node`; `:226-246` `CentralityBoost`.
- `code/scope/scope.go:92-97` — `Scope`; `:131-190` `Resolve`; `:68-81` `Weights`/`Limits`.
- `code/db/schema.go:31-71` — `specs`, `specs_fts`, `spec_tags`, `spec_vectors`, `spec_edges` DDL.
- `skills/local-search/SKILL.md:35-119` — search→read→reason pipeline; JSON note `:70-74`.
- `examples/` — demo corpus (product-specs, platform-docs).

## Historical Context
- No `.uncle-dev/learns/` directory exists (verified). Prior in-repo research is directly relevant:
  `.devlocal/research/2026-07-18-sqlite-graph-vector-search.md` (how the graph/vector capability came
  to be) and `.devlocal/plans/2026-07-18-local-search-pure-go-vector-search.md` (the pure-Go,
  model-free embedder + `graph`/`vgraph` command the UI now consumes). The plan's §2 explicitly
  designed the `graph` command to emit "D3/Cytoscape-ready" node-link JSON — i.e. the graph output
  was built for a UI like the one this question asks for.
