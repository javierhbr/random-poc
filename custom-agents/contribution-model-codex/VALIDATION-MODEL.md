# Validation Model

## Validation Pyramid

```text
              Human Review
                   ▲
             Agent Evaluation
                   ▲
        Behavioral Scenario Tests
                   ▲
            Static Validation
```

## 1. Static Validation

Prefer deterministic checks when possible:

- Required metadata.
- Valid schemas/configuration.
- Existing tool/skill/agent references.
- No broken references.
- Duplicate names/collisions.
- Dependency cycles.
- Unsupported provider features.
- Declared permissions.
- Required documentation.
- Required tests.
- Contract completeness.

## 2. Behavioral Scenario Validation

Agent systems should generally be tested as:

`scenario → expected properties`

rather than:

`input → exact text`

Example expected properties:
- Identifies impacted components.
- Traces claims to evidence.
- Marks missing information.
- Stays inside scope.
- Does not perform forbidden mutations.

## 3. Principle Validation

Independent from functional correctness.

Questions include:
- Does the change violate human-control rules?
- Does it invent information?
- Does it bypass an intended workflow?
- Does it duplicate an existing capability unnecessarily?
- Does it introduce avoidable complexity?
- Does it expand permissions?
- Does it violate responsibility boundaries?

## 4. Evaluator Agents

Useful evaluator roles include:

### Principle Reviewer
Checks project philosophy and constitutional rules.

### Capability Reviewer
Checks responsibility, scope, boundaries, inputs, outputs, and contract.

### Regression Reviewer
Compares new behavior with established baselines.

### Safety / Permission Reviewer
Checks mutation scope, external effects, privilege expansion, and dangerous defaults.

### Duplication Reviewer
Checks whether an equivalent capability already exists and whether composition is preferable.

### Evidence / Hallucination Reviewer
Challenges unsupported claims and validates Observed/Derived/Assumed/Unknown classification.

### Quality Reviewer
Checks clarity, maintainability, boundedness, testability, and unnecessary complexity.

Evaluators should judge against explicit contracts and principles, not generic “quality.”

## 5. Adversarial Advisor

For important/high-risk changes, use an independent adversarial evaluator whose goal is to find ways the contribution can fail, violate principles, misuse permissions, or behave incorrectly under incomplete/conflicting context.

The adversarial evaluator should not share the worker's objective of defending the solution. Its responsibility is to challenge it.
