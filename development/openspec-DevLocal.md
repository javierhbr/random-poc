# OpenSpec Enhancement: The DevLocal & Shared Change Pattern

## 1. Executive Summary

This proposal introduces a formal boundary between **Shared Project Truth** (tracked in Git) and **Personal Workspace**(ignored by Git). By adopting this pattern, we ensure that team coordination, AI-assisted development, and technical debt tracking remain visible in the repository, while allowing developers a "zero-pressure" space for experiments and scratchpads.

## 2. The Architecture Model

The truth is split into three distinct layers:

|Layer|Path|Ownership|Git Status|
|---|---|---|---|
|**Project Truth**|`openspec/specs/`|The Team|Tracked|
|**Change Truth**|`openspec/changes/<id>/`|The Feature Crew|Tracked|
|**Disposable Workspace**|`.devlocal/`|Individual Dev|**Ignored**|

### The "Shared Execution" Artifact

We are introducing `execution.md` within the change folder. This replaces the "shared breakdown" that often gets lost in private notes.

- **If it affects coordination, it belongs in `execution.md`.**
    
- **If it is just your personal mental model for the next 2 hours, it belongs in `.devlocal/`.**
    

## 3. Recommended Artifact Structure

```
/ (Root)
├── openspec/
│   ├── specs/ (Current system state)
│   └── changes/
│       └── STORY-123-feature-name/
│           ├── proposal.md       # The "Why"
│           ├── design.md         # The "How" (Architecture)
│           ├── tasks.md          # High-level milestones
│           ├── execution.md      # Detailed shared breakdown (NEW)
│           └── handoff.md        # QA & Review instructions
├── .devlocal/ (IGNORED BY GIT)
│   └── <your-name>/
│       └── STORY-123/
│           ├── scratchpad.md     # Rough thoughts
│           └── experiments.md    # Private prompts/notes
└── .gitignore                    # Updated to include .devlocal/
```

## 4. Operational Rules (The "Promotion" Protocol)

To maintain clarity, developers must follow these three rules:

- **Rule A (Coordination):** If another dev, QA, or an AI agent needs the info to assist or continue, it **must** move to the repo (`execution.md`).
    
- **Rule B (Evolution):** If a private experiment leads to a change in design, scope, or technical constraints, that finding **must** be promoted to `design.md`.
    
- **Rule C (Disposability):** Anything left in `.devlocal/` at the end of the story is considered garbage. It can be deleted without losing any project value.
    

## 5. Tutorial: Implementation Guide

### Step 1: Update your `.gitignore`

Add the following line to the root of your project to ensure personal noise never reaches the remote server:

```
# Developer local workspace
.devlocal/
```

### Step 2: Initialize a new Change

When starting a new story, create the standard OpenSpec folder:

```
mkdir -p openspec/changes/STORY-123-checkout-logic
touch openspec/changes/STORY-123-checkout-logic/{proposal,design,tasks,execution}.md
```

### Step 3: Set up your Private Workspace

Create your personal sandbox for the day:

```
mkdir -p .devlocal/$(whoami)/STORY-123
touch .devlocal/$(whoami)/STORY-123/scratchpad.md
```

### Step 4: The Daily Workflow

1. **Draft** your initial implementation ideas in `.devlocal/.../scratchpad.md`.
    
2. **Synchronize:** Once you decide on a sub-task breakdown or a specific integration contract, move those lines to `openspec/changes/.../execution.md`.
    
3. **Commit:** Commit the `openspec/` changes. Your `.devlocal/` remains invisible.
    
4. **Close:** When the PR is merged, delete your `.devlocal/STORY-123` folder.
    

## 6. Benefits for the Team

- **AI Readiness:** Agents (Claude Code, Cursor) have a clean `execution.md` to follow without being distracted by your private "to-buy" lists or messy notes.
    
- **Better Handoffs:** If you go on vacation, your teammate knows exactly what sub-tasks are left by looking at the repo.
    
- **Lower Cognitive Load:** You don't have to worry about "cleaning up" your notes before committing, because your notes never get committed.





---
---

# OpenSpec Enhancement: The DevLocal & Shared Change Pattern

## 1. Executive Summary

This proposal introduces a formal boundary between **Shared Project Truth** (tracked in Git) and **Personal Workspace**(ignored by Git). By adopting this pattern, we ensure that team coordination, AI-assisted development, and technical debt tracking remain visible in the repository, while allowing developers a "zero-pressure" space for experiments and scratchpads.

## 2. The Architecture Model

The truth is split into three distinct layers:

|Layer|Path|Ownership|Git Status|
|---|---|---|---|
|**Project Truth**|`openspec/specs/`|The Team|Tracked|
|**Epic/Change Truth**|`openspec/changes/<id>/`|Feature Crew|Tracked|
|**Disposable Workspace**|`.devlocal/`|Individual Dev|**Ignored**|

### The "Shared Execution" Artifact

We are introducing `execution.md` within the change folder. This replaces the "shared breakdown" that often gets lost in private notes.

- **Epic Level:** The `openspec/changes/<id>/` folder represents the Epic or high-level unit of work.
    
- **Story Level:** Individual user stories are tracked inside `tasks.md` as the shared source of truth.
    
- **Developer Level:** Each developer breaks down their assigned story into granular, technical steps inside their `.devlocal/` workspace.
    

## 3. Recommended Artifact Structure

```
/ (Root)
├── openspec/
│   ├── specs/ (Current system state)
│   └── changes/
│       └── EPIC-101-billing-v2/
│           ├── proposal.md       # High-level goals
│           ├── design.md         # Epic architecture
│           ├── tasks.md          # Shared Story-level breakdown
│           ├── execution.md      # Shared cross-story dependencies
│           └── handoff.md        # Epic-level QA instructions
├── .devlocal/ (IGNORED BY GIT)
│   └── <your-name>/
│       └── STORY-123/            # Specific story breakdown
│           ├── scratchpad.md     # Personal task list & notes
│           └── experiments.md    # Private prompts/notes
└── .gitignore                    # Updated to include .devlocal/
```

## 4. Operational Rules (The "Promotion" Protocol)

To maintain clarity, developers must follow these three rules:

- **Rule A (Coordination):** If a story breakdown reveals a dependency or a change that affects another developer, it **must** be promoted from `.devlocal/` to the shared `tasks.md` or `execution.md`.
    
- **Rule B (Evolution):** If a private experiment leads to a change in design, scope, or technical constraints for the Epic, that finding **must** be promoted to `design.md`.
    
- **Rule C (Disposability):** Anything left in `.devlocal/` at the end of the story is considered garbage. It can be deleted once the story code is merged.
    

## 5. Tutorial: Implementation Guide

### Step 1: Update your `.gitignore`

Add the following line to the root of your project:

```
# Developer local workspace
.devlocal/
```

### Step 2: Initialize a new Epic Change

Use the OpenSpec CLI to scaffold the Epic-level change:

```
# Create the Epic directory and basic artifacts
openspec change create EPIC-101-billing-v2

# Add shared artifacts for the team
openspec artifact add EPIC-101-billing-v2 execution.md
openspec artifact add EPIC-101-billing-v2 handoff.md
```

### Step 3: Set up your Personal Story Workspace

When assigned a story from the `tasks.md`, create your private sandbox:

```
mkdir -p .devlocal/$(whoami)/STORY-123
touch .devlocal/$(whoami)/STORY-123/scratchpad.md
```

### Step 4: The Daily Workflow

1. **Break Down:** Deconstruct your Story into technical tasks in `.devlocal/.../scratchpad.md`.
    
2. **Synchronize:** If you discover a shared hurdle, update the Epic artifact:
    
    ```
    openspec artifact open EPIC-101-billing-v2 execution.md
    ```
    
3. **Commit:** Commit your code and any updates to the `openspec/` folder.
    
4. **Close:** When the Epic is complete:
    
    ```
    openspec change archive EPIC-101-billing-v2
    rm -rf .devlocal/$(whoami)/
    ```
    

## 6. Benefits for the Team

- **AI Readiness:** Agents have a clean Epic context in `openspec/` while you keep the "how-to" noise in `.devlocal/`.
    
- **Granular Autonomy:** Developers have total freedom to manage their story sub-tasks without cluttering the main repo.
    
- **Epic Clarity:** `tasks.md` remains a high-level tracking tool for the team rather than a dump for every single code-level task.
