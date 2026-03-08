---
name: reflect
description: >
  Analyze the current session and propose improvements to skills based on what worked,
  what failed, and edge cases discovered. Use this skill whenever the user says "reflect",
  "improve skill", "learn from this", "what did we learn", "update the skill", or asks to
  capture learnings from a session. Also trigger at the end of any skill-heavy session when
  the user wants to iterate on skill quality, after corrections were made during a workflow,
  or when the user references improving their development process. Trigger even if the user
  just says "let's reflect" without naming a specific skill — the workflow will ask.
---

# Reflect Skill

Analyze the current conversation to extract learnings and propose concrete improvements 
to a skill file. The goal is continuous skill refinement: corrections become constraints, 
successes validate patterns, and edge cases become new coverage.

## Prerequisites

- Skills live in `~/.claude/skills/[skill-name]/SKILL.md`
- The skills directory should be a git repo with a remote origin
- This skill has permission to read/edit skill files and run git commands (with user approval)

---

## Workflow

### Step 1: Identify the Target Skill

If the user ran `/reflect [skill-name]`, use that skill. Otherwise ask which skill 
to analyze this session for. List skills found in `~/.claude/skills/` as options.

### Step 2: Analyze the Conversation

Scan the full conversation for four signal types. Read `references/signal-patterns.md` 
for detailed detection heuristics and examples.

| Signal Type | Confidence | What to Look For |
|-------------|-----------|-----------------|
| **Corrections** | HIGH | User rejected output, said "no", "not like that", explicitly corrected |
| **Successes** | MEDIUM | User accepted output, said "perfect", "great", built on top of it |
| **Edge Cases** | MEDIUM | Unanticipated questions, workarounds needed, uncovered features |
| **Preferences** | Accumulate | Repeated user choices, implicit style/tool/framework preferences |

### Step 3: Propose Changes

Present findings in a structured summary. Each proposed change gets a priority level:

- **HIGH** (from corrections): Add as constraint or rule in the skill
- **MED** (from successes/edge cases): Add as preference or expanded coverage
- **LOW** (from observations): Note for future review

Format the proposal clearly:

```
┌─ Skill Reflection: [skill-name] ──────────────────────────┐
│                                                           │
│ Signals: X corrections, Y successes                       │
│                                                           │
│ Proposed changes:                                         │
│                                                           │
│ [HIGH] + Add constraint: "[specific constraint]"          │
│ [MED]  + Add preference: "[specific preference]"          │
│ [LOW]  ~ Note for review: "[observation]"                 │
│                                                           │
│ Commit: "[skill]: [summary of changes]"                   │
└───────────────────────────────────────────────────────────┘

Apply these changes? [Y/n] or describe tweaks
```

Always show the exact text that will be added or modified before applying anything. 
Never modify skills without explicit user approval.

### Step 4: Apply Changes (if approved)

1. Read the current skill file from `~/.claude/skills/[skill-name]/SKILL.md`
2. Apply the changes using the Edit tool — insert new constraints, preferences, 
   or coverage into the appropriate section of the skill
3. Commit and push:

```bash
cd ~/.claude/skills
git add [skill-name]/SKILL.md
git commit -m "[skill-name]: [concise change summary]"
git push origin main
```

4. Confirm: "Skill updated and pushed."

### Step 5: Handle Decline

If the user declines, ask: "Save these observations for later review?"

If yes, append findings to `~/.claude/skills/[skill-name]/OBSERVATIONS.md` with 
a timestamp header. This file accumulates observations across sessions for periodic review.

---

## Important Rules

- Always show exact changes before applying — no surprise edits
- Never modify a skill file without explicit "yes" or approval from the user
- Commit messages should be concise: `"[skill-name]: [what changed]"`
- Push only after a successful commit
- If the skill file structure is unfamiliar, read it fully before proposing edits
- Proposed changes should be specific and actionable, not vague suggestions

---

## Reference Files

| File | When to Read |
|------|-------------|
| `references/signal-patterns.md` | Need detailed heuristics for analyzing conversation signals, examples of each signal type, or guidance on edge case detection |
