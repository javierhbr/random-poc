# Multi-Session Shared Context for Coding Agents

## Overview

When multiple Claude Code and Codex sessions work simultaneously on the
same project, a single project-level checkpoint is not enough.

Each session may be working on a different task, investigating a
different problem, or modifying a different part of the codebase. A
shared memory system must preserve the context of each session
independently while still allowing related sessions to discover useful
information from one another.

The proposed approach is a lightweight **Multi-Session Shared Context**
system.

The goal is not to replace Specs, ADRs, `AGENTS.md`, `CLAUDE.md`,
Skills, source code, or other Spec-Driven Development artifacts. Those
remain the source of truth.

The shared context exists primarily to preserve **operational continuity
between agents and sessions**.

------------------------------------------------------------------------

## 1. Core Principle

Each session owns its own state.

Other sessions may discover and read relevant state, but they should not
overwrite it.

Conceptually:

``` text
Claude Code #1 ─┐
Claude Code #2 ─┤
Codex #1 ───────┼──> Shared Context Store
Codex #2 ───────┘
                         │
                         ├── Session State
                         ├── Task Context
                         ├── Project Activity
                         └── Checkpoint History
```

This prevents one session from accidentally replacing the context of
another session working in the same repository.

------------------------------------------------------------------------

## 2. Three Levels of Context

### 2.1 Session Context

Session context represents what one specific agent session is currently
doing.

Examples:

-   Current objective
-   Current progress
-   Last meaningful action
-   Next expected step
-   Current blockers
-   Files being modified
-   Active investigation
-   Recent hypotheses
-   Associated Spec or task

Example:

``` json
{
  "session_id": "codex-123",
  "agent": "codex",
  "project": "payment-service",
  "task": "payment-retry",
  "status": "in_progress",
  "last_action": "Updated retry handler",
  "next_step": "Run integration tests",
  "blockers": [],
  "changed_files": [
    "src/retry.ts",
    "tests/retry.test.ts"
  ]
}
```

The session is the owner of this state.

------------------------------------------------------------------------

### 2.2 Task Context

Several sessions may work on the same task or Spec.

Task context aggregates temporary operational information related to
that work.

For example:

``` text
Task: payment-retry

Claude Code #1
Implementing retry logic

Codex #1
Creating integration tests

Codex #2
Investigating LocalStack behavior
```

These sessions should be able to discover relevant activity from each
other without loading every checkpoint from the entire project.

The task or Spec becomes the natural correlation point.

------------------------------------------------------------------------

### 2.3 Project Context

Project context provides lightweight awareness of what is happening
across the repository.

It may answer questions such as:

-   Which sessions are currently active?
-   What tasks are they working on?
-   Which files or components are being modified?
-   Has another session recently touched the same area?
-   Are two sessions potentially working on conflicting changes?

Example:

``` text
PROJECT ACTIVITY

Claude Code #1
Task: Authentication
Files: src/auth/*

Codex #1
Task: Payment Retry
Files: src/payment/retry.ts

Codex #2
Task: Payment Retry Tests
Files: tests/payment/*
```

Project context should remain lightweight. An agent normally does not
need the full working history of every other session.

------------------------------------------------------------------------

## 3. Session Identity

Each running coding-agent session needs a unique identity.

A useful identity model is:

``` text
Project
  +
Agent
  +
Session ID
```

Additional correlation information can include:

``` text
Git branch
Git worktree
Spec ID
Task ID
Repository
```

For example:

``` json
{
  "project": "payment-service",
  "agent": "codex",
  "session_id": "01JABC123",
  "branch": "feature/payment-retry",
  "worktree": "/worktrees/payment-retry",
  "spec": "openspec/changes/payment-retry"
}
```

The task or Spec should not be guessed aggressively. If the system
cannot determine it reliably, the session can remain temporarily
unassigned.

Incorrect correlation is worse than no correlation.

------------------------------------------------------------------------

## 4. Multiple Sessions Working on the Same Project

Consider four simultaneous sessions:

``` text
Claude Code #1 → Authentication
Claude Code #2 → Notification service
Codex #1       → Payment implementation
Codex #2       → Payment tests
```

Every session writes its own checkpoints.

``` text
sessions/
    claude-001
    claude-002
    codex-001
    codex-002
```

However, Codex #1 and Codex #2 may both be associated with:

``` text
payment-retry
```

This allows them to discover each other's recent activity because the
information is relevant to the same task.

Claude Code #2, working on notifications, does not need that context.

This produces **selective shared memory instead of global shared
memory**.

------------------------------------------------------------------------

## 5. Example of Cross-Session Context Recovery

Suppose Codex #2 is creating payment tests.

Codex #1 changes the response contract of the Payment API.

When Codex #2 resumes, it could receive:

``` text
MY CHECKPOINT

Created 8 integration tests.
Error cases are still missing.

RELATED ACTIVITY

Codex #1 recently changed the Payment API response contract.

POTENTIAL IMPACT

Some existing tests may still expect the previous response structure.
```

The purpose is not to inject the entire history of Codex #1.

Only potentially relevant recent activity is surfaced.

------------------------------------------------------------------------

## 6. Memory Conflicts vs. Code Conflicts

These are separate problems.

### Memory Conflicts

Memory conflicts are avoided because every session owns its own state.

A session does not overwrite another session's checkpoint.

### Code Conflicts

Shared memory does not prevent two agents from modifying the same files.

The system can detect potential collisions such as:

``` text
WARNING

Codex #1 and Claude Code #2 are both modifying:

src/payment/payment-service.ts
```

However, actual code isolation should still be handled using mechanisms
such as:

-   Git branches
-   Git worktrees
-   Existing repository workflows

Git worktrees are particularly useful when several agents operate
concurrently because each session can have an isolated working directory
while still participating in the same shared context.

------------------------------------------------------------------------

## 7. Why SQLite Is Better Than JSON for Multi-Session Use

For a single session, JSON is sufficient.

For several simultaneous sessions, SQLite becomes more appropriate.

SQLite provides:

-   Concurrent readers
-   Transactional writes
-   Queryable history
-   Session lookup
-   Task correlation
-   Event history
-   No database server
-   No external infrastructure

Using SQLite WAL mode allows readers to continue accessing the database
while short writes occur.

The database should be located outside individual Git worktrees so all
sessions for the project can access the same store.

SQLite is appropriate for multiple sessions on the same machine.

It should not be directly synchronized through services such as Google
Drive or Dropbox for multi-machine concurrency. A different
synchronization layer would be needed for that scenario.

------------------------------------------------------------------------

## 8. Minimal Data Model

An MVP could start with four tables.

### `sessions`

Tracks agent sessions.

Possible fields:

``` text
session_id
agent
project
task_id
spec_id
branch
worktree
status
started_at
last_activity_at
```

### `checkpoints`

Stores snapshots of session state.

Possible fields:

``` text
checkpoint_id
session_id
status
summary
last_action
next_step
blockers
created_at
```

### `events`

Stores lightweight observed activity.

Examples:

``` text
file_modified
test_failed
test_passed
commit_created
spec_opened
task_changed
checkpoint_created
```

### `task_sessions`

Associates multiple sessions with the same task.

``` text
task_id
session_id
joined_at
```

------------------------------------------------------------------------

## 9. Automatic Agent Lifecycle

The system should minimize manual interaction.

### Session Start

Automatically:

1.  Identify the project.
2.  Register the session.
3.  Detect the agent.
4.  Detect branch/worktree information.
5.  Recover the session's previous checkpoint when applicable.
6.  Discover relevant activity associated with the same task or Spec.
7.  Inject only the useful context.

### During Work

Record lightweight activity such as:

-   Important file changes
-   Task association
-   Progress updates
-   Test results
-   Significant investigation state

This should not become a complete transcript recorder.

### End of Turn

Update the session checkpoint with the latest known state.

### Before Context Compaction

Persist enough working state to recover after compaction.

### Session End

Write the final available checkpoint.

The design should also tolerate abrupt termination because a clean
shutdown event cannot always be guaranteed.

------------------------------------------------------------------------

## 10. Checkpoints vs. Handoffs

These should remain separate concepts.

### Checkpoint

Automatic, lightweight, frequent.

Purpose:

> Allow the same session or another related session to understand the
> recent working state.

### Handoff

Explicit, richer, intentional.

Purpose:

> Transfer responsibility or detailed reasoning from one agent/session
> to another.

The existing handoff process does not need to disappear.

Instead:

``` text
Automatic checkpoint
        ↓
Normal continuity

Explicit handoff
        ↓
Complex transfer of responsibility
```

Most session changes should require only checkpoints.

Handoffs become the exception rather than the default.

------------------------------------------------------------------------

## 11. Same Session vs. Different Session

The system should distinguish two scenarios.

### Resume the Same Session

If Codex resumes its own session:

``` text
Codex session A
     ↓
Own previous checkpoint
```

Recovery is straightforward.

### Continue Work From Another Session

If a new Codex session needs to continue work previously performed by
Claude Code:

``` text
Claude session A
      ↓
Task / Spec
      ↓
Codex session B
```

The task or Spec becomes the correlation mechanism.

The system can retrieve the latest relevant checkpoints associated with
that work.

It should never blindly assume:

> "Use the most recent session in the project."

That becomes dangerous when many sessions are running simultaneously.

------------------------------------------------------------------------

## 12. Relationship With Spec-Driven Development

The shared context store must **not become another source of truth**.

Permanent knowledge belongs in the existing development artifacts.

  Information                Source of Truth
  -------------------------- -----------------------------------
  Business behavior          Specs
  Requirements               Specs
  Architecture decisions     ADRs / architecture documentation
  Development rules          `AGENTS.md`, `CLAUDE.md`, rules
  Specialized procedures     Skills
  Implementation             Source code
  Tests                      Test suite
  Current session progress   Shared context
  Temporary investigation    Shared context
  Current blocker            Shared context
  Cross-session activity     Shared context
  Next working step          Shared context

The memory layer stores **operational state**, not product truth.

------------------------------------------------------------------------

## 13. Promotion of Knowledge

Sometimes temporary session knowledge becomes permanent.

For example:

``` text
Agent discovers an architectural constraint
        ↓
Stored temporarily in session context
        ↓
Validated
        ↓
Promoted into Spec / ADR / Rule / Skill
        ↓
Temporary memory can expire
```

This creates a useful lifecycle:

``` text
Experience
    ↓
Memory
    ↓
Validation
    ↓
Official knowledge
```

The shared context system should help identify knowledge worth
promoting, but it should not automatically turn observations into
permanent rules.

------------------------------------------------------------------------

## 14. Proposed MVP

The first implementation should remain intentionally small.

### Capability 1 --- Auto Registration

Every Claude Code or Codex session automatically registers itself.

### Capability 2 --- Auto Checkpoint

Each session maintains its own checkpoint.

### Capability 3 --- Context Recovery

A session can automatically recover:

-   Its own previous state
-   Relevant task activity
-   Recent related session activity

### Capability 4 --- Session Discovery

Agents and users can query:

``` text
What sessions are active?
What are they working on?
What was their latest checkpoint?
```

### Capability 5 --- Basic Collision Awareness

Detect when multiple active sessions appear to be modifying the same
files or closely related areas.

------------------------------------------------------------------------

## 15. Suggested Architecture

``` text
┌─────────────────────┐
│    Claude Code #1   │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ Hooks / Wrapper     │
└──────────┬──────────┘
           │
           │
┌──────────▼──────────────────────────────┐
│          Shared Context CLI             │
│                                        │
│ register                               │
│ checkpoint                             │
│ context                                │
│ sessions                               │
│ activity                               │
└──────────┬──────────────────────────────┘
           │
┌──────────▼──────────┐
│       SQLite        │
│                    │
│ sessions           │
│ checkpoints        │
│ events             │
│ task_sessions      │
└──────────▲──────────┘
           │
┌──────────┴──────────┐
│ Hooks / Wrapper     │
└──────────▲──────────┘
           │
┌──────────┴──────────┐
│      Codex #1       │
└─────────────────────┘
```

Claude Code and Codex do not need to communicate directly.

They communicate indirectly through the same lightweight shared context
store.

------------------------------------------------------------------------

## 16. CLI Concept

A very small CLI could expose commands such as:

``` bash
memory register
memory checkpoint
memory context
memory sessions
memory activity
```

Examples:

``` bash
memory sessions
```

Could return:

``` text
4 active sessions

claude-001
  payment-service
  auth-refactor
  active 3m ago

codex-003
  payment-service
  payment-retry
  active 1m ago
```

And:

``` bash
memory context
```

Could return only context relevant to the current session.

This keeps integration agent-agnostic.

Claude Code, Codex, future coding agents, wrappers, and Skills can all
interact with the same simple interface.

------------------------------------------------------------------------

## 17. What Not to Build Initially

The MVP does not need:

-   MCP
-   Embeddings
-   Vector databases
-   Knowledge graphs
-   LLM-based memory extraction
-   Cloud infrastructure
-   A web UI
-   Full conversation storage
-   Complex multi-agent orchestration

Those capabilities can be evaluated later if real usage demonstrates a
need.

The initial question is simpler:

> Can automatic lightweight shared context eliminate most manual
> handoffs and duplicated investigation between concurrent coding-agent
> sessions?

------------------------------------------------------------------------

## 18. Success Criteria

The experiment should measure whether the system reduces:

-   Manual handoffs
-   Repeated investigation
-   Context reconstruction
-   Duplicate work
-   Accidental overlapping work
-   Tokens spent re-explaining the current state

It should also measure:

-   Incorrect context recovery
-   Stale checkpoints
-   Noise introduced into agent context
-   SQLite concurrency problems
-   Cases where task correlation is ambiguous

------------------------------------------------------------------------

## Final Principle

The system should not try to make agents remember everything.

It should make it cheap for agents to answer:

> **What was I doing, what are related agents doing, what changed
> recently, and what should I know before continuing?**

Everything permanent continues to live in the project's Spec-Driven
Development artifacts.

The shared memory exists only to preserve the operational context that
normally disappears between sessions.
