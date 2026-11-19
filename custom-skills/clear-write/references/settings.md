# Settings

## Contents
1. Inferring settings
2. Intent
3. Audience
4. Detail
5. Tone
6. Mismatches

Settings change wording and emphasis. They never change the order, the limits or the writing rules.

## 1. Inferring settings

Use the user's words first, then context. Don't stop to ask; the footer shows what you chose.

| The user says or implies | Setting |
|---|---|
| "one-pager", "a page", "brief", "short" | Length 1 |
| "a few pages", "short report", "memo" | Length 3 |
| "full write-up", "detailed report", "white paper" | Length 10 |
| a word or character count | Custom `--chars` (words × 6 ≈ characters) |
| "should we", "pitch", "recommend", "get approval", "business case", "convince" | Intent propose |
| "explain", "how does", "what is", "teach", "help them understand" | Intent explain |
| "update", "status", "what happened", "findings", "summary of" | Intent inform |
| "leadership", "the board", "VP", "C-level", "decision makers" | Audience executive |
| "my team lead", "managers", "stakeholders", "PMO" | Audience manager |
| "engineers", "developers", "architects", "specialists" | Audience technical |
| "customers", "everyone", "new hires", "non-technical" | Audience general |
| "high level", "quick", "just the gist" | Detail overview |
| "in depth", "thorough", "with evidence", "deep dive" | Detail deep |
| "official", "for the board", "external", "policy" | Tone formal |
| "for the team", "Slack", "internal blog", "friendly" | Tone conversational |

If nothing points anywhere, use the defaults: 1 page, inform, general, standard, neutral.

## 2. Intent

| Intent | Conclusion states | Explanation covers | Ends with |
|---|---|---|---|
| Inform | The main finding or status | What happened, what caused it, what it affects | Key takeaway |
| Explain | The core idea in one sentence | How it works, where it comes from, how to recognise or use it | Key takeaway |
| Propose | The decision and its main benefit | Why this option, what it costs, the main objection and its answer, the rejected alternative | Next step (what, who, when) |

Only propose adds the "Risk of not doing it" section.

## 3. Audience

| Audience | What they ask | Why it matters focuses on | Wording | Avoid |
|---|---|---|---|---|
| Executive | "What do you need from me, and what's it worth?" | Money, risk, time, the decision | Numbers first, no jargon, short paragraphs | Process detail, tool names, history |
| Manager | "What does this mean for my team and timeline?" | Teams, process, timeline, dependencies | Light terminology, concrete owners and dates | Deep technical internals |
| Technical | "How does it work, and what are the trade-offs?" | Mechanism, trade-offs, limits, failure modes | Precise terms, no hand-holding | Simplifying until it's wrong, marketing language |
| General | "What is this, and does it affect me?" | Everyday impact | Plain words, every term defined, analogies welcome | Acronyms, insider references |

Mixed audience: write the conclusion, why it matters and TL;DR for the least technical reader, and put technical depth in the explanation, where specialists will look for it.

## 4. Detail

| Detail | Points | Each point carries |
|---|---|---|
| Overview | Upper end of the range | The point plus one supporting fact |
| Standard | Middle of the range | The point, a fact or example, what it means |
| Deep | Lower end of the range | The point, evidence, an example, the trade-off, what it means |

Exact point counts per length are in `budgets.md`.

## 5. Tone

Tone is word choice only. It never beats clarity: formal doesn't mean long words, and conversational doesn't mean slang or filler.

| Tone | Rules |
|---|---|
| Formal | Complete sentences, no contractions, third person ("the team", "the company") |
| Neutral | Plain and professional, contractions allowed but sparing, "we" is fine |
| Conversational | "We" and "you", contractions, shorter sentences, a light touch of personality |

Same sentence, three tones:
- Formal: "The company should retire the Studio platform before the March renewal."
- Neutral: "We should retire Studio before the March renewal."
- Conversational: "Let's retire Studio before it renews in March."

## 6. Mismatches

Some combinations don't fit well. Write anyway, and put one warning line above the title:

| Combination | Warning |
|---|---|
| Deep + 1 page | "Deep detail on one page covers only 1–2 points." |
| Overview + 10 pages | "An overview may come in well under 30,000 characters." |
| Technical topic + executive audience | No warning. Keep the conclusion and why it matters executive; put depth in the explanation. |
| Propose with no clear decision | Ask what decision the reader should make. This is the one case worth stopping for. |
| Custom chars over 30,000 | Don't write it; propose a split (see `budgets.md`). |
