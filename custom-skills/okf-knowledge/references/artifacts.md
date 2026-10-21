# Artifacts, evidence, and storage

## Authority and SDD

Explicit project authority mappings win. Preserve scope, approval state, and supersession.

| Artifact | Read it for | Knowledge skill boundary |
| --- | --- | --- |
| PRD | Outcomes, users, constraints, product intent | Do not silently change priorities or acceptance criteria |
| Platform Spec | Platform boundaries and shared contracts | Do not infer approval from filename or recency |
| Component Spec | Component responsibilities and behavior | Keep intended behavior separate from code observations |
| ADR | Decision, rationale, tradeoffs, reversal conditions | Do not accept, supersede, or reverse it through summary edits |
| Business rule | Domain invariants and exceptions | Surface conflicts; do not normalize them away |
| Code and tests | Implementation and observed verification | Code recency is not authority to change approved intent |
| Task/change artifact | Active delivery scope | Do not mark delivered solely because a page was updated |

For a three-retry rule and five-retry implementation, show both sources and the mismatch. A newer draft spec does not supersede an accepted ADR without evidence.

An existing ADR may use `status: accepted`. Preserve that field in the source. OKF `status: draft|stable|deprecated` governs only a derived concept, not the source's domain approval. Never add OKF fields to canonical documents merely for consistency.

SDD handoff before work: relevant artifact IDs, source paths, applicable rules/decisions, observed behavior, and gaps. After work: actual changed source paths/IDs, accepted decisions supplied by the workflow, verification evidence, updated derived pages, and unresolved mismatches. Do not start a competing planning or approval process.

## Structure

Reuse the established knowledge directory; otherwise choose:

```text
docs/knowledge/
  index.md        # short map linking original artifacts and useful synthesis
  checkout.md     # only when synthesis adds durable value
```

Source documents stay in their existing locations. Start flat; create subdirectories only when navigation benefits. Do not scaffold empty domain trees or create a log for every task.

Root `index.md` may contain only the optional `okf_version` metadata. Use headings and descriptive Markdown links. Nested indexes have no frontmatter. A `log.md`, when genuinely needed, uses dated `## YYYY-MM-DD` headings, newest first. Put configuration and operation records outside the bundle.

## Derived concept example

Replace illustrative values with observed evidence; do not copy placeholder provenance:

```markdown
---
type: Explanation
title: Payment retries
description: Retry behavior, governing rule, and current implementation mismatch.
status: draft
sources:
  - id: retry-rule
    resource: ../rules/payment.md
  - id: retry-code
    resource: ../../src/payments/retry.ts
generated:
  by: process:okf-knowledge
  at: "2026-10-21T12:00:00Z"
knowledge:
  source_state:
    - resource: ../rules/payment.md
      sha256: "<hash of the bytes actually read>"
    - resource: ../../src/payments/retry.ts
      sha256: "<hash of the bytes actually read>"
---
# Payment retries

The approved rule permits three attempts.[^retry-rule]
The inspected implementation permits five.[^retry-code]
This mismatch is unresolved.

[^retry-rule]: Payment retry rule.
[^retry-code]: Retry implementation.
```

Use the actual generation time; `process:okf-knowledge` identifies the producing workflow, not a human review or known model version. Omit `verified` unless a real verification event and actor are established. Do not rewrite existing verification to pretend it covers new content.

`knowledge.source_state` is this skill's optional extension, not an OKF standard. Store hashes of inspected local source bytes; optionally record the actual commit and source artifact ID. A commit alone misses dirty changes. Remote evidence without an available revision must be labeled as such, not given a fabricated hash. Do not update hashes just to clear a freshness warning without reviewing the changed evidence.

Keep source IDs stable. Use claim footnotes when attribution would otherwise be ambiguous, plus ordinary links for navigation. Source `resource` can be a URL, local path, or non-resolvable population description; never assume every value is a local file. Bundle-root links start with `/`; relative links resolve from the containing page.

Unknown OKF types and extension keys remain readable. Optional metadata absence is not failure. Local bundles may reference repository artifacts outside the bundle; standalone sharing requires an explicit external-dependency review.

## Discovery and host integration

A setup pointer can be as short as:

> Project knowledge starts at docs/knowledge/index.md. Consult relevant original specs and decisions before changes. During authorized work, refresh affected derived knowledge within the agreed upkeep scope; preserve canonical approval workflows.

Use the project's existing instruction mechanism and adapt the path. Do not overwrite AGENTS.md, CLAUDE.md, or other existing instructions. Without a setup/upkeep request, answer in chat and leave these files alone.

The skill directory is portable guidance plus a Python helper. This release registers Codex UI metadata only; it does not install Claude hooks, launch services, or promise identical host lifecycle behavior.
