# Collaboration by Design

## A Guardrailed Collaboration Model for Human Developers and AI Agents

---

## Summary

**Proposal: component owners should stop reviewing every implementation detail and instead own a contribution system — explicit boundaries, supported extension points, and automated enforcement — that lets other teams and AI agents contribute safely.**

The reason this works is that most review comments are not judgment calls. They are the same corrections repeated: a dependency that shouldn't exist, a factory that wasn't used, a pattern the contributor had no way to know about. Knowledge that only lives in a reviewer's head has to be re-transmitted on every pull request, and that cost grows with contribution volume. Knowledge encoded in the repository is transmitted once and enforced continuously.

This applies to components that already have stable boundaries and a normal rate of external contribution. It does not apply to components in early architectural flux, and it should not be applied without carve-outs to authentication, cryptography, payment card scope, or anything where a missed defect is not recoverable. See *Where this does not apply*.

The ask: pick one high-traffic component, run the adoption sequence in section 15, and measure the four numbers in section 16 for one quarter before extending it.

---

## 1. The problem

A team that does not own a component often needs to change it. Routing every such change through the owning team creates a queue. Bypassing the owning team creates architectural drift, because the owner still carries the domain, the invariants, the reliability, and the long-term maintenance.

The usual resolution is human code review: the contributor implements, the owner reads the pull request carefully and works out whether the contributor understood the architecture, the conventions, the business rules, and the intended approach.

That model has a fixed cost per pull request and no economy of scale. AI coding agents remove the constraint that used to keep pull request volume low — the time it takes a human to write the code — while leaving the review constraint exactly where it was. A team can end up spending more time reviewing other teams' work than doing its own.

The answer is not to weaken ownership or drop review. It is to change what ownership and review are for.

---

## 2. The shift

> **Ownership moves from reviewing every implementation to defining and enforcing the boundaries inside which contribution is safe.**

The owner still owns the domain. But instead of teaching each contributor how the component works, the team builds a paved road: the repository states what the component owns, what it does not own, which dependencies are forbidden, which extension points are supported, and how common changes are made — and enforces as much of that as tooling allows.

Source code alone cannot carry this. Code shows what exists; it does not say whether what exists is the intended pattern, a workaround, legacy, or a mistake nobody has removed yet. A contributor reading `PaymentProcessor` cannot tell which. Neither can an agent. Inference is not intent.

> **Prefer explicit architectural and domain knowledge over inferred conventions.**

The repository becomes a place that teaches how the component is meant to change, in a form both humans and agents read.

---

## 3. Where to start: your review comments are the specification

The fastest way to find what belongs in the contribution system is to read the last three months of pull request comments on your component.

Comments like:

```text
Don't instantiate this directly; use the factory.
This should go through the port, not the repository.
Add a contract test for this adapter.
```

Each one is knowledge the reviewer holds and the contributor did not. Every time it recurs, the team pays for it again.

The principle:

> **Every review comment that can reliably become a rule should eventually stop being a review comment.**

Comments move up an escalation of strength as they prove themselves:

```text
Repeated review comment
        ↓
Explicit AGENTS.md rule
        ↓
Component skill
        ↓
AI PR validation
        ↓
Static or architecture rule where practical
```

This gives the adoption effort a work queue drawn from evidence rather than from a blank page. It is also the ongoing mechanism: the contribution system is never finished, and recurring corrections are the signal telling you where it is thin.

---

## 4. Three kinds of knowledge

Not everything is a rule. Separating the three prevents the single undifferentiated README that serves none of them.

**Rules — what must or must not happen.**

```text
Domain code must not import infrastructure implementations.
Settled transactions cannot be modified.
Cross-domain implementation dependencies are prohibited.
```

**Context — what a contributor needs to understand to decide correctly here.**

```text
This directory owns settlement business rules.
Refunds create new transactions rather than modifying settled ones.
Inventory is a separate bounded context.
```

**Skills — how a recurring type of work is performed here.**

```text
How to add a payment provider.
How to introduce a new validation rule.
How to consume an event from another bounded context.
```

```text
Rules   → What must or must not happen?
Context → What do I need to understand?
Skills  → How do I do this correctly?
```

---

## 5. Local `AGENTS.md` files

Instructions live next to the code they govern:

```text
src/
├── AGENTS.md
├── domain/
│   ├── AGENTS.md
│   ├── payments/
│   │   └── AGENTS.md
│   └── settlement/
│       └── AGENTS.md
├── infrastructure/
│   └── AGENTS.md
└── api/
    └── AGENTS.md
```

A change to settlement logic inherits `src/AGENTS.md` + `src/domain/AGENTS.md` + `src/domain/settlement/AGENTS.md`. Nothing about deployment, unrelated APIs, or other bounded contexts.

**Precedence must be stated, not left to interpretation.** Two files will eventually contradict each other, and an unspecified resolution means each agent and each contributor picks their own. Write the rule down in the root file. The default that works:

- The nearest file wins on conventions and implementation guidance.
- The outer file wins on security, compliance, and dependency policy. Inner files may tighten these, never relax them.
- A rule that must never be overridden is marked as such and belongs at the level that owns it.

**Discovery cannot be assumed.** Agent tooling differs on whether nested instruction files are loaded automatically or must be found. If they are not loaded, the model fails silently — the agent behaves as though the rules do not exist. The root file must contain an explicit instruction to read the `AGENTS.md` in the directory being modified and every parent up to the root, and the pilot should verify with a deliberately rule-violating request that the nested file was actually applied.

**Keep them small.** Around 50 lines. These files hold information that changes an implementation decision in that directory. They are not the architecture wiki.

> **If an AGENTS.md needs hundreds of lines, most of that belongs somewhere else.**

---

## 6. Rules should teach

Instructions are a knowledge transfer mechanism for collaborating teams, not only a fence for agents. Compare:

```text
Do not depend on Payments.
```

with:

```text
Do not import Payment domain implementations.

If Orders needs payment status:
- consume PaymentStatusChanged; or
- use PaymentStatusPort.

Do not access Payment repositories directly.
```

The second states the restriction and the supported path. A contributor who hits the first one has to go ask someone, which is the cost the model exists to remove.

Rules also need to be objective enough that two readers reach the same interpretation. "Follow good architecture practices" fails that test. This passes:

```text
Application services may depend on domain interfaces.
Domain objects must not depend on infrastructure implementations.
External SDKs must be wrapped by adapters under /infrastructure.
```

> **Every contribution rule should be machine-actionable and human-understandable.**

---

## 7. Explicit domain and bounded-context boundaries

The component's top-level instructions describe the operational contract, not just coding style. A contributor should be able to answer, without asking anyone: what does this own, what does it explicitly not own, what enters and leaves, who produces the inputs and consumes the outputs, which domains it may talk to and through which contracts, which dependencies are forbidden, where new business logic goes, and which extension points are supported.

### Example

```md
# Orders Domain

## Purpose

Owns the lifecycle and business invariants of customer orders.

## Boundaries

Owns:
- Order creation
- Order state transitions
- Order validation
- Order cancellation rules

Does NOT own:
- Payment processing
- Customer profile management
- Inventory persistence
- Shipping orchestration

## Dependency Rules

- Orders must not import Payment domain implementations.
- Domain code must not call external APIs directly.
- Cross-domain communication uses defined contracts or events.
- Infrastructure concerns stay outside the domain layer.

## Inputs

Arrive through REST adapters, events, or application services.
Translate external representations into domain commands or value objects.

## Outputs

Domain results, domain events, defined domain errors.
Do not expose infrastructure-specific objects.

## Extension Rules

- New order validations implement `OrderRule`.
- New behavior must not bypass `OrderStateMachine`.
- Cross-domain business logic does not go inside Order entities.
```

A short placement decision tree in the local file prevents a surprising amount of drift:

```text
Protects a domain invariant?              → domain
Coordinates multiple domains?             → application/orchestration
Calls a DB, API, queue, filesystem, SDK?  → infrastructure/adapters
Is another context's business rule?       → not this domain
```

---

## 8. Layered standards

"We use TypeScript" is not a standard. Two TypeScript components can legitimately run opposite programming models — one functional, pure, immutable, result types, no classes; the other object-oriented with DDD aggregates, dependency injection, repositories, value objects. Both can be right for their domain.

```text
Enterprise standards
        ↓
Platform standards
        ↓
Component standards
        ↓
Domain/directory-local rules
```

Upper levels hold the things where inconsistency is actually expensive: security, compliance, secrets handling, observability, dependency policy, supported technology, mandatory quality controls. Lower levels hold implementation philosophy and local conventions.

This protects consistency where it matters without forcing every component into one architecture.

---

## 9. Architecture that supports safe extension

Rules are the weakest layer. A component that is easy to extend correctly needs fewer of them.

Critical logic sits behind explicit contracts; contributors work through supported extension mechanisms rather than editing core behavior:

```text
                 CORE DOMAIN
                     │
          owns critical invariants
                     │
       ┌─────────────┼─────────────┐
   Contract A    Contract B    Extension C
       ↑             ↑             ↑
       └────── contributors ───────┘
```

```text
Need a new validation?     → implement ValidationRule
Need a new provider?       → implement ProviderAdapter
Need a new transformation? → implement Transformer
Need a new transport?      → implement TransportAdapter
```

Interfaces, ports, adapters, strategies, factories, registries, domain events, plugins, policy objects — the construct matters less than the fact that the supported path is narrow and the unsupported paths are structurally awkward. Open for extension, closed for modification does more work here than it does in a normal codebase, because the contributor is not on your team and cannot be relied on to know what is load-bearing.

---

## 10. Skills as the implementation playbook

A skill encodes how this component expects a recurring task to be done. An `add-provider` skill knows the extension point, the required interface, the registration mechanism, configuration conventions, error handling, observability requirements, testing strategy, and which existing provider to copy.

A contributor can then add a provider without first becoming an expert in the component, and the agent is not free to invent a new architecture each time.

> **AI agents supply implementation capacity. Component skills supply implementation knowledge.**

---

## 11. Encode each rule at the strongest practical level

```text
Knowledge
   ↓  documentation / guideline
   ↓  AGENTS.md instruction
   ↓  agent skill
   ↓  AI validation
   ↓  lint / static analysis
   ↓  architecture test
   ↓  contract / automated test
   ↓  compiler / type system
```

Examples:

```text
"Prefer factories for provider creation"        → AGENTS.md / skill
"Payment domain must never depend on HTTP"      → architecture test
"Money is never an arbitrary number"            → domain type / compiler
```

The line that matters: **critical invariants must not depend on an agent remembering an instruction.** Anything whose violation is expensive belongs at or below the lint layer. Text is for guidance, not for protection.

Deterministic checks — formatting, naming, imports, prohibited APIs, dependency direction, file structure, type safety — should never reach a human reviewer at all.

---

## 12. AI pull request review, and what it is worth

An AI reviewer reading the same repository knowledge as the implementation agent can catch architectural pattern violations, dependency and bounded-context breaches, local convention drift, missing extension mechanisms, missing tests, and framework misuse — before a human opens the pull request.

```text
                COMPONENT KNOWLEDGE
                       │
           ┌───────────┴───────────┐
   Implementation Agent       Review Agent
   "How is this built here?"  "Did this follow the rules?"
           └──────── PR ───────────┘
```

Two limits belong in the design, not in a footnote.

**It is not deterministic, so it does not block.** Run it advisory for at least a quarter. A blocking check with false positives is removed by the first team it delays unfairly, and it takes the credible findings with it. Promote a specific check to blocking only after it has been quiet enough to trust — and if it is that reliable, it is usually a candidate for a static rule instead.

**It shares a failure mode with the implementation agent.** Both read the same rules, which is good for consistency and bad for detection: if an `AGENTS.md` is wrong or silent on something, the implementation agent does the wrong thing and the review agent approves it. The circle only closes with checks that do not read the prose — architecture and contract tests — plus the human reviewer. Do not let the AI review layer justify shrinking human attention further than section 13 describes.

---

## 13. What human review becomes

A reviewer today evaluates syntax, style, patterns, architecture, framework usage, tests, security, business rules, edge cases, and intent at the same time. Most of that list is compliance checking, and compliance checking crowds out judgment.

| Question | Primary enforcement |
|---|---|
| Formatted correctly? | Tooling |
| Follows coding conventions? | Linter / static analysis |
| Violates dependency rules? | Architecture tests |
| Framework used per component conventions? | Skills + AI validation |
| Violates documented component rules? | AI reviewer |
| Breaks contracts? | Automated tests |
| Is the business logic correct? | Human reviewer |
| Does it satisfy the intended outcome? | Human reviewer |
| Is a domain edge case missing? | Human / domain expert |

> **Human review becomes judgment-oriented instead of compliance-oriented.**

---

## 14. Defense in depth, and who is allowed to change it

```text
                    HUMAN DOMAIN REVIEW
                           ↑
                     AI PR REVIEW
                           ↑
                 CONTRACT / DOMAIN TESTS
                           ↑
                  ARCHITECTURE TESTS
                           ↑
                LINT / STATIC ANALYSIS
                           ↑
                    AGENT SKILLS
                           ↑
               LOCAL AGENTS.md CONTEXT
                           ↑
                   REPOSITORY RULES
                           ↑
             ARCHITECTURAL EXTENSION POINTS
                           ↑
                       CONTRIBUTOR
                  Human or AI Agent
```

Each layer removes problems that would otherwise reach the layer above.

### The rule files are part of the security boundary

`AGENTS.md` files, skills, architecture test definitions, and lint configuration are instructions that agents follow closely — more closely than a human contributor would follow a wiki page. That makes them a control surface, and it has a consequence that is easy to miss:

**if a contributor can edit the rules in the same pull request as the code, they can rewrite the standard their own change is judged against.** This does not require bad intent. An agent that hits a rule blocking its task may edit the rule, because from inside the task that looks like a reasonable way to make the check pass.

Requirements, not suggestions:

- Every `AGENTS.md`, skill file, architecture test, and lint config is covered by CODEOWNERS pointing at the owning team.
- Changes to those files always require human approval from the owning team, and never from an AI reviewer alone.
- Rule changes go in their own pull request, separate from feature work. A diff that touches both is a signal to look harder, not a convenience.
- The AI reviewer reads the rules from the target branch, not from the pull request head.

---

## 15. Keeping the context true

Stale instructions are worse than none. A human discounts a wiki page that looks old; an agent does not. Wrong context produces confidently wrong implementations that pass review.

Three mechanisms, in order of cost:

1. **Couple rules to code.** A rule that names `OrderStateMachine` should break when that type is renamed. Prefer architecture tests and typed contracts over prose wherever the same statement can be made in both — the test fails when it stops being true, the paragraph does not.
2. **Make the owner's own changes trigger review.** When a pull request modifies an extension point, a contract, or a public interface, require that the adjacent `AGENTS.md` be reviewed in the same change. A CODEOWNERS rule plus a checklist item is enough.
3. **Date and own each file.** A short header with owner and last-reviewed date, and a quarterly sweep of anything untouched for two quarters. Cheap, and it catches the files everyone forgot.

The failure to watch for is a component whose contribution system was built once, during the pilot, and has been drifting since. It looks healthy in a dashboard and it lies to every agent that reads it.

---

## 16. When the paved road doesn't cover the change

The model handles the routine change well. The interesting cross-team work is often exactly the change that needs a new extension point — and if the only available answer is "that isn't supported," contributors go around the road, or go back to blocking on the owner, and the model has bought nothing for the hardest cases.

Publish the escalation path in the component's root instructions:

- **How to ask.** A specific issue type or template: what the contributor needs, why existing extension points don't cover it, and what they propose.
- **Who decides and how fast.** A named role and a stated response time. An unstated SLA becomes an indefinite one.
- **What the answers are.** Add an extension point; do it in the owning team's backlog; pair on it; or refuse with a reason. "Refuse with a reason" is legitimate and should be visibly available, because a road that can never say no is not a boundary.
- **Where the decision lands.** In the repository, next to the code, as a rule or an updated boundary — not in a chat thread.

Track how often this path is used. Frequent use is not a failure of the model; it tells you which extension points are missing. Zero use in a component with active contributors usually means people are working around the road rather than through it.

---

## 17. Where this does not apply

Say this explicitly, or someone will apply the model where it does damage.

- **Components in architectural flux.** Encoding boundaries that are still moving produces rules that are wrong within weeks and a maintenance burden that discredits the whole approach. Stabilize first.
- **Irreversible-failure surfaces.** Authentication and authorization, cryptography and key handling, payment card scope, anything under regulatory attestation. Contributors and agents can still contribute; full human review by the owning team stays mandatory. The guardrails are additive here, never a replacement.
- **Components with almost no external contribution.** The contribution system has a real build and maintenance cost. If two external pull requests arrive per year, ordinary review is cheaper. Let contribution volume decide.

---

## 18. Adoption

Do not roll this out across an estate. It is a per-component investment and the first one is a pilot.

1. **Pick one component** with real external contribution volume and stable boundaries.
2. **Mine three months of pull request comments.** Sort into rules, context, and skills. This is your backlog and it is evidence-based (section 3).
3. **Write the top-level boundary document first** (section 7). Owns, does not own, forbidden dependencies, extension points. This alone removes a surprising share of review comments.
4. **Encode the two or three most-violated rules as architecture tests**, not prose. Start at the enforcement level that holds (section 11).
5. **Add local `AGENTS.md` files only where contributors actually work.** Not one per directory on principle.
6. **Build one skill** for the most common recurring change.
7. **Turn on AI review in advisory mode.** Read its findings for a month before deciding whether any of them should block.
8. **Protect the rule files with CODEOWNERS** before the first external contribution arrives, not after (section 14).
9. **Measure for a quarter** (section 19), then decide whether to extend.

Steps 3 and 4 deliver most of the value. Steps 5–7 are where the effort goes. A component that stops after step 4 is still better off than it was.

---

## 19. Measuring it

Without numbers this is unfalsifiable and hard to fund a second time. Four measurements, collected before the pilot starts:

- **Cycle time for external pull requests** — first commit to merge. The headline number.
- **Review comments per pull request, split into compliance and judgment.** The intended movement is compliance comments down, judgment comments flat or up. A drop in both usually means reviewers disengaged, which is a different and worse outcome.
- **Rework rate** — pull requests requiring more than one round of changes, and what caused each round.
- **Owner review hours spent on other teams' pull requests.** The cost the model exists to reduce.

Two counter-metrics, because this model can fail in ways the four above will not show: **post-merge defect rate on externally contributed changes**, and **escalation path usage** (section 16). Faster merges with rising defects is not a success, and it is the specific failure this model risks.

---

## 20. Collaboration-ready: a rubric

> **A component is collaboration-ready when a contributor can understand its boundaries and supported extension paths, implement a normal change safely, and get automated feedback without the owning team explaining the component first.**

Assess against levels rather than a yes/no:

**Level 0 — Tribal.** Boundaries and rationale exist only in senior team members' heads. Every non-trivial external change needs a conversation.

**Level 1 — Documented.** A boundary document exists and is current: what the component owns, what it does not own, forbidden dependencies, inputs and outputs, supported extension points. A contributor can orient without asking.

**Level 2 — Localized.** Small `AGENTS.md` files sit next to the code that they govern, with stated precedence. Instructions explain the supported path, not only the restriction.

**Level 3 — Enforced.** The critical invariants are architecture tests, contract tests, or types — not paragraphs. Violations fail in CI, not in review.

**Level 4 — Guided.** Skills exist for the recurring change types. A contributor with no prior knowledge of the component can complete a standard change end to end.

**Level 5 — Self-improving.** Recurring review comments are routinely converted into rules or checks, rule files are owner-protected, context freshness is maintained, and the escalation path for unsupported changes is published and used.

Most components should aim at level 3. Level 4 and 5 pay off where contribution volume is high.

The diagnostic question for level 0: if the answers to *why does this exist, what does it own, what are the invariants, what is forbidden, where does new logic go, and how are violations detected* live only in a few people's heads, the component is not collaboration-ready no matter how good the code is.

---

## 21. Objections and responses

**"This is a large documentation effort that will rot."** Correct, if it is treated as documentation. The mitigation is structural: put every rule that can be a test at the test level (section 11), couple prose to code so renames break it, and require adjacent context review when extension points change (section 15). A component that only writes prose will rot, and should expect to.

**"An AI reviewer approving AI-written code is a rubber stamp."** Partly true. It is a filter, not an approval, and it shares a blind spot with the implementation agent. That is why it runs advisory, why the deterministic layers below it do not read the prose, and why human review of business logic and intent stays mandatory (section 12).

**"Contributors will just edit the rules to make their change pass."** This is the sharpest objection and it is why section 14 exists. Rule files are owner-owned via CODEOWNERS, always human-approved, changed in separate pull requests, and read from the target branch by the reviewer.

**"We already tried inner source and nobody contributed."** Likely diagnosis: contribution was allowed but not made safe, so owners defended themselves with heavy review, and contributors learned it was slower than asking. The difference here is where the effort goes — into extension points and automated checks rather than into review capacity. If the pilot's cycle time does not move, that objection was right for your organization and the answer is to stop.

**"This weakens ownership."** It moves ownership from per-change gatekeeping to owning the contribution system: boundaries, invariants, extension points, conventions, agent instructions, skills, tests, enforcement, and review criteria. Contributors get autonomy inside the road. They do not get authority over the road.

---

## 22. Principles

1. **Ownership stays explicit.** Every component has a team accountable for its domain and evolution.
2. **Make intent explicit.** Nobody should reverse-engineer architectural intent from source code.
3. **Context lives close to the code**, in small files, with stated precedence.
4. **Rules teach.** State the restriction and the supported path.
5. **Humans and agents consume the same knowledge**, for implementation and for review.
6. **Protect critical logic structurally** — contracts, types, extension points — not with paragraphs.
7. **Automate deterministic review.** Humans do not re-check what machines check reliably.
8. **Keep domain boundaries explicit**, including what does not belong and which cross-domain interaction is legal.
9. **Allow local implementation philosophies.** Enterprise consistency where it matters; component choice elsewhere.
10. **Turn recurring review feedback into guardrails.** Repeated corrections mark where the system is thin.
11. **Own the rules themselves.** Instruction files are a control surface and are protected as one.
12. **Publish the path for unsupported changes.** A road with no exit is a wall.

---

## 23. End state

```text
Component Owner
      ├── domain boundaries
      ├── architecture and extension points
      ├── explicit rules and local context
      ├── implementation skills
      └── automated enforcement
                     ↓
             CONTRIBUTION SYSTEM
                     │
        ┌────────────┴────────────┐
 Human Contributor           AI Agent
        └────────────┬────────────┘
                     ↓
               Implementation
                     ↓
       Automated guardrails & tests
                     ↓
              AI PR review (advisory)
                     ↓
       Human review: logic, intent, risk
```

Not autonomous AI development without human ownership. A system where ownership, collaboration, and AI-assisted development reinforce each other:

> **Do not scale collaboration by asking owners to review more. Scale collaboration by making the component safer and easier to contribute to.**

---

## Changelog

### Structural

- **Added a summary at the top** carrying the claim, the reason it holds, the scope limits, and the specific ask. The original stated its thesis in section 2 and repeated it in sections 4, 22, and 23.
- **Cut from 23 sections to 23 shorter ones, roughly 35% less text**, by removing the four restatements of the core thesis and merging overlapping material (old §§2+4 → new §2; old §§9+10 → new §7; old §§14+15 → new §11; old §§18+3 → new §3).
- **Moved "review comments become rules" from §18 to §3.** It is the practical entry point and the source of the adoption backlog; burying it at position 18 of 23 hid the most usable idea in the document.
- **Converted "collaboration-ready" from a prose definition into a six-level rubric** (§20), so it can be assessed rather than admired.
- **Added an "Objections and responses" section** (§21) with the five pushbacks the document will actually receive, stated in their strongest form.

### New content

- **§14, "The rule files are part of the security boundary."** The original never addressed who may modify `AGENTS.md` files and skills. Since agents follow them closely, a contributor able to edit the rules in the same pull request as the code can rewrite the standard their change is judged against — and an agent may do this without any bad intent, simply to get past a blocking check. Added CODEOWNERS protection, mandatory human approval, separate pull requests for rule changes, and reading rules from the target branch. This was the most serious gap.
- **§12, limits of AI review.** The original presented AI review with the same confidence as the deterministic layers, and framed shared knowledge between the implementation and review agents purely as a strength. Added: advisory by default, and the shared-blind-spot problem — a wrong or silent rule produces a wrong implementation that the reviewer then approves.
- **§15, keeping the context true.** No treatment of drift in the original. Stale instructions are more dangerous for agents than for humans because agents do not discount them.
- **§16, when the paved road doesn't cover the change.** The original had no escalation path. Without one, the paved road becomes a way of saying no and contributors route around it.
- **§17, where this does not apply.** Added carve-outs for components in architectural flux, irreversible-failure surfaces (auth, crypto, PCI scope), and components with too little contribution volume to justify the cost.
- **§18, adoption sequence.** The original described an end state with no route to it. Nine ordered steps, with a note on which two deliver most of the value.
- **§19, measurement.** The original listed desired outcomes with no way to tell whether they occurred. Four metrics plus two counter-metrics, including post-merge defect rate — the specific way this model can fail while looking successful.
- **§5, precedence and discovery.** Added explicit precedence rules for conflicting `AGENTS.md` files (nearest wins on conventions, outer wins on security and compliance) and a warning that nested instruction discovery is tooling-dependent and fails silently when it doesn't happen.
- **§11, "text is for guidance, not for protection."** Sharpened the existing enforcement ladder with the line that determines where each rule goes.

### Editorial

- Removed the closing recap sections; the summary moved to the top where a scanning reader finds it.
- Trimmed repeated boxed pull-quotes, keeping one per idea.
- Replaced abstract phrasing with concrete statements where a fact was available.
- Left the diagrams and the Orders Domain example largely intact — they were the strongest parts of the original.
