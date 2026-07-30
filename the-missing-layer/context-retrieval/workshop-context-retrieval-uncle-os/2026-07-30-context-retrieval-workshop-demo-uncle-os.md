# Workshop — Local Context & Context Retrieval

**Date:** 2026-07-30
**Duration:** 90 minutes (5 modules + wrap)
**Audience:** engineers, product owners, tech leads who work with coding agents
**Format:** live demo, facilitator drives, participants follow along on their own repo

> Sources this workshop documents:
> `.devlocal/local-context/local-context-strategy.md`,
> `local-context-01.md`, `local-context-02.md`,
> `local-context-process-01.md`, `context-retrieval-process.md`,
> plus the verified behaviour of `local-search` 0.3.14, `graphify` 0.9.26,
> and `company-os` (`company-os-starter/`).

---

## 0. The one slide that frames everything

There are **four things** in this workshop and they are not competitors.
Everyone confuses them, so name the difference out loud before touching a
terminal:

| | Question it answers | Artifact |
|---|---|---|
| **Local Context Strategy** | *Where does the truth physically live, and is my copy still valid?* | local copies + validity metadata |
| **Context Retrieval Process** | *How do I go from a task to the right context?* | the workflow itself — not a tool |
| **Local Search** | *What does the platform do, and why?* | specs, PRDs, reality docs, ADRs |
| **Graphify** | *How is it implemented, and what does it touch?* | code graph, EXTRACTED + INFERRED edges |
| **Company OS / Team OS** | *Who owns it, what governs it, is it current?* | governance, ownership, lifecycle |

The line from `context-retrieval-process.md` worth reading aloud:

> The Context Retrieval Process describes the complete flow rather than a
> specific technology. Local Search and Graphify are **complementary**, not
> alternatives — Graphify does not replace Local Search, it grounds it.

**Facilitator note:** if participants leave believing "Graphify is a better
grep" or "Local Search is a worse RAG", the workshop failed. The point is the
*order* of the four moves.

---

## Pre-flight (do this before the room fills — 10 min)

```bash
# 1. Tools
local-search version          # expect: local-search version 0.3.14 or newer
graphify --version            # expect: graphify 0.9.26 or newer
company-os --version

# 2. Install anything missing
curl -fsSL https://raw.githubusercontent.com/metuur-ai/local-search/main/install.sh | bash
# installs: CLI -> ~/.local/bin, skill -> ~/.claude/skills/local-search, web UI -> ~/.local/share/local-search/web
# note: web UI needs Node >= 18; installer skips it with a warning if absent, everything else still works

# 3. Company OS binary
cd company-os-starter && make install && export PATH="$HOME/.local/bin:$PATH"
```

**Fallback if the network is hostile:** pre-built binaries are on each
project's GitHub releases page. Have them on a USB stick. A workshop that
dies at `curl` is a wasted 90 minutes.

---

## Module 1 — Local Context Strategy (15 min)

### 1.1 The constraint that starts everything

From `local-context-process-01.md`:

> Agents cannot always use MCP servers freely or uniformly. Depending on the
> environment there may be limits on MCP server availability, compatibility
> with the agent or model, access permissions, and authentication.

So the strategy is: **MCP is an acquisition mechanism, not necessarily the
final query mechanism** (`local-context-strategy.md` §3). Pull the context
down; query it locally.

### 1.2 Why local wins — demo the eight benefits in one command

`local-context-strategy.md` §4 lists them; show three that are visible in
seconds:

```bash
# Full access + search across multiple sources + independent operation
local-search repo list
```

Live output from this machine:

```text
NAME                  ADDED  LAST SCAN  LAST UPDATE  COMMIT    GRAPH
team-os-example-repo  8d     7d         —            —         —
uncle-os              7d     7d         9m           d6a799e   —
squirrel              6d     6d         5d           18d1075   graphify
foyer-platform        6d     6d         —            1133104   —
```

Four independent repos, one index, no network, no auth prompt. That is the
"logical aggregation of distributed sources" from §6 — the sources stay
distributed, the *query surface* is unified.

### 1.3 The risk nobody plans for: staleness

Point at the `LAST UPDATE` and `COMMIT` columns above. `foyer-platform` and
`team-os-example-repo` show `—`. **Ask the room: is that context valid?**

`local-context-strategy.md` §9 defines the chain of validity and §13 the
minimum synchronization states. Walk through the five failure cases:

| Case | What happened | Symptom |
|---|---|---|
| 1 | Remote source updated, local copy old | agent answers with last quarter's design |
| 2 | Local copy updated, index old | search misses a file that exists on disk |
| 3 | Partial update | half the answer is current, half isn't — worst case |
| 4 | Wrong branch | plausible, coherent, and about a feature that was reverted |
| 5 | Materialized copy without provenance | you cannot even tell which of 1–4 you're in |

And the seven states from §13 to classify any repo at a glance:
`up to date · update available · pending scan · unknown origin · unverifiable
· outdated · partially synchronized · modified locally`.

### 1.4 The division of responsibility

§10 splits it in two, and this is the part teams get wrong:

- **Problem A — synchronization of local copies.** Not Local Search's job.
- **Problem B — maintenance of the original source.** Not Local Search's job
  either.

§11: Local Search's specific responsibility is to **index and retrieve what is
on disk, and be honest about when it last looked.** It auto-detects changes on
every query (git HEAD + staged/unstaged/untracked, respecting `.gitignore`) —
that covers *its* index, not *your* copy.

The sync layer §12 asks for is exactly what Company OS `workspace sync`
provides. That's Module 5.

**Checkpoint:** every participant can say which of the seven states each of
their repos is in.

---

## Module 2 — Process to Generate Local Context (20 min)

### 2.1 Two levels, and they must stay connected

From `local-context-02.md`:

> The process maintains two levels of documentation that serve different
> purposes but must remain connected:
> 1. **Platform functional context** — built from requirements, features,
>    flows, and experiences.
> 2. **Component functional context** — built through reverse engineering
>    from the source code.

Platform context describes *the experience and general behavior the platform
offers its users*. Component context describes *what the code actually does*.
The gap between them is where every stale-doc incident lives.

### 2.2 Demo: generating platform context

Show the artifact shapes in the worked example workspace:

```bash
cd examples/workspace
ls platforms/*/reality/components/       # current-state truth per component
ls platforms/*/change-records/active/    # live PRDs
ls teams/*/product/discovery/            # team-private discovery briefs
```

The lifecycle, in one breath: discovery brief (`draft` → `validated`) →
PRD in `change-records/active/` (`proposed` → `completed`) → archived to
`archive/prds/` with an `outcome.md` due in 90 days.

```bash
company-os discover new --team customer-engagement "Same-day pickup"
company-os discover validate --team customer-engagement <brief-id>
company-os prd new --team customer-engagement --platform communications \
  --components customer-notification-service --from-discovery <brief-id>
```

`prd new --from-discovery` **refuses** unless the brief is `status: validated`,
and copies its Problem/Success sections forward. That's the connection between
levels being enforced, not suggested.

### 2.3 Demo: generating component context (reverse engineering)

This is where Graphify generates context rather than retrieving it:

```bash
graphify .                     # AST extraction + semantic inference -> graphify-out/
ls graphify-out/
# graph.json  GRAPH_REPORT.md  graphify.html  wiki/  ...
```

`graphify update .` is the cheap incremental refresh — AST-only, no API cost.
Run it after any code change so the graph never drifts behind the repo.

### 2.4 The binding: `@spec` markers

This is the single most important five minutes of the workshop. Platform
requirements carry numbered EARS clauses (`R1…Rn`). Code and tests bind back
to them with grep-able markers.

Real file — `examples/banking/bank/repos/code-transaction-screening/tests/test_settlement_finality.py`:

```python
"""Consumer-side conformance tests for the screening service.

Code repos are NOT modeled by the Company OS CLI. The only binding back to
governance is grep-able @spec markers tying tests to EARS clauses.
"""


# @spec req://payments/settlement-finality@1.0#R2
def test_duplicate_payment_order_is_screened_once():
    """R2: a duplicated Payment Order event must not produce a second Alert."""
    ...


# @spec req://identity/token-verification@1.0#R1
def test_rejects_unverified_token():
    """R1: every inbound call without a verifiable token is rejected."""
    ...
```

Format: `@spec req://<platform>/<requirement>@<version>#<clause>`

```bash
grep -rn "@spec req://" examples/banking/
```

The design intent: **a mandatory clause with zero test-side `@spec` sites is
meant to block completion.** Two plain-text conventions — a numbered clause and
a comment — and you have bidirectional traceability with no database.

**Facilitator note:** code repos are deliberately *not* modeled by the Company
OS CLI. The marker is the whole integration surface. Resist the question
"shouldn't there be a plugin?" — the answer is that grep works everywhere,
forever, in every language.

---

## Module 3 — Retrieving context with Local Search (20 min)

### 3.1 Register and search

```bash
local-search repo add ~/moonbeam-os moonbeam-os
local-search repo list
local-search repo remove moonbeam-os     # surgical, touches nothing else
```

First search:

```bash
local-search search "same-day pickup"
```

Live example from this repo:

```bash
$ local-search search "knowledge catalog sync" --repos uncle-os
[source=fts · rank=bm25 · repos=1 (0 with graphs)]

Specs (18):
  [uncle-os · FTS] examples/workspace/company-os/skills/syncing-knowledge.SKILL.md
    Syncing Knowledge Into the Catalog  ([authority/canonical])  .md
  [uncle-os · FTS] company-os-starter/docs/user-guide/how-to/sync-a-knowledge-catalog.md
    Sync a knowledge catalog  .md
  ...
```

Read the header aloud: `repos=1 (0 with graphs)`. The tool is telling you it
had no code graph to rank with. Compare against `squirrel`, which shows
`graphify` in the `GRAPH` column — that one gets graph-aware ranking.

### 3.2 `search` vs `find` — the trap

**These are different commands, not aliases.**

| Command | Scope | Use when |
|---|---|---|
| `local-search search "<q>"` | hybrid FTS5 + BM25 across specs | quick keyword lookup |
| `local-search find "<q>" --scope <repo>` | unified scoped search across **specs and code graphs** | you want specs and code considered together |

```bash
local-search search "same-day pickup"                        # specs
local-search search "same-day pickup" --semantic             # embedding-assisted
local-search find   "same-day pickup" --scope moonbeam-os    # specs + code
```

They even read **different scope files** — `find` uses `.local-search.toml`;
the Claude skill resolves project scope via `local-search init --json`.

```bash
$ local-search init --json
{
  "path": ".../.agent/local-search-config.yaml",
  "exists": true,
  "empty": true,
  "repositories": [],
  "available": [ { "name": "foyer-platform", "spec_count": 120 }, ... ]
}
```

`"repositories": []` with a populated `available` list means *nothing is
scoped for this project yet* — every query will search everything. Show
participants how to read this before they go hunting for a config file.

### 3.3 Past the first hit

```bash
local-search read <name>       # full document
local-search related <name>    # neighbours
local-search tags              # the facet surface
local-search recent            # what moved lately
local-search stats             # index health
```

### 3.4 Wire it into Claude

```bash
local-search install-skill --global    # any Claude Code session
local-search install-skill --local     # writes to ./.claude/skills
```

It refuses to overwrite an existing install unless you pass `--force`. Before
every query the skill runs `local-search init --json` to resolve which repos
are in scope for the *current* project — so the agent's answers are scoped the
same way your CLI is.

**Deliberate design choice worth calling out:** there is **no MCP server**. A
CLI plus a skill. That is Module 1's constraint honoured in the tooling — it
works when MCP is unavailable, incompatible, or unauthorized.

### 3.5 Keeping it fresh

Auto-detection covers day-to-day editing. For forced rescans and git hooks so
the index never goes stale, see `how-to/keep-search-fresh.md`.

---

## Module 4 — When to reach for Graphify (15 min)

### 4.1 The decision table

This is the deliverable participants should photograph:

| The question | First tool |
|---|---|
| "What does the platform do / why does it behave this way?" | **Local Search** |
| "Where is X defined / how does X work?" | `graphify explain "X"` |
| "How does X relate to Y?" | `graphify path "X" "Y"` |
| "What touches the auth / order / notification flow?" | `graphify query "<question>"` |
| "Give me the architecture overview" | read `graphify-out/GRAPH_REPORT.md` |
| "Who owns this / what governs it?" | **Company OS / Team OS** |

**Fall back to grep, Read, or an Explore agent only if:**
- `graphify-out/graph.json` does not exist, **or**
- the question is about a specific line of code or a runtime value — not
  architecture or structure.

### 4.2 Demo it

```bash
cd ~/others/metuur/adhd/squirrel      # the repo with GRAPH = graphify
graphify explain "task capture"
graphify path "InboxItem" "Notification"
graphify query "what happens when a reminder fires?"
head -60 graphify-out/GRAPH_REPORT.md
```

`GRAPH_REPORT.md` gives god nodes and community structure — read it *before*
answering any architecture question, so you know which nodes are hubs and
which communities exist.

### 4.3 EXTRACTED vs INFERRED — the honesty layer

Graphify labels every edge:

- **EXTRACTED** — derived from the AST. Deterministic. Trustworthy.
- **INFERRED** — semantic inference. Useful, not proof.
- **AMBIGUOUS** — flagged, not silently resolved.

Teach participants to check the label before acting on a relationship. An
INFERRED edge is a hypothesis to verify, not a fact to cite.

### 4.4 Keeping it current

```bash
graphify update .    # AST-only, no API cost — run after modifying code
```

Per the project `CLAUDE.md`: after modifying code files in a session, run
`graphify update .`. Same discipline as Module 1's staleness rule, applied to
the graph.

**Facilitator note — the honest limitation:** Graphify knows what the code
*is*. It does not know what the code was *supposed to* be, who owns it, or
whether the requirement is still in force. That is precisely the boundary
where Module 5 begins.

---

## Module 5 — Company OS & Team OS as the retrieval substrate (15 min)

### 5.1 What each OS layer contributes to retrieval

| Layer | What it makes retrievable |
|---|---|
| `company-os/standards/` | the baseline controls applied to everything |
| `platforms/<p>/` | component descriptors, requirements, **reality**, active PRDs, archived outcomes |
| `teams/<t>/` | ownership, deviations/exceptions, discovery, DoR/DoD |
| `company-ontology/` | canonical IDs — the vocabulary everything else refers to |
| `knowledge/` | read-only doc slices synced from repos that are *not* Company OS workspaces |

### 5.2 `knowledge/` — the synchronization layer §12 asked for

This is the direct, shipped answer to Module 1's staleness problem.

```yaml
# workspace.yaml at the workspace root
version: 1
repos:
  - name: component-library
    url: https://github.com/acme/component-library.git
    pin: {tag: v1.2.0}
    slices:
      - {paths: [docs/sdd],       localDirectory: knowledge/components/component-library}
      - {paths: [architecture],   localDirectory: knowledge/architecture/component-library}
      - {paths: [.claude/skills], localDirectory: knowledge/skills/component-library}
```

One repo, one clone, one cache, three destinations.

```bash
company-os workspace sync      # materialize slices + write workspace.lock.yaml
company-os graph build         # refresh knowledge/CLAUDE.md so agents can find it
company-os validate
company-os workspace status    # run this BEFORE every sync
```

Map it back to Module 1's five failure cases:

- `paths:` is an **allowlist, not a filter** — there is no exclude form.
  Source code never leaks in. (Solves case 5: provenance is the manifest.)
- Pins are explicit tags. (Solves case 4: wrong branch.)
- `workspace.lock.yaml` holds a per-file hash map **plus the resolved slice
  set**. (Solves cases 1–3.)
- Slices land `0444`/`0555`. Gate `[8/8]` fails on any hand-edit *and* on a
  slice-set change made without a re-sync — because the old files still hash
  clean, so nothing else would catch it.

`workspace status` reports exactly three drifts: **pin drift**, **slice-set
drift**, **missing/drifted slices**. That is Module 1's seven states, mechanized.

> **Never edit a synced file.** The fix is always upstream: change the source
> repo, cut a new pin, re-sync.

### 5.3 Indexed, not governed

| | |
|---|---|
| `knowledge/` **gets** | a generated `CLAUDE.md` context node listing every area and document, cross-links from every sibling root, gate `[8/8]` hash integrity |
| `knowledge/` **skips** | `graph build` tag derivation, and validate gates `[1/8]`–`[7/8]` |

Why: foreign docs carry no `type:`/`id:` frontmatter (the frontmatter gate
would reject every one), and the slice is `0444` (tag rewriting would fail).

**The rule to write on the whiteboard:** if you want a document *governed* —
owned, reviewed, expiring — it belongs in a platform or team root as a normal
artifact, not in the catalog.

### 5.4 The correlation layer: IDs, tags, `@spec`

Three mechanisms, one rule — **IDs are canonical; tags and wikilinks are
derived**:

- **Meaning** — canonical IDs (`component://`, `capability://`, `req://`,
  `context://`) registered once in `ids/registry.yaml`.
- **Aboutness** — faceted nested tags derived by `graph build`:

  ```text
  #kind/prd  #kind/adr  #kind/reality  #kind/discovery  #kind/skill  #kind/outcome
  #platform/communications          #team/customer-engagement
  #context/communications           #component/customer-notification-service
  #capability/message-delivery      #req/communications/delivery-reliability
  #tier/mandatory  #tier/default  #tier/guidance
  #status/active   #status/completed  #status/deprecated
  ```

- **Satisfaction** — the `@spec` markers from Module 2.4.

Demo the composition — this is retrieval across directories, platforms, and teams:

```text
tag:#capability/message-delivery tag:#kind/prd            → every PRD ever touching the capability
tag:#team/customer-engagement tag:#tier/mandatory         → the team's mandatory surface
tag:#component/customer-notification-service -tag:#status/completed → live work on the component
```

```text
frontmatter IDs  ──(company-os graph build)──►  tags: [...] block + wikilinks
```

**Never hand-write `tags:`.** Set the source frontmatter fields and run
`graph build`; a hand-edited tag is overwritten on the next build.

### 5.5 Retrieval scoped to a person

```bash
company-os today --role developer
company-os today --role product-owner
company-os ids list
company-os skills list       # merged four-layer skill view
company-os governance explain <component>
```

`today` is context retrieval filtered by role — the same workspace, ranked for
who is asking.

---

## Wrap — the retrieval sequence (5 min)

Hand this out. It is the workshop in seven lines.

```text
1. Is my context fresh?        company-os workspace status
                               local-search repo list      (check LAST SCAN / COMMIT)

2. What & why?                 local-search search "<question>"
                               local-search find "<q>" --scope <repo>   (specs + code)

3. How is it built?            graphify explain / path / query
                               graphify-out/GRAPH_REPORT.md             (architecture first)

4. Who owns it, what governs?  company-os governance explain <component>
                               teams/<t>/ownership/components.yaml

5. Is it satisfied?            grep -rn "@spec req://<platform>/<req>" .

6. Act.

7. Leave it current.           graphify update .     (after code changes)
                               company-os graph build (after frontmatter changes)
```

**The closing line:** the different OS layers *organize* knowledge; the Context
Retrieval Process is the *mechanism* that finds it and puts it into context to
solve a task.

---

## Facilitator crib sheet

**Questions you will get, and the answers:**

- *"Why not just use MCP?"* — Availability, compatibility, permissions,
  authentication. MCP is an acquisition mechanism; local is the query
  mechanism. Local Search ships no MCP server on purpose.
- *"Isn't Graphify just a smarter grep?"* — Grep finds strings. Graphify
  traverses EXTRACTED + INFERRED edges and labels which is which.
- *"Can I edit a file in `knowledge/`?"* — No. `0444`, and gate `[8/8]` names
  the file when you try. Fix upstream.
- *"Do I need to write tags?"* — Never. Set frontmatter, run `graph build`.
- *"Where do code repos fit in Company OS?"* — They don't, deliberately. The
  only binding is grep-able `@spec` markers in tests.

**Failure modes to rehearse:**

- No `graphify-out/` in the demo repo → use `squirrel` (it has `GRAPH =
  graphify`); or run `graphify .` during the break, not live.
- `local-search init --json` shows `"repositories": []` → expected on a fresh
  project; use it to teach scope resolution rather than apologising for it.
- Web UI missing → Node < 18. Say so and move on; the CLI is the demo.

**Time buffer:** Modules 2 and 5 are the ones that overrun. If you are behind,
cut Module 2.2 (the discovery→PRD lifecycle commands) and Module 5.5 — the
`@spec` demo (2.4) and the `knowledge/` sync (5.2) are the two that must
survive.
