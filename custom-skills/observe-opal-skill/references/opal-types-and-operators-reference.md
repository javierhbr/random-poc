# OPAL Types and Operators Reference

Layer: 3 (Resource)

## Type system

OPAL is strongly typed. Passing an unexpected type produces an error, so explicit conversion is often required.

## Basic data types

Common basic types documented on the page include:

- `bool`
- `duration`
- `float64`
- `int64`
- `string`
- `timestamp`

Examples:

```opal
bool("true")
5m
300s
string(some_field)
float64(temperature)
```

## Advanced / composite data types

Common advanced types documented on the page include:

- `variant` (preferred replacement for deprecated `any`)
- `array`
- `ipv4`
- `object`

Examples:

```opal
ipv4("127.0.0.1")
make_object("service", service, "status", status)
```

## Null handling

Many types have a corresponding `type_null()` constructor.

```opal
make_col foo:string_null()
```

Use explicit typed nulls when a function or verb expects a specific type.

## Operators

### Arithmetic

```text
+  addition
-  subtraction
*  multiplication
/  division
() grouping / precedence
```

Note: divide-by-zero yields `null` rather than an error or NaN.

### Field/data access

```text
.   nested field access for JSON
[]  subscript for arrays or JSON
:   name a field/value in expressions like make_col
~   inexact search
!~  negated inexact search
```

## Practical examples

### Type conversion

```opal
make_col temperature:float64(temperature)
make_col is_enabled:bool(enabled)
```

### JSON access

```opal
make_col data:string(FIELDS.data), kind:string(FIELDS["name"])
make_col userName:someField["user name"]
make_col userCity:someField."user city"
make_col requestStatus:someField.'request.status'
```

### Inexact search

```opal
filter log ~ hello
filter * ~ hello
filter * !~ hello
```

## Authoring guidance

- Cast early when values come from JSON or text.
- Use bracket/quoted access for keys with spaces or punctuation.
- Be careful with typed nulls in function arguments.
