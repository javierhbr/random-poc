#!/usr/bin/env bash
# generate-instructions.sh — Generate INSTRUCTIONS.md (all-in-one reference)
#
# Usage:
#   ./adapters/generate-instructions.sh [OUTPUT_FILE]
#
# If OUTPUT_FILE is omitted, writes to ./INSTRUCTIONS.md in the repo root.
# Compatible with bash 3+ (macOS default).
#
# This produces a single portable markdown file containing all team instructions,
# roles, workflows, and commands. Drop it into any project or AI tool as-is —
# no scripts required.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_FILE="${1:-$ROOT_DIR/INSTRUCTIONS.md}"

source "$SCRIPT_DIR/lib/tokens.sh"

echo "Generating INSTRUCTIONS.md -> $OUTPUT_FILE"

{
  # ── Header ──────────────────────────────────────────────────────────────────
  cat << 'HEADER'
# Dev Team Agents — Complete Instructions

> **Auto-generated.** Do not edit directly.
> Regenerate with: `./adapters/generate-instructions.sh`
>
> For Claude Code native integration (agents + slash commands), use:
> `./adapters/generate-claude.sh /path/to/project`

This file contains the full instructions for a virtual software development team
following the OpenSpec change workflow. Drop this file into any AI coding tool
as your project instructions file.

---

## Team Mode Protocol

When handling any task:

1. **Identify the role** using the routing table below
2. **Announce your role**: "Acting as [Role Name]"
3. **Load context** following the 3-layer protocol
4. **Follow that role's instructions** and non-negotiables
5. **Produce the role's expected output** (proposal, design, code, verification, etc.)
6. **Perform a handoff** — document state and next steps in `handoff.md`

---

## Team Roster

HEADER

  for role in cto manager po tech-lead staff-fullstack sr-fullstack mobile qa devops; do
    role_dir="$ROOT_DIR/roles/$role"
    name=$(grep "^name:" "$role_dir/IDENTITY.md" | sed 's/^name: //' | tr -d '"')
    mission=$(grep "^Mission:" "$role_dir/IDENTITY.md" | sed 's/^Mission: //')
    focus=$(grep "^Primary focus:" "$role_dir/IDENTITY.md" | sed 's/^Primary focus: //')
    echo "- **$name** — $mission"
  done
  echo ""
  echo "---"
  echo ""

  # ── Routing table ─────────────────────────────────────────────────────────────
  cat << 'ROUTING'
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

ROUTING

  # ── Non-negotiables ───────────────────────────────────────────────────────────
  echo "## Non-Negotiables (All Roles)"
  echo ""
  tail -n +3 "$ROOT_DIR/shared/SOUL.md" | apply_tokens codex
  echo ""
  echo "---"
  echo ""

  # ── Context protocol ──────────────────────────────────────────────────────────
  cat "$ROOT_DIR/shared/CONTEXT_PROTOCOL.md" | apply_tokens codex
  echo ""
  cat "$ROOT_DIR/shared/PROJECT_MAP_GUIDE.md" | apply_tokens codex
  echo ""
  cat "$ROOT_DIR/shared/WORKTREE_POLICY.md" | apply_tokens codex
  echo ""
  cat "$ROOT_DIR/shared/HANDOFF_FORMAT.md" | apply_tokens codex
  echo ""
  cat "$ROOT_DIR/shared/USER.md" | apply_tokens codex
  echo ""
  echo "---"
  echo ""

  # ── Role definitions ──────────────────────────────────────────────────────────
  echo "## Role Definitions"
  echo ""
  for role in cto manager po tech-lead staff-fullstack sr-fullstack mobile qa devops; do
    role_dir="$ROOT_DIR/roles/$role"
    name=$(grep "^name:" "$role_dir/IDENTITY.md" | sed 's/^name: //' | tr -d '"')
    mission=$(grep "^Mission:" "$role_dir/IDENTITY.md" | sed 's/^Mission: //')
    focus=$(grep "^Primary focus:" "$role_dir/IDENTITY.md" | sed 's/^Primary focus: //')

    echo "### $name"
    echo ""
    echo "**Mission:** $mission"
    echo ""
    echo "**Focus:** $focus"
    echo ""

    # Role responsibilities
    cat "$role_dir/ROLE.md" | apply_tokens codex
    echo ""

    # Role-specific non-negotiables
    tail -n +3 "$role_dir/SOUL.md" | apply_tokens codex
    echo ""

    # Bootstrap
    cat "$role_dir/BOOTSTRAP.md" | apply_tokens codex
    echo ""

    # Heartbeat
    cat "$role_dir/HEARTBEAT.md" | apply_tokens codex
    echo ""

    echo "---"
    echo ""
  done

  # ── Workflows ─────────────────────────────────────────────────────────────────
  echo "## Workflows"
  echo ""
  echo "Invoke workflows by name. Example: \"Follow the Propose workflow for this feature.\""
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

  # ── Commands ─────────────────────────────────────────────────────────────────
  echo "## Commands"
  echo ""
  echo "### team-status"
  cat "$ROOT_DIR/commands/team-status.md" | apply_tokens codex
  echo ""
  echo "### delegate"
  cat "$ROOT_DIR/commands/delegate.md" | apply_tokens codex
  echo ""
  echo "---"
  echo ""

  # ── Shared skills TOC ─────────────────────────────────────────────────────────
  cat << 'SKILLS_TOC'
## Shared Operational Skills

The following operational skills are available in `shared/skills/`. Reference them by name:

- **handoff-standard** — Structured handoff procedure with 3-layer context loading
- **openspec-sdd** — OpenSpec software design document format
- **project-bootstrap** — First-run session bootstrap procedure
- **project-map-reader** — How to read and use project-map.yaml
- **monorepo-navigation** — Navigating the monorepo package structure
- **git-worktree-discipline** — Git worktree management rules
- **self-learning-loop** — Recording and applying lessons learned
- **mc-task-poll** — Mission Control task polling procedure
- **ui-design** — Premium UI design for frontend work (anti-slop, typography, motion, layout). Used by Staff Fullstack and Sr. Fullstack developers.
SKILLS_TOC

} > "$OUTPUT_FILE"

lines=$(wc -l < "$OUTPUT_FILE")
echo "Done. $lines lines written to: $OUTPUT_FILE"
