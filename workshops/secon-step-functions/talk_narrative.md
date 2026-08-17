# How LocalStack Saved the StateMachine (Step Functions)
### 30-minute internal tech talk — slide-by-slide with speaker notes

---

## The argument, in one place

**Claim (what they should do Monday):** Before you build a distributed workflow, build the environment that runs it on your laptop. The local execution loop is the first architecture decision, not a developer convenience.

**Portable sentence:** *The feedback loop is the first architecture decision.*

**Warrant (the rule that has to hold):** When one iteration costs a deploy plus a pipeline, teams stop testing alternatives and start deciding by seniority. Cheap iteration is the precondition for evidence-based architecture — not a nice-to-have that follows it.

**Qualifier:** This pays off for long-running, multi-service, asynchronous workflows. For a single Lambda, SAM is fine and this is overkill. And LocalStack validates workflow logic, state transitions, callbacks and retries — not IAM, not throughput, not production-scale behaviour. Those still need Dev and QA, which is exactly why the tracing tool was built to work against both.

**Structural note:** the story now runs in this order — we chose Step Functions on evidence → we almost couldn't build them → LocalStack plus tooling fixed the loop → and *because* the loop was cheap, we caught the EventBridge mistake before shipping it. The polling-cost reversal is no longer the point of the talk. It's the proof.

---

# ACT 1 — HOOK (2 min, slides 1–3)

### Slide 1 — Title
**How LocalStack Saved the StateMachine**
*Step Functions, 1M recordings a day, and the loop that made every decision affordable*
[Your name · team · date]

> **Notes:** Just what's up while people sit down. Start on slide 2.

---

### Slide 2 — Hook
**We picked Step Functions because the experiments said so.**
**Then we almost couldn't build them.**

> **Notes (roughly):** "We did the research properly. We prototyped four orchestration approaches and Step Functions won on the measurements. Good decision. And then implementation started, and within about a week it was clear the decision was going to be very hard to execute — for a reason that had nothing to do with architecture."
>
> Pause. Slide 3.

---

### Slide 3 — What this talk is
**This is a talk about the tooling decision that made every other decision possible.**

> **Notes:** Say plainly: the production architecture is in the appendix and in the repo. What I want you to take home is the thing we built *around* it. Say it now so the architects in the room stop waiting for a system diagram.

---

# ACT 2 — SETUP (5 min, slides 4–8)

*Fast. This is context, not argument. If you're running long, this is the act to compress.*

### Slide 4 — How the ask arrived
> "A call ends, an audio file is generated, and that file must be transferred into Capital One."

> **Notes:** Read it flat. Let it sound as small as it sounded on day one.

---

### Slide 5 — The numbers
**1,000,000+ calls a day · 5–6 MB each · ≈ 5.5 TB a day · 0 recordings may be lost**

> **Notes:** One line at a time. The last one is what changes the problem. "Ninety-nine point nine percent is not a passing grade. A thousand lost recordings a day is a thousand lost recordings a day." These are Payments-regulated recordings — that's why zero is the number.
>
> ⚠️ **FILL:** I derived 5.5 TB/day from 1M × 5.5 MB. Use the real S3 growth figure if you have it — measured beats derived.

---

### Slide 6 — What was left to build on
**Every approved enterprise file-transfer mechanism: incompatible with the vendor.**
**One integration point survived: their API.**

> **Notes:** Waiting for the vendor to build us something wasn't on the table. So the question stopped being "how do we move a file" and became "how do you build enterprise ingestion when the only surface you're allowed to touch is someone else's API."

---

### Slide 7 — Two APIs, and the gap between them
**Streaming On Demand** pushes the recording the moment the call ends. It handled **more than 90%**.
**Batch Export** recovers the rest.

> **Notes:** "Ninety percent is a great result and a failing grade at the same time." One sentence on tracking — every call is tracked as state; streaming lands, it's closed; it doesn't land in the window, it falls into recovery automatically. Nobody reconciles by hand. Appendix has the detail.

---

### Slide 8 — The recovery path is a state machine
Create export job → poll until complete → fetch metadata → download paginated ZIPs → extract.
Long-running. Asynchronous. Fails in the middle.

> **Notes:** This is the thing the rest of the talk is about. It runs for a long time, it has waits and retries and callbacks, and it spans several Lambdas. We prototyped Step Functions, a hand-rolled state machine, Saga and event-driven, and Step Functions plus TypeScript won.
>
> Then: "So we had the right answer. Here's what happened when we tried to build it."

---

# ACT 3 — THE WALL (5 min, slides 9–12)

### Slide 9 — The obstacle nobody plans for
**At the time, AWS SAM had no practical support for developing and debugging Step Functions locally.**

> **Notes:** Be precise here — this is the factual claim someone will check. For a single Lambda, SAM was fine. For an orchestration with multiple Lambdas, async callbacks, retries, waits and polling loops, there was no way to run the thing end to end on a laptop.
>
> ⚠️ **FILL / VERIFY:** confirm this is still accurate today, or say from the stage "this may have improved since." Being current on it is credibility; being caught out on it costs you the room.

---

### Slide 10 — What one change cost
Deploy infrastructure → wait for the pipeline → execute remotely → collect logs from several services → diagnose → repeat.

> **Notes:** Walk the loop with your finger. Then land the number: one iteration of that cycle took [FILL: N minutes]. Say it plainly. "That's the price of finding out you got a retry policy wrong."
>
> ⚠️ **FILL — important:** how long one deploy-and-test cycle actually took. This number is what makes the next two slides mean anything.

---

### Slide 11 — THE SCENE *(blank slide — tell this, don't read it)*

> **Notes — no text on screen. Roughly:**
>
> "A single Step Function execution fans out across many Lambdas, and every one of them writes its own log stream. So when an execution failed, the question 'which state broke, and why' meant opening CloudWatch, finding each stream, and correlating them by hand — by timestamp, by request id, by eye.
>
> I remember sitting there with [N] log streams open across [N] tabs, trying to reconstruct one execution, and thinking: I'm not debugging a workflow. I'm doing archaeology."
>
> ⚠️ **FILL:** the real number of tabs/streams, if you remember it. And if you have a verbatim line someone on the team said during this stretch, use it — verbatim only. A quote a colleague doesn't recognise is worse than no quote.

---

### Slide 12 — The real cost wasn't slowness
**At that price, you stop testing alternatives.**
**You start deciding by opinion.**

> **Notes:** This is the warrant. Say it slowly, it's the load-bearing sentence of the talk.
>
> "We'd made a rule at the start of this project — experiment first, implement later. Every decision backed by evidence. That rule is free to say and it has a price, and the price is the cost of one iteration. At [N minutes] a cycle, nobody runs a second experiment. They just go with whoever sounds most confident."

---

# ACT 4 — THE TURN (9 min, slides 13–19)

### Slide 13 — The decision
**Build the environment that runs the whole platform on a laptop. First.**

> **Notes:** "We stopped building the product and went and built the loop. That felt wrong at the time. It was the highest-leverage week of the project."
>
> ⚠️ **FILL:** how long the local platform actually took to build. A week? Three? Whatever it was, say it — the objection on slide 24 lives or dies on this number.

---

### Slide 14 — LocalStack, running the whole thing
Step Functions · Lambda · DynamoDB · SQS · S3 — stood up from **the same CDK definitions as production**.

> **Notes:** Emphasise the CDK point. It's what makes this trustworthy rather than a parallel fiction: the local stack isn't a hand-written approximation of production, it's production's own definitions pointed somewhere else. Same source of truth.

---

### Slide 15 — LocalStack alone wasn't enough
Prepare local infrastructure · deploy the CDK stack locally · generate test data · execute the state machine · reset the environment.

> **Notes:** Running LocalStack solves half of it. The other half is that every developer still had to hand-assemble an environment before they could run anything. So I wrapped all of it in scripts. The goal was a few commands from cold laptop to a running execution.
>
> ⚠️ **FILL:** name the actual commands if you can show them — `make local-up`, or whatever they are. A real command on screen is worth three bullet points.

---

### Slide 16 — Distributed tracing
Collect the logs from every Lambda in an execution → correlate them into one timeline → follow the state transitions → reconstruct the flow.
**Works against local, Dev and QA.**

> **Notes:** The last line matters more than it looks. Building it to work against real cloud environments too is what stops the local environment becoming a private toy — the debugging experience is the same wherever the execution ran.

---

### Slide 17 — And then you can just look at it
State machine progress · current and previous state · Lambda invocations · execution history · correlated logs · timing.

> **Notes:** If you have a screenshot of the UI, this is the slide for it — put it here full-bleed and stop talking. "Debugging stopped being log reading and became reading a workflow." Show, don't describe.
>
> ⚠️ **FILL:** a screenshot of the visualization UI. This is the most persuasive artifact you have and it costs you nothing.

---

### Slide 18 — What the loop cost after
**Before: [N minutes], a deploy and a pipeline.**
**After: [N seconds], on a laptop, offline.**

> **Notes:** The whole talk points at this slide. Give both numbers and then stop talking for a second.
>
> ⚠️ **FILL — this is the single most important pair of numbers in the deck.** Before and after iteration time. If you have nothing else, get this.

---

### Slide 19 — How a one-engineer team afforded to build all this
**[Claude Code] did the reasoning. [Uncle Dev] was the harness. Neither made a decision.**

> **Notes:** Twenty seconds, no more. The honest framing: building a local platform, a tracing tool and a UI *on top of* delivering the product is not something one engineer does at the old price of writing software. That's what changed. And then the guard-rail sentence — none of it chose anything; every architectural call in this talk came from a measurement.
>
> ⚠️ **FILL / VERIFY:** the transcript says "Cloud Code" — I've assumed Claude Code. Confirm both names before this goes on a screen in front of your team.

---

# ACT 5 — THE PAYOFF (5 min, slides 20–23)

### Slide 20 — Now the loop earns its money
**Step Functions bill per state transition. Polling is state transitions.**

> **Notes:** "So we had a worry: at our volume, the polling loop is going to be expensive. On most projects that sentence *is* the decision — someone senior says it, the room agrees, and you build around it."

---

### Slide 21 — So we built the other one
EventBridge schedule → wake → poll → sleep → repeat.
**It worked. It was genuinely cheaper per job.**

> **Notes:** Be honest about how good it was. The reversal only lands if the thing being reversed was real. "We were pleased with ourselves."

---

### Slide 22 — Then we looked at the actual volume
**[N] export jobs a day.**

> **Notes:** "Not the projected number. The real one." Then: "We'd built a second architecture to save money on something that happens [N] times a day. The savings were about [$X] a month. The extra complexity was permanent — another service, another failure mode, another thing to explain at 3am."
>
> "We deleted it and shipped the simpler one."
>
> ⚠️ **FILL:** real export jobs per day, and the cost delta. An estimate is fine if you label it as one.

---

### Slide 23 — That comparison cost days, not months
**Because the loop was cheap.**
**At pipeline prices we'd have argued about it instead — and shipped the wrong one.**

> **Notes:** This closes the loop of the talk. The local platform isn't why the project was pleasant. It's why the architecture is right.
>
> Then the outcome, briefly: shipped with one engineer, later three, onboarded fast because everything was specified in the repo, hit the enterprise delivery commitments and the Payments regulatory deadline.
>
> ⚠️ **FILL:** the regulatory deadline date, if you're allowed to name it. A date makes this a fact instead of a claim.

---

# ACT 6 — OBJECTIONS AND SCOPE (4 min, slides 24–26)

### Slide 24 — "LocalStack isn't AWS."
**Correct. It validates workflow logic, state transitions, callbacks and retries.**
**Not IAM, not throughput, not production behaviour.**

> **Notes:** Concede this fast and completely — it's the strongest objection and conceding it is what buys you the rest. Then: that's exactly why the tracing tool works against Dev and QA. Local catches the logic bugs in seconds; the cloud environments catch the rest. We never claimed the emulator was the last gate.

---

### Slide 25 — "We don't have time to build tooling."
**It took [N]. We spent longer than that waiting on pipelines in the first two weeks.**

> **Notes:** Raise this yourself; it's coming anyway. The strongest version of the answer isn't the time saved — it's the deadline. We had a regulatory date and we hit it, and we hit it because the middle of the project was fast, not because the start was.

---

### Slide 26 — Where this doesn't apply
**Single Lambda? Use SAM.**
**Workflow that isn't long-running or multi-service? Don't build any of this.**

> **Notes:** Give the boundary before someone else does. The thing that justifies this investment is specifically: long-running, asynchronous, multi-service, and hard to observe. If your workflow isn't all four, this is overkill and I'd tell you not to do it.

---

# CLOSE (2 min, slides 27–28)

### Slide 27 — The pattern
Form a hypothesis → build a small experiment → measure → compare → choose the simplest thing the evidence supports.
**None of it works if one experiment costs a pipeline.**

> **Notes:** "We ran these five steps on every decision in this project. They're not a methodology, they're just refusing to decide from opinion. And they have a prerequisite that nobody puts on the slide."

---

### Slide 28 — Close
**The feedback loop is the first architecture decision.**

> **Notes:** "If you're starting something with waits, retries and callbacks in it — before you design the workflow, work out what it costs to run one. If the answer is a pipeline, go fix that first. Thank you."
>
> Stop. No summary slide. No thank-you slide.

---

# APPENDIX (Q&A only — do not present)

- **A1** — Production architecture: Step Functions orchestrate, SQS distributes, Fargate downloads the ZIPs, S3 stores, Fargate calls the Step Functions callback, the workflow resumes.
- **A2** — Why Fargate + NestJS for ingestion: prototypes in Go, Python, TypeScript, Lambda, Fargate, containers, NestJS, Middy — measured on throughput, scaling, maintainability, operational complexity.
- **A3** — The tracking platform: every call as state; streaming success closes it, timeout opens recovery. Plus the later single-recording download API for small gaps.
- **A4** — Local environment: what's in it and what isn't. **Correct the "not in" list — I inferred it.**
- **A5** — Platform milestones: first IVR project on the new SDK, the monorepo, independently deployable services and Step Functions.

---

## The six objections, ranked

Prepare these harder than the slides. This list is worth more than the deck.

1. **"LocalStack isn't real AWS — you have false confidence."** High likelihood, high damage. Pre-answered on slide 24. Concede immediately, then name what each environment is actually for. Do not defend the emulator.
2. **"What did the loop actually cost, before and after?"** High. If you don't have slide 18's numbers cold, the talk has no spine and a good engineer will find that in the first question.
3. **"Why not SAM / the Step Functions Local Docker image / just deploy to a sandbox account?"** Certain. Answer in one sentence with what you evaluated and why it didn't cover multi-Lambda callbacks and waits. Then stop — this is a tar pit.
4. **"You built a platform instead of shipping the product."** Medium likelihood, high damage. Answer with the deadline you hit, not with the hours you saved.
5. **"Isn't the tracing tool just X-Ray with extra steps?"** Medium, low damage. Have a one-line answer ready on what X-Ray didn't give you for local execution and cross-Lambda state correlation. Don't get drawn in.
6. **"Is any of this reusable, or is it Call Recording specific?"** Medium — and this is the *good* question, the one that turns a talk into adoption. Have a real answer: what another team would have to do to use your tooling, and how long it'd take them. If the honest answer is "it's coupled to our repo," say so and say what it'd take to lift it.

## Numbers to collect before you build the final deck

| # | Slide | What's needed | Why it matters |
|---|---|---|---|
| 1 | 18 | **Iteration time before and after** | The spine of the talk. Non-negotiable. |
| 2 | 10 | One deploy-and-test cycle, in minutes | Sets up #1. |
| 3 | 13, 25 | How long the local platform took to build | Answers the main objection. |
| 4 | 22 | Real export jobs per day, and the cost delta | The payoff story needs both. |
| 5 | 17 | A screenshot of the visualization UI | Cheapest persuasion available to you. |
| 6 | 9 | Verify SAM's local Step Functions support, then and now | The one factual claim someone will check. |
| 7 | 19 | Confirm "Claude Code" and "Uncle Dev" | The transcript says "Cloud Code." |
| 8 | 5, 23 | S3 growth figure; the regulatory deadline date | Turns claims into facts. |

## Before you present

You have more than a week. Use it in this order:

1. Fill the eight items above and rebuild any slide whose placeholder survives. A placeholder that reaches the room reads as a guess about your own project.
2. Draft done, then leave it a full night. The morning pass is where you'll see which slides only make the talk longer. Cut those.
3. Rehearse by closing the deck and reconstructing the argument out loud from memory. Where you stumble is where the argument is thin — not where the slide is unclear. Expect the stumble to be around slide 12; that's the warrant.
4. Time it. Twenty-eight slides in thirty minutes is about a minute each, but slide 11 needs two and slide 18 needs silence. If you're over, compress Act 2 — slides 4 through 8 are context, and context is what a technical audience can survive losing.
