#!/usr/bin/env bash
# generate-claude.sh — Generate Claude Code native .claude/ structure
#
# Usage:
#   ./adapters/generate-claude.sh [TARGET_DIR]
#
# If TARGET_DIR is omitted, outputs to ./out/claude/ relative to this script.
# Compatible with bash 3+ (macOS default).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="${1:-$ROOT_DIR/out/claude}"

source "$SCRIPT_DIR/lib/tokens.sh"

echo "Generating Claude Code output -> $TARGET_DIR"
mkdir -p "$TARGET_DIR/.claude/agents"
mkdir -p "$TARGET_DIR/.claude/skills"
mkdir -p "$TARGET_DIR/.claude/commands"

# ── Role metadata helpers ──────────────────────────────────────────────────────

get_claude_name() {
  case "$1" in
    cto)            echo "cto" ;;
    manager)        echo "dev-manager" ;;
    po)             echo "product-owner" ;;
    tech-lead)      echo "tech-lead" ;;
    staff-fullstack) echo "staff-fullstack" ;;
    sr-fullstack)   echo "sr-fullstack" ;;
    mobile)         echo "mobile-dev" ;;
    qa)             echo "qa-engineer" ;;
    devops)         echo "devops" ;;
  esac
}

get_tools() {
  case "$1" in
    cto|manager)           echo "Read, Grep, Glob, Write, Bash" ;;
    po|tech-lead)          echo "Read, Grep, Glob, Write" ;;
    staff-fullstack|sr-fullstack|mobile|devops) echo "Read, Grep, Glob, Write, Edit, Bash" ;;
    qa)                    echo "Read, Grep, Glob, Bash" ;;
  esac
}

get_skill_desc() {
  case "$1" in
    propose)
      echo "Create or refine a change proposal with acceptance criteria. Use when starting a new feature, bug fix, or improvement. Produces proposal.md in the change folder. Invoke with /propose." ;;
    plan-change)
      echo "Create the OpenSpec change folder with proposal.md, tasks.md, and handoff.md. Routes work to the right agent. Use when a new issue or feature is ready to be broken down and assigned. Invoke with /plan-change." ;;
    design-arch)
      echo "Produce an architecture design document for a complex change. Covers API contracts, DB schema, component architecture, security, and rollback plan. Use before implementation of any non-trivial change. Invoke with /design-arch." ;;
    implement)
      echo "Implement a feature following the OpenSpec change spec. Reads proposal.md, design.md, and tasks.md before writing any code. Covers backend and frontend implementation with tests. Invoke with /implement." ;;
    test-verify)
      echo "Verify a completed change against its acceptance criteria. Traces each criterion to a test or manual check, documents evidence, and produces QA signoff. Use after implementation is complete before deployment. Invoke with /test-verify." ;;
    deploy-gcp)
      echo "Deploy a verified change to GCP via Terraform and CI/CD. Requires QA signoff in handoff.md before proceeding. Covers Cloud Run, Cloud Functions, and infrastructure changes. Invoke with /deploy-gcp." ;;
    review-code)
      echo "Conduct a structured code review covering correctness, security, performance, architecture alignment, and test coverage. Use when a PR is ready for review before merge. Invoke with /review-code." ;;
    handoff)
      echo "Create or update a handoff document when ownership of a change moves between agents. Use whenever you finish your part of a change and need to pass it to the next person. Invoke with /handoff." ;;
    openspec-change)
      echo "Full OpenSpec change lifecycle from requirements through deployment. Orchestrates the complete flow: propose → plan → design → implement → verify → deploy. Use when starting a new feature end-to-end. Invoke with /openspec-change." ;;
    design-ui)
      echo "Senior UI/UX engineer skill. Architect digital interfaces overriding default LLM biases. Enforces metric-based rules, strict component architecture, CSS hardware acceleration, and balanced design engineering. Invoke with /design-ui." ;;
  esac
}

# ── Generate agent files ──────────────────────────────────────────────────────

for role in cto manager po tech-lead staff-fullstack sr-fullstack mobile qa devops; do
  claude_name="$(get_claude_name "$role")"
  tools="$(get_tools "$role")"
  role_dir="$ROOT_DIR/roles/$role"
  out_dir="$TARGET_DIR/.claude/agents/$claude_name"
  mkdir -p "$out_dir"

  mission=$(grep "^Mission:" "$role_dir/IDENTITY.md" | sed 's/^Mission: //')

  {
    echo "---"
    echo "name: $claude_name"
    echo "description: $mission"
    echo "tools: $tools"
    echo "model: sonnet"
    echo "---"
    echo ""
    # Identity body (strip YAML frontmatter)
    cat "$role_dir/IDENTITY.md" | strip_frontmatter | apply_tokens claude
    echo ""
    echo "## Non-Negotiables"
    echo ""
    # Shared non-negotiables (skip the heading line)
    tail -n +3 "$ROOT_DIR/shared/SOUL.md" | apply_tokens claude
    echo ""
    # Role-specific non-negotiables (skip heading)
    tail -n +3 "$role_dir/SOUL.md" | apply_tokens claude
    echo ""
    # Role-specific responsibilities
    cat "$role_dir/ROLE.md" | apply_tokens claude
    echo ""
    # Tools policy
    cat "$ROOT_DIR/shared/TOOLS.md" | apply_tokens claude
    echo ""
    # Bootstrap
    cat "$role_dir/BOOTSTRAP.md" | apply_tokens claude
    echo ""
    # Heartbeat
    cat "$role_dir/HEARTBEAT.md" | apply_tokens claude
  } > "$out_dir/agent.md"

  echo "  agent: $claude_name"
done

# ── Generate skill files ──────────────────────────────────────────────────────

for skill in propose plan-change design-arch implement test-verify deploy-gcp review-code handoff openspec-change design-ui; do
  out_dir="$TARGET_DIR/.claude/skills/$skill"
  mkdir -p "$out_dir"
  # design-ui lives in shared/skills/, all others in workflows/
  if [ "$skill" = "design-ui" ]; then
    workflow_file="$ROOT_DIR/shared/skills/ui-design/SKILL.md"
  else
    workflow_file="$ROOT_DIR/workflows/$skill/WORKFLOW.md"
  fi
  desc="$(get_skill_desc "$skill")"

  {
    echo "---"
    echo "name: $skill"
    echo "description: $desc"
    echo "---"
    echo ""
    cat "$workflow_file" | strip_frontmatter | apply_tokens claude
  } > "$out_dir/SKILL.md"

  echo "  skill: $skill"
done

# ── Generate command files ────────────────────────────────────────────────────

for cmd in team-status delegate; do
  cat "$ROOT_DIR/commands/$cmd.md" | apply_tokens claude > "$TARGET_DIR/.claude/commands/$cmd.md"
  echo "  command: $cmd"
done

# ── Generate CLAUDE.md ────────────────────────────────────────────────────────

{
  cat << 'HEADER'
# Dev Team Agents for Claude Code

## Team Structure

This project uses a multi-agent development team. Each agent has a specific role and can be invoked via `@agent-name` or used automatically by Claude when delegating work.

### Available Agents
HEADER

  for role in cto manager po tech-lead staff-fullstack sr-fullstack mobile qa devops; do
    claude_name="$(get_claude_name "$role")"
    desc=$(grep "^Mission:" "$ROOT_DIR/roles/$role/IDENTITY.md" | sed 's/^Mission: //')
    echo "- \`@${claude_name}\` — ${desc}"
  done

  cat << 'BODY'

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
BODY
} > "$TARGET_DIR/CLAUDE.md"

echo "  CLAUDE.md"
echo ""
echo "Done. Output in: $TARGET_DIR"
echo ""
echo "To install into a project:"
echo "  cp -r $TARGET_DIR/.claude /path/to/your-project/"
echo "  cp $TARGET_DIR/CLAUDE.md /path/to/your-project/"
