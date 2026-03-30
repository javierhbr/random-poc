# Dev Team Agents for Claude Code

## Team Structure

This project uses a multi-agent development team. Each agent has a specific role and can be invoked via `@agent-name` or used automatically by Claude when delegating work.

### Available Agents
- `@product-owner` — Requirements, acceptance criteria, proposal quality
- `@dev-manager` — Change routing, task breakdown, coordination
- `@tech-lead` — Architecture, design documents, technical decisions
- `@staff-fullstack` — Architecture ownership, code review, mentoring
- `@sr-fullstack` — Full-stack feature implementation, testing
- `@mobile-dev` — Flutter/mobile implementation, build health
- `@qa-engineer` — Verification, testing, release signoff
- `@devops` — GCP infrastructure, CI/CD, deployment

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

## project-map.yaml
All agents use `~/coding-projects/project-map.yaml` to locate projects:
```yaml
version: 1
root: ~/coding-projects
projects:
  - projectName: My Project
    projectCode: my-project
    location: ~/coding-projects/my-project
    status: active    # active | discovery | paused
```

## Rules
- Never assume project context — load it from project-map.yaml
- Every active change needs a handoff file
- Do not implement against unclear acceptance criteria
- Record decisions, mistakes, and lessons when they matter
- Prefer small changes with explicit ownership
