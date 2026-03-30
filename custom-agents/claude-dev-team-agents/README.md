# Claude Dev Team Agents

A ready-to-use Claude Code agent team for software delivery. Drop the `.claude/` folder into any project to get a full dev team with roles, skills, and slash commands.

## What's Included

### 8 Agents (`@mention` to use)
| Agent | Invocation | Role |
|-------|-----------|------|
| Product Owner | `@product-owner` | Requirements, proposals, acceptance criteria |
| Dev Manager | `@dev-manager` | Change routing, task breakdown, coordination |
| Technical Lead | `@tech-lead` | Architecture, design documents, technical review |
| Staff Fullstack | `@staff-fullstack` | Architecture ownership, code review, mentoring |
| Sr. Fullstack | `@sr-fullstack` | Full-stack feature implementation, testing |
| Mobile Dev | `@mobile-dev` | Flutter/mobile implementation, build health |
| QA Engineer | `@qa-engineer` | Verification, testing, release signoff |
| DevOps | `@devops` | GCP infrastructure, CI/CD, deployment |

### 9 Skills (slash commands)
| Command | Purpose |
|---------|---------|
| `/propose` | Create a change proposal with acceptance criteria |
| `/plan-change` | Create change folder with proposal, tasks, handoff |
| `/design-arch` | Produce architecture design document |
| `/implement` | Implement a feature following the change spec |
| `/test-verify` | Verify against acceptance criteria, produce QA signoff |
| `/deploy-gcp` | Deploy to GCP via Terraform and CI/CD |
| `/review-code` | Conduct a structured code review |
| `/handoff` | Create or update a handoff between agents |
| `/openspec-change` | Full change lifecycle from idea to production |

### 2 Commands
| Command | Purpose |
|---------|---------|
| `/team-status` | Show all active changes and agent assignments |
| `/delegate` | Route a task to the right agent |

---

## Installation

### Option A: Copy into your project
```bash
cp -r claude-dev-team-agents/.claude /path/to/your-project/.claude
cp claude-dev-team-agents/CLAUDE.md /path/to/your-project/CLAUDE.md
```

### Option B: Copy to user-level (all projects)
```bash
cp -r claude-dev-team-agents/.claude/agents/* ~/.claude/agents/
cp -r claude-dev-team-agents/.claude/skills/* ~/.claude/skills/
cp -r claude-dev-team-agents/.claude/commands/* ~/.claude/commands/
```

---

## Project Setup

Each project needs a `project-map.yaml` at `~/coding-projects/project-map.yaml`:

```yaml
version: 1
root: ~/coding-projects

projects:
  - projectName: My Project
    projectCode: my-project
    location: ~/coding-projects/my-project
    status: active        # active | discovery | paused
```

And a shared memory structure:
```bash
mkdir -p ~/coding-projects/my-project/.ai/shared-memory
mkdir -p ~/coding-projects/my-project/openspec/{changes,specs,archive}
```

Shared memory files (create with empty content to start):
- `.ai/shared-memory/project-context.md`
- `.ai/shared-memory/current-focus.md`
- `.ai/shared-memory/decision-log.md`
- `.ai/shared-memory/mistake-log.md`
- `.ai/shared-memory/lessons-learned.md`

---

## Typical Workflows

### Start a new feature
```
"I need a user notification system for status changes"
```
Claude will ask if you want to use `/openspec-change` to run the full lifecycle,
or you can invoke individual steps:
1. `/propose` — write the proposal
2. `/plan-change` — create tasks and route to team
3. `/design-arch` — architecture (if complex)
4. `/implement` — build it
5. `/test-verify` — QA signoff
6. `/deploy-gcp` — ship it

### Check what's happening
```
/team-status
```

### Route a task
```
/delegate "implement the user profile API endpoint for change acme-profile-20240315"
```

### Ask an agent directly
```
@product-owner write acceptance criteria for a password reset feature
@tech-lead design the API for our new notification service
@qa-engineer verify the login flow against the acceptance criteria in openspec/changes/acme-login-20240315/proposal.md
@devops deploy change acme-notifications-20240315 to production
```

---

## OpenSpec Change Folder Structure
```
openspec/
├── changes/
│   ├── <change-id>/
│   │   ├── proposal.md     # What & why (Product Owner)
│   │   ├── design.md       # How (Tech Lead — complex changes only)
│   │   ├── tasks.md        # Who does what (Dev Manager)
│   │   └── handoff.md      # Current state (updated by all)
│   └── archive/            # Completed changes
└── specs/                  # Durable product specifications
```

---

## Agent Coordination Flow
```
CTO/Stakeholder
      ↓ assigns issue
@dev-manager
  ├── @product-owner (if requirements unclear)
  ├── @tech-lead (if architecture needed)
  ├── @sr-fullstack / @staff-fullstack (web/backend/UI)
  ├── @mobile-dev (Flutter/mobile)
  ├── @qa-engineer (after implementation)
  └── @devops (after QA signoff)
```

---

## How Agents Use project-map.yaml

All agents read `~/coding-projects/project-map.yaml` as the **first step in Layer 2 context**. They use it to:

- **Locate the project** — resolve `projectCode` to an absolute path
- **Check status** — `active` projects get full attention; `paused` may be deprioritized
- **Route work** — Dev Manager dispatches to the right project directory

Never hard-code project paths in agent instructions. Always resolve from the map.
