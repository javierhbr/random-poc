# OPAL Authoring Playbook

## Purpose
Use this playbook to generate, review, and refactor Observe OPAL safely.

## OPAL mental model
OPAL is a pipeline language. Each step transforms the rows produced by the previous step. OPAL syntax docs describe queries as a sequence of statements where each line builds on prior output. Source: https://docs.observeinc.com/docs/opal-syntax

Think in this order:
1. Start from the dataset or current input
2. Reduce rows early with `filter` when possible
3. Create derived fields with `make_col`
4. Aggregate with the right verb for the job
5. Shape output near the end with `pick_col`, `rename_col`, and similar verbs
6. Split logic into stages/subqueries when a branch or intermediate result makes reasoning clearer

## Generation workflow

### 1) Clarify intent
Determine whether the user wants one of these:
- row filtering
- field extraction or type conversion
- aggregation over rows
- time-based analysis
- joining/lookup behavior
- shaping data into a dataset-friendly schema
- dashboard or monitor recipe

### 2) Infer the minimum schema needed
Before writing OPAL, identify:
- timestamp column
- grouping columns
- measure/value column
- string/object/array fields used in logic

If schema is incomplete, state the assumption inline before the query.

### 3) Pick the right operation family
- scalar transformation → function inside `make_col`
- row reduction → `filter`
- grouped aggregation → `statsby`, `timechart`, `timestats`, or metric-specific verbs
- windowed running logic → `window(...)` inside `make_col`
- multi-branch shaping → stage/subquery plus `union`, `join`, or later recombination

## Authoring rules

### Rule: filter early
Apply narrow filters before expensive reshaping, joining, or aggregating when it does not change semantics.

### Rule: cast explicitly on extraction
Helpful hints recommend explicit casting during field extraction so readers can tell intended types immediately.

Bad:
```opal
make_col
  id:FIELDS.container.id,
  labels:FIELDS.container.labels
```

Better:
```opal
make_col
  id:string(FIELDS.container.id),
  labels:object(FIELDS.container.labels)
```

### Rule: prefer type-aware time and duration handling
Use `timestamp` and `duration` types instead of generic numbers when the data really represents time. This improves later operations and UI rendering.

### Rule: preserve source naming unless needed
Helpful hints recommend keeping names close to the source to avoid inventing a private naming convention that later collides with other datasets.

### Rule: choose the right aggregation tool
Helpful hints distinguish between:
- alignment over time with `align`
- spatial/series aggregation with `aggregate`
- grouped summaries with verbs like `statsby`, `timestats`, or `timechart`

### Rule: use stages/subqueries when logic branches
Use stages when you need to:
- create a shifted comparison path
- compute an intermediate aggregate before another time aggregation
- separate extraction from normalization from final shaping

## Common decision rules

### Need an average over time?
- For an existing numeric field, use `timechart` with `avg(...)`
- For an average of a computed aggregate such as record counts, use two `timechart` steps

### Need a running or neighboring calculation?
Use `make_col` with `window(...)`; window functions summarize nearby rows without reducing row count.

### Need time comparisons like yesterday vs today?
Use a second stage/subquery, shift time, label the series, then `union`.

### Need to map values to buckets or categories?
Use `if`/`if_null` for short logic; use `case` when there are many branches.

### Need arrays from columns?
Use `make_array(...)`.

### Need pivot/unpivot behavior?
- Known-schema pivot: simulate with aggregations such as `any_not_null(if(...))`
- Unpivot: build an object and `flatten_single`, or use `unpivot_array()` where appropriate

## Review checklist
- Is every referenced column defined or assumed?
- Are field types explicit where ambiguous?
- Is the earliest possible `filter` applied?
- Is the aggregation verb consistent with the analytical goal?
- Is a stage/subquery warranted for clarity?
- Are output columns shaped at the end?
- Does the query avoid dynamic-schema behavior that a dataset cannot support?

## Response style for agents
When returning OPAL:
1. Start with one sentence stating assumptions if any
2. Provide the OPAL
3. Add a short explanation of why these verbs/functions were chosen
4. Mention alternate implementation only when it changes behavior or performance
