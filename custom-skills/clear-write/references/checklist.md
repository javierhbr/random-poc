# Checklist before delivering

Run these in order. Fix any failure, then rerun the count.

## 1. Count (always)

```bash
python3 scripts/count_chars.py draft.md --length 3 --intent propose
# or: --chars 5000
```

- Body ≤ limit. Script exits with an error if not.
- TL;DR ≤ its cap (3 pages: 300; 10 pages: 500). No TL;DR on 1 page.
- Section counts near their targets (±20% is fine if the total holds).
- If over: cut in the order given in `budgets.md`, then recount.

If code can't run, estimate: about 6 characters per word including spaces, and stay at least 10% under.

## 2. Structure

- [ ] Sections in template order for the intent (`templates.md`).
- [ ] Title states the conclusion, not the topic.
- [ ] Conclusion is 1–2 sentences and states a result.
- [ ] Propose: risk of not doing it is present and concrete.
- [ ] Propose: next step says what, who and when (or `[owner]`, `[date]`).
- [ ] Inform/explain: key takeaway adds something new; it isn't a recap.
- [ ] 3/10 pages: explanation headings state their point; no "Background" or "Analysis".

## 3. Reading tests

- [ ] **First paragraph test:** a reader who stops after it knows the answer.
- [ ] **First lines test:** reading only the first sentence of every paragraph gives the whole argument.
- [ ] **Cut test:** delete each sentence in your head. If nothing is lost, delete it for real.
- [ ] **Read-aloud test:** rewrite any sentence you'd trip on.
- [ ] **Audience test:** would this reader understand every term without looking it up?

## 4. Accuracy

- [ ] No invented facts, figures, names or sources.
- [ ] Every gap marked `[needs: …]` and listed after the footer.
- [ ] Numbers are consistent everywhere they appear (TL;DR, conclusion, body).

## 5. Delivery

- [ ] Footer line present: settings · used / limit · TL;DR used / cap.
- [ ] Mismatch warning, if any, is one line above the title.
- [ ] If the body is under about 60% of the limit, mention it in the reply.

## Common failures and fixes

| Failure | Fix |
|---|---|
| Over the limit by a lot | Remove the weakest point whole instead of trimming every point |
| Conclusion reads as a topic | Ask "so what is the answer?" and write that sentence |
| Why it matters lists five things | Keep the one this audience cares about most |
| Takeaway repeats the conclusion | Write what the reader should do or remember because of it |
| Paragraph starts with context | Move its last sentence (usually the point) to the front |
| TL;DR over cap | Drop the second clause of each sentence; keep result, reason, next |
