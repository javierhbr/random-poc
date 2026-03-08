# OPAL Patterns and Recipes

Layer: 3 (Resource)

## 1. Basic row filtering

```opal
filter severity = "ERROR"
pick_col timestamp, service, message
```

## 2. Negative filter

```opal
filter severity != "DEBUG"
```

## 3. Boolean filter

```opal
filter is_connected
```

## 4. Range / compound filter

```opal
filter temperature < 97 or temperature > 99
```

## 5. Inexact search

```opal
filter log ~ hello
filter * ~ hello
```

## 6. Derived display field

```opal
make_col location:concat_strings(city, ",", country)
```

## 7. Numeric transformation

```opal
make_col temperature_f:(temp * 9 / 5 + 32)
```

## 8. Explicit cast before metric or math

```opal
make_col temperature:float64(temperature)
```

## 9. JSON extraction

```opal
make_col data:string(FIELDS.data), kind:string(FIELDS["name"])
make_col requestStatus:someField.'request.status'
```

## 10. Regex extraction

```opal
extract_regex message, /(?<status>ERROR|WARN|INFO)/
```

## 11. Top services by count

```opal
statsby count() by service
sort -count
```

## 12. Sessionization

```opal
make_session user_id
```

## 13. Branch and merge by severity

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

## 14. Multi-shape normalization

```opal
@structured <- @ {
  filter format = "jsonarray"
  // parse and normalize
}

@unstructured <- @ {
  filter format = "text"
  // parse and normalize
}

<- @structured {
  union @unstructured
  pick_col timestamp, device_id, tempValue, format
}
```

## Recipe heuristics

- Search first, aggregate second.
- Normalize names before joining or unioning.
- Cast before math.
- Pick final columns last.
- Split branch-specific logic into stages/subqueries.
