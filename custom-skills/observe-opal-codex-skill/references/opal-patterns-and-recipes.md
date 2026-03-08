# OPAL Patterns and Recipes

Sources:
- https://docs.observeinc.com/docs/opal-examples
- https://docs.observeinc.com/docs/helpful-hints
- individual helpful hints pages under the OPAL helpful hints section

## Weighted average
```opal
statsby weighted_avg:sum(value * weight) / sum(weight), group_by(group_key)
```
Use when you have a value and a weighting field.

## Existing numeric value average over time
```opal
timechart 5m, avg(value), group_by(container)
```

## Compare today vs yesterday
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

## Multi-select dashboard parameter filter
```opal
filter array_contains($selected_values, namespace)
```

## Build an array from columns
```opal
make_col userArray:make_array(userName, customerName)
```

## Pivot with known schema
```opal
timestats
  monday:any_not_null(if(day='monday', value, null_float64())),
  tuesday:any_not_null(if(day='tuesday', value, null_float64()))
```

## Unpivot values into name/value rows
```opal
flatten_single obj
pick_col
  timestamp,
  name:_c_obj_path,
  value:float64(_c_obj_value)
```

## Parse URL parameters
```opal
make_col parsedUrl:parse_url(url)
make_col parameters:parsedUrl.parameters
filter parameters != "null"
make_col key1:string(parsedUrl.parameters.key1)
```

## Extract numeric parts from a message
```opal
make_col numeric_parts:get_regex_all(message, /d+/)
```
