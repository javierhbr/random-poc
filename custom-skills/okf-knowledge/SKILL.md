---
name: okf-knowledge
description: Understand a repository, remember useful discoveries, and refresh source-backed project knowledge using OKF. Use for project maps, questions about specs or decisions, durable knowledge capture, documentation drift, and frontmatter review. Integrates existing PRDs, Platform Specs, Component Specs, ADRs, and business rules without replacing their workflows.
---

# Project knowledge

Help the user find the right evidence and preserve only knowledge worth keeping.
Use ordinary language. The user need not learn OKF types, commands, or metadata.

## Route the request

| Intent | Action |
| --- | --- |
| Understand: explain, find, orient, compare | Read relevant sources and answer with links. Do not create files. |
| Remember: save, document, capture | Check existing coverage; extend or link before creating a small derived page. |
| Update: refresh, reconcile, check accuracy | Inspect the requested changes and affected pages; preserve conflicts explicitly. |
| Set up project knowledge | Reuse the knowledge location, create a compact map, and add a small discovery pointer through the existing project instructions. |
| Check frontmatter | Run the bundled checker with the document's declared profile. Checking never edits files. |

A question about a potential behavior change is not authorization to change the implementation or accept a decision. Coding and SDD workflows retain those responsibilities.

## Start with the smallest useful context

1. Read applicable project instructions and the current task. Respect repository boundaries and existing tool preferences.
2. Locate existing knowledge and documentation entry points. Prefer an established knowledge root; otherwise use `docs/knowledge/` for authorized setup.
3. Identify artifact roles from explicit project declarations, approval state, and supersession. Names and folders are discovery hints, not authority.
4. Retrieve the entry map, matching titles/descriptions, artifact IDs, and source paths. Read a few relevant original passages; expand only if coverage is insufficient.
5. Separate **intended** approved behavior, **observed** implementation, and **unresolved** differences. Cite original evidence for material claims.
6. Before relying on a derived page, check its recorded source revisions and current file contents, including dirty worktree changes. A change signals rechecking; it does not prove the page is wrong.

Use [artifact and SDD rules](references/artifacts.md) when interpreting specifications, creating pages, or handing context to a coding agent.

## Capture only durable value

Persist only when authorized and the information is supported, reusable, missing from existing coverage, and useful as a future link target. A short clarification belongs in an existing page. A lookup, repeated observation, or formatting-only task normally produces no knowledge diff.

Keep canonical PRDs, Platform Specs, Component Specs, ADRs, and business rules in place. Link them directly from the map. Create synthesis only when it adds explanation or connections. Do not create a wrapper for every source.

Attribute a user's report as such when there is no independently inspected evidence. Never manufacture authorship, verification, acceptance, model versions, or decision rationale. Generated concepts start as `draft`; structural validation does not promote them.

## Apply a small, recoverable update

Follow [update and recovery steps](references/workflows.md) before writing.

- Establish write scope from the request or prior upkeep authorization.
- Record source and target content hashes before analysis; recheck immediately before writing. Reconcile changed files before proceeding.
- Validate proposed Markdown using [the frontmatter checker](references/validation.md), then apply the smallest edit and validate saved files.
- Check affected citations and local links. Maintain map descriptions only when useful content changes.
- For multiple files, retain an operation record outside the OKF bundle until all edits and checks succeed. Report partial outcomes honestly.
- Do not make timestamp-only edits, append duplicate history, auto-commit, publish, or rewrite canonical intent as incidental upkeep.

The helper supplies deterministic format checks. Retrieval, factual reconciliation, revision checks, and recovery are explicit agent procedures, not an installed transaction engine.

## Check quietly

Run `scripts/check_frontmatter.py` relative to this skill's directory, using Python 3.11+ with dependencies from `scripts/requirements.txt`. Do not silently install dependencies.

Select profiles by declared role and scope:
- OKF bundle concepts and reserved files: `--bundle PATH`.
- PRDs/specs/ADRs/business rules: `--profile sdd`, plus an explicitly configured local JSON Schema if present.
- Other Markdown, including research proposals: `--profile generic`.

A file's `type` field alone never establishes OKF scope. Group a mixed changed-file set by declared profile/schema. Never check the whole repository as an OKF bundle. Do not force source artifacts into OKF.

The checker is read-only and reports checks performed and skipped. It is not a formatter or a factual verifier. Fix deterministic mistakes only within authorized edits, preserving comments, unknown fields, and unrelated prose. Metadata migration requires its own requested scope.

## Keep the experience simple

Answer first with useful source links. Mention knowledge changes only when something useful changed or needs attention. Ask only about material ambiguity: independent project scope, conflicting accepted rules, unknown acceptance, or permission to change authored meaning.

For setup, add a short pointer to the knowledge map in the existing instruction mechanism, preserving unrelated content. Do not create competing host instruction files. Record established upkeep scope there if requested. Codex and Claude Code use the same Markdown and helper; explicit invocation remains the fallback. No background daemon or automatic host hooks are installed.

For history recovery, export, research snapshots, or managed storage, read the advanced boundaries in [workflows](references/workflows.md). Avoid making these prerequisites for ordinary use.

## Verify changes to this skill

Run `python3 -B scripts/test_frontmatter.py` after modifying the helper. Use [behavior scenarios](references/evaluation.md) to evaluate routing, authority handling, no-op behavior, and recovery. Passing parser tests alone does not establish workflow quality.
