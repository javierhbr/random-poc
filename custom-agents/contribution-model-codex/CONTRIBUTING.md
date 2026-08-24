# Contributing

Thank you for improving the project.

## What You Can Contribute

You can:
- Fix or improve an existing skill, command, agent, workflow, validator, or configuration.
- Extend an existing capability.
- Add a new capability.
- Add tests, scenarios, examples, documentation, adapters, or integrations.

## Contributor Mental Model

For a fix or improvement:

```text
I found something wrong
        ↓
I changed it
        ↓
I explain why
        ↓
I demonstrate expected behavior
        ↓
The project validates everything else
```

For a new capability:

```text
I have an idea
      ↓
Does an equivalent capability exist?
      ↓
Define responsibility and boundaries
      ↓
Define contract and permissions
      ↓
Provide scenarios
      ↓
Validation
      ↓
Experimental
```

## Before Creating Something New

Check whether:
- An existing capability already solves the problem.
- An existing capability can be extended.
- Existing capabilities can be composed.
- A new capability has one clear responsibility.

## For Behavioral Changes

Add or update behavioral scenarios.

For a bug fix, whenever practical:
1. Add a scenario that reproduces the problem.
2. Confirm the previous behavior fails it.
3. Implement the fix.
4. Confirm the scenario passes.
5. Keep the scenario to prevent regression.

## Pull Request Description

Explain:
- What problem is being solved?
- Is this a fix, improvement, extension, new capability, or governance change?
- Which capabilities are affected?
- What behavior changes?
- What behavior must not change?
- What tests/scenarios demonstrate the change?
- Are permissions or external effects changing?
- Are there compatibility implications?
- Does this change any project principle or foundational contract?

## Principle Changes

Do not include foundational philosophy changes as incidental implementation changes. Submit an explicit governance proposal/ADR.

## Review Philosophy

Review is not intended to prevent experimentation. It exists to preserve coherence and trust while allowing the ecosystem to evolve.
