# How LocalStack Saved the StateMachine (Step Functions)
### 30-minute internal tech talk — 33 slides + 6 appendix

---

## The argument, in one place

**Claim (what they should do Monday):** Before you build a distributed workflow, build the environment that runs it on your laptop. The local execution loop is the first architecture decision, not a developer convenience.

**Portable sentence:** *The feedback loop is the first architecture decision.*

**Warrant (the rule that has to hold):** When one iteration costs a deploy plus a pipeline, teams stop testing alternatives and start deciding by seniority. Cheap iteration is the precondition for evidence-based architecture, not a nice-to-have that follows it.

**Qualifier:** This pays off for long-running, multi-service, asynchronous, hard-to-observe workflows — all four. LocalStack validates workflow logic, state transitions, callbacks and retries, not IAM, throughput or production behaviour. Those still need Dev and QA, which is why the tracer works against both.

---

## Two structures running at once

**The question chain** (short-range). Every slide poses a question and hands off to the next in green at the bottom. Say the green line out loud, then advance. This gives the talk local momentum — the audience is never waiting for you to finish explaining something.

**Three open loops** (long-range). Slide 3 states three questions you refuse to answer, each with an amber chip. Each one closes later, marked in green in the top-right corner. This gives the talk an arc that holds across thirty minutes, which a chain of immediate handoffs can't do on its own.

| Loop | Opened | Closed | The payoff |
|---|---|---|---|
| 1 | Slide 3 | **Slide 25** | The export-job count. "The number I promised you." |
| 2 | Slide 3, tightened on 8 | **Slide 10** | Streaming was 90% of the volume and 10% of the engineering. |
| 3 | Slide 3 | **Slide 26** | What caught it? The loop. |

Loop 2 closes early on purpose — four slides after it opens. That's what teaches the room the promises are real, so they keep holding 1 and 3 for the next fifteen slides. Tell them the amber/green convention out loud on slide 3; it costs eight seconds and it means every payoff is recognised rather than explained.

**One risk, and it's on you to check.** Open loops have exactly one failure mode: a payoff smaller than the setup promised makes the audience feel handled, and they stop trusting the rest of the talk. The exposed one is Loop 1 — you're promising "embarrassingly small." If your real export-job count turns out to be unremarkable, cut the promise and keep the number. Don't inflate the setup to match.

---

## Slide-by-slide

| # | Slide | Hands off to |
|---|---|---|
| 1 | Title | — |
| 2 | Hook: *we picked Step Functions… then almost couldn't build them* | — |
| 3 | **Three questions I'm not going to answer yet** (amber chips) | — |
| 4 | How this talk works | So what could make moving a file difficult? |
| 5 | The requirement, as a quote | What could possibly make this difficult? |
| 6 | Scale: 1M+ / 5–6 MB / ≈5.5 TB / zero loss | So what are we allowed to build on? |
| 7 | No approved mechanism was compatible | What can those APIs actually do? |
| 8 | Two APIs — promising vs painful *(tighten Loop 2 verbally here)* | Does streaming hold up at 1M calls/day? |
| 9 | **Experiment 1:** >90% vs 100% required | How do we recover what streaming misses? |
| 10 | Recovery is a workflow — **Loop 2 closes** | How do you orchestrate something that runs for hours? |
| 11 | **Experiment 2:** orchestration bake-off → Step Functions + TypeScript | We had the answer — why was it hard to build? |
| 12 | **The turn:** SAM had no practical local Step Functions support | What did that cost, per change? |
| 13 | The six-step loop, [N] min per iteration | And when it failed, where do you look? |
| 14 | **Scene** (blank slide — CloudWatch archaeology) | — |
| 15 | **The warrant:** at that price you decide by opinion | So what do you build first? |
| 16 | **The decision:** build the laptop environment first | Can you run Step Functions locally? |
| 17 | LocalStack, from the production CDK | Is that enough? |
| 18 | No — six things the tooling had to do | And when it fails across nine Lambdas? |
| 19 | Distributed tracing → one timeline | Could we just look at it? |
| 20 | The visualization UI | So what does one iteration cost now? |
| 21 | **Before / after:** [N] min → [N] sec | How did one engineer build all this? |
| 22 | Claude Code reasoned, Uncle Dev harnessed, neither decided | Did the loop change any actual architecture? |
| 23 | **Experiment 3:** Step Functions bill per transition | Should we optimize it away? |
| 24 | The EventBridge alternative — it worked | How many export jobs are there, really? |
| 25 | **[N] export jobs a day** — **Loop 1 closes** | Was a whole local platform worth it? |
| 26 | **What caught it? The loop.** — **Loop 3 closes** | So who pays for that, and when? |
| 27 | **The counterfactual:** nobody would have been wrong, everybody would have been paying | — |
| 28 | "LocalStack isn't AWS." — *Correct.* | "We don't have time to build tooling." |
| 29 | It took [N]. We waited longer than that on pipelines. | When would you not do this? |
| 30 | Where I'd tell you not to do this | — |
| 31 | The five-step pattern + *none of it works if one experiment costs a pipeline* | — |
| 32 | *Good engineering is reducing uncertainty until the right architecture becomes obvious* | — |
| 33 | **Close:** the feedback loop is the first architecture decision | — |

Appendix A1–A5: production architecture · Fargate + NestJS · the tracking platform · what the local environment covers and doesn't · platform milestones.

---

## The four slides that are the argument

Slides **14, 15, 21 and 25**. Everything else is scaffolding around them.

- **14** is the scene — no text, two minutes, told from memory.
- **15** is the warrant, and it's the sentence the whole talk rests on.
- **21** is the proof, and it needs silence after the two numbers.
- **25** is the payoff of Loop 1 and the reason the platform was worth building.

Slide **27** is the newest and probably the most quotable. It's where you say the cost of the wrong architecture would never have shown up as a bug — it would have shown up as a system slightly harder to run than it needed to be, for years, untraceable to any decision anyone made. Slow all the way down for it.

---

## The six objections, ranked

Prepare these harder than the slides. This list is worth more than the deck.

1. **"LocalStack isn't real AWS — you have false confidence."** High/high. Slide 28. Concede completely and immediately, then say what each environment is for. Do not defend the emulator.
2. **"What did the loop actually cost, before and after?"** High. Slide 21 is the spine. Without those numbers a good engineer finds the hole in the first question.
3. **"Why not SAM / the Step Functions Local container / a sandbox account?"** Certain. One sentence on what you evaluated and why it didn't cover multi-Lambda callbacks and waits. Then stop — tar pit.
4. **"You built a platform instead of shipping the product."** Medium/high. Answer with the regulatory deadline you hit, not the hours you saved.
5. **"Isn't the tracer just X-Ray?"** Medium, low damage. One line on what X-Ray didn't give you for local execution and cross-Lambda state correlation.
6. **"Is any of this reusable, or is it Call Recording specific?"** Medium — and it's the *good* question, the one that turns a talk into adoption. Have a real answer: what another team would have to do, and how long. If the honest answer is "it's coupled to our repo," say so and say what lifting it would take.

---

## Numbers to collect before the final version

| # | Slide | What's needed | Why it matters |
|---|---|---|---|
| 1 | 21 | **Iteration time before and after** | The spine. Non-negotiable. |
| 2 | 13 | One deploy-and-test cycle, in minutes | Sets up #1. |
| 3 | 16, 29 | How long the local platform took to build | Answers the main objection. |
| 4 | 25 | Export jobs per day, and the monthly cost delta | Closes Loop 1 — and if the number isn't striking, cut the promise on slide 3. |
| 5 | 20 | Screenshot of the visualization UI | Cheapest persuasion available to you. |
| 6 | 12 | Verify SAM's local Step Functions support, then and now | The one factual claim someone will check. |
| 7 | 22 | Confirm "Claude Code" and "Uncle Dev" | Your drafts all say "Cloud Code." |
| 8 | 6, 14, 26, A4 | S3 growth figure; log-stream count in the scene; regulatory deadline date; what the local env does *not* cover | Turns claims into facts. |

---

## Timing and cuts

Thirty-three slides in thirty minutes is under a minute each, and four slides need much more: 14 (the scene, two minutes), 21 (silence after the numbers), 25 (let the number land), 27 (deliver it slowly). The question-chain slides absorb that — pose, answer, hand off, advance, ten to fifteen seconds each.

If rehearsal runs long, cut in this order:

1. **Slide 7** (the constraint) — fold into slide 6's talk track as one sentence.
2. **Slide 22** (the AI slide) — say it over slide 21 instead.
3. **Slide 30** (where not to do this) — move to Q&A. You lose the pre-emptive qualifier but keep the answer.

Never cut 3, 10, 25 or 26 — an opened loop that doesn't close is worse than never opening it. And never cut 14, 15, 21 or 27.

---

## Before you present

1. Fill the eight items above. Rebuild any slide whose placeholder survives — a placeholder in the room reads as a guess about your own project.
2. Draft done, then leave it a full night. The morning pass is where you see which slides only make the talk longer.
3. Rehearse by closing the deck and reconstructing the talk out loud as *three promises and their payoffs*, not as a slide sequence. If you can get from "there's a number that's embarrassingly small" to "the feedback loop is the first architecture decision" without the deck, you're ready.
4. Rehearse the five joints specifically: 11→12 (why was it hard), 15→16 (what do you build first), 22→23 (did it change anything), 25→26 (what caught it), 26→27 (who pays). Everything else is sequence; those are the argument turning.
