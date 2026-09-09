# SDD Specification Analysis Reference

## Specification Understanding

Identify:

- spec type: platform, component, feature, integration, behavior, other
- objective
- problem being solved
- intended outcome
- actors
- bounded context
- dependencies
- inputs
- outputs
- producers
- consumers
- constraints
- explicit assumptions
- explicit out-of-scope items

## Decision Gap Test

Ask:

> What decisions would an implementer still have to invent?

Inspect:

### WHY

Is the problem and intended outcome clear?

### WHAT

Is required behavior clear without unnecessarily prescribing implementation details?

### BOUNDARIES

What belongs inside the component/domain? What explicitly does not?

### INPUTS

What enters the system? Required vs optional? Validation? Semantics?

### PRODUCERS

Who or what produces each important input? What guarantees exist?

### OUTPUTS

What leaves the system? Observable behavior? Side effects?

### CONSUMERS

Who relies on each output? What semantics or guarantees do they depend on?

### STATE

What information is read, created, changed, persisted, or deleted?

### SOURCE

Where does required information come from?

### DESTINATION

Where is information sent or persisted?

### CONTRACTS

What behavior must remain stable for consumers, collaborators, and extension points?

### INVARIANTS

What must always be true?

### FAILURE

What happens when expected operations fail?

### OWNERSHIP

Who owns lifecycle, schema, contract, exceptions, migration, or operational responsibility?

## Behavior Completeness

For important behavior use:

```text
Given <context>
When <event/action>
Then <observable outcome>
```

Then consider only relevant variations:

- success
- failure
- partial success
- retry
- duplicate
- delay
- out-of-order
- dependency unavailable
- malformed input
- conflicting input

Do not add irrelevant scenario noise.

## Contract Blind Spots

Inspect:

- public interfaces
- extension interfaces
- API behavior
- events
- persistence expectations
- error semantics
- compatibility
- versioning
- lifecycle

Ask:

> Could two competent teams implement this differently while both believing they complied?

If yes, identify the ambiguity and the material difference it could create.

## Domain Boundary Blind Spots

Look for:

- cross-domain dependencies
- leaked business logic
- duplicated ownership
- unclear source of truth
- implicit coupling
- orchestration ownership ambiguity
- data ownership ambiguity

Ask:

> Is this component making a decision that belongs to another domain?

## Producer / Consumer Test

For every important input:

- producer
- guarantees
- failure if guarantees are violated

For every important output:

- consumer
- expectations
- timing/order/schema/semantic dependencies

Inputs and outputs without a meaningful producer/consumer model are candidate blind spots.

## Traceability Test

For each important requirement ask:

- Why does it exist?
- What outcome does it support?
- How would implementation know it satisfied it?
- How would validation detect failure?

Requirements without observable outcomes may be incomplete.

## Acceptance Criteria Test

Ask:

> Could all stated acceptance criteria pass while the intended product or business outcome still fails?

If yes, identify the missing observable behavior or validation condition.

## SDD Premortem

Use exactly this framing when appropriate:

> Imagine the implementation was generated exactly from this specification and passed the explicitly stated acceptance criteria, but the feature still failed in production or failed the intended product outcome. What did the specification fail to say?
