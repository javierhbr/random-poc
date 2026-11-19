# Writing rules

## Contents
1. The principle
2. Paragraphs
3. Sentences
4. Words
5. Numbers and examples
6. Lists vs sentences
7. Before and after

## 1. The principle

Busy readers read the first line of each paragraph and move on. Write so that those first lines alone carry the whole argument, and everything after them is support. Simple is not the same as shallow: the goal is the simplest wording that stays accurate.

## 2. Paragraphs

- **One idea per paragraph, stated in the first sentence.** The rest supports it with a fact, an example or a consequence.
- **3–5 sentences is plenty.** A longer paragraph usually holds two ideas; split it.
- **Say it once.** Don't restate a point in the next paragraph or summarise a section at its end. The TL;DR may echo the conclusion; nothing else repeats.
- **Link ideas explicitly.** "Because", "so", "but" and "which means" show the reasoning. Without them, the reader has to guess how points connect.

## 3. Sentences

- **Aim under 20 words.** Vary length, but a sentence over 30 words almost always hides two sentences.
- **Active voice.** "The team cut costs", not "Costs were cut by the team". Active voice names who acts, which readers need.
- **Subject and verb early.** "Support tickets fell 18% after the redesign", not "After the redesign, which launched in May following months of research, support tickets fell 18%."
- **No throat-clearing openers.** Cut "It's important to note that", "In today's fast-paced world", "When it comes to", "It goes without saying". Start with the content.
- **No empty closers.** Cut final lines like "Ultimately, the choice is ours" or "The future is bright". End on the last useful fact or the next step.

## 4. Words

- **Everyday words.** "Use" not "utilise", "help" not "facilitate", "start" not "commence", "about" not "approximately".
- **Define each term once,** at first use, in plain words. A technical audience can skip standard terms of their field.
- **Expand acronyms once,** unless the audience uses them daily.
- **Symptom words mark missing facts.** When you see one, ask what you actually mean and write that.

| Symptom word | Ask instead |
|---|---|
| significant, substantial, huge | How much? Give the number. |
| robust, scalable, seamless | Robust against what? Scales to how many? Seamless meaning which steps disappear? |
| leverage, utilise | Use, for what? |
| crucial, critical, key, vital | What breaks without it? |
| optimise, enhance, improve | From what to what? |
| various, numerous, a range of | Which ones? How many? |
| innovative, cutting-edge, best-in-class | Name the actual difference. |
| potentially, could possibly, might perhaps | Pick one hedge, or state the condition ("if X, then Y"). |

These are symptoms, not bans. A word stays if it's the most accurate one.

## 5. Numbers and examples

- **One concrete example or number for each abstract claim.** "Releases are slow" becomes "Each release waits about 3 hours for tests."
- **Numbers beat adjectives.** "$150K a year" beats "major savings".
- **Round for readability.** "About $150K" not "$148,732", unless precision matters to the decision.
- **Compare to something the reader knows.** "Half an engineer's time" is clearer than "0.5 FTE" for a general audience.
- **Never invent a number.** Write `[needs: annual cost]` and list it under the footer.

## 6. Lists vs sentences

Use a list when items are parallel and independent: options, steps, criteria, ingredients. Keep reasoning in sentences, because the logic lives in the connecting words.

- List ✓: "Three teams are affected: billing, support and onboarding."
- List ✗: splitting "We chose API tests because they're faster to write, so coverage grows, which means fewer escaped bugs" into three bullets loses "because", "so" and "which means".

Bold lead-ins on every bullet are noise. Use them only when a reader needs to scan labels.

## 7. Before and after

| Problem | Before | After |
|---|---|---|
| Topic, not result | "This page covers our testing options." | "Switch to API testing: new tests take hours instead of days." |
| Label heading | "Background" | "Studio tests now need two full-time engineers" |
| Padding | "It is important to note that the migration could potentially lead to significant savings." | "The migration saves about $150K a year." |
| Buried point | "After reviewing several options over three months and consulting four teams, we believe API testing is best." | "API testing is the best option. We compared four approaches over three months with four teams." |
| Vague risk | "Delay could impact our competitiveness." | "Delay past March locks us into a 3-year, $120K licence." |
| Passive, no actor | "Mistakes were made in the rollout." | "We shipped without a rollback plan." |
| Recap as takeaway | "In summary, we discussed costs, speed and risk." | "Fix the slowest tests first; they cause 80% of the wait." |
| Hedge stack | "This might potentially help to somewhat reduce delays." | "This should cut delays by about half." |
