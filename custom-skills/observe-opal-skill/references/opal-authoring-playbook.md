# OPAL Authoring Playbook

Layer: 2 (Skill logic)

## Mission

Help the agent produce correct, readable, and practical OPAL for Observe.

## Working model

Treat OPAL as a pipeline of row-set transformations.

- Use **functions** when computing a value for one or more columns.
- Use **verbs** when transforming, filtering, grouping, joining, or shaping a dataset.
- Use **stages** or **subqueries** when the query branches, needs separate preprocessing per input, or becomes too dense to reason about safely.

## Authoring rules

### 1. Start from intent
Translate the request into one of these intents first:

- search/filter rows
- derive or normalize fields
- extract from JSON or text
- aggregate/group/time-bucket
- join/lookup/union datasets
- stage a multi-branch shaping flow
- explain or debug existing OPAL

### 2. Prefer simple pipelines first
Use a linear pipeline when possible.

Typical shape:

```opal
filter ...
make_col ...
filter ...
pick_col ...
```

### 3. Filter early
Push selective `filter` operations as early as possible to reduce later work.

### 4. Cast explicitly
OPAL is strongly typed. If a field may be string/variant/JSON-derived, cast it before math, comparisons, or metric registration.

### 5. Use `make_col` for derived fields
Prefer small, named derived fields over giant inline expressions.

### 6. Keep the final output intentional
Use `pick_col` near the end to limit output to the fields the user actually needs.

### 7. Use stages/subqueries for branching
If two sources or two preprocessing paths exist, split them and combine later with `union` or `join`.

### 8. Be explicit about assumptions
If the schema is unknown, say what field names are placeholders.

## Preferred response format

### A. Query
Return the OPAL first.

### B. Explanation
Explain each block in plain English.

### C. Assumptions
List placeholders, field names, type assumptions, or dataset assumptions.

### D. Improvements
Optionally suggest stronger filters, better names, or stage decomposition.

## Guardrails

- Never claim a function or verb exists unless it is in the references.
- Do not silently switch to SQL syntax.
- Do not omit casts when the docs suggest strong typing matters.
- Do not overuse stages for trivial one-path transformations.
- Do not merge unrelated concerns into one giant query if stages/subqueries make it clearer.

## Common transforms

### Search errors
```opal
filter severity = "ERROR"
pick_col timestamp, service, message
```

### Derived numeric field
```opal
make_col temperature_f:(temp * 9 / 5 + 32)
```

### JSON extraction
```opal
make_col userName:string(FIELDS.user.name), requestId:string(FIELDS["request.id"])
```

### Basic aggregation
```opal
statsby count() by service
sort -count
```

### Branch and merge with subqueries
```opal
@errors <- @ {
  filter severity = "ERROR"
}

@warnings <- @ {
  filter severity = "WARN"
}

<- @errors {
  union @warnings
}
```
