# Chat Platform — Multitenancy Proposal

**Capability-Aware, Policy-Governed, Configuration-Driven Multitenancy**

## 1. The Concept

Multitenancy defines how a platform separates and governs multiple consumers sharing common capabilities and infrastructure.

A tenant is not simply a collection of configuration values. It represents a governed operational boundary with explicit ownership, lifecycle, policies, and applicable isolation requirements.

For Chat, four concepts must be distinguished:

|Concept|Responsibility|
|---|---|
|**LOB**|Organizational ownership, compliance, security, and data governance|
|**Chat Tenant**|Independently governed operational and configuration context|
|**Chat Capability**|Reusable functionality, such as Bot and Agent Chat|
|**Experience Policy**|Behavioral variations, such as VIP treatment, priority, or language|

These dimensions are related, but they are not interchangeable.

## 2. Conceptual Architecture

```
flowchart TB
    E["Enterprise Governance"]
    L1["Card LOB"]
    L2["Banking LOB"]
    T1["Chat Tenant A"]
    T2["Chat Tenant B"]
    T3["Chat Tenant C"]
    C["Shared Chat Capabilities<br/>Bot | Agent Chat"]
    P["Tenant-Specific Configuration<br/>and Experience Policies"]

    E --> L1
    E --> L2
    L1 --> T1
    L1 --> T2
    L2 --> T3
    T1 --> C
    T2 --> C
    T3 --> C
    C --> P
```

_This diagram represents logical governance and consumption relationships, not physical infrastructure. Shared capabilities must preserve tenant-specific authorization and data isolation._

## 3. Why Are We Proposing This?

Amazon Connect uses LOB-based classification and additional segmentation to support its contact management, routing, organizational, and operational requirements.

This approach is valid for Amazon Connect. However, Chat has different responsibilities and may require different operational boundaries.

**LOB alone does not necessarily define Chat's operational needs.** Two consumers within the same LOB may require independent ownership, lifecycle, access controls, or operational governance.

**Capabilities should remain reusable.** Bot and Agent Chat may serve multiple tenants across different LOBs without duplicating platform functionality.

**Configuration differences should not automatically create tenants.** Different prompts, languages, VIP treatments, or enabled capabilities may be handled through configuration or experience policies.

**Integration does not require identical tenant models.** Chat can preserve its own tenant identities while maintaining explicit, secure, and traceable mappings with Amazon Connect.

**Security and compliance remain mandatory.** Tenant autonomy must never override enterprise or LOB-level policies, authorization, or data protection requirements.

## 4. When Should Chat Create a New Tenant?

A separate Chat Tenant should be justified by meaningful requirements for independent:

- Ownership or governance.
    
- Security or data isolation.
    
- Operational lifecycle.
    
- Configuration administration.
    
- Operational accountability or isolation guarantees.
    

Functional differences alone are insufficient.

When existing tenant boundaries can safely support the requirements through configuration profiles, creating another tenant should be avoided.

## 5. Architectural Recommendation

Adopt a **Capability-Aware, Policy-Governed, Configuration-Driven Multitenancy Model**, subject to validation of the independent tenant boundary requirements.

Under this model:

- LOB defines mandatory organizational and governance context.
    
- Chat Tenant defines an independently governed operational boundary.
    
- Capabilities provide reusable functionality.
    
- Experience Policies configure behavioral variations.
    

Chat and Amazon Connect may retain different internal classification models while preserving interoperability, traceability, and enterprise security obligations.

**Key Architectural Decision**

> The question is not whether Chat requires different configurations. It is whether Chat requires independently governed operational contexts that cannot be adequately represented through configurations within existing tenant boundaries.

**The goal is not to create more tenants, but to establish the minimum boundaries necessary for clear ownership, secure isolation, operational consistency, and sustainable platform evolution.**