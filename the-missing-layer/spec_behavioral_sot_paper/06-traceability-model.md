# Traceability Philosophy

## Specs as the Central Traceability Anchor

Metadata annotations such as:
- @feature
- @future
- @rule
- @adr
- @capability
- @flow

are extremely valuable for:
- governance,
- business rules,
- architectural context,
- and system evolution.

However, these annotations should primarily live at the specification layer.

At the implementation level, source code should trace only to the relevant spec.

Example:

```ts
// @spec marketplace-sync.freeze-account-behavior
```

or:

```ts
// Implements: SPEC-MKT-001
```

This creates a clean traceability chain:

```txt
Code
  ↓
Spec
  ↓
Feature / Rule / ADR / Capability
  ↓
Graph / Traceability Index
```

---

# Separation of Concerns

This avoids overloading the codebase with:
- business metadata,
- governance annotations,
- and enterprise context.

Instead:
- the code traces to the spec,
- the spec traces to rules/features/ADRs,
- and the graph connects everything together.
