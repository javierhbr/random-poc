# How LocalStack Saved the StateMachine
## Presenter script — all 39 slides

Everything here is also in the deck's speaker-notes pane. This version adds the timing, the reason each slide exists, and the places where the talk can go wrong.

**Running time:** 29:20 with the numbers below, leaving about 40 seconds of slack. Four slides need more room than their word count suggests — **14, 21, 25, 27**. Protect those four and take the time out of Act 2.

**Two structures are running.** The green line at the bottom of most slides is the *question chain* — say it out loud, then advance. Separately, slide 3 opens three questions you refuse to answer; they close on **10**, **25** and **26**, marked green in the top-right corner. Never cut a slide that closes a loop.

**Eight things are still bracketed.** They're listed at the end. A `[N]` that reaches the room reads as a guess about your own project.

---

# ACT 1 — Earn the room · 2:10

## Slide 1 · Title — *before you start*

**On screen.** How LocalStack Saved the StateMachine. Your name, team, date.

**Say.** Nothing. This is what's up while people find seats. Start speaking on slide 2.

**Why it exists.** A landing pad, not a beat. Advance off it as soon as you begin.

---

## Slide 2 · Hook — *0:45*

**On screen.** *We picked Step Functions because the experiments said so. Then we almost couldn't build them.*

**Say.** "We did the research properly on this project. We prototyped several orchestration approaches, measured them, and Step Functions won. That was a good decision and I'd make it again.

And then implementation started, and inside about a week it was clear that decision was going to be very hard to execute — for a reason that had nothing to do with architecture."

Pause. Let the contradiction sit for two seconds before you advance.

**Why it exists.** Idea collision. A room at an internal talk has no stake in your conclusion yet, so the opening has to create a question rather than state a claim. "We did it right and it still nearly failed" is a question they want answered.

**Watch for.** Don't explain the reason here. The whole talk is the reason.

---

## Slide 3 · Three questions I'm not going to answer yet — *0:50*

**On screen.** Three amber-chipped questions: the embarrassingly small number, the tenth of the traffic that took most of the engineering, and the architecture you almost shipped.

**Say.** Read all three out loud, slowly. Then: "I'm not going to answer any of those yet. Amber means still open. When one closes you'll see it in the corner."

Then move on without resolving anything.

**Why it exists.** The question chain gives you momentum slide to slide but no arc across thirty minutes. These three promises are the arc. Naming the amber-to-green convention costs eight seconds and means every payoff is recognised instead of explained.

**Watch for.** Question 1 is the risk. You are promising the room a number that is *embarrassingly small*. If your real export-job count turns out to be unremarkable, cut this promise and keep the number — a payoff smaller than its setup makes people feel handled and they stop trusting the rest.

---

## Slide 4 · How this talk works — *0:35*

**On screen.** Every slide is a question we had to answer → the question, the experiment, what it told us, the next question.

**Say.** "I'm not going to show you the architecture and then explain it. You're going to arrive at it with me, one question at a time.

And the production diagram is in the appendix and in the repo, so nobody has to wait for it."

**Why it exists.** Buys patience for twenty-nine slides. Also disarms the architects in the room who would otherwise spend the first ten minutes waiting for a system diagram instead of listening.

---

# ACT 2 — The problem, as a chain of questions · 6:20

*This is the act to compress if rehearsal runs long. It's context, and a technical audience survives losing context better than losing argument.*

## Slide 5 · The requirement — *0:50*

**On screen.** "A call ends, an audio file is generated, and that file must be transferred into Capital One." *That was the entire ticket.*

**Say.** Read the quote flat — no irony, no eyebrow. Let it sound as small as it sounded on day one. Then ask the question on the slide out loud: "What could possibly make this difficult?"

Then actually stop. Let two or three people guess.

**Why it exists.** This is the moment the audience joins the project instead of watching it. The pause is the slide; the words are just the setup.

**Watch for.** The temptation to fill the silence. Don't. Three seconds feels like ten on stage and reads as confidence.

---

## Slide 6 · Scale — *1:00*

**On screen.** 1M+ calls a day · 5–6 MB each · ≈5.5 TB a day · **0** recordings may be lost.

**Say.** One number at a time, and let the last one land on its own. "A thousand lost recordings a day is a thousand lost recordings a day. Ninety-nine point nine percent isn't a passing grade here — these are Payments-regulated recordings, so the number is zero.

That's the moment this stopped being a file transfer problem and became a distributed systems problem."

**Why it exists.** The stakes, priced. Without the zero, everything that follows looks like over-engineering.

**Watch for.** `[FILL]` — 5.5 TB is derived from 1M × 5.5 MB. Use the real S3 growth figure if you have it. Measured beats derived, and someone will do the multiplication.

---

## Slide 7 · The constraint — *0:30*

**On screen.** Every approved enterprise ingestion mechanism evaluated. None compatible with the vendor. One integration point survived: their API.

**Say.** "Waiting for the vendor to build us something wasn't on the table. So the question stopped being 'how do we move a file' and became 'how do you build enterprise ingestion when the only surface you're allowed to touch is somebody else's API.'"

**Why it exists.** Establishes that the constraints were external, not chosen. Cheapest slide in the deck and the **first one to cut** if you're over — fold it into slide 6 as a single sentence.

---

## Slide 8 · Two APIs — *0:45*

**On screen.** Streaming On Demand — *looked promising*. Batch Export — *looked painful*.

**Say.** Describe both in one sentence each, then: "We were right about which one was painful. We were wrong about what that meant."

Do not explain that. Advance.

**Why it exists.** Tightens open question 2 with a concrete pair the audience can hold. The unresolved half-sentence is doing the work.

---

## Slide 9 · Experiment 1 — *1:00*

**On screen.** Does Streaming On Demand scale? · **>90%** measured / **100%** required.

**Say.** Celebrate the 90% for a beat — it was a real result and the team was pleased with it. Then: "Ninety percent is a great engineering result and a failing grade at the same time."

Then one spoken sentence, no slide: "Every call is tracked as state. Streaming lands, the call closes. It doesn't land inside its expected window, recovery opens automatically. Nobody reconciles anything by hand." Appendix A3 has the detail if Q&A wants it.

**Why it exists.** First worked example of the method: we didn't argue about whether streaming would scale, we measured it. It also creates the gap the rest of the talk lives in.

---

## Slide 10 · Recovery is a workflow — **closes open question 2** — *1:15*

**On screen.** Create export job → poll → fetch metadata → download paginated ZIPs → extract. *Long-running. Asynchronous. Fails in the middle.* Then, in green: *Streaming: 90% of the volume, 10% of the engineering. Exports: the reverse.*

**Say.** Walk the five steps quickly — the steps aren't the point. The point is that this thing has waits, retries and callbacks, and it spans several Lambdas.

Then close question 2 explicitly: "That's the first of the three. The painful API wasn't the peripheral one. Streaming was most of the traffic and almost none of the difficulty. Everything hard on this project lives in the recovery path — including the thing that nearly went wrong."

**Why it exists.** Two jobs. It establishes the *shape* that forces every later decision, and it pays off a promise early. Closing one loop at slide 10 is what makes the room keep holding 1 and 3 for the next fifteen slides.

**Watch for.** Say "that's the first of the three" out loud. The green corner marker alone is too quiet for the first payoff — after this one they'll spot it themselves.

---

## Slide 11 · Experiment 2 — *1:00*

**On screen.** Orchestration approaches: Step Functions · hand-rolled state machine · Saga · event-driven. Implemented in Java Spring and TypeScript. Winner: Step Functions + TypeScript.

**Say.** "We didn't shortlist these. We built in each of them."

Then, out loud and not on the slide: "It won on simplicity and resiliency — and honestly, on what the team already knew."

**Why it exists.** The credibility hinge of the whole talk. Team familiarity is not a measurement, and someone in that room was in those conversations. A talk that claims pure measurement when the audience remembers otherwise loses everything downstream, including the parts that *are* measured.

**Watch for.** Don't soften "honestly." It's the word doing the work.

---

# ACT 3 — The turn · 5:15

## Slide 12 · The obstacle — *0:45*

**On screen.** At the time, AWS SAM had no practical support for developing and debugging Step Functions locally.

**Say.** "Fine for one Lambda. Not for an orchestration built from multiple Lambdas with asynchronous callbacks, retries, waits and polling loops. There was nowhere to run the thing end to end except AWS."

**Why it exists.** Turns a talk about vendor APIs into a talk about your feedback loop. This is the pivot.

**Watch for.** `[FILL]` — verify whether this is still true today. If AWS has improved it, say so from the stage: "this may have improved since." Costs you nothing. Being corrected from the floor costs you the room, and this is the single most checkable claim in the talk.

---

## Slide 13 · Six steps to test one change — *1:00*

**On screen.** Deploy → wait for the pipeline → execute remotely → collect logs from several services → diagnose → repeat. And **[N] min**, one iteration.

**Say.** Walk the loop with your finger, one step at a time, then land the number. "That's the price of finding out you got a retry policy wrong."

**Why it exists.** Converts an abstract complaint into a number. Slides 15, 21 and 26 all reference it.

**Watch for.** `[FILL]` — this number makes the next three slides mean something. Without it the argument is a feeling.

---

## Slide 14 · The scene — *2:00*

**On screen.** Nothing. A dark slide with a dash.

**Say, from memory, not from notes:**

"A single Step Functions execution fans out across many Lambdas, and every one of them writes to its own log stream. So when an execution failed, answering 'which state broke, and why' meant opening CloudWatch, finding each stream, and correlating them by hand — by timestamp, by request id, by eye.

Find the invocation. Match it to the state transition. Work out whether the retry fired before or after the callback.

I remember sitting there with [N] streams open across [N] tabs, trying to reconstruct one execution, and thinking: I'm not debugging a workflow. I'm doing archaeology."

**Why it exists.** The one scene in the talk. It makes the [N] minutes on slide 13 physical, and it's the moment the audience feels the problem rather than being told about it. A blank slide forces them to look at you.

**Watch for.** Two things. Rehearse this until it's not read — a scene delivered from a script stops being a scene. And `[FILL]` the real stream/tab count. If a teammate said something quotable during that stretch, use it — **verbatim only**. A quote a colleague doesn't recognise costs you more than no quote.

---

## Slide 15 · The warrant — *1:30*

**On screen.** *The real cost wasn't slowness. At that price, you stop testing alternatives. You start deciding by opinion.*

**Say.** Slow right down — this is the load-bearing sentence of the talk.

"We made a rule at the start of this project: experiment first, implement later. Every decision backed by evidence. It's a good rule, it's free to say, and it has a price nobody puts on the slide. The price is the cost of one iteration.

Watch what happens at [N] minutes a cycle when a real architectural question comes up. Someone proposes option A, someone prefers option B, and testing both means two prototypes with several iterations each. So the second experiment doesn't get built. Nobody refuses it — it just never becomes anyone's next task, because whoever would build it can see what it costs and can also see a deadline.

What settles the question instead is the room. The most senior voice, or the most confident one. And that gets written into the ADR as a decision, and described afterwards as engineering judgment."

**Why it exists.** This is the argument. Everything before it is setup; everything after it is evidence. If a listener accepts this slide and nothing else, the talk worked.

**Watch for.** When you rehearse by retrieval, this is where you'll stumble. That's normal and it means the sentence needs more work, not that the slide is unclear.

---

# ACT 4 — What we built · 5:55

## Slide 16 · The decision — *0:40*

**On screen.** Build the environment that runs the whole platform on a laptop. **First.**

**Say.** "So we stopped building the product and went and built the loop. That felt wrong at the time. It was the highest-leverage week of the project."

**Why it exists.** The claim, stated once, in the middle. In a talk the claim can sit here because nobody's approving anything — the close is where you ask.

**Watch for.** `[FILL]` — how long it actually took. Slide 29's objection lives or dies on this number.

---

## Slide 17 · LocalStack — *0:55*

**On screen.** Step Functions · Lambda · DynamoDB · SQS · S3 — *the same CDK definitions as production, pointed somewhere else.*

**Say.** Lean hard on the CDK line. "This isn't a hand-written approximation of production that drifts the moment someone changes a stack. It's production's own definitions pointed somewhere else. One source of truth, two targets."

Then answer your own next question flatly: "Is that enough? No."

**Why it exists.** It's what makes the local environment trustworthy rather than a parallel fiction. Without this sentence, "we used an emulator" sounds like a shortcut.

---

## Slide 18 · The tooling — *1:00*

**On screen.** Six cards: prepare local infrastructure · deploy the CDK stack locally · generate test data · execute the state machine · reset the environment · automate the repetitive parts.

**Say.** "LocalStack solved half of it. The other half was that every developer still had to hand-assemble an environment before they could run anything. So I wrapped the whole path in scripts. A few commands, cold laptop to a running execution."

**Why it exists.** Pre-empts "so you just installed LocalStack?" — the gap between *running* an emulator and *using* one is most of the work, and this is where you get credit for it.

**Watch for.** `[FILL]` — if you can show the real commands, do. One live command on screen beats three of these cards.

---

## Slide 19 · Distributed tracing — *0:55*

**On screen.** Collect logs from every Lambda → correlate into one timeline → follow the state transitions → reconstruct the flow. *Works against local, Dev and QA.*

**Say.** "The archaeology problem from earlier doesn't disappear just because the execution now happens locally — it's the same fan-out across the same Lambdas.

And that last line matters more than it looks. A debugging experience that only exists on your laptop turns the local environment into a private toy nobody trusts for anything real. Making it identical wherever the execution ran is what let it become the way we looked at the system."

**Why it exists.** Callback to slide 14, which is what makes it satisfying rather than a feature list. Also sets up your concession on slide 28 — the tracer working against Dev and QA is the answer to "LocalStack isn't AWS."

---

## Slide 20 · The visualization UI — *1:00*

**On screen.** Screenshot, plus what it shows: state machine progress, current and previous state, Lambda invocations, execution history, correlated logs, timing.

**Say.** "Debugging stopped being log reading and became reading a workflow."

Then stop talking for five seconds and let them look.

**Why it exists.** The only slide where showing beats arguing.

**Watch for.** `[FILL]` — this is the most persuasive artifact you have and it costs you nothing to add. With the placeholder still in place, this slide is the weakest in the deck.

---

## Slide 21 · Before / after — *1:00*

**On screen.** BEFORE **[N] min** — a deploy and a pipeline. AFTER **[N] sec** — on a laptop, offline.

**Say.** Give both numbers. Then stop for a full second before anything else.

**Why it exists.** The whole talk points here. Slides 2 through 20 exist to make this pair of numbers mean something.

**Watch for.** `[FILL]` — the most important pair of numbers in the deck. If you get nothing else, get this. Objection 2 in Q&A is unanswerable without it.

---

## Slide 22 · The honest answer — *0:25*

**On screen.** [Claude Code] did the reasoning. [Uncle Dev] was the harness. **Neither made a decision.**

**Say.** Twenty-five seconds, no more. "Building a local platform, a tracer and a UI on top of delivering the product isn't something one engineer does at the old price of writing software. That's what changed.

And none of it chose anything. Every architectural call in this talk came from a measurement."

**Why it exists.** Pre-empts the "this is AI hype" reaction before Q&A, and does it with a guard-rail rather than a defence. **Second slide to cut** if you're over — say it over slide 21 instead.

**Watch for.** `[FILL]` — your drafts say "Cloud Code." Confirm both names before this goes on a screen in front of your team.

---

# ACT 5 — The payoff · 5:15

## Slide 23 · Experiment 3, the question — *0:40*

**On screen.** Step Functions bill per state transition. Polling is state transitions.

**Say.** "So we had a worry: at our volume, waiting inside the workflow is going to be expensive.

Notice that on most projects that sentence *is* the decision. Someone senior says it, the room agrees, and you build around it."

**Why it exists.** Sets up the reversal, and the second sentence makes the audience complicit — most of them have been in that meeting.

---

## Slide 24 · The EventBridge alternative — *0:50*

**On screen.** Schedule → terminate → wake up later → check status → repeat. *It worked. It was genuinely cheaper per job. We were pleased with ourselves.*

**Say.** Be honest about how good it was. The reversal only lands if the thing being reversed was real.

**Why it exists.** If you undersell this architecture, deleting it is obvious and the story has no weight. Sell it properly and the deletion is surprising.

---

## Slide 25 · [N] export jobs a day — **closes open question 1** — *1:30*

**On screen.** A very large **[N]**. *The number I promised you.* Savings: about [$X] a month. Complexity: permanent.

**Say.** "Not the projected number. The one production actually gave us."

Let it sit. Then: "We had built an entire second architecture to save money on something that happens [N] times a day. The savings came to roughly [$X] a month. The complexity was permanent — another service in the topology, another failure mode, another thing to explain to whoever's on call at 3am, forever.

We deleted it and shipped the polling loop inside Step Functions. Sometimes engineering means removing ideas."

**Why it exists.** Closes the loop you opened on slide 3 and pays for the entire local platform in one number.

**Watch for.** You confirmed this is measured production data, not an estimate. Have the source ready — this is the slide a good engineer will question, and "we estimated" after promising "production told us" would undo the credibility you built on slide 11.

---

## Slide 26 · What caught it? The loop. — **closes open question 3** — *1:00*

**On screen.** *What caught it? The loop. That comparison cost days, not months. At pipeline prices we'd have argued about it instead — and shipped the clever one.*

**Say.** "That's the third question. We almost shipped the wrong architecture, and what caught it wasn't judgment. It was that the comparison was cheap enough to run.

The local platform isn't why this project was pleasant to work on. It's why the architecture is right."

Then the outcome, briefly: shipped with one engineer, later three; onboarding was quick because everything was specified in the repo, so nobody needed tribal knowledge; hit the enterprise delivery commitments and the Payments regulatory deadline.

**Why it exists.** Ties the local platform to architectural correctness rather than developer happiness. That connection is the argument's spine and this is the only slide that states it.

**Watch for.** `[FILL]` — the regulatory deadline date if you can name it. A date turns this from a claim into a fact.

---

## Slide 27 · The counterfactual — *1:15*

**On screen.** *It would have worked. No bug. No incident. Just a system slightly harder to run than it needed to be — for years.* Then: **Nobody would have been wrong. Everybody would have been paying.**

**Say.** Slow all the way down.

"The cost of getting that wrong would never have shown up as a bug. It would have shown up as another service in the topology, another failure mode, another thing to explain at 3am — and no way to trace any of it back to a decision made in a meeting one afternoon."

Then the last line as written, and pause.

**Why it exists.** Every argument for tooling investment fails the same way: the cost of *not* doing it is invisible, so it never gets funded. This slide makes the invisible cost concrete. It's also the most quotable thing in the talk — the sentence people will repeat to their own leads.

**Watch for.** Don't rush into Q&A prep. Let the pause do its work.

---

# ACT 6 — Objections and scope · 2:30

## Slide 28 · "LocalStack isn't AWS." — *1:00*

**On screen.** *Correct.* Local catches workflow logic, state transitions, callbacks, retries. Dev and QA catch IAM, throughput, production behaviour. *Which is exactly why the tracing tool works against all three.*

**Say.** Concede fast and completely. "Correct. Anyone treating an emulator as the last gate before production is going to get hurt and will deserve it.

Local catches the logic bugs in seconds, which is most of them by count. The real environments catch the class of problem an emulator structurally cannot. We never claimed the emulator was the last gate — that's exactly why the tracer works against Dev and QA too."

**Why it exists.** The strongest objection in the room, raised by you rather than at you. Conceding it completely is what buys you everything else.

**Watch for.** Do not defend the emulator. The moment you argue that LocalStack is closer to AWS than they think, you've lost the exchange.

---

## Slide 29 · "We don't have time to build tooling." — *0:40*

**On screen.** *It took [N]. We spent longer than that waiting on pipelines in the first two weeks.*

**Say.** "The honest answer isn't the hours saved, because hours-saved arguments are easy to dismiss. It's the deadline. This project had a Payments regulatory date and we hit it — with one engineer, then three. We hit it because the middle of the project was fast, and the middle was fast because the first [N] went into the loop rather than the product."

**Why it exists.** The objection with the highest chance of being raised and the most damage if unanswered.

---

## Slide 30 · Where I'd tell you not to do this — *0:50*

**On screen.** Single Lambda? Use SAM. Not long-running? Don't build any of it. Not multi-service? You can already see what happened. *All four conditions.*

**Say.** Give the boundary before someone else does. Then add two things that aren't on the slide:

"A fast local loop tells you whether your logic is right. It tells you nothing about whether the architecture holds at a million files a day — the polling decision was made by a production volume number, and no emulator could have produced it.

And if the decision in front of you is cheap to reverse, don't build anything. Pick one and change it later. That's what cheap-to-reverse is for."

**Why it exists.** Naming your own limits is the strongest credibility move available, and it removes the easiest attack: one exception used to discard the whole argument. **Third slide to cut** — move it to Q&A if you're over.

---

# CLOSE · 1:55

## Slide 31 · The pattern — *0:45*

**On screen.** Form a hypothesis → build a small experiment → measure → compare alternatives → choose the simplest solution the evidence supports. *None of it works if one experiment costs a pipeline.*

**Say.** "We ran these five steps on every question I just walked you through. They're not a methodology, they're just refusing to decide from opinion.

And they have a prerequisite nobody puts on the slide."

---

## Slide 32 · The quote — *0:30*

**On screen.** *Good engineering is not choosing the smartest architecture. It's reducing uncertainty until the right architecture becomes obvious.*

**Say.** Deliver it slowly and let it sit. Don't gloss it.

**Why it exists.** Your line, and the best sentence in any of your drafts. It summarises the method — but it isn't an ask, which is why one more slide follows it.

---

## Slide 33 · Close — *0:40*

**On screen.** *The feedback loop is the first architecture decision.*

**Say.** "If you're starting something with waits, retries and callbacks in it — before you design the workflow, work out what it costs to run one. If the answer is a deploy plus a pipeline, go fix that first.

Thank you."

Stop. No summary slide, no thank-you slide, no "any questions."

**Why it exists.** The portable sentence — the line someone repeats when re-explaining your talk to their own lead without you in the room.

---

# APPENDIX — Q&A only

Do not present these. Jump to them when asked.

**Slide 34 · Appendix divider.**

**Slide 35 · A1 — Production architecture.** Step Functions orchestrate, SQS distributes, Fargate downloads the ZIPs, S3 stores, Fargate calls the callback, the workflow resumes. Say: downloading thousands of large ZIPs was never a Lambda problem; each service does the one thing it's best at.

**Slide 36 · A2 — Why Fargate + NestJS.** Prototyped in Go, Python, TypeScript, Lambda, Fargate, containers, NestJS, Middy; measured on throughput, scaling, maintainability, operational complexity. If someone asks "why not Lambda," answer in one sentence and redirect — this is a tar pit and every minute here is a minute off your claim. `[FILL]` one real measured comparison would strengthen it a lot.

**Slide 37 · A3 — Tracking.** Every call tracked through its lifecycle; streaming delivers and the call closes; nothing inside the window and recovery is scheduled automatically. Mention the vendor's later single-recording download API for small gaps.

**Slide 38 · A4 — What the local environment covers.** Be able to say precisely what it does *not* cover. A vague answer here undoes slide 28. `[FILL]` correct the "not in" list — it was inferred, not confirmed.

**Slide 39 · A5 — Platform milestones.** First IVR initiative on the new SDK, first monorepo, independently deployable services and Step Functions. Twenty seconds. Credibility, not argument.

---

# Q&A: the six questions, ranked

Prepare these harder than the slides.

1. **"LocalStack isn't real AWS — you have false confidence."** High likelihood, high damage. Pre-answered on 28. Concede, then point at what each environment is for.
2. **"What did the loop actually cost, before and after?"** High. Slide 21. If you don't have both numbers cold, the talk has no spine.
3. **"Why not SAM / Step Functions Local / a sandbox account?"** Certain. One sentence on what you evaluated and why it didn't cover multi-Lambda callbacks and waits, then stop.
4. **"You built a platform instead of shipping the product."** Medium likelihood, high damage. Answer with the deadline, never the hours.
5. **"Isn't the tracer just X-Ray?"** Medium, low damage. One line on what X-Ray didn't give you for local execution and cross-Lambda state correlation.
6. **"Is any of this reusable, or is it Call Recording specific?"** Medium — and the *good* question, the one that turns a talk into adoption. Have a real answer: what another team would have to do and roughly how long. If the honest answer is "it's coupled to our repo," say so and say what lifting it would take.

---

# Still bracketed

| # | Slide | What's needed |
|---|---|---|
| 1 | 21 | **Iteration time before and after.** Non-negotiable. |
| 2 | 13 | One deploy-and-test cycle, in minutes. |
| 3 | 16, 29 | How long the local platform took to build. |
| 4 | 25 | Export jobs per day, and the monthly cost delta. If the count isn't striking, cut the promise on slide 3. |
| 5 | 20 | Screenshot of the visualization UI. |
| 6 | 12 | Verify SAM's local Step Functions support, then and now. |
| 7 | 22 | Confirm "Claude Code" and "Uncle Dev." |
| 8 | 6, 14, 26, 38 | S3 growth figure · log-stream count in the scene · regulatory deadline date · what the local env does *not* cover. |

---

# Rehearsal

**Retrieve, don't reread.** Close the deck and reconstruct the talk out loud as *three promises and their payoffs*, not as a slide sequence. Rereading teaches you the deck; retrieval exposes the joints you can't explain. It's also the real situation — when someone interrupts on slide 6 you need the argument, not the order.

**The five joints.** Rehearse these transitions specifically. Everything else is sequence; these are the argument turning.

- **11 → 12** — we had the answer, so why was it hard to build?
- **15 → 16** — so what do you build first?
- **22 → 23** — fine, but did the loop change any actual architecture?
- **25 → 26** — what caught it?
- **26 → 27** — so who pays for that, and when?

**Sleep on it.** Draft done, then a full night before the final pass. The morning is when you'll notice which slides only make the talk longer. You have more than a week, so this one is free.

**Uncuttable.** Slides **3, 10, 25, 26** (an opened loop that never closes is worse than never opening it) and **14, 15, 21, 27** (the argument). Cut order if you're long: **7**, then **22**, then **30**.
