# Platform Inventory and Classification Worksheet

**Version:** 0.1 · **Purpose:** record every item found in the platform, the verdict from `03-classification-guide.md`, and the evidence behind it.

Copy this file per analysis run (for example `inventory-2026-Q4.md`). Fill one row per item. Keep the evidence column; it is what settles later disagreements.

---

## How to fill it

1. Walk the codebase, the databases, the API gateway, the event broker and the scheduler. Every service, table, endpoint, topic, job and rule you find is a row.
2. Set **Kind** from guide §0.
3. Answer the questions of the matching guide section and write the question numbers and answers in **Evidence** (for example `1.1=no, 1.2=yes → business domain`).
4. Fill **Lives today** with the current component and **Belongs** with the verdict. A difference is a backlog item.
5. Set **Action** and **Priority**. Priorities: P1 = duplicated truth or business rule in the platform; P2 = missing ACL, sync write across contexts, unowned contract; P3 = everything else.

---

## Legend

| Column | Allowed values |
| --- | --- |
| Kind | rule · nfr · data · component · subdomain · context · interaction · decision · principle |
| Belongs | business-domain:`<name>` · platform:`<context>` · glue:`<context>` · shared:`<service>` · part-3 · slo:`<component>` · adr · convention |
| Data verdict | sor-platform · sor-external · read-model · derived · transient · n/a |
| Action | keep · move · split · wrap-acl · delete · needs-rfc · needs-adr |
| Priority | P1 · P2 · P3 |

---

## 1. Rules and behaviours

| # | Item (one sentence) | Kind | Lives today | Belongs | Evidence (question = answer) | Action | Priority | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | | rule | | | | | | | |
| R-002 | | rule | | | | | | | |

## 2. Non-functional requirements

| # | Item | Scope (all / component) | Lives today | Belongs | Evidence | Measured how | Action | Priority | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N-001 | | | | | | | | | |

## 3. Data and entities

| # | Entity / field | Stored in (today) | Written by (today) | Data verdict | System of record | Refresh rule (if read model) | PII class | Evidence | Action | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-001 | | | | | | | | | | |

## 4. Components

| # | Component | Type (service / ui / library / job / adapter) | Owns data? (ids from §3) | Context today | Context it belongs to | Independently deployable? | Evidence | Action | Priority | Owning team |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-001 | | | | | | | | | | |

## 5. Subdomains and bounded contexts

| # | Name | Subdomain or context | Type (core / supporting / generic) | Passes §6.2 tests? (list failures) | Owning team | Glossary terms owned | Evidence | Action | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B-001 | | | | | | | | | |

## 6. Interactions and contracts

| # | From (upstream) | To (downstream) | Contract (api / event / db / file) | Relationship (published language / customer-supplier / conformist / acl / shared kernel) | Sync or event | Timeout + retry declared? | Degradation rule? | Evidence | Action | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| I-001 | | | | | | | | | | |

## 7. Decisions found (implicit or explicit)

| # | Decision as currently implemented | Where observed | Alternatives apparently rejected | Has ADR? | Should be (adr / charter rule / convention) | Action | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-001 | | | | | | | |

## 8. Principles, constraints and guidelines found

| # | Statement | Source (doc / code / tribal) | Classification (constraint / principle / guideline / degradation rule) | Enforced by fitness function? | Action | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| P-001 | | | | | | |

---

## 9. Conflicts register

List every conflict detected while filling the tables above. Each becomes an RFC or an ADR.

| # | Conflict type (two SoRs / rule in two places / cross-context write / business rule in platform / missing ACL / unowned contract) | Items involved | Proposed resolution | RFC / ADR | Status |
| --- | --- | --- | --- | --- | --- |
| X-001 | | | | | |

---

## 10. Outputs this worksheet feeds

| Charter section | Derived from |
| --- | --- |
| 1.1 Glossary | Terms column in §5 |
| 1.2 Subdomains | §5 rows marked subdomain |
| 1.3 Bounded contexts | §5 rows marked context + §4 components |
| 1.4 Context map | §6 |
| 2.1 Contract catalog | §6 contracts |
| 2.3 System of record table | §3 |
| 3.5 SLOs | §2 |
| 4.1 ADRs | §7 and §9 |
| 4.5 Ownership | §4 owning team |
