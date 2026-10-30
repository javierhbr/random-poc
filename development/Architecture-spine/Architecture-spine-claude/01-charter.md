# Platform Architecture Charter

**Version:** 0.1 (draft) · **Owner:** Platform architect · **Status:** for team review

The chat platform is a **channel**, not a business domain. It orchestrates conversations between customers and the people, bots and systems that serve them. It never owns customers, orders, accounts, balances or any other business entity; those belong to the core domains the platform integrates with.

This charter is the single reference every engineer on the platform is expected to know. A spec or pull request that contradicts it needs either a change to the charter or a recorded exception.

---

## Part 1 — Language and boundaries

*Answers: "Does this belong here, and what do we call it?"*

### 1.1 Glossary (ubiquitous language)

One definition per term, used verbatim in specs, code and conversation. Starting set to be agreed by the team:

| Term | Definition | Owning context |
| --- | --- | --- |
| Conversation | | |
| Session | | |
| Message | | |
| Participant | | |
| Agent (human) | | |
| Bot / assistant | | |
| Intent | | |
| Handoff | | |
| Queue | | |
| Customer identity | | |

### 1.2 Domain and subdomains

- **Domain:** the whole problem space the platform addresses (conversational customer interaction as an additional channel).
- **Subdomains:** partitions of that problem, classified as *core* (differentiating, build it), *supporting* (necessary, build simply) or *generic* (commodity, buy or adopt).

| Subdomain | Type (core / supporting / generic) | Purpose |
| --- | --- | --- |
| Conversation management | | |
| Routing and assignment | | |
| Agent workspace | | |
| Automation / bot | | |
| Channel adapters (WhatsApp, web widget, app SDK…) | | |
| Customer identity resolution | | |
| Conversation analytics | | |

### 1.3 Bounded contexts

A bounded context is a boundary inside which one model and one vocabulary are consistent. Each has exactly one owning team, its own data, and its own contracts.

| Bounded context | Subdomain(s) served | Owning team | Data it owns | Contracts it publishes |
| --- | --- | --- | --- | --- |
| | | | | |

### 1.4 Context map

For every pair of contexts that interact: direction (upstream → downstream) and relationship type.

| Upstream | Downstream | Relationship (published language / customer-supplier / conformist / anti-corruption layer / shared kernel) | Notes |
| --- | --- | --- | --- |
| | | | |

### 1.5 Capability map

| Capability | Owning context | Exposed to other channels? |
| --- | --- | --- |
| | | |

### 1.6 Membership criterion

A piece of logic or data belongs in the platform **only if all of the following are true**:

1. It would not exist if the chat channel did not exist.
2. It does not define or change the meaning of a business entity (customer, order, account, product, case…).
3. The answer it produces may legitimately differ from what web or mobile would produce for the same customer.
4. No core domain system already owns it.

Fail any one → it belongs in a business domain; the platform integrates with it.

### 1.7 What the platform does not do

- Does not store the authoritative version of any business entity.
- Does not evaluate business rules (eligibility, pricing, limits, approvals); it asks the owning domain.
- Does not authenticate customers on its own; it relies on the shared identity provider.
- Does not become the integration bus for other channels.
- (extend as needed)

---

## Part 2 — Contracts

*Answers: "How do components talk, and who owns the truth?"*

### 2.1 API and event catalog

| Contract | Type (sync API / event / stream) | Owner | Consumers | Version | Compatibility policy |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

### 2.2 Compatibility policy

- Additive changes (new optional field, new event type) are compatible and need no version bump.
- Removing or renaming a field, changing a type or semantics, or tightening validation is **breaking**: new major version, old version supported for N months, consumers notified via the catalog.
- Events are immutable once published; corrections are new events.

### 2.3 System of record (SoR) per entity

| Entity | System of record | Platform holds a copy? | Copy type (read model / cache / none) | Refresh rule |
| --- | --- | --- | --- | --- |
| Customer | | | | |
| Conversation | | | | |
| Message | | | | |
| Agent | | | | |
| Order / case / account (business entities) | | | | |

### 2.4 Canonical conversation model and lifecycle

- States, transitions, and which context may trigger each transition.
- Which state changes emit events, and which are internal.

### 2.5 Customer identity

- How a chat participant is resolved to a known customer.
- Which system is authoritative for identity, and what the platform may store about it.
- Behaviour for anonymous and partially identified participants.

---

## Part 3 — Cross-cutting rules

*Answers: "What must every component do regardless of its job?"*

### 3.1 Authentication and authorization between components

- Every call between components carries a verifiable identity (service identity + acting user where relevant).
- Authorization decisions are made by the owning context, never inferred by the caller.

### 3.2 Observability

- A correlation / trace id is generated at the channel edge and propagated through every call and event.
- Minimum structured log fields, metrics per component (latency, error rate, saturation), and dashboards per bounded context.

### 3.3 Resilience

- Every outbound call has a timeout and a declared retry policy.
- Every operation that may be retried is idempotent.
- Degradation behaviour is declared per dependency (e.g., if the bot engine is down, route to human; if the CRM is down, continue with cached identity and queue updates).

### 3.4 Data classification, privacy and retention

- Every stored field is classified (public / internal / PII / sensitive PII).
- Retention period and deletion mechanism per classification.
- PII never appears in logs, traces or analytics exports without masking.

### 3.5 SLOs

| Component | Availability | Latency (p95) | Error budget | Owner |
| --- | --- | --- | --- | --- |
| | | | | |

---

## Part 4 — Change governance

*Answers: "How do we change things safely?"*

### 4.1 Architecture Decision Records (ADRs)

One file per decision: context, decision, alternatives considered, consequences, charter version affected. Rejected proposals get an ADR too.

### 4.2 Spec template (mandatory fields)

- Bounded context(s) touched and the single owner of the behaviour
- Contracts added or changed, each marked breaking or compatible
- System of record for every entity read or written; read models declared with refresh rule
- Events published and consumed, with schema version
- Impact on SLOs of affected components
- Cross-cutting compliance: trace id, timeouts, retries, idempotency, PII classification
- Rollout and rollback plan
- Charter version this spec follows

### 4.3 Dependency graph

Maintained per contract: owner → consumers. Walked during every review to compute the blast radius.

### 4.4 Fitness functions and contract tests

Automated checks that enforce charter rules, for example:

- No component reads another component's database.
- Every outbound call declares a timeout.
- Every published event has a registered schema.
- Consumer-driven contract tests run in CI for every published API.

### 4.5 Ownership and operations

| Component | Owning team | On-call rotation | Runbook |
| --- | --- | --- | --- |
| | | | |

### 4.6 RFC process

See `02-why-and-how-to-use.md`, section "How to change the charter itself".
