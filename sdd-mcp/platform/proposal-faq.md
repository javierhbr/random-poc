
## **Product Owner FAQ**

### **1. “Does this mean Product has to write technical specifications?”**

**WHY:** No. Product should remain focused on the customer/business problem and expected outcome.

**WHAT:** Product owns the PRD and makes sure the desired outcome, requirements, constraints, and acceptance criteria are clear.

**HOW:** Engineering uses that approved PRD to create the Platform Spec and identify the components and interactions required to deliver the outcome.

Product does **not** need to define frameworks, APIs, databases, services, or implementation details.

---

### **2. “Does the PRD have to be perfect before Engineering starts?”**

**WHY:** Waiting for a perfect PRD would slow everything down, and requirements will change anyway.

**WHAT:** The PRD needs to be clear enough to establish an approved baseline for a specific scope, such as MVP or V1.

**HOW:** Known ambiguities and assumptions are recorded. Engineering can start from that baseline while unresolved questions remain visible instead of being silently assumed.

---

### **3. “What if I need to change a requirement after the PRD was approved?”**

**WHY:** Changes are expected. The goal isn’t to prevent them.

**WHAT:** The change must be visible and traceable.

**HOW:**

```text
PRD change
    ↓
Requirement changed
    ↓
Platform Spec impact
    ↓
Affected components
    ↓
Affected teams review
    ↓
Component Specs / implementation updated
```

You don’t need to create a new initiative just because something changed.

---

### **4. “Can I still edit the PRD?”**

**WHY:** Yes. Product requirements continue to evolve.

**WHAT:** What matters is knowing what changed relative to the approved baseline.

**HOW:** Changes after approval are recorded as revisions rather than silently replacing the context teams started with.

For example:

```text
PRD v1.0 — Approved
       ↓
Teams start work

PRD v1.1 — Requirement 17 changed
       ↓
Impact analysis
```

---

### **5. “What if the change affects only one component?”**

**WHY:** We shouldn’t create unnecessary work for teams that aren’t affected.

**WHAT:** Only affected responsibilities and specifications need review.

**HOW:** Traceability tells us which components depend on the changed requirement.

```text
REQ-17 changed

Mobile        → No impact
API           → Impacted
Ledger        → Impacted
Analytics     → No impact
```

---

### **6. “What if I don’t know which components are involved?”**

**WHY:** Product shouldn’t need detailed knowledge of platform architecture.

**WHAT:** Product defines the desired behavior, not the component decomposition.

**HOW:** The Platform Spec process identifies which components and teams need to participate.

That’s part of the value of the Platform Spec.

---

### **7. “What if Product and Engineering disagree about a requirement?”**

**WHY:** Sometimes a business requirement conflicts with cost, architecture, security, reliability, or technical reality.

**WHAT:** The disagreement should become explicit rather than turning into an undocumented implementation compromise.

**HOW:** Engineering raises an objection with the reason and alternatives. Product and Engineering then resolve the outcome or constraint together.

```text
Requirement
    ↓
Technical objection
    ↓
Trade-off discussion
    ↓
Decision
    ↓
Platform Spec updated
```

---

### **8. “Does every PRD require a Platform Spec?”**

**WHY:** No. That would turn the process into paperwork.

**WHAT:** Platform Specs are primarily for changes where multiple teams must coordinate to deliver one shared outcome.

**HOW:**

```text
More than one team?
       │
      No ─────→ Normal team process
       │
      Yes
       ↓
Shared outcome / cross-team decisions?
       │
      No ─────→ Tickets / simple contract
       │
      Yes
       ↓
 PLATFORM SPEC
```

---

### **9. “How do I know when the feature is actually done?”**

**WHY:** “Every team finished its tickets” does not prove the product outcome works.

**WHAT:** Done means the agreed outcome works end-to-end.

**HOW:** Delivery happens through verifiable slices, with a named Slice Verifier responsible for demonstrating the behavior.

```text
Team A done ✓
Team B done ✓
Team C done ✓

        ≠

Feature done


End-to-end slice demonstrated ✓

        =

Feature capability done
```

---

# **Technical Team FAQ**

### **10. “Is the Platform Spec telling me how to implement my component?”**

**WHY:** No. The team that owns the component knows its internals best.

**WHAT:** The Platform Spec tells you what your component must contribute to the shared outcome.

**HOW:** Your team decides architecture, frameworks, libraries, database changes, classes, internal APIs, deployment strategy, etc.

```text
PLATFORM SPEC

WHAT your component must provide
HOW components interact

              ↓

COMPONENT SPEC

HOW your team implements it
```

---

### **11. “What if I disagree with the responsibility assigned to my component?”**

**WHY:** The Platform Spec may have been written without information your team has.

**WHAT:** A responsibility is **proposed**, not automatically assigned.

**HOW:**

```text
Proposed
   │
   ├──── Accept ───→ Accepted
   │
   └──── Object
             ↓
        Explain why
             ↓
       Spec reviewed
             ↓
        New proposal
```

An objection is useful information, not process failure.

---

### **12. “What if the Platform Spec is technically impossible?”**

**WHY:** That’s exactly the kind of problem we want to discover before implementation.

**WHAT:** The affected team should object and explain the technical constraint.

**HOW:** The team provides the constraint and, ideally, alternatives.

For example:

The Platform Spec assumes this operation can complete synchronously within two seconds. Our current system processes it asynchronously and normally takes 30–90 seconds.

Now the platform can reconsider the customer experience rather than discovering this during integration.

---

### **13. “What if two teams disagree about an API?”**

**WHY:** An interface between teams belongs to the collaboration, not exclusively to either team.

**WHAT:** The Platform Spec defines the intent and behavioral contract.

**HOW:** The teams jointly agree on what information must move, expected behavior, failure semantics, timing expectations, and ownership.

Detailed endpoint names and payload schemas can still live in component/API specifications.

---

### **14. “What if I discover an assumption is wrong while implementing?”**

**WHY:** Implementation teaches us things that planning cannot.

**WHAT:** Don’t silently work around the incorrect assumption.

**HOW:**

```text
Discovery
   ↓
Raise objection / question
   ↓
Check platform impact
   ↓
Update Platform Spec
   ↓
Affected teams notified
   ↓
Continue
```

The Platform Spec should reflect reality.

---

### **15. “What if I need to change my internal design?”**

**WHY:** Internal design belongs to your component.

**WHAT:** If the change doesn’t alter a platform agreement, you don’t need to change the Platform Spec.

**HOW:** Update your Component Spec/ADR/design as appropriate.

```text
Change internal implementation only?
              │
             YES
              ↓
       Component Spec only


Change contract / behavior / shared rule?
              │
             YES
              ↓
        Platform Spec
```

---

### **16. “What if my component needs another component that wasn’t identified?”**

**WHY:** That’s new information about how the platform must collaborate.

**WHAT:** The dependency should become visible.

**HOW:** Add the dependency to the Platform Spec, identify the new team responsibility, and get that team to accept or object.

Don’t just create an informal dependency between teams.

---

### **17. “What if another team’s component is unavailable?”**

**WHY:** Happy-path behavior isn’t enough for an end-to-end capability.

**WHAT:** The Platform Spec should define the expected customer/platform behavior when important dependencies fail.

**HOW:** Teams implement their part of the agreed degraded behavior.

For example:

```text
Eligibility unavailable

WHY
We cannot make a safe eligibility decision.

WHAT
The operation must not proceed.

HOW
API blocks the operation.
UI explains that it cannot be completed right now.
No partial state change is committed.
```

---

### **18. “What if another team is late?”**

**WHY:** Cross-team dependencies can block an entire initiative even when individual teams are progressing.

**WHAT:** The impact should be visible at the slice/outcome level, not hidden inside team status.

**HOW:** Track whether the end-to-end slice can be demonstrated.

Instead of:

```text
UI       100%
API      100%
Ledger    70%
Payments  40%
```

the useful question becomes:

**Can Slice 1 work end-to-end?**

---

### **19. “What if my team finishes before another team?”**

**WHY:** Your component work can be complete without the capability being complete.

**WHAT:** Mark your responsibility complete, but don’t mark the end-to-end slice complete.

**HOW:** The Slice Verifier declares the slice done only after the complete flow works.

---

### **20. “Do I need to copy the Platform Spec into my Component Spec?”**

**WHY:** No. Duplication creates drift.

**WHAT:** Component Specs should inherit shared context by reference.

**HOW:**

```text
Platform Spec
├── WHY
├── Outcome
├── Agreements
├── Contracts
└── Component responsibilities
           │
           │ reference
           ▼
     Component Spec
     ├── Internal design
     ├── Implementation
     ├── Tests
     ├── Estimate
     └── Component risks
```

---

# **“What If?” — Questions That Stress-Test the Model**

These are the questions I’d actually use in a workshop with Product Owners and technical teams.

### **What if the PRD changes halfway through development?**

**WHY:** Business reality changed.

**WHAT:** Determine whether the approved outcome or requirements changed.

**HOW:** Generate the delta → identify affected Platform Spec sections → identify affected components → teams review their specs and estimates.

---

### **What if a Product Owner changes something in a Google Docs comment?**

**WHY:** Discussion is useful, but comments aren’t a reliable source of truth.

**WHAT:** A decision that changes expected behavior must become part of the approved requirement/specification.

**HOW:**

```text
Comment
  ↓
Discussion
  ↓
Decision
  ↓
PRD / Platform Spec update
  ↓
Impact analysis
  ↓
Resolve comment
```

**A comment can start a decision. It cannot be the final home of the decision.**

---

### **What if a change seems tiny?**

Ask:

```text
Does it change the WHY?
        ↓
Does it change the WHAT?
        ↓
Does it change how teams interact?
        ↓
Does it change a shared contract?
```

If all are **No**, it probably stays inside the component.

If one is **Yes**, review the Platform Spec.

---

### **What if nobody knows the answer yet?**

**WHY:** Unknowns are normal.

**WHAT:** Don’t hide them behind assumptions.

**HOW:** Record them explicitly:

```text
OPEN QUESTION
ASSUMPTION
DECISION NEEDED
OWNER
TARGET DATE / GATE
```

The spec doesn’t need to pretend everything is known.

---

### **What if teams interpret the same requirement differently?**

**WHY:** That’s evidence that the shared requirement isn’t specific enough.

**WHAT:** Resolve the expected platform behavior.

**HOW:** Move the decision upward into the Platform Spec instead of letting each team solve it independently.

---

### **What if the Platform Spec and implementation disagree?**

**WHY:** Either implementation changed or the spec became stale.

**WHAT:** Determine which represents the correct current behavior.

**HOW:** Fix one immediately.

Never knowingly leave:

```text
Spec says A

Code does B

Team knows about it

"But we'll update it later"
```

That’s how the Platform Spec loses trust.

---

### **What if the Platform Spec gets huge?**

Apply one test to every section:

**Is this a decision that must be shared between teams?**

If **yes**, keep it.

If **no**, move it to the Component Spec, ADR, LLD, API definition, or code.

---

### **What if teams start adding endpoint names and JSON payloads?**

**WHY:** They’re trying to remove ambiguity, which is good.

**WHAT:** Preserve the agreement without turning the Platform Spec into implementation documentation.

**HOW:** The Platform Spec says:

Ledger provides an eligibility decision including whether closure is allowed and, when rejected, a reason that can be presented to the customer.

The API/component documentation defines:

```text
POST /v2/accounts/{id}/eligibility

{
   "eligible": false,
   "reasonCode": "PENDING_TRANSACTION"
}
```

Different abstraction levels.

---

### **What if Product wants to dictate a technical solution?**

Start with the three questions:

**WHY:** What business/customer constraint requires that solution?

**WHAT:** What observable behavior or constraint must be guaranteed?

**HOW:** Does that require a particular cross-component interaction?

If the actual requirement is:

“The customer must receive the result in under two seconds.”

write that.

Don’t automatically translate it into:

“Use Kafka.”

unless Kafka itself is genuinely a platform constraint.

---

### **What if Engineering wants to change the customer behavior because implementation is difficult?**

Same process in reverse.

**WHY:** What technical constraint was discovered?

**WHAT:** Does that constraint require changing the promised product outcome?

**HOW:** What alternative collaboration or behavior could satisfy both?

Engineering shouldn’t silently change the product behavior any more than Product should silently dictate internal implementation.

---

### **What if an initiative starts with one team but later needs three?**

That’s an important trigger.

```text
Initially

Team A
  ↓
Component change


Discovery

Team A ─── Team B ─── Team C
             │
       shared outcome
```

At that point, create the Platform Spec.

The decision to use one shouldn’t only happen at project kickoff.

---

### **What if the teams agree verbally?**

Great—but record the agreement.

Not every conversation needs documentation.

But if the decision changes:

- ownership,
- contracts,
- sequencing,
- customer behavior,
- failure behavior,
- shared rules,
- or the definition of done,

it belongs in the Platform Spec.

---

### **What if the Platform Spec changes every week?**

That isn’t automatically bad.

Ask why.

If it changes because teams are learning and resolving real unknowns, the process is working.

If it changes because nobody established a clear **WHY** and **WHAT**, then the initiative may not have been ready.

The important distinction is:

```text
Learning → Spec evolves             ✓

Random decisions → Spec churns      ✗

Reality changes → Spec evolves      ✓

Nobody knows the outcome → churn    ✗
```

---

# **The question everyone should be able to answer**

At any point during the initiative, Product, Platform, and every participating technical team should be able to answer:

```text
                         WHY
                          │
                 Why are we doing this?
                          │
                          ▼
                         WHAT
                          │
              What must be true when done?
                          │
                          ▼
                         HOW
                          │
             How do the components work
                  together to achieve it?
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Team A        Team B       Team C
             │            │            │
             ▼            ▼            ▼
          HOW I         HOW I        HOW I
         build it      build it     build it
```

If Product can explain the **WHY and WHAT**, the Platform Spec can explain the shared **HOW**, and every component team can explain **how it will deliver its responsibility**, the boundaries are working.

The most important rule underneath the entire FAQ is:

**When a question affects one component, the component team decides. When the answer changes the relationship between teams or the shared outcome, it belongs at the Platform level.**