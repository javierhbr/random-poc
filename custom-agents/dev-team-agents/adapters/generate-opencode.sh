#!/usr/bin/env bash
# generate-opencode.sh — Generate OpenCode CLI compatible configuration
#
# Usage:
#   ./adapters/generate-opencode.sh [TARGET_DIR]
#
# If TARGET_DIR is omitted, outputs to ./out/opencode/ relative to this script.
# Compatible with bash 3+ (macOS default).
#
# Strategy: OpenCode is single-agent and multi-provider. Generates:
#   - .opencode/rules.md  — project rules (read by OpenCode)
#   - AGENTS.md           — same content at root (compatibility fallback)
#   - opencode.json       — provider and model configuration

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="${1:-$ROOT_DIR/out/opencode}"

source "$SCRIPT_DIR/lib/tokens.sh"

echo "Generating OpenCode CLI output -> $TARGET_DIR"
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/.opencode"

generate_instructions() {
  cat << 'HEADER'
# Dev Team Agents — OpenSpec Workflow System

This project uses a virtual software development team. When working on tasks,
adopt the appropriate team role based on the work required.

## Team Mode Protocol

When handling any task:

1. **Identify the role** using the routing table below
2. **Announce your role**: "Acting as [Role Name]"
3. **Load context** following the 3-layer protocol
4. **Follow that role's instructions** and non-negotiables
5. **Produce the expected output** (proposal, design, code, verification, etc.)
6. **Perform a handoff** — document state and next steps in handoff.md

---

## Routing Table

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

HEADER

  # Non-negotiables
  tail -n +3 "$ROOT_DIR/shared/SOUL.md" | apply_tokens opencode
  echo ""
  echo "---"
  echo ""

  # Context protocol
  cat "$ROOT_DIR/shared/CONTEXT_PROTOCOL.md" | apply_tokens opencode
  echo ""
  cat "$ROOT_DIR/shared/PROJECT_MAP_GUIDE.md" | apply_tokens opencode
  echo ""
  cat "$ROOT_DIR/shared/HANDOFF_FORMAT.md" | apply_tokens opencode
  echo ""
  echo "---"
  echo ""

  # Role summaries
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
    cat "$role_dir/ROLE.md" | apply_tokens opencode
    echo ""
    tail -n +3 "$role_dir/SOUL.md" | apply_tokens opencode
    echo ""
    echo "---"
    echo ""
  done

  # Workflows
  echo "## Workflows"
  echo ""
  for wf in propose plan-change design-arch implement test-verify deploy-gcp review-code handoff openspec-change; do
    wf_file="$ROOT_DIR/workflows/$wf/WORKFLOW.md"
    desc=$(grep "^description:" "$wf_file" | sed 's/^description: //' | tr -d '"')
    echo "### $wf"
    echo ""
    echo "> $desc"
    echo ""
    cat "$wf_file" | strip_frontmatter | apply_tokens opencode
    echo ""
    echo "---"
    echo ""
  done

  # Commands
  echo "## Built-in Prompts"
  echo ""
  echo "### team-status"
  cat "$ROOT_DIR/commands/team-status.md" | apply_tokens opencode
  echo ""
  echo "### delegate"
  cat "$ROOT_DIR/commands/delegate.md" | apply_tokens opencode
  echo ""
  echo "---"
  echo ""

  # User preferences
  cat "$ROOT_DIR/shared/USER.md" | apply_tokens opencode
}

# Write to .opencode/rules.md and AGENTS.md (same content)
generate_instructions > "$TARGET_DIR/.opencode/rules.md"
cp "$TARGET_DIR/.opencode/rules.md" "$TARGET_DIR/AGENTS.md"
echo "  .opencode/rules.md"
echo "  AGENTS.md"

# ── Generate opencode.json ────────────────────────────────────────────────────

cat > "$TARGET_DIR/opencode.json" << 'OPENCODE_JSON'
{
  "$schema": "https://opencode.ai/config.schema.json",
  "model": "anthropic/claude-sonnet-4-6",
  "instructions": ".opencode/rules.md",
  "providers": {
    "anthropic": {
      "models": ["claude-sonnet-4-6", "claude-opus-4-6"]
    },
    "openai": {
      "models": ["gpt-4o", "o4-mini"]
    }
  }
}
OPENCODE_JSON

echo "  opencode.json"
echo ""
echo "Done. Output in: $TARGET_DIR"
echo ""
echo "To install into a project:"
echo "  cp -r $TARGET_DIR/.opencode /path/to/your-project/"
echo "  cp $TARGET_DIR/AGENTS.md /path/to/your-project/"
echo "  cp $TARGET_DIR/opencode.json /path/to/your-project/"
echo ""
echo "Then run: opencode"
