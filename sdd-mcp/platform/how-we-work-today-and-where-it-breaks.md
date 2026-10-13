# How We Work Today --- And Where It Breaks

The process starts well. The problem begins when the approved PRD
continues changing while different teams are already designing and
implementing their parts.

## Current Process

``` text
Platform PRD
Why + What · Business requirements
        │
        │ Product approval
        ▼
MVP / V1 Approved
Agreed scope and requirements
        │
        ▼
Technical Design
Architecture · LLD · ADR · Specifications

✓ Up to this point, the process works well
```

------------------------------------------------------------------------

## Where Problems Begin

### The PRD Keeps Changing

Even after teams have started working, the PRD continues to evolve
through:

-   New requirements
-   Product changes
-   Google Docs comments

The problem is not that requirements change. Changes are expected.

The problem is that **changes do not always reach the technical
specifications immediately**.

``` text
                PRD keeps changing
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
 New requirements  Product changes  Google Docs comments
        │              │              │
        └──────────────┼──────────────┘
                       ▼
          Changes don't always reach
          technical specifications
```

### Same Platform-Level PRD

The same platform-level PRD is shared across the teams involved in the
initiative.

Each team must determine which requirements apply to its component and
interpret what it needs to implement.

``` text
                 Same Platform-Level PRD
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Team A        Team B       Team C
            UI            API        Service
             │            │            │
             ▼            ▼            ▼
       Model A +      Model B +     Agent C +
        Skill A        Prompt B       Skill C
             │            │            │
             ▼            ▼            ▼
       Detailed Spec   Partial Spec  Different Format
             │            │            │
             └────────────┼────────────┘
                          ▼
                    Implementation
```

Teams can therefore build against potentially different interpretations
of the same PRD.

### Potential Consequences

-   Different context
-   Inconsistent detail
-   Hidden assumptions
-   Outdated specs
-   Missed dependencies
-   Rework

------------------------------------------------------------------------

# The Missing Link: Change Impact

When a PRD changes, we don't always have a reliable way to determine
which teams, specifications, and implementations are affected.

``` text
                    PRD Change
       New requirement · Changed behavior
              · Decision in comments
                         │
                         ▼
                 Who is affected?
                         │
                 Impact isn't clearly
                      tracked
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
            UI          API        Service
             ?           ?           ?
          Unknown     Unknown      Unknown
```

------------------------------------------------------------------------

# What We Need to Be Able to Trace

This is the missing chain the proposed Platform Spec process is meant to
establish.

1.  **What was approved?**\
    Approved PRD baseline.

2.  **What changed?**\
    Recorded decisions and revisions.

3.  **Which requirement changed?**\
    Requirement-level traceability.

4.  **Which components are affected?**\
    Cross-team impact analysis.

5.  **Which specifications must change?**\
    Affected component requirements.

6.  **What implementation must change?**\
    Team-owned implementation review.

``` text
WHAT WAS APPROVED
        │
        ▼
WHAT CHANGED
        │
        ▼
WHICH REQUIREMENT CHANGED
        │
        ▼
WHICH COMPONENTS ARE AFFECTED
        │
        ▼
WHICH SPECIFICATIONS MUST CHANGE
        │
        ▼
WHAT IMPLEMENTATION MUST CHANGE
```

------------------------------------------------------------------------

# The Takeaway

**We don't have a documentation shortage. We have a coordination and
traceability gap.**

The PRD describes what the platform needs, but teams independently
translate that into component work. When requirements change, there's no
consistently maintained path connecting the decision to every affected
specification and implementation.

The proposed **Platform Spec** fills that gap without taking technical
ownership away from component teams.
