# Everyone Finished. Nothing Worked.

## A plain guide to the Platform Spec

---

### The problem, in one story

A bank decides customers should be able to close their accounts online. It seems
simple. Three teams are involved: the web team builds the screen, the ledger team
handles account state, the payments team moves any leftover money.

Three months later, all three report their work complete. The web team built a
closure flow. The ledger team built a way to mark an account closed. The payments
team built a transfer.

Then someone tries it. The screen asks the ledger whether the account can be
closed — but the ledger's answer doesn't account for pending transactions, because
nobody told them it should. The payments team built the transfer as an overnight
batch, while the web team assumed it happened instantly and shows a confirmation
that isn't true yet. And when a test account is closed before its transfer clears,
the customer is locked out of their own money.

```
   Web team:       done ✓
   Ledger team:    done ✓
   Payments team:  done ✓

   The feature:    broken ✗
```

Nobody did bad work. Each team solved the problem they were given, correctly,
inside their own boundary. What was missing was a shared answer to a small number
of questions that none of them owned alone.

That shared answer is what a Platform Spec is.

---

### What a Platform Spec is

**A Platform Spec is the agreement between teams who must change different code
to produce one outcome.**

It says why the change matters, what must be true when it's finished, how the
pieces work together, what each team contributes, and what the teams must agree
on between them.

It deliberately does *not* say how any team should build its part. That's the
line that makes it useful. The moment a shared document starts prescribing
someone's internal design, two things happen: the people who actually know that
system stop reading it, and it becomes wrong the first time they learn something.

Think of it as a map agreed between drivers, not a set of turn-by-turn
instructions. The map fixes the destination and the rules of the road where
paths cross. Each driver picks their own route.

---

### When you need one — and when you don't

Not every change needs this. Most don't. The threshold is simple:

```
   Does this need more than one team to change code?
            │                        │
            no                      yes
            │                        │
            ▼                        ▼
      Just build it      Is there one outcome none of
                         them can deliver alone?
                              │               │
                              no             yes
                              │               │
                              ▼               ▼
                      Separate tickets   Platform Spec
```

Two clarifications worth stating plainly, because they save a lot of wasted
effort:

**Count teams, not repositories.** One team working across four repositories
coordinates itself in a hallway conversation. Two teams sharing a single
repository need an agreement. The expensive boundary is ownership, not code
location.

**One new API call between two teams isn't an initiative.** Agree what goes in
and what comes out, open two tickets, move on.

If you require this document for small changes, people will stop writing it
honestly and start writing it to satisfy the process. Keep the bar high enough
that a Platform Spec means something.

---

### The three questions

Everything in a Platform Spec hangs off three questions, in order.

```
   WHY  ─────►  WHAT  ─────►  HOW
 the problem   the outcome   the collaboration
```

Skipping any one of them produces a predictable failure. Skip the Why and teams
optimize the wrong thing beautifully. Skip the What and everyone builds toward a
different finish line. Skip the How and you discover the mismatches during
integration testing, at the worst possible moment.

---

#### WHY — the problem, in three sentences

Who has the problem, and what it costs.

> Customers can't close accounts online. It generates around 400 support calls a
> month, each averaging eleven minutes. New regulation requires a self-service
> closure path this year.

That's it. Three sentences is a genuine limit, not a stylistic preference. If you
need more, you've started describing a solution, and you'll anchor everyone to it
before they've understood the problem.

The Why does real work later. When a team hits a design decision the spec didn't
anticipate — and they will — the Why is what lets them choose sensibly without
convening a meeting.

---

#### WHAT — the outcome, written so someone can watch it happen

State what is true when this is finished, in language a non-engineer can verify
by looking at a screen.

> A customer can close an eligible account and receive written confirmation, with
> any remaining balance transferred, within one business day.

Compare that to two things it would be easy to write instead:

- *"Improve the account management experience."* Unverifiable. Nobody can tell you
  when it's done.
- *"Build the account closure API."* That's a task wearing an outcome's clothing.
  You can finish it completely and still have no customer able to close an
  account.

A good outcome statement is one you could hand to someone outside the project and
they could tell you, by using the product, whether it's true.

Once you have it, the responsibilities usually fall out on their own:

```
              Outcome: self-service account closure
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   Account UI             Ledger                 Balance
   Presents the           Decides whether        Moves remaining
   closure flow and       the account is         funds and issues
   confirmation           eligible to close      a receipt
```

---

#### HOW — the way the pieces work together

This is the part most often skipped, and it's where the story at the top of this
article went wrong.

The How describes the flow: where it starts, who participates, what information
moves between them, and in what order.

```
   Customer
      │
      │ 1. requests closure
      ▼
 ┌─────────────┐
 │ Account UI  │
 └──────┬──────┘
        │ 2. is this account eligible?
        ▼
 ┌─────────────┐
 │   Ledger    │◄─── needs facts from Balance and Compliance
 └──────┬──────┘
        │ 3. eligible
        ▼
 ┌─────────────┐
 │   Balance   │ 4. transfer funds, return receipt
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐ 5. close ONLY after a receipt exists
 │   Ledger    │
 └──────┬──────┘
        │
        ▼
   Confirmation to customer
```

Look at step 5. It's one line, and it's the difference between a working feature
and a customer locked out of their money. It isn't a web decision, a ledger
decision, or a payments decision. It's a decision about how they relate — which
means it has no natural home except this document.

**What deliberately stays out.** Endpoint paths. Field names. Payload formats.
Database schemas. Class and function names. Deployment settings. All of that
belongs to the teams who own the code. The Platform Spec describes what an
interaction is *for*, who is involved, what information moves, and what must be
true afterwards. The shape of the payload is somebody else's business.

---

### The part everyone underestimates

If the three questions are the skeleton, this next section is where the document
earns its cost. Call it **Agreements**: the decisions that no single team can
make alone.

```
┌──────────────────────────────────────────────────┐
│ THE PLATFORM DECIDES                             │
│                                                  │
│  · The shared outcome                            │
│  · Who owns which responsibility                 │
│  · The contracts between components              │
│  · What happens when something is down           │
│  · Rules that span more than one component       │
│  · What "done" means, and who checks             │
└───────────────────────┬──────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────┐
│ EACH TEAM DECIDES                                │
│                                                  │
│  · Its internal design and data model            │
│  · Its language, framework, code structure       │
│  · How it tests                                  │
│  · How it migrates and rolls out                 │
│  · Its own estimate and plan                     │
└──────────────────────────────────────────────────┘
```

Three kinds of agreement are worth calling out, because teams routinely try to
push them downward and they don't survive the trip.

**Contracts.** The interface between two components belongs to neither of them.
If you leave it to be worked out informally, you get the overnight-batch-versus-
instant-confirmation mismatch from the opening story — two reasonable
assumptions that were never compared. Agree it up front, in plain terms: who
provides it, who consumes it, what goes in, what comes out, what happens when it
fails.

**What the customer sees when something is broken.** Each team can make its own
piece fast and reliable and still produce an unacceptable whole. Somebody has to
own the end-to-end experience, and especially the degraded one:

```
   When this is down          The customer sees
   ────────────────────       ────────────────────────────────────
   Compliance                 "We can't process this online right
                              now — please call us"
                              (never approve without the check)

   Balance                    Closure blocked, account untouched

   Ledger                     "Try again shortly"
```

Note the first row. "Fail closed" is a decision with real consequences, and it
would be strange for whichever team happens to be writing that code to make it
alone.

**Rules that span components.** In our example, "eligible to close" means zero
balance *and* no pending transactions *and* no open disputes. Three components
hold those three facts. The rule itself lives nowhere in particular — so the spec
has to place it:

> **Decision:** the Ledger composes eligibility. Balance and Compliance provide
> facts only.

Without that one sentence, each team implements the two-thirds of the rule it can
see, everyone tests their own part successfully, and the gap appears in
production.

---

### Contributions go two ways

Here's where most versions of this idea break down. They describe a document that
flows in one direction: leadership writes the spec, teams receive their tasks,
teams build. Every arrow points down.

But the most common way cross-team work fails isn't misunderstanding. It's a team
discovering that what they've been assigned is impossible, far more expensive
than anyone thought, or built on an assumption that doesn't hold in their system.
The payments team knows things about transfers that the person writing the spec
does not.

So responsibilities are recorded with a status, and the status matters more than
anything else in the table:

| Component | Team | Responsibility | Status |
|---|---|---|---|
| Account UI | Web | Closure flow and confirmation | Accepted |
| Ledger | Core | Eligibility decision, closure state | Accepted |
| Balance | Payments | Final transfer and receipt | **Objected** |

**A responsibility is proposed until the owning team accepts it.** Writing
something down does not assign it.

```
   Proposed ──────────► Accepted ──────────► the team builds it
       │
       │ Objected: "we can't transfer synchronously
       │            at that latency"
       ▼
   The spec is amended, or the reason the constraint
   stands is written down
       │
       ▼
   Back to Proposed
```

Objecting isn't obstruction. It's the mechanism by which the spec finds out it
was wrong while that's still cheap to fix. A spec that has never been amended
after a month isn't being followed — it's being ignored, and people are quietly
working around it.

This also means the document has to stay alive. When reality contradicts it, it
changes that day, with a line recording what changed and why. A stale spec is
worse than no spec, because people still believe it.

---

### Deliver in slices, not in layers

There are two ways to sequence work across several teams, and one of them
consistently goes badly.

```
 BY LAYER                            BY SLICE

 Phase 1: all the screens            Slice 1: see whether an account
 Phase 2: all the APIs                        can be closed, and why not
 Phase 3: all the data changes       Slice 2: close an empty account
 Phase 4: connect it together        Slice 3: close one with money in it
                ▲                    Slice 4: edge cases and bulk
                │
      every risk lands here,         each slice crosses every layer
      at the end                     it needs and can be shown working
```

Working by layer feels efficient — each team does its own kind of work in one
uninterrupted stretch. But it defers every integration question to the end, when
the schedule has no room left and the assumptions have hardened.

A slice is a thin path through everything: a bit of screen, a bit of API, the
data it needs, all connected. It's small, it's often unimpressive, and it proves
the pieces actually fit.

One rule matters more than the rest here: **every slice includes its own error
and empty states.** It's tempting to plan a "resilience and hardening" phase at
the end. That's working by layer again, wearing a disguise, and it puts the
riskiest and least understood work last.

The roadmap is simply this list of slices, in order. It tells the organization
when real capabilities arrive. It doesn't attempt to track every internal task,
and it shouldn't.

---

### Three people who need names

Most of the confusion in cross-team work comes from responsibilities that are
assumed rather than assigned.

**The Spec Owner.** One named person who keeps the document true and resolves
objections. Usually whoever most needs the outcome — not necessarily a manager.

**A Component Owner per team.** Accepts or objects to the responsibility, works
out how their team will deliver it, gives the estimate.

**A Slice Verifier.** One person per slice, and it's worth rotating. They're the
only one who can declare a slice finished — by demonstrating it working end to
end.

That last role exists because of a specific, very common failure:

```
   Team A: complete
   Team B: complete       ◄── this is not done
   Team C: complete

   Someone demonstrates the slice working  ◄── this is done
```

When nobody owns end-to-end verification, everyone assumes another team is doing
it. That assumption is exactly how the opening story happens.

---

### What each team writes for itself

Once a team accepts a responsibility, they write their own short document. It
answers four questions and inherits everything else by reference:

1. What does this responsibility mean inside our system?
2. How will we build it?
3. How will we prove it works, including the failure cases?
4. What's our estimate, and what would change it?

They don't restate the Why. They don't re-derive the contract. Duplication across
documents is how things drift out of sync.

On estimates: the map of responsibilities plus the agreements is enough for a
rough size, the main risks, and the known unknowns — which is all a roadmap
needs. Treat the first numbers as ranges rather than promises. The first slice is
the best calibration you'll ever get; re-estimate the rest once it lands.

---

### The ways this goes wrong

Worth watching for:

- **The spec grows.** Someone adds field names, then a sequence diagram, then
  suggested class structures. Teams stop reading it. Cut anything that isn't a
  decision made *here*.
- **The spec never changes.** Either nothing has been learned in a month, which
  is impossible, or people have stopped bothering to update it.
- **Objections stop happening.** If no team has ever pushed back, check whether
  pushing back is actually safe. A spec owner who treats objections as challenges
  to their authority will get compliance instead of information.
- **The hardening phase reappears.** Error handling drifts to the end of the plan
  one slice at a time. Watch for it.
- **It's required for everything.** The trigger test exists for a reason. Applied
  to small changes, this becomes paperwork, and paperwork gets filled in without
  thought.

---

### The point of all of it

Three teams finished their work and the feature didn't exist. Not because anyone
was careless, but because a handful of decisions belonged to the space *between*
them, and that space had no owner.

A Platform Spec gives that space an owner and a document. It answers why the
change matters, what must be true at the end, how the pieces fit, what each team
contributes, and what they must agree on where they meet. Then it gets out of the
way.

> **The platform decides the destination and the terms of travel between teams.
> Each team decides its own route.**
>
> **And when a team discovers the terms were wrong, the terms change.**
