# Context Architecture Workshop

## Intro: The Big Picture

### 🎯 Objective

Understand the fundamental differences between strategy, process, and tools to frame the entire workshop correctly.

### 📊 Architecture Map

|   |   |   |
|---|---|---|
|**Concept**|**Question it answers**|**Artifact**|
|**Local Context Strategy**|_Where does the truth physically live, and is my copy still valid?_|`local copies + validity metadata`|
|**Context Retrieval Process**|_How do I go from a task to the right context?_|the workflow itself — not a tool|
|**Local Search**|_What does the platform do, and why?_|specs, PRDs, reality docs, ADRs|
|**Graphify**|_How is it implemented, and what does it touch?_|`code graph, EXTRACTED + INFERRED edges`|
|**Company OS / Team OS**|_Who owns it, what governs it, is it current?_|governance, ownership, lifecycle|

### 🧠 Key Concepts

#### 1. The Core Philosophy

> "The Context Retrieval Process describes the complete flow rather than a specific technology. Local Search and Graphify are **complementary**, not alternatives — Graphify does not replace Local Search, it grounds it."

⚠️ **Facilitator note:** If participants leave believing "Graphify is a better grep" or "Local Search is a worse RAG", the workshop failed. The point is the _order_ of the four moves.

### 💻 Demo Scenario

**Pre-flight Checklist (10 min):**

```
# 1. Check Tools
local-search version       # expect: >= 0.3.14
graphify --version         # expect: >= 0.9.26

# 2. Install missing
curl -fsSL https://raw.githubusercontent.com/metuur-ai/local-search/main/install.sh | bash

# 3. Pre-build Graphify demo graph (NOT on stage)
cd <demo-repo> && graphify .
```

## Module 1: Local Context Strategy

### 🎯 Objective

Understand why MCP is an acquisition mechanism (not a query mechanism), recognize the 8 benefits of local context, and identify the risks of staleness.

### 📊 Architecture Map

**The Context Acquisition Flow**

1. **Remote Source** (GitHub, Wiki, etc.)
    
    → _SYNC LAYER_ →
    
2. **Local Workspace** (Materialized Copy) ⚠️ _Staleness Risk_
    
    → _LOCAL SEARCH_ →
    
3. **Query Index** (FTS5 + Code Graphs)
    

**Terminal Demo View:**

```
bash ~ local-search repo list

NAME                  ADDED  LAST SCAN  LAST UPDATE  COMMIT    GRAPH
platform-example-repo 8d     7d         —            —         —
docs-workspace        7d     7d         9m           d6a799e   —
squirrel              6d     6d         5d           18d1075   graphify
foyer-platform        6d     6d         —            1133104   —
```

### 🧠 Key Concepts

#### 1. The Constraint That Starts Everything

Agents cannot always use MCP servers freely due to environment limits, compatibility, auth, or permissions. Thus, **MCP is an acquisition mechanism, not necessarily the final query mechanism.** Pull context down; query locally.

#### 2. The Risk Nobody Plans For: Staleness

Notice the missing data in the terminal above? There are 5 failure cases for staleness:

|   |   |   |
|---|---|---|
|**Case**|**What happened**|**Symptom**|
|**1**|Remote source updated, local copy old|Agent answers with last quarter's design.|
|**2**|Local copy updated, index old|Search misses a file that exists on disk.|
|**3**|**Partial update (Worst case)**|Half the answer is current, half isn't.|
|**4**|Wrong branch|Coherent answer, but about a reverted feature.|
|**5**|Materialized copy w/o provenance|You can't even tell which of 1-4 you're in.|

#### 3. Division of Responsibility

Local Search indexes what is on disk and is honest about when it last looked. It is **not** responsible for syncing your copies or maintaining original sources. A separate sync layer is required for materialization.

### 💻 Demo Scenario

Run `local-search repo list`. Point at the LAST UPDATE and COMMIT columns. Ask the room: _Is this context valid?_ Checkpoint: ensure every participant can say which of the 7 states (up to date, outdated, unknown origin, etc.) their repos are in.

## Module 2: Generating Local Context

### 🎯 Objective

Generate and securely bind high-level platform requirements (PRDs) with low-level component behavior derived from code using grep-able `@spec` markers.

### 📊 Architecture Map

**Traceability Hierarchy:**

1. **Platform Level (PRD / EARS Clause):** Every inbound call without a verifiable token is rejected.
    
    ↳ `req://identity/token-verification@1.0#R1`
    
2. **Component Level (Reverse Engineered):** Identity Service / Token Validator
    
    ↳ `req://identity/token-verification@1.0`
    
3. **Code Level Specifics (@spec Binding):** `def test_rejects_unverified_token():`
    
    ↳ `@spec req://identity/token-verification@1.0#R1`
    

### 🧠 Key Concepts

#### 1. Two Levels That Must Stay Connected

**Platform Context** (what it does/PRDs) vs **Component Context** (what the code actually does). The gap between them is where every stale-doc incident lives.

#### 2. The Strict PRD Lifecycle

- A PRD may only be opened from a brief that is `status: validated`.
    
- The done-gate refuses closure if the component's reality doc has an `updated:` date older than the PRD's `created:` date. **A change is done only when reality is updated.**
    

#### 3. The Binding: @spec Markers

Code repos are NOT modeled by the docs pipeline. The binding back to governance relies purely on grep-able `@spec` markers tying tests to EARS clauses.

```
# @spec req://payments/settlement-finality@1.0#R2
def test_duplicate_payment_order_is_screened_once():
    ...
```

### 💻 Demo Scenario

**Demo the refusal.** Try to close a PRD before touching the reality doc, and let the gate fail.

Show Graphify AST extraction: `graphify .`

Show grep working everywhere forever: `grep -rn "@spec req://" examples/banking/`

## Module 3: Local Search Retrieval

### 🎯 Objective

Understand the overarching Context Retrieval Process and learn when to route queries to Local Search versus Graphify.

### 📊 Architecture Map

**Logical Aggregation Layer:**

`payment-specs/` + `account-specs/` + `platform-reality/`

↳ **Local Search Engine** (Unified SQLite & Vector Database)

↳ Query: `"declined payment flow"`

**Command Comparison:**

- `search "<q>"`
    
    - Hybrid FTS5 + BM25
        
    - Scope: Specs only
        
    - Use for: Quick keyword lookups
        
- `find "<q>" --scope <repo>`
    
    - Unified scoped search
        
    - Scope: Specs AND Code Graphs
        
    - Use for: Comprehensive analysis
        

### 🧠 Key Concepts

#### 1. What 'Hybrid FTS5 + BM25' Actually Means

- **FTS5 (The Source):** SQLite's full-text search. No daemon, no network. It's an inverted index on disk.
    
- **BM25 (The Ranking):** Scores documents based on term frequency with saturation, inverse document frequency (IDF), and length normalisation.
    
- **Hybrid:** Blends keyword score with structural signals (centrality in code graph) and embedding scores (`--semantic`).
    

#### 2. The Search vs Find Trap

These are not aliases. `search` looks across specs globally. `find --scope` unifies specs + code graph for a specific repository. They even read different scope config files (`.local-search.toml` vs `init --json` resolution).

#### 3. Wiring into Claude

Install via `local-search install-skill`. The skill dynamically resolves scope using `init --json` before queries, ensuring agents search exactly what your CLI does. There is **no MCP server** here by deliberate design.

### 💻 Demo Scenario

Run `local-search search "same-day pickup"` and point out `[source=fts · rank=bm25 · repos=1 (0 with graphs)]`.

Then show the difference with `local-search find "same-day pickup" --scope moonbeam-os`.

## Module 4: Reaching for Graphify

### 🎯 Objective

Understand the Context Retrieval Orchestration decision matrix and the critical difference between EXTRACTED and INFERRED edges.

### 📊 Architecture Map

**Context Retrieval Orchestration**

_Agent Task: Update retry logic_

- **Local Search (The "What & Why")**: Business rules, PRDs & ADRs
    
- **Graphify (The "How & Where")**: Call graphs, Code dependencies
    
    ↳ Combined together they deliver **Safe Execution (Correlated Context Delivered)**.
    

**The Query Routing Table**

|   |   |
|---|---|
|**The Question**|**First Tool**|
|What does the platform do / why?|**Local Search**|
|Where is X defined / how does X work?|`graphify explain "X"`|
|How does X relate to Y?|`graphify path "X" "Y"`|
|What touches the auth flow?|`graphify query "<q>"`|
|Give me the architecture overview|read `GRAPH_REPORT.md`|
|Who owns this / what governs it?|**Governed docs layer**|

### 🧠 Key Concepts

#### 1. The Context Retrieval Process

No single retrieval engine understands the entire platform. The Context Retrieval Process is the overarching architectural layer that orchestrates different specialized engines to build a complete view across Company OS, Platform OS, Team OS, and Personal OS.

#### 2. Local Search: The "What" and "Why"

- **Primary Responsibility:** Retrieve functional and business knowledge stored in documentation.
    
- **Use Cases:** Platform reality, domain knowledge, business rules, ADRs, PRDs.
    
- **Example Query:** _"What are the business rules for validating a funding source?"_
    

#### 3. Graphify: The "How"

- **Primary Responsibility:** Retrieve implementation knowledge directly from the source code.
    
- **Use Cases:** Repository structure, call graphs, module dependencies, API events.
    
- **Example Query:** _"Which specific microservices consume the PaymentDeclined event, and what database tables do they update?"_
    

#### 4. Context Correlation

The magic happens when agents combine both. An agent receives a task, queries Local Search to understand the business requirement, queries Graphify to find exactly where that logic lives in the codebase, and correlates the two to execute the task safely.

**Equation:** `Local Search (Business Logic) + Graphify (Source Code) -> Safe Execution (Correlated Context)`

### 💻 Demo Scenario

`cd ~/others/metuur/adhd/squirrel` (the repo with GRAPH = graphify).

Run `graphify explain "task capture"` and `graphify path "InboxItem" "Notification"`.

View the god nodes: `head -60 graphify-out/GRAPH_REPORT.md`.

## Module 5: Governed Docs Layer - WIP PoC

### 🎯 Objective

Implement the synchronization layer to resolve staleness and map cross-domain knowledge using Canonical IDs and Tags.

### 📊 Architecture Map

```
# workspace.yaml
version: 1
repos:
  - name: component-library
    pin: {tag: v1.2.0} # Prevents branch drift
    slices:
      - {paths: [docs/sdd], localDirectory: knowledge/components/..}
```

### 🧠 Key Concepts

#### 1. The `knowledge/` Sync Layer

This is the direct answer to Module 1's staleness problem. It uses an explicit pin (tag) and an **allowlist** of paths to materialize read-only slices (`0444`). Gate `[8/8]` fails on any hand-edit or un-synced slice change.

#### 2. Indexed, Not Governed

Foreign docs in `knowledge/` carry no frontmatter IDs and skip validate gates 1-7. If you want a document governed, it belongs in a platform or team root, not the catalog.

#### 3. IDs, Tags, and Composition

IDs are canonical (e.g., `capability://`). Tags are strictly derived by `graph build`. You can compose searches across teams, tiers, and capabilities entirely via derived tags.

### 💻 Demo Scenario

Demonstrate `workspace status` to report pin/slice-set drift. Show a composability search: `tag:#component/notification-service -tag:#status/completed`

## Wrap: The Retrieval Sequence

### 🎯 Objective

Summarize the 7-step sequence for manual or agentic context retrieval.

### 🧠 Key Concepts

#### The 7-Step Sequence

1. **Is context fresh?** `workspace status` or `local-search repo list`
    
2. **What & why?** `local-search search` (specs) or `find --scope` (unified)
    
3. **How is it built?** `graphify explain / path / query`
    
4. **Who owns it?** `governance explain <component>`
    
5. **Is it satisfied?** `grep -rn "@spec req://..."`
    
6. **Act.** (Execute task)
    
7. **Leave it current.** `graphify update .` and `graph build`
    

#### Facilitator Safety Net

- **Why not MCP?** Auth, compatibility, permissions. MCP = acquisition. Local = query.
    
- **Edit in knowledge/?** No. 0444 read-only. Fix upstream.
    
- **No graphify-out?** Use the pre-built `squirrel` repo demo.
    

### 💻 Demo Scenario

Distribute the 7-step sequence. Deliver the closing line: _"The governed layers organize knowledge; the Context Retrieval Process is the mechanism that finds it and puts it into context to solve a task."_