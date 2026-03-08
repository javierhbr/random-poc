# OPAL Verbs Reference

Sources:
- https://docs.observeinc.com/docs/verb
- https://docs.observeinc.com/docs/how-should-i-aggregate-data
- https://docs.observeinc.com/docs/how-do-i-find-the-average-of-values-over-time
- https://docs.observeinc.com/docs/how-do-i-measure-drift-in-a-metric-over-time
- https://docs.observeinc.com/docs/how-do-i-measure-drift-in-a-resource-over-time

## Common verbs

### filter
Reduce rows based on a boolean condition.
```opal
filter severity = "ERROR"
filter in(column, "apple", "orange", "pear")
```

### make_col
Create or replace a column.
```opal
make_col latency_ms:float64(latency_seconds) * 1000
```

### timechart
Use for time-based aggregation. For an existing numeric value over time:
```opal
timechart 5m, avg(value), group_by(container)
```

### union
Combine branch outputs with compatible schema.
Often used for time-range comparisons after shifting one branch.

### timeshift
Shift a series in time for comparisons and drift analyses.

## Aggregation selection rule
Helpful hints recommend:
- `align` when you need to align metrics by time
- `aggregate` when you need to aggregate aligned series across space/series

## Practical warning
If you need the average of an already-computed aggregate such as counts, do not nest aggregate functions directly inside a single `timechart`; use multiple steps.
