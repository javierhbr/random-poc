# SDD Blind Spot Orchestration

Use this reference when a specification will directly drive planning, implementation, code generation, or autonomous agents.

## Goal

Separate specification understanding from implementation simulation and adversarial review so each pass can independently discover missing decisions.

## Recommended Architecture

```text
Specification
     |
     v
Spec Blind Spot Orchestrator
     |
     +------------------+-------------------+
     |                  |                   |
     v                  v                   v
Spec Structure      Independent          Independent
/ Contract Pass     Implementer          Adversary
     |                  |                   |
     +------------------+-------------------+
                        |
                        v
                  Candidate Pool
                        |
                        v
                    Synthesizer
                        |
                        v
                Blind Spot Budget
```

## 1. Spec Structure / Contract Pass

Purpose:

- understand objective and bounded context
- identify actors
- map inputs and outputs
- map producers and consumers
- extract explicit assumptions
- inspect contract and acceptance completeness

This pass may use normal context.

## 2. Independent Implementer

This is the highest-value SDD-specific subagent.

Use **fresh context**.

Provide:

- original specification
- relevant parent/platform constraints if genuinely required
- no prior blind-spot findings

Prompt pattern:

> You are responsible for implementing this specification literally.
>
> Do not improve or redesign it.
>
> Whenever the specification forces you to make an unstated material decision, record that decision.
>
> Report only decisions whose ambiguity could produce materially different implementations, contracts, behavior, or outcomes.
>
> Do not design the solution.

Expected output:

```yaml
decision_gap: concise description
where_encountered: section or behavior
divergence_risk: how implementations could differ
why_material: consequence
```

This test finds specification debt by mentally moving from SPEC toward IMPLEMENTATION without allowing the agent to silently invent missing behavior.

## 3. Independent Adversarial Spec Reviewer

Use **strict isolation** whenever practical.

Give only:

- original specification
- stated objective
- essential constraints
- explicit scope

Do not expose previous findings.

Prompt pattern:

> Assume this specification appears complete and was written by a competent author.
>
> Find the strongest reason an implementation conforming to it could still produce the wrong behavior, violate an unstated contract, create operational problems, or fail the intended outcome.
>
> Do not manufacture criticism.
>
> State what evidence, assumption, constraint, or spec change would neutralize the objection.

## 4. Optional Producer / Consumer Reviewer

Use for integration-heavy or asynchronous specs.

Fresh context is preferred.

Focus only on:

- producer guarantees
- consumer expectations
- timing
- ordering
- duplicate behavior
- retry
- compatibility
- schema evolution
- ownership

Do not use this role for simple specs where integration semantics are irrelevant.

## 5. Synthesizer

The Synthesizer receives normalized findings from all passes.

It must:

- deduplicate
- map symptoms to root causes
- distinguish missing requirements from legitimate scope
- apply materiality
- enforce the Blind Spot Budget
- recommend spec changes
- determine readiness

The Synthesizer should not invent large numbers of new findings.

## Isolation Rules

Context independence matters more than model diversity.

Priority:

1. independent context
2. different cognitive role
3. different model, if available

Do not tell the Independent Implementer what the reviewer already suspects.

Do not tell the adversary that another agent thinks governance, retries, ownership, or compatibility is missing.

Let convergence emerge naturally.

## When to Use Stronger Models

Use the strongest reasoning model economically appropriate for:

- Independent Implementer on complex technical specs
- Adversarial spec review
- Final synthesis of high-impact specs

Extraction and structural mapping can usually use a faster capable model.
