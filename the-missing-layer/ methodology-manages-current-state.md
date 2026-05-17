Below is the practical comparison focused on **how each methodology manages the current state of the product over time**.

## **TL;DR**

|**Methodology**|**Where “current state” lives**|**How change happens**|**Strength**|**Gap / Risk**|
|---|---|---|---|---|
|**OpenSpec**|`openspec/specs/` as current agreed behavior|Proposed changes live separately as deltas, then archived/merged into specs|Best at preserving evolving product behavior as source of truth|Needs discipline to keep implementation aligned|
|**LID + EARS**|Intent graph: HLD → LLD → EARS claims → tests → code annotations|Change cascades down the graph from product/design intent to tests/code|Best traceability from intent to code|More engineering-centric; needs governance for product-level ownership|
|**Spec Kit**|Feature folders + `.specify/memory/constitution.md` + specs/plans/tasks|Sequential flow: specify → plan → tasks → implement|Best for structured feature execution with AI agents|Weaker long-term canonical product-state model unless you add one|
|**BMAD**|PRD, architecture, stories, sprint status, project context|Agile-style phases: analysis → planning → solutioning → implementation|Best role-based product/tech collaboration workflow|Documents can drift unless explicitly reconciled into a source of truth|

---

# **1. OpenSpec**

OpenSpec has the clearest native model for **current product state over time**.

Its core idea is that **current behavior lives in the main specs**, while future or proposed work lives in separate change folders. OpenSpec explicitly defines the source of truth as the `openspec/specs/` directory containing the current agreed behavior. It also defines a change as a proposed system modification packaged with artifacts, and a delta spec as a description of additions, modifications, or removals relative to current specs.  

The lifecycle is basically:

```text
Current specs
   ↓
Proposed change / delta
   ↓
Implementation
   ↓
Archive change
   ↓
Specs become the new current state
```

OpenSpec’s own concepts page describes this cycle directly: specs describe current behavior, changes propose modifications as deltas, implementation makes the changes real, and archiving merges deltas back into the specs so the specs describe the new behavior.  

  

That is very close to what you are describing as a **behavioral source of truth**.

  

OpenSpec also separates product behavior from implementation detail. Its conventions say specs should capture verifiable behavior contracts and avoid leaking concrete implementation details like libraries, class structure, or execution mechanics; those belong in design or tasks instead.  

  

**How OpenSpec manages product state:**

```text
openspec/specs/
  = current product/system behavior

openspec/changes/<change-id>/
  proposal.md  = why / scope
  spec.md      = behavior delta
  design.md    = how
  tasks.md     = work steps

archive/
  = historical completed changes
```

**My take:** OpenSpec is the strongest of the four if your priority is:  
“Product behavior must remain the canonical source of truth, and implementation should follow it.”

---

# **2. LID + EARS**

LID, or **Linked-Intent Development**, manages product state as a **traceable graph of intent**.

The LID site describes the repository as a graph rooted in intent: code files are reachable from tests, tests from specs, specs from low-level designs, and low-level designs from the high-level design. Checking whether code still matches the design becomes walking that graph.  

The chain is:

```text
HLD
 ↓
LLD
 ↓
EARS requirement claims
 ↓
Tests
 ↓
Code with @spec annotations
```

LID uses EARS requirements as atomic, grep-addressable claims. The example shown on the LID site uses requirement IDs like `AUTH-UI-001`, tests that reference those IDs, and code comments such as `@spec AUTH-UI-001`. This makes a requirement traceable from intent to test to implementation.  

  

EARS itself is useful because it gives requirements a controlled structure. It defines patterns such as:

```text
The <system> shall <response>
When <trigger>, the <system> shall <response>
While <state>, the <system> shall <response>
Where <feature is included>, the <system> shall <response>
If <unwanted condition>, then the <system> shall <response>
```

These cover ubiquitous behavior, event-driven behavior, state-driven behavior, optional features, and unwanted behavior.  

  

**How LID + EARS manages product state:**

```text
Product intent / HLD
  = why the product exists and what behavior matters

LLD
  = component-level design intent

EARS claims
  = atomic behavioral requirements

Tests
  = executable validation of the claims

Code @spec annotations
  = implementation anchors back to the requirements
```

**My take:** LID is very strong for **traceability**. It answers:

“Where is this behavior defined, tested, and implemented?”

But by itself, LID is not as strong as OpenSpec at managing the **lifecycle of proposed vs accepted product behavior**. It gives you the graph, but you still need a change-governance process around the graph.

For your vision, LID + EARS is excellent at the component/code level, but I would not make it the only product source of truth. I would use it under a higher-level spec/change model.

---

# **3. GitHub Spec Kit**

Spec Kit is more of a **feature execution scaffold** for spec-driven development than a long-term product-state registry.

It creates a project structure with `.github/prompts` and `.specify`, including templates, scripts, and a `constitution.md`. The constitution captures non-negotiable project principles such as testing approaches, stack conventions, naming, layering, allowed libraries, and other rules that guide project evolution.  

Its common workflow is:

```text
/specify
  → define what and why

/plan
  → define how

/tasks
  → break into implementation tasks

/implement
  → execute tasks
```

The Microsoft write-up says `/specify` focuses on motivations and functional requirements while explicitly excluding technical decision-making; `/plan` covers frameworks, libraries, databases, infrastructure, and technical choices; `/tasks` breaks the work into manageable chunks.  

  

The Spec Kit GitHub repo also describes implementation as validating that prerequisites exist — constitution, spec, plan, and tasks — then parsing tasks, respecting dependencies, following TDD where defined, and executing in order.  

  

**How Spec Kit manages product state:**

```text
.specify/memory/constitution.md
  = stable rules and principles

specs/<feature>/
  spec.md
  plan.md
  tasks.md
  contracts/
  quickstart.md
```

**My take:** Spec Kit is very good at turning an idea into structured execution. It is especially useful for greenfield or feature-level work.

  

But for your specific concern — **how the current product state evolves over months/years** — Spec Kit needs help. It does not appear to have as strong a native “current accepted behavior vs pending delta vs archived change” model as OpenSpec.

  

So I would use Spec Kit for:

```text
feature discovery → planning → task breakdown → implementation
```

But I would not rely on it alone as the canonical product-state system unless you add a governed “current product behavior spec” layer.

---

# **4. BMAD**

BMAD manages current product state through **role-based, agile-style documents and workflows**.

BMAD describes itself as an AI-driven development framework that supports the full process from ideation and planning through implementation, using specialized agents, guided workflows, and planning that adapts to project complexity.  

Its workflow map has four phases:

```text
Analysis
Planning
Solutioning
Implementation
```

The Planning phase produces or updates PRDs, addenda, and decision logs. The Solutioning phase produces architecture with ADRs and epics/stories. The Implementation phase produces sprint status, story files, working code, tests, review results, and retrospectives.  

  

BMAD explicitly says each document becomes context for the next phase: the PRD tells the architect what constraints matter, the architecture tells the dev agent which patterns to follow, and stories give focused context for implementation. It also recommends `project-context.md` as a constitution-like file that guides implementation decisions and can be generated from architecture or codebase conventions.  

  

BMAD also has named roles: Analyst, Product Manager, Architect, Developer, UX Designer, and Technical Writer, each with workflows like creating/validating PRDs, architecture, implementation readiness, dev stories, code review, and documentation.  

  

**How BMAD manages product state:**

```text
product-brief.md
  = initial vision

prd.md / addendum.md / decision-log.md
  = product intent and evolving decisions

architecture.md / ADRs
  = technical solutioning

epics / stories / sprint-status.yaml
  = execution state

project-context.md
  = persistent project rules and conventions
```

**My take:** BMAD is strong for **collaboration between product and technical roles**. It is probably the best of the four for explaining how Product, PM, Architect, UX, Dev, QA, and Technical Writer can work together.

But BMAD’s product state is distributed across PRD, addenda, decision logs, architecture, stories, sprint status, and project context. That is useful, but it can drift unless you define which artifact is canonical.

---

# **Recommended model for your vision**

For what you are trying to define, I would not pick only one. I would combine them like this:

```text
BMAD
  = collaboration workflow between product and technical roles

OpenSpec
  = canonical current product/system behavior

LID + EARS
  = traceability from product behavior to tests and code

Spec Kit
  = feature-level execution accelerator
```

The best model would look like this:

```text
1. Product / Business Intent
   BMAD product brief, PRD, decision log

2. Canonical Product Behavior
   OpenSpec specs as the accepted current state

3. Proposed Change
   OpenSpec change folder with proposal + delta spec

4. Requirement Claims
   EARS-style requirement IDs inside the spec

5. Implementation Traceability
   LID links: HLD → LLD → EARS → tests → code @spec

6. Execution
   Spec Kit or BMAD stories/tasks for implementation

7. Acceptance
   Tests pass, review complete, change archived

8. New Current State
   OpenSpec specs updated as source of truth
```

In simple terms:

  

**BMAD helps people collaborate. OpenSpec protects the product truth. LID + EARS proves implementation traceability. Spec Kit helps agents execute the work.**

  

For your paper, the key argument could be:

  

The current state of a product should not live only in code, tickets, architecture diagrams, or ADRs. It should live in a behavior-first specification that product and technology both understand. Product defines the intended behavior, technology defines the implementation approach, and traceability connects the two without allowing implementation details to override product intent.


Below is a **Card Balance functionality** example using the same feature across all four methodologies:

Feature: **Card Balance**  
The customer can view the available balance, current balance, pending transactions, and last updated timestamp for a payment card.

I’ll show:

1. **Where current state lives**
2. **How 3 spec changes are represented**
3. **Directory tree**
4. **Sample file content**
5. **How the current state is generated or updated over time**

---

# **Shared feature evolution: Card Balance**

We will use the same three changes for every methodology.

## **Initial current state: Card Balance v1**

```text
A customer can view:
- current balance
- available balance
- last updated timestamp
```

## **Spec Change 1: Add pending transactions**

```text
The card balance view must show the total amount of pending transactions.
```

## **Spec Change 2: Add balance freshness rule**

```text
The card balance view must indicate when the balance data is stale.
Data is stale when the last successful balance refresh is older than 15 minutes.
```

## **Spec Change 3: Add negative balance warning**

```text
If current balance is below $0, the system must show a negative balance warning.
```

---

# **1. OpenSpec**

OpenSpec is the cleanest model for managing **current product state over time** because it has a native distinction between:

```text
current accepted behavior
vs.
proposed behavior changes
vs.
archived completed changes
```

OpenSpec’s own docs describe this cycle: specs describe current behavior, changes propose modifications as deltas, implementation makes the change real, and archiving merges deltas back into specs so the specs become the new current behavior.  

## **OpenSpec directory tree**

```text
openspec/
  specs/
    card-balance/
      spec.md                  # CURRENT STATE lives here

  changes/
    add-pending-transactions/
      proposal.md
      design.md
      tasks.md
      specs/
        card-balance/
          spec.md              # delta against current state

    add-balance-freshness/
      proposal.md
      design.md
      tasks.md
      specs/
        card-balance/
          spec.md              # delta against current state

    add-negative-balance-warning/
      proposal.md
      design.md
      tasks.md
      specs/
        card-balance/
          spec.md              # delta against current state

  archive/
    2026-05-16-add-pending-transactions/
    2026-05-16-add-balance-freshness/
    2026-05-16-add-negative-balance-warning/
```

## **Where current state is**

```text
openspec/specs/card-balance/spec.md
```

This file should always represent the **accepted current product behavior**.

## **Current state file example**

```markdown
# Card Balance Specification

## Purpose

The Card Balance capability allows an authenticated customer to view the balance information for one of their payment cards.

## Requirements

### Requirement: View card balance

The system SHALL allow an authenticated customer to view the current balance and available balance for an active card.

#### Scenario: Customer views active card balance

Given the customer is authenticated  
And the customer has an active card  
When the customer opens the card balance view  
Then the system SHALL display the current balance  
And the system SHALL display the available balance  
And the system SHALL display the last updated timestamp.
```

---

## **OpenSpec Change 1: Add pending transactions**

```text
openspec/changes/add-pending-transactions/specs/card-balance/spec.md
```

```markdown
## ADDED Requirements

### Requirement: Show pending transaction total

The system SHALL display the total pending transaction amount for an active card.

#### Scenario: Customer views card balance with pending transactions

Given the customer is authenticated  
And the customer has an active card  
And the card has pending transactions  
When the customer opens the card balance view  
Then the system SHALL display the pending transaction total.
```

After implementation and verification, this delta is archived and merged into:

```text
openspec/specs/card-balance/spec.md
```

So the current state becomes:

```markdown
# Card Balance Specification

## Purpose

The Card Balance capability allows an authenticated customer to view balance information for one of their payment cards.

## Requirements

### Requirement: View card balance

The system SHALL allow an authenticated customer to view the current balance and available balance for an active card.

#### Scenario: Customer views active card balance

Given the customer is authenticated  
And the customer has an active card  
When the customer opens the card balance view  
Then the system SHALL display the current balance  
And the system SHALL display the available balance  
And the system SHALL display the last updated timestamp.

### Requirement: Show pending transaction total

The system SHALL display the total pending transaction amount for an active card.

#### Scenario: Customer views card balance with pending transactions

Given the customer is authenticated  
And the customer has an active card  
And the card has pending transactions  
When the customer opens the card balance view  
Then the system SHALL display the pending transaction total.
```

---

## **OpenSpec Change 2: Add balance freshness rule**

```text
openspec/changes/add-balance-freshness/specs/card-balance/spec.md
```

```markdown
## ADDED Requirements

### Requirement: Show stale balance indicator

The system SHALL indicate when card balance data is stale.

#### Scenario: Balance data is stale

Given the customer is authenticated  
And the customer has an active card  
And the last successful balance refresh occurred more than 15 minutes ago  
When the customer opens the card balance view  
Then the system SHALL display a stale balance indicator  
And the system SHALL display the last updated timestamp.
```

After archive, the current state file is updated again:

```text
openspec/specs/card-balance/spec.md
```

---

## **OpenSpec Change 3: Add negative balance warning**

```text
openspec/changes/add-negative-balance-warning/specs/card-balance/spec.md
```

```markdown
## ADDED Requirements

### Requirement: Show negative balance warning

The system SHALL warn the customer when the card current balance is below zero.

#### Scenario: Card has negative balance

Given the customer is authenticated  
And the customer has an active card  
And the current balance is less than 0  
When the customer opens the card balance view  
Then the system SHALL display a negative balance warning.
```

## **How OpenSpec generates current state**

```text
1. Product/tech creates a change folder.
2. The change contains behavior deltas.
3. Implementation happens against the delta.
4. Tests verify the behavior.
5. The change is archived.
6. The delta is merged into openspec/specs/.
7. openspec/specs/ becomes the new current state.
```

For your vision, this is the ideal model for:

```text
Product behavior source of truth
+
controlled evolution over time
+
accepted current state
+
historical change traceability
```

---

# **2. LID + EARS**

LID — Linked-Intent Development — manages state as a **traceability graph**. Its docs describe the repository as a graph rooted in intent: code files are reachable from tests, tests from specs, specs from low-level designs, and low-level designs from the high-level design.  

LID also uses `@spec` annotations in code and links tests back to requirement IDs, creating a traceable chain from requirements to code to tests.  

EARS gives the requirement statements a structured form such as:

```text
When <trigger>, the <system> shall <response>
If <condition>, then the <system> shall <response>
While <state>, the <system> shall <response>
```

This makes each behavior easier to test and trace.

## **LID + EARS directory tree**

```text
docs/
  hld/
    card-servicing.md              # product/domain intent

  lld/
    card-balance.md                # component/design intent

  specs/
    card-balance.ears.md           # CURRENT BEHAVIOR CLAIMS live here

tests/
  card-balance/
    card-balance.spec.ts           # tests reference EARS IDs

src/
  card-balance/
    CardBalanceView.tsx            # code uses @spec annotations
    cardBalanceService.ts          # code uses @spec annotations

lid/
  trace-map.md                     # optional generated trace report
```

## **Where current state is**

In LID, current state is distributed across a trace graph:

```text
docs/hld/card-servicing.md
docs/lld/card-balance.md
docs/specs/card-balance.ears.md
tests/card-balance/card-balance.spec.ts
src/card-balance/*
```

But the **behavioral current state** should live mainly in:

```text
docs/specs/card-balance.ears.md
```

The implementation is not the source of truth. The implementation is linked back to the spec.

---

## **Current EARS file example**

```markdown
# Card Balance EARS Specification

## Requirement IDs

### CB-BAL-001: View current balance

When an authenticated customer opens the card balance view for an active card, the system shall display the current balance.

### CB-BAL-002: View available balance

When an authenticated customer opens the card balance view for an active card, the system shall display the available balance.

### CB-BAL-003: View last updated timestamp

When an authenticated customer opens the card balance view for an active card, the system shall display the last updated timestamp.
```

## **Test file example**

```ts
describe("Card Balance", () => {
  // @spec CB-BAL-001, CB-BAL-002, CB-BAL-003
  it("shows current balance, available balance, and last updated timestamp", async () => {
    render(<CardBalanceView cardId="card_123" />)

    expect(await screen.findByText("$120.00")).toBeVisible()
    expect(await screen.findByText("$95.00 available")).toBeVisible()
    expect(await screen.findByText(/Last updated/)).toBeVisible()
  })
})
```

## **Code file example**

```tsx
// @spec CB-BAL-001, CB-BAL-002, CB-BAL-003
export function CardBalanceView({ cardId }: { cardId: string }) {
  const balance = useCardBalance(cardId)

  return (
    <section>
      <h2>Card Balance</h2>
      <p>Current balance: {balance.currentBalance}</p>
      <p>Available balance: {balance.availableBalance}</p>
      <p>Last updated: {balance.lastUpdatedAt}</p>
    </section>
  )
}
```

---

## **LID Change 1: Add pending transactions**

Update:

```text
docs/specs/card-balance.ears.md
```

```markdown
### CB-BAL-004: View pending transaction total

When an authenticated customer opens the card balance view for an active card with pending transactions, the system shall display the total pending transaction amount.
```

Update test:

```ts
// @spec CB-BAL-004
it("shows pending transaction total", async () => {
  render(<CardBalanceView cardId="card_123" />)

  expect(await screen.findByText("$25.00 pending")).toBeVisible()
})
```

Update code:

```tsx
// @spec CB-BAL-004
<p>Pending transactions: {balance.pendingTransactionTotal}</p>
```

---

## **LID Change 2: Add balance freshness rule**

Update EARS spec:

```markdown
### CB-BAL-005: Show stale balance indicator

If the last successful balance refresh is older than 15 minutes, then the system shall display a stale balance indicator on the card balance view.
```

Update test:

```ts
// @spec CB-BAL-005
it("shows stale balance indicator when balance is older than 15 minutes", async () => {
  render(<CardBalanceView cardId="card_stale" />)

  expect(await screen.findByText("Balance may be outdated")).toBeVisible()
})
```

Update code:

```tsx
// @spec CB-BAL-005
{balance.isStale && <Alert>Balance may be outdated</Alert>}
```

---

## **LID Change 3: Add negative balance warning**

Update EARS spec:

```markdown
### CB-BAL-006: Show negative balance warning

If the card current balance is less than 0, then the system shall display a negative balance warning.
```

Update test:

```ts
// @spec CB-BAL-006
it("shows negative balance warning", async () => {
  render(<CardBalanceView cardId="card_negative" />)

  expect(await screen.findByText("Your balance is below zero")).toBeVisible()
})
```

Update code:

```tsx
// @spec CB-BAL-006
{balance.currentBalance < 0 && (
  <Alert>Your balance is below zero</Alert>
)}
```

## **How LID generates current state**

LID does not “merge deltas” the same way OpenSpec does. Instead, current state is generated by keeping the intent graph coherent:

```text
1. Update HLD/LLD if the product or design intent changes.
2. Add or modify EARS requirement IDs.
3. Add/update tests referencing those IDs.
4. Add/update code with @spec annotations.
5. Generate or inspect a trace map by walking:
   HLD → LLD → EARS → tests → code.
```

The current state is not a single final file unless you create one. It is a **linked graph**.

  

For your model, LID is excellent for:

```text
Spec-to-test-to-code traceability
```

But I would still use OpenSpec or a product spec layer above it to control the accepted product behavior over time.

---

# **3. Spec Kit**

Spec Kit is strong for taking a feature from idea to implementation through commands like:

```text
/speckit.constitution
/speckit.specify
/speckit.clarify
/speckit.checklist
/speckit.plan
/speckit.tasks
```

The Spec Kit quickstart describes this flow: define the constitution, define requirements with `/speckit.specify`, refine the specification with `/speckit.clarify`, validate it with `/speckit.checklist`, and generate the technical plan with `/speckit.plan`.  

The constitution acts as a project-level rule source. The Spec Kit template describes the constitution command as creating or updating project principles and ensuring dependent templates stay in sync.  

## **Spec Kit directory tree**

```text
.specify/
  memory/
    constitution.md              # stable product/engineering principles

  templates/
    spec-template.md
    plan-template.md
    tasks-template.md

specs/
  001-card-balance/
    spec.md                      # feature behavior
    plan.md                      # implementation plan
    tasks.md                     # execution tasks
    research.md
    data-model.md
    contracts/
      card-balance-api.yaml
    quickstart.md

  002-card-balance-pending-transactions/
    spec.md
    plan.md
    tasks.md

  003-card-balance-freshness/
    spec.md
    plan.md
    tasks.md

  004-card-balance-negative-warning/
    spec.md
    plan.md
    tasks.md
```

## **Where current state is**

Spec Kit usually stores work as feature folders:

```text
specs/001-card-balance/
specs/002-card-balance-pending-transactions/
specs/003-card-balance-freshness/
specs/004-card-balance-negative-warning/
```

So the **current state is not automatically one canonical product-state file** unless you add one.

  

Recommended addition:

```text
product-state/
  card-balance.md                # generated current accepted behavior
```

or:

```text
specs/current/
  card-balance.md
```

Without that, current state is reconstructed from completed feature specs.

---

## **Spec Kit constitution example**

```text
.specify/memory/constitution.md
```

```markdown
# Product Constitution

## Principle 1: Product Behavior First

Product behavior SHALL be defined before implementation details.

## Principle 2: Balance Data Transparency

Any customer-facing balance view SHALL show when the data was last updated.

## Principle 3: Traceable Requirements

Every implemented behavior SHALL trace back to a feature specification and acceptance criteria.

## Principle 4: No Silent Financial Risk

If a balance state may negatively affect the customer, the system SHALL clearly communicate it.
```

---

## **Initial Spec Kit feature**

```text
specs/001-card-balance/spec.md
```

```markdown
# Feature Specification: Card Balance

## User Story

As a customer, I want to view the balance of my card so that I understand how much money is available.

## Functional Requirements

### FR-001: View current balance

The system MUST display the current balance for an active card.

### FR-002: View available balance

The system MUST display the available balance for an active card.

### FR-003: View last updated timestamp

The system MUST display the last updated timestamp for the balance data.

## Acceptance Criteria

### Scenario: Customer views active card balance

Given the customer is authenticated  
And the customer has an active card  
When the customer opens the card balance view  
Then the customer sees the current balance  
And the customer sees the available balance  
And the customer sees the last updated timestamp.
```

---

## **Spec Kit Change 1: pending transactions**

```text
specs/002-card-balance-pending-transactions/spec.md
```

```markdown
# Feature Specification: Card Balance Pending Transactions

## Summary

Extend the Card Balance view to show the total amount of pending transactions.

## Functional Requirements

### FR-004: View pending transaction total

The system MUST display the total pending transaction amount when pending transactions exist for the card.

## Acceptance Criteria

### Scenario: Customer views pending transaction total

Given the customer is authenticated  
And the customer has an active card  
And the card has pending transactions  
When the customer opens the card balance view  
Then the customer sees the pending transaction total.
```

---

## **Spec Kit Change 2: balance freshness**

```text
specs/003-card-balance-freshness/spec.md
```

```markdown
# Feature Specification: Card Balance Freshness

## Summary

Extend the Card Balance view to indicate when balance data may be stale.

## Functional Requirements

### FR-005: Show stale balance indicator

The system MUST display a stale balance indicator when the last successful balance refresh is older than 15 minutes.

## Acceptance Criteria

### Scenario: Balance data is stale

Given the customer is authenticated  
And the customer has an active card  
And the last successful balance refresh occurred more than 15 minutes ago  
When the customer opens the card balance view  
Then the customer sees a stale balance indicator.
```

---

## **Spec Kit Change 3: negative balance warning**

```text
specs/004-card-balance-negative-warning/spec.md
```

```markdown
# Feature Specification: Negative Balance Warning

## Summary

Extend the Card Balance view to warn the customer when the current balance is below zero.

## Functional Requirements

### FR-006: Show negative balance warning

The system MUST display a negative balance warning when the card current balance is below 0.

## Acceptance Criteria

### Scenario: Card has negative balance

Given the customer is authenticated  
And the customer has an active card  
And the card current balance is below 0  
When the customer opens the card balance view  
Then the customer sees a negative balance warning.
```

---

## **Recommended generated current state file**

```text
product-state/card-balance.md
```

```markdown
# Current Product State: Card Balance

## Accepted Behavior

The Card Balance capability allows an authenticated customer to view balance information for an active card.

## Current Requirements

### FR-001: View current balance

The system MUST display the current balance for an active card.

### FR-002: View available balance

The system MUST display the available balance for an active card.

### FR-003: View last updated timestamp

The system MUST display the last updated timestamp for the balance data.

### FR-004: View pending transaction total

The system MUST display the total pending transaction amount when pending transactions exist for the card.

### FR-005: Show stale balance indicator

The system MUST display a stale balance indicator when the last successful balance refresh is older than 15 minutes.

### FR-006: Show negative balance warning

The system MUST display a negative balance warning when the card current balance is below 0.

## Source Feature Specs

- specs/001-card-balance/spec.md
- specs/002-card-balance-pending-transactions/spec.md
- specs/003-card-balance-freshness/spec.md
- specs/004-card-balance-negative-warning/spec.md
```

## **How Spec Kit generates current state**

Out of the box, Spec Kit generates structured feature artifacts. It does not inherently make `product-state/card-balance.md` the same way OpenSpec maintains current specs.

So I would add a custom generation step:

```text
1. Completed feature specs are marked accepted.
2. A script or agent scans accepted specs.
3. It extracts functional requirements and acceptance criteria.
4. It writes/updates product-state/card-balance.md.
5. Product-state becomes the readable current behavior file.
```

Example command:

```bash
npm run generate:product-state -- card-balance
```

Conceptual output:

```text
Read:
  specs/001-card-balance/spec.md
  specs/002-card-balance-pending-transactions/spec.md
  specs/003-card-balance-freshness/spec.md
  specs/004-card-balance-negative-warning/spec.md

Generate:
  product-state/card-balance.md
```

For your vision, Spec Kit is best used as:

```text
feature execution engine
```

Not necessarily the canonical product-state engine unless you add that layer.

---

# **4. BMAD**

BMAD is strongest when you want to explain **how product and technical roles collaborate**.

BMAD describes a workflow where context is built progressively across phases, and each phase produces documents that inform the next so agents know what to build and why.  

Its workflow includes planning artifacts like PRD, addenda, and decision logs, solutioning artifacts like architecture and stories, and implementation artifacts like sprint status, story files, tests, and retrospectives.  

The BMAD getting started docs also mention that epics and stories are created after architecture so that stories are technically informed by architecture decisions.  

## **BMAD directory tree**

```text
docs/
  product/
    product-brief.md
    prd.md                         # product intent / major behavior source
    prd-addendum-card-balance.md   # changes to product behavior
    decision-log.md

  architecture/
    architecture.md
    adr/
      ADR-001-card-balance-api.md
      ADR-002-balance-cache-freshness.md

  epics/
    epic-card-servicing.md

  stories/
    story-001-card-balance-basic.md
    story-002-card-balance-pending-transactions.md
    story-003-card-balance-freshness.md
    story-004-card-balance-negative-warning.md

  qa/
    card-balance-test-plan.md

  current-state/
    card-balance.md                # recommended generated current state

.bmad-core/
  workflows/
  templates/
  agents/
```

## **Where current state is**

BMAD current state is often distributed across:

```text
PRD
architecture
epics
stories
decision log
QA artifacts
```

For your vision, I would **not** leave it distributed. I would add:

```text
docs/current-state/card-balance.md
```

This becomes the reconciled product behavior state.

---

## **BMAD PRD example**

```text
docs/product/prd.md
```

```markdown
# Product Requirements Document

## Capability: Card Balance

Customers need to understand the balance state of their payment cards.

## Goals

- Show clear card balance information.
- Reduce confusion between current and available balance.
- Make balance freshness visible.
- Warn customers when balance state may create financial risk.

## Initial Scope

### PRD-CB-001: View current balance

The customer must be able to view the current balance for an active card.

### PRD-CB-002: View available balance

The customer must be able to view the available balance for an active card.

### PRD-CB-003: View last updated timestamp

The customer must be able to view when the balance data was last updated.
```

---

## **BMAD Change 1: pending transactions**

```text
docs/product/prd-addendum-card-balance.md
```

```markdown
# PRD Addendum: Card Balance Pending Transactions

## Change Summary

The Card Balance view must include pending transaction information.

## Product Requirement

### PRD-CB-004: Pending transaction total

The customer must be able to see the total amount of pending transactions for an active card.

## Product Rationale

Customers may see a difference between current balance and available balance. Pending transaction visibility helps explain that difference.

## Acceptance Criteria

Given the customer has pending transactions  
When the customer opens the card balance view  
Then the customer sees the total pending transaction amount.
```

Story generated from PRD + architecture:

```text
docs/stories/story-002-card-balance-pending-transactions.md
```

```markdown
# Story 002: Show Pending Transaction Total

## Story

As a customer, I want to see pending transaction totals so that I understand why my available balance differs from my current balance.

## Acceptance Criteria

- Display pending transaction total when pending transactions exist.
- Hide or show zero state when no pending transactions exist.
- Use the existing Card Balance API response shape if possible.

## Technical Notes

- Extend card balance read model.
- Add `pendingTransactionTotal` to API response.
- Update UI component.
- Add test coverage.
```

---

## **BMAD Change 2: balance freshness**

```text
docs/product/prd-addendum-card-balance.md
```

```markdown
# PRD Addendum: Card Balance Freshness

## Change Summary

Customers must be informed when balance data may be stale.

## Product Requirement

### PRD-CB-005: Stale balance indicator

The customer must see a stale balance indicator when the last successful balance refresh is older than 15 minutes.

## Product Rationale

Customers may make financial decisions based on balance information. The product must communicate when the information may no longer be fresh.

## Acceptance Criteria

Given the last successful balance refresh is older than 15 minutes  
When the customer opens the card balance view  
Then the customer sees a stale balance indicator.
```

Architecture decision:

```text
docs/architecture/adr/ADR-002-balance-cache-freshness.md
```

```markdown
# ADR-002: Balance Cache Freshness Rule

## Status

Accepted

## Context

The Card Balance view depends on balance data that may come from a cached provider response.

## Decision

Balance data is considered stale when the last successful refresh is older than 15 minutes.

## Consequences

- The API must return `lastUpdatedAt`.
- The UI or API must calculate freshness.
- The UI must display a stale balance indicator.
```

---

## **BMAD Change 3: negative balance warning**

```text
docs/product/prd-addendum-card-balance.md
```

```markdown
# PRD Addendum: Negative Balance Warning

## Change Summary

Customers must be warned when their current balance is below zero.

## Product Requirement

### PRD-CB-006: Negative balance warning

The customer must see a warning when the current balance is below 0.

## Product Rationale

A negative balance may require customer action or indicate financial risk.

## Acceptance Criteria

Given the card current balance is below 0  
When the customer opens the card balance view  
Then the customer sees a negative balance warning.
```

Story:

```text
docs/stories/story-004-card-balance-negative-warning.md
```

```markdown
# Story 004: Show Negative Balance Warning

## Story

As a customer, I want to be warned when my card balance is negative so that I understand I may need to take action.

## Acceptance Criteria

- Show warning when `currentBalance < 0`.
- Do not show warning when `currentBalance >= 0`.
- Warning copy must be customer-friendly and not overly alarming.

## Dependencies

- Card Balance API must expose current balance.
- UI must support warning component.
```

---

## **Recommended BMAD generated current state**

```text
docs/current-state/card-balance.md
```

```markdown
# Current State: Card Balance

## Capability Owner

Product: Card Servicing  
Technology: Card Platform

## Current Accepted Product Behavior

The Card Balance capability allows an authenticated customer to view balance information for an active card.

## Requirements

### PRD-CB-001: View current balance

The customer can view the current balance for an active card.

### PRD-CB-002: View available balance

The customer can view the available balance for an active card.

### PRD-CB-003: View last updated timestamp

The customer can view when the balance data was last updated.

### PRD-CB-004: Pending transaction total

The customer can view the total amount of pending transactions for an active card.

### PRD-CB-005: Stale balance indicator

The customer sees a stale balance indicator when the last successful balance refresh is older than 15 minutes.

### PRD-CB-006: Negative balance warning

The customer sees a warning when the current balance is below 0.

## Technical Support

- Architecture: docs/architecture/architecture.md
- ADR: docs/architecture/adr/ADR-002-balance-cache-freshness.md
- Stories:
  - docs/stories/story-001-card-balance-basic.md
  - docs/stories/story-002-card-balance-pending-transactions.md
  - docs/stories/story-003-card-balance-freshness.md
  - docs/stories/story-004-card-balance-negative-warning.md
```

## **How BMAD generates current state**

BMAD gives you the collaboration workflow, but I would add a reconciliation step:

```text
1. Product updates PRD or PRD addendum.
2. Architect updates architecture or ADRs.
3. PO/SM creates epics and stories.
4. Dev implements stories.
5. QA verifies acceptance criteria.
6. A product-state reconciliation step updates docs/current-state/card-balance.md.
```

This is important because BMAD can otherwise leave product truth spread across many documents.

---

# **Side-by-side: where the current state lives**

|**Methodology**|**Best current-state location**|**Native or custom?**|**How it gets updated**|
|---|---|---|---|
|**OpenSpec**|`openspec/specs/card-balance/spec.md`|Native|Archive/merge accepted change deltas|
|**LID + EARS**|`docs/specs/card-balance.ears.md` plus trace graph|Native-ish|Update requirement IDs, tests, and `@spec` links|
|**Spec Kit**|`product-state/card-balance.md` or `specs/current/card-balance.md`|Custom recommended|Generate from accepted feature specs|
|**BMAD**|`docs/current-state/card-balance.md`|Custom recommended|Reconcile PRD, architecture, stories, QA|

---

# **Best combined model for your paper**

For your vision, I would describe the architecture like this:

```text
Product + Technology Collaboration Layer
  BMAD
  - Product brief
  - PRD
  - Architecture
  - ADRs
  - Epics/stories
  - QA/readiness

Canonical Product Behavior Layer
  OpenSpec
  - Current behavior specs
  - Proposed deltas
  - Archived accepted changes

Traceability Layer
  LID + EARS
  - Requirement IDs
  - Structured EARS claims
  - Tests linked to claims
  - Code linked with @spec annotations

Execution Layer
  Spec Kit
  - Specify
  - Clarify
  - Plan
  - Tasks
  - Implement
```

The cleanest version:

```text
BMAD explains how product and technology collaborate.
OpenSpec owns the current accepted product behavior.
LID + EARS connects behavior to tests and code.
Spec Kit accelerates feature execution.
```

For the **Card Balance** example, the final ideal structure could be:

```text
docs/
  product/
    prd.md
    decision-log.md

openspec/
  specs/
    card-balance/
      spec.md                    # canonical current state

  changes/
    add-pending-transactions/
    add-balance-freshness/
    add-negative-balance-warning/

docs/
  specs/
    card-balance.ears.md         # atomic traceable claims

tests/
  card-balance/
    card-balance.spec.ts         # tests reference EARS IDs

src/
  card-balance/
    CardBalanceView.tsx          # code references @spec IDs

specs/
  001-card-balance/
    spec.md
    plan.md
    tasks.md                    # Spec Kit execution artifacts
```

And the rule should be:

  

The current state of the product should live in the **behavioral specification**, not in code, tickets, ADRs, or architecture documents.  
Product defines the behavior. Technology defines how to implement it. Traceability proves that implementation still matches the intended behavior.