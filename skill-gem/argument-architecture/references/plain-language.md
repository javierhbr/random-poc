# Writing Like a Person

Work artifacts increasingly read as machine-generated, and readers have gotten fast at spotting it. Once they do, the argument is discounted before it's evaluated — not because the reasoning is wrong, but because the reader concludes nobody thought hard about this.

## The root cause

Nearly every AI tell reduces to one thing: **prose that could have been written about any company.**

Swapping "leverage" for "utilize" fixes nothing. Word-level bans get gamed while the underlying emptiness survives. The diagnostic that actually works:

> Could this sentence appear, unchanged, in a document about a different company in a different industry?

If yes, it is carrying no information. Either make it specific or cut it. Applied honestly, this single test catches most of what follows.

The corollary matters for revision: the fix for a vague sentence is usually a *fact*, not a better adjective.

## Structural tells

These are more damaging than vocabulary, because they shape how the whole artifact reads.

**Visible scaffolding.** With this skill especially: if the reader can see the six components — a section headed "Warrant," a paragraph that announces "now let us examine the grounds" — the structure has failed. Toulmin is a construction tool, not an outline. Strip the labels before delivery.

**Bold-lead bullets everywhere.** `**Efficiency:** This improves efficiency.` Occasionally useful, exhausting in volume, and it hides the fact that the bullets aren't saying much. If every bullet has a bolded label, delete the labels and see what's left.

**Compulsive threes.** Three bullets, three examples, three-part sentences. Reality rarely arrives in threes. When a list has three items and the third is weaker than the others, it was padding to reach three — cut it and ship two.

**The antithesis reflex.** "It's not just X — it's Y." "This isn't about A; it's about B." One of these in a document is fine. Three is a rhythm, and a machine-sounding one.

**Section-opening restatement.** A heading that says "Budget Impact" followed by "In terms of budget impact, there are several considerations." Cut straight to the content — the heading already did that job.

**Closing summaries that add nothing.** A final paragraph restating what was just said. Real writing ends when the point is made. If the document needs a summary, it goes at the *top* where a busy reader will use it.

**Perfect parallelism.** Every section the same length, every bullet the same grammatical shape. Human documents are lumpy because some points need more room than others. Uniform sections signal a template, not thinking.

## Vocabulary that signals nothing

The abstraction nouns — *synergy, alignment, optimization, leverage (verb), streamline, robust, seamless, holistic, landscape, ecosystem, framework* (when not naming an actual framework), *actionable, best-in-class, transformative.*

The connective filler — *furthermore, moreover, additionally, it is important to note that, it is worth noting, in today's rapidly evolving environment.*

The AI-inflected verbs — *delve, underscore, showcase, foster, harness, unlock, elevate, navigate* (metaphorical), *testament to.*

The hedge-and-inflate pairing — *significantly, substantially, dramatically, considerably* attached to claims with no number behind them. If it moved significantly, say by how much.

None of these are banned words. They're *symptoms* — each one usually marks a spot where a specific fact should be. Treat an instance as a prompt to ask what the writer actually meant, then write that instead.

## What to do instead

**Name things.** Real system names, real team names, real dates, real numbers. "The migration slipped from March 14 to April 2" beats "the timeline experienced some slippage."

**Use unrounded numbers where you have them.** "$47K" reads as measured; "approximately $50K" reads as guessed. Round only when rounding is honest.

**Vary sentence length deliberately.** Long sentences that carry a full thought, followed by a short one. That contrast is most of what makes prose sound like a person.

**Let some sentences be plain.** Not every sentence needs a rhetorical shape. "We tried this in Q2 and it didn't work" is a good sentence.

**Keep concrete verbs.** *Cut, moved, broke, doubled, missed, shipped.* Abstract verbs (*facilitate, enable, drive, support*) usually mean the writer hasn't decided what actually happened.

**Say the uncomfortable part plainly.** "This will annoy the platform team" is more credible than "there may be some stakeholder alignment considerations." Hedged discomfort is one of the strongest AI tells, because avoiding social friction is exactly what the hedging is for.

## An important non-goal

**This is not about sounding like a native speaker or using idiomatic flourish.** Plain, direct, grammatically simple prose is excellent work writing and always has been. Many strong professional writers write in a second or third language, and their directness is usually an asset.

The target is emptiness, not simplicity. A short plain sentence with a real number in it is good writing. A polished, idiomatic sentence that says nothing is the problem. Never "improve" a user's prose by making it more ornate — if anything, push the other direction.

## Applying this

**During drafting**, resist producing the polished-looking version. It's the default output shape and it's the problem.

**During revision** (the morning after the sleep interval — see the quality gates in SKILL.md), do one dedicated pass with only the any-company test in hand. Mark every sentence that passes it as suspect. Most will need a fact, not an edit.

**When reviewing a user's draft**, point at specific sentences rather than describing the problem in general. "This line could be about any company — what actually happened here?" gets a real answer. "Consider making this more concrete" gets another vague sentence.

**When the user's source material is already full of this** — decks and docs inherited from elsewhere often are — say so plainly and show one before/after rather than rewriting silently. They may need to defend the change to whoever wrote the original.
