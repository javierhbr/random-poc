> **Fill before publishing — delete this block.** Eight items appear in brackets and the piece cannot go out with them open: the before/after iteration time, how long the local platform took to build, real export jobs per day, the monthly cost delta, the number of log streams in the opening scene, the actual bug in the opening scene (I wrote a plausible one — replace it with something that really happened), confirmation of the tool names (your drafts say "Cloud Code"; I've written Claude Code), and whether AWS SAM's local Step Functions support has improved since.
>
> **One warning about the structure.** This version plants four questions and answers them later. That technique has exactly one failure mode: if a payoff is smaller than the setup promised, the reader feels handled and stops trusting you. The riskiest one is the export-job count — I've promised the reader an "embarrassingly small number" early on. If that number turns out to be unremarkable, cut the promise rather than the number.
>
> Also decide how far this travels. Outside Capital One, the vendor's name, the exact volumes and the internal tool names need to come out.

# How LocalStack Saved the StateMachine

There is a specific kind of tired that comes from debugging a distributed workflow with a browser.

An execution had failed somewhere in the middle. A single Step Functions execution in our pipeline fans out across a set of Lambdas, and each one writes to its own CloudWatch log stream. So answering "which state broke, and why" meant opening [N] streams in [N] tabs and correlating them by hand — by timestamp, by request id, by eye. Find the invocation. Match it to the state transition. Work out whether the retry fired before or after the callback.

Forty minutes later I had my answer: [a malformed field three states earlier].

Fix it, deploy, wait for the pipeline, trigger a new execution, start over. [N] minutes a round.

Somewhere in the middle of one of those reconstructions I remember thinking: I'm not debugging a workflow, I'm doing archaeology.

I want to convince you that this was not a developer-comfort problem. It was the largest architectural risk on the project, and it had nothing to do with the architecture.

**Two things to hold as you read.** There is a number later in this story that made every hour of the work below worth it, and it is embarrassingly small — smaller than any of us guessed, by a lot. And there is one decision I'm confident we would have gotten wrong. Not might have. Would have.

## The problem we were actually solving

The ticket was one sentence. A call ends, an audio file is generated, and that file has to get into Capital One.

The platform handles more than a million calls a day. Each recording is 5–6 MB, so roughly 5.5 TB a day of audio, and because these are Payments-regulated recordings the tolerance for loss is not 99.9%. It's zero. A thousand lost recordings a day is a thousand lost recordings a day.

Before designing anything we evaluated every approved enterprise mechanism for getting files into the company. None were compatible with the IVR vendor's platform, and waiting for the vendor to build new capabilities wasn't an option we had. One integration surface survived: their API.

That API offered two things with opposite personalities. **Streaming On Demand** pushes each recording to us the moment the call ends. **Batch Export** creates an asynchronous job that eventually returns every recording inside a requested time window, as paginated ZIP files.

Streaming looked promising. Exports looked painful.

We were right about which one was painful and wrong about what that meant. Hold that too.

We prototyped streaming and measured it: more than 90% of recordings delivered. That is a good engineering result and a failing grade at the same time, because the requirement was all of them.

So — and here is where the two judgments above start to invert — the remaining slice needed a recovery path. Recovery is not a download. It's a workflow: create the export job, poll until it completes, fetch the metadata, page through the ZIP downloads, extract. It runs for a long time. It fails in the middle. It spans several Lambdas and needs waits, retries and callbacks. And deciding *when* to trigger it is a system of its own — every call is tracked as state, streaming success closes the call, and a recording that doesn't arrive inside its expected window opens the recovery workflow automatically. Nothing is reconciled by hand.

That's the answer to the second thing I asked you to hold. The painful API wasn't the peripheral one. Streaming was 90% of the volume and about 10% of the engineering; exports were the reverse. Every difficult decision on this project, including the one I said we'd have gotten wrong, lives inside the mechanism we built to handle the recordings that streaming missed.

We prototyped four orchestration approaches for it — Step Functions, a hand-rolled state machine, a Saga, and a purely event-driven design — in both Java Spring and TypeScript. Step Functions with TypeScript won on simplicity and resiliency, and honestly, on what the team already knew. That last factor isn't a measurement and I'm not going to pretend it was.

Then implementation started, and the decision we'd made carefully became the decision we could barely execute.

## The obstacle nobody plans for

At the time of this project, AWS SAM had no practical support for developing and debugging Step Functions locally.

For a single Lambda this is a non-issue. For an orchestration built from multiple Lambdas with asynchronous callbacks, retries, waits, polling loops and distributed state transitions, it meant there was nowhere to run the thing end to end except AWS. Every change — a retry policy, a state transition, an input shape — went through the same loop:

1. Deploy infrastructure.
2. Wait for the pipeline.
3. Execute the workflow remotely.
4. Collect logs from several services.
5. Diagnose.
6. Repeat.

[N] minutes to find out whether a one-line change was right.

The obvious reading of that number is that it made us slow. That reading is too kind, and it's why teams live with a loop like this for years without ever putting it on a risk register.

**A third question, and this one I'd like you to actually sit with.** If our loop was that expensive, how did we end up with an architecture we still think is right? Nothing about the process I've just described should reliably produce a good answer. Something had to give.

## What a slow loop actually costs

Here is the mechanism, and it's the part of this I most want to land.

We started the project with a rule: experiment first, implement later. Every decision backed by evidence rather than preference. It's a good rule, it's free to state, and it has a price nobody puts on the slide. The price is the cost of one iteration.

Watch what happens at [N] minutes a cycle when a real architectural question comes up. Someone proposes option A. Someone else prefers option B. Testing both means two prototypes, each needing several iterations to reach a trustworthy answer, and each iteration costs a deploy and a pipeline. So the second experiment doesn't get built.

It isn't refused. Nobody ever says "we've decided not to gather evidence." It simply never becomes anyone's next task, because the person who'd build it can see what it costs and can also see a deadline.

What settles the question instead is the room. The most senior voice, or the most confident one, or whoever has the strongest prior. And this gets written into the ADR as a decision, and described afterwards as engineering judgment.

A slow feedback loop does not merely slow a team down. It changes who decides — from the evidence to the hierarchy — and it does it invisibly, which is why nobody fixes it.

The asymmetry is what makes it expensive. The decisions that most need evidence are exactly the ones a slow loop starves: architectural choices are the hardest to reverse, they usually turn on a production number nobody has measured yet, and being wrong about them is paid down over years of on-call. Cheap decisions survive being made from opinion. Expensive ones don't, and those are precisely the ones a costly loop pushes into opinion.

There's a version of this argument that says the fix is discipline — mandate the experiment, put it in the definition of done. I don't believe it. When architecture research on this project started it was essentially one engineer, because the IVR Data team was committed to other initiatives. One engineer has no authority to win an architecture debate, which means evidence was the only currency available. One engineer also has no slack. If gathering evidence had stayed expensive, I would not have gathered it — not out of laziness, but because the arithmetic didn't work.

Discipline doesn't beat arithmetic. Changing the arithmetic does.

So we stopped building the product and went and built the loop. That felt wrong at the time.

**And a fourth question, since I've now spent a page telling you to do this.** When would I tell you not to? There's a real answer and I'll give it near the end, because a recommendation with no boundary is a slogan.

## The local platform

The goal was blunt: run the entire platform on a laptop before deploying anything to AWS.

**LocalStack as the execution environment.** Step Functions, Lambda, DynamoDB, SQS and S3, plus the supporting infrastructure — all of it stood up from the same CDK definitions we use in production. That detail is what makes the environment worth trusting. It isn't a hand-written approximation of production that drifts the moment someone changes a stack. It's production's own definitions pointed somewhere else. One source of truth, two targets.

**Tooling, because LocalStack solved half the problem.** Standing up the emulator still left every developer hand-assembling an environment before they could run anything. I wrapped the whole path in scripts: prepare the local infrastructure, deploy the CDK stack locally, generate realistic test data, execute the state machine, reset to clean, and automate the parts we'd otherwise retype every morning. A few commands from a cold laptop to a running execution.

**Distributed tracing, because running it isn't the same as understanding it.** The archaeology problem from the opening doesn't disappear because the execution now happens locally — it's the same fan-out across the same Lambdas. So I built a tracer that collects the logs from every Lambda in an execution, correlates them into a single timeline, follows the state transitions, and reconstructs the flow as one narrative instead of [N] parallel ones.

The tracer works against Dev and QA as well as local, and that was deliberate. A debugging experience that only exists on your laptop turns the local environment into a private toy nobody trusts for anything real. Making it identical wherever the execution ran is what let it become the default way we looked at the system.

**A visualization UI, because at that point you may as well look at it.** State machine progress, current and previous state, Lambda invocations, execution history, correlated logs, timing. Debugging stopped being log reading and became reading a workflow.

Before: [N] minutes, a deploy and a pipeline. After: [N] seconds, on a laptop, offline.

I should say plainly that building a local platform, a tracer and a UI *on top of* delivering the product is not something one engineer does at the old price of writing software. [Claude Code] did the reasoning and [Uncle Dev] was the engineering harness. Neither made a decision — every architectural call in this piece came from a measurement — but they moved the cost of building throwaway infrastructure from weeks to days, and that is the only reason the local platform was affordable at all.

## The architecture we deleted

This is the decision I said we would have gotten wrong, and the answer to the question about how a broken process produced a right architecture.

It didn't. We nearly shipped the wrong thing.

Step Functions bill per state transition. A polling loop is state transitions. So we had a worry: at our volume, waiting inside the workflow is going to be expensive.

Notice that on most projects that sentence *is* the decision. It's plausible, it comes from someone credible, the room agrees, and you build around it.

We built the alternative instead: an EventBridge schedule that fires, checks the export job's status, terminates the execution, and wakes up later to do it again. No waiting inside Step Functions, no transitions billed for waiting. It took [N] to build and it worked. It was genuinely cheaper per job. We were pleased with ourselves.

Then we went and got the real number.

**[N] export jobs a day.** That's the number I promised you at the top.

We had built an entire second architecture to save money on something that happens [N] times a day. The savings came to roughly [$X] a month. The complexity was permanent — another service in the topology, another failure mode, another thing to explain to whoever is on call at 3am, forever.

We deleted it and shipped the polling loop inside Step Functions. Sometimes engineering means removing ideas.

Now the counterfactual, which is the whole point. At pipeline prices that comparison never happens. Not because anyone decides badly, but because the belief was plausible and testing it would have cost weeks against a regulatory deadline. We would have shipped the clever architecture. It would have worked. And nobody would ever have discovered that we were carrying permanent operational complexity to save a rounding error.

That's the part that should worry you, because the cost wouldn't have surfaced as a bug. It would have surfaced as a system slightly harder to run than it needed to be, for years, with no way to trace that back to a decision made in a meeting one afternoon. Nobody would have been wrong. Everybody would have been paying.

The comparison cost days because the loop was cheap. That is the entire return on the local platform, and it is not a developer-experience return.

## What I'd expect you to push back on

**"LocalStack isn't AWS. You're validating against an emulator and calling it confidence."**

Correct, and I'd concede it before defending anything. The local environment catches workflow logic, state transitions, callbacks and retries. It does not catch IAM behaviour, real throughput, production-scale timing, or the vendor's actual API responses. Anyone treating an emulator as the last gate before production is going to get hurt, and will deserve it.

That's precisely why the tracer works against Dev and QA. Local catches the logic bugs in seconds, which is most of them by count; the real environments catch the class of problem an emulator structurally cannot. The claim isn't that the emulator replaces those environments. It's that without it, every logic bug also costs a pipeline — and that tax is what changes who decides.

**"You built a platform instead of shipping the product."**

The honest answer isn't the hours saved, because hours-saved arguments are easy to dismiss. It's the deadline. This project had a Payments regulatory date attached to it, and we hit it — with one engineer, then three. We hit it because the middle of the project was fast, and the middle was fast because the first [N] went into the loop rather than the product.

**"Why not SAM, or the Step Functions Local container, or just deploy to a sandbox account?"**

We looked. At the time none of them ran the shape of thing we actually had — multiple Lambdas, asynchronous callbacks, waits, and a polling loop — end to end on a developer machine. If that has changed since, use the newer option. The argument here isn't about LocalStack specifically. It's about the number.

**"Is any of this reusable, or is it specific to your project?"**

The tooling is coupled to our repository and our CDK stacks. The tracer is the most portable piece. If your team wants it, the conversation is about what lifting it would take, not about whether you can install it this afternoon.

## Where I'd tell you not to do this

The fourth question, answered.

Building any of this is the wrong call unless four things are true at once: the workflow is long-running, it's asynchronous, it spans multiple services, and it's hard to observe from outside. Miss one and the investment doesn't return.

A single Lambda? SAM is fine. A synchronous request-response service? You already have a fast loop; you don't need mine. A workflow you can hold in your head from one log stream? Don't build a tracer for it. And if the decision in front of you is cheap to reverse, don't build anything — just pick one and change it later. That's what "cheap to reverse" is for.

There's a narrower caveat on the argument itself, and it cuts against me. A fast local loop tells you whether your logic is right. It tells you nothing about whether your architecture holds at a million files a day. Our prototypes narrowed the field, but the decision on the polling loop was made by a production volume number, and no emulator could have produced it. Trust the local environment alone and you'll ship the wrong thing for a different reason.

## So

Before you design the next workflow with waits, retries and callbacks in it, work out what it costs to run one. Time it. If the answer is a deploy plus a pipeline, go fix that before you write the design doc — because whatever that number is, it's about to become the price of every architectural decision you make afterwards, including the ones you won't realise you were supposed to make.

Good engineering is not choosing the smartest architecture. It's reducing uncertainty until the right architecture becomes obvious.

Which is another way of saying that the feedback loop is the first architecture decision.
