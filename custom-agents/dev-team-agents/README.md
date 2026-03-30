# dev-team-agents

Universal source format for a virtual software development team. Generates compatible configuration for **Claude Code**, **Codex CLI (OpenAI)**, and **OpenCode CLI**.

## What's inside

A 9-role virtual dev team following the **OpenSpec change workflow**:

| Role | Responsibility |
|------|---------------|
| CTO (Guaripolo) | Technical strategy, team orchestration, escalation |
| Dev Team Manager | Change routing, task breakdown, handoffs |
| Product Owner | Requirements, acceptance criteria |
| Technical Lead | Architecture, design documents |
| Staff Fullstack Developer | Architecture ownership, code review, mentoring |
| Sr. Fullstack Developer | Full-stack feature implementation |
| Mobile Flutter Developer | Flutter/mobile implementation |
| QA Engineer | Verification, signoff |
| DevOps Engineer | GCP infrastructure, CI/CD, deployment |

### OpenSpec Workflow

```
[Idea] → propose → plan-change → design-arch → implement → test-verify → deploy-gcp
```

Each phase produces artifacts in `openspec/changes/<change-id>/`.

---

## Quickstart

### Any tool (single-file drop-in)

`INSTRUCTIONS.md` is a pre-built, single-file version of all instructions. Drop it directly into any AI tool without running any scripts.

```bash
# Use as-is (already built)
cp INSTRUCTIONS.md /path/to/your-project/

# Regenerate after editing role/workflow source files
./adapters/generate-instructions.sh
```

Rename to whatever your tool expects: `AGENTS.md` (Codex), `CLAUDE.md` (Claude), `.opencode/rules.md` (OpenCode), or just use it as-is.

---

### Claude Code

```bash
cd dev-team-agents
./adapters/generate-claude.sh /path/to/your-project
```

This installs:
- `.claude/agents/` — 9 agent definitions
- `.claude/skills/` — 9 workflow skills (`/propose`, `/plan-change`, etc.)
- `.claude/commands/` — `/team-status`, `/delegate`
- `CLAUDE.md` — project instructions

Then in a Claude Code session:
```
@dev-manager plan a new feature for user notifications
/propose
/team-status
```

### Codex CLI (OpenAI)

```bash
cd dev-team-agents
./adapters/generate-codex.sh /path/to/your-project
```

This installs:
- `AGENTS.md` — team coordinator meta-prompt (Codex reads this automatically)
- `codex.yaml` — model and approval mode settings

Since Codex is a single-agent tool, the team is simulated through **role-switching**. The model adopts the appropriate role based on the routing table in `AGENTS.md`.

Then run:
```bash
codex "Plan a new feature for user notifications"
# Model announces: "Acting as Dev Team Manager..."
```

### OpenCode CLI

```bash
cd dev-team-agents
./adapters/generate-opencode.sh /path/to/your-project
```

This installs:
- `.opencode/rules.md` — team instructions (OpenCode reads this)
- `AGENTS.md` — same content at root (compatibility)
- `opencode.json` — provider and model configuration

Then run:
```bash
opencode
# In the session: "Plan a new feature for user notifications"
```

---

## Directory Structure

```
dev-team-agents/
├── team.yaml              # Machine-readable team manifest
├── shared/                # Deduplicated content
│   ├── SOUL.md            # Shared non-negotiables
│   ├── USER.md            # User preferences
│   ├── TOOLS.md           # Tool usage policy
│   ├── TEAM_TOPOLOGY.md   # Team roster and operating rules
│   ├── CONTEXT_PROTOCOL.md # 3-layer context loading protocol
│   ├── PROJECT_MAP_GUIDE.md # How to use project-map.yaml
│   ├── WORKTREE_POLICY.md
│   ├── HANDOFF_FORMAT.md
│   └── skills/            # Shared operational skills
│       ├── handoff-standard/
│       ├── openspec-sdd/
│       ├── project-bootstrap/
│       ├── project-map-reader/
│       ├── monorepo-navigation/
│       ├── git-worktree-discipline/
│       ├── self-learning-loop/
│       └── mc-task-poll/
├── workflows/             # Portable workflow definitions
│   ├── propose/WORKFLOW.md
│   ├── plan-change/WORKFLOW.md
│   ├── design-arch/WORKFLOW.md
│   ├── implement/WORKFLOW.md
│   ├── test-verify/WORKFLOW.md
│   ├── deploy-gcp/WORKFLOW.md
│   ├── review-code/WORKFLOW.md
│   ├── handoff/WORKFLOW.md
│   └── openspec-change/WORKFLOW.md
├── commands/              # Portable command definitions
│   ├── team-status.md
│   └── delegate.md
├── roles/                 # Per-role content
│   ├── cto/
│   │   ├── IDENTITY.md    # Name, mission, focus
│   │   ├── ROLE.md        # Role-specific responsibilities
│   │   ├── SOUL.md        # Role-specific non-negotiables
│   │   ├── BOOTSTRAP.md   # Session startup procedure
│   │   └── HEARTBEAT.md   # Periodic self-check
│   ├── manager/
│   ├── po/
│   ├── tech-lead/
│   ├── staff-fullstack/
│   ├── sr-fullstack/
│   ├── mobile/
│   ├── qa/
│   └── devops/
└── adapters/              # Generator scripts
    ├── generate-claude.sh
    ├── generate-codex.sh
    ├── generate-opencode.sh
    └── lib/
        └── tokens.sh      # Token substitution library
```

---

## How Token Substitution Works

Workflow and role files use abstract tokens that adapters replace during generation:

| Token | Claude Code | Codex / OpenCode |
|-------|-------------|------------------|
| `[role:po]` | `@product-owner` | `the Product Owner` |
| `[role:manager]` | `@dev-manager` | `the Dev Team Manager` |
| `[skill:propose]` | `/propose` | `the Propose workflow` |
| `[skill:implement]` | `/implement` | `the Implement workflow` |

This means you author workflows once in the universal format and the adapters produce idiomatic output for each tool.

---

## Project Setup (target project)

Each target project should have:

```
your-project/
├── ~/coding-projects/project-map.yaml   # Global project registry
└── .ai/
    └── shared-memory/
        ├── project-context.md
        ├── current-focus.md
        ├── decision-log.md
        ├── mistake-log.md
        └── lessons-learned.md
```

**project-map.yaml**:
```yaml
version: 1
root: ~/coding-projects
projects:
  - projectName: My Project
    projectCode: my-project
    location: ~/coding-projects/my-project
    status: active
```

---

## Tool Comparison

| Feature | Claude Code | Codex CLI | OpenCode |
|---------|-------------|-----------|---------|
| Multi-agent (native) | ✅ | ❌ (role-switching) | ❌ (role-switching) |
| Custom slash commands | ✅ (skills) | ❌ | Limited |
| Instruction file | `CLAUDE.md` | `AGENTS.md` | `.opencode/rules.md` |
| Config | `.claude/settings.json` | `codex.yaml` | `opencode.json` |
| Hooks | ✅ | ❌ | ❌ |
| Provider | Anthropic only | OpenAI only | Multi-provider |
| Safety model | Permission prompts | Sandboxing | Config-based |
