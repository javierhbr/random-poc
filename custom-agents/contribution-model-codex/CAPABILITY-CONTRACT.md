# Capability Contract Template

## Identity
- Name:
- Type: Skill | Command | Agent | Workflow | Validator | Configuration
- Owner:
- Maturity: Experimental | Validated | Trusted | Core
- Risk Level: 0–4

## Purpose
What single responsibility does this capability have?

## Invocation
When should it be used? When should it not be used?

## Inputs
What information or artifacts are required?

## Outputs
What must the capability produce?

## Allowed Behavior
What may it read, reason about, invoke, or mutate?

## Forbidden Behavior
What must it never do?

## Dependencies
Required skills, tools, agents, configuration, or external systems.

## Permissions
Explicitly declare read/write/external/system permissions.

## Evidence Requirements
For important conclusions, identify expected evidence and whether conclusions may be Observed, Derived, Assumed, or Unknown.

## Success Conditions
Properties that must be true for a successful result.

## Failure / Unknown Behavior
How should the capability respond to missing, conflicting, stale, or insufficient information?

## Behavioral Invariants
Rules that should remain true across implementations and wording changes.

## Test Scenarios
List happy-path, edge, adversarial, and regression scenarios.

## Compatibility
Supported harnesses/providers and known limitations.
