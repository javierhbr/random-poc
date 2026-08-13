# Spec-Driven Delivery: Requirement, Design, and Delivery

## 0. The core claim

A requirement document does not have to be non-technical. It can be *deeply* technical.

The boundary that matters is **not** business vs. technical. It is:

> **Constraint** (something the solution must satisfy)
> vs.
> **Decision** (something we choose about how to build it)

Most teams get this wrong in one of two directions: they strip all technical content out of the requirement and produce something unimplementable, or they pour implementation into it and pre-empt the design. Both failures come from using the wrong axis.

### A terminology warning

This document uses **PRD** for the requirement artifact. In many organisations PRD means a product-manager document that deliberately excludes technical content. If that is true where you work, do not fight the word — name the artifact explicitly, e.g. **Product PRD + Technical Spec**, or simply **Requirement Spec**. What matters is the boundary, not the label.

---

## 1. Two tests that actually decide

"Must the solution satisfy it?" is not a usable test on its own, because *any* implementation decision can be rewritten as a MUST:

> The system MUST use Redis.

That sentence passes the naive test and is still obviously a design decision. Two sharper tests do the real work.

### The Ownership Test

> If changing it requires renegotiating with someone **outside** the implementing team — an existing consumer, a system you do not own, a regulator, a contract already published — it is a **constraint**. It belongs in the PRD.
>
> If the team can change it unilaterally next sprint without breaking anyone, it is a **decision**. It belongs in the Technical Design.

### The Boundary Test

> The PRD may specify anything **observable at the system's boundary**: inputs, outputs, contracts, external data sources, externally visible behaviour and failure modes.
>
> Everything **inside** the boundary is design.

The two tests agree in almost every case. Where they disagree, the Ownership Test wins — it is the one grounded in real-world cost of change.

### What this changes about the obvious examples

This is not a cosmetic refinement. Applied honestly, it reclassifies things most people would have put in the PRD:

- *"Publish to Kafka topic `customer-eligibility-events`"* is a requirement **only if a consumer already depends on that topic name**. If the team is free to name it, specifying it in the PRD is over-constraining.
- *"Read from Database X / Customer table"* is the same. If the data must come from that system of record, that is a constraint. If the table is merely where it happens to live today and the team could front it with a service, the table name is design.

The habit to build: when you write a technical line into a PRD, name the party who would have to agree to change it. If you cannot name one, move the line to the design.

---

## 2. Borderline cases, worked

| Item | Verdict | Why |
|---|---|---|
| "Must be idempotent on retry" | **PRD** | Externally observable behaviour; consumers rely on it |
| "Retry 3× with exponential backoff" | **Design** | Internal policy — unless a downstream contract mandates it |
| Idempotency key format | **PRD** *if* the caller supplies it | It is part of the request contract |
| Kafka topic name | **Depends** | PRD if an existing consumer is subscribed; Design if newly created |
| Source table name | **Depends** | PRD if the table *is* the system of record and access is mandated; Design if the team owns the access path |
| p99 latency ≤ 300 ms | **PRD** | Observable at the boundary; usually externally committed |
| Thread pool size 10 | **Design** | Purely internal tuning |
| Use Redis for caching | **Design** | No external party can observe the choice |
| "Cached data must be no more than 60s stale" | **PRD** | The *consequence* is observable; the mechanism is not |
| Response schema v3 | **PRD** | A published contract |
| `CustomerEligibilityRepository` class | **Design** | Invisible outside the codebase |
| Encryption at rest required | **PRD** | Compliance constraint imposed externally |
| AES-256 via KMS specifically | **Depends** | PRD if the policy names the standard; Design if only "encrypted" is mandated |
| "Only active customers effective at processing time" | **PRD** | Business selection rule |
| The SQL that implements that rule | **Design** | One of several valid mechanisms |

Notice the recurring pattern in the *Depends* rows: **the obligation is in the PRD, the mechanism is in the design.** Where a standard is named by an external policy, the name itself becomes the obligation.

---

## 3. What a technical PRD legitimately contains

Structured as a checklist:

**Intent**
- WHY — the outcome sought, and for whom
- Success metrics, with baselines and targets
- Non-goals / explicit out-of-scope
- Assumptions (and what happens if each proves false)

**Behaviour (the WHAT)**
- Functional requirements
- Business rules and transformations
- Expected error behaviour and failure semantics
- Acceptance criteria — testable, one per requirement

**Technical WHAT (the boundary)**
- Source systems and required attributes
- Functional selection criteria
- Endpoints, request/response contracts, headers, schemas
- Events, topics, integration contracts
- Ordering and idempotency requirements
- SLAs and performance envelopes
- Security, privacy and compliance constraints

**Not in the PRD**
- Frameworks, libraries, ORMs
- Class, module and repository names
- Design patterns
- Internal component decomposition
- Infrastructure choices with no observable consequence
- Concrete SQL, as an instruction

---

## 4. Normative vs. non-normative content

Illustrative material is genuinely useful — a reference query can eliminate ambiguity that prose cannot. But "illustrative only" written next to a code block is not a safeguard. Humans implement it literally. AI agents implement it *very* literally.

Make the split **structural**, not a caveat:

1. Use RFC 2119 keywords — **MUST / MUST NOT / SHOULD / MAY** — in the body. Only sentences with a keyword are binding.
2. Put every example, sample query and reference snippet in a clearly marked **Appendix: Non-normative**.
3. State once, up front: *nothing in the non-normative appendix is a requirement; where it conflicts with the body, the body wins.*

So the requirement reads:

> The system MUST consider only customer records with status `ACTIVE` whose `effective_date` is on or before the processing date.

And the appendix carries, separately:

```sql
-- Non-normative illustration of the selection rule
WHERE effective_date <= processing_date
  AND customer_status = 'ACTIVE'
```

The implementation may satisfy this with SQL, an ORM, a stored procedure, a service call, or a stream filter. That freedom is the whole point of the separation.

---

## 5. The three levels

```
┌──────────────────────────────────────┐
│ 1. REQUIREMENT / PRD                 │
│                                      │
│    WHY · WHAT · Technical WHAT       │
│    Constraints · Contracts           │
│    Acceptance criteria · Metrics     │
│                                      │
│    Answers: what must be true?       │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 2. TECHNICAL DESIGN                  │
│                                      │
│    HOW · Architecture · Patterns     │
│    Components · Data flow            │
│    Reuse/extend/create decisions     │
│                                      │
│    Answers: how do we make it true?  │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 3. DELIVERY DESIGN                   │
│                                      │
│    Impact analysis · Dependencies    │
│    Tracer bullets · Vertical slices  │
│    Tasks / stories · Sequencing      │
│                                      │
│    Answers: how do we ship it safely?│
└──────────────────────────────────────┘
```

The governing relationship:

> You do **not** need a Technical Design to define the requirement.
> You **do** need enough Technical Design to produce a reliable delivery plan.

---

## 6. Estimation: what each level buys you

The common claim — "you can't estimate without design" — is too blunt. More precisely:

| With | You can produce | You cannot produce |
|---|---|---|
| PRD only | A **range**, order-of-magnitude ("roughly two months, ±100%") | A credible breakdown |
| PRD + context discovery | A narrowed range; known unknowns are named | Reliable sequencing |
| PRD + Technical Design | A breakdown into slices with defensible sequencing | Certainty — but the variance is now bounded |

In brownfield, estimate variance is dominated by **unknowns in the existing system**, not by the size of the new feature. This makes context discovery the variance-reduction step, not merely a context-gathering step. If you want a better estimate, discovery buys more than more design does.

Without this, sprint breakdown degrades into inventing tasks from requirements — plausible-looking work items with no relationship to what will actually be changed.

---

## 7. Greenfield vs. brownfield

### Greenfield

Most structural questions are open, so the design must answer them:

```
PRD → Architecture → Components → Data ownership → Integration patterns
    → Contracts → Deployment → Observability → Security → Failure strategy
    → Delivery slices
```

Uncertainty is high early and falls as decisions close.

### Brownfield

The existing system is an input, not a detail:

```
                 PRD
                  │
                  ▼
           Existing System
                  │
       ┌──────────┼───────────┐
       ▼          ▼           ▼
   Patterns   Components   Constraints
       │          │           │
       └──────────┼───────────┘
                  ▼
          Technical Design
```

> **Understand the existing implementation before designing the change.**

Discovery must establish: which components exist; which patterns the platform already uses; where the responsibility currently lives; which interfaces exist; which downstream consumers participate; which conventions are established; which architectural constraints bind; and which technical debt will be touched.

### The change ladder — with a bias

```
REUSE  →  EXTEND  →  MODIFY  →  REFACTOR  →  REPLACE  →  CREATE
```

This is not a menu. It is ordered, and the rule is:

> **Choose the leftmost option that satisfies the requirement. Moving right requires written justification in the design.**

That converts a list into an enforceable guardrail — which matters most with AI agents. An agent should not invent a new architecture because it looks technically superior when the existing system already has an established pattern that adequately solves the problem. "Adequately" is the bar, not "optimally."

---

## 8. The pipeline

The single most important correction to the naive version: **discovery is not strictly downstream of sign-off, and the arrows go both ways.** In brownfield, much of the Technical WHAT — contracts, topics, existing schemas — is *derived from* the existing system. You cannot write it before you have looked.

```
                  BUSINESS / TECHNICAL NEED
                           │
                           ▼
              ┌─────────────────────────┐
              │  CONTEXT DISCOVERY      │◄────┐
              │  Greenfield/brownfield? │     │
              │  Systems · Contracts    │     │
              │  Patterns · Owners      │     │
              └────────────┬────────────┘     │
                           │                  │ discovery
                           ▼                  │ invalidates
              ┌─────────────────────────┐     │ assumptions
              │  PRD                    │─────┘
              │  WHY · WHAT             │
              │  Technical WHAT         │
              │  Constraints · Metrics  │
              │  Acceptance criteria    │
              └────────────┬────────────┘
                           │
                       SIGN-OFF ◄─── gate: criteria testable?
                           │              constraints owned?
                           ▼
              ┌─────────────────────────┐
              │  TECHNICAL DESIGN       │─────┐
              │  HOW · Architecture     │     │ design proves
              │  Reuse/extend/create    │     │ a constraint
              │  Integration · Data flow│     │ unreachable
              └────────────┬────────────┘     │
                           │                  ▼
                           │            (renegotiate PRD)
                           ▼
              ┌─────────────────────────┐
              │  IMPACT ANALYSIS        │
              │  Components · Contracts │
              │  Dependencies · Blast   │
              │  radius · Consumers     │
              └────────────┬────────────┘
                           ▼
              ┌─────────────────────────┐
              │  DELIVERY DESIGN        │
              │  Tracer bullets         │
              │  Vertical slices        │
              │  Dependency removal     │
              └────────────┬────────────┘
                           ▼
                  PI / SPRINT PLAN
                           ▼
                  TASKS / STORIES
                           ▼
                      SMALL PRs
                           ▼
                        DEPLOY
                           │
                           ▼
              ┌─────────────────────────┐
              │  OUTCOME VERIFICATION   │
              │  Metrics vs. targets    │
              │  Did the WHY hold?      │──── feeds the next need
              └─────────────────────────┘
```

The feedback edges are not decoration. Discovery routinely invalidates PRD assumptions — the field does not exist, the SLA is unreachable through that integration, the "existing" endpoint has two incompatible consumers. A pipeline drawn without them is a waterfall that will be violated in practice and then ignored entirely.

The final loop matters just as much: a model whose first box is **WHY** must close on whether the why was achieved. Deploy is not the terminal state.

### Responsibilities

| Artifact | Defines |
|---|---|
| PRD | The solution's **obligations** |
| Technical Design | The **implementation strategy** |
| Impact Analysis | What the strategy **touches** |
| Delivery Design | How it is **safely decomposed** |
| Sprint Plan | **When** and **by whom** |

Task breakdown is therefore a *delivery design activity*, not an administrative one — and good delivery design depends on having enough technical design first.

---

## 9. Why this matters for AI-assisted development

The tempting pipeline is:

```
PRD → agent generates tasks
```

This fails predictably, and the failures are specific:

| Failure | Cause | What prevents it |
|---|---|---|
| Invents integration points that do not exist | No Technical WHAT | Contracts named in the PRD |
| Rewrites an established pattern | No context discovery | The change ladder with its leftmost bias |
| Implements illustrative sample code verbatim | Examples inline with requirements | Normative / non-normative split |
| Produces plausible but unrelated tasks | Skipped impact analysis | Breakdown derived from touched components |
| Over-constrains itself on incidental detail | Design smuggled into the PRD | Ownership Test applied to every technical line |

The structural fix is that **each stage has a named output artifact and explicit exit criteria**, so an agent's work at each stage is checkable rather than merely fluent:

| Stage | Output | Exit criteria |
|---|---|---|
| Context discovery | System map, consumer list, pattern inventory | Every external touchpoint has a named owner |
| PRD | Requirement spec | Every requirement has a testable acceptance criterion; every technical line passes the Ownership Test |
| Technical Design | Design doc | Every requirement traces to a component; every rightward move on the ladder is justified |
| Impact analysis | Change inventory | Every touched component and affected consumer listed |
| Delivery design | Slice plan | Each slice is independently deployable and demonstrable |

The **Technical WHAT** is precisely what stops an agent inventing integration points. The **exit criteria** are precisely what stops it inventing progress.
