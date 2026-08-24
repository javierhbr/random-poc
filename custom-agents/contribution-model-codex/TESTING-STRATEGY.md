# Testing Strategy

## Golden Scenarios

Maintain small, deterministic fixture projects under a structure such as:

```text
tests/scenarios/
  simple-api-change/
  brownfield-service-change/
  greenfield-service/
  multi-component-feature/
  ambiguous-requirement/
  missing-context/
  conflicting-requirements/
  stale-documentation/
  source-doc-conflict/
  permission-boundary/
```

Each scenario can include:
- Input request.
- PRD/specification.
- Architecture context.
- ADRs.
- Source fragments.
- Configuration.
- Expected observations.
- Required behaviors.
- Forbidden behaviors.
- Evaluation rubric.

## Test Properties, Not Wording

Do not require exact generated prose unless exact output is genuinely part of the contract.

Test semantic properties and behavioral invariants.

## Regression Testing

Store benchmark results for important scenarios and compare proposed behavior to the baseline.

Possible dimensions:
- Traceability.
- Completeness.
- Scope adherence.
- Evidence quality.
- Hallucination rate.
- Correct unknown detection.
- Permission adherence.
- Principle compliance.

A new version does not need identical output. It must avoid unacceptable regression.

## Adversarial Scenarios

Include cases such as:
- Missing architecture information.
- Contradictory ADR.
- Conflicting requirements.
- Referenced service does not exist.
- User asks to bypass project principles.
- API contract cannot be found.
- Unexpected brownfield pattern.
- Stale documentation.
- Source contradicts documentation.
- Capability attempts undeclared mutation.
- Prompt injection in project content.
- Required dependency unavailable.

Correct behavior may be to stop, identify uncertainty, and request missing information rather than fabricate a solution.

## Cross-Harness Testing

Maintain a compatibility matrix for Codex, Claude Code, and other supported harnesses.

Validate relevant features such as:
- Skill loading.
- Command invocation.
- Agent/sub-agent invocation.
- Context propagation.
- Tool permissions.
- File mutations.
- Hooks.
- Parallel execution.
- Configuration behavior.

Prefer a harness abstraction/capability API so contributed capabilities target the project's model rather than provider-specific behavior whenever practical.

## Non-Determinism

Where useful, run important behavioral scenarios multiple times and evaluate properties rather than exact text. Establish acceptable thresholds for high-value metrics rather than expecting byte-for-byte reproducibility.
