# From Green Dashboards to Guardrails: How Uncle Dev Actually Builds Business Observability

In [part one](./observability-02.md), we watched a shoe store bleed money behind a 100% green dashboard. We made the case for **business-driven observability**: stop measuring whether servers are awake, start measuring whether customers can actually buy shoes.

That's the easy part. Everyone nods along to "instrument the customer journey." Then they walk back to their desk and do the thing that *feels* like progress but quietly makes everything worse: they instrument **everything**. A metric on every function. A tag on every field. Six months later they have a $40,000 monitoring bill, 300 alerts a week, and still no idea whether checkout is healthy.

So this is part two: not *why* business observability matters, but *how* the **Uncle Dev** engineering skill actually builds it — the rules, the guardrails, and the order of operations that keep you from drowning.

Here's the surprising thing about the whole approach. It doesn't start by telling you what to measure. It starts by talking you *out* of measuring.

## 1. The Default Answer Is "No"

Most observability advice is additive: here are ten more things you should track. Uncle Dev flips it. When you're about to add a custom metric, the default answer is **no**.

Why so stingy? Because you already get an enormous amount of telemetry for free. Your framework automatically records how often each endpoint is hit, how often it fails, and how slow it is. Your logs already capture what happened in any individual request. Your traces already show the path a request took through your services.

> **Jargon Buster: Auto-Instrumentation**
>
> - **Auto-Instrumentation:** Free, automatic measurement that your tools generate without you writing any code — like a car that records its own speed, fuel level, and engine warnings without you wiring up a single sensor.

So before any new metric gets added, it has to prove it isn't already covered by something you're paying for anyway. A custom metric isn't a freebie — it's a long-term tenant. It costs money to store forever, it shows up on dashboards people have to read, and every one you add makes the *important* numbers harder to find in the crowd.

> **The Big Takeaway:** More metrics is not more visibility. Past a certain point, more metrics is *less* visibility — the signal drowns in the noise. Uncle Dev treats every new metric as guilty until proven necessary.

## 2. The Five Gates: How a Metric Earns Its Place

So how does a metric prove it's necessary? It has to pass through five gates, in order. Fail any one, and it doesn't become a metric. (That's not a failure — most of the time, "no metric" is the correct answer.)

| Gate | The Question | If it fails… |
|---|---|---|
| **1. Action** | Will a real, named person change a decision based on this number? | It's a *vanity metric*. Drop it. |
| **2. Coverage** | Is this already visible through auto-instrumentation, logs, or traces? | You already have it. Use that. |
| **3. Aggregate** | Is the question "how many / how often / how fast" *across many cases*? | It's a "why did THIS one fail?" question → that's a **log or trace**. |
| **4. Durable** | Does this deserve a permanent, named chart — not a one-time look? | One-off curiosity → just query your logs once. |
| **5. Worth It** | Is the ongoing cost justified by the value? | Drop it. |

Let's make the trickiest gate concrete. Gate 3 — **Aggregate** — is where most teams go wrong.

Imagine you want to know *"Why did order #8421 fail at checkout?"* That feels like something to monitor. But it's a question about **one specific case**, and answering it requires the order ID — a value that's different for every single order. If you turn that into a metric, you create millions of tiny separate measurements, one per order, and your monitoring bill explodes.

The right tool for "why did *this one* fail?" is a **trace or a log**, where looking at one case at a time is exactly the point. A **metric** is for "how many orders failed *this hour*?" — the aggregate question.

> **The Big Takeaway:** Metrics answer "how many, how often, how fast." Logs and traces answer "what happened to this one." Forcing a single-case question into a metric is the number-one cause of surprise monitoring bills.

## 3. Is It a Business Metric or a Plumbing Metric?

Say a metric makes it through all five gates. Uncle Dev asks one more question, and it has a beautifully simple test:

> **The Litmus Test:** *If the system were running perfectly fine, but this number suddenly moved — would a non-engineer care?*

- **Yes?** It's a **business metric** — payments captured, signups activated, orders placed. The *product* team owns it. It goes on the executive dashboard.
- **No?** It's an **operational metric** — queue depth, retry counts, cache hit ratio. The *engineering* team owns it. It goes on the technical dashboard.

This isn't bureaucratic labeling. It decides three real things: **who owns the metric, which dashboard it lives on, and who gets paged when it breaks.** A "payments dropped to zero" alert should wake up someone who can think about revenue. A "retry queue is backing up" alert should wake up an engineer. Mixing them up is how you end up paging the wrong person at 3 AM.

## 4. The Deliverable Is a Plan, Not Code

Here's a move that makes Uncle Dev unusual. When it decides a metric is warranted, it does **not** immediately write code to emit it.

Instead, it produces a **Measurement Plan** — a plain, tool-agnostic description of *what* to measure and *why*, written in human language. One small spec per metric:

```yaml
metric:
  name: payments_captured        # the business name, not a code function name
  kind: business                 # business or operational?
  instrument: counter            # counting things → a counter
  question: "How many payments succeed, trending by provider and plan?"
  dimensions:
    - { name: provider,  reason: "compare success across Stripe vs Adyen" }
    - { name: plan_tier, reason: "are paid customers hit harder?" }
  owner: payments-team
  dashboard_layer: executive
```

Notice what this spec contains: the name in plain domain language, whether it's business or operational, the exact question it answers, and — crucially — a *reason* for every single breakdown you want to slice it by.

> **Jargon Buster: Dimensions (a.k.a. Tags)**
>
> - **Dimensions:** The ways you can slice a number — by region, by plan, by payment provider. Powerful, but each new slice multiplies the cost. Uncle Dev's rule: add a dimension *only* when you can name the comparison you'll make with it ("are we failing more on Stripe than Adyen?"). And never, ever slice by something unbounded like a user ID or email — that's the cardinality bomb from part one.

Why a plan instead of code? Because **the decision of *what* matters should not be tangled up with the tool you happen to use today.** Whether you emit this through OpenTelemetry, Datadog, or CloudWatch is a *separate*, replaceable choice. The Measurement Plan survives a tool migration; emit code does not.

## 5. Then — and Only Then — the Seven Steps

Deciding *which* metrics deserve to exist is the gatekeeping half. The other half is wiring up a full customer journey end-to-end. Uncle Dev runs this as a strict seven-step sequence:

| Step | What happens |
|---|---|
| **1. Journey** | Pick **one** critical journey (Checkout, Send Mail). Write it as objective → action → success. |
| **2. Instrument** | Trace it across every service, tagging each step with business context (`journey.name`, `journey.step`). |
| **3. SLO** | Give each step a target promise and an *error budget*. |
| **4. Criticality** | Spend your monitoring money where revenue lives; go light everywhere else. |
| **5. Dashboard** | Two linked layers: business view on top, engineering view one click beneath. |
| **6. Alert** | Alert on *burn rate*, with business context attached. |
| **7. Loop** | After every incident, prove the instrumentation caught it — or file the gap. |

The single most important rule here is **do one journey completely before starting the next.** A half-instrumented Checkout flow is worse than none, because it gives you *false confidence*. You think you're watching the money path; you're actually watching half of it.

> **Jargon Buster: Error Budget**
>
> - **Error Budget:** The small amount of failure you're allowed before breaking your promise. If you promise checkout works 99.9% of the time over a month, your budget is roughly **43 minutes** of failure that month. Budget healthy? Ship new features. Budget burning? Stop and stabilize. It turns "is reliability OK?" from an argument into arithmetic.

## 6. Alert on the Fire, Not the Smoke Detector Battery

Step 6 deserves its own moment, because it's where part one's promise — *"alert me that customers are frustrated, not that a database is lagging"* — actually gets built.

Traditional alerts fire on causes: *CPU is over 80%.* The problem? CPU spikes constantly without anyone noticing or caring. So engineers learn to ignore the alerts. Hello again, alert fatigue.

Uncle Dev alerts on **burn rate** instead — the speed at which you're eating your error budget — and it requires *two* time windows to agree before it pages anyone:

- A **short window** so it reacts fast when something genuinely breaks.
- A **long window** so a brief blip doesn't set off the siren.

And every alert carries the business translation baked in. Not *"PaymentService 500 errors elevated on host-7,"* but *"Checkout error budget burning — roughly $X/min at risk,"* with a link to the runbook that tells the on-call engineer exactly what to do.

> **The Big Takeaway:** Page humans for symptoms customers feel, never for internal causes. If a cause is bad enough to matter, it will show up as a symptom. If it never shows up as a symptom, it never deserved a page.

## 7. Uncle Dev Decides *What*; A Companion Builds *How*

There's one last piece of the design worth understanding, because it's what keeps everything above honest.

Uncle Dev draws a hard line: it owns the *thinking* — what to measure, why, business or operational, which dimensions. It deliberately refuses to own the *typing* — the specific library, the SDK calls, the naming conventions of your telemetry tool.

That second job is handed off to a **companion** configured per project. If your project uses CloudWatch, a CloudWatch companion takes each metric spec and turns it into real emit code, respecting that tool's quirks and limits. If no companion is set up, Uncle Dev delivers the Measurement Plan and *stops* — it will never guess a telemetry library and start writing code you didn't ask for.

This separation is the whole philosophy in miniature. **The expensive, durable decision is "what's worth measuring." The cheap, swappable decision is "which tool emits it."** Keep them apart, and you can change vendors without re-litigating what your business cares about.

## 8. Where This Lives in the Real Workflow

None of this is a separate "observability project" that happens after launch. Uncle Dev folds it into how features get built in the first place:

- **During spec:** For each thing the feature must do, run the five gates. Most acceptance criteria produce *zero* metrics — and that's the correct, expected outcome. The few that survive become the Measurement Plan.
- **During planning:** Each surviving metric becomes one small instrumentation task with a clear owner.
- **During build:** The companion emits it — and then you verify it actually answers the question it promised to answer.
- **After every incident:** You check whether your instrumentation caught the problem and pointed at the cause. If it didn't, the missing piece becomes the next backlog item.

That last loop is the engine of the whole thing. Every outage either *confirms* your observability works or *hands you* the exact gap to fix. Over time, your monitoring stops being a wall of guesses and becomes a map of the things that have actually hurt you.

## Final Thoughts: Discipline Is the Feature

Part one argued that your servers don't pay the bills — your customers do. Part two is about the discipline that turns that belief into a system you can actually run.

And the discipline is mostly **restraint**. Default to no metric. Make each one earn its place through five gates. Separate what's worth knowing from how you happen to record it. Instrument one journey completely before touching the next. Page humans only for pain a customer can feel.

It's tempting to measure everything, because measuring feels like caring. But a dashboard with 500 numbers tells you nothing, and a $40,000 bill for it tells you something worse. The teams that actually catch the silent checkout outage aren't the ones watching the most metrics.

They're the ones watching the *right* ones — and Uncle Dev's entire job is making sure that's a deliberate choice, every single time.
