# Signal Patterns Reference

Detailed heuristics for analyzing conversation signals during a reflect session.

---

## Table of Contents

1. [Corrections (HIGH confidence)](#corrections)
2. [Successes (MEDIUM confidence)](#successes)
3. [Edge Cases (MEDIUM confidence)](#edge-cases)
4. [Preferences (accumulate)](#preferences)
5. [Example Reflection Session](#example-reflection-session)
6. [Terminal Formatting](#terminal-formatting)

---

## Corrections

**Confidence: HIGH** — These directly indicate something the skill got wrong or missed.

### Detection Patterns

- User said "no", "not like that", "I meant...", "that's wrong", "change this"
- User explicitly corrected output (provided replacement text or instructions)
- User asked for changes immediately after generation (within the same turn)
- User undid or reverted something the skill produced
- User expressed frustration with a specific output pattern

### What to Extract

Turn each correction into a specific, actionable constraint. Prefer the form:
"Never do X" or "Always do Y instead of Z."

**Example**: User said "no gradients, I hate gradients on buttons"  
→ Proposed constraint: `NEVER: Use gradients on interactive elements unless explicitly requested`

**Example**: User rewrote a function to use async/await instead of callbacks  
→ Proposed constraint: `ALWAYS: Prefer async/await over callback patterns`

---

## Successes

**Confidence: MEDIUM** — These validate that the skill's existing patterns work well.

### Detection Patterns

- User said "perfect", "great", "yes", "exactly", "love it", "that's it"
- User accepted output without any modification
- User built on top of the output (added to it rather than replacing it)
- User moved on to the next task without revisiting the output
- User explicitly praised a specific aspect

### What to Extract

Successes don't always produce changes — they confirm existing patterns. Extract 
a success signal only when:

- The success validates a pattern that isn't explicitly documented in the skill
- The success reveals a preference worth codifying
- The user's enthusiasm suggests a best practice to highlight

**Example**: User said "great, I love that you used CSS Grid here"  
→ Proposed preference: `Layout: Prefer CSS Grid for card and gallery layouts`

---

## Edge Cases

**Confidence: MEDIUM** — These reveal gaps in skill coverage.

### Detection Patterns

- User asked a question the skill didn't anticipate
- A scenario required a workaround or manual intervention
- User requested a feature/pattern not covered by the skill
- The skill produced output that needed significant adaptation for the use case
- User said "what about...", "how do I handle...", "what if..."

### What to Extract

Turn each edge case into expanded coverage. Determine whether the gap belongs as:

- A new section or subsection in the skill
- An additional example or pattern
- A conditional rule ("When X, do Y instead of Z")

**Example**: User asked how to handle RTL (right-to-left) layouts, skill had no guidance  
→ Proposed addition: New section on RTL support with specific patterns

**Example**: User needed to output SVG but skill only covered HTML/React  
→ Proposed addition: Expand output format coverage to include SVG generation

---

## Preferences

**Confidence: Accumulates over sessions** — Individual signals are low confidence, 
but patterns across sessions become reliable.

### Detection Patterns

- User consistently chooses the same option when given alternatives
- User's corrections follow a pattern (e.g., always preferring shorter variable names)
- Style preferences shown implicitly through edits
- Tool or framework preferences (always picks Tailwind over plain CSS)
- Naming conventions used consistently

### What to Extract

Only propose a preference change when you see the pattern repeated across the current 
session or when combined with observations from `OBSERVATIONS.md`. Single-instance 
preferences should be saved as observations, not applied immediately.

**Example**: User chose dark backgrounds in 3 out of 3 components this session  
→ Proposed preference: `Theme: Default to dark background (#000) unless specified`

**Example**: User used "handle" prefix for all event handlers once  
→ Save as observation, not a proposed change (insufficient evidence)

---

## Example Reflection Session

User ran `/reflect frontend-design` after a UI-building session where:
- They corrected gradient usage twice (corrections)
- They praised a CSS Grid card layout (success)
- They asked about dark mode that wasn't covered (edge case)
- They chose `#000` over `#1a1a1a` for dark backgrounds (preference, seen before)

```
┌─ Skill Reflection: frontend-design ───────────────────────┐
│                                                           │
│ Signals: 2 corrections, 3 successes, 1 edge case         │
│                                                           │
│ Proposed changes:                                         │
│                                                           │
│ [HIGH] + Constraints/NEVER:                               │
│         "Use gradients unless explicitly requested"       │
│                                                           │
│ [HIGH] + Color & Theme:                                   │
│         "Dark backgrounds: use #000, not #1a1a1a"         │
│                                                           │
│ [MED]  + Layout:                                          │
│         "Prefer CSS Grid for card layouts"                │
│                                                           │
│ [LOW]  ~ Note: User asked about dark mode toggle —        │
│         consider adding dark mode guidance section         │
│                                                           │
│ Commit: "frontend-design: no gradients, #000 dark bg"     │
└───────────────────────────────────────────────────────────┘

Apply these changes? [Y/n] or describe tweaks
```

User responds "Y" → skill reads the file, applies edits, commits, and pushes.

User responds "change the dark bg one to #0a0a0a instead" → adjusts the proposed 
change and re-presents for approval.

---

## Terminal Formatting

When outputting reflection summaries in terminal environments, use accessible 
colors that meet WCAG AA 4.5:1 contrast ratio:

| Priority | ANSI Code | Color | Contrast on Dark BG |
|----------|-----------|-------|---------------------|
| HIGH | `\033[1;31m` | Bold Red (#FF6B6B) | 4.5:1 |
| MED | `\033[1;33m` | Bold Yellow (#FFE066) | 4.8:1 |
| LOW | `\033[1;36m` | Bold Cyan (#6BC5FF) | 4.6:1 |
| Reset | `\033[0m` | — | — |

Avoid: pure red (#FF0000) on black backgrounds, green on red combinations 
(inaccessible to colorblind users).

In non-terminal environments (chat interfaces, web UIs), use the priority labels 
`[HIGH]`, `[MED]`, `[LOW]` without color codes — the box-drawing format provides 
sufficient visual structure.
