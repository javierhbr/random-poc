
# **A Simple Way to Think About the Platform Spec**

Imagine we have a PRD for a new feature.

The PRD explains **why we need the feature and what we want the product to do**.

For a simple feature handled by one team, that may be enough.

But many initiatives aren’t that simple.

A single feature might require changes from five different teams:

```text
                    PRD
                     │
                     ▼
             New customer feature
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
     Web            API         Payments
       │             │             │
       ▼             ▼             ▼
    Team A         Team B        Team C
```

Today, we give those teams the PRD and each team figures out what it needs to do.

That works, but it creates a problem.

Each team sees the initiative from the perspective of its own system.

Team A can finish its work.

Team B can finish its work.

Team C can finish its work.

And we can still discover at the end that the complete feature doesn’t work.

```text
Team A     DONE ✓
Team B     DONE ✓
Team C     DONE ✓

Feature    BROKEN ✗
```

The problem isn’t necessarily that someone made a mistake.

The problem is that nobody clearly defined **how the work of the three teams needs to fit together.**

That’s what we’re proposing to fix.

---

# **Step 1 — Start with the PRD**

We continue using PRDs.

We’re not replacing them.

Product still defines:

**WHY are we doing this?**

and

**WHAT should the customer or business be able to do?**

For example:

Customers should be able to close their bank account online without calling customer service.

That’s the product requirement.

Once Product approves a version of the PRD, we use that version as the starting point.

```text
PRD
 │
 ▼
Approved Version
```

This is important because later the PRD may change.

That’s perfectly normal.

But now we know:

“This is the version we used when we started the work.”

---

# **Step 2 — Look at the feature as a platform**

Before sending work to individual teams, we look at the complete feature.

We ask:

**What needs to happen across the platform for this customer experience to work?**

For example:

```text
Customer wants to close account
              │
              ▼
        Website asks
              │
              ▼
    Can this account close?
              │
              ▼
       Check account
              │
              ▼
     Move remaining money
              │
              ▼
        Close account
              │
              ▼
     Tell the customer
```

At this point, we’re not deciding how each team should build its part.

We’re simply agreeing on **how the pieces need to work together**.

This becomes the **Platform Spec**.

---

# **Step 3 — Identify who needs to do what**

Now we can look at that flow and identify the responsibilities.

For example:

```text
                    ACCOUNT CLOSURE
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
         Web            Ledger         Payments

      Show the          Decide if       Move the
      customer          account can     remaining
      the flow          be closed       money

      Show final        Close the       Confirm the
      result            account         transfer
```

Now every team knows what the overall initiative expects from its component.

This is different from simply giving everyone the PRD.

We’re saying:

“Here is the whole feature, here is how the pieces work together, and here is the part we need from you.”

---

# **Step 4 — The teams decide HOW to build their part**

This boundary is important.

The Platform Spec does **not** tell the Payments team how to write its code.

It doesn’t tell them which database to use.

It doesn’t tell them which classes to create.

It doesn’t tell them which framework to use.

It only says what the platform needs from Payments.

For example:

“Transfer the remaining balance and confirm when the transfer has been completed.”

Then Payments decides how to do that.

So we have two different levels of HOW:

```text
                    PLATFORM

             How do the pieces
                work together?
                      │
                      ▼
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
      Web           Ledger        Payments
       │              │              │
       ▼              ▼              ▼
    Team decides   Team decides   Team decides
    how to build   how to build   how to build
    its part       its part       its part
```

The platform owns the **connections**.

The teams own their **implementation**.

---

# **Step 5 — Teams can disagree**

This is also important.

The Platform Spec doesn’t simply assign work to teams.

It proposes responsibilities.

Imagine the Platform Spec says:

Payments will transfer the money immediately.

The Payments team reviews it and says:

“We can’t do that. Transfers currently happen overnight.”

That’s valuable information.

Instead of discovering it two months later, we discover it now.

```text
Platform proposes
       │
       ▼
Payments reviews
       │
       ├──── Accept ✓
       │
       └──── Object
                │
                ▼
         Explain the problem
                │
                ▼
         Adjust the solution
```

The Platform Spec gets corrected.

That’s part of the process.

---

# **Step 6 — Build small pieces that work end-to-end**

Instead of every team building everything separately and connecting it all at the end, we try to deliver small pieces that cross the different systems.

For example:

```text
Slice 1
Can we tell the customer
whether the account can be closed?

              ↓

Slice 2
Can we close an account
with no money in it?

              ↓

Slice 3
Can we close an account
that still has money?

              ↓

Slice 4
Can we handle failures
and unusual situations?
```

Each slice should actually work from beginning to end.

That gives us much earlier proof that the systems fit together.

---

# **Step 7 — If the PRD changes, follow the impact**

Now imagine we’re halfway through development and Product changes something.

That’s okay.

We don’t need to freeze Product forever.

Instead, we ask:

**What did this change affect?**

For example:

```text
              PRD CHANGE
                  │
                  ▼
         Requirement changed
                  │
                  ▼
         What does it affect?
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
       Web      Ledger    Payments
       NO        YES        YES
                  │         │
                  ▼         ▼
               Update     Update
```

Now we know exactly which teams need to review their work.

The Web team doesn’t need to do anything if the change doesn’t affect it.

The Ledger and Payments teams review their specifications and determine what needs to change.

---

# **So the complete process is simple**

```text
                       PRD
                        │
                        ▼
                Approved Version
                        │
                        ▼
                 PLATFORM SPEC
                        │
          How does the whole thing work?
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
         Team A       Team B      Team C
            │           │           │
       "Here is      "Here is    "Here is
       what we       what we     what we
       need from     need from   need from
       you."         you."       you."
            │           │           │
            ▼           ▼           ▼
       Team Spec     Team Spec    Team Spec
            │           │           │
       "Here's how   "Here's how  "Here's how
       we'll do it." we'll do it." we'll do it."
            │           │           │
            └───────────┼───────────┘
                        ▼
                  WORKING FEATURE
```

# **Why do this?**

We’re not trying to create more documentation.

We’re trying to solve a coordination problem.

The PRD answers:

**Why are we doing this and what do we want?**

The Platform Spec answers:

**How do all the pieces need to work together to make that happen?**

And each team answers:

**How am I going to build my piece?**

The Platform Spec sits in the middle.

```text
          PRODUCT
             │
             │  WHY + WHAT
             ▼
            PRD
             │
             ▼
       PLATFORM SPEC
             │
             │  HOW THE PIECES
             │  WORK TOGETHER
             ▼
      COMPONENT TEAMS
             │
             │  HOW EACH TEAM
             │  BUILDS ITS PART
             ▼
       IMPLEMENTATION
```

And when something changes, we can follow that same chain to understand who is affected.

That’s really the whole idea:

**The PRD defines the destination.**

**The Platform Spec makes sure everyone agrees on how their pieces fit together to reach it.**

**Each team decides how to build its own piece.**

The goal is that we never again reach the end of an initiative with every team saying **“my part is done”** while the overall feature still doesn’t work.