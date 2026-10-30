

# **Platform Architecture Contract v2**

## **Platform-Level Architecture & Domain Governance**

---

# **Why We Need an Architecture Spine**

As the platform grows, its architecture is no longer contained within a single application, repository, team, or component.

The platform becomes the combination of many independently evolving components, domains, integrations, capabilities, and teams.

Each component may be well designed individually while the **platform as a whole gradually becomes inconsistent**.

The Architecture Spine exists to prevent that.

**The Architecture Spine is the minimum set of shared architectural truths that must remain consistent across the platform while allowing individual components to evolve independently.**

It provides the stable structure connecting:

**Platform Purpose**

↓

**Domains & Boundaries**

↓

**Capabilities & Ownership**

↓

**Components & Responsibilities**

↓

**Data Authority**

↓

**Contracts & Interactions**

↓

**Platform Principles & Invariants**

↓

**Change Impact**

↓

**Specifications**

↓

**Independent Component Implementation**

The Architecture Spine does not describe how every component works internally.

It describes how all components fit together as **one platform**.

---

# **1. The Problem the Architecture Spine Solves**

Without an Architecture Spine, architecture tends to become distributed across:

- Code.
- Repositories.
- PRDs.
- Specifications.
- API documentation.
- Diagrams.
- Team knowledge.
- Slack conversations.
- Historical decisions.
- Individual architects.
- AI sessions.
- Assumptions.

Each source may contain part of the truth.

But no source clearly answers:

**What is the current architectural truth of the platform?**

This creates several problems.

---

# **2. Local Optimization Can Create Platform-Level Problems**

Component teams naturally optimize for their own responsibilities.

That is desirable.

However, a decision that is reasonable locally may be incorrect globally.

For example, a Chat team needs to determine whether a customer can block a card.

The easiest implementation might be:

Add the eligibility logic directly to Chat.

Locally, that may appear simple.

But at platform level it creates a second implementation of a rule owned by the Card domain.

Now:

**Web**

→ Card eligibility

**Mobile**

→ Card eligibility

**Chat**

→ Different copy of Card eligibility

Eventually those implementations can diverge.

The Architecture Spine establishes:

**Card eligibility belongs to the Card domain. Channels consume that capability; they do not redefine it.**

The architecture governs the ownership.

It does not govern how the Card component internally calculates eligibility.

---

# **3. Prevent Architecture by Accident**

Without explicit boundaries, platform architecture emerges from individual feature decisions.

Feature A introduces a cache.

Feature B starts using that cache as authoritative data.

Feature C exposes it to another component.

Feature D introduces business logic based on it.

Eventually:

A temporary implementation decision has become part of the platform architecture.

Nobody intentionally designed it that way.

The Architecture Spine forces an important distinction:

**Implementation Decision**

versus

**Platform Architecture Decision**

If a decision changes ownership, responsibilities, contracts, authority, or platform behavior, it must be recognized as an architectural change.

---

# **4. Establish Clear Ownership**

Many platform problems are fundamentally ownership problems.

Questions such as:

- Who owns Conversation?
- Who owns Session?
- Who owns customer context?
- Who determines eligibility?
- Who owns authentication state?
- Who owns the transcript?
- Who decides whether a conversation can resume?
- Who owns human-agent handoff?

If these questions do not have clear answers, multiple components may start solving the same problem.

The Architecture Spine establishes:

**Every important platform capability, behavior, and authoritative data set must have an identifiable owner.**

Ownership does not mean that only one component can interact with something.

It means one domain has the authority to define its meaning and behavior.

---

# **5. Prevent Responsibility Drift**

Platforms evolve incrementally.

A component starts with responsibility **A**.

Later it receives a small part of **B**.

Then another feature adds **C**.

Another team adds **D** because that component is already in the request path.

Eventually the component owns:

A + B + C + D + E

even though only A belongs to its original responsibility.

This is **responsibility drift**.

The Architecture Spine provides a stable reference against which new responsibilities can be evaluated.

Before adding behavior to a component, we can ask:

Does this behavior belong to this component’s established responsibility?

If not:

Which domain or capability actually owns it?

---

# **6. Protect the Platform from Duplicate Business Logic**

Business rules are particularly vulnerable to duplication.

Suppose the enterprise has:

**Web**

**Mobile**

**Chat**

**Voice**

All four channels need the same eligibility decision.

Without governance, each channel may eventually implement some version of the rule.

The Architecture Spine establishes:

**Shared business behavior belongs to the owning business domain, not to the channel consuming it.**

Channels can control their experiences.

They should not independently redefine the business.

This is one of the most important protections provided by platform governance.

---

# **7. Establish Data Authority**

Modern platforms frequently replicate information.

A component may cache customer information.

Another may maintain a projection.

Another may receive an event.

Another may store historical information.

This creates an important question:

Which value should we trust?

The Architecture Spine identifies the **Data Authority / System of Record**.

It establishes:

**Who owns the information**

rather than merely:

**Who currently stores a copy of the information**

Without this distinction, caches and projections can gradually become accidental Systems of Record.

---

# **8. Make Change Impact Understandable**

A platform feature rarely exists entirely within one repository.

A change may affect:

**Capability**

↓

**Domain**

↓

**Component A**

↓

**Contract**

↓

**Component B**

↓

**Component C**

↓

**Customer Experience**

Without an architectural map, engineers must rediscover these relationships every time.

The Architecture Spine provides enough knowledge to answer:

- Which capability is changing?
- Who owns it?
- Which components participate?
- Which contracts connect them?
- Which platform invariants apply?
- Which specifications could be affected?

This makes Change Impact Analysis significantly more reliable.

---

# **9. Make Spec-Driven Development Safer**

SDD improves clarity about **what should be built**.

But specifications do not automatically guarantee that something is built in the correct architectural location.

A PRD might say:

Chat must determine whether the customer is eligible for Feature X.

An AI agent could correctly implement that requirement inside Chat.

The implementation could pass every acceptance test.

And the architecture could still be wrong.

The Architecture Spine adds another question before specifications become implementation:

**Who actually owns the eligibility decision?**

The development flow becomes:

**Product Requirement**

↓

**Architecture Spine**

↓

**Ownership & Impact Analysis**

↓

**Affected Component Specs**

↓

**Implementation**

This is a major reason the Architecture Spine should be a required input to SDD.

---

# **10. Provide Context to AI Coding Agents**

This becomes even more important with AI-assisted development.

Human engineers often carry undocumented architectural knowledge.

They may recognize:

“That logic doesn’t belong here.”

An AI coding agent may not.

The agent sees:

- A requirement.
- A repository.
- Existing code.
- A test suite.

It may implement the most locally reasonable solution.

Without shared architectural context, different agents can independently make different architectural assumptions.

The Architecture Spine provides AI agents with a common reference for:

- Domain ownership.
- Component responsibilities.
- Systems of Record.
- Platform boundaries.
- Capabilities.
- Contracts.
- Invariants.
- Architectural decisions.

The objective is not to tell the agent exactly how to code.

It is to establish the **decision boundaries within which it can operate autonomously**.

---

# **11. Preserve Component Autonomy**

Architecture governance can easily become too restrictive.

The Architecture Spine is specifically designed to avoid that.

It governs:

**WHAT must remain true**

**WHO owns what**

**WHERE responsibilities belong**

**WHAT components promise each other**

It deliberately avoids governing:

**HOW components implement those responsibilities**

For example:

### **Platform Governed**

Duplicate customer requests must not produce duplicate financial operations.

### **Component Autonomy**

The component may satisfy that requirement using:

- Idempotency.
- Transaction identifiers.
- Deduplication.
- Database constraints.
- Workflow state.
- Another valid mechanism.

The Architecture Spine protects the platform without unnecessarily constraining engineering teams.

---

# **12. Reduce Architecture Review Bottlenecks**

Without explicit architectural rules, many decisions eventually require an architect.

Developers ask:

Can we do this?

Where should this go?

Is this service allowed to own this?

Which system should we use?

Can this component store this information?

The architect becomes the architecture database.

That does not scale.

The Architecture Spine moves architectural knowledge from:

**People’s heads**

to:

**Shared platform knowledge**

The goal is not:

Every decision requires an architect.

The goal is:

Most decisions can be made independently because the architectural boundaries are already clear.

Architects become involved primarily when a proposal **changes the Spine**.

---

# **13. Preserve Architectural Intent Over Time**

Platforms often retain architecture diagrams but lose the reasoning behind them.

Eventually teams know:

Component A calls Component B.

But nobody knows:

Why?

The Architecture Spine combines current architectural facts with important decisions and rationale.

This allows future teams to distinguish:

**Intentional constraint**

from

**Historical accident**

That distinction is critical when modernizing the platform.

---

# **14. Detect Architectural Drift**

The Architecture Spine also establishes a baseline.

We can compare:

**Intended Architecture**

against

**Current Architecture**

For example:

Architecture Spine says:

Customer eligibility belongs to Customer Domain.

Discovery finds:

Chat also contains eligibility rules.

That becomes visible architectural drift.

The answer is not automatically to rewrite the system.

Instead, we can classify it:

**Expected**

**Legacy**

**Exception**

**Technical Debt**

**Architecture Violation**

**Candidate Architecture Change**

That makes architectural debt explicit instead of invisible.

---

# **15. Create a Common Language Across Teams**

Different teams often discuss architecture at different levels.

Product talks about capabilities.

Domain teams talk about business behavior.

Developers talk about services.

Operations talks about runtime systems.

Architects talk about boundaries.

The Architecture Spine connects these views:

**Business Need**

→ **Capability**

→ **Domain**

→ **Owner**

→ **Component**

→ **Contract**

→ **Specification**

→ **Implementation**

That creates traceability from business intent to running software without forcing every group to work at the same abstraction level.

---

# **16. Architecture Spine vs. Component Architecture**

This distinction must remain explicit.

|**Architecture Spine**|**Component Architecture**|
|---|---|
|Platform purpose|Internal structure|
|Domain boundaries|Internal modules|
|Capabilities|Classes/packages|
|Ownership|Internal responsibilities|
|Component boundaries|Internal layers|
|System of Record|Storage implementation|
|Cross-component contracts|Internal APIs|
|Platform invariants|Internal validation|
|Platform-level NFR outcomes|Implementation mechanisms|
|Security boundaries|Internal security implementation|
|Change impact|Refactoring strategy|
|Architectural decisions affecting the platform|Local technical decisions|

The Platform Architecture Contract governs the **left side**.

Component teams own the **right side**.

---

# **17. When Does a Change Affect the Architecture Spine?**

This gives teams a simple governance test.

Before making a change, ask:

### **Does this change…**

- Move responsibility between domains?
- Introduce a new platform capability?
- Change capability ownership?
- Change a component’s responsibility?
- Change a System of Record?
- Introduce another source of authority?
- Change a cross-component contract?
- Change externally observable platform behavior?
- Introduce a new dependency between major components?
- Violate or modify a platform invariant?
- Change a security/trust boundary?
- Change a platform-level NFR?
- Introduce a new bounded context?
- Merge existing domain boundaries?
- Require an exception to a platform principle?

### **If NO**

The change is probably within:

**🔧 Component Autonomy**

The team should proceed using its normal engineering practices.

### **If YES**

The change potentially affects:

**🏛️ Architecture Spine**

Perform Platform Architecture Impact Analysis before implementation.

This is the core governance mechanism.

---

# **18. Governance Should Be Triggered by Impact, Not Size**

A large code change may have no Architecture Spine impact.

Example:

Refactoring 20,000 lines inside a component while preserving its responsibilities and contracts.

That may require **no platform architecture review**.

A five-line change may have significant Architecture Spine impact.

Example:

A component begins treating cached account status as authoritative.

That may require architecture review.

Therefore:

**Architecture governance should be triggered by architectural impact, not implementation size.**

---

# **19. The Architecture Spine as a Decision Framework**

When evaluating a new Product requirement, we should be able to walk through the Spine:

### **1. What capability is being requested?**

↓

### **2. Which domain owns that capability?**

↓

### **3. Is the capability already available?**

↓

### **4. Which component owns or provides it?**

↓

### **5. What data authority is involved?**

↓

### **6. Which contracts are involved?**

↓

### **7. Which platform invariants apply?**

↓

### **8. Which components are affected?**

↓

### **9. Does the requirement change the Architecture Spine?**

↓

### **10. Which component specifications need to change?**

Only after these questions are understood should implementation decisions begin.

---

# **20. Architecture Spine and Team Autonomy**

The Architecture Spine should increase autonomy rather than reduce it.

Without clear architecture:

**Team encounters ambiguity**

↓

Ask architect

↓

Meeting

↓

Decision

↓

Implementation

With the Architecture Spine:

**Team encounters requirement**

↓

Consult Architecture Spine

↓

Determine ownership and boundaries

↓

Determine whether Spine changes

↓

If not:

**Team proceeds autonomously**

If yes:

**Focused architecture discussion**

This dramatically changes the role of governance.

Governance becomes an **exception mechanism**, not a mandatory approval mechanism.

---

# **21. What Success Looks Like**

The Architecture Spine is successful when a developer can receive a new requirement and independently answer:

What capability does this affect?

Which domain owns it?

Which component is responsible?

Which component should not own it?

What is the authoritative source of the data?

Which contracts are involved?

What platform rules must remain true?

What other components could be affected?

Does this require a platform architecture decision?

Which parts can my team decide independently?

An AI coding agent should be able to answer the same questions.

If those questions can be answered reliably, the Architecture Spine is working.

---

# **22. The Core Philosophy**

The Architecture Spine should be **small, stable, discoverable, and actionable**.

It should contain only information that teams need in order to make safe platform-level decisions.

It should not attempt to describe everything.

The governing philosophy is:

**Centralize architectural truth, not technical decision-making.**

**Govern ownership, not implementation.**

**Govern boundaries, not internal structures.**

**Govern contracts, not code patterns.**

**Govern expected outcomes, not implementation mechanisms.**

**Make architecture explicit enough that teams can operate independently.**

The Architecture Spine is therefore not an additional layer of bureaucracy around the platform.

It is the mechanism that allows a large platform to evolve through many teams and components **without requiring centralized control of every technical decision**.

