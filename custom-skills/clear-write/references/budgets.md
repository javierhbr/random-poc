# Budgets

## Contents
1. How limits work
2. Section budgets
3. Points per length and detail
4. Custom `--chars`
5. Cutting order
6. Under the limit

## 1. How limits work

- Characters, spaces included, counted by `scripts/count_chars.py`.
- Counted: the body as delivered (title, headings, paragraphs, bullets, tables). Markdown markers (`#`, `*`, `_`, `` ` ``, `>`) are stripped first so formatting doesn't eat the budget.
- Not counted: the TL;DR (it has its own cap) and the footer.
- The total is a hard ceiling. Section budgets are targets that may flex about 20% as long as the total holds.
- Rough orientation: 3,000 characters ≈ 450–500 words ≈ one printed page.

## 2. Section budgets

### Inform / explain

| Length | Total | TL;DR (not counted) | Conclusion | Why it matters | Explanation | Key takeaway |
|---|---|---|---|---|---|---|
| 1 page | 3,000 | none | 300 | 600 | 1,800 | 300 |
| 3 pages | 9,000 | ≤300 | 500 | 1,500 | 6,000 | 1,000 |
| 10 pages | 30,000 | ≤500 | 1,500 | 4,000 | 22,000 | 2,500 |

### Propose

The risk section comes out of the rationale, so the total stays the same.

| Length | Total | TL;DR (not counted) | Conclusion | Why it matters | Risk | Rationale | Next step |
|---|---|---|---|---|---|---|---|
| 1 page | 3,000 | none | 300 | 600 | 300 | 1,500 | 300 |
| 3 pages | 9,000 | ≤300 | 500 | 1,500 | 1,000 | 5,000 | 1,000 |
| 10 pages | 30,000 | ≤500 | 1,500 | 4,000 | 3,000 | 19,000 | 2,500 |

Why the conclusion is small: it must be readable in seconds. Even on 10 pages, 1,500 characters is a short page, not a second document.

## 3. Points per length and detail

Length sets the space. Detail decides how to spend it: many short points, or few deep ones.

| Length | Overview | Standard | Deep |
|---|---|---|---|
| 1 page | 3 | 2–3 | 1–2 |
| 3 pages | 5 | 4 | 3 |
| 10 pages | 9–10 | 7–8 | 6 |

Per point, roughly:
- **Overview:** the point plus one supporting fact.
- **Standard:** the point, a fact or example, and what it means.
- **Deep:** the point, evidence, an example, the trade-off or limit, and what it means.

A longer document gets more points or more evidence per point, never more words for the same point.

## 4. Custom `--chars N`

1. Pick the template:
   - N ≤ 3,000 → 1-page template (no TL;DR)
   - N ≤ 9,000 → 3-page template (TL;DR ≤300)
   - N ≤ 30,000 → 10-page template (TL;DR ≤500)
   - N > 30,000 → don't write it (see below)
2. Scale every section by N ÷ template total, rounding down.
3. Scale the points range the same way, rounding to the nearest whole point (minimum 1).

Worked examples:

**`--chars 5000`, inform** → 3-page template, factor 5,000 ÷ 9,000 = 0.56
Conclusion 277 · Why it matters 833 · Explanation 3,333 · Key takeaway 555 · TL;DR ≤300 · about 2–3 points.

**`--chars 1500`, explain** → 1-page template, factor 0.5
Conclusion 150 · Why it matters 300 · Explanation 900 · Key takeaway 150 · no TL;DR · 1–2 points.

**`--chars 20000`, propose** → 10-page template, factor 0.67
Conclusion 1,000 · Why it matters 2,666 · Risk 2,000 · Rationale 12,666 · Next step 1,666 · TL;DR ≤500 · about 4–6 points.

**Over 30,000:** say the maximum is 30,000 and propose a split. Split by sub-question, each document with its own conclusion (for example: "1. Should we migrate? 2. How do we migrate? 3. What does it cost?"). Write the first one if the user agrees.

## 5. Cutting order

When the count is over the limit, cut in this order and recount after each pass:

1. **Filler, hedges, repetition**, anywhere: "it's important to note", "basically", "in order to", a sentence that restates the one before it.
2. **Extra examples.** Keep the single best example per point.
3. **The weakest point** in the explanation or rationale. Remove it whole rather than shaving every point thin.
4. **Why it matters**, trimmed to its strongest consequence.

Never cut to fit:
- the conclusion,
- the risk of not doing it (propose),
- the next step (propose).

If those three alone exceed the budget, the length is wrong for the topic: say so and suggest the next length up.

## 6. Under the limit

Under the limit is a good result. Never pad to reach it: added words make the document slower to read without making it more useful.

If the body is under about 60% of the limit, add one line to the reply (not the document): "This came in at 1,700 / 3,000; the topic may not need more, or I can add depth on [point]."
