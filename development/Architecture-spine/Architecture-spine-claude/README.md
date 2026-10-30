# Platform Architecture Charter — Document Set

A shared reference for everyone who builds, reviews or integrates with the chat platform (the conversational channel that sits alongside web and mobile).

## Files

| File | What it is | Read it when |
| --- | --- | --- |
| [01-charter.md](01-charter.md) | The charter itself: the four parts and what each must contain | Onboarding; writing or reviewing any spec |
| [02-why-and-how-to-use.md](02-why-and-how-to-use.md) | Why this governance exists, how to use the charter day to day, roles, change process, rollout | Onboarding; before your first spec or review |
| [03-classification-guide.md](03-classification-guide.md) | Decision questions to identify **where any item belongs**: core domain vs platform, functional vs NFR, subdomain vs bounded context, system of record vs read model, and more | Designing a feature; analysing an existing platform; any "where does this go?" argument |
| [04-inventory-template.md](04-inventory-template.md) | A table template to inventory and classify everything in an existing platform using the guide in 03 | Migrating or auditing an existing platform |

## How the files relate

```
01-charter.md ............ the rules (what must be true)
02-why-and-how-to-use.md . the process (how we apply and change the rules)
03-classification-guide .. the method (how we decide where each thing belongs)
04-inventory-template .... the worksheet (where we record those decisions)
```

## Conventions

- These files are versioned with the platform code. A spec references the charter version it was written against.
- Changes go through the RFC process in `02-why-and-how-to-use.md`.
- Terms in **bold** in the classification guide are glossary terms; the glossary lives in part 1 of the charter.
