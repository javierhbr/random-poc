# Contribution Model

## 1. Purpose

The project is an extensible harness/plugin ecosystem that can run across Codex, Claude Code, and other compatible agent environments. Contributions may modify existing skills, commands, agents, workflows, validators, configuration, documentation, or integrations, or introduce completely new capabilities.

The contribution model must support collaboration without allowing the project to gradually lose its philosophy, architectural coherence, safety boundaries, or expected behavior.

## 2. Governing Principle

**Open for changes; governed around principles.**

A contribution must answer two independent questions:

1. **Does it work?**
2. **Does it still behave like this project?**

Passing functional tests is not sufficient if the contribution violates the project's principles.

## 3. What Can Be Contributed?

### Fix / Improve Existing Capability
Examples:
- Fix incorrect skill behavior.
- Improve a command's orchestration.
- Correct an agent's scope.
- Improve instructions.
- Reduce hallucinations.
- Improve context usage.
- Fix configuration.
- Add missing tests.

### Extend Existing Behavior
Examples:
- Add an optional parameter.
- Add support for another scenario.
- Extend a workflow.
- Support another harness.
- Add another validator.

### Add New Capability
Examples:
- Skill
- Command
- Agent
- Workflow
- Validator
- Integration
- Configuration feature
- Test fixture
- Documentation/tooling

## 4. Capability Types

### Skill
Reusable knowledge and reasoning behavior.

### Command
User-facing entry point or orchestration mechanism.

### Agent
A delegated role with bounded responsibility, tools, permissions, and expected output.

### Workflow
Coordinates multiple capabilities to achieve a larger goal.

### Validator
Evaluates a capability or result against explicit criteria.

### Configuration
Defines runtime, provider, capability, permission, or project behavior.

## 5. Capability Contract

Every meaningful capability should define:

- Purpose.
- When it should be used.
- Inputs.
- Outputs.
- Allowed behavior.
- Forbidden behavior.
- Dependencies.
- Permissions.
- Evidence requirements.
- Success conditions.
- Failure/unknown behavior.
- Test scenarios.

The contract changes review from “does this prompt look good?” to “does this behavior satisfy its contract?”

## 6. Contribution Risk Levels

### Level 0 — Content
Documentation, examples, templates.

### Level 1 — Read-Only Capability
Analysis, research, classification, review.

### Level 2 — Controlled Mutation
Generate or modify documents/files inside an explicitly bounded workspace.

### Level 3 — Repository Mutation
Source changes, Git operations, branches, commits.

### Level 4 — External/System Mutation
External services, CI/CD, project configuration, credentials, issue trackers, production-affecting actions.

Higher-risk contributions require stronger validation and review.

## 7. Contribution Lifecycle

```text
Proposal
   ↓
Experimental
   ↓
Validated
   ↓
Trusted
   ↓
Core
```

### Experimental
New or substantially changed capability. Restricted trust and permissions.

### Validated
Passes required automated validation and scenario tests.

### Trusted
Has demonstrated reliability in real usage and received maintainer review.

### Core
Part of the project's maintained foundation and subject to stronger compatibility guarantees.

Not every useful contribution needs to become Core.

## 8. Validation Pipeline

```text
Contribution
     ↓
Change Classification
     ↓
Static Validation
     ↓
Capability Contract Check
     ↓
Behavioral Scenario Tests
     ↓
Principle Validation
     ↓
Risk-Specific Validation
     ↓
Cross-Harness / Integration Tests
     ↓
Regression Evaluation
     ↓
Maintainer Review
```

Validation depth is proportional to the change.

### Documentation Change
Static checks + relevant principle checks.

### Existing Skill Change
Static + existing scenarios + new regression scenario + principle validation.

### Agent Change
Static + behavioral scenarios + permission/scope review + principle validation + regressions.

### Configuration/Core Runtime Change
Compatibility + security + broad regression suite + maintainer approval.

### New Capability
Full contract + scenarios + relevant evaluators + integration validation + maintainer approval.

## 9. Behavioral Change Rule

**A behavioral change should normally include a behavioral test.**

A bug fix should reproduce the bug in a scenario before the fix and preserve that scenario permanently after the fix.

This turns the test suite into accumulated institutional knowledge.

## 10. Evidence Model

Important conclusions produced by capabilities should be distinguishable as:

- **Observed** — directly supported by a source.
- **Derived** — logically inferred from observed evidence.
- **Assumed** — necessary assumption, explicitly identified.
- **Unknown** — insufficient evidence.

Validators should be able to challenge unsupported conclusions and trace important decisions back to evidence.

## 11. Maintainer Responsibility

Maintainers do not need to own every implementation.

They own:
- Philosophy.
- Architectural coherence.
- Trust model.
- Core interfaces/contracts.
- Promotion into trusted/core status.
- Approval of governance-level changes.

This prevents contribution from becoming centralized while keeping the ecosystem coherent.
