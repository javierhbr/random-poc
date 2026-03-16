# Example Prompts for AI agents

## Generate a query
Write OPAL that filters HTTP 500 errors, extracts `service` as string, and returns a 5 minute timechart of count by service.

## Refactor a query
Refactor this OPAL for readability. Cast extracted fields explicitly, filter early, and use a stage if it improves clarity.

## Explain a query
Explain this OPAL step by step and point out which lines are row-reducing versus scalar transforms.

## Practical hint lookup
I need OPAL for comparing today vs yesterday traffic. Use the helpful hints patterns, then tailor the query to my fields.

## Schema-safe shaping
I need to pivot weekdays into columns for a dataset. Use only a known-schema approach that Observe datasets can support.
