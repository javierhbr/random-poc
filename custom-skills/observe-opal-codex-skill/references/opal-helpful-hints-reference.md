# OPAL Helpful Hints Reference

Primary index source: https://docs.observeinc.com/docs/helpful-hints

This file distills the OPAL helpful hints section into reusable agent guidance.

## 1) Aggregation and time analysis

### Choose the right aggregation tool
Helpful hints say:
- use `align` to place time series onto regular time bins for comparison
- use `aggregate` to compute a single numeric value across aligned series
- use `timechart` for time-based grouped aggregations in ordinary OPAL workflows

### Weighted average
Use a ratio of weighted sum over weight sum.
```opal
statsby weighted_avg:sum(value * weight) / sum(weight), group_by(group_key)
```

### Window functions
Window functions keep row count the same while summarizing neighboring rows.
Pattern:
```opal
make_col rolling_value:window(avg(value), group_by(hostname))
```

### Average of values over time
For an existing numeric field:
```opal
timechart 5m, avg(value), group_by(container)
```
For an average of a computed aggregate, do it in multiple steps rather than nesting aggregates inside one `timechart`.

### Compare time ranges
There is no single built-in compare-yesterday verb in this hint. Instead, create a shifted branch, relabel the series, then `union`.
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
Note: the query window must include both periods.

### Cumulative count over intervals and multiple fields
Helpful hints explicitly note there is no special cumulative function for this recipe. Use a window/rank-style intermediate column and then chart it.
```opal
make_col rank:window(dense_rank(), group_by(updatedDate, metadataUpdatedDate))
timechart max(rank), group_by(updatedDate, metadataUpdatedDate)
```

### Drift in a metric over time
Use `timeshift` to compare current series to a baseline series.

### Drift in a resource over time
Use a shifted branch, aggregate each period, `union`, then `pivot` or otherwise compare the labeled periods.

## 2) Type conversion, sorting, and time values

### Change a field type
If a field has the wrong type, create a new typed column; reuse the original name only if replacement is intended.
```opal
make_col newtime:parse_isotime(timestamp)
```

### Convert durations
```opal
make_col duration:duration_sec(some_seconds)
make_col duration:duration_ms(some_milliseconds)
make_col duration:end_time-start_time
make_col hours:duration/1h
```

### Convert timestamps
```opal
make_col the_time:from_seconds(some_seconds)
make_col the_time:from_milliseconds(some_milliseconds)
make_col the_time:parse_isotime(some_string)
make_col date:format_time(the_timestamp, 'YYYY-MM-DD')
```

### Sort dates correctly
Wrong alphabetical sort usually means the field is still text. Parse/cast to timestamp first.
```opal
make_col time:parse_timestamp(time, "DD/MM/YY HH24:MI:SS.FF3")
sort desc(time)
```

### Sort digits numerically
Wrong alphabetical numeric order usually means the field is string. Cast first.
```opal
make_col userID:int64(userID)
sort desc(userID)
```

## 3) Filtering and comparison

### Filter by a list of terms
Helpful hints recommend `in(...)`.
```opal
filter in(column, "apple", "orange", "pear")
```

### Filter multi-select dashboard parameters
A multi-select parameter is an array, so use `array_contains`.
```opal
filter array_contains($selected_values, namespace)
```

### Compare values
`filter` is the main comparison tool.
```opal
filter temperature > 60 and temperature < 80
filter hostname = "www" or (hostname = "api" and user = "root")
filter not severity = "DEBUG"
```

### Filter out unwanted data
The hint page focuses on UI-based exclusion workflows for exploratory tables, such as excluding frequent status 200 rows to expose abnormal values.

## 4) Arrays, mapping, pivoting, extraction

### Create an array from columns
```opal
make_col userArray:make_array(userName, customerName)
```

### Map fields to broader categories
Use `case`.
```opal
make_col region:case(city="Alhambra", "California", city="Anaheim", "California", "Other")
```

### Pivot a dataset with known output columns
Datasets need known schema, so arbitrary dynamic pivoting is not the pattern. Simulate with conditional aggregates.
```opal
timestats
  monday:any_not_null(if(day='monday', value, null_float64())),
  tuesday:any_not_null(if(day='tuesday', value, null_float64()))
```

### Unpivot data
Collect values into an object and flatten it.
```opal
flatten_single obj
pick_col
  timestamp,
  name:_c_obj_path,
  value:float64(_c_obj_value)
```

### Extract numeric parts from text
```opal
make_col numeric_parts:get_regex_all(message, /d+/)
```

### Extract URL parameters
```opal
make_col parsedUrl:parse_url(url)
make_col parameters:parsedUrl.parameters
filter parameters != "null"
make_col key1:string(parsedUrl.parameters.key1)
```

## 5) Formatting and presentation

### Find the size of a column value
```opal
make_col questionLength:strlen(question)
sort desc(questionLength)
```

### Format large numbers for readability
The hint emphasizes UI formatting rather than query rewriting:
- prefer conditional formatting with units and precision
- single-stat panels work well for presentation-focused output

## 6) Best-practice conventions from helpful hints

### Always cast on field extraction
```opal
make_col
  id:string(FIELDS.container.id),
  labels:object(FIELDS.container.labels)
```

### Prefer `if`/`if_null` before `case`
Use `case` when branches become numerous. When using `case`, format it one condition/value pair per line for readability.

### Keep field names close to the source
Avoid over-normalizing names unless there is a real consumer-driven need.

### Pick columns on output
When defining a dataset interface, choose the final schema near the end of the pipeline.

### Use `duration` type when applicable
Avoid surfacing elapsed time as generic numbers when a real duration type is available.

## Agent rules distilled from these hints
- When a user asks a practical “how do I…” OPAL question, check this reference first.
- Prefer explicit types and readable shaping over clever compactness.
- Do not invent dynamic-schema pivots for dataset definitions.
- Use stages/subqueries when a comparison branch or intermediate aggregate makes the logic easier to verify.
