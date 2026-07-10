# From Documents to Living Knowledge

### Using the Open Knowledge Format (OKF) as the Representation of Reality for AI-Native Product Development

*Part two of a position paper on the long-term information architecture of specifications, PRDs, and change records. Part one — [The Balance, Not the Ledger](balance-not-ledger.md) — argued that the truth of a platform is a balance, materialized over a ledger of changes. This paper is about where that balance should live, what it should be made of, and who reads it now.*

---

## TL;DR

Your bank shows you a **balance**, not ten thousand transactions to add up. A platform's PRDs and specs are the transactions — the **ledger**. "How does this work today?" is the **balance**, and most organizations never materialize it, so every engineer (and now every AI agent) has to reconstruct it by hand. Agents make this worse: they read constantly and take stale documents literally.

The fix is to keep a living **representation of reality** — one current, shared, capability-organized description of what is true now — beside the code. In June 2026 Google Cloud published the **Open Knowledge Format (OKF)**, effectively naming and standardizing that source of truth: a vendor-neutral bundle of small markdown *concept* files (the balance) with a built-in `log.md` (the ledger). Treat each **PRD as a transaction** — a delta against the balance — and **fold it back** into the representation of reality as part of the definition of done. But a format is only a *shape*; standardized deltas and an enforced delivery lifecycle are the *heartbeat* that keeps it true. Do this and knowledge stops being development's exhaust and becomes a first-class deliverable — the company's digital memory, read the same way by every human and every agent.

---

## Abstract

Part one told a simple story with a bank account. Your account has a **ledger** — every transaction since it opened, append-only and immutable — and it has a **balance**, the one number that tells you what you have right now. The balance is a *fold* over the ledger; you could recompute it by replaying every transaction, but you never do, and neither does the bank. The bank materializes the balance and shows it to you first. Part one argued that a platform's truth works the same way: the pile of PRDs and specs is a ledger, "what the platform does today" is a balance, and most organizations make the category error of storing the second as if it were the first — forcing every reader to add up the transactions by hand.

This paper continues that story and asks two questions part one left open. If the balance is worth materializing, *what is it made of* — and *who reads it now*? The answer to the second has quietly changed: the heaviest reader is no longer an engineer glancing at a wiki, it is a fleet of AI agents reasoning on every task, and agents take what they are given literally. The answer to the first has, for the first time, an industry-standard shape. In June 2026, Google Cloud published the **Open Knowledge Format (OKF)** — a vendor-neutral specification that gives curated, agent-ready knowledge an official name and structure. With OKF, the industry finally has an agreed home for the balance. This paper tells the story of moving an organization's truth out of its ledger of documents and into a living **representation of reality** — and argues that OKF supplies the *shape* of that representation, while a disciplined process must supply its *heartbeat*.

---

## 1. The engineer who became an archaeologist

Picture a competent engineer on a mature platform, five years in. She has one ordinary question:

> *How does Customer Authentication actually work today?*

It is the most reasonable question in the world, and there is no place to read the answer. What she has instead is an archive: two thousand PRDs, eight hundred RFCs, three hundred ADRs, tens of thousands of tickets, millions of lines of code. Somewhere in there, the truth exists — spread across dozens of changes, most of them partly or wholly reversed by later ones, none of them wearing a label that says *"superseded, do not trust."* To answer her question she has to find every document that ever touched authentication and fold them together in her head, discarding what was undone. She has stopped being an engineer. She is doing archaeology.

Return to the bank for a moment. Imagine logging in and being shown ten thousand transactions with the note: *"your balance is in here somewhere — add it up."* You would change banks. Yet that is exactly what a five-year pile of specs asks of every engineer who wants to know what the platform does. Part one gave this failure its name: a **ledger** — a history of decisions — is being used as a **balance** — a representation of reality. They are two different kinds of knowledge, and the archive quietly pretends to be the thing it is not.

Here is the twist that makes this the subject of a *second* paper rather than a footnote to the first. Most organizations believe they are missing documentation. They are not. They are drowning in it. What they are missing is a **representation of reality** — one place that says, plainly and currently, *this is how it works now.* A PRD was never that. A PRD is a transaction: it records what we wanted to change at one moment. Ask it what is true today and it answers with what was true the day it was written. Pile up enough transactions and you do not converge on the present; you accumulate away from it.

---

## 2. The reader changed while we weren't looking

For most of software's history, the archaeology was tolerable because the archaeologist was human. An experienced engineer skims, infers, fills gaps, and knows which old document to distrust. Slow and expensive, but survivable.

That reader is no longer the main one. The heaviest consumer of organizational knowledge today is an **AI agent**, and it reads *constantly* — on every code change, every review, every test, every architectural question. Agents do not skim and infer around a stale document the way a veteran does. They take what they are handed literally. Point one at a ledger of two thousand PRDs and ask it how authentication works, and it will earnestly retrieve a 2024 proposal, place it beside the change that reversed it, and guess. The archive that merely slowed a human down actively *misleads* a machine — and then the machine writes code, at speed, on the misunderstanding.

This is the premise that makes the rest of the story unavoidable. Agents reason best from knowledge that is **consistent, structured, current, and small** — which are exactly the properties of a balance and exactly *not* the properties of a ledger. And they should all read the *same* balance: maintaining a separate hand-tuned context for each assistant just forks the truth again, one level up, into a dozen private, drifting copies. If you believe the primary reader is still a forgiving human, much of what follows is optional. If you accept that the reader is now a literal-minded machine reasoning on every task, the conclusion is hard to avoid: the balance has to be real, current, and shared.

---

## 3. A balance needs a place to live

Part one made its case and then, deliberately, stopped at the principle: materialize the balance, bind it to enforcement, evict the ledger from the working set — *and adapt the concrete shape to your tools.* This paper starts precisely where that sentence trailed off. The balance is worth materializing. **Into what?**

Notice what a balance actually is at the bank. It is not just "a number written down somewhere." It has a definite, shared shape: an amount, a currency, an as-of time, an account it belongs to, and a defined relationship to the ledger beneath it. That agreed shape is the whole trick. It is why the ATM, the mobile app, the paper statement, and the fraud model all read the *same* balance and never argue about it.

The platform equivalent has, until now, had no agreed shape at all. Every team materialized its balance into a private container — one team's README, another's wiki, a third's tangle of Confluence pages — each with its own conventions. The fold was done, but into a schema exactly one team could read. A representation of reality that only its authors can parse is not much of a representation, and it is useless to an agent that has to reason across the whole platform.

The move that dissolves this is to stop imagining the representation of reality as *a document* and start seeing it as **a graph of small, connected facts** — one node per thing the organization knows: an API, a capability, a domain entity, a workflow, an ownership boundary, a security rule, an operational procedure. Each node is small, states a single truth, links to its neighbors, and is *overwritten in place* as the platform changes. This is nothing more than part one's balance taken to its natural grain: instead of one growing current-state document per capability, many tiny balances, cross-linked, each cheap to keep honest because each is small and owned. Everything part one demanded survives — overwrite-in-place, organized by capability rather than by change, glanceable, enforceable — and one thing part one left open is finally supplied: a **shared shape** that a human and a machine can both walk.

---

## 4. Google gave the balance an official name

Ever since spec-driven development became a standard practice, the reason teams still improvised was that nobody had blessed a standard for the *knowledge* itself. There was no agreed answer to *"where does current, agent-ready truth live?"*, so everyone invented one.

In June 2026, that changed. Google Cloud published the **Open Knowledge Format (OKF)**, version 0.1 — and in doing so, effectively named the source of truth. Not a mandate handed down, but something more useful: an official, vendor-neutral *shape and name* for exactly the artifact this story has been circling. OKF takes the informal "LLM-wiki" pattern that teams had been reinventing and formalizes it into a portable specification for curated knowledge that agents can read. The balance now has a standard the way the account balance has a standard — a form every tool can agree on.

And the format's virtue is how little there is to it. An OKF **bundle** is just a directory of markdown files. Each file is a **concept** — one API, one metric, one capability, one runbook. Each concept carries a small block of **YAML front matter** for the structured facts (identity, type, owner, links) and a markdown body for everything a person or an agent needs to read. A bundle can include `index.md` files that let an agent read the *map* before the territory, and — this is the part that should make a reader of part one sit up — `log.md` files that record the **chronological history of changes** to the knowledge itself.

Four things make OKF the right home for the balance:

It is **just files.** No runtime, no SDK, no proprietary account, no compression. A bundle renders on GitHub, ships as a tarball, mounts on any filesystem — and lives *beside the code*, which is exactly where part one insisted the balance belongs.

It is **vendor-neutral.** It is not chained to a cloud, a database, or a model. The same bundle feeds a coding agent, an architecture reviewer, a test generator, and a human, with no translation layer between them. Represent once; everyone reads the same balance.

It is **legible to both audiences at once.** Markdown for the person, front matter and links for the machine. One artifact, two readers, no divergence.

And — the quietly remarkable part — **OKF already ships the balance-and-ledger split from part one.** Its concept files *are* the balance: current, small, overwritten in place. Its `log.md` *is* the ledger: append-only, chronological, kept off the primary read path. Its `index.md` is the stable index part one asked history to keep. The format arrives with the exact information architecture the first paper argued for — the balance shown first, the transactions preserved and one link away. Google did not just publish a file format; it published, in effect, the shape of the argument.

OKF v0.1 is explicitly a beginning, not a finished standard, and it will move. The claim here is not "adopt v0.1 to the letter." It is that the improvised-per-team era is over: the balance now has an official name and a neutral shape, and there is no longer an excuse to keep the truth trapped in the ledger.

---

## 5. Why the obvious alternatives keep failing

Every team that hits this wall reaches, understandably, for one of three fixes. Each fails for the same reason: it mistakes *navigating the ledger* for *materializing the balance*.

**"Just point the AI at all the PRDs."** Feed the model the whole corpus and let retrieval surface the relevant history per question. But this is recomputing the balance from the ledger, dressed in machine learning. Retrieval makes the archive *searchable*; it does not make it *current*. It will hand the model a superseded proposal and the change that killed it, side by side, and leave it to guess which is live. Similarity search is not supersession logic. The fold from ledger to present still hasn't been done — it has only been deferred to inference time, where it is done badly, non-deterministically, and again on every single read.

**"Hand-tune a prompt for each assistant."** A system prompt for the coder, another for the reviewer, another for the tester. Each is a private, partial, drifting photocopy of the same truth. This is the exact divergence part one fought — many artifacts, no single balance, silent drift — reintroduced at the prompt layer. The cure is the cure it always was: materialize once, into a shared shape, and have every consumer read it.

**"Let knowledge fall out of the work."** In most pipelines the representation of reality is *exhaust* — whatever documents happen to drop out of shipping a feature. Nobody owns it as an output, so nobody keeps it current, so it rots. And an agent reading rotted truth is worse than one reading nothing, because it acts on the rot with confidence. The failure isn't tooling. It's that the balance was never made *someone's deliverable*, with a definition of done attached.

Part one already dismantled the document-organizing instincts — cross-reference everything, add status tags, adopt tighter requirement syntax, "just read the code." Those critiques hold. Cross-referencing the ledger, however richly, still never produces the balance: a balance is not a set of links between transactions, it is the fold of them into one value. Reference is not aggregation. The work of computing the present is exactly the work these approaches leave undone.

---

## 6. Turning the ledger into a living balance

So how does the truth actually stay true? The answer is a change of tense, and a change of what a PRD is *for.*

Line the artifacts up by the question each one answers, and the shape of the solution appears on its own:

| Artifact | The question it answers | Tense | How it lives |
|---|---|---|---|
| **PRD** | *What are we trying to change?* | Future / intent | A transaction: written once, then archived |
| **Code** | *How did we implement it?* | Present mechanism | Overwritten in place; authoritative for behavior |
| **Tests** | *How do we verify it?* | Present guarantee | Overwritten in place; enforce the contract |
| **OKF** | *What is true now?* | Present reality | Overwritten in place; the balance both humans and agents read |

Three of those rows exist in every shop. The fourth is the one that keeps going missing — a first-class artifact whose only job is to state *what is true now*, in a form a person and a model can both consume, that evolves *alongside* the software instead of trailing behind it. Code answers "what" but isn't glanceable for intent. A PRD answers "what we wanted" but freezes the instant it's approved. Tests answer "does it hold" but don't narrate. OKF fills the empty seat: the representation of reality, the balance, the present tense.

The mechanism that keeps that seat honest is to **stop treating a PRD as a destination and start treating it as a transaction** — a single delta against the balance. An engineer, or an agent, no longer opens a change by excavating hundreds of old specs. It starts from the living representation of reality, which *already* holds the domain, the architecture, the APIs, the business rules, the ownership boundaries, the vocabulary, the security constraints, the operating procedures, the standards. Against that baseline the PRD expresses only what changes — the transaction, not the whole account.

And then the crucial step, the one the bank performs the instant a payment clears: **the transaction is folded back into the balance.** When the change ships, the affected concept nodes are edited to their new truth, the PRD is filed into the archive, and the change is noted in the relevant `log.md`. This is the whole economic trade from part one, now applied to organizational knowledge: pay the fold **once, at write time, by the person who already has the context**, instead of making every future reader — increasingly, every agent, on every task — pay it again and again forever. The bank updates your balance when the money moves, not later, on demand, by asking you to re-add your statements. The platform should do the same with its truth.

Do this consistently and something changes in kind, not just degree. Knowledge stops being exhaust and becomes a **primary output**. A genuine lifecycle turns: a PRD proposes a delta, the implementation delivers it, the balance is updated to match, and the newly-current balance becomes the trustworthy starting context for the next change — a better baseline for planning, estimation, review, testing, onboarding, and every agent's reasoning. The repository stops being "the docs" and becomes the **digital memory of the company** — the one source that developers, architects, PMs, QA, agents, and next year's new hire all consult. The old documents keep their value for the deep *why*; but the daily work runs on the balance, not on historical intent. Given enough turns of the loop, the balance grows into something larger than documentation: a **semantic model of the enterprise**, every capability and rule and service and decision a connected node, with the platform, the docs, and the agents at last sharing one understanding of the system. That is the whole arc of this paper's title — from documentation-driven development to knowledge-driven development.

---

## 7. A format is not a heartbeat

Here is the caution the excitement will try to skip. **OKF is a shape, not a discipline.** It specifies how to *represent* the balance; it says nothing about keeping the balance *true.* A perfectly valid OKF bundle can be perfectly, dangerously out of date. The format guarantees portability and structure. It guarantees nothing about reality.

Truth is a property of *process*, and it comes from two things wrapped around the format. A **standardized way of writing the delta** — so that expressing a change as a diff against the balance, and folding it back, is mechanical rather than archaeological. And a **delivery lifecycle** — knowledge in, change out, balance updated — that makes the fold-back part of the *definition of done* and binds it to an enforcement signal, so that skipping the update *breaks something* rather than silently rotting the truth. This is part one's non-negotiable, restated: a materialized balance with nothing to keep it honest is the worst of both worlds — it *looks* authoritative while it drifts. Where the truth can be *derived* from code — API surfaces, data contracts, observable behavior — generate the concept instead of narrating it; a generated node cannot drift from its source. Reserve the hand-written prose for what code can't say: intent, rationale, cross-cutting behavior, constraints.

So the layered claim is this. OKF gives the balance a **shape and an official name.** The surrounding process — standardized deltas and an enforced delivery lifecycle — gives it a **heartbeat.** The bank has both: a standard form for the balance *and* the machinery that updates it the moment money moves. A knowledge format without that machinery is a balance nobody keeps current, which is to say, no balance at all.

---

## 8. What it costs, and what could go wrong

None of this is free, and the story would be dishonest if it pretended otherwise.

Keeping a graph of small facts current is real, ongoing work — more moving parts than one big document, not fewer. It is mitigated by deriving everything derivable from code and by making the fold-back a step in *done*, but a team that quietly skips it will rot the balance like any other doc, only now an agent acts on the rot at speed. The balance is also a **shared, contended artifact**: many teams editing one representation of reality creates the same coupling as many teams editing one module, and it needs the same answer — clear ownership per concept, which OKF's front matter is a natural place to record. **Enforcement remains the crux**: everything here collapses without a signal that fires when the balance and the system disagree, and that is harder for narrated intent than for generated contracts — so be honest about which nodes are enforced and which are merely maintained. **Writing good deltas is a skill** that only pays off once the balance is trustworthy enough to diff against, a chicken-and-egg that has to be bootstrapped on purpose. And **OKF v0.1 will change** — so bet on the idea (a neutral, file-based balance beside the code) and keep the coupling to any specific field loose. Finally, where the line falls between *balance*, *decision*, and *mere history* is a matter of judgment; OKF's concept-versus-`log.md` split gives that judgment a home, not a formula.

---

## 9. The recommendation, in one breath

Adopt the **balance-not-ledger** model, and give the balance a place to live and a pulse to keep it:

Materialize the representation of reality as a **living knowledge graph** — small, connected, capability-organized concept files, in the repository, beside the code, in a neutral shape such as OKF. Make **every PRD a transaction** against that graph, and **fold it back** as part of the definition of done, so the truth converges on reality instead of accumulating away from it. **Derive from code where you can and enforce the rest in CI**, so the balance can't drift in silence — for a human or for a machine. Keep the deep **why in decision records**, and **evict, don't delete, the ledger** to an indexed, on-demand archive (OKF's `log.md` and an `/archive/` are its natural homes). And **represent once, consume everywhere** — one graph, read the same way by every agent and every person — retiring the drawer full of per-assistant prompts.

Part one asked a narrow, answerable question: *what is the default view of the platform?* This paper's answer is that the default view should be a **living representation of reality** — and that a format alone, however official, will never keep it living. Google has given the balance a name and a shape. Whether it stays true is on us. The engineer who opened this paper deserves to type her question and read one current file, one link from its history — the same way every bank in the world already shows you your money.

---

## Appendix A — Glossary

- **Representation of reality** — The artifact whose only job is to state, plainly and currently, *what is true now.* The platform's balance. Overwrite-in-place, organized by capability, read by humans and agents alike. (What part one called the current-state specification.)
- **Balance / ledger** — From part one. The **balance** is the representation of reality — a fold over history, materialized and shown first. The **ledger** is the append-only, immutable history of changes (PRDs, RFCs), preserved but kept off the hot path.
- **OKF (Open Knowledge Format)** — A vendor-neutral specification (Google Cloud, v0.1, June 2026) that gives curated, agent-ready knowledge an official name and shape: a bundle of interlinked markdown *concept* files with YAML front matter, optionally with `index.md` (navigation) and `log.md` (change history).
- **Concept** — One node of the balance: a single API, capability, entity, workflow, rule, or procedure, in one small overwrite-in-place file.
- **Delta model** — Treating a PRD as a *transaction* — the difference between today's balance and tomorrow's — authored against the graph and folded back into it once the change ships.
- **Knowledge lifecycle** — The loop *PRD → implementation → balance updated → better next PRD*, in which the truth converges on reality rather than accumulating.
- **Semantic model of the enterprise** — What a maintained balance grows into: every capability, rule, service, interface, and decision as a connected node, shared by humans and agents.
- **Heartbeat / synchronization discipline** — The process (standardized deltas plus an enforced delivery lifecycle) that keeps the balance true; distinct from the format, which only makes it portable.
- *(Carried from part one: **state**, **event log / ledger**, **projection / fold**, **materialized view**, **drift**, **ADR**, **fitness function**.)*

## Appendix B — Background and Further Reading

Claims are paraphrased and attributed.

- **Open Knowledge Format** — Google Cloud, *How the Open Knowledge Format can improve data sharing* (2026); the `GoogleCloudPlatform/knowledge-catalog` repository (`okf/SPEC.md`). OKF v0.1 formalizes the "LLM-wiki" pattern into a portable markdown bundle of concepts and is explicitly an early starting point.
- **The balance / ledger story** — Part one of this series, *The Balance, Not the Ledger*; the argument that the truth of a platform is a balance materialized over a ledger of changes, bound to enforcement, with history evicted-not-deleted.
- **Spec-Driven Development, MCPs, and the Spec Graph** — internal SDD one-pager and operating-model notes; the position that development should rest on an *executable source of truth* rather than tribal knowledge, and that agents consume governed context rather than inventing it.
- **Documentation drift / the "spec-evergreen" problem** — widely discussed: documents written once, briefly read, then abandoned while the code moves on.
- **Fitness functions / evolutionary architecture** — Ford, Parsons, and Kua, *Building Evolutionary Architectures*; architectural knowledge coupled to artifacts with their own enforcement.
- **Architecture Decision Records** — Michael Nygard, *Documenting Architecture Decisions* (2011); short, durable records of decisions, superseded-not-deleted.
- **"Spec as source of truth" and the rebuild test** — industry guidance on treating the specification as the primary artifact and code as derived.

---

*This is a position paper focused on the problem and the principle of a solution. OKF is referenced as a concrete, currently-available shape for the balance; the recommended direction — materialize the representation of reality, express change as a transaction, keep it beating by process, enforce it with a signal — is independent of any specific format or tool.*
