# OPAL Functions Reference

Sources:
- https://docs.observeinc.com/docs/function
- https://docs.observeinc.com/docs/how-do-i-use-time-window-functions
- https://docs.observeinc.com/docs/how-do-i-test-for-multiple-values-in-a-dashboard-parameter
- https://docs.observeinc.com/docs/how-do-i-find-the-size-of-a-column
- https://docs.observeinc.com/docs/how-do-i-create-an-array-from-existing-columns
- https://docs.observeinc.com/docs/how-do-i-map-fields-to-each-other

## High-value functions to keep handy

### Conditional logic
```opal
make_col status:if(code = 200, "ok", "error")
make_col region:case(city="Alhambra", "California", city="Anaheim", "California", "Other")
```

### Arrays
```opal
make_col userArray:make_array(userName, customerName)
filter array_contains($selected_values, namespace)
```

### String length
```opal
make_col questionLength:strlen(question)
sort desc(questionLength)
```

### URL parsing
```opal
make_col parsedUrl:parse_url(url)
make_col parameters:parsedUrl.parameters
make_col key1:string(parsedUrl.parameters.key1)
```

### Regex extraction
```opal
make_col numeric_parts:get_regex_all(message, /d+/)
```

## Window functions pattern
Any aggregate can become a windowed scalar calculation by using `make_col` and wrapping the aggregate in `window(...)`.

Pattern:
```opal
make_col rolling_avg:window(avg(value), group_by(hostname))
```

Use this when you need neighboring/running context without reducing row count.
