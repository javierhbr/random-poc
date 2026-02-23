You can use the **SpecKit CLI** as the _operational backbone_ of this methodology: it standardizes the lifecycle (spec → plan → tasks → implement), while **MCPs** supply the _authoritative context_ (platform policies, domain invariants, integration contracts, component constraints) at each step.

  

SpecKit is explicitly designed as a CLI-guided workflow for spec-driven / agentic development. 

---

## **How SpecKit CLI fits into “SDD + MCPs”**

  

### **The split of responsibilities**

- **SpecKit CLI = process + artifacts**
    
    - Creates/updates the structured artifacts (constitution/spec/plan/tasks/implementation workflow). 
        
    
- **MCPs = governed context + “single source of truth”**
    
    - Provide **Context Packs** that the agent must cite in the spec sections (platform policies, invariants, contracts, etc.).
        
    
- **Your agents = execution**
    
    - They run through SpecKit phases, but they must “pull context” from MCPs before writing/deciding.
        
    

  

Think of it as:

  

> **SpecKit writes the spec; MCPs make the spec correct.**

---

## **The SpecKit CLI phases you’ll leverage (and what you add with MCPs)**

  

SpecKit’s common pattern is a gated sequence like: **constitution → specify → plan → tasks → implement**. 

  

### **1) Constitution (platform “rules of the game”)**

  

**Goal:** establish non-negotiables (quality bar, security, observability, compatibility rules).

**MCP support:** Platform MCP provides the canonical policy set/version for the constitution.

  

**How to leverage CLI**

- Use SpecKit to maintain a living “constitution” doc that becomes the _root_ of truth for all specs.
    
- Enforce: every downstream spec must cite the constitution version.
    

  

### **2) Specify (write Platform Spec / Component Spec)**

  

**Goal:** define “what” (platform) or “how” (component) with the SpecKit template.

**MCP support:**

- Platform MCP → UX/NFR policies
    
- Domain MCP → invariants/entities
    
- Integration MCP → contracts/consumers/versioning
    
- Component MCP → local constraints/patterns
    

  

**How to leverage CLI**

- Use the CLI to generate the spec skeleton and keep the structure consistent.
    
- Require that each spec section includes Source: … references to MCP context packs (your template already does this).
    

  

### **3) Plan (technical approach + rollout)**

  

**Goal:** turn the spec into an executable plan (milestones, rollout, test strategy).

**MCP support:** Integration & Component MCPs provide constraints (compat strategy, migrations, flags, consumer readiness).

  

**How to leverage CLI**

- Generate the plan from the spec, then “gate” it by validating:
    
    - compatibility strategy exists
        
    - NFR checklist is satisfied
        
    - observability plan is present
        
    

  

### **4) Tasks (work breakdown)**

  

**Goal:** produce trackable tasks (JIRA mapping, component work items, contract changes).

**MCP support:** Integration MCP gives impacted consumers; Domain MCP highlights required validations; Component MCP informs test types.

  

**How to leverage CLI**

- Generate tasks per component + contract spec tasks (if events/APIs change).
    
- Auto-attach references (Spec IDs, contract version IDs) into each task description.
    

  

### **5) Implement (agent executes tasks)**

  

**Goal:** implementation aligned to spec + verification gates.

**MCP support:** Component MCP ensures local consistency; Platform MCP enforces NFR/DoD; Integration MCP enforces contract compatibility.

  

**How to leverage CLI**

- Implementation step always links back to:
    
    - spec version
        
    - constitution version
        
    - contract versions
        
    
- After implementation, you update the Spec Graph links (initiative → specs → ADRs/contracts).
    

---

## **Recommended operating model for a multi-component platform**

  

### **Platform-level workflow (Roadmap → Platform SpecKit → Component specs)**

1. **Create/Update Platform Spec (SpecKit)**
    
    - Includes end-to-end UX + domain boundaries + shared NFR pack + contract baseline.
        
    
2. **Generate Context Pack (via MCP Router)**
    
    - “For ECO-124, these are the relevant policies/invariants/contracts.”
        
    
3. **Fan-out into Component Specs**
    
    - Each component runs SpecKit (or OpenSpec locally) to produce an implementable spec.
        
    
4. **If contracts change**
    
    - Produce a **Contract Spec** as a first-class artifact.
        
    

  

This matches SpecKit’s intent: use structured commands to steer agentic workflows rather than “vibe coding.” 

---

## **Where OpenSpec fits (component-level)**

  

If you use **OpenSpec** per component:

- **SpecKit** remains your _platform-wide standard_ for constitution + platform specs.
    
- **OpenSpec** is the _component executor/tracker_ that:
    
    - maintains local change proposals
        
    - tracks implementation status
        
    - keeps a local spec history
        
    
- The bridge is the **Spec Graph**: component OpenSpec specs must reference the platform SpecKit spec IDs + MCP context versions.
    

  

In practice:

- Platform: SpecKit is authoritative for cross-domain intent.
    
- Component: OpenSpec (or SpecKit) is authoritative for local execution details.
    

---

## **How you enforce “MCP-backed Single Source of Truth” using SpecKit CLI**

  

### **Add 3 hard rules (process gates)**

1. **No spec without sources**
    
    Every spec section must include Source: Platform/Domain/Integration/Component MCP.
    
    If missing → fail the gate.
    
2. **No integration change without Contract Spec**
    
    If the spec touches events/APIs → create a contract spec + compatibility plan (dual publish, deprecation timeline, consumer mapping).
    
3. **No implementation without “Ready-to-Implement”**
    
    Spec + plan must pass: invariants, integration safety, NFR compliance, observability readiness.
    

---

## **Handling real-world scenarios with SpecKit CLI + MCP**

  

### **A) Change request to a Context Pack (platform vs component)**

  

**Platform-level CR**

- Update Platform Spec via SpecKit
    
- MCP Router emits a new Context Pack version (policies/contracts bumped)
    
- Generate “impact tasks” for components to rebase their specs
    

  

**Component-level CR**

- Update only the component spec (OpenSpec or SpecKit)
    
- MCP Router returns a narrower Context Pack (component + relevant platform policies)
    
- Integration MCP gate confirms “no contract impact” (or triggers contract spec)
    

  

### **B) Priority changes**

- Mark initiative/spec as **Paused** (do not delete)
    
- When resumed: re-run “Specify/Plan” using the _latest_ Context Pack (rebasing policies/contracts)
    

  

### **C) ADRs not approved that block another spec**

- The dependent spec declares BlockedBy: ADR-###
    
- SpecKit workflow stops at the implementation gate until ADR moves to Approved
    
- Meanwhile, you can still refine discovery/spec sections not dependent on the ADR
    

  

### **D) Bugs and hotfix**

- **Bug:** run a lightweight “spec → plan → tasks” cycle scoped to the component (fast but still structured)
    
- **Hotfix:** use a “minimal spec” path + immediate follow-up spec for hardening (tests, refactor, updated contracts if needed)
    

---

## **Diagram: SpecKit CLI + MCPs in one view**

```
Roadmap / Initiative
        |
        v
[SpecKit: Constitution + Platform Spec]
        |
        v
[MCP Router] ---> Platform MCP (policies/NFR/DoD)
     |          Domain MCP (invariants/entities)
     |          Integration MCP (contracts/consumers/versioning)
     |          Component MCP (local constraints/patterns)
     v
   Context Pack (versioned)
        |
        v
[SpecKit/OpenSpec: Component Specs] ---> (Contract Spec if needed)
        |
        v
[SpecKit: Plan -> Tasks -> Implement]
        |
        v
Verification Gates + Spec Graph Links
```

---

## **Practical rollout plan (how to start using the CLI)**

1. **Standardize the “Constitution” first** (SpecKit)
    
2. **Stand up MCPs** (Platform/Domain/Integration/Component) with versioned content
    
3. **Adopt the MCP-aware SpecKit template** (Sources per section + gates)
    
4. **Pilot with one cross-domain feature** (e.g., Guest Checkout)
    
5. **Make Contract Specs mandatory** for event/API changes
    
6. **Integrate Tasks output with JIRA** (initiative → platform spec → component specs → contract/ADR issues)
    

