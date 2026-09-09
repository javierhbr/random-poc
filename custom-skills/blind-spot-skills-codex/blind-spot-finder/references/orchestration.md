# Orchestration and Subagent Isolation

Load this reference for important, ambiguous, high-impact, or adversarially sensitive artifacts.

## Goal

Use multiple independent passes to increase viewpoint diversity and reduce anchoring, confirmation bias, and context contamination.

The orchestrator owns final judgment. Subagents primarily discover evidence and candidate blind spots.

## Core Architecture

```text
Original Artifact
      |
      v
Blind Spot Orchestrator
      |
      +-------------------+-------------------+
      |                   |                   |
      v                   v                   v
Context /             Premortem /         Independent
Assumption Scout      Stress Agent         Adversary
      |                   |                   |
      +-------------------+-------------------+
                          |
                          v
                    Candidate Pool
                          |
                          v
                     Synthesizer
                          |
                          v
              Materiality + Budget + Decision
```

## Independence Rule

For independent passes, provide the original artifact plus only the minimum context required to perform the role.

Do **not** expose prior candidate findings, preferred interpretations, severity rankings, or proposed solutions to isolated reviewers.

Otherwise the system becomes:

`initial hypothesis → repeated confirmation`

instead of:

`independent discovery → convergence → prioritization`

## Context Levels

### NORMAL

The agent may receive relevant analysis context. Suitable for extraction and synthesis.

### FRESH

The agent receives the original artifact, objective, constraints, and explicit scope, but no previous findings. Use for premortem and alternative framing.

### STRICT ISOLATION

The agent receives only what is necessary to perform its role. Use for the adversarial pass whenever practical.

## Recommended Roles

### 1. Context / Assumption Scout

Purpose: understand before criticizing.

Output only:

- objective
- current frame
- explicit assumptions
- implicit assumptions
- unknowns
- dependencies
- actors
- constraints
- scope

This role may use NORMAL context.

### 2. Blind Spot Explorer

Purpose: generate candidate missing considerations across relevant lenses.

It may explore broadly, but its output is candidate evidence rather than final prioritization.

### 3. Premortem / Stress Agent

Use FRESH context.

Purpose:

- run the artifact-aware premortem
- run the success stress test
- identify material conditions the artifact does not cover

It should not see the Blind Spot Explorer's findings.

### 4. Independent Adversary

Use STRICT ISOLATION.

Prompt pattern:

> Assume the author is competent and the artifact is generally strong.
>
> Find the strongest important consideration that could nevertheless invalidate, materially alter, or weaken the intended outcome.
>
> Do not manufacture criticism.
>
> Identify what evidence, assumption, constraint, or change would neutralize the objection.

The adversary should receive:

- original artifact
- stated objective
- essential constraints
- explicit scope

It should not receive:

- other agents' blind spots
- orchestrator hypotheses
- previous conclusions
- severity rankings
- proposed fixes

### 5. Synthesizer

The Synthesizer receives normalized findings from the independent passes.

Responsibilities:

- deduplicate
- identify shared root causes
- apply materiality
- enforce the Blind Spot Budget
- determine severity
- assign disposition
- produce final output

The Synthesizer should not generate a large new set of blind spots. Its primary responsibility is judgment and compression.

## Finding Contract

Subagents should return concise structured findings rather than long narratives or hidden reasoning traces.

Recommended contract:

```yaml
finding: concise name
evidence: what is missing, ambiguous, or unsupported
why_material: what could change
uncertainty: low | medium | high
suggested_disposition: resolve | assume | out_of_scope | accept_risk
```

This minimizes context pollution.

## Model Allocation

Model diversity is optional. Context diversity is more important.

Priority:

1. context independence
2. role/prompt diversity
3. model diversity

Suggested allocation when multiple capability levels exist:

- Context Scout: fast/economical capable model
- Candidate Exploration: strong general reasoning model
- Premortem: strong reasoning model in fresh context
- Adversary: strongest economically appropriate reasoning model in strict isolation
- Synthesizer: strong reasoning model

If only one model exists, reuse it in separate fresh contexts.

## When Not to Orchestrate

Do not create subagent overhead for trivial or low-impact artifacts when the core skill can answer reliably.

Use orchestration when one or more are true:

- the decision is expensive or difficult to reverse
- the artifact is large or ambiguous
- the work will guide implementation
- the artifact will be published or presented to knowledgeable reviewers
- the author wants adversarial confidence
- multiple stakeholder perspectives materially matter
- the cost of a hidden assumption is high
