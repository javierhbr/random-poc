# SDD Materiality, Classification, and Output

## Materiality

Prioritize blind spots that could cause:

- incompatible implementations
- incorrect business behavior
- broken consumers
- hidden coupling
- implementation invention
- acceptance tests that pass while the intended outcome fails
- operational failure
- difficult migration
- ambiguous ownership
- unsafe or irreversible behavior

Discard issues that merely improve prose without changing implementation or outcome.

## Blind Spot Budget

Default: **3–7 highest-value specification blind spots**.

Generate broadly, report narrowly.

Do not fill the budget artificially.

## Finding Classification

### MISSING REQUIREMENT

Required behavior or outcome is absent.

### MISSING ASSUMPTION

Implementation depends on an unstated condition.

### AMBIGUOUS BEHAVIOR

Two reasonable implementations could behave differently.

### MISSING CONTRACT

Consumer/producer/interface expectations are undefined.

### MISSING FAILURE BEHAVIOR

The spec describes normal behavior but not a material failure condition.

### MISSING BOUNDARY

Ownership or bounded-context responsibility is unclear.

### MISSING DEPENDENCY

The behavior relies on a dependency the spec does not identify or characterize.

### MISSING ACTOR

An actor that materially affects or experiences the behavior is absent.

### MISSING INPUT/OUTPUT SEMANTICS

Shape, meaning, timing, ordering, guarantees, or lifecycle are insufficiently defined.

### MISSING ACCEPTANCE CRITERIA

The spec lacks an observable condition needed to validate the intended outcome.

### MISSING NON-FUNCTIONAL CONSTRAINT

A required operational, security, performance, reliability, compatibility, or other cross-cutting constraint is missing.

### OUT-OF-SCOPE CANDIDATE

A legitimate concern that should be consciously excluded rather than accidentally omitted.

## Dispositions

Use:

- **RESOLVE**
- **ASSUME**
- **OUT OF SCOPE**
- **ACCEPT RISK**

Prefer moving material decisions upstream into the spec.

## Readiness Verdict

### READY

No material specification blind spots identified.

### READY WITH ASSUMPTIONS

Implementation can proceed once listed assumptions are recorded.

### NEEDS CLARIFICATION

Material implementation decisions remain undefined.

### NOT READY

A critical specification gap could produce the wrong implementation or outcome.

## Recommended Output

```markdown
# SDD Spec Blind Spot Analysis

## Spec Understanding
Type:
Objective:
Bounded context:
Actors:
Inputs:
Outputs:
Dependencies:
Explicit assumptions:

## Top Blind Spots

### [SEVERITY] [CLASSIFICATION] — Name
Missing or ambiguous:
Why it matters:
Implementation decision currently left open:
Potential divergent implementations:
Recommended disposition:
Suggested spec change:

## Hidden Assumptions
...

## Implementation Invention Test
...

## Contract Risks
...

## SDD Premortem
...

## Independent Adversarial Finding
...

## Explicit Scope Candidates
...

## Decisions Required Before Planning
...

## Verdict
READY | READY WITH ASSUMPTIONS | NEEDS CLARIFICATION | NOT READY
```
