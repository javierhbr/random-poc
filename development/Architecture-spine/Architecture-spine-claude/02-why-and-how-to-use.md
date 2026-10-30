# Why We Need This Governance, and How to Use the Charter

**Version:** 0.1 (draft) · **Owner:** Platform architect

---

## 1. Why we need this governance

The chat platform is a channel, not a business domain. It sits between customers and the systems that actually own customers, orders, accounts and balances. Without shared rules, every team decides on its own where a piece of logic or data belongs, and the platform slowly turns into a second copy of the core.

This charter exists to prevent five specific failures on a channel platform:

1. **Duplicated truth.** Two components each store "the customer" or "the conversation state" and they drift. Nobody knows which one is right. A declared system of record per entity removes the argument.
2. **Hidden coupling.** A change in one component breaks another because the dependency was never written down. A context map and a contract catalog make the blast radius visible before the change, not after the incident.
3. **Vocabulary drift.** "Session", "conversation", "agent" and "handoff" mean different things in different teams, so specs are misread and bugs are built to spec. One glossary ends the ambiguity.
4. **Scope creep into the core.** Because the chat is the closest thing to the customer, business rules land in it "just for now". The membership criterion gives every reviewer a one-line test for what belongs here and what does not.
5. **Decisions lost to turnover.** Why did we choose eventual consistency here, or an anti-corruption layer there? Without ADRs, every new engineer re-litigates past decisions or silently reverses them.

The practical payoff is speed. Spec-driven development only works when the spec can name the contexts, contracts and system of record it touches. Change analysis only works when the dependency graph exists. Onboarding only works when there is one document to read. Governance here is not bureaucracy; it is the shared map that lets several teams change the same platform at the same time without stepping on each other.

---

## 2. What the charter is, and is not

The charter is the single reference every engineer on the platform is expected to know. It is short, versioned, and binding: a spec or a pull request that contradicts it needs either a change to the charter or an explicit, recorded exception.

| Part | Question it answers | Contents |
| --- | --- | --- |
| 1. Language and boundaries | "Does this belong here, and what do we call it?" | Glossary, domain and subdomains, bounded contexts, context map, capability map, membership criterion, what the platform does not do |
| 2. Contracts | "How do components talk, and who owns the truth?" | API and event catalog with owners and versioning policy, system of record per entity, canonical conversation model and lifecycle, customer identity resolution |
| 3. Cross-cutting | "What does every component have to do regardless of its job?" | Auth between components, observability, resilience and degradation rules, data classification and retention, SLOs per component |
| 4. Change governance | "How do we change things safely?" | ADRs, spec template, dependency graph, fitness functions and contract tests, ownership and on-call, RFC process |

The charter is **not**:

- A design document for any single feature. Features get specs; the charter is what specs are checked against.
- A substitute for team judgement. It names the defaults and the limits; within them, teams decide.
- Frozen. It changes through the process in section 5, and old versions stay readable so a spec can say which version it followed.

**Audience:** every developer, tech lead and product owner working on the platform, plus the owners of upstream and downstream systems that integrate with it. Reviewers from outside the platform read parts 1 and 2 to understand what the chat will and will not take on.

---

## 3. How to use it day to day

### When you design a feature (before writing the spec)

1. Apply the membership criterion (charter 1.6). If the feature owns business data or business rules, it belongs in the core domain and the platform only integrates with it. Stop here if it fails the test.
2. Find the bounded context it lives in. If it spans two, the spec must say which one owns the behaviour and which one consumes it.
3. Check the glossary and use its terms verbatim in the spec. Introduce a new term only through the change process.
4. Look up the system of record for every entity you read or write. Anything you store that another system owns is a read model, and the spec must say how it is refreshed.

Use `03-classification-guide.md` for the detailed questions behind each of these steps.

### When you write a spec

Use the spec template (charter 4.2). It forces the fields reviewers need: contexts touched, contracts added or changed (and whether the change is breaking), system of record affected, events published or consumed, impact on SLOs, rollout and rollback plan. A spec with an empty field is not ready for review.

### When you review a change (spec or pull request)

1. Check the spec against the charter, not against your own preferences. Disagreements with the charter go to an RFC, not to the review thread.
2. Walk the dependency graph from every contract the change touches. List the downstream consumers in the review; that list is the blast radius.
3. Confirm the cross-cutting rules are met: trace id propagated, timeouts and idempotency where needed, PII classified.
4. If the change breaks a contract, require a versioning plan that follows the compatibility policy.
5. If the change embodies a new decision (a pattern, a technology, a boundary), require an ADR before merge.

### When you onboard

Read parts 1 and 2 in full on day one. Read part 3 before your first pull request. Read part 4 before your first spec. Keep the glossary open; it is the fastest way to decode any conversation on the team.

### When something is not covered

The charter will have gaps. When you hit one, do not guess and do not decide silently. Open an RFC with the question, your proposed answer, and the alternatives. The answer becomes either a charter change or an ADR, so the next person does not hit the same gap.

---

## 4. Roles and ownership

Every part of the charter has one named owner who keeps it current and answers questions about it. Ownership is a maintenance duty, not a veto: owners accept or reject proposed changes through the process below, in the open.

| Part | Owner | Reviews with | Refresh cadence |
| --- | --- | --- | --- |
| Language and boundaries | Platform architect | Tech leads of each bounded context | Quarterly, or on any new context |
| Contracts | Owner of each API or event, listed in the catalog | Consumers of that contract | On every contract change |
| Cross-cutting | Platform architect with the SRE / observability lead | All tech leads | Quarterly, or after any major incident |
| Change governance | Platform architect | Engineering manager | Every six months |

### How decisions are made

- Small clarifications (a glossary wording, a missing consumer in the catalog) are made by the owner directly and noted in the changelog.
- Changes that alter a boundary, a system of record, a contract's compatibility policy or a cross-cutting rule go through an RFC: written proposal, one week of open comments from affected teams, decision by the owner, recorded as an ADR.
- Exceptions to a rule are allowed, but only recorded ones. An exception is an ADR with an expiry date and a plan to remove it.

### What each role is accountable for

- **Platform architect:** the charter as a whole, the context map, the membership criterion, final say on boundary disputes.
- **Tech lead of a bounded context:** the context's section in the glossary, its contracts, its SLOs, and that its specs follow the template.
- **Every engineer:** knowing the four parts, using the glossary, filling the spec template honestly, and raising an RFC instead of working around a rule.
- **Product owners:** confirming that the membership criterion is applied before a feature is committed, so scope is not pushed into the platform by delivery pressure.

---

## 5. How to change the charter itself

The charter is versioned like code and changed through the same discipline. A spec references the charter version it was written against, so a later change to the charter never silently invalidates work in flight.

1. **Propose.** Open an RFC titled with the part and the rule affected. State the problem the current rule causes, the proposed wording, the alternatives considered, and which existing specs or components would be affected.
2. **Circulate.** The owner of that part tags the affected teams. Comments stay open for one week. Silence is not consent: each affected tech lead must reply, even if only to say no objection.
3. **Decide.** The owner decides and writes the ADR: context, decision, consequences, and the charter version in which it lands. A rejected RFC gets an ADR too, so the reasoning is not lost.
4. **Publish.** The charter gets a new minor version for clarifications and a new major version for any change to a boundary, a system of record or a compatibility policy. The changelog entry links the ADR.
5. **Migrate.** For a major version, the owner lists the components that no longer comply and agrees a deadline with each team. Until then the old rule applies to them under a recorded exception.

Two guardrails keep this lightweight. First, a rule that has not been needed in a year is a candidate for removal; the charter should shrink as well as grow. Second, a change proposed in the middle of an incident is deferred until the post-mortem, so rules are not written in panic.

---

## 6. Rollout plan

The charter is introduced in four phases over roughly seven weeks. Each phase ends with a gate the next one depends on. The team fills the charter before it is enforced, so the rules are theirs and not imposed.

| Phase | When | Activities | Gate to exit |
| --- | --- | --- | --- |
| 1. Draft and socialize | Weeks 1–2 | Architect writes v0.1; review with tech leads; glossary agreed first | Leads sign off v1.0 |
| 2. Fill with the team | Weeks 3–4 | Workshop per bounded context; map SoR and contracts; catalog owners named | Context map complete |
| 3. Pilot on two specs | Weeks 5–6 | Two real specs use the template; reviews walk the dependency graph; gaps become RFCs | Template fits; v1.1 published |
| 4. Enforce and iterate | Week 7 onward | Template mandatory; fitness tests in CI; quarterly review | — |

The architect drafts alone only in phase 1; from phase 2 on, every bounded context's tech lead writes their own section. Enforcement starts only after two real specs have proven the template works.

---

## 7. Quick-reference checklist

### Spec author

- [ ] The feature passes the membership criterion (it owns no business data or rules)
- [ ] Every term used matches the glossary, or a glossary change is proposed
- [ ] The bounded context(s) touched are named, with one owner of the behaviour
- [ ] The system of record for every entity read or written is identified
- [ ] Any locally stored copy of another system's data is declared as a read model with its refresh rule
- [ ] Contracts added or changed are listed, each marked breaking or compatible
- [ ] Events published and consumed are listed with their schema version
- [ ] Impact on each affected component's SLOs is stated
- [ ] Trace id propagation, timeouts, retries and idempotency are addressed
- [ ] PII handled is classified and its retention stated
- [ ] Rollout and rollback plan are written
- [ ] The charter version this spec follows is referenced

### Reviewer

- [ ] The spec is checked against the charter, not against personal preference
- [ ] The dependency graph was walked and the downstream consumers are listed in the review
- [ ] Every breaking contract change has a versioning plan that follows the compatibility policy
- [ ] Any new pattern, technology or boundary decision has an ADR
- [ ] Any deviation from the charter is recorded as an exception with an expiry date
- [ ] Open questions the charter does not answer were raised as RFCs, not resolved in the thread
