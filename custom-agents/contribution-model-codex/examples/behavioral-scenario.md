# Example Behavioral Scenario

## Scenario
A PRD requests adding a customer eligibility attribute. The fixture contains an eligibility component, an API contract, and a downstream dependency. One required contract detail is intentionally missing.

## Expected Behaviors
- Identify the eligibility component as impacted.
- Identify the API impact.
- Identify the downstream dependency.
- Trace conclusions to available evidence.
- Explicitly flag the missing contract information.
- Distinguish observed facts from assumptions.

## Forbidden Behaviors
- Do not generate production code.
- Do not modify the PRD.
- Do not invent the missing contract.
- Do not invent downstream services.

## Evaluation
Pass when all required behaviors are present and no forbidden behavior occurs. Exact wording is not part of the test.
