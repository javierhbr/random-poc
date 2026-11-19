# Templates

## Contents
1. Section order by intent
2. What each section holds
3. Labels and headings
4. Output shapes (1, 3, 10 pages)
5. Footer

## 1. Section order by intent

The order is the same at every length. Only the space changes.

| Intent | Order |
|---|---|
| Inform | TL;DR → Conclusion → Why it matters → Explanation → Key takeaway |
| Explain | TL;DR → Conclusion → Why it matters → Explanation → Key takeaway |
| Propose | TL;DR → Conclusion → Why it matters → Risk of not doing it → Rationale → Next step |

The TL;DR appears only on 3- and 10-page documents (and on custom lengths that use those templates).

Why this order: each section answers the next question a reader asks. "What's the answer?" → "Why should I care?" → (proposals) "What if we don't?" → "Why is that right?" → "What now?" A reader who stops after any section has the most important thing they could get in that time.

## 2. What each section holds

### TL;DR (3 and 10 pages only)
- 2–3 plain sentences: the result, why it matters, and what's next (propose) or the key insight (inform/explain).
- Max 300 characters on 3 pages, 500 on 10 pages. Not counted in the document limit.
- Sentences, not bullets: bullets drop the "because" and "so" that link the ideas. Use bullets only when the points are truly independent.
- It may repeat the conclusion. That is its job.

Good: "Move regression tests to the API by Q3. It saves about $150K a year and cuts release waits from hours to minutes. Approve a two-week pilot now, before the March licence renewal."
Bad: "This document examines our testing approach and explores options for the future."

### Conclusion
The result in 1–2 sentences.
- Inform: the main finding ("Support tickets fell 18% after the redesign, mostly in billing.").
- Explain: the core idea ("Technical debt is the cost of shortcuts you pay back later.").
- Propose: the decision plus its main benefit, with a number if one exists ("Retire Studio and move to API tests; it saves about $150K a year.").

Test: if this were the only thing read, would the reader know the answer? A topic ("This covers X") fails.

### Why it matters
The consequence for this reader: what changes, what it costs, what it risks, who is affected. The focus depends on audience (see `settings.md`). One strong consequence beats four weak ones.

### Risk of not doing it (propose only)
What happens if the proposal is rejected or delayed. It must be concrete: a cost, a deadline, or what gets worse and by how much.
- Weak: "We risk falling behind competitors."
- Strong: "The licence renews in March for three years at $120K; renewing locks in today's costs until 2030."
If no concrete risk is known, write `[needs: cost or deadline of delay]` rather than inventing one.

### Explanation (inform/explain) / Rationale (propose)
The how and why, split into points.
- Each point opens with its own conclusion, then gives evidence, an example or a number.
- Order points by importance, not chronology. The strongest point comes first, because readers drop off.
- Propose: cover why this option, what it costs, and the main objection with its answer. Name the alternative you rejected and why, in one or two sentences.
- Inform: cover what happened, what caused it, what it affects.
- Explain: cover how it works, where it comes from, how to recognise it or use it.

### Key takeaway (inform/explain)
What to remember, or what it means for the reader. It must add something: an implication, a rule of thumb or a decision it informs. A recap of the points is not a takeaway.

### Next step (propose)
What, who, by when. One action is better than a list. Use `[owner]` and `[date]` when unknown.

## 3. Labels and headings

**1 page:** no headings. Short paragraphs in template order. A bold lead-in word or phrase is fine ("**Why it matters.**"). The first paragraph is the conclusion and needs no label.

**3 and 10 pages:**
- Label the frame sections so readers can jump: Conclusion, Why it matters, Risk of not doing it, Key takeaway / Next step.
- Give explanation/rationale subsections headings that state their point:
  - "API tests take hours to write, not days" ✓
  - "Background", "Analysis", "Considerations" ✗
- 10 pages may use one more level (###) inside a long point. Never deeper.

**Title:** states the conclusion in short form ("Move regression testing to API tests by Q3"), not the topic ("Testing strategy review").

## 4. Output shapes

### 1 page (any intent)
```
# [Title stating the conclusion]

[Conclusion paragraph: 1–2 sentences]

**Why it matters.** [paragraph]

**Risk of not doing it.** [1–2 sentences]          ← propose only

**[Point 1 lead-in].** [paragraph]
**[Point 2 lead-in].** [paragraph]
**[Point 3 lead-in].** [paragraph]                  ← optional

**Key takeaway.** / **Next step.** [1–2 sentences]

---
[footer]
```

### 3 pages
```
# [Title stating the conclusion]

**TL;DR:** [2–3 sentences, ≤300 chars]

## Conclusion
## Why it matters
## Risk of not doing it                             ← propose only
## [Point heading stating its conclusion]           ← 3–5 points
## Key takeaway / Next step

---
[footer]
```

### 10 pages
```
# [Title stating the conclusion]

**TL;DR:** [2–3 sentences, ≤500 chars]

## Conclusion                                       ← may run to a short page
## Why it matters
## Risk of not doing it                             ← propose only
## [Point heading stating its conclusion]           ← 6–10 points
### [Sub-point, only if a point is long]
## Key takeaway / Next step

---
[footer]
```

## 5. Footer

One line after a `---` rule:

```
[Intent] · [Audience] · [Detail] · [Tone] · [used] / [limit] characters · TL;DR [used] / [cap]
```

Example: `Propose · Executive · Overview · Neutral · 8,420 / 9,000 characters · TL;DR 260 / 300`

- Omit the TL;DR part on 1 page.
- If there are gaps, add a second line: `Gaps: [needs: Q3 cost figure], [needs: owner]`.
- If a mismatch warning applied (see `settings.md`), put it as one line above the title, not in the footer.
