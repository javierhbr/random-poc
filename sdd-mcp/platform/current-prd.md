# 1. How We Work Today

Today, we use PRDs to define requirements and then move into Spec-Driven Development (SDD).

The process works reasonably well, but I see a few problems with how we manage requirements and specifications, especially when changes happen.

### The PRD never really stops changing

We usually work on a PRD for a project or initiative, define the MVP or a specific version, and get approval from Product.

Once approved, the technical teams start working on the architecture, technical specifications, LLDs, ADRs, and implementation plans.

So far, everything works fine.

The problem starts when requirements change after the technical work has already begun.

Changes are normal. We should expect them. The issue is that those changes are not always reflected in the specifications immediately.

Sometimes decisions are made through comments in Google Docs, but those decisions never make it into the actual PRD or technical specifications.

As a result, teams may continue working with outdated information without realizing it.

### One PRD, multiple components and teams

Another challenge is that PRDs are written at the platform level, but implementation happens across multiple components.

Some teams own several components, while others are responsible for just one.

We use the same PRD across all these teams, and each team has to figure out which requirements apply to its components.

This creates extra work and leaves room for different interpretations.

For example, a single requirement might involve the UI, an API, and two backend services. Each team needs to understand not only its own responsibility but also how its work connects with the other components.

If those responsibilities are not clearly defined, details can be missed.

### Inconsistent specifications

We also have different approaches to creating specifications.

Each team, and sometimes each developer, uses different models, agents, prompts, or skills.

That means specifications can vary significantly in structure, detail, and quality.

Some are very detailed, while others leave important information open to interpretation.

When agents use those specifications to implement changes, the results can also vary.

### What concerns me

We already have plenty of documentation. The problem isn't that we need more documents.

The problem is keeping requirements, decisions, specifications, and implementations aligned as things change.

We need a better way to know:

- What was approved?
- What has changed since then?
- Which components are affected?
- Which specifications need to be updated?
- Are teams working with the correct requirements?

# 2. What I'm Proposing

I don't think we need to completely change how we write PRDs.

I think we need to improve what happens **after a PRD is approved**.

### Keep the PRD at the platform level

We should continue defining requirements at the platform level, as we do today.

A PRD should describe the initiative as a whole, regardless of how many components are involved.

It should focus on:

- **Why:** Why are we doing this? What problem are we solving?
- **What:** What should the platform do?
- **How (high level):** How should the different parts of the platform work together?

The HOW is important, but only to a certain level.

For example, we can define that an API needs to call another service, that an integration is required, or that certain information needs to be exchanged between components.

But we shouldn't define which framework, libraries, design patterns, or internal implementation a component must use.

Those decisions should stay with the teams that own the components.

### Close a PRD version before moving into specifications

Once a PRD version is reviewed and approved, we should close that version and use it as the starting point for specifications.

This doesn't mean the PRD can never change again.

It means we have a clear reference for what was approved at that point.

If requirements change later, we create a new revision and identify what changed.

That way, we always know which version was used to start the work.

### Generate a specification package for the initiative

This is the main change I'm proposing.

Instead of having every team read the same PRD and independently figure out what to implement, we should generate a **platform-level specification package** from the approved PRD.

This package would identify all the components involved in the initiative and describe what each component needs to provide.

For example, an initiative might involve:

- Mobile application
- API
- Eligibility service
- Notification service
- Analytics

Each component would receive its own set of requirements, including the responsibilities, expected behavior, dependencies, integrations, and acceptance criteria relevant to that component.

These would be initial specifications, not detailed technical designs.

The goal is to tell each component team **what needs to be delivered, not how to build it**.

### Let component teams define the technical details

Once the component requirements are available, each team can take its package and expand it into detailed specifications.

This is where the team makes technical decisions, creates designs, writes ADRs or LLDs when needed, and prepares the implementation.

The team doesn't need to interpret the entire PRD from scratch.

It already has a clear description of what the platform expects from its component, along with references to the original requirements.

This also gives teams more freedom to work independently while staying aligned with the overall initiative.

### Handle changes without losing track

Now imagine that development has already started and Product changes a requirement.

That's fine.

We update the PRD through a new revision.

From that change, we identify which platform requirements were modified and which components are affected.

Then we update the relevant component specification packages.

For example, if a change affects the API and Eligibility service but not Mobile, only the API and Eligibility packages need to be updated.

The teams can review those changes and determine whether their detailed specifications or implementations need adjustments.

This gives us a better way to understand the impact of changes before they create problems.

### Catch missing information earlier

Another benefit is that generating these component packages gives us an opportunity to review requirements more carefully.

We can identify missing information, unclear behavior, assumptions, or dependencies before teams start implementing.

For example, if a requirement says, "The customer should be notified immediately," we should identify what "immediately" means.

Does it mean within one second? Can it happen asynchronously? What happens if the notification fails?

These questions should be identified while preparing the specifications, not discovered during implementation.

### Keep the process consistent across teams and agents

We should also standardize how specifications are structured.

I don't think every team needs to use the same AI model, agent, or tool.

Teams should be free to use what works best for them.

However, the specification format and the information it must contain should be consistent.

That way, regardless of which agent or model generates the specifications, the teams receive the same type of information.

We standardize the output and expectations, not necessarily the tools used to produce them.

# 3. The Main Idea

The workflow I'm proposing is straightforward:

**PRD → Platform Specifications → Component Requirements → Component Specifications → Implementation**

Each level has a clear purpose.

The PRD defines why we're doing something and what the platform needs to deliver.

The Platform Specification describes the expected behavior, interactions, and responsibilities across the platform.

The Component Requirements define what each component must deliver as part of the initiative.

The Component Specifications define how each team will implement those requirements.

And when something changes, we can trace that change from the PRD down to the affected components.

The goal isn't to add more documentation or make the process more complicated.

It's to give teams better information, reduce assumptions, identify dependencies earlier, and make it easier to manage changes without losing track of what was originally approved.

**We should be able to change requirements without creating confusion about what each team is supposed to build.**



---
---
---
---



Looks like the interactive visualization didn’t render in your client. Here’s the same idea as a simple visual diagram you can see directly:

```text
                    HOW WE WORK TODAY
                    =================

                        ┌───────────┐
                        │    PRD    │
                        │ Platform  │
                        │ Why + What│
                        └─────┬─────┘
                              │
                              ▼
                     ┌────────────────┐
                     │ MVP / Version 1│
                     │    APPROVED    │
                     └───────┬────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ Technical Design  │
                   │                   │
                   │ Architecture      │
                   │ LLD · ADR · Specs │
                   └────────┬──────────┘
                            │
                   ✓ Up to here,
                     it works well
                            │
             ───────────────┼───────────────
                            │
                      PROBLEMS START
                            │
                            ▼
                ┌─────────────────────┐
                │ PRD keeps changing  │◄──── New requirements
                │                     │◄──── Product changes
                └──────────┬──────────┘◄──── Google Doc comments
                           │
                           │
              Not all changes reach
              the specs immediately
                           │
                           ▼
             ┌─────────────────────────┐
             │ SAME PLATFORM-LEVEL PRD │
             └────────────┬────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
          ┌────────┐  ┌────────┐  ┌────────┐
          │ Team A │  │ Team B │  │ Team C │
          │   UI   │  │  API   │  │Service │
          └───┬────┘  └───┬────┘  └───┬────┘
              │           │           │
              │ Each team interprets │
              │ the PRD independently│
              │           │           │
              ▼           ▼           ▼
          ┌────────┐  ┌────────┐  ┌────────┐
          │Model A │  │Model B │  │Agent C │
          │Skill A │  │Prompt B│  │Skill C │
          └───┬────┘  └───┬────┘  └───┬────┘
              │           │           │
              ▼           ▼           ▼
          ┌────────┐  ┌────────┐  ┌────────┐
          │ Spec A │  │ Spec B │  │ Spec C │
          │Detailed│  │Partial │  │Different│
          └───┬────┘  └───┬────┘  └───┬────┘
              │           │           │
              └───────────┼───────────┘
                          ▼
                   IMPLEMENTATION
                          │
                          ▼
              ┌──────────────────────┐
              │ Potential problems   │
              │                      │
              │ • Different context  │
              │ • Different detail   │
              │ • Assumptions        │
              │ • Outdated specs     │
              │ • Missed impacts     │
              │ • Rework             │
              └──────────────────────┘
```

### **The core problem**

```text
PRD changes
    │
    ├──── Decision in PRD
    ├──── Decision in comments
    ├──── New requirement
    └──── Changed requirement
                │
                ▼
        ┌─────────────────┐
        │   ???           │
        │ Who is affected?│
        └────────┬────────┘
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
      UI        API      Service
       ?         ?         ?
```

The issue is **not lack of documentation**.

The issue is that today there isn’t a clear, reliable chain like:

```text
WHAT WAS APPROVED
        ↓
WHAT CHANGED
        ↓
WHAT REQUIREMENT CHANGED
        ↓
WHAT COMPONENTS ARE AFFECTED
        ↓
WHAT SPECS MUST CHANGE
        ↓
WHAT IMPLEMENTATION MUST CHANGE
```

That’s the gap your proposed model is trying to solve.



---
---
---
---
