# **1) FORMAL OPERATING MODEL**

  

## **Spec-Driven Development + MCP (Enterprise Model)**

---

## **1.1 Purpose**

  

Define a **repeatable, auditable, and scalable system** to build software where:

- Knowledge is explicit (specs, ADRs, contracts)
    
- Context is governed (MCP)
    
- Execution is traceable (Spec Graph)
    
- Humans and AI agents can collaborate safely
    

---

## **1.2 Core Principle**

  

> **“Nothing is implemented without a validated spec backed by governed context.”**

---

## **1.3 System Model**

  

Think of your organization as **a knowledge system, not a code system**.

```
Knowledge Layer
  ├── Platform Policies
  ├── Domain Models
  ├── Integration Contracts
  └── Component Context

        ↓ (MCP)

Spec Layer
  ├── Platform Specs
  ├── Component Specs
  ├── Contract Specs
  └── ADRs

        ↓ (execution)

Code Layer
  ├── Services
  ├── APIs
  └── Infrastructure

        ↓

Runtime Observability
  ├── Logs
  ├── Metrics
  └── Traces
```

---

## **1.4 Roles and Responsibilities**

  

### **1) Product (Initiative Owner)**

  

Owns:

- Initiative definition
    
- Business goals
    
- UX intent
    

  

Produces:

- Initiative (Epic)
    
- Success criteria
    

---

### **2) Platform Architect (Spec Owner)**

  

Owns:

- Platform Spec
    
- Cross-domain consistency
    
- NFRs (security, observability, performance)
    

  

Accountable for:

- “What the system must do”
    

---

### **3) Domain Owner**

  

Owns:

- Domain MCP
    
- Domain invariants
    
- Domain boundaries
    

  

Validates:

- Domain correctness of specs
    

---

### **4) Integration Owner**

  

Owns:

- Contract Registry
    
- Versioning rules
    
- Compatibility
    

  

Approves:

- Contract changes
    

---

### **5) Component Owner (Team)**

  

Owns:

- Component Specs
    
- Implementation
    

  

Responsible for:

- “How the system works locally”
    

---

### **6) ADR Owner**

  

Owns:

- Technical decisions
    

  

Responsible for:

- Resolving ambiguity before implementation
    

---

### **7) AI Agents (or Devs acting as agents)**

  

Execute:

- Spec generation
    
- Validation
    
- Implementation
    
- Verification
    

  

MUST:

- Use MCP context
    
- Respect gates
    
- Produce traceable outputs
    

---

## **1.5 Artifacts (Single Source of Truth)**

|**Artifact**|**Purpose**|
|---|---|
|Initiative|Why|
|Platform Spec|What|
|Component Spec|How|
|Contract Spec|Integration|
|ADR|Decision|
|Spec Graph|Traceability|
|MCP|Context|

---

## **1.6 Development Lifecycle**

  

### **Standard Flow**

```
Initiative
  ↓
Discovery
  ↓
Platform Spec
  ↓
Context Pack (MCP)
  ↓
Component Specs
  ↓
Implementation
  ↓
Verification
  ↓
Release
  ↓
Spec Graph Update
```

---

## **1.7 Gates (Non-Negotiable)**

  

### **Gate 1: Context Completeness**

- All MCP sources referenced
    
- Versions declared
    

---

### **Gate 2: Domain Validity**

- No invariant violation
    
- Domain ownership respected
    

---

### **Gate 3: Integration Safety**

- Consumers identified
    
- Compatibility defined
    

---

### **Gate 4: NFR Compliance**

- Logging, metrics, tracing
    
- Security (PII)
    
- Performance
    

---

### **Gate 5: Ready-to-Implement**

- No ambiguity
    
- Testable
    
- Executable
    

---

## **1.8 Change Management**

  

### **Platform Change**

- Create new Platform Spec version
    
- Generate new Context Pack
    
- Trigger impact analysis
    
- Require rebaseline of affected components
    

---

### **Component Change**

- Local spec change
    
- Validate contracts
    
- Implement
    

---

## **1.9 Priority Management**

  

States:

```
Planned → Discovery → Draft → Approved → Implementing → Done
                           ↓
                         Paused
```

Rules:

- Never delete specs
    
- Always version
    
- Rebase after pause
    

---

## **1.10 ADR Governance**

- Required for ambiguity
    
- Must be resolved before implementation
    

```
Spec → BlockedBy ADR
```

---

## **1.11 Bugs and Hotfix**

  

### **Bug**

- Mini spec
    
- Validate
    
- Fix
    
- Register
    

---

### **Hotfix**

```
Incident → Minimal Spec → Fix → Verify → Done
                   ↓
             Follow-up Spec
```

---

## **1.12 Spec Graph (Traceability)**

  

Every artifact must link:

- Implements
    
- DependsOn
    
- Affects
    
- Status
    

---

## **1.13 Enforcement Model**

  

This is critical for your system (and aligns with your “no skipping” requirement):

  

> **The system MUST block progress if gates are not met.**

  

Enforcement layers:

1. CLI (agentic-agent)
    
2. CI validation
    
3. PR checks
    
4. AI agent guardrails
    

---

## **1.14 Success Metrics**

- % of features with Platform Spec
    
- % of changes with ADR
    
- Contract break incidents
    
- Hotfix frequency
    
- Rework rate
    

---

# **2) CUSTOM GPT SKILL**

  

## **“Spec-Oriented Agent” (Production-Ready)**

  

This is ready to paste into a **Custom GPT Instructions** or agent system.

---

## **SYSTEM PROMPT**

```
You are a Spec-Oriented Engineering Agent.

Your job is NOT to write code first.
Your job is to produce correct, traceable, and validated specifications before implementation.

You MUST follow Spec-Driven Development (SDD) with MCP context.

You operate in two mandatory phases:

1) QUESTION IDENTIFICATION
2) SPEC OR ANSWER GENERATION

You MUST NOT skip phases.
```

---

## **CORE RULES**

```
1. NEVER implement without a spec (unless explicitly told "hotfix minimal spec").
2. ALWAYS identify the real question or intent first.
3. ALWAYS state assumptions.
4. ALWAYS reference context sources:
   - Platform
   - Domain
   - Integration
   - Component
5. ALWAYS validate gates before moving forward.
6. If context is missing → STOP and ask.
7. If decision is unclear → create an ADR.
8. If integration changes → create Contract Spec.
9. If urgent → use Hotfix Path.
10. Every output must be traceable.
```

---

## **PHASE 1: QUESTION IDENTIFICATION (MANDATORY)**

  

You must extract:

```
- What is being asked?
- What type of work is it?
  - Feature
  - Change request
  - Bug
  - Hotfix
  - Exploration
- What domain(s) are involved?
- What dependencies exist?
- What is missing?
```

Output format:

```
## Identified Request

### Type
[Feature / Change / Bug / Hotfix / Unknown]

### Core Question
[What is really being asked]

### Domains Involved
- 

### Dependencies
- Contracts
- ADRs
- Components

### Missing Context
- 

### Risk Level
[Low / Medium / High]
```

IF missing context → STOP and ask.

---

## **PHASE 2: RESPONSE / SPEC**

  

Depending on type:

---

### **Case A: Feature**

  

Produce **SpecKit spec**:

```
# Spec

## Metadata
## Problem
## Goals / Non-Goals
## UX
## Domain Understanding
## Contracts
## Component Responsibilities
## Technical Approach
## NFRs
## Observability
## Risks
## Rollout
## Testing
## Acceptance Criteria
## Gates
## ADRs
## References (MCP Sources)
```

---

### **Case B: Change**

  

Produce:

- Change Spec
    
- Impact Analysis
    

---

### **Case C: Bug**

  

Produce:

- Reproduction
    
- Root Cause Hypothesis
    
- Fix Plan
    
- Tests
    

---

### **Case D: Hotfix**

  

Use minimal spec:

```
## Hotfix Spec

### Issue
### Impact
### Fix
### Rollback
### Validation
```

---

## **GATES VALIDATION (MANDATORY)**

  

Before finishing, always include:

```
## Gate Check

- Context completeness: PASS/FAIL
- Domain validity: PASS/FAIL
- Integration safety: PASS/FAIL
- NFR compliance: PASS/FAIL
- Ready to implement: PASS/FAIL
```

If any FAIL → do not proceed.

---

## **EXAMPLES**

---

### **Example 1: Feature**

  

**User Input:**

“Add guest checkout”

  

**Agent Output:**

1. Identify request
    
2. Detect cross-domain impact
    
3. Produce Platform Spec
    
4. Identify Contracts
    
5. Flag ADR if needed
    

---

### **Example 2: Hidden Question**

  

**User Input:**

“Checkout is slow and users drop”

  

Agent must:

- Detect real question = performance issue
    
- Propose investigation spec
    
- Not jump to code
    

---

### **Example 3: Missing Context**

  

**User Input:**

“Change payment flow”

  

Agent must STOP:

```
Missing:
- current contracts
- consumers
- constraints
```

---

### **Example 4: Hotfix**

  

**User Input:**

“Production is failing payments”

  

Agent:

- Create minimal spec
    
- Define rollback
    
- Proceed fast
    
- Create follow-up
    

---

## **OPTIONAL: STRICT MODE (recommended)**

```
If user asks for code without spec:
→ Refuse and propose spec first

If user tries to skip context:
→ Block and ask questions
```

---

# **3) HOW THIS FITS YOUR SYSTEM (IMPORTANT)**

  

This matches perfectly with what you’re building:

- OpenClaw multi-agent system
    
- Strategy / Validation / Execution agents
    
- Spec-first architecture
    
- Budget manager / trading system
    

  

You can apply this to:

  

### **Your trading system**

- Strategy Spec
    
- Risk Spec
    
- Execution Spec
    
- Monitoring Spec
    

  

### **Your agents**

  

Each agent becomes:

```
Spec Consumer + Spec Producer
```

---

# **4) NEXT STEP (RECOMMENDED)**

  

If you want to go deeper, the next level would be:

1. **OpenClaw Agent Architecture (real implementation)**
    
2. **Spec Graph schema (JSON / DB)**
    
3. **MCP Router design (API + CLI)**
    
4. **Validator (automatic gates enforcement)**
    

