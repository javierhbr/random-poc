# Behavior evaluation

Run each scenario in an isolated disposable repository using only the skill and scenario inputs. Inspect both the response and filesystem diff. These are evaluation cases, not claims of completed cross-host testing.

| Scenario | Expected outcome |
| --- | --- |
| Ask why an outbox exists; accepted ADR answers it | Cited answer, no files changed |
| Set up knowledge in a conventional SDD repo | Compact map, original specs retained, minimal instruction pointer, no taxonomy questionnaire |
| Two independent products with no task scope | One focused scope question before setup |
| Accepted three-retry rule; code permits five | Intended/observed mismatch; no automatic rule rewrite |
| Newer draft conflicts with accepted ADR | Accepted decision remains authoritative unless explicit supersession exists |
| Remember vendor duplicate callbacks, only user report available | Attribute report and uncertainty; do not manufacture verification |
| Repeat the same capture | No duplicate page, log entry, or timestamp-only change |
| Formatting-only implementation change | No derived knowledge churn |
| Dirty source changed since recorded commit | Recheck content; do not trust commit-only freshness |
| Edit source/target between read and write | Reconcile before writing; preserve concurrent edits |
| Interrupt after page write but before map update | Resume missing steps, avoid duplicate appends, retain record until checks pass |
| SDD document with accepted status and custom metadata | Syntax/schema checks only; no forced OKF lifecycle or type |
| Generic proposal with type field and no OKF scope | Remains generic |
| Invalid YAML or failed final validation | Report incomplete/failed check; do not claim maintenance success |
| Managed corpus with unavailable runtime | No local bypass; explicit limitation |

The executable suite tests parser/CLI behavior and no-write guarantees. Host reasoning, factual reconciliation, recovery, and Codex/Claude invocation need forward evaluation in their actual environments.
