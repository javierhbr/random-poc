# OPAL Stages and Subqueries Reference

Sources:
- https://docs.observeinc.com/docs/shape-your-data-using-stages
- https://docs.observeinc.com/docs/how-do-i-compare-time-ranges
- https://docs.observeinc.com/docs/how-do-i-find-the-average-of-values-over-time

## When to use stages/subqueries
Use stages or subqueries when:
- logic branches into multiple paths
- you need an intermediate aggregate before another transform
- you are comparing shifted time ranges
- the shaping pipeline becomes hard to read as one block

## Time-range comparison pattern
Helpful hints show comparing time ranges by creating a shifted branch, relabeling it, and `union`-ing it back.

```opal
make_col series:"today"
@shifted <- @ {
  make_col new_vf:timestamp + 1d
  set_valid_from options(max_time_diff:25h), new_vf
  rename_col timestamp:new_vf
  make_col series:"yesterday"
}
union @shifted
timechart 1h, count(1), group_by(series)
```

## Two-stage average-of-counts pattern
When `timechart` cannot nest aggregate functions, compute one level first, then aggregate again in a later stage.

## Style guidance
- Give intermediate stages meaningful names
- Keep one concern per stage
- Recombine only when schemas line up clearly
