# Target Operating Model

  

### **What SpecKit owns (Platform-level)**

- **Platform Constitution**: global policies + “Definition of Done”
    
- **Platform Feature Specs**: end-to-end UX + domain boundaries + cross-domain responsibilities
    
- **Platform Plan + Tasks**: cross-domain rollout, dependencies, and fan-out instructions
    

  

### **What OpenSpec owns (Component-level)**

- **Component Implementation Specs** (“how”): design details, data model, service constraints
    
- **Change proposals + tracking**: spec history, implementation status, follow-ups
    
- **Local ADRs + local context evolution**
    

  

### **What MCPs own (Context)**

- Provide **versioned Context Packs** to prevent “invented context”:
    
    - Platform policies (UX/NFR/security/observability)
        
    - Domain invariants
        
    - Integration contracts + consumer impact
        
    - Component constraints + patterns
        
    

---

## **2) Minimal “Source of Truth” Structure**

  

### **Platform repo (SpecKit)**

  

Think of this as your _product/platform spec hub_:

- **/constitution/** (platform principles)
    
- **/initiatives/** (roadmap items, one per feature/epic)
    
- **/platform-specs/** (SpecKit feature specs)
    
- **/contracts/** (canonical contract registry links or specs)
    
- **/adr/** (global ADRs)
    

  

### **Component repos (OpenSpec)**

  

Each service/domain repo keeps:

- **/context/** (component MCP knowledge pack references)
    
- **/specs/** (OpenSpec implementation specs)
    
- **/adr/** (local ADRs)
    
- **/contracts/** (only if the component owns a contract)
    

---

## **3) The Actual Workflow Using SpecKit CLI + OpenSpec**

  

### **Step A — Bootstrap SpecKit in the Platform Repo**

  

**Goal:** Standardize the SpecKit workflow artifacts and make “constitution/spec/plan/tasks” the default path.

- Use the SpecKit setup flow (“specify” CLI to scaffold the project + agent templates) and then run slash commands in your assistant. 
    

---

### **Step B — Create/Update the Platform Constitution (SpecKit)**

  

**Why:** Your “single source of truth” starts with non-negotiables.

  

Run (in your coding assistant) something like:

- /speckit.constitution … to define:
    
    - UX principles
        
    - Security/PII
        
    - Observability requirements
        
    - Compatibility and versioning rules
        
    - Release discipline / Definition of Done 
        
    

  

**MCP tie-in (mandatory):**

- The constitution must reference the **Platform MCP policy version** it was derived from (or becomes that policy source).
    

---

### **Step C — Create a Platform Feature Spec (SpecKit)**

  

For each roadmap initiative (e.g., _ECO-124 Guest Checkout_):

- /speckit.specify … describes **what and why**, not implementation details. 
    

  

**What this Platform Spec must contain**

- End-to-end UX flow
    
- Domain responsibilities / boundaries
    
- Cross-domain sequence (events/APIs)
    
- NFR pack (security, obs, performance)
    
- Acceptance criteria
    
- Explicit references to sources:
    
    - Source: Platform MCP policies
        
    - Source: Domain MCP invariants
        
    - Source: Integration MCP contracts
        
    

  

**Output:** a spec that is implementable _by multiple components_ without ambiguity.

---

### **Step D — Generate the Platform Plan + Fan-Out Tasks (SpecKit)**

- /speckit.plan … turns the platform spec into a technical rollout plan
    
- /speckit.tasks … produces the work breakdown and handoff tasks for component teams 
    

  

**This is where you “bridge” into OpenSpec.**

Each task should include:

- Component repo target
    
- The parent Platform Spec ID/version
    
- The required Context Pack version (from MCP router)
    
- Whether contract changes are expected (yes/no)
    

---

### **Step E — Component Teams Execute with OpenSpec (per repo)**

  

Each component team takes its assigned task and runs OpenSpec locally:

  

**Component OpenSpec output must include**

- Implements: Platform Spec ID vX
    
- DependsOn: Contracts vY
    
- Sources:
    
    - Platform policies (MCP)
        
    - Domain invariants (MCP)
        
    - Integration contracts (MCP)
        
    - Component constraints (Component MCP)
        
    

  

**If a contract change is needed**

- Component spec triggers a **Contract Change Spec** (either in platform repo or contract registry owner repo) before implementation.
    

---

### **Step F — Implement + Validate**

  

Implementation happens inside component repos (OpenSpec tracking), but validation gates must be satisfied:

  

**Gates (always)**

- Context completeness (sources cited)
    
- Domain validity (invariants respected)
    
- Integration safety (consumer impact + versioning)
    
- NFR compliance (obs/security/perf)
    
- Ready-to-implement (no ADR blockers)
    

  

SpecKit emphasizes staged progression via these phases; your gates operationalize “don’t skip steps.” 

---

## **4) Diagram: Platform SpecKit + Component OpenSpec + MCPs**

```
Roadmap / Initiative (ECO-124)
        |
        v
[Platform Repo - SpecKit]
  /speckit.constitution
  /speckit.specify
  /speckit.plan
  /speckit.tasks
        |
        | produces: Platform Spec + Plan + Fan-out Tasks
        v
      [MCP Router]
   (builds Context Pack)
   / Platform MCP (policies)
   / Domain MCP (invariants)
   / Integration MCP (contracts)
   / Component MCP (constraints)
        |
        v
[Component Repos - OpenSpec]
  - Implementation Specs (how)
  - Local ADRs
  - Execution tracking
        |
        v
Implementation + Verification Gates
        |
        v
Spec Graph (links across platform + components + contracts + ADRs)
```

---

## **5) The “Spec Graph” Contract Between SpecKit and OpenSpec**

  

To preserve history and “one source of truth”, enforce this linkage rule:

  

### **Every Component OpenSpec Spec must include**

- **Implements:** Platform Spec ID + version
    
- **Context Pack:** ID + version (from MCP Router)
    
- **Contracts referenced:** event/API versions
    
- **BlockedBy:** ADR IDs (if any)
    
- **Outcome:** shipped version + rollout notes
    

  

### **Every Platform Spec must include**

- **Children:** list of component specs (OpenSpec references)
    
- **Contract specs:** version bumps + consumer impact notes
    
- **ADRs:** decisions that govern the feature
    

  

This is what makes the ecosystem navigable months later.

---

## **6) How to Handle Real-World Situations**

  

### **A) Priority changes (roadmap shifts)**

  

**Platform SpecKit action**

- Mark initiative/spec as **Paused**
    
- When resumed: re-run context pack generation and **rebase** the Platform Plan/Tasks to new dependencies.
    

  

**Component OpenSpec action**

- Pause local execution but preserve spec history and context pack reference.
    

---

### **B) ADR not approved and blocking another spec**

  

**Rule:** no “Ready-to-Implement” gate passes if:

- BlockedBy ADR-### is unresolved.
    

  

**Operational flow**

- Platform spec identifies decision → creates ADR
    
- Component specs that depend on it declare BlockedBy
    
- Work continues on non-dependent portions, but implementation gate is blocked.
    

---

### **C) Bugs and hotfixes**

  

**Component repo (OpenSpec)**

- Bugs: lightweight component spec + fix + link to incident/issue
    
- Hotfix: minimal hotfix spec + rollback plan + observability minimum + follow-up hardening spec
    

  

**Platform repo (SpecKit)**

- Only if hotfix changes contracts or violates platform policies—then you update contract registry/spec and capture an ADR if a policy exception was made.
    

---

## **7) JIRA Tracking Model That Matches This Setup**

  

**Epic (Initiative):** ECO-124 Guest Checkout

**Platform Spec (Story):** SPEC-PLAT-124 (SpecKit)

**Component Implementation (Tasks):** SPEC-CART-01, SPEC-PAY-02 (OpenSpec)

**Contract Change (Story/Task):** SPEC-CONTRACT-10

**ADR (Decision):** ADR-100

**Bug:** BUG-200

**Hotfix:** HOTFIX-01

  

Each issue links to:

- Parent platform spec
    
- Context pack version
    
- Contracts/ADRs involved
    

---

## **8) Practical “Day 1” Implementation Checklist**

1. **Stand up Platform SpecKit repo**
    
    - Constitution first (/speckit.constitution) 
        
    
2. **Define MCP sources**
    
    - Platform policies, domain invariants, contract registry, component constraints
        
    
3. **Adopt MCP-aware spec template**
    
    - Every section includes Source: …
        
    
4. **Run one pilot initiative**
    
    - Create platform spec (/speckit.specify) 
        
    - Generate plan/tasks (/speckit.plan, /speckit.tasks) 
        
    
5. **Fan-out to 2–3 component repos using OpenSpec**
    
    - Enforce “Implements + Context Pack + Contract refs”
        
    
6. **Add gates**
    
    - Block implementation until sources + compatibility + NFRs are satisfied
        
    

---

## **The point of this split (why it works)**

- **SpecKit** gives you a consistent platform-level “what/why + rollout” workflow, driven by standardized commands. 
    
- **OpenSpec** gives component teams autonomy to execute “how” and keep local spec history—without losing alignment.
    
- **MCP Context Packs** ensure everyone implements against the same ecosystem truth (policies, invariants, contracts), preserving “single source of truth” beyond code.
    

  

If you want, I can turn this into:

- a **platform repo structure** + naming conventions for Spec IDs and Context Packs,
    
- and a **strict gating policy** (what exactly blocks which phase) tailored to e-commerce domains (Cart/Checkout/Payments/Shipping).