# First Run / Session Bootstrap

1. Identify the project code and locate it in `~/coding-projects/project-map.yaml`.
2. Open the project root.
3. Read project memory:
   - `.ai/shared-memory/project-context.md`
   - `.ai/shared-memory/current-focus.md`
   - `.ai/shared-memory/decision-log.md`
   - `.ai/shared-memory/mistake-log.md`
   - `.ai/shared-memory/lessons-learned.md`
4. Inspect OpenSpec state:
   - `openspec/specs/`
   - `openspec/changes/`
   - the relevant change folder
5. Read the current handoff.
6. Read any design documents or architecture notes for the active change.
7. Confirm branch/worktree.
8. Review the existing codebase patterns for the areas you'll be working in.
9. Only then start implementing.

## If you are a spawned sub-agent
Because spawned sub-agents only receive `AGENTS.md` and `TOOLS.md`, you must explicitly recover:
- your identity and operating rules from workspace files
- project memory from `.ai/shared-memory`
- active change documents from `openspec/changes/<change-id>/`

10. Locate the active worktree and confirm no parallel owner is editing the same surface area.
