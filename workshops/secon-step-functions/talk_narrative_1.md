# How LocalStack Saved the StateMachine (Step Functions)
### 30-minute internal tech talk — 31 slides + 6 appendix, question-chain structure

---

## The argument, in one place

**Claim (what they should do Monday):** Before you build a distributed workflow, build the environment that runs it on your laptop. The local execution loop is the first architecture decision, not a developer convenience.

**Portable sentence:** *The feedback loop is the first architecture decision.*

**Warrant (the rule that has to hold):** When one iteration costs a deploy plus a pipeline, teams stop testing alternatives and start deciding by seniority. Cheap iteration is the precondition for evidence-based architecture, not a nice-to-have that follows it.

**Qualifier:** This pays off for long-running, multi-service, asynchronous workflows. For a single Lambda, SAM is fine and this is overkill. LocalStack validates workflow logic, state transitions, callbacks and retries — not IAM, throughput or production behaviour. Those still need Dev and QA, which is why the tracing tool was built to work against both.

---

## The structure you asked for

Every slide follows your keynote-notes device: **the question we were stuck on → the experiment → what it told us → the next question**. The green line at the bottom of each slide is the handoff — say it out loud, then advance.

Slide 3 tells the audience this is how the talk works. That one sentence buys you patience for the next twenty-nine slides, because they know they're arriving at the architecture with you rather than waiting for you to finish explaining it.

The question chain converges on the claim rather than wandering: the chain runs *what's hard → what can we build on → does streaming scale → how do we recover → how do we orchestrate → **why can't we build it** → what does that cost → what do we build first → and did it change any architecture*. The turn at slide 11 is where a talk about vendor APIs becomes a talk about your feedback loop.

---

## Slide-by-slide

| # | Slide | The question it answers | Hands off to |
|---|---|---|---|
| 1 | Title | — | — |
| 2 | Hook: *we picked Step Functions… then almost couldn't build them* | — | (spoken) |
| 3 | How this talk works | — | So what could possibly make moving a file difficult? |
| 4 | The requirement, as a quote | — | What could possibly make this difficult? |
| 5 | Scale: 1M+ / 5–6 MB / ≈5.5 TB / zero loss | What makes it difficult | So what are we allowed to build on? |
| 6 | No approved mechanism was compatible | What we're allowed to build on | What can those APIs actually do? |
| 7 | Two APIs, opposite personalities | What the APIs do | Does streaming hold up at 1M calls/day? |
| 8 | **Experiment 1:** >90% vs 100% required | Does streaming scale | How do we recover what streaming misses? |
| 9 | Recovery is a workflow, not a download | How recovery works | How do you orchestrate something that runs for hours? |
| 10 | **Experiment 2:** orchestration bake-off → Step Functions + TypeScript | What orchestrates it | We had the answer — why was it hard to build? |
| 11 | **The turn:** SAM had no practical local Step Functions support | Why it was hard | What did that cost, per change? |
| 12 | The six-step loop, [N] min per iteration | What it cost | And when it failed, where do you look? |
| 13 | **Scene** (blank slide — CloudWatch archaeology) | — | — |
| 14 | **The warrant:** at that price you decide by opinion | What it told us | So what do you build first? |
| 15 | **The decision:** build the laptop environment first | What to build first | Can you actually run Step Functions locally? |
| 16 | LocalStack, from the production CDK | Yes | Is that enough? |
| 17 | No — six things the tooling had to do | Is that enough | And when it fails across nine Lambdas? |
| 18 | Distributed tracing → one timeline | How you debug it | Could we just look at it? |
| 19 | The visualization UI | Yes | So what does one iteration cost now? |
| 20 | **Before / after:** [N] min → [N] sec | What the loop costs now | How did one engineer build all this? |
| 21 | Claude Code reasoned, Uncle Dev harnessed, neither decided | How it was affordable | Did the loop change any actual architecture? |
| 22 | **Experiment 3:** Step Functions bill per transition | The worry | Should we optimize it away? |
| 23 | The EventBridge alternative — it worked | Could we | How many export jobs are there, really? |
| 24 | **[N] export jobs a day** — measured | How many | Was a whole local platform worth it? |
| 25 | The comparison cost days because the loop was cheap | Was it worth it | So what would you push back on? |
| 26 | "LocalStack isn't AWS." — *Correct.* | Objection 1 | "We don't have time to build tooling." |
| 27 | It took [N]. We waited longer than that on pipelines. | Objection 2 | When would you not do this? |
| 28 | Where this doesn't apply | The qualifier | — |
| 29 | The five-step pattern + *none of it works if one experiment costs a pipeline* | — | — |
| 30 | *Good engineering is not choosing the smartest architecture. It's reducing uncertainty until the right architecture becomes obvious.* | — | — |
| 31 | **Close:** the feedback loop is the first architecture decision | — | — |

Appendix A1–A5: production architecture · Fargate + NestJS · the tracking platform · what the local environment covers and doesn't · platform milestones.

---

## What I took from the five new drafts

**The question-chain device** (`Keynote_Notes.md`) — now the structure of the whole talk. It was twelve lines and the most useful thing in the five documents.

**Java Spring** was in the orchestration bake-off; only the project story mentions it. Slide 10 now separates *orchestration approaches* (Step Functions, hand-rolled state machine, Saga, event-driven) from *implemented in* (Java Spring, TypeScript), which is both accurate and clearer than one flat list.

**"Streaming looked promising. Exports looked painful."** Slide 7 now closes on those two lines. Good writing, and it sets up the reversal — the painful one is where all the interesting work turned out to be.

**"Sometimes engineering means removing ideas."** In the notes for slide 24, where you delete the EventBridge architecture.

**"New engineers joined without tribal knowledge."** Appendix A5.

**Your closing line** is now slide 30, immediately before the close. It's the best sentence in any of the drafts, but it isn't an ask — nobody changes what they do on Monday because of it. So it lands, then slide 31 tells them what to do.

**The honest version of the Step Functions decision.** Your keynote notes say it was chosen for "simplicity, resiliency and team familiarity." Team familiarity is not a measurement, and my earlier draft claimed the experiments decided it outright. That's now in slide 10's speaker notes as a line to say out loud. Someone in that room was in those conversations — claiming pure measurement when the room remembers otherwise costs you the rest of the talk.

**What the five documents did not contain:** a single one of the numbers below. Five drafts of the story, zero measurements.

---

## The six objections, ranked

Prepare these harder than the slides. This list is worth more than the deck.

1. **"LocalStack isn't real AWS — you have false confidence."** High likelihood, high damage. Slide 26. Concede immediately and completely, then name what each environment is for. Do not defend the emulator.
2. **"What did the loop actually cost, before and after?"** High. Slide 20's numbers are the spine. Without them a good engineer finds the hole in the first question.
3. **"Why not SAM / the Step Functions Local Docker image / a sandbox account?"** Certain. One sentence on what you evaluated and why it didn't cover multi-Lambda callbacks and waits. Then stop — this is a tar pit.
4. **"You built a platform instead of shipping the product."** Medium likelihood, high damage. Answer with the regulatory deadline you hit, not the hours you saved.
5. **"Isn't the tracing tool just X-Ray?"** Medium, low damage. One line on what X-Ray didn't give you for local execution and cross-Lambda state correlation.
6. **"Is any of this reusable, or is it Call Recording specific?"** Medium — and it's the *good* question, the one that turns a talk into adoption. Have a real answer: what another team would have to do, and how long. If the honest answer is "it's coupled to our repo," say so and say what lifting it would take.

---

## Numbers to collect before the final version

| # | Slide | What's needed | Why it matters |
|---|---|---|---|
| 1 | 20 | **Iteration time before and after** | The spine of the talk. Non-negotiable. |
| 2 | 12 | One deploy-and-test cycle, in minutes | Sets up #1. |
| 3 | 15, 27 | How long the local platform took to build | Answers the main objection. |
| 4 | 24 | Export jobs per day, and the monthly cost delta | You confirmed this is measured — have the source ready. |
| 5 | 19 | Screenshot of the visualization UI | Cheapest persuasion available to you. |
| 6 | 11 | Verify SAM's local Step Functions support, then and now | The one factual claim someone will check. |
| 7 | 21 | Confirm "Claude Code" and "Uncle Dev" | Your drafts all say "Cloud Code." |
| 8 | 5, 25, A4 | S3 growth figure; the regulatory deadline date; what the local env does *not* cover | Turns claims into facts. |

---

## Timing and cuts

Thirty-one slides in thirty minutes is under a minute each, and three slides need more than that: slide 13 (the scene) needs two minutes, slide 20 needs silence after the numbers, and slide 4 needs a real pause for the audience to guess.

The question-chain slides move fast — pose, answer, hand off, advance. But if you're over time in rehearsal, cut in this order:

1. **Slide 6** (the constraint) — fold it into slide 5's talk track as one sentence.
2. **Slide 28** (where this doesn't apply) — move it to Q&A; you lose the pre-emptive qualifier but keep the answer.
3. **Slide 21** (the AI slide) — say it over slide 20 instead.

Do not cut 13, 14, 20 or 24. Those four are the argument.

---

## Before you present

You have more than a week. Use it in this order:

1. Fill the eight items above and rebuild any slide whose placeholder survives. A placeholder that reaches the room reads as a guess about your own project.
2. Draft done, then leave it a full night. The morning pass is where you'll see which slides only make the talk longer.
3. Rehearse by closing the deck and reconstructing the chain out loud from memory — question to question, not slide to slide. If you can get from "what makes moving a file hard" to "the feedback loop is the first architecture decision" without the deck, you're ready. Expect the stumble around slide 14; that's the warrant.
4. Rehearse the four handoffs where the chain turns: 10→11 (why was it hard), 14→15 (what do you build first), 21→22 (did it change anything), 24→25 (was it worth it). Those are the joints. Everything else is sequence.
