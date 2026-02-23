Here is your **Six Pager fully translated and refined in English**, keeping it **clear, professional, and ready for leadership or technical audiences**.

---

# **📄 Six Pager**

  

## **Spec-Driven Development with SpecKit + MCPs for Multi-Component Platforms**

---

## **1. Context**

  

Modern platforms are composed of multiple domains, such as:

- Catalog
    
- Search
    
- Cart
    
- Checkout
    
- Payments
    
- Shipping
    
- Fulfillment
    

  

Each domain has:

- Its own data model
    
- Its own business logic
    
- Its own team
    

  

The challenge arises because:

  

> The user experience is unified, but the implementation is distributed.

  

This creates friction across teams and systems.

---

## **2. Structural Problem**

  

Without a structured specification system:

1. **Misalignment across teams**
    
    Different interpretations of the same requirement
    
2. **Fragile integrations**
    
    Changes to APIs/events break dependent services
    
3. **Lack of traceability**
    
    Decisions are not documented or recoverable
    
4. **Dependency on individuals**
    
    Knowledge lives in people instead of the system
    

  

👉 The result is increased risk, rework, and instability.

---

## **3. Core Principle**

  

> Design the system as a network of knowledge, not just code.

  

The goal is to make knowledge:

- Explicit
    
- Structured
    
- Versioned
    
- Consumable
    

---

## **4. Solution Components**

---

### **4.1 SpecKit (Process)**

  

SpecKit defines how work is performed through structured phases.

  

#### **Phases**

```
1. Discovery
2. Spec
3. Plan
4. Implementation
5. Verification
```

#### **Gates**

- Context completeness
    
- Domain validity
    
- Integration safety
    
- NFR compliance
    
- Implementation readiness
    

  

> Progress is blocked if any gate is not satisfied.

---

### **4.2 MCP (Context)**

  

MCPs provide structured, governed context to agents (human or AI).

  

#### **Platform MCP**

- UX guidelines
    
- Security and compliance
    
- Observability standards
    
- Definition of Done
    

---

#### **Domain MCP**

- Entities
    
- States
    
- Invariants
    

---

#### **Integration MCP**

- APIs
    
- Events
    
- Versioning rules
    
- Consumers
    

---

#### **Component MCP**

- Local architecture
    
- Approved patterns
    
- Constraints
    

---

#### **MCP Router**

Combines multiple sources to generate a:

```
Context Pack
```

---

### **4.3 Context Pack**

  

A Context Pack contains all relevant information for a task:

- Policies (MUST / SHOULD)
    
- Domain invariants
    
- Contracts
    
- Local constraints
    
- Templates
    
- Gates
    

  

👉 It ensures that work is aligned with the entire system.

---

### **4.4 Specs**

  

Specifications are first-class artifacts.

  

Types:

- **Platform Spec** → defines the “what” (UX, responsibilities, contracts)
    
- **Component Spec** → defines the “how” within a service
    
- **Contract Spec** → defines integration changes
    
- **ADR (Architecture Decision Record)** → documents decisions
    

---

### **4.5 Spec Graph**

  

All artifacts are connected in a traceable graph:

```
Initiative
 ├── Platform Spec
 │   ├── Component Specs
 │   ├── Contract Specs
 │   └── ADRs
```

👉 Enables full traceability across the system lifecycle.

---

## **5. Development Flow**

```
Roadmap
  ↓
Platform Spec
  ↓
Context Pack (via MCP)
  ↓
Component Specs
  ↓
Implementation
  ↓
Verification
  ↓
Spec Graph
```

Each step is validated through gates and context.

---

## **6. Real Example: Guest Checkout**

---

### **Without SDD**

- Checkout implements the flow independently
    
- Cart uses different state logic
    
- Payments modifies events without coordination
    
- Shipping breaks due to missing data
    
- QA detects issues late
    

  

👉 Result: bugs, inconsistencies, and rework

---

### **With SDD**

- Platform Spec defines:
    
    - End-to-end UX
        
    - Domain responsibilities
        
    - Contracts
        
    
- Component Specs define implementation per domain
    
- Contract Specs manage versioning and compatibility
    
- Gates validate alignment before implementation
    

  

👉 Result: consistency, predictability, and fewer errors

---

## **7. Change Management**

---

### **7.1 Platform-Level Change Request**

  

Used for cross-domain changes:

- New version of the Platform Spec
    
- Updated Context Pack
    
- Impacts multiple components
    

  

👉 Requires re-alignment across domains

---

### **7.2 Component-Level Change Request**

  

Used for local changes:

- Create/update Component Spec
    
- Validate impact on contracts
    
- Implement locally
    

  

👉 Faster but still governed

---

## **8. Prioritization**

  

Suggested states:

- Planned
    
- Draft
    
- Approved
    
- Implementing
    
- Paused
    
- Done
    

  

### **Rule**

  

> Specs are never deleted — only versioned.

  

When priorities change:

- Mark as **Paused**
    
- Preserve the current version
    
- Rebase with updated context when resumed
    

---

## **9. ADRs (Architecture Decision Records)**

  

States:

- Proposed
    
- In Review
    
- Approved
    
- Rejected
    

  

### **Explicit dependency**

```
BlockedBy ADR
```

👉 Implementation cannot proceed until the ADR is approved

---

## **10. Bugs and Hotfixes**

---

### **Bug**

- Create a lightweight spec
    
- Implement fix
    
- Link to Spec Graph
    

---

### **Hotfix**

```
Incident → Fix → Follow-up Spec
```

Minimum requirements:

- Rollback strategy
    
- Basic observability
    
- Quick validation
    

  

👉 Followed by a hardening spec

---

## **11. JIRA Integration**

  

Example mapping:

- **Epic** → ECO-124 (Initiative)
    
- **Specs** → SPEC-PLAT-124, SPEC-CART-01, SPEC-PAY-02
    
- **Contracts** → SPEC-CONTRACT-10
    
- **ADR** → ADR-100
    
- **Bug** → BUG-200
    
- **Hotfix** → HOTFIX-01
    

  

👉 Enables alignment between delivery and specifications

---

## **12. Benefits**

- Cross-domain consistency
    
- Fewer integration bugs
    
- Full traceability
    
- Organizational scalability
    
- Strong support for AI agents
    

---

## **13. Risks**

- Initial overhead
    
- Cultural resistance
    
- Poorly maintained specs
    

  

### **Mitigation**

- Automation
    
- Clear templates
    
- Operational discipline
    

---

## **14. Implementation Plan**

1. Define platform policies
    
2. Define domains and ownership
    
3. Define contracts and versioning rules
    
4. Create spec templates
    
5. Define gates
    
6. Build the Spec Graph
    
7. Integrate with tracking systems (e.g., JIRA)
    

---

## **15. Key Insight**

  

> Code is no longer the only source of truth.

  

The operational truth becomes:

  

> A network of versioned, connected specifications

---

## **16. Conclusion**

  

SDD with SpecKit and MCP:

- Aligns product, architecture, and engineering
    
- Reduces uncertainty and risk
    
- Enables scalable development across teams and AI agents
    

  

👉 It is a model designed for complex, distributed systems

---

## **🔑 Final Insight**

  

> Software is no longer just built — it is specified, validated, and executed as a system of knowledge.

---