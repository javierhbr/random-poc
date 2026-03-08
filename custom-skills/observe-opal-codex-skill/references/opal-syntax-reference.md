# OPAL Syntax Reference

Source: https://docs.observeinc.com/docs/opal-syntax

## Core model
- OPAL queries are pipelines of statements
- Each line consumes the rows from the previous line
- Non-trivial queries should usually be written one statement per line for readability

## Practical rules
- Prefer one transformation per line
- Add comments only where intent is not obvious
- Use `make_col` for derived columns
- Keep shaping verbs close to the end unless they are required earlier

## Example
```opal
filter severity = "ERROR"
make_col service_name:string(service)
timechart 5m, count(1), group_by(service_name)
sort desc(_c_valid_from)
```

## What to remember
- OPAL is not SQL pasted into a string
- You compose a sequence of transformations
- Readability matters because later maintainers reason step by step
