# The Missing Layer in Spec-Driven Development

## Core Thesis

Current methodologies and frameworks around Spec-Driven Development — such as BIMA, OpenSpec, SpecKit, EARS, LID (Linked-Intent Development), and similar approaches — provide extremely valuable capabilities for documenting:
- requirements,
- functional logic,
- business rules,
- architectural decisions,
- implementation details,
- governance,
- and historical evolution of systems.

However, most specification systems naturally become historical archives of change.

Over time, they accumulate:
- implemented functionality,
- future ideas,
- pending work,
- deprecated behaviors,
- rejected proposals,
- architectural discussions,
- partial implementations,
- experimental concepts,
- and historical decisions.

This makes it increasingly difficult to answer a critical question:

> What is the system expected to do today?

The proposal is to introduce a continuously maintained:

# Current-State Behavioral Source of Truth

A repository-native operational layer describing:
- current active behavior,
- active contracts,
- supported operational flows,
- current business rules,
- ecosystem interactions,
- and expected runtime semantics.

This becomes the operational truth of the system.
