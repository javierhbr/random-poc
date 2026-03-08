# OPAL Stages and Subqueries Reference

Layer: 3 (Resource)

## When to use stages

A stage is an individual results table in a Worksheet. Stages can be linked and chained together in sequences and branching.

Use stages when:

- one source contains different record shapes
- the flow branches into separate preprocessing paths
- each branch needs different parsing or normalization
- you want the worksheet to stay readable and debuggable

## Tutorial pattern from the docs

The tutorial models mixed-format weather data with this shape:

- Stage A — determine incoming record type
- Stage B — process one record shape
- Stage C — process the other record shape
- Stage D — combine B and C and do final formatting

This is a strong default pattern for heterogeneous inputs.

## Why stages help

Stages let you split processing into logical chunks focused on the applicable data, then recombine later.

## Parallel-branch model

```text
Stage A (classify / normalize input)
 ├─ Stage B (path for structured records)
 └─ Stage C (path for unstructured records)
      ↓
Stage D (union/join + final shaping)
```

## Equivalent subquery model

When you want one OPAL script rather than multiple worksheet stages, use named subqueries:

```opal
@subquery_B_structured_records <- @ {
  // path B logic
}

@subquery_C_unstructured_records <- @ {
  // path C logic
}

<- @subquery_B_structured_records {
  union @subquery_C_unstructured_records
}
```

## Design guidance

- Put type/format detection first.
- Keep branch-specific parsing isolated.
- Normalize both branches to a shared schema before merging.
- Use a final stage/subquery to standardize names and choose final columns.
- Prefer stages/subqueries over one giant query when two branches have materially different logic.
