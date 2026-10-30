# Classification Guide — Where Does This Belong?

**Version:** 0.1 (draft) · **Owner:** Platform architect

Use this guide whenever you have a *thing* — a rule, a behaviour, a piece of data, a component, a requirement, a decision — and need to decide where it lives and who owns it. It works for new features and for auditing an existing platform.

Each section is a set of questions with a verdict. Answer honestly, write the answers down (use `04-inventory-template.md`), and the verdict follows. When two verdicts conflict, go to section 10 (tie-breakers).

---

## 0. The master question: what kind of thing is this?

Before asking *where* something belongs, identify *what* it is. Pick the first row that matches.

| If the item is… | It is a… | Go to |
| --- | --- | --- |
| A statement that something must or must not happen for the business to be correct ("a refund needs manager approval", "a conversation can have one active agent") | **Rule or behaviour** | §1, then §2 |
| A quality the system must have regardless of what it does ("p95 under 500 ms", "available 99.9%", "no PII in logs") | **Non-functional requirement (NFR)** | §3 |
| A fact or record that is stored, read or passed around ("customer", "conversation", "order status") | **Data / entity** | §4 |
| A deployable unit of software, a service, a library, a UI | **Component** | §5 |
| A group of related rules, behaviours and data that people talk about as one area ("routing", "identity", "analytics") | **Area of the problem → subdomain or bounded context** | §6 |
| A call, event, or data flow between two components | **Interaction / integration** | §7 |
| A choice between alternatives that constrains future work ("we use eventual consistency here", "we adopt vendor X") | **Decision** | §8 |
| A guiding statement about how we build ("prefer events over sync calls", "never share a database") | **Principle, constraint or guideline** | §9 |

An item may be more than one thing (a spec contains rules, data and NFRs). Split it and classify each part.

---

## 1. Rule or behaviour: business domain or platform (channel)?

This is the most frequent and most important question. The platform is a channel; business logic belongs to the domains the platform integrates with.

### Questions

| # | Question | If **yes** | If **no** |
| --- | --- | --- | --- |
| 1.1 | Would this rule still exist if the chat channel were shut down tomorrow? | Business domain | continue |
| 1.2 | Does it decide anything about a business entity: eligibility, price, limit, approval, status of an order/account/case? | Business domain | continue |
| 1.3 | Must web and mobile give exactly the same answer for the same customer and the same input? | Business domain | continue |
| 1.4 | Does it exist only because of the medium (message delivery, typing indicators, attachments, read receipts, conversation threading, agent assignment, bot turn-taking)? | Platform | continue |
| 1.5 | Is it about *how* a customer is served through chat rather than *what* they are entitled to? (routing, queueing, SLAs on response time, canned responses, transcript handling) | Platform | continue |
| 1.6 | Is it purely translating between the platform's model and an external system's model (field mapping, protocol adaptation, retries against a vendor API)? | Integration glue (an anti-corruption layer or adapter inside the platform) | continue |
| 1.7 | Does it decide *which* business domain to ask, or in *what order*, without deciding the business outcome? | Platform (orchestration) | continue |
| 1.8 | Is it a presentation choice: wording, formatting, rich-message layout, language, tone? | Platform (channel presentation) | Escalate: open an RFC |

### Verdicts

- **Business domain:** the platform calls the owning domain's contract. If no such contract exists, the spec includes a request to that domain, not a local implementation. "Just for now" is not an exception; it is an RFC.
- **Platform:** continue to §2 to find the bounded context.
- **Integration glue:** lives inside the platform context that consumes the external system, behind an adapter. It never leaks the external model into the platform's own model.
- **Orchestration:** lives in the platform, but every decision it makes is "call X then Y", never "approve / reject".

### Red flags that a business rule has crept into the platform

- An `if` on a customer attribute that changes a business outcome (tier, balance, region → different entitlement).
- A table in the platform database that holds prices, limits, product catalog entries, or eligibility criteria.
- A platform component that "knows" the valid state transitions of an order, case or account.
- A rule that product owners from another channel ask to "keep in sync" with theirs.

### Worked examples (chat platform)

| Item | Verdict | Why |
| --- | --- | --- |
| Refund over 100 needs supervisor approval | Business domain (Orders / Payments) | Exists without chat; same on all channels (1.1, 1.3) |
| A customer can have only one open conversation per channel | Platform (Conversation management) | Exists only because of the medium (1.4) |
| Route VIP customers to the priority queue | Platform (Routing), **but** the VIP flag comes from the customer domain | Routing is "how served" (1.5); "who is VIP" fails 1.2 |
| Show the customer's last three orders in the agent panel | Platform read model over the Orders SoR | Presentation and orchestration (1.7, 1.8); data owned elsewhere (§4) |
| Bot answers "what is my balance?" | Platform orchestrates: identify → call Accounts → format | The number is Accounts' answer (1.2); the dialogue is platform |
| Retry WhatsApp sends three times with backoff | Integration glue | Vendor-specific adaptation (1.6) |
| Auto-close a conversation after 24 h of inactivity | Platform (Conversation management) | Medium-specific lifecycle (1.4) |
| Mask card numbers typed by the customer | Cross-cutting (§3), enforced in the platform | Applies to every message regardless of feature |
| Customer can cancel an order from chat | Platform exposes the action; Orders decides if cancellation is allowed | 1.2 fails for the decision; the entry point is channel |
| Response-time SLA per queue (first reply under 2 min) | Platform (Routing) as a rule; also an NFR on the component | "How served" (1.5); measurement is §3 |

---

## 2. Platform rule or behaviour: which bounded context?

Once something is confirmed as platform, find the one context that owns it.

### Questions

| # | Question | What the answer tells you |
| --- | --- | --- |
| 2.1 | Which **glossary term** is the subject of the rule? (conversation, message, participant, queue, agent, intent…) | The context that owns that term's definition is the default owner |
| 2.2 | Which data does the rule need to **write**? | The context that owns that data (§4) must own the rule, or the rule is in the wrong place |
| 2.3 | Which data does it only **read**? | Those are inputs; the rule does not move there |
| 2.4 | If this rule changes, which **team** must be in the room? | If more than one, the rule is probably two rules, or the boundary is wrong |
| 2.5 | Does the rule need to be **transactionally consistent** with other rules? | Those rules share a context; cross-context consistency is eventual |
| 2.6 | Can you describe the rule **without using another context's internal terms**? | If not, you are reaching into another context; invert the dependency or use an event |

### Verdicts

- **One context writes the data and owns the term → that context owns the rule.**
- **Rule needs to write data in two contexts → split it.** One context decides and emits an event; the other reacts. Record the choice of which one decides as an ADR.
- **No context fits → the context map has a gap.** Either a new context (rare; needs an RFC) or an existing context grows a capability.

### Sanity checks

- A rule owned by a context must be testable with only that context's data and contracts.
- A rule that appears in two contexts' code is a duplicated rule; one of them is wrong.

---

## 3. Functional requirement or non-functional requirement (NFR)?

### Questions

| # | Question | If **yes** |
| --- | --- | --- |
| 3.1 | Does it describe **what** the system does for a user or business (an outcome you can demonstrate with one scenario)? | Functional → §1 |
| 3.2 | Does it describe **how well** the system does it: speed, availability, throughput, security, privacy, observability, maintainability, cost? | NFR → continue |
| 3.3 | Can it only be verified by **measuring** over many requests or over time, not by a single pass/fail scenario? | NFR |
| 3.4 | Does it apply to **every component regardless of feature**? | Cross-cutting NFR → charter Part 3 |
| 3.5 | Does it apply to **one component or one feature** only? | Local NFR → recorded in that component's SLO row (charter 3.5) and in the feature's spec |
| 3.6 | Is it required by **law, regulation or contract** (retention, data residency, accessibility, audit trail)? | Compliance NFR → charter Part 3, plus a named compliance owner |
| 3.7 | Does it constrain **how we build** rather than what we deliver (language, framework, hosting, team structure)? | Not an NFR → §9 (constraint) |

### Verdicts

- **Cross-cutting NFR:** written once in Part 3, enforced by a fitness function where possible, checked in every review.
- **Local NFR:** lives with the component's SLO and in the spec; never silently inherited by other components.
- **Compliance NFR:** Part 3 plus the legal/compliance owner; the platform does not interpret law on its own.

### Gray areas

| Item | Verdict | Why |
| --- | --- | --- |
| "Conversations are retained for 2 years" | Compliance NFR (data retention) + a data rule in Conversation management | Measured over time; regulatory; but the deletion job is a behaviour of one context |
| "First reply within 2 minutes for priority queue" | Functional rule in Routing + a local NFR (SLO) on Routing | The rule decides what happens at 2 min; the SLO measures how often we meet it |
| "Agent panel loads in under 1 s" | Local NFR on Agent workspace | One component, measured |
| "All services propagate the trace id" | Cross-cutting NFR | Every component, enforced by fitness function |
| "Bot must answer in the customer's language" | Functional (platform presentation) | A scenario demonstrates it |
| "The platform must run on our Kubernetes" | Constraint (§9) | How we build, not what we deliver |

---

## 4. Data: system of record, read model, or transient?

For every entity or field the item touches.

### Questions

| # | Question | If **yes** | If **no** |
| --- | --- | --- | --- |
| 4.1 | Does a system outside the platform **create or change** this data authoritatively today? | That system is the SoR; the platform holds at most a read model → 4.4 | continue |
| 4.2 | If two copies disagreed, would the business say the **platform's** copy is right? | Platform is SoR → 4.3 | The other copy's owner is SoR → 4.4 |
| 4.3 | Which single bounded context writes it? | That context is the SoR; every other context reads via its contract | If more than one writes it → boundary defect; split or assign (ADR) |
| 4.4 | Does the platform need the data **after** the originating call or conversation ends? | Read model: stored copy with a declared refresh rule (event-driven or scheduled) | Transient: fetched on demand, never stored beyond cache TTL |
| 4.5 | Is the copy **derived** (counts, scores, aggregates) rather than copied? | Derived data: the platform owns the derivation, not the source facts; document the formula and its inputs | — |
| 4.6 | Does the copy contain **PII**? | Classify (Part 3.4); retention and masking apply to the copy as well as the source | — |

### Verdicts

| Verdict | What it means in practice |
| --- | --- |
| **System of record (platform)** | Listed in charter 2.3. One context writes. Changes emit events. Other systems may copy it. |
| **System of record (external)** | Listed in charter 2.3 with the owning system. The platform never writes it directly; it calls the owner's contract. |
| **Read model** | A copy for reading. Listed in 2.3 with its source and refresh rule. Never written by business logic. Can be rebuilt from the source at any time. |
| **Derived** | Owned by the platform context that computes it. Inputs and formula documented. Treated as SoR for the derived value only. |
| **Transient** | Not stored. Fetched when needed. May be cached with a TTL; the cache is not a read model. |

### Red flags

- A read model that gets updated by a form in the agent panel (someone made a copy writable).
- "Customer" stored in three platform tables with different fields.
- A read model with no documented refresh rule ("it syncs nightly, I think").

### Worked examples

| Data | Verdict | Owner |
| --- | --- | --- |
| Conversation (state, participants, timestamps) | SoR (platform) | Conversation management |
| Message body and attachments | SoR (platform) | Conversation management |
| Customer name, email, tier | SoR external (CRM / Customer domain); platform holds a read model | CRM |
| Customer identity match (phone → customer id) | SoR external (Identity); platform caches the resolution per conversation | Identity |
| Order status shown in chat | Transient (fetched) or read model if shown in history | Orders |
| Agent skills and availability | SoR (platform) | Routing / Agent workspace |
| Conversation sentiment score | Derived | Analytics |
| Transcript export for compliance | Derived from Conversation SoR; retention per Part 3 | Conversation management + Compliance owner |

---

## 5. Component: inside the platform, and in which context?

### Questions

| # | Question | If **yes** |
| --- | --- | --- |
| 5.1 | Does it exist only to serve the chat channel (would be deleted if chat were retired)? | Inside the platform → continue |
| 5.2 | Is it used by web or mobile as well, with the same behaviour? | Shared capability; belongs **outside** the platform (a shared service or the core domain). The platform consumes it. |
| 5.3 | Does it own data (per §4) that belongs to one bounded context? | It belongs to that context |
| 5.4 | Does it own data from two contexts? | Split it, or it is really two components |
| 5.5 | Does it own no data and only coordinate calls? | Orchestrator; belongs to the context whose use case it serves; must hold no business rules (§1) |
| 5.6 | Does it only translate to or from an external system? | Adapter / anti-corruption layer; belongs to the context that consumes the external system |
| 5.7 | Is it a UI? | Belongs to the context whose data and use cases it mostly presents; it never contains rules that the backend does not also enforce |
| 5.8 | Is it a library used by several contexts? | Shared kernel candidate; allowed only for truly generic code (logging, tracing, serialization). Domain logic in a shared library is a boundary violation. |
| 5.9 | Can it be deployed and rolled back independently of other components? | Required for a component to count as a boundary unit; if not, it is part of a larger component |

### Verdicts

- **Inside platform, one context:** add it to the context's row in charter 1.3 and the ownership table in 4.5.
- **Shared capability outside the platform:** record it in the context map as upstream; the platform is a consumer.
- **Shared library with domain logic:** boundary violation; plan to move the logic into the owning context and expose it by contract.

---

## 6. Area of the problem: subdomain or bounded context?

People use these interchangeably; they are not the same. A **subdomain** is a partition of the *problem* (what the business needs). A **bounded context** is a partition of the *solution* (where one model is consistent). Subdomains help you decide what to invest in; bounded contexts help you decide who owns code and data.

### 6.1 Is it a subdomain? And which type?

| # | Question | Interpretation |
| --- | --- | --- |
| 6.1.1 | Can a business person describe this area without mentioning any software? | If yes, it is a subdomain |
| 6.1.2 | Would the business lose a competitive edge if this area were done badly or bought off the shelf? | Yes → **core** subdomain: invest, build, keep in-house |
| 6.1.3 | Is it necessary but not differentiating; could a competent generic implementation suffice? | Yes → **supporting** subdomain: build simply, do not over-engineer |
| 6.1.4 | Is it a solved problem with mature vendors (NLU engines, message gateways, auth, analytics storage)? | Yes → **generic** subdomain: buy or adopt, wrap in an adapter |
| 6.1.5 | Does the business change its mind about this area often? | Frequent change suggests core; stable suggests supporting or generic |

Typical outcome for a chat channel: conversation management and routing are often core (they shape the customer experience); agent workspace is supporting; NLU, messaging gateways and identity are generic. Confirm with the business, do not assume.

### 6.2 Is it a bounded context? Tests for a proposed boundary

| # | Test | Pass means |
| --- | --- | --- |
| 6.2.1 | **One vocabulary.** Every glossary term inside has exactly one meaning. "Agent" does not mean a person in one place and a bot in another. | The model is consistent |
| 6.2.2 | **One team.** One team can change the model without coordinating with another team. | Ownership is clear |
| 6.2.3 | **Own data.** The context owns its storage; no other context reads its tables. | Encapsulation holds |
| 6.2.4 | **Own contracts.** Everything others need is available through a published API or event. | It can be consumed without internal knowledge |
| 6.2.5 | **Independent deployment.** It can be released without a coordinated release of another context. | It is a real boundary, not a package |
| 6.2.6 | **Internal consistency, external eventual.** Transactions do not span the boundary. | Coupling is by events, not by shared transactions |
| 6.2.7 | **Size.** A new engineer can hold the whole model in their head within a few weeks. | Not too big |
| 6.2.8 | **Not too small.** It is not a single table or a single endpoint. | Not a micro-boundary that only adds overhead |

Fail 6.2.1 → split by meaning. Fail 6.2.2 → split by team or merge teams. Fail 6.2.3 or 6.2.4 → it is a module inside a bigger context, not a context. Fail 6.2.5 → same. Fail 6.2.6 → the boundary cuts through an aggregate; move it.

### 6.3 Mapping subdomains to contexts

- One subdomain → one context is the default.
- One subdomain → several contexts is fine when the subdomain is large and the contexts pass all §6.2 tests.
- One context → several subdomains is a warning sign (the context probably has two vocabularies).
- A generic subdomain is usually one thin adapter context around a vendor.

---

## 7. Interaction between two components: what kind of relationship?

For every arrow on the context map.

### Questions

| # | Question | Answer leads to |
| --- | --- | --- |
| 7.1 | When the two disagree on a model change, **who adapts**? | The one that adapts is **downstream**; the other is **upstream** |
| 7.2 | Does the upstream publish a stable, documented contract designed for consumers? | **Published language** (preferred) |
| 7.3 | Does the upstream change its contract in response to this downstream's needs (planned together)? | **Customer–supplier** |
| 7.4 | Does the downstream simply accept whatever the upstream exposes, with no negotiation power (vendor, legacy)? | **Conformist**; protect yourself with 7.5 |
| 7.5 | Does the downstream translate the upstream's model into its own before using it? | **Anti-corruption layer (ACL)**; required for every external or legacy upstream |
| 7.6 | Do the two share code or a schema that both can change? | **Shared kernel**; allowed only for generic code; domain shared kernel needs an ADR and an exit plan |
| 7.7 | Is the call **synchronous** (caller waits) or an **event** (caller continues)? | Sync for queries the user is waiting on; events for state changes others react to. Sync writes across contexts are a smell. |
| 7.8 | Does the downstream need the upstream to be **up** to function? | If yes, the degradation rule (Part 3.3) must say what happens when it is not |

### Verdicts

- Record the pair in charter 1.4 with direction and type.
- Every external or legacy upstream gets an ACL inside the consuming context.
- Every sync call across contexts gets a timeout, a retry policy and a degradation rule.
- A write that must happen in two contexts becomes "decide in one, emit event, react in the other".

---

## 8. Decision: ADR, charter rule, or team convention?

### Questions

| # | Question | If **yes** |
| --- | --- | --- |
| 8.1 | Would reversing this choice later require changing more than one component or contract? | Record as an **ADR** |
| 8.2 | Does it bind every component on the platform from now on? | **Charter rule** (Part 1–3) plus the ADR that introduced it |
| 8.3 | Does it affect only one context's internals (coding style, library choice, folder layout)? | **Team convention**; recorded in that context's README, not the charter |
| 8.4 | Was it chosen between real alternatives that someone may propose again? | ADR, even if the choice seems obvious today |
| 8.5 | Is it a temporary deviation from a charter rule? | **Exception ADR** with expiry date and removal plan |
| 8.6 | Was it rejected? | Still an ADR (rejected), so the reasoning survives |

### Verdicts

- Charter rules are few and binding; ADRs are many and explanatory; conventions are local.
- A charter rule without an ADR behind it is unexplained; add one.

---

## 9. Principle, constraint, or guideline?

| # | Question | Verdict |
| --- | --- | --- |
| 9.1 | Is it imposed from outside and non-negotiable (law, corporate security policy, contractual platform, budget)? | **Constraint** — record in the charter preamble; no RFC can remove it, only the imposing body can |
| 9.2 | Is it a value judgement the team has chosen that shapes many decisions ("prefer events to sync calls", "one context owns one vocabulary")? | **Principle** — Part 1 or 3; changing it is a major charter version |
| 9.3 | Is it advice that applies most of the time but has legitimate exceptions ("prefer small services", "avoid ORMs for hot paths")? | **Guideline** — recorded as such, with the known exceptions; a reviewer may ask why it was not followed but cannot block on it alone |
| 9.4 | Can it be checked automatically? | Whichever it is, write the fitness function |
| 9.5 | Does it state what to do **in case of** a specific failure or situation? | A **degradation rule** or **runbook step** (Part 3.3 / ownership table), not a principle |

---

## 10. Tie-breakers and gray areas

When two sections give different answers, apply these in order:

1. **Data ownership wins over convenience.** Whoever writes the data owns the rule, even if another component would find it easier to implement.
2. **Business meaning wins over channel.** If a rule changes what a customer is entitled to, it is business domain, however chat-specific it feels.
3. **One owner, always.** A thing with two owners has zero owners. Pick one, record the ADR, move on.
4. **Prefer the boundary that minimizes cross-context writes.** Reads across contexts are cheap; writes are expensive.
5. **When still undecided, choose reversibility.** Put it where it is easiest to move later, and set a review date in the ADR.
6. **Escalate, do not improvise.** An unresolved classification goes to an RFC within the week; it does not get decided in a pull request comment.

---

## 11. Procedure for analysing an existing platform

1. **Inventory.** List every component, every stored table or collection, every API, every event, every scheduled job, and every rule you can find in code or docs. Use `04-inventory-template.md`.
2. **Classify the kind** of each item with §0.
3. **Run the questions** of the matching section and write the verdict and the answers that led to it. Keep the answers; they are the evidence when someone disagrees.
4. **Record where it lives today vs where it belongs.** The gap is the migration backlog.
5. **Find conflicts:** two SoRs for one entity, one rule in two places, a context that writes another's data, a sync write across contexts, a business rule in the platform.
6. **Prioritize** by blast radius (how many consumers) and by risk (duplicated truth first, then business rules in the platform, then missing ACLs).
7. **Write the context map and SoR table** from the verdicts; these become charter sections 1.3, 1.4 and 2.3.
8. **Open an ADR for every non-obvious verdict** and an RFC for every unresolved one.

---

## 12. One-page cheat sheet

| I have a… | First question | Likely home |
| --- | --- | --- |
| Rule about money, eligibility, limits, approvals | Would it exist without chat? | Business domain; platform calls it |
| Rule about messages, conversations, queues, agents | Which glossary term is the subject? | Platform, context that owns the term |
| "Must be fast / available / secure / auditable" | Every component or one? | Part 3 if every; SLO row if one |
| A stored copy of someone else's data | Who wins if copies disagree? | Read model with refresh rule |
| A service used by web and mobile too | Same behaviour on all channels? | Outside the platform; platform consumes |
| A vendor (NLU, gateway) | Solved problem with mature vendors? | Generic subdomain; thin adapter context with ACL |
| A call between two components | Who adapts when they disagree? | Downstream adapts; ACL if upstream is external |
| A choice we might revisit | Would reversing touch more than one component? | ADR |
| "Always do X" | Imposed, chosen, or advised? | Constraint / principle / guideline |
| "If X is down, do Y" | — | Degradation rule (Part 3.3) |
