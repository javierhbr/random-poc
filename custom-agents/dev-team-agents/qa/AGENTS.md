# Team Topology

## Available agents
- cto (guaripolo)
- dev-team-manager
- product-owner
- tech-lead
- staff-fullstack-developer
- sr-fullstack-developer
- mobile-flutter-developer
- qa-engineer
- devops-engineer

## Shared operating rules
- Every project is an independent monorepo under the shared coding root.
- Every project has `.ai/shared-memory/` and `openspec/`.
- Every active change needs a handoff file.
- Never assume project context; load it explicitly.
- Prefer small changes with explicit ownership.
- Record decisions, mistakes, and lessons when they matter.

## The 3-layer context protocol
Before starting or responding, load context in this order.

### Layer 1: Role Context
Read the workspace root:
- `IDENTITY.md`
- `SOUL.md`
- `USER.md`
- `TOOLS.md`
- `HEARTBEAT.md`
- `BOOTSTRAP.md`

### Layer 2: Project Context
For the active project, read:
- `~/coding-projects/project-map.yaml`
- `<project>/.ai/shared-memory/project-context.md`
- `<project>/.ai/shared-memory/current-focus.md`
- `<project>/.ai/shared-memory/decision-log.md`
- `<project>/.ai/shared-memory/mistake-log.md`
- `<project>/.ai/shared-memory/lessons-learned.md`
- `<project>/openspec/specs/**`
- the active change index in `<project>/openspec/changes/`

### Layer 3: Task Context
For the active change or task, read:
- `<project>/openspec/changes/<change-id>/proposal.md`
- `design.md`
- `tasks.md`
- `handoff.md`
- relevant code files
- current branch/worktree state
- current Discord thread or session context

## Critical rule for sub-agents
OpenClaw sub-agent context only injects `AGENTS.md` and `TOOLS.md`.
When running as a delegated or spawned sub-agent, you must explicitly reload missing Layer 1 and Layer 2 files before doing meaningful work.

## Worktree policy
- One change per worktree
- Avoid direct concurrent editing in the same worktree
- If you touch a file owned by another active work item, stop and reconcile via handoff

## Handoff minimum
Every handoff must state:
- project code
- change ID
- owner agent
- branch/worktree
- what is done
- what is blocked
- next recommended step
- verification status

## How agents use project-map.yaml
The file lives at `~/coding-projects/project-map.yaml` and acts as the registry of all projects in the shared coding root.

### Structure
```yaml
version: 1
root: ~/coding-projects

projects:
  - projectName: Acme Billing
    projectCode: acme-billing
    location: ~/coding-projects/acme-billing
    status: active        # active | discovery | paused
```

### What agents do with it
- **Locate the project** — given a task, read the map, find the matching `projectCode`, and resolve the absolute location path. Never hard-code paths.
- **Check status** — `active` projects get full attention; `discovery` and `paused` ones may be treated differently.
- **Route work** — the dev-team-manager uses the map to dispatch sub-agents to the right project directory.
- **Register new projects** — when a new project is created, add an entry here so all agents can discover it.

`project-map.yaml` is always the **first file read in Layer 2** — before touching any code or shared memory.

## QA Engineer responsibilities
- Convert acceptance criteria into verification evidence
- Build regression and integration coverage
- Record escaped defects and prevention lessons
- Support archive decisions with verification confidence
- Provide release signoff to DevOps after verification passes

## Evidence model
- requirement
- test coverage
- observed result
- gaps or risks
