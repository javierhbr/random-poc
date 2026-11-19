---
name: clear-write
description: Write simple, clear, conclusion-first content on any topic within a hard limit: 1 page (3,000 chars), 3 pages (9,000), 10 pages (30,000) or custom. Use for one-pagers, briefs, explainers, proposals, or anything wanted short and to the point.
---

# Clear Write

Write content that works for a reader with 30 seconds, 5 minutes or an hour. Every document puts the answer first, then why it matters, then the reasoning, so a reader can stop at any point and still leave with the answer. Each length has a hard character limit: shorter is fine, longer is not.

## Core rules (always apply)

1. **Answer first.** Conclusion → why it matters → reasoning → what's next. A reader can stop anywhere.
2. **Hard limit.** 1 page = 3,000 characters, 3 pages = 9,000, 10 pages = 30,000, custom = any number up to 30,000. Spaces count. Coming in under is fine; going over never is. Never pad.
3. **TL;DR only on 3 and 10 pages.** 2–3 sentences, max 300 / 500 characters, not counted in the limit.
4. **Risk of not doing it only in proposals.** It must name a concrete cost, deadline or loss.
5. **Every section and paragraph opens with its point.** Busy readers read first lines and stop.
6. **Never invent facts, figures or sources.** Mark gaps as `[needs: …]`.
7. **Settings change wording, never structure.** Intent, audience, detail and tone never change the order, the limits or the writing rules.

## Settings

| Setting | Options | Default |
|---|---|---|
| Length | 1 · 3 · 10 pages, or custom chars (max 30,000) | 1 page |
| Intent | inform · explain · propose | inform |
| Audience | executive · manager · technical · general | general |
| Detail | overview · standard · deep | standard |
| Tone | formal · neutral · conversational | neutral |

Infer unset settings from the request; don't stop to ask. The footer shows what you chose so the user can correct it. Ask only when the topic is too vague to state a conclusion.

Optional command form:
`/clear-write "<topic>" --length 1|3|10 --chars N --intent … --audience … --detail … --tone …`

## Workflow

1. **Settle settings.** Inference cues, audience profiles and mismatch warnings: `references/settings.md`.
2. **Gather material.** Use what the user gave. Research if the topic needs current facts and tools allow it.
3. **Write the conclusion as one sentence first.** It states a result, not a topic. If you can't write it, gather more or ask.
4. **Pick template and budget.** Section order and content: `references/templates.md`. Character budgets, points per length, custom scaling: `references/budgets.md`.
5. **Outline.** Point-stating headings (3 and 10 pages); paragraph plan (1 page).
6. **Draft** in template order, following `references/writing-rules.md`.
7. **Count and cut.** Save the draft and run `python3 scripts/count_chars.py <file> --length 1|3|10 --intent <intent>` (or `--chars N`). Cut in the order given in `references/budgets.md` until it passes.
8. **Check** against `references/checklist.md`.
9. **Deliver** with the footer line: settings · characters used / limit · TL;DR count. List any `[needs: …]` gaps after it.

## Reference map

| File | Read when |
|---|---|
| `references/templates.md` | Every time: section order, what each section holds, output shapes |
| `references/budgets.md` | Every time: section budgets, points per length, custom `--chars`, cutting order |
| `references/settings.md` | When settings are unset, unusual or conflict |
| `references/writing-rules.md` | While drafting and cutting |
| `references/checklist.md` | Before delivering |
| `references/examples.md` | First use, or when unsure what good output looks like |
| `scripts/count_chars.py` | Every time, to count. If code can't run, estimate and stay 10% under |

Paths are relative to this skill's folder.
