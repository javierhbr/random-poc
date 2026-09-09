---
name: spec-blind-spot
description: Analyze a specification produced under Spec-Driven Development and identify material requirements, assumptions, contracts, behaviors, boundaries, dependencies, scenarios, and decisions that remain missing or ambiguous before planning or implementation.
---

# SDD Spec Blind Spot

## Purpose

Find what a specification fails to state before humans or agents use it as the source of truth for planning and implementation.

The central question is:

> If a competent implementation team followed this spec literally, what important behavior, decision, contract, or constraint would they still have to invent?

Anything material they must invent is a potential blind spot.

## SDD Principle

```text
SPEC → PLAN → IMPLEMENTATION → VALIDATION
```

Important implementation decisions should derive from the specification rather than be silently invented downstream.

Therefore:

> Important decisions that must be guessed indicate specification debt.

## Core Flow

1. Understand the spec type, objective, bounded context, actors, inputs, outputs, dependencies, constraints, assumptions, and explicit scope.
2. Find decision gaps: what an implementer still has to invent.
3. Inspect behaviors, contracts, boundaries, producer/consumer semantics, failure behavior, and acceptance criteria.
4. Run the SDD premortem.
5. For important specs, use an isolated **Independent Implementer** and an isolated adversarial reviewer.
6. Apply materiality and the Blind Spot Budget.
7. Force a disposition and recommend the smallest spec changes needed before planning.

## Primary Tests

Ask:

> Could two competent teams implement this spec differently while both believing they complied?

> What implementation decision is still left open?

> What would pass the written acceptance criteria while still failing the intended outcome?

> What must an implementation know that the spec does not say?

## SDD Premortem

> Imagine the implementation was generated exactly from this specification and passed the explicitly stated acceptance criteria, but the feature still failed in production or failed the intended product outcome. What did the specification fail to say?

## Finding Categories

Use one of:

- MISSING REQUIREMENT
- MISSING ASSUMPTION
- AMBIGUOUS BEHAVIOR
- MISSING CONTRACT
- MISSING FAILURE BEHAVIOR
- MISSING BOUNDARY
- MISSING DEPENDENCY
- MISSING ACTOR
- MISSING INPUT/OUTPUT SEMANTICS
- MISSING ACCEPTANCE CRITERIA
- MISSING NON-FUNCTIONAL CONSTRAINT
- OUT-OF-SCOPE CANDIDATE

## Dispositions

Every material finding ends with:

- **RESOLVE**
- **ASSUME**
- **OUT OF SCOPE**
- **ACCEPT RISK**

Prefer updating the specification rather than moving material decisions directly into implementation.

## Output

Return:

1. **Spec Understanding**
2. **Top Blind Spots**
3. **Hidden Assumptions**
4. **Implementation Invention Test**
5. **Contract Risks**
6. **SDD Premortem**
7. **Independent Adversarial Finding** when orchestrated
8. **Explicit Scope Candidates**
9. **Decisions Required Before Planning**
10. **Verdict**:
   - READY
   - READY WITH ASSUMPTIONS
   - NEEDS CLARIFICATION
   - NOT READY

## Runtime References

Load only what is needed:

- `references/spec-analysis.md` — detailed SDD completeness, behavior, contract, boundary, producer/consumer, traceability, and acceptance tests.
- `references/orchestration.md` — Independent Implementer, adversarial isolation, context contracts, and synthesis.
- `references/materiality-and-output.md` — finding classification, prioritization, dispositions, readiness verdicts, and output format.

For specs that directly drive implementation or autonomous agents, prefer loading orchestration.

## Final Rule

The most dangerous specification blind spot is:

> Something important that two competent implementers could reasonably interpret differently.

Find those first.
