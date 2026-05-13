# Dev Team Agents for Claude Code

## Team Structure

This project uses a multi-agent development team. Each agent has a specific role and can be invoked via `@agent-name` or used automatically by Claude when delegating work.

### Available Agents
- `@cto` — Own technical strategy, team orchestration, and delivery quality across all projects. Identify needs, create parent issues, delegate to the Dev Team Manager, and ensure the team operates with clarity, velocity, and accountability.
- `@dev-manager` — Coordinate the full delivery flow across projects, agents, and changes. Own routing, priorities, handoffs, escalation, and completion. Manage the OpenSpec change workflow and ensure every change flows from proposal through deployment.
- `@product-owner` — Own requirements clarity, scope, acceptance criteria, backlog shape, and OpenSpec planning quality.
- `@tech-lead` — Own architecture, contracts, package boundaries, and technical decision quality across the project monorepo. Produce design.md for complex changes.
- `@staff-fullstack` — Own end-to-end architecture and technical decision-making across the full stack. Design API contracts, database schemas, and UI architecture. Set code review standards, enforce quality gates, and mentor other engineers.
- `@sr-fullstack` — Autonomously implement features across the full stack — backend API endpoints, database queries, service logic, React components, state management, and styling. Write comprehensive tests and deliver PR-ready code.
- `@mobile-dev` — Implement Flutter/mobile changes and keep mobile build health, release readiness, and package integration stable.
- `@qa-engineer` — Verify acceptance, regression, integration quality, and release readiness. Turn mistakes into reusable lessons and provide signoff to DevOps before deployment.
- `@devops` — Own infrastructure, CI/CD pipelines, deployment automation, and production reliability. Manage GCP resources via Terraform, maintain Cloud Run and Cloud Functions deployments, and ensure safe, repeatable releases.

### Available Skills (slash commands)
- `/propose` — Create or refine a change proposal with acceptance criteria
- `/plan-change` — Create a change folder with proposal, tasks, and handoff
- `/design-arch` — Produce an architecture design document for a complex change
- `/implement` — Implement a feature following the change spec
- `/test-verify` — Run verification against acceptance criteria
- `/deploy-gcp` — Deploy to GCP via Terraform and CI/CD
- `/review-code` — Conduct a structured code review
- `/handoff` — Create or update a handoff document between agents
- `/openspec-change` — Full OpenSpec change lifecycle management
- `/design-ui` — Premium UI design skill (anti-slop, typography, motion, layout)
- `/coding-agent` — OpenSpec-gated implementation skill (phase gate + task lifecycle)

### Available Commands
- `/team-status` — Show status of all active changes and agent assignments
- `/delegate` — Route a task to the appropriate agent

## OpenSpec Change Workflow
```
openspec/changes/<change-id>/
├── proposal.md     # What, why, acceptance criteria
├── design.md       # Architecture (if needed, via Tech Lead)
├── tasks.md        # Implementation subtasks
├── handoff.md      # State between agent transitions
└── archive/        # Completed changes
```

## Coordination Flow
1. Product Owner frames requirements and acceptance criteria
2. Dev Manager creates change folder, breaks down tasks, routes work
3. Tech Lead architects design.md if complex
4. Staff/Sr Fullstack Dev implements UI and API/DB changes
5. Mobile Dev implements Flutter UI changes
6. QA Engineer tests and verifies against acceptance criteria
7. DevOps deploys to GCP after QA signoff

## Skill Preference

**Always use `/uncle-dev:*` skills first** for all development workflow tasks:

| Task | Skill |
|---|---|
| Write a spec | `/uncle-dev:spec` |
| Plan tasks | `/uncle-dev:plan` |
| Implement | `/uncle-dev:build` |
| Test | `/uncle-dev:test` |
| Review code | `/uncle-dev:review` |
| Simplify code | `/uncle-dev:code-simplify` |
| Ship / launch | `/uncle-dev:ship` |

Do not suggest `/coding-agent`, `/implement`, or other non-uncle-dev implementation skills
unless a specific uncle-dev skill does not exist for the task.

## UI Testing — `agent-browser`

`agent-browser` (vercel-labs) is the project's **default UI testing tool** for the React dashboard in `packages/web`. Any change touching `packages/web/**` MUST be exercised through it before handoff or QA signoff.

- Canonical rule: `.claude/rules/agent-browser-ui-testing.md` (read before implementing or verifying any UI change).
- Owners: `@sr-fullstack` and `@staff-fullstack` self-test on implementation; `@qa-engineer` produces verification evidence.
- Evidence directory: `tmp/qa/<change-id>/` (screenshots, eval outputs, traces). Never commit these.
- Quickstart: `bun --cwd packages/web run dev` then `agent-browser open http://localhost:3000 --session pf-qa && agent-browser snapshot -i --session pf-qa`.
- Not for: backend-only changes, Flutter mobile UI, infrastructure changes.

## Hard Constraints — Never Violate

### Noony errors → rules + skill first, source code never
When any Noony handler or API error occurs (wrong middleware order, missing DI arg, handler wiring, type error):
1. Read `.claude/rules/noony-*.md` files relevant to the error
2. Invoke the `noony-framework` skill if the pattern is unclear
3. Only touch source code **after** the rules give you the answer

**Forbidden:** opening `node_modules/@noony-serverless/core/...` to debug before reading the rules. The rules exist so you never need to do that.

### agent-browser is the only UI testing tool for `packages/web`
`mcp__playwright__*` tools are **forbidden** as a substitute for `agent-browser`, even when they are loaded and available. There are no exceptions.

## Rules
- Never assume project context — load it from
- Every active change needs a handoff file
- Do not implement against unclear acceptance criteria
- Record decisions, mistakes, and lessons when they matter
- Prefer small changes with explicit ownership
- UI changes in `packages/web` require `agent-browser` evidence in `handoff.md` before signoff
