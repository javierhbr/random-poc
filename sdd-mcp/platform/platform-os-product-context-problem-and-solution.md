# The Problem: Every AI Session Starts From Zero

I think this is an important addition to the Platform Spec proposal
because it exposes another problem: **Product Owners don't have a
reliable, reusable source of context for their work.**

The Platform Spec addresses how requirements move from Product to
Engineering. A central knowledge base addresses what happens **before
the PRD is even written**.

------------------------------------------------------------------------

## 1. Current Situation

Product Owners work with a lot of information spread across different
places:

-   Existing PRDs and requirements
-   Google Docs and comments
-   Business rules and domain knowledge
-   Previous decisions and discussions
-   Technical documentation and platform capabilities
-   Existing features, limitations, and dependencies

The information exists, but it isn't organized in a way that makes it
easy to reuse.

Every time a Product Owner starts a new Claude session, they have to
find the relevant information, copy and paste it into the conversation,
explain the business domain, describe how the platform works, and
provide the background needed to start working.

Only after that can they begin the actual task.

------------------------------------------------------------------------

## 2. Why This Is a Problem

### Current Workflow

``` text
Google Docs      Existing PRDs
      \             /
       \           /
Business Rules   Past Decisions
        \         /
         \       /
          ▼     ▼
       Product Owner
 Searches, gathers, copies,
 pastes, and explains context
              │
              ▼
      New Claude Session
 Rebuilds domain and platform
        understanding
              │
              ▼
 Finally, the actual work begins
              │
              ▼
   Repeat for every new session
```

This creates several problems.

### Repeated Work

Product Owners spend time preparing context instead of working on
requirements, analysis, or product decisions.

### Inconsistent Context

Different sessions may receive different information depending on what
the Product Owner remembers or manages to find.

### Outdated Information

An old PRD or decision may be reused without realizing that something
changed.

### Lost Knowledge

Important business rules and decisions remain in documents, comments, or
individual conversations rather than being accessible to everyone.

### Dependence on Individuals

The quality of the context depends on how much each Product Owner knows
about the domain.

And perhaps the biggest issue:

> **The AI assistant spends time reconstructing what the organization
> already knows instead of using that knowledge to help solve the
> problem.**

------------------------------------------------------------------------

## 3. Proposed Solution: A Central Platform Knowledge Base

The proposal is to establish a central, maintained knowledge base that
represents the **current agreed understanding of the platform and its
business domains**.

This could become part of the broader **Platform OS** concept.

It would not simply be a folder containing all existing documents.

It would organize information so that Product Owners, Engineering teams,
and AI agents can find and reuse the right context without manually
reconstructing it.

### Platform Knowledge Base / Platform OS

**Shared, maintained, versioned knowledge**

  Knowledge Area          What It Contains
  ----------------------- -------------------------------------------
  Business Domains        Terminology, rules, workflows
  Platform Capabilities   Existing features and constraints
  Decisions               Approved decisions and rationale
  Specifications          PRDs, platform specs, and component specs
  Dependencies            Systems, owners, interactions
  Historical Context      Changes and previous versions

``` text
          Platform Knowledge Base / Platform OS
      Shared · Maintained · Versioned Knowledge
                         │
                         ▼
                AI Context Retrieval
     Find relevant, current, authorized information
                  for the current task
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
       Product Owner  Engineering  AI Agents
```

Instead of copying information into every session, the Product Owner
could simply ask:

> "I'm working on a new account closure initiative. Review the existing
> business rules, platform capabilities, and previous decisions before
> helping me define the PRD."

The assistant would retrieve the relevant information from the shared
knowledge base.

It should also identify when information is missing, outdated,
contradictory, or not yet approved.

That last part is important:

> **A central knowledge base should not make incorrect information
> easier to reuse.**

------------------------------------------------------------------------

## 4. How This Connects to the Platform Spec Process

The knowledge base should be the **foundation of the workflow**, not
another documentation step.

``` text
              Platform OS / Shared Knowledge
 Business domains · Current capabilities · Rules
          Decisions · Existing specifications
                         │
                         ▼
              Product Owner + AI Assistant
        Uses existing context to define initiative
                         │
                         ▼
                 PRD — Approved Baseline
                       Why + What
                         │
                         ▼
                    Platform Spec
       Shared behavior · Responsibilities
             Cross-team agreements
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         Component A Component B Component C
              │          │          │
              ▼          ▼          ▼
        Requirements Requirements Requirements
              │          │          │
              ▼          ▼          ▼
        Detailed Spec Detailed Spec Detailed Spec
              │          │          │
              ▼          ▼          ▼
             Build      Build      Build

              ↖ Approved decisions and changes
                feed back into shared knowledge
```

### Complementary Responsibilities

  -----------------------------------------------------------------------
  Platform OS / Knowledge Base        Platform Spec
  ----------------------------------- -----------------------------------
  What do we already know?            What are we changing?

  How does the platform work today?   How should the platform behave
                                      after this initiative?

  What decisions and rules already    What new agreements are required?
  exist?                              

  What is the current approved        What responsibilities must teams
  reality?                            deliver?
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. What the Product Owner Experience Could Look Like

The ideal experience is simple.

### Today

A Product Owner opens Claude, spends time finding and pasting documents,
explains the domain, corrects misunderstandings, and finally starts
writing the PRD.

``` text
Open AI Session
      │
      ▼
Find documents
      │
      ▼
Copy / paste context
      │
      ▼
Explain the domain
      │
      ▼
Correct misunderstandings
      │
      ▼
Finally start the actual work
```

### Proposed

A Product Owner opens Claude and asks it to work on an initiative.

The assistant retrieves relevant:

-   Domain context
-   Existing capabilities
-   Business rules
-   Approved decisions
-   Existing specifications
-   Dependencies

It identifies missing information and helps the Product Owner begin.

``` text
Open AI Session
      │
      ▼
Ask about the initiative
      │
      ▼
Retrieve relevant trusted context
      │
      ▼
Identify gaps / assumptions / conflicts
      │
      ▼
Start the actual work
```

The Product Owner still reviews and validates the information. The AI
does not independently decide which business rules are correct.

After the PRD is approved, its approved requirements and decisions can
become part of the shared knowledge available to future work.

------------------------------------------------------------------------

## 6. What We Need to Get Right

The biggest challenge is not collecting documents. It's maintaining
**reliable knowledge**.

A few simple rules:

1.  **One authoritative source per fact or decision.**\
    Other documents can reference it instead of creating competing
    versions.

2.  **Separate approved information from drafts and assumptions.**\
    The assistant must know the difference.

3.  **Keep history.**\
    A new decision should not erase the context of the previous one.

4.  **Assign ownership.**\
    Someone must be responsible for validating domain rules and updating
    decisions.

5.  **Retrieve only relevant context.**\
    Don't load the entire knowledge base into every AI session.

6.  **Preserve source references.**\
    Users should be able to see where an answer came from.

7.  **Respect access permissions.**\
    Centralized knowledge doesn't mean everyone can access everything.

------------------------------------------------------------------------

# The Central Idea

This is really **two related problems with one connected solution**.

### Problem 1 --- Before Development

Product Owners repeatedly rebuild context because organizational
knowledge is scattered.

### Problem 2 --- During Development

Teams interpret the same PRD differently, and changes are not
consistently reflected across component specifications.

### Connected Solution

> **Platform OS provides the shared understanding of what exists and
> what we know. Platform Spec defines what needs to change and how teams
> must work together to deliver it.**

``` text
               BEFORE DEVELOPMENT
                       │
                       ▼
                  PLATFORM OS
       Current reality and shared knowledge
                       │
                       ▼
                      PRD
                  Why + What
                       │
                       ▼
                 PLATFORM SPEC
      What changes + how teams collaborate
                       │
                       ▼
                COMPONENT SPECS
          How each team delivers its part
                       │
                       ▼
                IMPLEMENTATION
```

The result should be:

-   Less time spent searching and explaining
-   Fewer assumptions
-   More consistent context
-   Better traceability
-   Clearer component responsibilities
-   A clearer path from product decisions to working software

## Recommended Starting Point

Start with **one business domain and one real initiative** rather than
trying to centralize every document immediately.

That allows us to test two things:

1.  Can Product Owners start a new AI session with significantly less
    manual context?
2.  Can Engineering receive clearer, more consistent requirements from
    the same trusted knowledge foundation?

If those two things improve, the model can be expanded to additional
domains and initiatives.
