
# Spec-Driven Development with MCP

  


## Playbook for Multi-Agent and Multi-Domain Platforms

  

This playbook defines a practical methodology for developing software using:

- **Spec-Driven Development (SDD)**
    
- **SpecKit** (a disciplined spec workflow)
    
- **MCP (Model Context Protocol)** as a governed context system
    
- **Spec Graph** for full traceability
    




## 1. Introduction

  

The goal is to build complex systems (e.g., e-commerce) where multiple components and agents work coherently, without relying on implicit or tribal knowledge.




## 2. Problem it solves

  

In traditional distributed systems:

- Each team interprets requirements differently
    
- Contracts between services break
    
- There is no traceability of decisions
    
- Changes create unexpected side effects
    
- Context is scattered (tickets, chats, docs, code)
    

  

**Typical result:**

- Integration bugs
    
- Rework
    
- UX inconsistencies
    
- Technical debt
    




## 3. Key concepts

  


### 3.1 Spec-Driven Development (SDD)

  

No code is implemented without a clear, validated, and traceable specification.

  

**Flow:**

```
Discovery → Spec → Plan → Implement → Verify
```




### 3.2 SpecKit

  

SpecKit defines:

- Spec structure
    
- Development phases
    
- Mandatory gates
    
- “Ready to implement” criteria
    




### 3.3 MCP (Model Context Protocol)

  

MCPs provide structured context:

- Global specifications
    
- Platform policies
    
- Integration contracts
    
- Domain context
    
- Component context
    

  

They are not loose documents; they are **governed context**.




### 3.4 Context Pack

  

The result of querying MCPs. Includes:

- Policies (MUST/SHOULD)
    
- Domain invariants
    
- Integration contracts
    
- Component constraints
    
- Templates and gates
    




### 3.5 Spec Graph

  

A graph of specs, decisions, and dependencies:

```
Initiative → Platform Spec → Component Specs → Contracts → ADRs
```

Enables full traceability.




## 4. MCP Architecture

  


### 4.1 MCP Types


1. Platform MCP
  - UX guidelines
  - Security / PII
  - Observability
  - Definition of Done
2. Domain MCP
  - Entities
  - Invariants
  - Events
  - Business rules
3. Integration MCP
  - APIs / events
  - Versioning
  - Consumers
  - Compatibility
4. Component MCP
  - Local architecture
  - Approved patterns
  - Constraints
  - Runbooks
    




### 4.2 MCP Router

  

Selects relevant context and generates the **Context Pack**.




## 5. Development flow

```
Roadmap / Initiative
  ↓
Platform Spec (SpecKit)
  ↓
MCP Router → Context Pack
  ↓
Component Specs (OpenSpec / SpecKit)
  ↓
Implementation
  ↓
Verification
  ↓
Spec Graph (history)
```




## 6. Example: e-commerce

  

Common domains:

- Catalog
    
- Search
    
- Cart
    
- Checkout
    
- Payments
    
- Fulfilment
    
- Shipping
    




### 6.1 Flow with SDD

1. Create a Platform Spec
    
2. Define UX flow, contracts, responsibilities, and NFRs
    
3. Each component creates its spec
    
4. Gates are validated
    
5. Implementation proceeds
    




### 6.2 Flow without SDD

- Each team interprets differently
    
- Contracts break
    
- QA detects issues late
    
- Hotfixes are applied
    




### 6.3 Comparison

|**Without SDD**|**With SDD**|
|||
|Free interpretation|Clear specs|
|Integration bugs|Versioned contracts|
|Tribal knowledge|Spec Graph|
|Rework|Preventive gates|




## 7. SpecKit Template (MCP-Aware)

  

Each section must declare sources:

```
Source: Platform MCP / Domain MCP / Integration MCP / Component MCP
```




### Suggested structure

1. Metadata
    
2. Problem Statement
    
3. Goals / Non-Goals
    
4. User Experience
    
5. Domain Understanding
    
6. Cross-Domain Interactions
    
7. Contracts
    
8. Component Responsibilities
    
9. Technical Approach
    
10. NFRs
    
11. Observability
    
12. Risks
    
13. Rollout
    
14. Testing
    
15. Acceptance Criteria
    
16. Gates
    
17. ADRs
    
18. References
    
19. Spec Graph Links
    




## 8. Change Requests

  


### 8.1 Platform-level

- New version of Platform Spec
    
- Updated Context Pack
    
- Multi-component impact
    




### 8.2 Component-level

- Local change spec
    
- Contract impact validation
    
- Controlled implementation
    




## 9. Priority management

  

Recommended states:

- Planned
    
- Discovery
    
- Draft
    
- Approved
    
- Implementing
    
- Paused
    
- Done
    




### Rules

- Do not delete specs
    
- Version all changes
    
- Rebase with a new Context Pack
    




## 10. Blocking ADRs

  

States:

- Proposed
    
- In Review
    
- Approved
    
- Rejected
    

  

Explicit dependency:

```
Spec → BlockedBy ADR
```

No implementation occurs until approval.




## 11. Bugs

  


### Regular bug

- Mini spec
    
- Quick validation
    
- Fix
    
- Recorded in Spec Graph
    




### Hotfix

```
Incident → Hotfix Spec → Fix → Verify → Done
                 ↓
          Follow-up Spec
```




## 12. Hotfix Path

  

Minimum requirements:

- Impact
    
- Rollback
    
- Minimal observability
    
- Quick validation
    

  

Afterwards: hardening spec.




## 13. JIRA mapping

- **Epic**: ECO-124
    
- **Platform Spec**: SPEC-PLAT-124
    
- **Component Specs**: SPEC-CART-001, SPEC-PAY-002
    
- **Contract Spec**: SPEC-CONTRACT-10
    
- **ADR**: ADR-100
    
- **Bug**: BUG-500
    
- **Hotfix**: HOTFIX-20
    




## 14. Spec Graph

```
Initiative
├── Platform Spec
│   ├── Component Specs
│   ├── Contract Specs
│   └── ADRs
```




## 15. Benefits

- Global consistency
    
- Fewer integration bugs
    
- Full traceability
    
- Organizational scalability
    
- Better support for AI agents
    




## 16. Key rules

1. Do not implement without a spec
    
2. Every spec must declare MCP sources
    
3. Do not change contracts without a Contract Spec
    
4. Every important decision must have an ADR
    
5. Every change must be traceable
    




## 17. Final insight

  

This model turns development into an **executable knowledge system**:

- SpecKit: discipline
    
- MCP: context
    
- Specs: operational truth
    
- Spec Graph: institutional memory
    




## 18. Next step

  

To operate this in production, you need:

- A spec repository
    
- MCP (conceptual or implemented)
    
- Standardized templates
    
- JIRA integration
    
- A spec-first culture
    



If you want, I can next turn this into a **formal operating model**, a **custom GPT skill**, or even a **multi-agent architecture (OpenClaw style)** aligned with everything you’ve been building.