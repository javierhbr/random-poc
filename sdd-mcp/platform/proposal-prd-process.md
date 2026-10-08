
# **Implementing the Platform Spec Model**

## **1. What we are trying to fix**

The current failure mode is not that teams do bad work.

It is that we can reach this state:

```text
Product requirement approved
              │
              ▼
     Technical work starts
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
    Team A  Team B  Team C
      │       │       │
     Done    Done    Done
      │       │       │
      └───────┼───────┘
              ▼
        Integration
              │
              ▼
           BROKEN
```

Each team can satisfy its own requirements while the platform-level outcome still fails.

This happens because some decisions belong to **no individual component**:

- Which component owns a business decision?
- In what order must things happen?
- What does one component need from another?
- What happens when a dependency fails?
- Which assumptions are shared?
- What does “done” mean end-to-end?
- What changes when Product changes a requirement?

Those decisions need an explicit home.

That home is the **Platform Spec**.

---

# **2. The operating principle**

I would establish a simple ownership boundary:

```text
PRD
Product owns the intent
WHY + WHAT

             ↓

PLATFORM SPEC
Platform owns coordination
WHAT + cross-component HOW

             ↓

COMPONENT REQUIREMENTS
Platform tells each component
WHAT IT MUST CONTRIBUTE

             ↓

COMPONENT SPEC
Each team owns implementation
HOW

             ↓

CODE
```

Or even more simply:

**Product defines the outcome.****The Platform Spec defines how components must collaborate to achieve it.****Component teams decide how their own systems implement their responsibility.**

This boundary needs to be protected.

If the Platform Spec starts describing classes, frameworks, database schemas, internal architecture, etc., it has gone too far.

If Component Specs are independently redefining platform behavior, the Platform Spec hasn’t gone far enough.

---

# **3. Start with an approved PRD baseline**

This is the first operational change I would make.

Today, a PRD can effectively continue changing while technical work is underway.

Instead:

```text
PRD Draft
   │
   │ Product review
   ▼
PRD v1.0
APPROVED
   │
   └──────► Platform Spec starts
```

`PRD v1.0` does not mean the initiative can never change.

It means:

**This is the version of Product intent against which we started this implementation.**

The PRD can later become:

```text
v1.0  Approved
v1.1  Approved
v1.2  Draft
```

This gives everyone a stable reference.

---

# **4. Decide whether a Platform Spec is actually needed**

Do not make this mandatory for everything.

Use a simple trigger:

```text
Does the initiative require
multiple teams to change something?
             │
       ┌─────┴─────┐
       │           │
      NO          YES
       │           │
       ▼           ▼
 Component     Is there a shared
   Spec         outcome or behavior?
                   │
             ┌─────┴─────┐
             │           │
            NO          YES
             │           │
             ▼           ▼
       Coordinate     Platform
       directly        Spec
```

The important unit is **team ownership**, not repository count.

One team changing five repositories may not need a Platform Spec.

Three teams changing one monorepo might.

And a simple API contract between two teams shouldn’t automatically become a Platform Spec.

The mechanism should exist for initiatives where **coordination itself is part of the problem**.

---

# **5. Create the Platform Spec**

Once triggered, the Platform Spec starts from the approved PRD.

It should answer a small set of questions.

### **WHY**

Keep this directly connected to the PRD.

```text
Problem
Business/customer impact
Why now
```

Don’t rewrite the entire PRD.

Reference it.

---

### **WHAT**

Define one observable platform outcome.

For example:

A customer can close an eligible account online, receive confirmation, and have any remaining balance transferred within one business day.

Then define what must be true for that statement to be true.

This becomes the common finish line.

---

### **WHO**

Identify the affected components and owners.

```text
Account Closure
      │
      ├── Web
      │    Owner: Web Team
      │
      ├── Ledger
      │    Owner: Core Team
      │
      ├── Balance
      │    Owner: Payments Team
      │
      └── Compliance
           Owner: Compliance Team
```

This is the first impact map.

It should also immediately expose uncertainty:

```text
Web           confirmed
Ledger        confirmed
Balance       confirmed
Compliance    ?
Notifications ?
Analytics     ?
```

The `?` values are valuable. They represent things that need to be resolved before assumptions become implementation.

---

# **6. Describe the platform flow**

Now describe the **cross-component HOW**.

Not implementation.

Interaction.

```text
Customer
   │
   ▼
Account UI
   │
   │ closure request
   ▼
Ledger
   │
   ├────► Balance
   │       balance / pending transactions
   │
   └────► Compliance
           restrictions / disputes
   │
   ▼
Eligibility decision
   │
   ▼
Transfer remaining funds
   │
   ▼
Receipt
   │
   ▼
Close account
   │
   ▼
Confirmation
```

This diagram is probably more valuable than several pages of prose.

It exposes immediately:

- sequence;
- dependencies;
- ownership;
- shared decisions;
- missing interactions.

And most importantly:

```text
Receipt
   │
   ▼
Close account
```

becomes an explicit platform rule.

The Ledger team didn’t invent it.

The Payments team didn’t invent it.

The Web team didn’t invent it.

**The initiative requires it.**

---

# **7. Define the Agreements**

This should be the heart of the Platform Spec.

I’d explicitly call them **Platform Agreements**.

An Agreement exists when a decision cannot safely be made by one component alone.

For example:

```text
AGR-001 — Account closure order

An account cannot transition to CLOSED
until the balance transfer has produced
a successful receipt.

Affected:
Ledger
Balance

Source:
PRD-REQ-014
```

Another:

```text
AGR-002 — Eligibility ownership

Ledger owns the final eligibility decision.

Balance provides financial facts.
Compliance provides restriction facts.

Neither Balance nor Compliance independently
decides whether the account can close.
```

Another:

```text
AGR-003 — Compliance unavailable

If Compliance cannot provide the required
status, account closure is not allowed.

Customer sees:
"We can't process this online right now."
```

These are exactly the decisions that otherwise disappear between teams.

---

# **8. Explicitly record assumptions and open questions**

Do not allow ambiguity to silently become implementation.

The Platform Spec should be able to say:

```text
ASSUMPTION
Transfers normally complete within X.

OPEN QUESTION
What happens when a transfer remains
pending beyond one business day?

DECISION
Account remains open until receipt exists.

OUT OF SCOPE
Closing joint accounts.
```

Every meaningful uncertainty should eventually become one of:

```text
Question
   │
   ├──► Resolved
   ├──► Assumption
   ├──► Out of Scope
   └──► Accepted Risk
```

That gives agents and humans something much stronger than an ambiguous paragraph to interpret.

---

# **9. Generate the Component Requirement Packages**

This is where the Platform Spec becomes actionable.

The Platform Spec should produce a scoped package for every affected component.

```text
                   PLATFORM SPEC
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
   WEB PACKAGE     LEDGER PACKAGE   BALANCE PACKAGE
```

The Ledger package might contain:

```text
Component: Ledger
Initiative: Account Closure
PRD baseline: v1.0

RESPONSIBILITIES

- Determine closure eligibility.
- Coordinate required facts.
- Maintain closure state.
- Close only after successful transfer receipt.

DEPENDENCIES

Balance
Compliance

PLATFORM AGREEMENTS

AGR-001
AGR-002
AGR-003

INPUTS / OUTPUTS

Needs:
- balance state
- pending transaction state
- compliance restrictions
- transfer receipt

Provides:
- eligibility result
- closure status

ACCEPTANCE

Account cannot become CLOSED without
a valid transfer receipt.

OPEN QUESTIONS

None.
```

Notice what’s missing:

```text
Database
Framework
Classes
Tables
Libraries
Internal architecture
Implementation pattern
```

That’s intentional.

---

# **10. Teams accept or object**

This is essential.

Generating a component package does **not** mean the team has accepted it.

Use:

```text
PROPOSED
    │
    ├───────────────┐
    │               │
    ▼               ▼
ACCEPTED          OBJECTED
    │               │
    ▼               ▼
Component       Platform Spec
Spec starts      reviewed
                    │
                    ▼
                 Revised
                    │
                    ▼
                PROPOSED
```

For example:

**Balance Team objection:** We cannot guarantee a synchronous transfer. Our existing settlement mechanism is asynchronous and normally completes within four hours.

That’s not a project problem.

That’s the process working.

You have discovered an invalid platform assumption **before building around it**.

The Platform Spec might change from:

```text
Transfer → Close → Confirmation
```

to:

```text
Transfer initiated
       │
       ▼
Account = CLOSING
       │
       ▼
Transfer settled
       │
       ▼
Receipt
       │
       ▼
Account = CLOSED
       │
       ▼
Final confirmation
```

That’s exactly the kind of discovery the Platform Spec should cause.

---

# **11. Component teams create their own specs**

Once accepted:

```text
Component Requirement Package
              │
              ▼
        Component Spec
              │
              ▼
        Design / ADR
              │
              ▼
         Implementation
```

The team owns the HOW.

Their spec answers:

1. What does this responsibility mean in our system?
2. How are we going to implement it?
3. How will we test it?
4. How will we handle failures?
5. What dependencies do we have?
6. What is our estimate?
7. What could change that estimate?

But it references the Platform Spec instead of copying it.

For example:

```text
Implements:
PLATFORM-ACCOUNT-CLOSURE v1.0

Responsibilities:
RESP-LEDGER-01
RESP-LEDGER-02

Agreements:
AGR-001
AGR-002
AGR-003
```

That gives you traceability without duplication.

---

# **12. Build vertical slices**

The Platform Spec should also produce the initial delivery roadmap.

Not:

```text
Web phase
   ↓
API phase
   ↓
Backend phase
   ↓
Integration
```

Instead:

```text
Slice 1
Can customer see whether
the account is eligible?

        ↓

Slice 2
Can an empty eligible
account be closed?

        ↓

Slice 3
Can an account with money
be transferred and closed?

        ↓

Slice 4
Can failures and edge
cases be handled correctly?
```

Each slice crosses the components necessary to demonstrate a real behavior.

And each slice includes:

```text
Happy path
+
Failure path
+
End-to-end verification
```

Not:

```text
Happy paths now
Resilience later
```

because that simply recreates horizontal development.

---

# **13. Change the definition of Done**

This is another important process change.

Today, you can have:

```text
Web         ✓
Ledger      ✓
Payments    ✓
```

and everyone reports green.

Under this model:

```text
Component complete ≠ Initiative complete
```

Instead:

```text
        SLICE
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
   Web  Ledger Balance
    ✓     ✓     ✓
          │
          ▼
    E2E demonstration
          │
     ┌────┴────┐
     │         │
    FAIL      PASS
     │         │
 Not Done     DONE
```

Someone explicitly owns verification.

That person should not ask:

“Did every team finish?”

They ask:

**“Can we demonstrate the outcome described by this slice?”**

---

# **14. Then solve the hardest problem: change**

This is where I think your model becomes much stronger than a normal SDD process.

Assume:

```text
PRD v1.0
   ↓
Platform Spec v1.0
   ↓
Teams implementing
```

Then Product changes something.

Do **not** quietly edit everything.

Create a delta:

```text
PRD v1.0
   │
   │ CR-007
   ▼
PRD v1.1
```

The Platform Spec analyzes the difference.

```text
                PRD CHANGE
                    │
                    ▼
             Requirement Delta
                    │
                    ▼
               Impact Analysis
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
         Web      Ledger    Balance
      unaffected  affected  affected
                    │         │
                    ▼         ▼
                 package   package
                  update    update
```

The change should explicitly answer:

```text
What changed?

Why?

Which requirement changed?

Which platform agreement changed?

Which components are affected?

Which components are NOT affected?

Which active slices are affected?

Which Component Specs need review?

Is existing implementation now invalid?
```

This gives you the missing **change propagation mechanism**.

---

# **15. Don’t silently overwrite history**

You want both:

### **Current truth**

```text
Platform Spec v1.3
```

and:

### **Why it became true**

```text
v1.0 initial approval

v1.1
Balance transfer changed to asynchronous.

v1.2
Added Compliance dependency.

v1.3
Closure confirmation wording changed.
```

But teams should normally consume:

```text
CURRENT
```

not reconstruct the initiative by reading six months of history.

History explains.

The current Platform Spec directs.

---

# **16. Establish three explicit roles**

Keep this very small.

### **Spec Owner**

Owns the truth of the Platform Spec.

Not necessarily the architect.

Their responsibility is:

```text
Keep the cross-team agreement true.
```

### **Component Owner**

One per affected team.

They:

```text
Accept / object
Create Component Spec
Estimate
Implement
Report discoveries
```

### **Slice Verifier**

Owns:

```text
"Does this actually work end to end?"
```

This can rotate by slice.

No additional committee is necessary.

---

# **17. Standardize the artifact, not the AI**

This is especially important in your environment.

You don’t need:

```text
Everyone → same model
Everyone → same prompt
Everyone → same agent
```

You need:

```text
Claude ─────┐
Codex ──────┤
GPT ────────┤
Human ──────┼──► SAME SPEC CONTRACT
Other Agent ┘
```

The standard defines required concepts:

```text
Initiative
PRD baseline

WHY
WHAT

Components
Responsibilities
Interactions
Agreements

Dependencies
Failure behavior

Assumptions
Open questions
Out of scope
Accepted risks

Vertical slices
Acceptance criteria

Ownership
Status

Change history
Traceability
```

How an agent helps produce it is secondary.

---

# **18. Add validation before accepting a Platform Spec**

I would avoid a 50-item governance checklist.

Instead ask a few adversarial questions.

### **Outcome**

Could all component teams complete their assigned work and the outcome still fail?

If **yes**, something is missing.

### **Ownership**

Is there an important decision that no component owns?

If **yes**, it probably belongs in Platform Agreements.

### **Ambiguity**

Could two competent teams read this and make incompatible assumptions?

If **yes**, clarify the interaction.

### **Failure**

Do we know what the customer experiences when each important dependency fails?

If **no**, the flow isn’t complete.

### **Scope**

Does the Platform Spec tell a component how to implement internally?

If **yes**, remove it.

### **Verification**

Can someone demonstrate every slice end to end?

If **no**, the slice isn’t well defined.

That is enough to catch most serious problems without creating process theater.

---

# **19. The lifecycle becomes simple**

The complete process is:

```text
┌───────────────────┐
│      PRD DRAFT    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ APPROVED BASELINE │
│     PRD v1.0      │
└─────────┬─────────┘
          │
          ▼
      Trigger test
          │
          ▼
┌───────────────────┐
│   PLATFORM SPEC   │
│                   │
│ Why               │
│ Outcome           │
│ Flow              │
│ Components        │
│ Agreements        │
│ Failure behavior  │
│ Slices            │
└─────────┬─────────┘
          │
          ▼
   Component Impact
          │
   ┌──────┼──────┐
   ▼      ▼      ▼
 Package Package Package
    A       B       C
   │       │       │
   ▼       ▼       ▼
Accept  Accept  Object
                  │
                  └────► amend Platform Spec
                            │
                            ▼
                         accept
   │       │              │
   └───────┼──────────────┘
           ▼
    Component Specs
           │
           ▼
      Vertical Slices
           │
           ▼
      Implementation
           │
           ▼
      E2E Verification
           │
           ▼
          DONE
```

And at **any point**:

```text
PRD Change
    │
    ▼
Delta
    │
    ▼
Impact Analysis
    │
    ▼
Platform Spec Update
    │
    ▼
Affected Packages
    │
    ▼
Affected Component Specs
    │
    ▼
Affected Slices / Implementation
```

---

# **20. I would roll this out progressively**

I would **not** attempt to build tooling, automation, graph databases, mandatory agents, and enforcement first.