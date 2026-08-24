# Example — Dependency Analyzer Capability Contract

## Identity
- Name: dependency-analyzer
- Type: Skill
- Maturity: Experimental
- Risk Level: 1

## Purpose
Identify dependencies between planned changes and existing platform components.

## Inputs
- Requirements/PRD.
- Available architecture/specification context.
- Relevant source metadata or source code when needed.

## Outputs
- Identified dependencies.
- Evidence supporting each dependency.
- Unknown or unresolved dependencies.
- Risk notes.

## Allowed Behavior
- Read specifications and architecture.
- Read relevant source context.
- Derive dependencies supported by evidence.

## Forbidden Behavior
- Modify source files.
- Modify requirements.
- Create tickets.
- Invent services or integrations.
- Present assumptions as observed facts.

## Success Conditions
- Important dependencies have evidence.
- Unknown dependencies are explicitly identified.
- Assumptions are labeled.
- Result remains within dependency-analysis scope.

## Validators
- Capability Reviewer.
- Evidence/Hallucination Reviewer.
- Principle Reviewer.
