
# Guide: SDD with SpecKit + MCPs for Multi-Component Platforms

  


## What this methodology does

  


### Objective

  


Ensure that any agent (human or AI) implementing a feature in a component (Payments, Cart, Search, etc.) does so:
    - aligned with the product/platform (UX, security, observability, standards)
    - without inventing context (bounded contexts, invariants, contracts)
    - with traceability (which spec was implemented, which decision enabled it, which contracts changed)
    - without breaking integrations (versioned events/APIs)

---


## Role of MCPs

MCPs are the "governed knowledge access system" for agents. They are used to:
    - deliver Context Packs (relevant packages) that include:
        - platform policies (MUST/SHOULD)
        - domain invariants
        - integration contracts and consumers
        - local repository context
        - canonical examples and anti-patterns
    - enforce SpecKit process gates ("you cannot proceed if requirements are not met")
    - preserve history (versions of policies, contracts, and specs)

In simple terms: MCPs are not documentation; they are curated, verifiable context to implement specs correctly within the ecosystem.

---

## **How it works (overview)**

  

### **General flow diagram**

```
┌──────────────────────────┐
│ Roadmap / Product Intent  │
└─────────────┬────────────┘
              ▼
┌──────────────────────────┐
│ Platform Spec (SpecKit)   │  <-- "what" + end-to-end UX + NFR + contracts
└─────────────┬────────────┘
              ▼
┌──────────────────────────┐
│ MCP Router / Context Pack │  <-- aggregates policies + invariants + contracts + local ctx
└───────┬───────────┬──────┘
        ▼           ▼
┌──────────────┐  ┌─────────────────┐
│ Platform MCP  │  │ Component MCPs  │
└──────┬───────┘  └───────┬─────────┘
       ▼                  ▼
  Context Pack        Local Context Pack
       └──────────────┬───────────────┘
                      ▼
         ┌────────────────────────┐
         │ Component Specs         │  <-- "how" per domain
         │ (OpenSpec or SpecKit)   │
         └────────────┬───────────┘
                      ▼
         ┌────────────────────────┐
         │ Implementation + Verify │
         └────────────┬───────────┘
                      ▼
         ┌────────────────────────┐
         │ Spec Graph (History)    │  <-- full traceability
         └────────────────────────┘
```

---

## **Comparison: development without SDD vs with SDD + MCP**

  

### **Realistic example: “Guest Checkout” in e-commerce**

  

### **Without SDD (common pattern)**

- Product requests “Guest Checkout”
    
- Checkout team implements it “as they understand it”
    
- Cart assumes different behavior
    
- Payments breaks event compatibility
    
- Fulfillment receives incomplete orders
    
- QA discovers inconsistencies late
    
- Fixed with hotfixes, meetings, and tribal knowledge
    

  

**Typical result:**

- broken integrations
    
- “specs in people’s heads”
    
- technical debt and rework
    
- untracked decisions
    
- inconsistent interpretations across teams
    

---

### **With SDD + MCP (same case)**

- A **Platform Spec (SpecKit)** is created including:
    
    - end-to-end UX
        
    - domain responsibilities
        
    - contracts/events and compatibility
        
    - NFRs (PII, auditing, observability)
        
    
- Each component creates a **Component Spec (OpenSpec/SpecKit)** referencing:
    
    - the Platform Spec
        
    - platform policies
        
    - domain invariants
        
    - current contracts
        
    
- Contract changes go through **Contract Specs + versioning**
    
- Gates prevent implementation without proper evidence
    

  

**Typical result:**

- consistent UX and technical design
    
- controlled compatibility
    
- full traceability (“what changed and why”)
    
- fewer integration incidents
    

---

## **Steps to implement it in your organization**

  

### **Step 1: Define the “System of Truth”**

  

You need 4 conceptual “libraries”:

1. **Platform Policies & Constitution**
    
    - UX principles, accessibility, security/PII, observability, quality bar, Definition of Done
        
    
2. **Domain Knowledge**
    
    - bounded contexts, ownership, entities, invariants, domain events
        
    
3. **Integration Contracts Registry**
    
    - versioned APIs/events, consumers, compatibility and deprecation rules
        
    
4. **Component Context**
    
    - local architecture, approved patterns, constraints, runbooks, canonical examples
        
    

  

These four feed the MCPs (Platform / Domain / Integration / Component).

---

### **Step 2: Spec standard (SpecKit)**

- Adopt a **single template**
    
- Require every section to include:
    

```
Source: Platform / Domain / Integration / Component
```

This is what makes the process **“anti-invention.”**

---

### **Step 3: Define “Gates” (what blocks progress)**

  

Typical gates:

- **Context Completeness Gate**: all sources and versions are cited
    
- **Domain Validity Gate**: invariants are not broken
    
- **Integration Safety Gate**: consumers identified + compatibility plan
    
- **NFR Gate**: logging, metrics, tracing, security, performance
    
- **Ready-to-Implement Gate**: spec is executable and unambiguous
    

---

### **Step 4: Define Platform Spec vs Component Specs**

  

Simple rule:

- **Platform Spec** defines:
    
    - “what”
        
    - UX
        
    - contracts
        
    - responsibilities
        
    
- **Component Spec** defines:
    
    - “how” within the repo
        
    - data model
        
    - logic
        
    - tests
        
    - rollout
        
    

---

### **Step 5: Spec Graph (history)**

  

Each spec must link:

- **Implements** (parent spec)
    
- **DependsOn** (contracts, policies, ADRs)
    
- **Affects** (domains, APIs, events)
    
- **Status** (draft/review/approved/implemented)
    

  

This enables **auditability and decision navigation over time**.

---

## **How to apply a Change Request to a Context Pack**

  

A Change Request (CR) modifies scope, contracts, or policies affecting a spec or its context.

---

### **Case A: Platform-level Change Request (cross-domain)**

  

Examples:

- UX flow changes
    
- shared event contract changes
    
- policy changes (PII, observability, performance)
    

  

**Process:**

1. CR creates a **Platform Change Spec** (or new Platform Spec version)
    
2. MCP Router produces **Context Pack v2** (updated policies/contracts)
    
3. Generate a **Component Impact list**:
    
    - which specs become stale
        
    - which components must rebaseline
        
    
4. Each component creates a **Component Change Spec** or updates its spec
    

  

**Result:** platform and components are realigned with clear versioning

---

### **Case B: Component-local Change Request**

  

Examples:

- internal optimization
    
- refactor without contract impact
    
- local feature
    

  

**Process:**

1. CR creates a **Component Change Spec**
    
2. Consult Component MCP + Platform MCP (for NFR/quality)
    
3. Integration gate verifies no contract impact
    
4. Implement and register in the Spec Graph
    

---

## **Handling changing feature priorities**

  

In reality, priorities change frequently. With SDD + MCP, you manage this without chaos:

  

### **Rule 1: Initiative drives everything**

  

All work is anchored to an **Initiative ID** (e.g., ECO-124).

---

### **Rule 2: Clear initiative states**

- Planned
    
- In Discovery
    
- Spec Draft
    
- Approved
    
- Implementing
    
- Paused (due to priority)
    
- Cancelled
    
- Done
    

---

### **Rule 3: “Pause” preserves history**

  

When reprioritized:

- mark as **Paused**
    
- freeze current spec version
    
- log a mini-ADR or decision note (“paused due to Q2 focus shift”)
    
- when resumed, **Rebase** with a new Context Pack
    

---

## **ADRs that block other specs**

  

Common in large systems: “we must decide X before implementing Y.”

  

### **Recommended pattern: ADR as explicit dependency**

  

A spec declares:

```
BlockedBy: ADR-XYZ
```

---

### **Blocking flow**

1. Spec identifies needed decision → creates **ADR Draft**
    
2. ADR states:
    
    - Proposed → In Review → Approved / Rejected
        
    
3. While ADR is not approved:
    
    - dependent specs remain **Blocked**
        
    - non-dependent work can continue
        
    - cannot pass Ready-to-Implement gate
        
    

---

### **Benefits**

- no implicit decisions
    
- avoids rework
    
- visible blocking and tracking
    

---

## **Bug and hotfix management**

  

### **Normal bug (non-urgent)**

  

Handled as a **lightweight spec**:

1. Create **Bug Spec**
    
2. Minimal sources:
    
    - Component MCP
        
    - Platform MCP
        
    
3. Quick gate:
    
    - reproduction
        
    - impact
        
    - fix plan
        
    - tests
        
    
4. Implement + verify
    
5. Update Spec Graph
    

---

### **Hotfix (production, urgent)**

  

Speed is needed, but governance must remain.

  

### **Controlled Hotfix Path**

- allow implementation with a **minimal pre-approved spec template**
    
- required:
    
    - impact
        
    - rollback plan
        
    - minimal observability (logs/metrics)
        
    - quick verification
        
    
- after fix:
    
    - create **Follow-up Spec** for:
        
        - full tests
            
        - refactor (if needed)
            
        - documentation
            
        - ADR (if decision was made)
            
        
    

  

This reflects reality: production fixes happen fast, but **traceability is preserved**.

---

## **Real-world situations this prevents**

- accidental breaking changes (events consumed by Fulfillment)
    
- inconsistent UX (Checkout vs Shipping mismatch)
    
- duplicated rules (Cart vs Checkout validation)
    
- lack of observability (no logs/metrics for incidents)
    
- decisions lost in Slack
    

  

With SDD + MCP, these must appear in the spec (contracts, invariants, gates).

---

## **JIRA-style examples for product tracking**

  

### **1) Epic (Product Initiative)**

```
ECO-124 — Guest Checkout + Save-for-Later
Owner: Product Platform
Status: In Discovery

Links:
- Platform Spec: SPEC-PLAT-124 v1
- Contract Spec: SPEC-CONTRACT-77 v2
- Components: Cart / Checkout / Payments / Shipping
```

---

### **2) Story (Platform Spec)**

```
SPEC-PLAT-124 — Platform Spec (SpecKit)

Includes:
- end-to-end UX
- domain responsibilities
- NFR pack
- contract baseline references

Acceptance:
- passes global gates
- component impact list defined
```

---

### **3) Component tasks (Implementation Specs)**

```
SPEC-CART-881 — Cart Implementation Spec
Implements: SPEC-PLAT-124 v1
DependsOn: Contract CartUpdated v3
Status: Draft → Review → Approved → Implementing
```

```
SPEC-PAY-552 — Payments Implementation Spec
DependsOn: ADR-219 (idempotency approach)
Status: Blocked
```

---

### **4) Contract Change**

```
SPEC-CONTRACT-77 — OrderPlaced v2

Consumers impacted:
- Fulfillment
- Shipping
- Analytics

Compatibility plan:
- dual publish
- deprecation schedule
```

---

### **5) ADR ticket**

```
ADR-219 — Idempotency strategy for payment capture
Status: In Review

Blocks:
- SPEC-PAY-552
```

---

### **6) Bug ticket**

```
BUG-3321 — Checkout fails when cart has saved items

Linked Spec:
- SPEC-CHECKOUT-104

Fix Spec:
- SPEC-HOTFIX-12 (if urgent)
```

---

### **7) Hotfix ticket**

```
HOTFIX-12 — Production: payment authorization timeout

Required:
- impact
- mitigation
- rollback
- postmortem follow-up spec link
```

---

## **State diagram for priorities, blocking, and hotfixes**

```
Planned
  ▼
Discovery
  ▼
Spec Draft ───────────────► Paused (priority shift)
  ▼                            │
In Review                      │ (rebase with new context pack)
  ▼                            ▼
Approved ───────────────► Blocked (ADR pending)
  ▼                            │
Implementing                   │ (ADR approved)
  ▼                            ▼
Verify / Release          Approved (resume)
  ▼
Done

HOTFIX PATH:
Production incident → Hotfix Spec (minimal) → Implement → Verify → Done
                                  │
                                  ▼
                          Follow-up Spec (hardening)
```

---

## **Implementation checklist (practical)**

- Define Platform Constitution (policies, NFRs, UX)
    
- Define Domain Map (bounded contexts, ownership, invariants)
    
- Define Contract Registry (events/APIs, consumers, versioning)
    
- Define Component Context Packs (per repository)
    
- Standardize SpecKit template (with Sources per section)
    
- Establish Gates and states
    
- Define Hotfix Path + post-fix hardening
    
- Adopt Initiative IDs + Spec Graph links in every spec
    
- Integrate with JIRA:
    
    - Epic = Initiative
        
    - Story = Platform Spec
        
    - Tasks = Component Specs
        
    - ADR / Contract / Bug as issue types
        
    

---

If you want, I can convert this into a **formal 6-pager (Amazon style)**, or into a **ready-to-use SpecKit template + MCP structure** for your OpenClaw / multi-agent system.