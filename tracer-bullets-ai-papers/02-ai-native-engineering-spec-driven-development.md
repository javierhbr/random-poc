# From Tracer Bullets to AI-Native Engineering

## Executive Summary
AI changes software engineering because code becomes easier to generate while intent becomes more valuable.

## New Source of Truth
Behavior and specifications become the durable artifacts.

Intent -> Specification -> AI -> Code

## Spec-Driven Development
Specifications define:
- Intent
- Rules
- Constraints
- Acceptance criteria

AI generates:
- Code
- Tests
- Documentation
- Monitoring

## EARS
Easy Approach to Requirements Syntax (EARS)

Example:
WHEN customer opens account
THE SYSTEM SHALL display balance

Benefits:
- Less ambiguity
- Better AI understanding
- Better test generation

## Intent Tags
Examples:
@feature(card-balance)
@rule(exclude-pending-transactions)
@constraint(response-under-2s)
@decision(adr-014)

## Tracer Bullets in AI Development
Validate architecture first.
Generate scale later.

## Agentic Development
Human defines intent
-> AI generates specification
-> Human approves
-> AI generates implementation
-> Tests generated
-> Deployment automated

## Team Mindset Shift
Move from:
'How do we build this?'

To:
'How do we describe this behavior clearly enough that humans and AI reach the same understanding?'
