---
date: 2026-07-18T00:00:00Z
git_commit: da2aa99e2e838f42922aeaf712cfa037ade181a0
branch: main
repository: random-poc (local-doc-tool/code — module `local-search`)
topic: "How can local-search use the SQLiteAI `sqlite-vector` extension with TurboQuant?"
tags: [research, sqlite, sqlite-vector, sqliteai, turboquant, vector-search, cgo, mattn, modernc]
status: complete
companion: 2026-07-18-sqlite-graph-vector-search.md
---

# Research: Using SQLiteAI `sqlite-vector` + TurboQuant with `local-search`

**Date**: 2026-07-18
**Git Commit**: da2aa99
**Branch**: main

## Research Question
> How can we use the **SQLiteAI `sqlite-vector`** extension (with **TurboQuant** quantization) in `local-search`? It stores vectors as standard `BLOB`s, uses TurboQuant for a small memory footprint, and avoids virtual tables. In Go this means loading a pre-compiled native C library at runtime via CGO (`mattn/go-sqlite3`).

> Note: this is a **companion** to the earlier same-day research doc
> [`2026-07-18-sqlite-graph-vector-search.md`](./2026-07-18-sqlite-graph-vector-search.md),
> which documented the *pure-Go* path (`modernc.org/sqlite/vec`, a CGO-free port of
> **asg017/sqlite-vec**). SQLiteAI `sqlite-vector` is a **different** extension by a
> **different** vendor and takes a **different** runtime approach (native CGO, not pure Go).
> This file was written as a new document rather than overwriting that one.

## Summary

`sqlite-vector` (by **SQLite AI / SQLite Cloud, Inc.**, repo `github.com/sqliteai/sqlite-vector`) is real and at **v1.0.0 (2026-05-25)**. It is a **native C loadable extension** that stores vectors as ordinary `BLOB` columns (no `vec0` virtual table), and its **TurboQuant** quantizer is a real, published Google Research algorithm (arXiv:2504.19874) exposed through `vector_quantize(..., 'qtype=TURBO,qbits=N')`. The technical premise in the question is broadly correct.

Three facts decide how it fits `local-search` as it exists today:

1. **It requires CGO, which directly contradicts the tool's stated identity.** `local-search` pins `modernc.org/sqlite v1.48.0` — pure Go, CGO-free — and the README markets this twice: "no runtime dependencies," "pure Go, no CGO, no C toolchain needed" (`code/README.md:34`, `:249`; `code/go.mod:5`). The pure-Go `modernc` driver **cannot load a native `.so`/`.dylib`/`.dll` at runtime at all** (it has no `dlopen`, no `LoadExtension` method). Using `sqlite-vector` means switching the driver to CGO `mattn/go-sqlite3`, setting `CGO_ENABLED=1`, requiring a C compiler to build, and shipping a per-platform native binary alongside the tool.

2. **The API in the original prompt is partly inaccurate.** The functions that actually exist are `vector_init`, `vector_quantize`, `vector_quantize_preload`, `vector_quantize_memory`, `vector_quantize_cleanup`, `vector_as_f32/f16/bf16/i8/u8/bit`, and the two table-valued scan functions `vector_full_scan` (exact) and `vector_quantize_scan` (approximate). The prompt's `vector_encode`, `vector_search`, and `vector_distance` **do not exist** in the official API. The real "encode" is `vector_as_f32('[...]')`; the real search is a JOIN against `vector_quantize_scan(...)`.

3. **Licensing is not plain OSS.** `sqlite-vector` is **Elastic License 2.0** (free for OSI-approved open-source projects and non-production use; production/managed use requires a commercial license). This is a materially different constraint from `modernc.org/sqlite` (BSD-3) that `local-search` currently ships under.

The "~30MB" figure is an **extension-baseline default RAM footprint**, not a TurboQuant compression number and not per-dataset. TurboQuant's actual storage is `rows * (8 + 4 + ceil(dim * qbits / 8))` bytes, and its benchmarked recall@10 is ~0.84 (4-bit) / ~0.74 (3-bit) / ~0.48 (2-bit) on a synthetic 1M×768 set.

---

## Detailed Findings

### 1. What `sqlite-vector` is (verified against repo README + API.md + release assets)

- **Vendor / repo / status**: SQLite AI (sqlite.ai), org `sqliteai`, repo `github.com/sqliteai/sqlite-vector`. Latest release **1.0.0, 2026-05-25** (52 releases total; ~99% C). "Production-grade vector search inside SQLite"; targets iOS, Android, Windows, Linux, macOS, WASM.
- **License**: **Elastic License 2.0** — free for OSI-approved open-source and non-production use; production/managed use needs a commercial license from SQLite Cloud, Inc. *(Not a permissive OSS license — flagged because `local-search` today is BSD-licensed pure Go.)*
- **Storage model (confirmed)**: vectors live in **ordinary tables as `BLOB` columns** — verbatim: *"No virtual tables required – store vectors directly as `BLOB`s in ordinary tables."* There is **no `CREATE VIRTUAL TABLE ... USING vec0`**. (This is the concrete contrast with asg017/sqlite-vec, which the companion doc covers.)
  - Nuance: `vector_full_scan` / `vector_quantize_scan` are themselves **table-valued functions** that *return* a `(rowid, distance)` result set — but your data is never stored in a virtual table.
- **Distribution**: per-platform archives on GitHub Releases (e.g. `vector-linux-x86_64-1.0.0.tar.gz`, `vector-macos-arm64-1.0.0.tar.gz`, `vector-windows-x86_64-1.0.0.zip`, plus Android `.aar`, iOS xcframework). The bare **`vector.so` / `vector.dylib` / `vector.dll` are the files *inside* those archives**, not the release-asset names directly (a small correction to the prompt's step 1). Also on npm (`@sqliteai/sqlite-wasm`), PyPI (`sqliteai-vector`), SPM, Gradle, Flutter.
- **Load**: `.load ./vector` or `SELECT load_extension('./vector')`; SQLite auto-appends the platform suffix and uses the default entry point.

### 2. The real SQL API (from `API.md`)

Functions that **exist** (signatures per `API.md`):
- `vector_version()`, `vector_backend()` (CPU/SSE2/AVX2/AVX512/NEON/RVV), `vector_turboquant_backend()`
- `vector_init(table, column, options)` → mandatory before quantize/search
- `vector_quantize(table, column, options)` → INTEGER rows quantized
- `vector_quantize_memory(table, column)` → bytes
- **`vector_quantize_preload(table, column)`** → loads quantized data into shared memory (stated "4×/5× speedup")
- `vector_quantize_cleanup(table, column)`
- `vector_as_f32 / f16 / bf16 / i8 / u8 / bit(value [, dimension])` → BLOB (this is the real "encode": parses JSON `'[...]'` or a BLOB into the stored vector format)
- `vector_full_scan(table, column, vector [, k])` → `(rowid, distance)` — **exact** brute-force NN
- `vector_quantize_scan(table, column, vector [, k])` → `(rowid, distance)` — **approximate** NN on quantized data

Functions in the original prompt that **could NOT be verified / do not exist**: `vector_encode`, `vector_search`, `vector_distance`. Top-k is the optional `k` argument on the two `*_scan` functions; omit `k` for a streaming mode usable with SQL `WHERE`/`LIMIT`.

- **Distance metrics** (`distance` option on `vector_init`): `L2` (default), `SQUARED_L2`, `COSINE`, `DOT`, `L1`, `HAMMING`.
- **Vector types** (`type` option): `FLOAT32` (default), `FLOAT16`, `FLOATB16` (bf16), `INT8`, `UINT8`, `1BIT`.
- **Quantization types** (`qtype`): `UINT8`, `INT8`, `1BIT`, and `TURBO`/`TURBO2`/`TURBO3`/`TURBO4` with `qbits` ∈ {2,3,4}.
- **Max dimensions**: no absolute maximum stated; dimension is fixed per column via the required `dimension` option. `vector_full_scan` is noted as "useful for small datasets (rows < 1,000,000)."

**Verified canonical workflow**: create a normal table with a `BLOB` column → insert vectors (bind bytes, or `vector_as_f32('[...]')` for JSON) → `vector_init(table, col, opts)` → `vector_quantize(table, col, 'qtype=TURBO,qbits=4')` → optional `vector_quantize_preload(table, col)` → query by JOINing against `vector_quantize_scan(table, col, :query, :k)` on `rowid`. This matches the prompt's re-quantize-on-insert note: after inserting a new batch, re-run `vector_quantize()` then `vector_quantize_preload()`.

### 3. TurboQuant (verified against arXiv:2504.19874 + repo QUANTIZATION.md)

- **Origin**: published algorithm — *"TurboQuant: Online Vector Quantization with Near-optimal Distortion Rate,"* arXiv:2504.19874 (28 Apr 2025), Zandieh, Daliri, Hadian, Mirrokni (Google Research / DeepMind, NYU). SQLiteAI credits it as *"a compact data-oblivious vector quantizer inspired by the Google Research paper"* — i.e. a feature **named after / inspired by** the paper, not necessarily a verbatim port.
- **Technique**: rotation-based + per-coordinate scalar quantization, with a **1-bit residual (QJL) correction** for unbiased inner-product estimation. **Data-oblivious**: no codebook training, no calibration data. Two variants (MSE-optimized vs unbiased inner-product). SQLiteAI's description: *"stores each vector as low-bit scalar codes plus one scale value, then scores directly from SIMD lookup-table kernels without reconstructing full vectors."*
- **Invocation**: it is the mechanism behind `vector_quantize()` — `SELECT vector_quantize('t','col','qtype=TURBO,qbits=4')`.
- **Storage math** (QUANTIZATION.md): `rows * (8 + 4 + ceil(dimension * qbits / 8))` bytes. For 1M×768: 4-bit ≈ 13%, 3-bit ≈ 10%, 2-bit ≈ 7% of the ~3.07 GB raw FLOAT32 payload.
- **Benchmarked recall/speedup** (vendor-reported, macOS ARM64/NEON):
  - Synthetic 1M×768, DOT, k=10: 4-bit recall@10 **0.84** (~14.9× faster than exact), 3-bit **0.74**, 2-bit **0.48**.
  - Fashion-MNIST 10K, L2, k=10: 4-bit **0.948**, 3-bit **0.868**, 2-bit **0.596**.
  - Guidance: `qbits=4` for recall, `qbits=2` for memory (with a caveat that 2-bit recall "can drop significantly").
- **The "~30MB" figure**: it is the **extension's default baseline RAM footprint** (README: "defaults to just 30MB of RAM usage"), **not** a TurboQuant compression figure and **not** per-dataset. A separate `<50MB` figure appears for a specific 1M×768 workload (>0.95 recall). Treat "TurboQuant → ~30MB" as **imprecise**: the per-dataset cost is the storage formula above.

### 4. Go integration — the CGO requirement and why `modernc` can't do it

- **`mattn/go-sqlite3` is the driver that can load native extensions.** Two verified out-of-the-box patterns:
  ```go
  // A) Extensions field — auto-loads on every connection
  sql.Register("sqlite3_vector", &sqlite3.SQLiteDriver{
      Extensions: []string{"/abs/path/to/vector"}, // no suffix; SQLite appends .dylib/.so/.dll
  })

  // B) ConnectHook + LoadExtension — imperative, per connection
  sql.Register("sqlite3_vector", &sqlite3.SQLiteDriver{
      ConnectHook: func(conn *sqlite3.SQLiteConn) error {
          return conn.LoadExtension("/abs/path/to/vector", "") // "" = default entry point
      },
  })
  ```
  `LoadExtension(lib, entry string) error` is a real method (`sqlite3_load_extension.go`). Loadable-extension support is **compiled in by default** (`//go:build !sqlite_omit_load_extension`); only the `sqlite_omit_load_extension` build tag disables it — no special tag needed to enable it.
- **CGO is mandatory** for `mattn/go-sqlite3`: `CGO_ENABLED=1` plus a `gcc`/`clang` on PATH (per its README). Run as `CGO_ENABLED=1 go run main.go` (matching the prompt's step 4).
- **`modernc.org/sqlite` (what `local-search` uses today) CANNOT load a native `.so`/`.dylib`/`.dll` — definitively.** It is a CGO-free transpilation of SQLite's C amalgamation to Go; there is no C ABI boundary, no `dlopen`/`LoadLibrary`, and **no `LoadExtension` method in its API**. Native loadable extensions rely on `sqlite3_load_extension()` → `dlopen()`, which a pure-Go binary has no linker for; a `.dylib` compiled against real C SQLite cannot bind to the Go port's internal symbols. The pure-Go way to extend `modernc` is Go-native vtab modules / registered functions at build time (which is exactly how `modernc.org/sqlite/vec` ships asg017/sqlite-vec — pre-transpiled, not runtime-loaded).
- **No official Go binding**: SQLiteAI documents Swift, Android/Gradle, Python (`pip install sqliteai-vector`), Flutter/Dart, and WASM/JS — **not Go**. Go must go through the generic CGO C-extension path. No explicit C entry-point symbol is documented, so pass `""` (default entry-point auto-derivation).

### 5. Practical gotchas (verified where noted)

- **Per-platform binary matching**: ship the correct file per `GOOS/GOARCH` (`vector.so` Linux, `vector.dylib` macOS, `vector.dll` Windows; arm64 vs x86_64). Wrong arch → load failure. This reintroduces exactly the per-platform native-artifact problem that `local-search`'s pure-Go build currently avoids (it cross-compiles to any GOOS/GOARCH with no C toolchain — `code/README.md:249`).
- **Path quirk**: SQLite's loader auto-appends the platform suffix and may prepend CWD when the path has no `/`. Use an **absolute path** to avoid ambiguity (`./vector` → `./vector.dylib` on macOS).
- **macOS quarantine/codesigning** (general Apple/Gatekeeper behavior, *not* documented by SQLiteAI): a `.dylib` downloaded via browser/curl gets `com.apple.quarantine` and Gatekeeper may block an unsigned/unnotarized dylib. Mitigation: `xattr -d com.apple.quarantine vector.dylib`, or codesign/notarize. Treat as a real platform constraint to handle; verify against Apple docs if an authoritative citation is needed.
- **Re-quantization on insert**: the prompt's note is correct — after inserting a significant batch, re-run `vector_quantize()` then `vector_quantize_preload()` to refresh the in-memory quantized index.

---

## Where this would touch `local-search` (structural, from the companion doc)

The insert funnel and search path are already isolated, so the *integration points* are the same ones identified in the companion research — only the driver/storage differ:

- **Driver swap** — `code/go.mod:5` (`modernc.org/sqlite v1.48.0`) → `mattn/go-sqlite3` (CGO). This is the load-bearing change; it inverts the README's "no CGO / no C toolchain" claim (`code/README.md:34`, `:249`).
- **Schema** — `code/db/schema.go:12-77`: add a `BLOB` vector column (on `specs` or a sibling table keyed by `rowid`), plus a one-time `vector_init` call after `Open` (`schema.go:80-108`).
- **Insert** — `code/db/index.go`: an embedding + `vector_as_f32`/insert pass alongside `batchInsertFTS` / `batchInsertTags` (`index.go:557-660`), then a `vector_quantize()` + `vector_quantize_preload()` step at the end of `FullScan` (`index.go:32-178`) / `IncrementalScan` (`index.go:186-352`).
- **Query** — `code/db/query.go:29-73`: a JOIN against `vector_quantize_scan(...)` on `rowid`, optionally fused with the existing FTS5 BM25 rank (the project already blends a structural signal into BM25 via `graph.go:226` `CentralityBoost`, so RRF-style fusion is idiomatic here).

**Unchanged from the companion doc**: the only genuinely CPU-heavy new step is **embedding generation** (text → float vector) — `sqlite-vector` stores and searches vectors but does not produce them. TurboQuant reduces the *memory/scan* cost of stored vectors; it does not remove the embedding step.

## Feasibility: a UI graph from the vector DB (by tag) and from search results

**Verdict: feasible.** A "semantic graph" is a **k-nearest-neighbor (kNN) graph** — `sqlite-vector` supplies the edge data directly; TurboQuant only makes the scan fast/small; neither builds the graph nor renders it. There is **no graph-rendering UI in the repo today** — `localDocGuide.html` / `localDocGuide2.html` are a static Tailwind landing page and docs page, not visualizations.

### Node and edge mapping

- **Node** = a document = a `specs` row, identified by `rowid` (the same `rowid` FTS5 already joins on at `code/db/query.go:38`).
- **Edge** = vector similarity. `vector_quantize_scan(table, column, vector [, k])` returns `(rowid, distance)`; that *is* the adjacency list for one node. Edge weight = a similarity derived from `distance` (metric chosen via `vector_init`: `COSINE`/`DOT`/`L2`). Threshold on `distance` to avoid a fully-connected hairball.

### Mode 1 — tag/label-scoped graph (a subset of the DB)

1. Select the node set by tag using the existing `spec_tags` table (`code/db/schema.go:63-71`; surfaced by the `tags` command, `code/main.go:83`).
2. For each node in the subset, run a kNN scan; keep edges whose target is also in the subset (or keep cross-tag edges to show bridges between tags).
3. Emit `{nodes, links}` → render.

Cost: O(N) scans for N subset nodes; each scan is brute-force O(rows). Comfortable for hundreds–low-thousands. Whole-DB all-pairs is O(rows²) → precompute at index time, not per UI load.

### Mode 2 — search-result graph (ego / neighborhood graph)

1. Embed the query text → `vector_quantize_scan` → top-k hits become seed nodes.
2. Optionally expand one hop: scan each hit's neighbors to show the cluster around the results.
3. Emit the subgraph → render ("results as a constellation").

Cost: cheap — 1 scan for the query + k scans to expand.

### Where it plugs into the repo

- Node + tag data already exist (`specs`, `spec_tags`).
- Add a command mirroring the existing machine-readable `json` command (`code/main.go:91` → `cmdJSON`) that emits **NetworkX node-link JSON** — the same `{"nodes":[...],"links":[...]}` shape graphify already produces (`code/graph/graph.go:60-68`) and that D3 / vis.js / Cytoscape consume unmodified.
- For scale/persistence, precompute edges into a `spec_edges` table using the pure-SQL nodes+edges traversal already proven in `code/codegraph/codegraph.go:333-448`, so the UI reads stored edges instead of scanning live.
- Ranking precedent: `CentralityBoost` (`code/graph/graph.go:226`) already blends a structural signal into BM25, so a graph view is an idiomatic extension, not a foreign concept.

### Graph caveats

- Requires the same **CGO switch + embedding generation** documented above; TurboQuant does not remove either.
- **Approximate edges**: quantized-scan recall is qbits-dependent (2-bit ~0.48, 4-bit ~0.84–0.95). For faithful graph edges use `qbits=4` or exact `vector_full_scan`; reserve 2-bit for memory-bound cases.
- All-pairs kNN over a large corpus is O(rows²); precompute once (index time) rather than per graph load.

## Performance analysis: 2,000 / 5,000 / 10,000 PRD files

Realistic estimates from the verified storage formula (`rows * (12 + ceil(dim*qbits/8))` bytes), the vendor scan benchmark (1M×768 → "a few ms", >0.95 recall), and sourced local-embedding CPU throughput. **All numbers are estimates with stated assumptions, not measurements on this project.**

### Assumptions

- **PRD content** ≈ 1,500–3,000 words ≈ 2,000–4,000 tokens ≈ ~10–15 KB text per file.
- Small embedding models force **chunking** (all-MiniLM-L6 max 256 tokens; bge-base max 512). Realistic default: **~10 chunks per PRD** (≈256-token chunks). So vector rows = files × 10. (nomic-embed-text at 8,192 tokens could do 1 vector/file, but at lower throughput.)
- Two model choices: **MiniLM-L6** (384-dim, lightweight) vs **bge-base** (768-dim, higher quality). Hardware: a modern multi-core CPU, **no GPU**.

### Vector storage / disk (chunked, ~10 rows/file)

| Files | Rows | Raw f32 384d | TurboQuant 4-bit 384d | Raw f32 768d | TurboQuant 4-bit 768d |
|---|---|---|---|---|---|
| 2,000 | 20k | ~30.7 MB | ~4.1 MB | ~61.4 MB | ~7.9 MB |
| 5,000 | 50k | ~76.8 MB | ~10.2 MB | ~153.6 MB | ~19.8 MB |
| 10,000 | 100k | ~153.6 MB | ~20.4 MB | ~307.2 MB | ~39.6 MB |

The quantized index is **single-digit to low-tens of MB** even at 10k files. Add the `specs.content` text (FTS5 index is contentless/small, but the `content` column holds ~10–15 KB/file → ~30–150 MB) for total DB size.

### RAM (resident set, serving)

Fixed costs dominate and are **nearly flat across all three scales**:

- sqlite-vector extension baseline: **~30 MB** (vendor default).
- SQLite page cache (local-search sets 32 MB, `code/db/schema.go:90-105`): **~32 MB**.
- Go runtime + binary: **~15–30 MB**.
- Preloaded quantized index (`vector_quantize_preload`): **4–40 MB** (per table above).
- Embedding model **if loaded in-process** to embed queries: MiniLM **+150–300 MB**; bge-base **+0.6–1.0 GB**.

| Configuration | 2,000 | 5,000 | 10,000 |
|---|---|---|---|
| Offline embedding (no model resident) | ~90 MB | ~100 MB | ~120 MB |
| MiniLM in-process | ~280 MB | ~290 MB | ~320 MB |
| bge-base in-process | ~0.8–1.1 GB | ~0.8–1.1 GB | ~0.9–1.1 GB |

**Key point:** RAM is driven by fixed costs (extension + page cache + embedding model), **not** by file count — going 2k→10k adds only a few MB of index. The model choice dwarfs the vector data.

### CPU — query (search) time

Brute-force/quantized scan is O(rows). The vendor benchmark runs **1M×768 in "a few ms"**; the largest scenario here (100k rows) is ~10% of that. Estimated per-query scan: **well under 1–2 ms, single core**, at all three scales. Even exact `vector_full_scan` is comfortable (its stated guidance is "rows < 1,000,000"). **Query CPU is negligible and not the bottleneck.**

### CPU — indexing (embedding generation) time, one-time full build

This is the **only** meaningful CPU cost. Throughput ranges are sourced (MiniLM ~300–1,300 emb/s batched; bge-base ~3–5 docs/s ≈ chunks/s on a 6-core desktop, higher on many-core Xeon with int8):

| Files | Rows | MiniLM (384d) | bge-base (768d) |
|---|---|---|---|
| 2,000 | 20k | ~20–70 s | ~11–67 min |
| 5,000 | 50k | ~50 s–3 min | ~28 min–2.8 h |
| 10,000 | 100k | ~1.5–5.5 min | ~56 min–5.6 h |

- **Quantization** (`vector_quantize`, TurboQuant) is data-oblivious (no training): a single linear pass, **sub-second to a few seconds** even at 100k rows — negligible vs embedding.
- Indexing is **one-time**; local-search's `IncrementalScan` (`code/db/index.go:186-352`) re-embeds only changed files, so steady-state updates are **seconds**.

### Bottom line

At 2k–10k PRD files, **RAM (~90 MB offline / ~300 MB with MiniLM) and query CPU (<2 ms) are trivial and essentially flat**. The entire cost story is **one-time embedding generation**: MiniLM makes it a 1–6 minute job; bge-base on CPU turns it into tens of minutes to hours. TurboQuant's contribution is shrinking the index to tens of MB and keeping scans sub-millisecond — it does not affect the embedding cost, which is the real budget.

## Can a user install the CLI and use TurboQuant?

**Not with the CLI as it ships today — it would require re-architecting the build and distribution.**

### Why not today

- Current distribution is **pure-Go static binaries**: `Makefile` `build-all` is plain `GOOS/GOARCH go build` with no CGO (`code/Makefile:11-16`); `code/dist/` holds 5 self-contained binaries; `install.sh` downloads exactly one static binary per platform (`install.sh:54-62`).
- That binary uses `modernc.org/sqlite` (pure Go), which **cannot load a native `.so`/`.dylib`/`.dll`** — no `dlopen`, no `LoadExtension`. So an installed current CLI has **no way to load `vector.*` and therefore no TurboQuant**.

### What it would take

1. **CGO rebuild** — switch to `mattn/go-sqlite3`, build with `CGO_ENABLED=1` + a C compiler. This loses the "cross-compile anywhere, no toolchain" property (`code/README.md:249`); each of the 5 dist targets now needs a matching C toolchain to build.
2. **Bundle the native extension** — ship the correct `vector.{so,dylib,dll}` per platform/arch beside the binary (or embed and extract at first run). SQLiteAI publishes darwin arm64/x86_64, linux x86_64/arm64, and windows x86_64 — which happens to cover all five of local-search's current dist targets.
3. **Extend `install.sh`** — additionally fetch the matching `vector-<os>-<arch>-1.0.0.tar.gz` from SQLiteAI releases, extract the library next to the binary, and on **macOS clear Gatekeeper quarantine** (`xattr -d com.apple.quarantine vector.dylib`) or the load is blocked.
4. **License clearance** — `sqlite-vector` is **Elastic License 2.0**; distributing it inside a freely-installed product is production use and requires a **commercial license** from SQLite Cloud, Inc.

### Once loaded, TurboQuant itself is trivial

TurboQuant is not a separate install — it is a built-in mode of the extension, invoked purely in SQL: `SELECT vector_quantize('specs','embedding','qtype=TURBO,qbits=4')`. So the entire difficulty is **getting the native extension into the user's install**; using TurboQuant after that is a one-line option string.

## Historical Context
- No `.uncle-dev/learns/` directory exists in this project (`ls .uncle-dev/learns/` → empty/not present), so there is no captured prior knowledge to reconcile against these findings.
- The only prior in-repo document on this space is the same-day companion `2026-07-18-sqlite-graph-vector-search.md`, which documented the **pure-Go** alternative. The two are consistent: that doc's route keeps CGO-free; this doc's route (SQLiteAI `sqlite-vector`) requires CGO.

## Corrections to the original prompt (documented, since this records what IS)
1. `vector_encode`, `vector_search`, `vector_distance` — **do not exist**. Use `vector_as_f32('[...]')` to encode and `vector_quantize_scan(...)` / `vector_full_scan(...)` to search; distance is a column returned by those scans and a `vector_init` option.
2. Release assets are **per-platform tar.gz/zip archives**; `vector.so/.dylib/.dll` are the libraries *inside* them.
3. "~30MB" is the **extension baseline default**, not TurboQuant's footprint; TurboQuant storage follows `rows * (8 + 4 + ceil(dim*qbits/8))`.
4. `sqlite-vector` is **Elastic License 2.0**, not permissive OSS — relevant to shipping it in a distributed binary.

## Open Questions
1. **CGO trade** — is abandoning the pure-Go / no-C-toolchain property (the README's headline selling point) acceptable for the vector gain, versus the CGO-free `modernc.org/sqlite/vec` route in the companion doc?
2. **License** — does Elastic License 2.0 fit the intended distribution of `local-search` (production use would require a commercial license)?
3. **Corpus size** — for the low-thousands-of-docs corpora this tool targets, is exact `vector_full_scan` already sufficient, making TurboQuant's approximate scan unnecessary?
4. **Embedding source** — same open question as the companion doc: local model vs external/opt-in generation, since that is the only real CPU cost.

## Sources (external)
- [sqliteai/sqlite-vector — README](https://github.com/sqliteai/sqlite-vector/blob/main/README.md) (storage model, 30MB default, recall/speedup tables, license, distribution)
- [sqliteai/sqlite-vector — API.md](https://raw.githubusercontent.com/sqliteai/sqlite-vector/main/API.md) (function signatures, distance metrics, types)
- [sqliteai/sqlite-vector — QUANTIZATION.md](https://github.com/sqliteai/sqlite-vector/blob/main/QUANTIZATION.md) (TurboQuant invocation, storage formula, qbits guidance)
- [TurboQuant paper — arXiv:2504.19874](https://arxiv.org/abs/2504.19874)
- [mattn/go-sqlite3 — README + LoadExtension](https://github.com/mattn/go-sqlite3) ; [_example/mod_regexp/extension.go](https://raw.githubusercontent.com/mattn/go-sqlite3/master/_example/mod_regexp/extension.go)
- [modernc.org/sqlite — pkg.go.dev](https://pkg.go.dev/modernc.org/sqlite) (no LoadExtension; pure-Go)
- [SQLite Run-Time Loadable Extensions](https://sqlite.org/loadext.html) ; [load_extension C ref](https://sqlite.org/c3ref/load_extension.html)

## Code References
- `code/go.mod:5` — `modernc.org/sqlite v1.48.0` (pure Go; the pin that would change).
- `code/README.md:34`, `:249` — "no CGO, no C toolchain" claims that `sqlite-vector` would invert.
- `code/db/schema.go:12-77`, `:80-108` — schema + `Open`; where a `BLOB` column and `vector_init` land.
- `code/db/index.go:32-178`, `:186-352`, `:557-660` — insert funnel; where encode/quantize/preload passes attach.
- `code/db/query.go:29-73` — FTS5 BM25 search; where a `vector_quantize_scan` JOIN fuses in.
- `code/graph/graph.go:226-246` — existing `CentralityBoost`; precedent for blending a second signal into BM25.
