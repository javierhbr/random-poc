---
name: argument-architecture
description: >-
  Structure persuasive work artifacts — proposals, memos, business cases,
  strategy docs, presentation decks, and published articles — using Toulmin's
  six-part argument model, P.A.S.T. narrative technique, and plain-language
  revision. Use whenever the user is writing something meant to change a
  decision or a reader's mind at work, even when they name no framework — "help
  me write a proposal", "review this deck before Thursday", "convince
  leadership to fund X", "make this memo more persuasive", "why does this
  argument feel weak", "what will they push back on", "this is too dry", "this
  reads like AI wrote it". Also use when they mention Toulmin,
  claim/grounds/warrant, argument structure, steelmanning, storytelling in a
  work document, or stripping AI-sounding language. Do NOT use for purely
  informational writing (status updates, documentation, meeting notes) where
  nothing is being argued.
---

# Argument Architecture

A persuasive artifact fails in one of three places: the ask isn't a decision, the evidence is a conclusion rather than a chain, or the unstated rule connecting them doesn't survive contact with a skeptic. This skill finds those three failures before an audience does.

The structural model is Stephen Toulmin's, from *The Uses of Argument* (1958). The revision practices are drawn from spacing and retrieval-practice research. Both are real; see "Provenance" at the end for what this skill deliberately excludes.

## Workflow

Work in this order. Steps 1–3 happen before any drafting — most weak artifacts are weak because drafting started first.

1. **Fix the claim** (below)
2. **Build the grounds as a chain** (below)
3. **Surface and test the warrant** (below)
4. **Map rebuttals and set the qualifier** (below)
5. **Make it concrete** — read `references/storytelling.md`
6. **Place the components** — read the reference file for the artifact type
7. **Apply the quality gates** (below)

If the user arrives with a draft already written, run steps 1–4 as a diagnostic against what they have rather than starting over.

## The six components

| Component | What it is | The test |
|---|---|---|
| **Claim** | The decision you want made | Can someone say yes or no to it? |
| **Grounds** | The facts the claim rests on | Is each link separately checkable? |
| **Warrant** | The rule making those facts relevant | Can you say it in plain words? |
| **Backing** | Why the warrant holds | Would a skeptic accept the source? |
| **Qualifier** | The scope the claim is limited to | Does it name a real boundary? |
| **Rebuttal** | Conditions where the claim fails | Is it in someone's actual voice? |

### 1. Fix the claim

Write the claim as one sentence a decision-maker could approve or reject. The test is binary, and it is strict.

- Fails: "We need to talk about rising acquisition costs." — nothing to approve.
- Fails: "Our onboarding experience needs improvement." — a sentiment, not a decision.
- Passes: "Move $200K of Q4 paid spend from Meta to search, starting November 1."
- Passes: "Hire two contract writers for Q1 rather than backfilling the open FTE."

Push the user to a decision sentence before anything else. If they resist — if the claim keeps sliding back toward a topic — that usually means they haven't decided what they want, and no amount of structure will fix it. Say so directly and help them decide first.

A claim that names a number, a date, or an owner is almost always stronger than one that doesn't.

### 2. Build the grounds as a chain

The common failure is presenting the *conclusion* of the evidence as though it were the evidence. A single headline number invites the audience to dispute the number. A chain invites them to check each link, and each link is individually boring and hard to argue with.

- Weak grounds: "CAC is up 133%."
- Strong grounds: spend held flat → platform algorithm change in September → CTR fell 2.5% to 1.1% → CPC rose $1.20 to $2.80 → CAC up 133%.

Ask the user for the intervening steps, including the ones that feel too obvious to state. Obvious-to-the-author is where unverified assumptions hide — the author skipped the step precisely because they never checked it.

Flag any link that is an inference rather than an observation. Those are the ones that get attacked.

### 3. Surface and test the warrant

The warrant is the rule that makes the grounds relevant to the claim. It is almost always unstated, and it is where arguments actually get broken.

For the CAC example, the warrant is roughly: *when a channel's efficiency degrades for structural rather than seasonal reasons, reallocating beats waiting it out.*

Two tests, in order:

**The plain-language test.** Have the user say the warrant out loud in ordinary words. If what comes out is "this aligns with our strategic priorities" or "it's a synergy play" or "this is about operational excellence," there is no warrant — there's a phrase occupying the space where one should be. Jargon here is diagnostic, not stylistic: it reliably marks the spot where reasoning was never done. Keep pushing until you get a sentence with a mechanism in it.

**The skeptic test.** Name the most credible person who would reject the warrant, and state their version. If the CMO believes the Meta decline is seasonal, the warrant fails and no volume of grounds rescues the claim. That disagreement *is* the argument — everything else is scenery. When the warrant is genuinely contested, tell the user their artifact needs to argue the warrant directly, not the claim.

### 4. Map rebuttals and set the qualifier

**Rebuttals.** Abstract counterarguments are useless preparation. For internal work, write each objection in the voice of the specific person who will raise it:

> "Priya will say we tried search in 2024 and CAC came in worse."

For each one, choose exactly one of three responses:
- **Concede and narrow** — fold it into the qualifier
- **Absorb** — adjust the claim so the objection no longer applies
- **Answer** — rebut it with backing held ready

An objection that fits none of the three is a real hole. Name it as such rather than papering over it. Telling the user their argument has a genuine weakness is more useful than helping them hide it, and it's the thing that will surface in the room anyway.

**Qualifier.** The qualifier is the scope the claim is limited to — the safe operating space. It should name a real boundary with a real trigger, not hedge the language:

- Hedging (weak): "This will probably help somewhat."
- Scoping (strong): "This assumes search inventory holds near current prices. Above $2.00 CPC the case weakens materially."

A specific qualifier makes the claim harder to dismiss, because it removes the easiest attack: finding one exception and using it to discard the whole thing.

### 5. Make it concrete

A structurally sound argument still fails if nobody remembers it forty minutes later, or if the person who has to re-explain it to *their* boss can't. Concreteness is what makes an argument portable.

Read `references/storytelling.md` for the P.A.S.T. technique — Place, Action, Speech, Thoughts — and where each element attaches to the Toulmin components. The short version: a scene illustrates the grounds but never replaces the chain, direct quotes belong to grounds and stakes rather than to the warrant, and the doubt you remember having is usually the rebuttal you need.

Skip this step only when the artifact is a pure informational deliverable. Every argued artifact benefits from at least one concrete moment.

### 6. Place the components

**Toulmin is not an outline.** The most common misapplication is mapping one component per section or per slide, which produces an artifact with a heading called "Warrant" that nobody reads.

Placement depends on the medium — chiefly on whether a human is present to answer questions:

- **Presentation deck** → read `references/deck.md`
- **Memo, proposal, business case, strategy doc** → read `references/document.md`
- **Published article, blog post, external essay** → read `references/article.md`

Read only the one that applies. If the user is producing more than one artifact from the same argument (a common case: a deck for the meeting, a memo for the pre-read), read both — the argument stays identical, the placement does not.

### 7. Quality gates

Apply both before the artifact is considered done.

**Sleep on it.** Draft the argument, then leave it overnight before revising. Distance surfaces the logical leaps that are invisible while you're assembling them, when your attention is on construction rather than evaluation. If the deadline genuinely doesn't allow a night, get the longest gap available and do something cognitively unrelated in it.

Tell the user this explicitly when they're working ahead of a deadline — it's the single highest-leverage step and the first one people skip.

The gap is also where scene-cutting happens. A scene that felt essential while writing often reads as filler the next morning, and the test is simple: does removing it weaken the argument, or only shorten it? If only shorten, cut it.

**Rehearse by retrieval, not review.** Close the artifact and reconstruct the whole argument from memory, out loud. Re-reading your own slides or draft feels productive and mostly teaches you the artifact; retrieval is what exposes the joints you can't actually explain. It's also what the real situation demands — when someone interrupts on slide two, you need the argument, not the sequence.

Where the joint fails during retrieval is almost always the weak warrant from step 3.

**Strip the slop.** Do one dedicated pass for machine-sounding prose, using `references/plain-language.md`. Read it before this pass rather than relying on general instincts — the specific tells are easy to miss in your own writing.

The core test is one question: could this sentence appear unchanged in a document about a different company? If yes, it's carrying no information. This matters more than usual with this skill, because a six-part framework naturally produces uniform, scaffolded-looking output, and visible structure is itself a tell.

Apply this pass to your own contributions too, not only the user's draft.

## Working with the user

Be a skeptic on their behalf, not a formatter. The value of this skill is finding the load-bearing weakness, and that requires saying things like "your warrant is doing work you haven't justified" or "this claim isn't a decision yet."

Don't produce all six components as a labeled deliverable unless asked — the user wants a better artifact, not a completed worksheet. Work through the components, then hand back the artifact with the reasoning visible in how it's built.

Ask for the audience early. "Who has to say yes, and what do they already believe?" changes nearly every downstream decision, especially which warrants can be assumed and which must be argued.

Write the way you're asking them to write. Producing a polished, evenly-structured, abstraction-heavy response about the importance of concrete specific writing undercuts the whole thing. Name real things, vary the rhythm, and let some sentences be plain.

## Provenance

This skill descends from a request to combine Toulmin with something circulating online as "the MIT Method" — variously described as "Forced Decomposition by Restriction," and supported by claims that 40% of a 2019 MIT algorithms class failed after using the Feynman technique, that a named MIT neuroscientist measured 81% versus 42% retention across a 24-hour break, and that difficulty produces 34% better recall at three weeks.

None of those studies could be located. The named method does not appear in any pedagogical literature. The label is also applied inconsistently across sources to three unrelated things: the invented decomposition method, "Most Important Tasks" (a productivity acronym from Leo Babauta's writing, unrelated to the institution), and computational thinking.

What survived and is retained here: distributed practice and sleep-dependent consolidation genuinely aid retention; retrieval practice genuinely outperforms rereading; the fluency illusion is a real and well-documented effect. These are established findings in cognitive psychology and do not require the invented scaffolding.

A related source proposed mapping MIT's VLMFP research onto narrative planning — SimVLM and GenVLM, PDDL domain files as "legal precedents," an audience as a "grid-world," and 85%/70%/30% success rates transplanted as narrative benchmarks. That paper is real (Fan et al., "Simulation to Rules: A Dual-VLM Framework for Formal Visual Planning," arXiv 2510.03182) and its subject is generating machine-readable plan files from images for formal planners. It says nothing about audiences or persuasion, and its success rates measure plan correctness in simulated environments. This is a harder failure to catch than an invented statistic, because the citation survives a search and only collapses when someone reads the paper. Excluded.

P.A.S.T. is retained on different grounds. It's a craft heuristic from storytelling instruction rather than an empirical claim, so it needs no study behind it — it's judged on whether it works. The two constraints in `references/storytelling.md` on quote accuracy and audience calibration are additions, not part of the original technique.

If a user asks for excluded material by name, build the argument with what's here and tell them briefly why. Reproducing fabricated statistics — or real citations bent to unrelated subjects — in a work document is a genuine professional risk. Someone eventually checks.
