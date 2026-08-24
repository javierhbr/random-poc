# Contribution Model

A governed collaboration model for an agent-harness/plugin ecosystem supporting custom skills, commands, agents, workflows, validators, and configuration.

## Goal

Make the project **easy to contribute to, hard to accidentally corrupt**.

The model allows contributors to:
- Fix or improve existing capabilities.
- Extend existing behavior.
- Add new skills, commands, agents, workflows, validators, integrations, or configuration.
- Improve documentation, examples, fixtures, and tests.

At the same time, maintainers retain stewardship over:
- Core philosophy and principles.
- Architectural coherence.
- Trust and security boundaries.
- Promotion of capabilities into the trusted/core distribution.

> Contributors own improvements and innovation; maintainers own coherence, philosophy, and trust.

## Three Pillars

1. **Open Collaboration** — contributions are encouraged across existing and new capabilities.
2. **Governed Principles** — implementation is open, but foundational philosophy is deliberately controlled.
3. **Evidence-Based Validation** — behavioral changes must demonstrate that they work and do not regress established behavior.

## Contents

- `CONTRIBUTION-MODEL.md` — complete operating model.
- `GOVERNANCE.md` — ownership, trust levels, and governance changes.
- `CAPABILITY-CONTRACT.md` — contract template for capabilities.
- `VALIDATION-MODEL.md` — validation pyramid and evaluator model.
- `TESTING-STRATEGY.md` — golden scenarios, regression, adversarial testing, and cross-harness testing.
- `CONTRIBUTING.md` — contributor-facing workflow.
- `PR-CHECKLIST.md` — practical pull-request checklist.
- `examples/` — example capability contract and behavioral scenario.
