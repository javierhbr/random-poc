#!/usr/bin/env bash
# generate-codex.sh — Generate Codex CLI compatible AGENTS.md and codex.yaml
#
# Usage:
#   ./adapters/generate-codex.sh [TARGET_DIR]
#
# If TARGET_DIR is omitted, outputs to ./out/codex/ relative to this script.
# Compatible with bash 3+ (macOS default).
#
# Strategy: Codex CLI is single-agent. Generates a Team Coordinator meta-prompt
# as AGENTS.md, using role-switching to simulate the full team.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="${1:-$ROOT_DIR/out/codex}"

source "$SCRIPT_DIR/lib/tokens.sh"

echo "Generating Codex CLI output -> $TARGET_DIR"
mkdir -p "$TARGET_DIR"

# ── Generate AGENTS.md ────────────────────────────────────────────────────────

{
  cat << 'HEADER'
# Dev Team Agents — OpenSpec Workflow System

This project uses a virtual software development team. When working on tasks,
adopt the appropriate team role based on the work required.

---

## Team Mode Protocol

When handling any task:

1. **Identify the role** using the routing table below
2. **Announce your role**: "Acting as [Role Name]"
3. **Load context** following the 3-layer protocol
4. **Follow that role's instructions** and non-negotiables
5. **Produce the role's expected output** (proposal, design, code, verification, etc.)
6. **Perform a handoff** when your phase is complete — switch to the next role

You can complete an entire workflow in one session by switching roles as needed.

---

## Routing Table

Use this to decide which role to adopt for each type of work:

| Situation | Adopt role |
|-----------|------------|
| Requirements unclear or missing | Product Owner |
| Create change folder and break down tasks | Dev Team Manager |
| Architecture decision or design.md needed | Technical Lead |
| Web, backend, API, DB, or UI implementation | Sr. Fullstack Developer |
| Architecture ownership, complex design, code review | Staff Fullstack Developer |
| Flutter/mobile implementation | Mobile Flutter Developer |
| Testing, verification, QA signoff | QA Engineer |
| GCP deployment, infrastructure, CI/CD | DevOps Engineer |
| Blocker escalation, cross-team issue | CTO (Guaripolo) |

---

## Non-Negotiables (All Roles)

These rules apply regardless of which role you are currently performing:

HEADER

  # Shared non-negotiables (skip heading)
  tail -n +3 "$ROOT_DIR/shared/SOUL.md" | apply_tokens codex
  echo ""
  echo "---"
  echo ""

  # 3-layer context protocol
  cat "$ROOT_DIR/shared/CONTEXT_PROTOCOL.md" | apply_tokens codex
  echo ""
  cat "$ROOT_DIR/shared/PROJECT_MAP_GUIDE.md" | apply_tokens codex
  echo ""
  cat "$ROOT_DIR/shared/HANDOFF_FORMAT.md" | apply_tokens codex
  echo ""
  echo "---"
  echo ""

  # Team roster
  echo "## Team Roles"
  echo ""
  for role in cto manager po tech-lead staff-fullstack sr-fullstack mobile qa devops; do
    role_dir="$ROOT_DIR/roles/$role"
    name=$(grep "^name:" "$role_dir/IDENTITY.md" | sed 's/^name: //' | tr -d '"')
    mission=$(grep "^Mission:" "$role_dir/IDENTITY.md" | sed 's/^Mission: //')
    echo "### $name"
    echo ""
    echo "**Mission:** $mission"
    echo ""
    # Role responsibilities
    cat "$role_dir/ROLE.md" | apply_tokens codex
    echo ""
    # Role-specific soul (delta)
    tail -n +3 "$role_dir/SOUL.md" | apply_tokens codex
    echo ""
    echo "---"
    echo ""
  done

  # Workflows
  echo "## Workflows"
  echo ""
  echo "Instead of slash commands, invoke workflows by describing them."
  echo "Example: \"Follow the Propose workflow for this feature.\""
  echo ""
  for wf in propose plan-change design-arch implement test-verify deploy-gcp review-code handoff openspec-change; do
    wf_file="$ROOT_DIR/workflows/$wf/WORKFLOW.md"
    desc=$(grep "^description:" "$wf_file" | sed 's/^description: //' | tr -d '"')
    echo "### Workflow: $wf"
    echo ""
    echo "> $desc"
    echo ""
    cat "$wf_file" | strip_frontmatter | apply_tokens codex
    echo ""
    echo "---"
    echo ""
  done

  # Commands
  echo "## Built-in Prompts"
  echo ""
  echo "### team-status"
  cat "$ROOT_DIR/commands/team-status.md" | apply_tokens codex
  echo ""
  echo "### delegate"
  cat "$ROOT_DIR/commands/delegate.md" | apply_tokens codex
  echo ""
  echo "---"
  echo ""

  # User preferences
  cat "$ROOT_DIR/shared/USER.md" | apply_tokens codex

} > "$TARGET_DIR/AGENTS.md"

echo "  AGENTS.md"

# ── Generate codex.yaml ───────────────────────────────────────────────────────

cat > "$TARGET_DIR/codex.yaml" << 'CODEX_YAML'
# Codex CLI configuration
# See: https://github.com/openai/codex

model: o4-mini          # Change to o3, o4-mini, or gpt-4o as needed
approval_mode: suggest  # suggest | auto-edit | full-auto

# The team instructions are in AGENTS.md at the project root.
# Codex reads this automatically.
CODEX_YAML

echo "  codex.yaml"
echo ""
echo "Done. Output in: $TARGET_DIR"
echo ""
echo "To install into a project:"
echo "  cp $TARGET_DIR/AGENTS.md /path/to/your-project/"
echo "  cp $TARGET_DIR/codex.yaml /path/to/your-project/"
echo ""
echo "Then run: codex"
