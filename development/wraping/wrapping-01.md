
# **Proactive Experience – Strategic Vision and Architecture Direction**

## **Purpose**

The purpose of **Proactive Experience** is to improve the final step of the **Top of Call** flow by identifying, as early as possible, the most likely reason the customer is calling.

The goal is to use customer, account, and contextual information to proactively determine which experience, self-service flow, or assistance path may be most relevant for the caller.

Instead of waiting for the customer to fully explain their need, the platform should be able to infer possible intent and offer the right experience at the right moment.

The strategic objective is to help customers self-serve more effectively, reduce friction, and guide them into the most appropriate flow based on their context.

---

## **Current State**

Today, Proactive Experience is implemented as a long chain of conditional logic.

The current flow relies heavily on `if / else if / else` logic where each proactive rule calls different services, evaluates different responses, and applies specific business logic.

This logic is currently distributed across multiple places, including:

- Main flows
- Subflows
- MiniApps in OCP
- Supporting APIs
- Tenant-specific service calls
- Custom business logic per experience

Because of this distribution, the implementation is difficult to understand, maintain, and extend.

Adding a new proactive experience requires understanding multiple layers of flow logic, service dependencies, precedence rules, customer eligibility, account conditions, and tenant-specific behavior.

---

## **Problem Statement**

The main challenge is that Proactive Experience needs to remain flexible, but the current implementation makes that flexibility expensive.

Each proactive experience may have:

- Its own eligibility rules
- Its own service dependencies
- Its own customer/account conditions
- Its own precedence order
- Its own maximum display or execution limits
- Its own tenant-specific behavior
- Its own fallback behavior

As more use cases are added, the current structure becomes harder to maintain.

The risk is that every new proactive experience increases complexity, introduces regression risk, and makes the Top of Call flow harder to evolve.

---

## **Strategic Vision**

The long-term vision is to transform Proactive Experience into a reusable, enterprise-ready capability.

The core idea is:

The main flow should remain consistent, but the implementation of each proactive experience should be extensible and tenant-aware.

Instead of embedding all proactive logic directly into the Top of Call flow, the platform should move toward a structured decision framework supported by a dedicated service.

The flow should ask:

“Given this customer, this account, this tenant, and this context, what proactive experience should be offered?”

The service should own the decision logic.

The flow should simply orchestrate the experience.

---

## **Desired Future State**

In the desired future state, Proactive Experience should have a common core workflow used by all tenants and LOBs.

That core workflow should be responsible for:

- Receiving the customer and account context
- Identifying applicable proactive experience candidates
- Evaluating eligibility rules
- Applying precedence logic
- Respecting limits and guardrails
- Selecting the best proactive experience
- Returning a clear decision to the calling flow

The Top of Call flow should not need to know the internal logic of each proactive experience.

It should only know how to call the Proactive Experience service and how to execute the result.

---

## **Architecture Direction**

The recommended architecture should follow the same design philosophy used for the Call Transfer module.

The system should provide a stable core with controlled extension points.

The core should define:

- The common request model
- The common response model
- The evaluation lifecycle
- The execution order
- The precedence strategy
- The fallback behavior
- The tenant resolution mechanism
- The rule evaluation contract

Each tenant or LOB should be able to plug in its own implementation without changing the core flow.

This creates a balance between flexibility and structure.

---

## **Core Design Principle**

The most important principle is:

Keep the flow rigid. Keep the rules flexible.

The main Top of Call flow should remain simple and stable.

The proactive rules should be extensible, configurable, and tenant-specific when needed.

This allows the platform to support new use cases without turning the main flow into a growing chain of conditional logic.

---

## **Open/Closed Principle**

Proactive Experience should be designed to follow the Open/Closed Principle.

It should be:

### **Open for extension**

New proactive experiences, new tenants, new rules, and new evaluation strategies should be added through new implementations, configurations, or adapters.

### **Closed for modification**

The core Top of Call flow and shared orchestration logic should not require constant changes every time a new proactive experience is introduced.

The goal is to add new behavior without rewriting the main framework.

---

## **Recommended Model**

A proactive experience should be treated as a structured business capability, not just another condition in the flow.

Each proactive experience should define:

- Name or identifier
- Tenant or LOB applicability
- Eligibility rules
- Required data
- Service dependencies
- Precedence priority
- Maximum execution limits
- Fallback behavior
- Response/action to execute
- Observability requirements

This makes each experience explicit, isolated, testable, and easier to evolve.

---

## **Tenant-Aware Execution**

The same core logic should be reused across tenants.

However, the final implementation may differ depending on the tenant, LOB, or use case.

For example:

- Tenant A may use one eligibility rule.
- Tenant B may use a different rule.
- Tenant C may not support that proactive experience at all.
- Another tenant may require an additional service call before making a decision.

The core framework should support these differences without duplicating the entire flow.

---

## **Simplification Goal**

A key improvement opportunity is to simplify the current implementation.

The goal is not to remove flexibility.

The goal is to remove accidental complexity.

Future work should focus on:

- Reducing scattered conditional logic
- Moving decision logic out of the flow
- Making each proactive rule explicit
- Centralizing precedence logic
- Standardizing how service dependencies are called
- Making tenant-specific behavior easier to plug in
- Improving testability
- Improving observability
- Making the code easier for new engineers to understand

The system should be flexible by design, not flexible because every path is manually hardcoded.

---

## **What Should Stay Stable**

The following principles should remain consistent:

- The Top of Call flow should stay simple.
- The main orchestration logic should be reusable.
- Proactive Experience decisions should be centralized.
- Tenant-specific behavior should be isolated.
- New use cases should not require rewriting the core flow.
- Precedence and limits should be explicit.
- The implementation should remain easy to test and reason about.

---

## **Future Guiding Questions**

Before adding a new proactive experience, the team should ask:

1. Is this a new rule or a change to the core flow?
2. Can this be added without modifying the main Top of Call flow?
3. Does this logic apply to one tenant or multiple tenants?
4. What data is required to evaluate this experience?
5. What is the precedence of this experience?
6. What happens if the required service fails?
7. How will this be tested?
8. How will this be observed in production?
9. Will this make the overall system simpler or more complex?

If a new experience requires modifying multiple flows, MiniApps, and APIs, the design should be reconsidered.

---

## **Final Vision**

The future of Proactive Experience should be a reusable enterprise capability that helps identify the customer’s likely need at the top of the call and guides them into the right self-service path.

The system should provide a stable common flow while allowing each tenant or LOB to customize its own rules and behavior.

The guiding philosophy should be:

Keep the customer experience proactive.  
Keep the Top of Call flow simple.  
Keep the core logic stable.  
Keep the business rules extensible.  
Add new experiences through extension, not modification.



---
---


# **Call Transfer – Strategic Vision, Architecture, and Future Direction**

## **Purpose**

The Call Transfer module was designed to become the enterprise standard for transfer destination resolution across all Lines of Business (LOBs).

Historically, each LOB implemented its own routing logic, resulting in duplicated business rules, inconsistent behavior, and increasing maintenance costs. Every new application had to understand Connect-specific routing rules, Transfer Reasons, destination numbers, and business exceptions.

The objective of this module is to remove that responsibility from individual applications.

Instead of every consumer implementing transfer logic, applications simply describe **what they need** (Transfer Reason and contextual information), while the enterprise service determines **where** the call should be transferred.

This creates a single source of truth for transfer routing across the enterprise.

---

# **Long-Term Vision**

The long-term vision is for every application, MiniApp, IVR flow, and future consumer to rely on the same enterprise service for transfer resolution.

Consumers should never need to know:

- Phone numbers
- Routing tables
- Connect implementation details
- LOB-specific business rules
- Future routing changes

Their only responsibility is to provide the appropriate business context.

The Call Transfer service owns the routing intelligence.

As Connect evolves or routing strategies change, only this service should require updates.

Consumers should remain completely isolated from those changes.

---

# **Consumer Experience**

One of the primary design goals was to make the consumer experience extremely simple.

From the perspective of an OCP MiniApp, the workflow is intentionally minimal:

1. Receive the business request.
2. Build the Call Transfer request payload.
3. Invoke the Call Transfer API.
4. Receive the transfer destination.
5. Transfer the call.

If the API cannot resolve a destination or becomes unavailable, the MiniApp applies a predefined fallback strategy.

The MiniApp should never contain routing logic.

It should only orchestrate the request.

---

# **Enterprise Responsibilities**

The Call Transfer service is responsible for:

- Understanding Transfer Reasons
- Understanding Connect routing requirements
- Determining the correct transfer destination
- Applying enterprise routing policies
- Supporting multiple LOB implementations
- Remaining backward compatible
- Providing a stable API contract

This separation of responsibilities keeps business applications lightweight while centralizing routing expertise.

---

# **Architectural Principles**

The architecture was intentionally designed around several software engineering principles.

## **1. Separation of Concerns**

Consumers know _when_ a transfer is needed.

The Call Transfer service knows _where_ the transfer should go.

Those responsibilities should never be mixed.

---

## **2. Single Responsibility**

The service has one responsibility:

Resolve transfer destinations.

It should avoid becoming responsible for IVR orchestration, customer interaction, workflow execution, or unrelated business logic.

---

## **3. Enterprise First**

The service should always be designed with enterprise reuse in mind.

Before introducing new behavior, ask:

Can another LOB benefit from this capability?

If the answer is yes, the capability belongs in the shared core.

If the behavior is unique to a single LOB, it should remain isolated within that LOB’s implementation.

---

## **4. Open for Extension, Closed for Modification**

This is the most important architectural principle.

The framework should welcome new use cases without requiring modifications to the existing core.

The goal is:

Add functionality.

Never rewrite functionality.

New routing behavior should be introduced through new implementations rather than changing existing ones.

This minimizes regression risk and preserves stability for all consumers.

---

# **Extensibility Model**

The architecture provides a common framework that every LOB follows.

The framework defines:

- API contract
- Request validation
- Common workflow
- Error handling
- Shared abstractions
- Routing lifecycle

Each LOB then provides its own implementation for the business-specific routing logic.

This is achieved through:

- Interfaces
- Dependency inversion
- Polymorphism
- Ports and Adapters (Hexagonal Architecture)

The core orchestrates the process while individual implementations supply the routing behavior.

Because of this separation, adding support for another LOB should require little more than implementing a new adapter.

The existing framework should remain unchanged.

---

# **What Should Never Change**

The following principles should remain stable regardless of future enhancements.

## **Stable API**

Avoid breaking existing consumers.

Prefer extending request models over replacing them.

---

## **Stable Core**

The orchestration pipeline should remain generic.

Business logic belongs inside implementations.

---

## **Centralized Routing**

Consumers should never hardcode routing decisions.

All routing knowledge belongs inside this service.

---

## **Consistent Consumer Experience**

Every consumer should interact with the service in the same way regardless of the underlying LOB implementation.

---

# **Areas for Improvement**

Although the current architecture successfully achieves extensibility, it can be improved.

The biggest opportunity is **simplification**.

Over time, abstraction layers naturally accumulate as new use cases are introduced.

Some of those abstractions may no longer provide meaningful value and may increase cognitive complexity for new developers.

The next evolution of this module should focus on making the implementation easier to understand while preserving its architectural strengths.

The objective is **not** to redesign the architecture.

The objective is to reduce accidental complexity.

When simplifying the codebase, evaluate:

- Whether abstractions still provide value.
- Whether inheritance can be replaced with simpler composition.
- Whether interfaces remain meaningful.
- Whether classes can be consolidated.
- Whether responsibilities are clearly separated.
- Whether naming accurately reflects business intent.

Every simplification should make the code easier to reason about without sacrificing extensibility.

---

# **Guiding Principle for Future Development**

When implementing a new feature, ask the following questions:

1. Can this be implemented without modifying the existing core?
2. Is this capability reusable by another LOB?
3. Does this belong in the shared framework or in a specific implementation?
4. Will this increase or decrease the simplicity of the solution?
5. Will another engineer understand this design six months from now?

If the answer to the last question is “probably not,” the solution is likely too complex.

Favor clarity over cleverness.

Simple architectures are easier to maintain, easier to test, and easier to extend.

---

# **Final Thought**

The greatest success of this module is not that it resolves transfer destinations.

Its success is that it establishes a reusable enterprise capability that allows every Line of Business to leverage a common routing platform while maintaining the flexibility to address their own business requirements.

The architecture should continue to evolve, but its philosophy should remain unchanged:

**Keep the consumer simple. Keep the enterprise core stable. Extend behavior instead of modifying it. Continuously simplify the implementation without sacrificing flexibility.**