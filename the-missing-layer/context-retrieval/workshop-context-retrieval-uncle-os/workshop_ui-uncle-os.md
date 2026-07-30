# Workshop — Local Context & Context Retrieval

**Date:** 2026-07-30

**Duration:** 90 minutes (5 modules + wrap)

**Audience:** engineers, product owners, tech leads who work with coding agents

**Format:** live demo, facilitator drives, participants follow along on their own repo

> Sources this workshop documents:
> 
> `.devlocal/local-context/local-context-strategy.md`,
> 
> `local-context-01.md`, `local-context-02.md`,
> 
> `local-context-process-01.md`, `context-retrieval-process.md`,
> 
> plus the verified behaviour of `local-search` 0.3.14, `graphify` 0.9.26,
> 
> and `company-os` (`company-os-starter/`).

## 0. Intro: The Big Picture

### 🎯 Objective

Understand the fundamental differences between strategy, process, and tools to frame the entire workshop correctly.

There are **four things** in this workshop and they are not competitors. Everyone confuses them, so name the difference out loud before touching a terminal:

|   |   |   |
|---|---|---|
|**Concept**|**Question it answers**|**Artifact**|
|**Local Context Strategy**|_Where does the truth physically live, and is my copy still valid?_|local copies + validity metadata|
|**Context Retrieval Process**|_How do I go from a task to the right context?_|the workflow itself — not a tool|
|**Local Search**|_What does the platform do, and why?_|specs, PRDs, reality docs, ADRs|
|**Graphify**|_How is it implemented, and what does it touch?_|code graph, EXTRACTED + INFERRED edges|
|**Company OS / Team OS**|_Who owns it, what governs it, is it current?_|governance, ownership, lifecycle|

### 🧠 Key Concepts

**1. The Core Philosophy**

> "The Context Retrieval Process describes the complete flow rather than a specific technology. Local Search and Graphify are **complementary**, not alternatives — Graphify does not replace Local Search, it grounds it."

**Facilitator note:** If participants leave believing "Graphify is a better grep" or "Local Search is a worse RAG", the workshop failed. The point is the _order_ of the four moves.

### 💻 Demo Scenario: Pre-flight Checklist (10 min)

```
# 1. Check Tools
local-search version          # expect: >= 0.3.14
graphify --version            # expect: >= 0.9.26
company-os --version

# 2. Install missing
curl -fsSL https://raw.githubusercontent.com/metuur-ai/local-search/main/install.sh | bash

# 3. Company OS binary
cd company-os-starter && make install && export PATH="$HOME/.local/bin:$PATH"
```

## Module 1: Local Context Strategy

### 🎯 Objective

Understand why MCP is an acquisition mechanism (not a query mechanism), recognize the 8 benefits of local context, and identify the risks of staleness.

### 📊 Architecture Map

```
                        THE CONTEXT ACQUISITION FLOW

+-------------------+       SYNC LAYER       +------------------------+
|    [GitHub MCP]   | ---------------------> |      [Local Workspace] |
|   Remote Source   |                        |   Materialized Copy    |
| (GitHub, Wiki)    |                        |   (⚠️ Staleness Risk)  |
+-------------------+                        +------------------------+
                                                         |
                                                         | LOCAL SEARCH
                                                         v
                                             +------------------------+
                                             |      [Query Index]     |
                                             |  FTS5 + Code Graphs    |
                                             +------------------------+
```

**Terminal Demo View:**

```
bash ~ local-search repo list

NAME                  ADDED  LAST SCAN  LAST UPDATE  COMMIT    GRAPH
team-os-example-repo  8d     7d         —            —         —
uncle-os              7d     7d         9m           d6a799e   —
squirrel              6d     6d         5d           18d1075   graphify
foyer-platform        6d     6d         —            1133104   —
```

### 🧠 Key Concepts

**1. The Core Decision: Keep Context Local**

To effectively use context for AI agents and human discovery, information must be available on the local file system. While tools like GitHub MCP (Model Context Protocol) are excellent, they act as an intermediate layer that can limit retrieval, apply opaque filters, or fail during connectivity issues.

**Our Principle:** MCP is an _acquisition_ mechanism, not the final _query_ mechanism. Pull context down; query locally.

**2. The Pitfalls of Git Submodules**

A common initial thought is to use Git submodules to link distributed documentation into a single workspace. However, for a context retrieval system, submodules introduce severe limitations:

- **No Directory-Level Selection:** Submodules force you to pull an _entire_ repository (source code, pipelines, massive assets) even if you only need a single `docs/specs/` folder.
    
- **Rigid Version Dependencies:** The parent workspace stores a hardcoded reference to a specific commit. Changes aren't updated automatically.
    
- **Operational Complexity:** Submodules are notoriously difficult to manage. Branch handling is confusing, and pipelines must be heavily customized.
    
- **Context Dilution:** AI agents can easily get confused by a massive, nested code structure, interpreting it as part of a single physical repository.
    
    **Our Stance:** Submodules should be reserved for strict, versioned code dependencies—not used as a general mechanism to assemble a knowledge workspace.
    

**3. The Solution: Partial Materialization**

Instead of submodules, we use a **Synchronization Layer** (potentially powered by GitHub MCP) to _materialize_ only the necessary documentation directories locally.

This avoids Git complexity, keeps the workspace lightweight, and provides agents with exactly the context they need. Local Search indexes what is on disk, while the separate sync layer manages the original sources.

**4. The Risk Nobody Plans For: Staleness**

Notice the missing data in the terminal above? There are 5 failure cases for staleness:

|   |   |   |
|---|---|---|
|**Case**|**What happened**|**Symptom**|
|**1**|Remote source updated, local copy old|Agent answers with last quarter's design.|
|**2**|Local copy updated, index old|Search misses a file that exists on disk.|
|**3**|**Partial update (Worst case)**|Half the answer is current, half isn't.|
|**4**|Wrong branch|Coherent answer, but about a reverted feature.|
|**5**|Materialized copy w/o provenance|You can't even tell which of 1-4 you're in.|

**The 7 states to classify any repo:** up to date · update available · pending scan · unknown origin · unverifiable · outdated · partially synchronized · modified locally.

### 💻 Demo Scenario

Run `local-search repo list`. Point at the LAST UPDATE and COMMIT columns showing '—' for `foyer-platform` and `team-os-example-repo`. Ask the room: _Is this context valid?_ Checkpoint: ensure every participant can say which of the 7 states their repos are in.

## Module 2: Generating Local Context

### 🎯 Objective

Generate and securely bind high-level platform requirements (PRDs) with low-level component behavior derived from code using grep-able @spec markers.

### 📊 Architecture Map

```
                       TRACEABILITY HIERARCHY

+------------------------------------------------------------------+
| [Platform Level (PRD / EARS Clause)]                             |
| Every inbound call without a verifiable token is rejected        |
| ID: req://identity/token-verification@1.0#R1                     |
+------------------------------------------------------------------+
                                |
                                v
+------------------------------------------------------------------+
| [Component Level (Reverse Engineered)]                           |
| Identity Service / Token Validator                               |
| ID: req://identity/token-verification@1.0                        |
+------------------------------------------------------------------+
                                |
                                v
+------------------------------------------------------------------+
| [Code Level Specifics (@spec Binding)]                           |
| def test_rejects_unverified_token():                             |
| Tag: @spec req://identity/token-verification@1.0#R1              |
+------------------------------------------------------------------+
```

### 🧠 Key Concepts

**1. Two Levels That Must Stay Connected**

**Platform Context** (what it does/PRDs) vs **Component Context** (what the code actually does). The gap between them is where every stale-doc incident lives.

**2. The Strict PRD Lifecycle**

- A PRD may only be opened from a brief that is `status: validated`, and it copies that brief's Problem/Success sections forward.
    
- The done-gate refuses closure if the component's reality doc has an `updated:` date older than the PRD's `created:` date. **A change is done only when reality is updated.**
    

**3. The Binding: @spec Markers**

Code repos are NOT modeled by the Company OS CLI. The binding back to governance relies purely on grep-able `@spec` markers tying tests to EARS clauses.

```
# @spec req://payments/settlement-finality@1.0#R2
def test_duplicate_payment_order_is_screened_once():
    ...
```

### 💻 Demo Scenario

**Demo the lifecycle:**

```
cd examples/workspace
company-os discover new --team customer-engagement "Same-day pickup"
company-os discover validate --team customer-engagement <brief-id>
company-os prd new --team customer-engagement --platform communications --components customer-notification-service --from-discovery <brief-id>
```

_Try to close a PRD before touching the reality doc, and let the gate fail._

Show Graphify AST extraction: `graphify .`

Show grep working everywhere forever: `grep -rn "@spec req://" examples/banking/`

## Module 3: Local Search Retrieval

### 🎯 Objective

Understand the overarching Context Retrieval Process and learn when to route queries to Local Search versus Graphify.

### 📊 Architecture Map

```
                     LOGICAL AGGREGATION LAYER

    [payment-specs/]      [account-specs/]     [platform-reality/]
           \                     |                     /
            \                    |                    /
             \                   v                   /
              +-------------------------------------+
              |        LOCAL SEARCH ENGINE          |
              |  (Unified SQLite & Vector Database) |
              +-------------------------------------+
              | Query: "declined payment flow"      |
              +-------------------------------------+
```

**Command Comparison:**

- **`search "<q>"`:** Hybrid FTS5 + BM25. Scope: Specs only. Use for: Quick keyword lookups.
    
- **`find "<q>" --scope <repo>`:** Unified scoped search. Scope: Specs AND Code Graphs. Use for: Comprehensive analysis.
    

### 🧠 Key Concepts

**1. What 'Hybrid FTS5 + BM25' Actually Means**

- **FTS5 (The Source):** SQLite's full-text search. No daemon, no network. It's an inverted index on disk.
    
- **BM25 (The Ranking):** Scores documents based on term frequency with saturation, inverse document frequency (IDF), and length normalisation.
    
- **Hybrid:** Blends keyword score with structural signals (centrality in code graph) and embedding scores (`--semantic`).
    

**2. The Search vs Find Trap**

These are not aliases. `search` looks across specs globally. `find --scope` unifies specs + code graph for a specific repository. They even read different scope config files (`.local-search.toml` vs `init --json` resolution).

**3. Wiring into Claude**

Install via `local-search install-skill`. The skill dynamically resolves scope using `init --json` before queries, ensuring agents search exactly what your CLI does. There is **no MCP server** here by deliberate design.

### 💻 Demo Scenario

Run `local-search search "knowledge catalog sync" --repos uncle-os` and point out `[source=fts · rank=bm25 · repos=1 (0 with graphs)]`.

Then show the difference with `local-search find "same-day pickup" --scope moonbeam-os`.

## Module 4: Reaching for Graphify

### 🎯 Objective

Understand the Context Retrieval Orchestration decision matrix and the critical difference between EXTRACTED and INFERRED edges.

### 📊 Architecture Map

```
                  CONTEXT RETRIEVAL ORCHESTRATION

                    [ Agent Task: Update retry logic ]
                                    |
           +------------------------+------------------------+
           |                                                 |
           v                                                 v
+--------------------------+                      +--------------------------+
|       LOCAL SEARCH       |                      |         GRAPHIFY         |
|    (The "What & Why")    |                      |   (The "How & Where")    |
|                          |                      |                          |
| - Business rules         |                      | - Call graphs            |
| - PRDs & ADRs            |                      | - Code dependencies      |
+--------------------------+                      +--------------------------+
           |                                                 |
           +------------------------+------------------------+
                                    |
                                    v
                    +-------------------------------+
                    |         SAFE EXECUTION        |
                    | (Correlated Context Delivered)|
                    +-------------------------------+
```

**The Query Routing Table:**

|   |   |
|---|---|
|**The Question**|**First Tool**|
|What does the platform do / why?|**Local Search**|
|Where is X defined / how does X work?|`graphify explain "X"`|
|How does X relate to Y?|`graphify path "X" "Y"`|
|What touches the auth flow?|`graphify query "<q>"`|
|Give me the architecture overview|read `GRAPH_REPORT.md`|
|Who owns this / what governs it?|**Company OS / Team OS**|

### 🧠 Key Concepts

**1. The Context Retrieval Process**

No single retrieval engine understands the entire platform. The Context Retrieval Process is the overarching architectural layer that orchestrates different specialized engines to build a complete view across Company OS, Platform OS, Team OS, and Personal OS.

**2. Local Search: The "What" and "Why"**

- **Primary Responsibility:** Retrieve functional and business knowledge stored in documentation.
    
- **Use Cases:** Platform reality, domain knowledge, business rules, ADRs, PRDs.
    
- **Example Query:** _"What are the business rules for validating a funding source?"_
    

**3. Graphify: The "How"**

- **Primary Responsibility:** Retrieve implementation knowledge directly from the source code.
    
- **Use Cases:** Repository structure, call graphs, module dependencies, API events.
    
- **Example Query:** _"Which specific microservices consume the PaymentDeclined event, and what database tables do they update?"_
    

**4. Context Correlation**

The magic happens when agents combine both. An agent receives a task, queries Local Search to understand the business requirement, queries Graphify to find exactly where that logic lives in the codebase, and correlates the two to execute the task safely.

`Local Search (Business Logic) + Graphify (Source Code) -> Safe Execution (Correlated Context)`

### 💻 Demo Scenario

`cd ~/others/metuur/adhd/squirrel` (the repo with GRAPH = graphify).

Run `graphify explain "task capture"` and `graphify path "InboxItem" "Notification"`.

View the god nodes: `head -60 graphify-out/GRAPH_REPORT.md`.

## Module 5: Company OS & Team OS as the retrieval substrate

### 🎯 Objective

Implement the synchronization layer to resolve staleness and map cross-domain knowledge using Canonical IDs and Tags via Company OS.

### 📊 Architecture Map

```
                  COMPANY OS ARCHITECTURE & SYNC LAYER

[ Remote Repo ]                 [ company-os workspace sync ]               [ knowledge/ dir ]
acme/component-library ------>      PIN: v1.2.0                  -------->  Materialized Slices
(github MCP)                        ALLOWLIST: paths                        Read-Only (0444) [👁️]

--------------------------------------------------------------------------------------------------
The Correlation Layer:

[ Frontmatter IDs ]  ----(graph build)---->  [ #tags & links ]
(canonical)                                  (derived & composable)
```

**YAML Config:**

```
# workspace.yaml
repos:
  - name: component-library
    url: https://github.com/acme/...
    pin: {tag: v1.2.0} # Prevents drift
    slices:
      - {paths: [docs/sdd], localDirectory: knowledge/components/..}
```

### 🧠 Key Concepts

**1. What each OS layer contributes**

- `company-os/standards/`: baseline controls applied to everything.
    
- `platforms/<p>/`: component descriptors, requirements, **reality**, active PRDs.
    
- `teams/<t>/`: ownership, exceptions, discovery, DoR/DoD.
    
- `company-ontology/`: canonical IDs — the vocabulary everything refers to.
    

**2. The `knowledge/` Sync Layer**

This is the direct answer to Module 1's staleness problem. It uses an explicit pin and an **allowlist** of paths to materialize read-only slices (`0444`). Gate `[8/8]` fails on any hand-edit or un-synced slice change. **Never edit a synced file. Fix it upstream.**

**3. IDs, Tags, and Composition**

IDs are canonical (e.g., `capability://`). Tags and wikilinks are strictly derived by `company-os graph build`. You can compose searches across teams, tiers, and capabilities entirely via derived tags.

### 💻 Demo Scenario

Demonstrate `company-os workspace status` to report drift.

Show a composability search: `tag:#component/notification-service -tag:#status/completed`.

Show retrieval scoped to a person: `company-os today --role developer`.

## Wrap: The Retrieval Sequence

### 🎯 Objective

Summarize the 7-step sequence for manual or agentic context retrieval.

### 🧠 Key Concepts

**The 7-Step Sequence**

1. **Is context fresh?** `company-os workspace status` or `local-search repo list`
    
2. **What & why?** `local-search search` (specs) or `find --scope` (unified)
    
3. **How is it built?** `graphify explain / path / query`
    
4. **Who owns it?** `company-os governance explain <component>`
    
5. **Is it satisfied?** `grep -rn "@spec req://..."`
    
6. **Act.** (Execute task)
    
7. **Leave it current.** `graphify update .` and `company-os graph build`
    

**Facilitator Safety Net**

- **Why not MCP?** Auth, compatibility, permissions. MCP = acquisition. Local = query.
    
- **Edit in knowledge/?** No. 0444 read-only. Fix upstream.
    
- **No graphify-out?** Use the pre-built `squirrel` repo demo.
    

### 💻 Demo Scenario

Distribute the 7-step sequence. Deliver the closing line: _"The different OS layers organize knowledge; the Context Retrieval Process is the mechanism that finds it and puts it into context to solve a task."_