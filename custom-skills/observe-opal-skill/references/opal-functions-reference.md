# OPAL Functions Reference

Layer: 3 (Resource)

## What functions do

Functions compute values for individual columns.

The OPAL Functions reference groups functions by category. Aggregate functions are used with aggregating verbs like `timechart`, `aggregate`, `statsby`, and `align`.

## High-value function families for authoring

### Conversion / typing

Use explicit casts and constructors when types are uncertain.

Examples:

```opal
string(FIELDS.name)
float64(temperature)
bool("true")
ipv4("127.0.0.1")
```

### String / text

Commonly useful examples from docs and patterns:

```opal
concat_strings(city, ",", country)
contains(description, "cloud")
replace_regex(string(FIELDS.device.state), /ошибка/, "error", 0)
count_regex_matches(message, /error/i)
```

### Arrays / objects / JSON

```opal
array_length(items)
parsejson(string(fields.deviceStatus)).timestamp
make_object("service", service, "status", status)
```

### Conditionals / null handling

```opal
coalesce(user_id, session_id)
case(
  severity = "ERROR", "bad",
  severity = "WARN", "warning",
  "ok"
)
```

### Aggregate functions

Examples explicitly called out by the docs include:

- `any`
- `any_not_null`
- `array_agg`
- `array_agg_distinct`
- `array_union_agg`
- `avg`
- `count`
- `count_distinct`
- `count_distinct_exact`
- `max`
- `min`
- `sum`

Typical use:

```opal
statsby count() by service
statsby avg(duration_ms) by endpoint
```

## Practical patterns

### Build a display field

```opal
make_col location:concat_strings(city, ",", country)
```

### Change field type

```opal
make_col temperature:float64(temperature)
```

### Extract from JSON

```opal
make_col userName:string(FIELDS.user.name), requestId:string(FIELDS["request.id"])
```

### Extract with regex

```opal
extract_regex message, /(?<status>ERROR|WARN|INFO)/
```

## Function-selection guidance

- Need one value per row/column expression → function.
- Need one summarized value across grouped rows → aggregate function with an aggregating verb.
- Need type safety → cast explicitly before other operations.
