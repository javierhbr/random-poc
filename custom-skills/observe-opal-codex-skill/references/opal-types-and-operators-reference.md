# OPAL Types and Operators Reference

Sources:
- https://docs.observeinc.com/docs/opal-data-types-and-operators
- https://docs.observeinc.com/docs/how-do-i-change-a-field-type
- https://docs.observeinc.com/docs/opal-timestamp-conversion
- https://docs.observeinc.com/docs/time-duration-conversion

## Important types
- string
- bool
- int64
- float64
- object
- array
- timestamp
- duration

## Casting guidance
Use explicit casts when extracting or normalizing fields.

Examples:
```opal
make_col user_id:int64(userID)
make_col event_time:parse_isotime(timestamp_string)
make_col duration:end_time-start_time
```

## Timestamp conversions
```opal
make_col ts1:from_seconds(epoch_seconds)
make_col ts2:from_milliseconds(epoch_ms)
make_col ts3:parse_isotime(iso_time_string)
make_col date_label:format_time(ts3, 'YYYY-MM-DD')
```

## Duration conversions
```opal
make_col d1:duration_sec(seconds_value)
make_col d2:duration_ms(milliseconds_value)
make_col d3:end_time-start_time
make_col hours:d3/1h
make_col nanos:int64(d3)
```

## Sorting fixes caused by wrong types
Dates sorting alphabetically instead of chronologically:
```opal
make_col time:parse_timestamp(time, "DD/MM/YY HH24:MI:SS.FF3")
sort desc(time)
```

Numbers sorting alphabetically instead of numerically:
```opal
make_col userID:int64(userID)
sort desc(userID)
```

## Comparison examples
```opal
filter temperature > 60 and temperature < 80
filter hostname = "www" or (hostname = "api" and user = "root")
filter not severity = "DEBUG"
```
