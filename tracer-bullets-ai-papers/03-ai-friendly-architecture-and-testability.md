# AI-Friendly Architecture and Testability

## Thesis
Good architecture in the AI era must optimize for:
- Testability
- Explainability
- Context efficiency
- Maintainability

## Deep Modules vs Shallow Modules
Source: A Philosophy of Software Design (John Ousterhout)

Shallow Modules:
Many interfaces.
Complex orchestration.

Deep Modules:
Small interface.
Large amount of hidden complexity.

Example:

customerContext.load(customerId)

instead of multiple calls for profile, settings, permissions, and preferences.

## AI-Friendly Hexagonal Architecture

Good:
Use Case -> Port -> Adapter

Bad:
Use Case -> Service -> Factory -> Strategy -> Repository -> Provider -> Adapter

## Behavior-Oriented Interfaces

Prefer:

CardManagementPort.lockCard(cardId)

Instead of exposing many implementation-level operations.

## AI Testability Principle

When a use case requires mocking more than 3-5 dependencies, the design should be questioned.

Benefits:
- Simpler tests
- Better AI-generated tests
- Lower maintenance cost
- Lower cognitive load

## Architecture as Context Compression

Good architecture compresses context.

Deep modules reduce:
- Human cognitive load
- AI context requirements
- Test complexity

## Final Principle

Architectural success should be measured not only by decoupling and flexibility but also by explainability, testability, and context efficiency.
