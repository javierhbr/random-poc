# OPAL Syntax Reference

Layer: 3 (Resource)

## Core mental model

OPAL is a line-oriented pipeline language:

- each line is a step
- each step builds on previous ones
- you combine verbs and functions to shape data

## Basic examples

```opal
// New column from two existing columns
make_col location:concat_strings(city, ",", country)

// Use the derived field in a later step
make_col location:concat_strings(city, ",", country)
filter location = "Boston, US"

// Numeric literal examples
make_col octal:int64(0123)
make_col decimal:int64(123)
make_col hex:int64(0x123)
```

## Comments

Single-line comments:

```opal
// only need deviceId and label
make_col deviceId:string(FIELDS.deviceInfo.deviceId), label:string(FIELDS.deviceInfo.label)
```

Multi-line comments:

```opal
/*
 * TODO: better handle null deviceID values
 */
```

## Subqueries

Use subqueries when a standard linear pipeline is not enough.

Why:

- each input can be shaped independently
- you can branch and merge logic
- complex shaping may avoid intermediate datasets

### Single subquery

```opal
@test_a <- @ {
  filter city = "Chicago"
}

<- @test_a {}
```

### Chained subqueries

```opal
@test_a <- @ {
  filter city = "Chicago"
}

@test_b <- @test_a {
  filter contains(description, "cloud")
}

<- @test_b {}
```

### Parallel subqueries + union

```opal
@test_a <- @Weather {
  filter city = "Chicago"
}

@test_b <- @Weather {
  filter city = "Portland"
}

<- @test_a {
  union @test_b
  filter contains(description, "cloud")
}
```

### Another dataset as input

```opal
@test_a <- @Observation {
  filter (not if_null(EXTRA.poller_type)) and (string(EXTRA.poller_type) = "weather")
  make_col city:string(FIELDS.name)
  filter city = "Chicago"
}
```

## Authoring guidance

- Prefer a linear pipeline until branching is truly needed.
- Define subqueries before referencing them.
- Use comments for non-obvious shaping logic.
- Keep names descriptive: `@errors`, `@north_america`, `@structured_records`.
