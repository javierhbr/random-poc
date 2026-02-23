


# **1) Context Pack v1 Template (1 page, ready to use)**

```
# Context Pack v1 — Platform E-Commerce (Single Source of Truth)
**Pack ID:** CP-PLAT-v1  
**Status:** Draft | Active | Deprecated  
**Owner:** Platform Architecture  
**Last Updated:** YYYY-MM-DD  
**Applies To:** All components (Catalog, Search, Cart, Checkout, Payments, Shipping, Fulfillment)  
**How to use (MANDATORY):** Every Platform Spec (SpecKit) and Component Spec (OpenSpec) must cite this Pack ID + version.

---

## 1) Product & UX Principles (MUST)
**MUST**
- Define the user flow as end-to-end (browse → cart → checkout → payment → fulfillment).
- Keep UX consistent across surfaces (web/mobile): naming, error messages, states.
- Ensure accessibility and clear error recovery paths.

**SHOULD**
- Prefer progressive disclosure for complex inputs.
- Provide deterministic states (no “unknown” states in UI without fallback).

**Reference Flows (canonical)**
- R1: Guest Checkout flow
- R2: Add-to-cart + Save-for-later
- R3: Payment retry + failure states

---

## 2) Domain Boundaries (MUST)
**Cart owns**
- Cart state, line items, pricing snapshot (if applicable), save-for-later state.

**Checkout owns**
- Orchestration of checkout steps, validation sequencing, user journey.

**Payments owns**
- Authorization/capture/refund lifecycle, idempotency, fraud hooks.

**Shipping/Fulfillment own**
- Delivery options, promise dates, allocation, shipment tracking.

**MUST NOT**
- Checkout must not own payment state machine.
- Payments must not modify cart state directly.
- Components must not bypass contract versioning rules.

---

## 3) Integration & Contract Rules (MUST)
**MUST**
- Any change to an API/Event requires a **Contract Change Spec** (or explicit contract section in spec) including:
  - versioning approach
  - consumer impact
  - backward compatibility plan

**Compatibility Rules (baseline)**
- Additive changes: allowed with version notes + consumer verification
- Breaking changes: require new version + deprecation plan
- Dual publish/consume if needed during migration

**Contract Ownership**
- Events/APIs are owned by the producing domain; consumer impact must be acknowledged.

---

## 4) Non-Functional Requirements (NFR) Checklist (MUST)
**Security/PII**
- Identify PII fields, enforce masking/redaction in logs.

**Observability**
- Define: logs, metrics, traces, and at least one alert per critical path.

**Reliability**
- Idempotency for payment and order creation paths.
- Retry policy documented for external calls.

**Performance**
- Define latency expectations for user-facing endpoints.

---

## 5) Definition of Done (DoD) (MUST)
A feature is “Done” only if:
- Spec references Context Pack (this doc) by ID + version
- Acceptance Criteria are testable and verified
- Contract safety validated (if applicable)
- Observability shipped (not planned)
- Rollout/rollback plan exists

---

## 6) Golden Examples (COPY THESE)
- GE1: “Platform Spec — Guest Checkout” (link)
- GE2: “Component Spec — Payments Auth + Idempotency” (link)
- GE3: “Contract Spec — OrderPlaced v2 with migration plan” (link)

---
```

**Usage rule:** Any spec must include:

Sources: CP-PLAT-v1 (or v1.x)

---

# **2) SpecKit Template that enforces sources (Platform Spec)**

  

This is the SpecKit spec structure you use at **platform level**. It’s intentionally strict: each section includes a **Sources** line.

```
# Platform Spec (SpecKit) — TEMPLATE (MCP/Context-Pack Enforced)

## 0) Header
- **Spec ID:** SPEC-PLAT-___
- **Version:** v1
- **Status:** Draft | In Review | Approved | Implementing | Done
- **Initiative ID:** ECO-___
- **Owner:** PM + Platform Architect
- **Impacted Domains:** (list)
- **Impacted Contracts:** (list)

### Sources (MANDATORY)
- **Context Pack:** CP-PLAT-v1 (exact version)
- (Optional) Domain references: Domain Pack IDs
- (Optional) Contract registry references: Contract IDs/versions

---

## 1) Problem Statement
Describe user/business problem and current pain.
**Sources:** CP-PLAT-v1

---

## 2) Goals / Non-Goals
Clear goals, explicit exclusions.
**Sources:** CP-PLAT-v1

---

## 3) End-to-End UX Flow
Primary path, alternate paths, errors, edge states.
**Sources:** CP-PLAT-v1 (UX Principles + Reference Flows)

---

## 4) Domain Responsibilities & Boundaries
Who owns what, what’s explicitly out of scope for each domain.
**Sources:** CP-PLAT-v1 (Domain Boundaries)

---

## 5) Integration Touchpoints (APIs/Events)
List interactions between domains; sequence and ownership.
**Sources:** CP-PLAT-v1 (Integration & Contract Rules)

---

## 6) Contract Requirements
If contracts are touched, specify:
- change type (additive/breaking)
- consumer impact
- compatibility/migration approach
**Sources:** CP-PLAT-v1 (Contract Rules)

---

## 7) NFR Requirements
Security/PII, Observability, Reliability, Performance expectations.
**Sources:** CP-PLAT-v1 (NFR Checklist)

---

## 8) Rollout / Migration Plan
Feature flags, phased rollout, rollback strategy, migration steps.
**Sources:** CP-PLAT-v1 (DoD + Contract Rules)

---

## 9) Acceptance Criteria
Testable criteria per flow and domain responsibility.
**Sources:** CP-PLAT-v1 (DoD)

---

## 10) Fan-out Instructions to Components
For each component:
- required component spec
- contract work (if any)
- testing/verification expectations
**Sources:** CP-PLAT-v1

---

## 11) Gates (MUST PASS)
- Context Pack cited (exact version)
- Domain boundaries respected
- Contract safety plan (if contracts touched)
- NFR checklist included
- DoD satisfied
**Sources:** CP-PLAT-v1

---

## 12) Spec Graph Links
- Parent Initiative
- Child Component Specs (OpenSpec IDs)
- Contract Specs
- ADRs (blocked-by and related)
**Sources:** CP-PLAT-v1
```

**Key enforcement:** every section has **Sources** and the very first header includes the **Context Pack version**.

---

# **3) Simple Validator (Checklist) to enforce this automatically**

  

This is a **human-usable validator** you can run as a review checklist (PR review, spec review, or “gate” meeting). It’s intentionally short and binary.

  

## **A. Platform Spec Validator (SpecKit)**

  

### **Gate 1 — Sources present**

- Spec header includes **Context Pack ID + exact version**
    
- Every major section includes a **Sources:** line
    
- Sources match the Context Pack version (no “latest”)
    

  

### **Gate 2 — Domain correctness**

- Responsibilities per domain are explicitly stated
    
- No domain violates “MUST NOT” boundary rules from the Context Pack
    

  

### **Gate 3 — Contract safety (if touched)**

- Spec declares if APIs/events are impacted
    
- Includes consumer impact statement
    
- Includes compatibility approach (additive/breaking + migration)
    
- If breaking: new version + deprecation plan exists
    

  

### **Gate 4 — NFR completeness**

- Security/PII considerations documented
    
- Observability: logs + metrics + traces defined
    
- Reliability: idempotency/retry strategy stated (if relevant)
    
- Performance expectations stated for user-facing paths
    

  

### **Gate 5 — Done means done**

- Acceptance criteria are testable and complete
    
- Rollout + rollback plan exists
    
- Fan-out tasks defined for each impacted component
    
- Spec Graph links included (initiative, child specs, ADRs, contracts)
    

  

✅ **Pass condition:** all checked

---

## **B. Component Spec Validator (OpenSpec)**

  

### **Gate 1 — Traceability**

- “Implements: SPEC-PLAT-___ vX” present
    
- “Sources: CP-PLAT-v1.x” present
    
- References any specific contract versions used/changed
    

  

### **Gate 2 — Local correctness**

- Uses component-approved patterns/constraints (Component context referenced)
    
- Testing strategy defined (unit/integration/contract)
    

  

### **Gate 3 — Integration safety (if touched)**

- Contract change spec exists OR contract section includes migration plan
    
- Consumer impact documented (even if “none”)
    

  

### **Gate 4 — Operability**

- Observability added/updated (logs/metrics/alerts)
    
- Rollback plan defined for the component
    

  

✅ **Pass condition:** all checked

---

## **Lightweight enforcement rule (easy adoption)**

  

Start with **soft enforcement**:

- Missing items → PR comment + required update
    
    Then move to **hard enforcement** only for:
    
- contract changes
    
- PII/security-sensitive changes
    

---

## **Optional (but powerful) “Definition of Done” one-liner**

  

Add this to your PR template / spec review template:

  

> **No merge unless the spec references CP-PLAT-v1.x and passes Gate 1–5 (or Gate 1–4 for component-only changes).**



Below are **simple adoption patterns** (“samplers”) you can implement incrementally, without boiling the ocean.



## **Sampler 1: “Single MCP + Single Context Pack” (fastest path)**

  

**What you build**

- One MCP called **Platform Context MCP**
    
- It serves **one resource**: context-pack/latest (and versioned snapshots)
    

  

**What it contains**

- Platform policies (NFRs, security, observability, UX)
    
- Links to domain boundaries
    
- Links to contract registry (even if it’s just a doc)
    
- A small “how to write specs here” checklist
    

  

**How teams use it**

- SpecKit platform spec: always includes “Sources: context-pack vX”
    
- OpenSpec component spec: references the same pack + local repo notes
    

  

**Why this is easy**

- No routing logic
    
- No multiple servers
    
- No fancy tools
    
- Just “give me the pack”
    

  

✅ Best for: first pilot, immediate consistency gains



## **Sampler 2: “MCP as a Read-Only Spec Library” (zero workflow change)**

  

**What you build**

- MCP serves your existing docs/specs as **read-only resources**
    
- No special context pack, no orchestration
    

  

**How teams use it**

- Agents query: “show platform checkout guidelines”
    
- “show event versioning rules”
    
- “show cart invariants”
    

  

**Why it works**

- It removes doc hunting
    
- Still enforces “single source of truth” by making one canonical library
    

  

✅ Best for: orgs that resist process changes



## **Sampler 3: “Context Pack per Initiative Only” (minimal scope)**

  

Instead of packs per component and per change type…

  

**What you build**

- For each roadmap item (ECO-124), you publish:
    
    - context-pack/ECO-124/v1
        
    

  

**Pack contents**

- UX decisions for this initiative
    
- Contracts involved
    
- Domain responsibilities for this feature
    
- Known risks and gates
    

  

**How teams use it**

- Platform SpecKit spec references the initiative pack
    
- Component OpenSpec specs reference it too
    

  

✅ Best for: cross-domain features where alignment matters most



## **Sampler 4: “MCP only for Integration Engineers” (most leverage, least breadth)**

  

If you want immediate payoff, focus MCP on contracts.

  

**What you build**

- One MCP: **Integration MCP**
    
- Resources:
    
    - events/APIs registry
        
    - consumers map
        
    - versioning + compatibility rules
        
    

  

**How it helps**

- Prevents breaking changes
    
- Speeds up impact analysis
    
- Strengthens single source of truth where it hurts most
    

  

✅ Best for: event-driven platforms, microservices, high integration pain



## **Sampler 5: “Soft Gates Only” (no blocking, just nudges)**

  

Hard gates can be disruptive early.

  

**What you do**

- Keep the workflow the same
    
- Add a rule in specs:
    
    - “Sources: must cite context pack”
        
    
- If missing → warning, not block
    

  

Over time you evolve to:

- block merges/releases only for contract changes
    

  

✅ Best for: low-friction adoption



# **The simplest recommended adoption plan (2 weeks)**

  

This is the path I’d recommend to get traction fast.

  

### **Week 1 — Build “Single MCP + Single Pack”**

- Publish context-pack/latest
    
- Put inside:
    
    - platform DoD
        
    - NFR checklist (security/obs/perf)
        
    - contract rules (even if just links)
        
    - domain boundary map (simple diagram)
        
    

  

### **Week 2 — Pilot one feature**

- Use SpecKit for platform spec
    
- Use OpenSpec in 2 components
    
- Enforce only:
    
    - “specs must cite context-pack vX”
        
    - “contract changes require a contract spec”
        
    

  

✅ You’ll already see fewer integration surprises.



## **A simple diagram for the “Sampler 1” setup**

```
Roadmap Feature
   ↓
SpecKit Platform Spec
   ↓    (cite)
Single MCP: context-pack/latest
   ↓
OpenSpec Component Specs
   ↓
Implementation
```



## **“Do this, not that” to keep it simple**

  

### **✅ Do**

- Start with **one MCP**
    
- Start with **one Context Pack**
    
- Make it **read-only**
    
- Make specs **cite versions**
    
- Only enforce gates for **contracts**
    

  

### **❌ Don’t**

- Don’t start with many MCPs
    
- Don’t build a router first
    
- Don’t enforce hard gates everywhere on day 1
    
- Don’t try to model every domain invariant upfront
    


-------
-------


Great — **2 (inconsistent product implementation)** + **3 (teams don’t read docs)** is actually the _ideal_ scenario for a **very simple MCP adoption**.

  

You don’t need a complex MCP system.

You need a **single, opinionated, easy-to-consume Context Pack** that:

- replaces scattered docs
    
- is embedded in the workflow (not optional)
    
- is short enough to actually be used
    

---

# **🎯 Goal**

  

> Make it impossible for engineers (or agents) to implement features without using the correct context.

  

But without adding friction.

---

# **🧠 The Right Approach for You**

  

👉 Start with **ONE MCP + ONE Context Pack + ONE rule**

  

No routing

No multiple MCPs

No complex infra

---

# **✅ Minimal Architecture (what you build)**

```
                ┌──────────────────────┐
                │   Platform Context    │
                │        MCP            │
                └──────────┬───────────┘
                           │
                  context-pack/latest
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 Platform Spec        Component Spec      AI Agents
  (SpecKit)            (OpenSpec)           (optional)
```

---

# **📦 Your First Context Pack (the only thing you need)**

  

This replaces:

- Confluence
    
- scattered docs
    
- tribal knowledge
    

  

👉 Keep it **short and strict**

---

## **Context Pack v1 (max 1–2 pages)**

  

### **1. Product & UX Principles**

- how flows should behave
    
- naming conventions
    
- UX expectations
    

  

👉 fixes inconsistent implementations

---

### **2. Domain Boundaries**

- who owns what
    
- what NOT to do
    

  

👉 prevents domain overlap

---

### **3. Integration Rules**

- how to change APIs/events
    
- compatibility rules
    
- versioning
    

  

👉 prevents breaking changes

---

### **4. NFR Checklist (MANDATORY)**

- logging
    
- metrics
    
- tracing
    
- security
    
- performance
    

  

👉 forces production readiness

---

### **5. Definition of Done**

- what “done” means
    
- required validations
    

---

### **6. “Golden Examples”**

- 1 or 2 well-done specs or features
    

  

👉 super important — people copy examples

---

# **⚠️ Critical Rule (this is your leverage)**

  

> Every spec MUST reference the Context Pack version

  

Example:

```
Sources:
- Context Pack v1.2
```

👉 This alone creates **Single Source of Truth**

---

# **🧩 How to integrate this with SpecKit + OpenSpec**

  

## **Platform (SpecKit)**

  

When creating a feature:

```
/speckit.specify
```

You add:

```
Sources:
- Context Pack v1.2
```

---

## **Component (OpenSpec)**

  

Every implementation spec must include:

```
Implements: SPEC-PLAT-124 v1
Sources:
- Context Pack v1.2
```

---

👉 No context → no spec → no implementation

---

# **🚦 Soft Gates (low friction, high impact)**

  

Start with **warnings only** (not blocking):

  

### **Gate 1 — Context**

- Does the spec reference Context Pack?
    

  

### **Gate 2 — Integration**

- Does it touch contracts?
    
- If yes → define compatibility
    

  

### **Gate 3 — NFR**

- Logging / metrics defined?
    

---

Later you can enforce:

- blocking merges only for contract changes
    

---

# **🛒 Example (your real problem)**

  

## **Without MCP**

  

Feature: Guest Checkout

- Cart implements one behavior
    
- Checkout implements another
    
- Payments adds fields to event
    
- Shipping breaks
    

  

👉 classic inconsistency

---

## **With your simple MCP**

  

Every team must read:

```
Context Pack v1.2
```

Which says:

- how checkout works
    
- who owns what
    
- how to change events
    
- required observability
    

  

👉 All teams align **without meetings**

---

# **🧠 Why this works (for your case)**

  

You said:

- teams don’t read docs ❌
    
- implementations are inconsistent ❌
    

  

👉 So don’t rely on docs

👉 Force context into the workflow

  

**Spec becomes the enforcement point**

---

# **⚖️ What you are NOT doing (on purpose)**

  

❌ No multiple MCP servers

❌ No routing logic

❌ No complex infra

❌ No full domain modeling

  

👉 You are solving **behavior, not architecture**

---

# **🚀 2-Week Rollout Plan**

  

## **Week 1 — Build the pack**

- Write Context Pack v1 (1–2 pages)
    
- Put it in one place (repo, Notion, etc.)
    
- Version it
    

  

## **Week 2 — Pilot 1 feature**

- Use SpecKit for platform spec
    
- Use OpenSpec in 2 components
    
- Require:
    
    - Context Pack reference
        
    - basic integration check
        
    

---

# **🧠 Key Insight**

  

> You don’t need MCP infrastructure to get MCP value.

  

What you need is:

- **one source of truth**
    
- **referenced in every spec**
    
- **used by everyone**
    

---

# **🔑 Final Principle**

  

> If context is optional, it will be ignored

> If context is required by the spec, it becomes the system

---



Perfect 👍 — here are the last two pieces to make this operational:
	•	🧾 Spec Review Form (1-page, 2-minute check)
	•	🎯 JIRA mapping (so this is enforced without thinking)

These are designed for your simple MCP adoption (one Context Pack + SpecKit + OpenSpec).

⸻

🧾 1. Spec Review Form (2-minute version)

Use this in:
	•	PR template
	•	Spec review meeting
	•	Approval workflow

👉 Goal: fast validation without slowing teams down

⸻

📄 Spec Review Form

# Spec Review Form

## Basic Info
- Spec ID: ______________________
- Type: Platform Spec | Component Spec | Contract Spec
- Initiative ID: ______________________
- Reviewer: ______________________

---

## 1. Context (MANDATORY)
- [ ] Context Pack referenced (CP-PLAT-vX.X)
- [ ] Correct version used (not "latest")

---

## 2. Scope & Clarity
- [ ] Problem is clearly defined
- [ ] Goals / Non-goals are explicit
- [ ] Scope boundaries are clear

---

## 3. Domain Alignment
- [ ] Responsibilities per domain are defined
- [ ] No domain boundary violations

---

## 4. Integration Safety (if applicable)
- [ ] Contracts (APIs/events) identified
- [ ] Consumer impact defined
- [ ] Compatibility plan included

---

## 5. NFR (Production Readiness)
- [ ] Logging defined
- [ ] Metrics defined
- [ ] Tracing defined
- [ ] Security / PII considered
- [ ] Performance expectations defined

---

## 6. Implementation Readiness
- [ ] Acceptance Criteria are testable
- [ ] Rollout plan exists
- [ ] Rollback plan exists

---

## 7. Traceability
- [ ] Platform Spec referenced (for component specs)
- [ ] Contract versions referenced (if needed)
- [ ] ADR dependencies declared (if any)

---

## 🚦 Decision

- [ ] APPROVED
- [ ] NEEDS CHANGES
- [ ] BLOCKED (ADR / Contract missing)

---

## Notes
______________________________________________________
______________________________________________________


⸻

🧠 Why this works
	•	Takes < 2 minutes
	•	Covers all critical risks
	•	Forces Context Pack usage
	•	Works for humans and AI agents

⸻

🎯 2. JIRA Mapping (make it automatic)

You want JIRA to reflect your Spec Graph without extra work.

⸻

🧩 Issue Types

Type	Purpose
Epic	Product initiative
Spec (Platform)	Platform Spec (SpecKit)
Spec (Component)	Component Spec (OpenSpec)
Contract	API/Event changes
ADR	Decisions
Bug	Issues
Hotfix	Urgent fixes


⸻

📌 Required Custom Fields

Add these to JIRA:

Field	Description
Spec ID	Unique spec identifier
Spec Type	Platform / Component / Contract
Context Pack Version	e.g. CP-PLAT-v1.2
Implements Spec	Parent spec (for components)
Contracts Impacted	APIs/events
Blocked By ADR	ADR ID
Status (Spec)	Draft / Review / Approved / Implementing
Risk Level	Low / Medium / High


⸻

🔗 Issue Relationships

Use JIRA links:

Relationship	Meaning
implements	Component spec → Platform spec
depends on	Spec → ADR
affects	Spec → Contract
blocks	ADR → Spec


⸻

🧠 Example (real)

Epic

ECO-124 — Guest Checkout


⸻

Platform Spec

SPEC-PLAT-124
Context Pack: CP-PLAT-v1.2


⸻

Component Specs

SPEC-CART-01
Implements: SPEC-PLAT-124
Context Pack: CP-PLAT-v1.2

SPEC-PAY-02
Implements: SPEC-PLAT-124
BlockedBy: ADR-100


⸻

Contract

SPEC-CONTRACT-10
Event: OrderPlaced v2
Consumers: Fulfillment, Analytics


⸻

ADR

ADR-100 — Payment Idempotency Strategy
Status: In Review


⸻

Bug / Hotfix

BUG-200 — Checkout failure with guest users

HOTFIX-01 — Payment timeout fix
Follow-up: SPEC-PAY-03


⸻

🚦 Workflow States (simple)

Use the same for specs:
	•	Draft
	•	In Review
	•	Approved
	•	Implementing
	•	Done
	•	Paused

⸻

🔐 Minimal Enforcement (low friction)

👉 You don’t need automation at first
👉 Just enforce 2 rules

Rule 1 — Every spec must have:

Context Pack Version = CP-PLAT-vX.X

Rule 2 — Every component spec must have:

Implements = SPEC-PLAT-XXX


⸻

Optional (later)

You can automate:
	•	❌ Block PR if no Context Pack
	•	❌ Block merge if Contract change without spec
	•	❌ Block release if NFR missing

⸻

🧠 Final Insight

You are not implementing “process”.

You are implementing:

a system where context is mandatory, visible, and versioned

⸻


Below is a **real, practical repo structure** for your model:

- **Platform repo uses SpecKit** (constitution + platform specs + fan-out)
    
- **Each component repo uses OpenSpec** (implementation specs + local ADRs)
    
- **One simple Context Pack** is versioned and referenced everywhere
    
- **Contracts** live in a central place (recommended) or owned-by-producer with a registry index
    

---

# **1) Platform Repo (SpecKit) — “Single Source of Truth Hub”**

  

**Repo name (example):** ecom-platform-specs

```
ecom-platform-specs/
├─ README.md
├─ constitution/
│  ├─ README.md
│  ├─ platform-constitution.md
│  ├─ definition-of-done.md
│  ├─ nfr-baseline.md
│  └─ ux-principles.md
│
├─ context-packs/
│  ├─ README.md
│  ├─ CP-PLAT-v1/
│  │  ├─ CP-PLAT-v1.0.md
│  │  ├─ CP-PLAT-v1.1.md
│  │  └─ CP-PLAT-v1.2.md
│  └─ latest.md              # points to the latest active version (human-friendly)
│
├─ initiatives/
│  ├─ README.md
│  ├─ ECO-124-guest-checkout/
│  │  ├─ initiative.md        # high-level problem, goals, success metrics
│  │  ├─ platform-spec.md     # SpecKit Platform Spec (what + UX + boundaries)
│  │  ├─ platform-plan.md     # SpecKit Plan
│  │  ├─ fanout-tasks.md      # per-component work packets (links)
│  │  ├─ spec-graph.md        # links to child component specs, ADRs, contracts
│  │  └─ decisions/
│  │     ├─ ADR-0100-payment-idempotency.md
│  │     └─ ADR-0101-checkout-orchestration.md
│  └─ ECO-125-reviews-ranking/
│     └─ ...
│
├─ contracts/
│  ├─ README.md
│  ├─ registry.md             # index of all APIs/events + ownership + versions
│  ├─ events/
│  │  ├─ OrderPlaced/
│  │  │  ├─ OrderPlaced.v1.md
│  │  │  ├─ OrderPlaced.v2.md
│  │  │  └─ consumers.md      # who consumes it + notes
│  │  ├─ CartUpdated/
│  │  │  ├─ CartUpdated.v3.md
│  │  │  └─ consumers.md
│  │  └─ ...
│  └─ apis/
│     ├─ CheckoutAPI/
│     │  ├─ CheckoutAPI.v1.md
│     │  └─ ...
│     └─ ...
│
├─ adr/
│  ├─ README.md
│  ├─ ADR-0001-domain-boundaries.md
│  ├─ ADR-0002-event-versioning-policy.md
│  └─ ADR-0003-observability-baseline.md
│
├─ templates/
│  ├─ platform-spec-template.md      # enforces Sources + Context Pack
│  ├─ contract-spec-template.md
│  ├─ adr-template.md
│  └─ component-fanout-template.md
│
└─ governance/
   ├─ spec-review-form.md
   ├─ gates-checklist.md
   └─ jira-mapping.md
```

## **Why this works**

- **Context Packs are versioned** and centralized (the “one pack” approach)
    
- **Platform Specs** live under each initiative, making history navigable
    
- **Contracts are first-class** and traceable
    
- **ADRs exist both globally** and initiative-specific
    

---

# **2) Component Repo (OpenSpec) — one per domain/service**

  

**Repo name (example):** payments-service

```
payments-service/
├─ README.md
├─ context/
│  ├─ README.md
│  ├─ component-context.md         # patterns, constraints, runbooks (local truth)
│  └─ references.md               # links to CP-PLAT and contract registry
│
├─ specs/
│  ├─ README.md
│  ├─ SPEC-PAY-0052-guest-checkout/
│  │  ├─ spec.md                  # OpenSpec implementation spec (how)
│  │  ├─ plan.md                  # optional
│  │  ├─ tasks.md                 # optional
│  │  ├─ adr/                     # local ADRs for this spec
│  │  │  └─ ADR-PAY-0021-idempotency-impl.md
│  │  └─ links.md                 # implements + context pack + contracts + jira
│  └─ SPEC-PAY-0053-refund-flow/
│     └─ ...
│
├─ adr/
│  ├─ README.md
│  ├─ ADR-PAY-0001-retry-policy.md
│  └─ ADR-PAY-0002-idempotency-keys.md
│
├─ contracts/
│  ├─ README.md
│  └─ owned/
│     └─ PaymentAuthorized/
│        ├─ PaymentAuthorized.v1.md
│        └─ consumers.md
│
└─ docs/
   ├─ runbooks/
   └─ observability/
```

## **Minimal “link contract” in every component spec**

  

Inside specs/SPEC-.../links.md:

- Implements: SPEC-PLAT-124 v1
    
- Context Pack: CP-PLAT-v1.2
    
- Contracts: OrderPlaced v2, PaymentAuthorized v1
    
- BlockedBy: ADR-0100 (if any)
    
- JIRA: ECO-124, SPEC-PAY-0052
    

---

# **3) Contract Ownership Options (pick one)**

  

## **Option A (recommended for simplicity): Central Contract Registry (platform repo)**

- All events/APIs and versions live in ecom-platform-specs/contracts/
    
- Each version includes owner + consumer mapping
    

  

✅ Best early, easiest governance

  

## **Option B (scale later): Owned-by-producer + central index**

- Each service repo keeps its own owned contracts
    
- Platform repo keeps an index registry pointing to each owner’s contract doc/version
    

  

✅ Best for mature orgs with strong domain ownership

---

# **4) Naming Conventions (simple & scalable)**

  

### **Context Packs**

- CP-PLAT-v1.0, CP-PLAT-v1.1, etc.
    

  

### **Platform specs (SpecKit)**

- SPEC-PLAT-0124 (matches the initiative ECO-124)
    

  

### **Component specs (OpenSpec)**

- SPEC-PAY-0052, SPEC-CART-0101, SPEC-CHK-0200
    

  

### **ADRs**

- Global: ADR-0001, ADR-0002
    
- Component: ADR-PAY-0001
    
- Initiative-specific: initiatives/ECO-124/decisions/ADR-0100...
    

---

# **5) The “One Rule” that makes it work**

  

Every spec, everywhere, must reference:

- **Context Pack version**
    
- **Parent spec (if component)**
    
- **Contract versions (if touched)**
    

  

That’s the core of “Single Source of Truth.”

---

If you want next, I can produce:

- a **filled example** for ECO-124 Guest Checkout across platform + 2 components + 1 contract change, using exactly this repo structure.

