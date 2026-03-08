# Prompt Examples for the OPAL Skill

## Generate OPAL from intent

### User
Create OPAL that finds error logs for checkout, extracts request_id from JSON, and shows the last 100 rows.

### Expected skill behavior
- Filter early by service and severity
- Extract `request_id`
- Pick final columns
- Add assumptions for unknown field names

## Explain an existing query

### User
Explain what this OPAL does and point out any type-safety issues.

### Expected skill behavior
- Explain line by line
- Identify casts that should be added
- Suggest readability improvements

## Design a staged flow

### User
I have two record formats in one datastream. One is JSON and one is plain text. Help me shape them into one output.

### Expected skill behavior
- Propose Stage A/B/C/D or equivalent subqueries
- Normalize both branches into shared column names
- Merge with `union` or enrich with `join`

## Convert a pseudo-query into OPAL

### User
Group by service and count unique users per 5-minute window.

### Expected skill behavior
- Choose the right aggregation verb
- Use the right aggregate function
- Ask for or assume field names explicitly if missing
