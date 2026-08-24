# Governance

## Open Implementation, Governed Philosophy

Contributors should have broad freedom to fix problems, improve behavior, and introduce ideas. Foundational principles are more stable than individual implementations and require explicit governance.

## Ownership Layers

### Core
Runtime, capability model, foundational contracts, permissions, philosophy, and compatibility guarantees.

Changes require maintainer approval and stronger validation.

### Standard Capabilities
Skills, commands, agents, workflows, and validators distributed with the plugin.

Contributors can change these through normal pull requests with required tests.

### Community / Experimental
New ideas and capabilities with a lower contribution barrier and restricted trust.

Successful experimental capabilities can be promoted over time.

## Project Constitution

The exact principles should live in a small, explicit constitution. Typical examples:

- Humans remain in control of consequential actions.
- Prefer evidence over invented context.
- Make uncertainty explicit.
- Reuse existing capabilities before creating duplicates.
- Keep agents and skills narrowly responsible.
- Minimize unnecessary context, tools, and complexity.
- Do not silently expand permissions.
- Preserve intentional separation of responsibility between requirements, design, planning, and implementation.
- Mutable behavior requires appropriate validation.
- Fail safely when required information is unavailable.

Principles should be few, durable, and testable enough to guide reviews.

## Governance Changes

A contribution that changes a foundational principle, capability contract, permission model, or compatibility guarantee should use a governance proposal/ADR containing:

1. Problem.
2. Why the current rule is insufficient.
3. Proposed change.
4. Affected capabilities and users.
5. Compatibility implications.
6. Security/trust implications.
7. Alternatives.
8. Trade-offs.
9. Migration strategy.
10. Decision.

Governance changes should not be smuggled into ordinary feature pull requests.

## Decision Principle

**Contributors own improvements and innovation; maintainers own coherence, philosophy, and trust.**
