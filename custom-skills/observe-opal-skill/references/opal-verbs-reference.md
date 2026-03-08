# OPAL Verbs Reference

Layer: 3 (Resource)

## What verbs do

Verbs process sets of rows.

The OPAL Verbs reference groups verbs by category.

## Important verb categories

### Filtering / shaping

Common verbs to reach for first:

- `filter`
- `make_col`
- `pick_col`
- `sort`
- `extract_regex`

Examples:

```opal
filter severity != "DEBUG"
make_col temperature_f:(temp * 9 / 5 + 32)
pick_col timestamp, service, message
sort -count
```

### Aggregation

The docs group aggregate verbs such as:

- `aggregate`
- `align`
- `bucketize` (alias of `timechart`)
- `dedup`
- `distinct`
- `fill`
- `histogram`
- `make_reference`
- `make_session`
- `statsby`
- `timechart`

Examples:

```opal
statsby count() by service
sort -count
```

```opal
timechart avg(latency_ms) by service
```

### Combining datasets

Use these when logic branches or multiple inputs are involved:

- `join`
- `lookup`
- `union`

Examples:

```opal
join country=@NACountries.country
```

```opal
union @warnings
```

## Authoring guidance

- Start with `filter` when possible.
- Use `make_col` to create explicit derived fields before aggregation.
- Use `pick_col` near the end to control output shape.
- Use `union` when merging compatible row sets from branched shaping.
- Use `join` or `lookup` when enriching one dataset with another.
- Use aggregate verbs only after the row-level fields are clean and correctly typed.
