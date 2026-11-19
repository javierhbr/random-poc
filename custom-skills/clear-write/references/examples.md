# Examples

Three examples showing the target. Figures in the proposal examples are invented to show the format; never invent figures in real output.

## Contents
1. 1 page · explain · general · standard · neutral
2. 1 page · propose · executive · overview · neutral
3. 3 pages · propose · executive · overview · skeleton with TL;DR

---

## Example 1: 1 page, explain

```markdown
# Technical debt is the cost of shortcuts you pay back later

Technical debt is the extra work a team takes on when it picks a quick fix now instead of a cleaner solution. Like a loan, it buys speed today and charges interest until it is paid back.

**Why it matters.** The interest shows up as slower work. Every change takes longer because people must work around old shortcuts, and each workaround adds a little more. Left alone, a team can spend more time managing old problems than building new things. Bugs also become more likely, because tangled code is hard to change safely.

**Where it comes from.** Most debt is a reasonable trade, not a mistake. A team ships a simple version to meet a launch date, planning to improve it later. The problem starts when "later" never comes. Debt also builds up quietly: tools age, the people who understood a system leave, and needs drift away from the original design.

**How to tell it is growing.** The signs are practical. Small changes need large effort. The same parts of the system break again and again. New team members take weeks to become useful because nothing works the way they expect.

**How teams pay it down.** Treat it like a budget, not a crisis. Many teams reserve a fixed share of each work cycle for cleanup, starting with the areas that change and break most often. Cleaning up code nobody touches gains little.

**Key takeaway.** Some technical debt is healthy, because speed sometimes matters more than polish. The danger is debt nobody tracks. Write shortcuts down when you take them, and decide on purpose when to pay them back.

---
Explain · General · Standard · Neutral · 1,579 / 3,000 characters
```

Why it works:
- The first paragraph alone answers "what is technical debt?"
- Each bold paragraph opens with its point; reading only first sentences gives the full idea.
- An analogy (a loan) carries the concept for a general audience.
- The takeaway gives a rule to act on, not a recap.
- It came in well under 3,000 and wasn't padded.

---

## Example 2: 1 page, propose

```markdown
# Move regression testing to API tests and retire Studio by Q3

Replace our 5,000 Studio regression tests with API-level tests over two quarters. It cuts test upkeep from two full-time engineers to half of one, saving about $150K a year.

**Why it matters.** Studio tests are now the slowest part of every release. Each deployment waits about 3 hours for them, and a failed run takes a specialist a day to diagnose. That delay hits every team that ships.

**Risk of not doing it.** The Studio licence renews in March for three years at $120K. Renewing locks in today's cost and speed until 2030.

**API tests are faster to write and run.** A new test takes hours instead of days, because it is a plain conversation sent to the API. The full suite runs in minutes, so every deployment gets full coverage.

**Failures are easy to fix.** When a test fails, the log shows exactly which step broke. Any engineer can fix it, not only the two Studio specialists.

**The cost is small and spread out.** About 6 engineer-weeks builds the framework and moves the 500 most important tests. The rest move or retire as their features change, not in one big push.

**Next step.** Approve a two-week pilot on one product line. [owner] reports results by [date], before the March renewal decision.

---
Propose · Executive · Overview · Neutral · 1,255 / 3,000 characters
Gaps: [needs: owner], [needs: pilot end date]
```

Why it works:
- The conclusion gives the decision and the number an executive cares about.
- The risk names a date, a duration and a cost.
- Rationale points are headed by their conclusions, strongest first.
- The next step is a single, small, approvable action with an owner and date (marked as gaps).

---

## Example 3: 3 pages, propose (skeleton)

```markdown
# Move regression testing to API tests and retire Studio by Q3

**TL;DR:** Replace Studio regression tests with API tests by Q3; it saves about $150K a year and cuts release waits from hours to minutes. Approve a two-week pilot now, before the March licence renewal.

## Conclusion
[~500 chars: decision, main benefit with number, timeframe]

## Why it matters
[~1,500 chars: release delay, who it affects, cost of specialist time]

## Risk of not doing it
[~1,000 chars: March renewal, 3-year lock-in, cost, what keeps getting worse]

## API tests take hours to write, not days
[point: how, evidence, example]

## Any engineer can fix a failing test
[point: log clarity, removes specialist bottleneck]

## The migration costs 6 engineer-weeks, spread over two quarters
[point: cost, phasing, what moves first]

## Studio's one advantage, visual flows, matters for under 5% of tests
[point: main objection and its answer; rejected alternative in two sentences]

## Next step
[~1,000 chars: pilot scope, owner, date, decision point before March]

---
Propose · Executive · Overview · Neutral · 8,400 / 9,000 characters · TL;DR 191 / 300
```

Why it works:
- The TL;DR alone is enough for an executive with 30 seconds.
- Every rationale heading is a claim; reading only the headings gives the argument.
- The main objection gets its own point instead of being ignored.
