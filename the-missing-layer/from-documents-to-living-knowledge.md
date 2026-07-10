# From Documents to Living Knowledge

### Using the Open Knowledge Format (OKF) as the Foundation for AI-Native Product Development

*Part two of a position paper on the long-term information architecture of specifications, PRDs, and change records. Part one — [The Balance, Not the Ledger](balance-not-ledger.md) — argued that current state should be a materialized projection over history. This paper argues for the substrate that projection should live in, and what happens to an organization once it does.*

---

## Abstract

Part one made a narrow claim: the current state of a platform is a *materialized view* over its history of changes, and treating the pile of PRDs and specs as if it were that view forces every reader to recompute the balance by hand. This paper takes the argument one step further and asks a different question. If the balance is worth materializing, *what should it be materialized into*, and *who — or what — reads it most*? The answer to the second question has changed. The heaviest reader of organizational knowledge is no longer a person occasionally onboarding; it is a fleet of AI agents reasoning on every task. Agents perform best on knowledge that is consistent, structured, current, and small — precisely the properties a materialized current-state view has and a historical archive does not. The recent publication of Google Cloud's **Open Knowledge Format (OKF)** — a vendor-neutral specification for representing knowledge as a bundle of interlinked markdown *concept* files — provides a concrete substrate for the balance. But a format is not a discipline. This paper argues that OKF supplies the *representation*, while a spec-driven process (PRD Standardization and the delivery workflow we refer to as **Uncle Dev**) must supply the *synchronization* — the mechanism that keeps the representation true as the platform moves. Together they turn documentation from a by-product of development into a first-class, continuously current deliverable: a living semantic model of the enterprise. We focus on the problem and the principle, not a rigorous implementation.

---

## 1. Problem Statement

Software organizations have become very good at *producing* documentation. Product Requirement Documents (PRDs), Architecture Decision Records (ADRs), RFCs, design docs, user stories, implementation plans, runbooks, and technical specifications all accumulate around a product. Abundance is not the problem.

The problem is that after five years, a platform might carry two thousand PRDs, eight hundred RFCs, three hundred ADRs, tens of thousands of tickets, and millions of lines of code — and still have no single place that answers the most ordinary question anyone can ask:

> *How does Customer Authentication actually work today?*

The answer is not in any one document. It is scattered across years of changes, most of which have been partly or wholly superseded, none of which announces that it has been. This is the same failure part one named — a **historical change log used as a current-state description** — seen from a new angle. Part one framed it as a cost paid by every human reader on the hot path. Here we frame it as a *category error in what documentation is for*.

Most organizations treat documentation as a **history of decisions**. What they actually need, most of the time, is a **representation of reality**. A PRD describes what we wanted to build at a point in time. It is not a description of what exists now, and it was never designed to be one. As products evolve, this kind of documentation *accumulates* rather than *converges*: the archive grows, but the picture of the present does not get clearer.

Two things make this materially worse than it was five years ago.

First, the dominant consumer of this knowledge has changed. It used to be a human, reading occasionally. It is increasingly an **AI agent, reasoning constantly** — on every code change, every review, every test-generation pass, every architectural question. Agents do not skim and infer around gaps the way an experienced engineer does; they take what they are given literally. Ask an agent to reconstruct the present state of a platform by synthesizing years of historical documents and the result is inefficient at best and, at worst, hallucinated, inconsistent, or self-contradictory. The archive that merely slowed a human down actively misleads a machine.

Second, until recently there was no shared, neutral answer to the question *"where should current knowledge live?"* Teams improvised — a wiki here, a `docs/` folder there, a Notion space, a set of prompts pasted into each assistant. The recent arrival of a vendor-neutral format for exactly this purpose removes the last excuse. The gap is now nameable, and fillable.

---

## 2. Assumptions

This paper inherits assumptions A1–A6 from part one (code is authoritative; history is valuable but on demand; "what is true now" is the most frequent question; undocumented truth drifts without enforcement; the right thing must be the easy thing; scale changes the calculus). It adds four that are specific to the AI-native setting. They are stated so they can be challenged.

- **B1 — Agents are now first-class readers, and they read constantly.** The design point is no longer "a human reads this occasionally." It is "a fleet of agents reasons from this on every task." Optimizing for the human reader and hoping agents cope is backwards.

- **B2 — Agents reason best from consistent, structured, current, and *small* knowledge.** The same properties that make a materialized balance good for humans (part one) are the properties a language model needs to reason reliably. Large, contradictory, historical context degrades output.

- **B3 — Knowledge should be represented once and consumed by everyone.** Humans, agents, and future employees should draw from the *same* structured source. Maintaining a separate prompt-engineered context per assistant produces the same divergence problem one level up.

- **B4 — A format is not a process.** A representation of current knowledge, however good, drifts the moment the process that fills it stops treating updates as mandatory. The format is necessary; the synchronization discipline is what keeps it true (this is A4, applied to knowledge rather than to a single doc).

If you reject B1–B2 — if you believe the primary reader is still a human who tolerates gaps — much of this paper is optional. If you accept them, the conclusion is hard to avoid.

---

## 3. Theory: The Balance Needs a Place to Live

### 3.1 Recap, in one line

Part one: the current state of a platform is a **projection** (a *fold*, a *reduction*) over its history of changes; it should be **materialized** — computed once, at write time, by the person with context — rather than **recomputed** by every reader. The balance, not the ledger.

That paper deliberately stopped at the principle. It named three buckets — current state (the balance), decisions (the why), history (the ledger) — and left the concrete shape as "one simple instantiation, adapt to your tools." This paper picks up exactly there. The balance is worth materializing. *Into what?*

### 3.2 A materialized view needs a schema

A balance is not just "a document somewhere." In banking, the balance has a definite shape: a number, a currency, an as-of timestamp, an account it belongs to, and a defined relationship to the ledger that produced it. That shape is what lets every system — the ATM, the app, the statement, the fraud model — read the *same* balance and agree on it.

The equivalent for a platform's current-state spec has, until now, been improvised per team. Everyone materialized their balance into a different container: one team's `README`, another's wiki, a third's set of Confluence pages, each with its own conventions. The projection was materialized, but into a **private schema**, so it could not be shared across teams, tools, or agents without translation. A materialized view with no agreed schema is a materialized view exactly one team can use.

What has been missing is a *neutral, shared shape for the balance* — small enough to write by hand, structured enough for a machine to parse, and portable enough that every team and every agent reads it the same way.

### 3.3 Knowledge as a graph of small concepts

The insight that closes the gap is to stop thinking of current state as *a document* and start thinking of it as **a set of small, interconnected concepts**. Instead of one growing "current-state spec" per capability, the balance becomes a graph: one node per *thing the organization knows* — an API, a business capability, a domain entity, a workflow, an ownership boundary, a security constraint, an operational procedure, an architectural rule. Each node is small, describes a single aspect, links to its neighbors, and is overwritten in place as the platform evolves.

This is the same materialized balance from part one, decomposed. A per-capability document was already a fold over the changes that touched that capability. A *concept graph* is that fold taken to its natural granularity: many small balances, cross-linked, each cheap to keep current because each is small and owned. It preserves everything part one demanded — overwrite-in-place, organized by capability not by change, glanceable, enforceable — and adds the property part one left open: a **shared shape** that humans and agents can both traverse.

---

## 4. What OKF Actually Provides

The **Open Knowledge Format (OKF)** is a specification published by Google Cloud in June 2026 (v0.1) that gives the concept graph a concrete, vendor-neutral form. It is worth being precise about what it is, because its virtue is its smallness.

An OKF **bundle** is a directory of markdown files. Each file is a **concept** — a single API, dataset, metric, capability, runbook, playbook, or rule. Each concept has a small block of **YAML front matter** for structured fields (identity, type, ownership, links) and a markdown body for everything a human or agent needs to read. A bundle may include `index.md` files that let an agent navigate the hierarchy through **progressive disclosure** — reading the map before the territory — and `log.md` files that record a **chronological history of changes** to the knowledge itself.

Four properties make it the right substrate for the balance:

- **It is just files.** No compression scheme, no runtime, no required SDK, no proprietary account. A bundle renders on GitHub, ships as a tarball, and mounts on any filesystem. It lives *beside the code*, which is exactly where part one insisted the balance belongs.

- **It is vendor-neutral.** It is not tied to a cloud, database, or model provider. The same bundle feeds a coding agent, an architecture reviewer, a test generator, and a human — satisfying B3, "represent once, consume everywhere."

- **It is both human- and machine-readable.** Markdown for the person, front matter and structure for the machine, links for the graph. One artifact, two audiences, no translation layer.

- **It already encodes the balance/ledger split.** This is the striking part for a reader of part one. OKF's concept files *are* the balance: overwrite-in-place, current, small. OKF's `log.md` *is* the ledger: append-only, chronological, off the primary read path. `index.md` is the stable index part one asked history to keep. The format ships with the exact information architecture the previous paper argued for — state as the default view, history preserved and one link away.

OKF v0.1 is explicitly a starting point, not a finished standard; it will evolve as producers and consumers emerge. That is fine. The claim here is not "adopt v0.1 verbatim." It is that a *neutral shape for the balance now exists*, and the improvised-per-team era can end.

---

## 5. Why Current Approaches Fall Short

Part one dismantled the approaches to *organizing documents*: keep-everything-and-cross-reference, status tags and EARS, spec-first tooling, "just read the code." Those critiques stand. The AI-native setting adds three more failure modes worth naming directly.

**5.1 PRD-as-truth: mining the archive at query time.**
The default instinct is to point the AI at the corpus — thousands of PRDs, RFCs, tickets — and let retrieval find the relevant history for each question. This is recompute-the-balance-from-the-ledger (part one, §3.4) wearing a machine-learning hat. Retrieval makes the archive *navigable*; it does not make it *current*. It will faithfully surface a superseded 2024 PRD next to the change that reversed it and leave the model to guess which one is live. Reference is not aggregation, and similarity search is not supersession logic. The work of folding the ledger into the present has still not been done — it has merely been deferred to inference time, where it is done badly, repeatedly, and non-deterministically.

**5.2 Per-assistant prompt engineering: the balance, forked N ways.**
The other common pattern is to hand-craft context for each AI tool — a system prompt for the coding assistant, a different one for the reviewer, another for the test generator. Each is a private, partial, drifting copy of the same organizational knowledge. This reintroduces at the *prompt* layer the exact divergence part one fought at the *document* layer: many artifacts, no single truth, silent drift between them. The fix is the same fix — materialize once, into a shared shape, and have every consumer read it — which is precisely B3 and precisely what a neutral knowledge bundle enables.

**5.3 Treating knowledge as a by-product.**
In most pipelines, knowledge is exhaust: it is whatever documents happen to fall out of shipping features. Nobody owns "the current state" as a deliverable, so nobody updates it, so it rots — and an AI reading rotted knowledge is worse than an AI reading nothing, because it acts on the rot with confidence. The failure is not tooling. It is that current knowledge was never made *someone's output*, with a definition of done attached (§7).

---

## 6. Theory of the Solution: A Knowledge Lifecycle, Not an Archive

The principle, in one sentence: **let the PRD describe the change, let the implementation deliver it, and let the knowledge base become what is now true — so knowledge *converges* on reality instead of *accumulating* away from it.**

This reframes three familiar artifacts by their tense:

- A **PRD** is future/imperative: *what we intend to change.* It is, correctly, a point-in-time record. It should stay one.
- An **implementation** is the act: *the change, made.* Code and tests.
- The **knowledge base (OKF)** is present-tense: *what is true now.* It is the only artifact whose job is to describe reality, and it is overwritten to stay accurate.

Today, the knowledge introduced by a PRD stays trapped *inside* the PRD. New business rules, changed workflows, evolved APIs, expanded domain concepts, updated security constraints — all of it is embedded in a document that becomes more historical every day while the platform keeps moving. The PRD ages into the archive and takes the organization's current understanding with it.

The correction is to make the PRD a **delta**, not a destination.

### 6.1 The delta model

Reframe every PRD as the **difference between today's knowledge and tomorrow's knowledge**. An agent — or a human — does not start each change by mining hundreds of historical specs. It starts from the *living knowledge graph*, which already encodes the business domain, the current architecture, existing APIs, business rules, ownership boundaries, domain vocabulary, security requirements, operational procedures, coding standards, and architectural constraints. Against that baseline, the PRD expresses only what changes.

After implementation, that delta is **merged back into the knowledge base** — the affected concept nodes are edited to their new current state, and the PRD is filed to the archive (and, in OKF terms, noted in the relevant `log.md`). The organization's understanding stays synchronized with the actual platform because *synchronization is a step in the work*, not a separate documentation project that never happens.

This is the materialized-balance economics of part one (§3.5) applied to organizational knowledge: pay the fold **once, at write time, by the person with context**, instead of paying it on **every read, by everyone, forever**. The difference here is only that the reader paying the recompute is now, most often, a machine reasoning on every task — which raises the stakes of getting it wrong and the payoff of getting it right.

### 6.2 Knowledge as a first-class deliverable

The consequence is a genuine **lifecycle** rather than a growing pile:

> PRDs generate implementation work → implementations change the codebase → completed work updates the knowledge base → updated knowledge improves the next round of planning, estimation, architecture review, testing, onboarding, and AI reasoning → which shapes the next PRD.

Knowledge stops being the exhaust of development and becomes one of its **primary outputs**. The knowledge repository becomes the **digital memory of the company** — the same source consulted by developers, architects, product managers, QA, AI agents, and the employee who joins next year. Historical documents keep their value for understanding *why* a decision was made; but *operational* work is driven by the current state, not by historical intent.

Over enough cycles, this repository stops being "the docs" and becomes a **semantic model of the enterprise**: every capability, rule, service, domain concept, interface, process, and decision an interconnected, continuously maintained node. The platform, the documentation, and the agents finally share one understanding of the system. That is the transition this paper is named for — from **documentation-driven** development to **knowledge-driven** development.

---

## 7. A Concrete Shape

Offered to make the principle tangible, not as a prescription. Simpler is better; adapt to your tools.

**The knowledge base as an OKF bundle, beside the code.**

```
/knowledge/                       # the balance — living current state (OKF bundle)
   index.md                       #   the map: capabilities, domains, entry points
   auth/
      customer-authentication.md  #   concept: how auth works *now* (+ front matter, links)
      session-management.md
      log.md                      #   chronological change history for this area
   payments/
      payment-intent.md
      settlement.md
   domain/
      account.md                  #   domain entity + invariants
      customer.md
/decisions/                       # the why — ADRs, append-only, superseded-not-deleted
   0007-overdraft-policy.md
/archive/                         # the ledger — evicted PRDs / RFCs, indexed, on demand
   index.md
   2024/PRD-204-add-overdraft.md
```

Notice the split is the one from part one, now carried by the format itself: concept files are the balance, `log.md` is a local ledger, `/archive/` is the full historical ledger, `/decisions/` is the deep why.

**A delivery workflow (what we call Uncle Dev).**
Rather than sending an agent to search hundreds of historical specs, the agent begins from `/knowledge` — the graph it can already reason over. A change then runs: read the relevant concepts → author the PRD as a **delta** against them → implement code and tests → **merge the delta back** by editing the affected concept nodes → archive the PRD. The knowledge base is not a report written after the fact; it is the *starting context* and the *ending state* of every change.

**A definition of done that keeps knowledge current.**
A change is not done until: (1) the code is merged; (2) the affected OKF concept files are edited to reflect the new current behavior; (3) any significant decision is captured as an ADR; (4) the PRD is filed to the archive and noted in the relevant `log.md`; and (5) an enforcement check passes — contract tests, fitness functions, or regenerated-and-diffed sections that **break when the knowledge and the system disagree**. This is part one's non-negotiable (§5.4) restated: a living knowledge base with no enforcement mechanism is not a source of truth, it is a convenience that looks like one. Where knowledge can be *derived* from code — API surface, data contracts, observable behavior — generate the concept, don't narrate it; generated nodes cannot drift from their source.

---

## 8. The Separation of Concerns

The heart of the argument compresses to a table. Four artifacts, four tenses, four jobs — and, crucially, four *different lifecycles* that most methodologies collapse into one.

| Artifact | Question it answers | Tense | Lifecycle |
|---|---|---|---|
| **PRD** | *What are we trying to change?* | Future / intent | Point-in-time; written once, archived |
| **Code** | *How did we implement it?* | Present mechanism | Overwrite-in-place; authoritative for behavior |
| **Tests** | *How do we verify it?* | Present guarantee | Overwrite-in-place; enforce the contract |
| **OKF** | *What is true now?* | Present description | Overwrite-in-place; the human/agent-readable balance |

The **missing layer** in most AI-native development methodologies is the fourth row. Teams have PRDs, code, and tests. What they lack is a first-class artifact whose only job is to state *what is true now* in a form both a person and a model can consume — one that evolves *alongside* the software rather than *trailing behind* it. Code answers "what" but is not glanceable for intent (part one, §4.4); PRDs answer "what we wanted" but freeze; tests answer "does it hold" but do not narrate. OKF fills the one seat at the table that has been empty. Giving current knowledge its own row — its own owner, its own definition of done, its own enforcement — is what turns it from trailing exhaust into a first-class artifact.

---

## 9. Toward a Methodology: Format Is Not Process

It is worth being explicit about a boundary the hype will blur. **OKF is a format. It is not a methodology.** It specifies how to *represent* knowledge; it says nothing about how to keep that representation *synchronized* with a moving product. A perfectly valid OKF bundle can be perfectly out of date. The format guarantees portability and structure; it guarantees nothing about truth.

Truth is a *process* property, and it is the province of the surrounding discipline:

- **PRD Standardization** defines how a change is expressed as a delta against current knowledge — consistent enough that the merge-back is mechanical rather than archaeological.
- **The delivery workflow (Uncle Dev)** defines the lifecycle — knowledge in, change out, knowledge updated — and, critically, binds the update to the definition of done and to an enforcement signal, so that skipping it *breaks something* (part one's A4).

So the layered claim is:

- **OKF** provides the *representation* — the shared shape of the balance.
- **PRD Standardization + the delivery workflow** provide the *synchronization* — the mechanism that keeps the balance true as the platform evolves.

This separation of concerns is, in our view, the layer most AI-native development stories are missing. They reach for a format and stop, as if a schema could keep itself honest. It cannot. The format turns organizational knowledge into a *first-class artifact*; only the process keeps that artifact from rotting into just another stale file. Part one warned that a materialized view without enforcement is "the worst of both worlds" — authoritative-looking and silently drifting. A knowledge *format* without a synchronization *process* is that warning at organizational scale.

---

## 10. Trade-offs, Risks, and Open Questions

- **Maintaining the graph is real work.** Decomposing current state into many small concepts multiplies the number of things to keep current. Mitigated by deriving what you can from code (§7) and by making the merge-back part of *done* — but a team that skips it rots the knowledge base like any other doc, only now an AI acts on the rot at speed.

- **The knowledge base is a contended, shared artifact.** Many teams editing one graph introduces cross-team coupling, exactly as part one warned. It needs clear ownership *per concept*, the way code modules have owners; OKF's front matter is a natural place to record it.

- **Enforcement is still the crux.** Everything above collapses without a signal that fires when knowledge and system disagree. This is harder for narrated intent than for generated contracts. Be honest about which concepts are enforced and which are merely maintained.

- **Delta discipline is a skill.** "Express this change as a diff against current knowledge" is a different authoring habit than "write a self-contained PRD." It requires the current knowledge to actually be trustworthy first — a chicken-and-egg that has to be bootstrapped deliberately.

- **OKF v0.1 will move.** It is an early specification and will change. Betting the process on the *idea* (a neutral, file-based knowledge bundle beside the code) is safe; betting on a specific field in v0.1 is not. Keep the coupling loose.

- **Where "knowledge" ends and "history" begins is judgment.** As in part one, the state/decision/log boundary is a matter of taste and needs a light convention, not a formula. OKF's concept-vs-`log.md` distinction gives that convention a home, but not an answer.

---

## 11. Recommendation

Extend the **balance-not-ledger** model from a principle into an operating substrate:

1. **Materialize the balance as a living knowledge graph** — small, interconnected, capability-organized concept files, in the repository, beside the code, in a neutral file-based format such as OKF.
2. **Make every PRD a delta** against that graph, and **merge the delta back** as part of the definition of done — so knowledge converges on reality instead of accumulating away from it.
3. **Derive from code where possible, enforce the rest in CI** — so the balance cannot drift silently, for humans or for agents.
4. **Keep the deep "why" in decision records and evict — not delete — history** to an indexed, on-demand archive (OKF's `log.md` and a `/archive/` are natural homes).
5. **Represent once, consume everywhere** — every agent and every person reads the same graph; retire per-assistant prompt-engineered copies of organizational knowledge.

And reframe the ambition. The goal is not merely to standardize PRDs or to make an AI write code faster. It is to establish a **single, continuously evolving source of truth** — one that captures how the business operates, how the platform behaves, and how future decisions should be made. OKF gives that source a shape. PRD Standardization and the delivery workflow give it a heartbeat. Together they point at a future where software development is driven not by fragmented documents, but by living organizational knowledge — and where the answer to *"how does Customer Authentication actually work today?"* is one file, one link away, current, and read the same way by the engineer and the machine.

Part one asked: *what is the default view of the platform?* This paper's answer is that the default view should be a living knowledge graph — and that a format alone will not keep it living. The process must.

---

## Appendix A — Glossary

- **OKF (Open Knowledge Format)** — A vendor-neutral specification (Google Cloud, v0.1, June 2026) for representing knowledge as a bundle of interlinked markdown *concept* files, each with YAML front matter, optionally accompanied by `index.md` (navigation / progressive disclosure) and `log.md` (chronological change history).
- **Concept** — One node in an OKF bundle: a single API, capability, domain entity, workflow, rule, or procedure, described in one small, overwrite-in-place file.
- **Knowledge graph (living)** — The current-state balance decomposed into many small, cross-linked concepts kept continuously up to date; the materialized view of "what is true now."
- **Delta model** — Treating a PRD as the *difference* between current and future knowledge, authored against the graph and merged back into it after implementation.
- **Knowledge lifecycle** — The loop *PRD → implementation → knowledge update → better next PRD*, in which knowledge converges on reality instead of accumulating.
- **Semantic model of the enterprise** — The end state of a maintained knowledge graph: every capability, rule, service, interface, and decision as an interconnected node shared by humans and agents.
- **Synchronization discipline** — The process (PRD Standardization plus the delivery workflow) that keeps the knowledge representation true; distinct from the format, which only makes it portable.
- *(Carried from part one: **state**, **event log / ledger**, **projection / fold**, **materialized view**, **drift**, **ADR**, **fitness function**.)*

## Appendix B — Background and Further Reading

Claims are paraphrased and attributed.

- **Open Knowledge Format** — Google Cloud, *How the Open Knowledge Format can improve data sharing* (2026); the `GoogleCloudPlatform/knowledge-catalog` repository (`okf/SPEC.md`). OKF v0.1 formalizes the "LLM-wiki" pattern into a portable markdown bundle of concepts; explicitly a starting point, not a finished standard.
- **The balance / ledger split** — Part one of this series, *The Balance, Not the Ledger*; the argument that current state is a materialized projection over history, bound to an enforcement mechanism, with history evicted-not-deleted.
- **Spec-Driven Development, MCPs, and the Spec Graph** — internal SDD one-pager and operating-model notes; the position that development should rest on an *executable source of truth* rather than tribal knowledge, and that agents consume governed context rather than inventing it.
- **Documentation drift / the "spec-evergreen" problem** — widely discussed: documents written once, briefly read, then abandoned while code moves on.
- **Fitness functions / evolutionary architecture** — Ford, Parsons, and Kua, *Building Evolutionary Architectures*; architectural knowledge coupled to artifacts with their own enforcement.
- **Architecture Decision Records** — Michael Nygard, *Documenting Architecture Decisions* (2011); short, durable records of decisions, superseded-not-deleted.
- **"Spec as source of truth" and the rebuild test** — industry guidance on treating the specification as the primary artifact and code as derived.

---

*This is a position paper focused on the problem and the principle of a solution. OKF is referenced as a concrete, currently-available substrate; the recommended direction — materialize current knowledge, express change as a delta, synchronize by process, enforce with a signal — is independent of any specific format or tool.*
