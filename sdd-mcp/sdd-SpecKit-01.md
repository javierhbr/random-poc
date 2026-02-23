
## How to Leverage `specify-cli` to Implement Your SDD Methodology

The great news: **SpecKit's CLI maps almost perfectly onto your operating model**. Here's how each layer connects and what you need to add.

---

### The Mapping: Your Model → SpecKit Commands

| Your SDD Layer | SpecKit Command | What It Does |
|---|---|---|
| Platform Constitution / Policies | `/speckit.constitution` | Creates `.specify/memory/constitution.md` — your governing principles, NFRs, UX standards |
| Platform Spec ("the what") | `/speckit.specify` | Creates `specs/001-feature/spec.md` — user stories, functional requirements |
| Clarifications / ADR triggers | `/speckit.clarify` | Structured Q&A before planning, surfaces gaps that would become ADRs |
| Component Spec ("the how") + Contracts | `/speckit.plan` | Creates `plan.md`, `data-model.md`, `contracts/api-spec.json` — tech architecture |
| Gates validation / Spec Graph analysis | `/speckit.analyze` | Cross-artifact consistency & coverage check before implementation |
| Task breakdown / sprint planning | `/speckit.tasks` | Creates `tasks.md` with dependencies, parallel markers, file paths |
| Implementation | `/speckit.implement` | Executes all tasks in order, validates prerequisites first |

---

### Step-by-Step: Running Your Full SDD Flow with the CLI

**Install once:**
```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

**Bootstrap your platform repo:**
```bash
specify init my-platform --ai claude
cd my-platform
claude  # or your AI agent
```

---

#### Phase 1: Platform Constitution (Your "Platform MCP" layer)
```
/speckit.constitution Create principles covering:
- UX consistency standards across domains (Cart, Checkout, Payments)
- Security and PII handling requirements
- Observability: mandatory logging, metrics, tracing
- Contract versioning rules (semantic versioning, dual-publish for breaking changes)
- Definition of Done: spec → gates → implement only
- Domain ownership and boundary rules
```
This creates your **Platform MCP content** in constitution.md — the single document every Component Spec must reference.

---

#### Phase 2: Platform Spec for a Feature
```
/speckit.specify Build a Guest Checkout feature. The platform must support:
- End-to-end UX flow: Cart → Checkout → Payment → Confirmation
- Domain responsibilities: Cart owns session, Checkout owns order state, Payments owns authorization
- Contracts: CartUpdated event v2, OrderPlaced event v3
- NFRs: PII masking on payment data, SLA 99.9%, p95 < 300ms
- No guest data persisted beyond session
```
This creates your **Platform Spec** (`spec.md`) — the "what" owned by PM + Platform Architect.

---

#### Phase 3: Surface ADRs Before Planning
```
/speckit.clarify
```
This is where SpecKit will ask structured questions that surface missing context — exactly your **Gate 1 (Context Completeness)** and **ADR triggers**. For example, it might surface: "How is idempotency handled for payment retries?" → that becomes `ADR-219` you document before proceeding.

---

#### Phase 4: Component Spec + Contracts (per domain)
```
/speckit.plan
Tech stack: Node.js microservices, PostgreSQL per domain, Kafka for events.
- Cart service: Redis session store, REST API
- Checkout service: PostgreSQL, publishes OrderPlaced v3
- Payments service: external gateway integration, idempotent by payment_intent_id
- All services: OpenTelemetry, structured JSON logs, Datadog metrics
```
This generates: `plan.md`, `data-model.md`, and critically `contracts/api-spec.json` — your **Contract Specs** and **Component Specs** in one pass.

---

#### Phase 5: Gates Validation
```
/speckit.analyze
```
This runs your **Gate Check** — cross-artifact consistency before any code is written. It will flag if, say, the plan references an API that isn't in the spec, or if a contract consumer isn't identified.

---

#### Phase 6: Tasks → Implementation
```
/speckit.tasks
/speckit.implement
```
The `/speckit.implement` command already enforces a prerequisite gate: it won't run without a valid constitution, spec, plan, and tasks file — that's your **Gate 5 (Ready-to-Implement)** built in.

---

### What SpecKit Doesn't Cover (and How to Extend It)

Your methodology has layers that go beyond what the CLI provides out of the box. Here's how to close the gaps:

**Spec Graph (traceability)** — SpecKit creates a clean directory structure (`specs/001-feature/`) and git branches, but doesn't maintain a graph. You can extend this by adding a `spec-graph.json` to your `.specify/memory/` directory that the constitution instructs agents to update after every `/speckit.implement` run.

**MCP Router / Domain MCPs** — These don't exist in SpecKit natively. Your best approach: create `domain/` subdirectories under `.specify/memory/` per bounded context (cart, checkout, payments) with invariants and contracts as markdown files. Reference them explicitly in your constitution so agents pull them into every plan.

**Multi-domain Platform Specs** — SpecKit is single-feature oriented. For cross-domain features, initialize separate spec directories per component and link them via `BlockedBy` and `Implements` fields in each spec's front-matter. Something like:

```
specs/
  001-guest-checkout-platform/   ← Platform Spec
  002-cart-component/            ← implements: 001
  003-checkout-component/        ← implements: 001
  004-payments-component/        ← implements: 001, blocked-by: ADR-219
```

**ADR Management** — Add an `adrs/` directory alongside `specs/` and use a simple ADR template in your constitution. Instruct the agent to create ADRs when `/speckit.clarify` surfaces unresolved decisions.

---

### Your Enhanced Directory Structure

```
.specify/
├── memory/
│   ├── constitution.md          ← Platform MCP (UX, security, NFRs, DoD)
│   ├── domains/
│   │   ├── cart.md              ← Domain MCP: invariants, entities
│   │   ├── checkout.md
│   │   └── payments.md
│   └── spec-graph.json          ← Traceability index
├── specs/
│   ├── 001-guest-checkout/      ← Platform Spec
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── data-model.md
│   │   └── contracts/
│   │       ├── api-spec.json
│   │       └── events-spec.md
│   ├── 002-cart-component/      ← Component Spec
│   └── 003-checkout-component/  ← Component Spec
├── adrs/
│   ├── ADR-219-idempotency.md
│   └── ADR-220-event-versioning.md
└── templates/
    ├── spec-template.md
    ├── plan-template.md
    ├── tasks-template.md
    └── adr-template.md
```

---

### The Bottom Line

SpecKit's CLI gives you **phases 0-5 of your SDD workflow automated** — constitution → specify → clarify → plan → analyze → tasks → implement, with built-in prerequisite gates. The gaps are the Spec Graph, Domain MCPs, and multi-domain coordination — but those are straightforward to layer on top using the same file-based conventions SpecKit already establishes. Your operating model and SpecKit are architecturally compatible; SpecKit is essentially the execution engine for the spec layer you've already designed.