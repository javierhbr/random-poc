# SDD Blind Spot Classification and Output

Load this reference when ranking findings or producing the final report.

## Blind Spot Budget

Generate broadly, report narrowly.

Default to 3–7 highest-value specification blind spots. Fewer is better when sufficient. Do not manufacture
findings to fill the budget.

Prioritize gaps that could cause:

- incompatible implementations
- incorrect business behavior
- broken consumers
- hidden coupling
- implementation invention
- operational failure
- difficult migration
- acceptance tests that pass while the intended outcome fails

## Finding Classifications

Use one primary classification:

- `MISSING REQUIREMENT`
- `MISSING ASSUMPTION`
- `AMBIGUOUS BEHAVIOR`
- `MISSING CONTRACT`
- `MISSING FAILURE BEHAVIOR`
- `MISSING BOUNDARY`
- `MISSING DEPENDENCY`
- `MISSING ACTOR`
- `MISSING INPUT/OUTPUT SEMANTICS`
- `MISSING ACCEPTANCE CRITERIA`
- `MISSING NON-FUNCTIONAL CONSTRAINT`
- `OUT-OF-SCOPE CANDIDATE`

## Severity

### CRITICAL

Could produce the wrong system, violate a fundamental contract, or invalidate the intended outcome.

### IMPORTANT

Could materially change behavior, implementation, interoperability, or operations.

### CONSIDER

Should be clarified but is unlikely to invalidate the approach.

## Dispositions

### RESOLVE

Update or clarify the specification before proceeding.

### ASSUME

Record a deliberate, testable assumption in the specification.

### OUT OF SCOPE

Add an explicit scope boundary so implementation does not silently invent behavior.

### ACCEPT RISK

Record the known risk and intentionally proceed.

Prefer resolving important decisions in the specification rather than pushing them into implementation.

## Output Template

```markdown
# SDD Spec Blind Spot Analysis

## Spec Understanding

Type:
Objective:
Expected outcome:
Bounded context:
Actors:
Inputs:
Outputs:
Producers:
Consumers:
Dependencies:
Explicit assumptions:

## Top Blind Spots

### [CRITICAL | IMPORTANT | CONSIDER] [CLASSIFICATION] — Name

Missing or ambiguous:

Why it matters:

Evidence:

Implementation decision currently left open:

Potential divergent implementations / outcomes:

Recommended disposition:
RESOLVE | ASSUME | OUT OF SCOPE | ACCEPT RISK

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

## Readiness Verdicts

### READY

No material specification blind spots identified.

### READY WITH ASSUMPTIONS

Implementation can proceed after the listed assumptions are explicitly recorded.

### NEEDS CLARIFICATION

Material decisions remain undefined and could produce divergent implementation or outcomes.

### NOT READY

A critical specification gap could lead to the wrong implementation or violate a fundamental contract.
