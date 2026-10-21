---
date: "2026-10-20T20:06:35-05:00"
git_commit: "3bec9ea"
branch: token-improvements
repository: production-grade-agent-skills
topic: "Use the ponytail v3→v5 adoption research to understand how uncle-dev can use and improve on those concepts"
tags: [research, ponytail, uncle-dev, review, build-rules, debt, benchmarks, token-footprint]
status: complete
---

# Research: Ponytail v5 concepts mapped onto uncle-dev

**Date:** 2026-10-20
**Git Commit:** 3bec9ea
**Branch:** token-improvements

## Research question

The user asked to take the concepts from the ponytail repository's own research doc
(`/Users/javierbenavides/others/ai-agents/ponytail/.devlocal/research/2026-10-20-ponytail-v3-to-v5-adoption.md`)
and understand how uncle-dev can use and improve on them. The user explicitly asked for
improvement direction, so this document has two parts: the as-is map (findings) and a
separated adoption assessment. Every judgment in the second part points back at evidence in
the first.

Inputs: the ponytail doc read in full; four parallel read-only scouts (build-side rules,
review/audit surfaces, runtime/distribution/measurement, historical context); the two June 16
research docs in this directory; `.uncle-dev/learns/`. Graphify was OFF, so evidence comes
from file reads and grep. Paths are relative to the repo root unless noted.

## Summary

1. **The v4-era ponytail patterns are already in uncle-dev.** A June 16 research pass listed
   nine recommendations; all nine landed the same day in the phase1 to phase4 commit series
   (`3f39b75`, `6408b32`, `28b3a8f`, `20a90c5`, `182d9b7`, `17abf36`, `47a7090`). Drift guard,
   over-engineering audit, `@debt` marker and harvest, session mode and statusline, env config
   tier, instruction adapters, benchmark harness, and install-time branch split all exist.
2. **The v5-era concepts are mostly absent as build-side rules.** "Impact scope before
   editing" (callers, tests, fixtures, config, exports, data risk), "smallest complete change
   including every affected caller", an ordered reuse chain, "find every caller and fix the
   shared cause", and an end-of-reply disclosure of skipped or unchecked work each exist only
   as fragments scattered across five skills, or not at all.
3. **The v5 review rebuild is partially present.** uncle-dev reviews on five axes in a fixed
   order and requires a fix per finding. It does not require a concrete failure case per
   finding, has no expected-load reasoning, has no unchecked-scope disclosure section, and uses
   three different severity vocabularies across the skill, the reviewer agent, and the
   synthesizer.
4. **The debt ledger lags ponytail v5.1 in two mechanical ways.** `harvest-debt.py` uses a
   fixed exclude list rather than `.gitignore`, and it recognizes only the literal `@debt`
   marker.
5. **Measurement discipline differs from ponytail's.** The benchmark exists but its
   `uncle-dev` arm is three hand-written bullets, not the real skills. Neither the benchmark
   selftest, `check-manifest.sh`, nor `run-all.sh` runs in CI. There is no CONTRIBUTING rule
   tying instruction changes to benchmark evidence.
6. **The token-footprint work on this branch is the uncle-dev analogue of ponytail's
   120→52-line rewrite.** Its HLD/LLD/EARS/tasks are drafted and none of the 31 tasks has
   started.

## Detailed findings

### Area 1: Build-side rules (what the agent does while writing code)

Ponytail v5's central claim is "smallest complete change" with an explicit impact scope. The
scout checked nine concepts against uncle-dev's build-side files.

| Ponytail v5 concept | uncle-dev today | Evidence |
|---|---|---|
| Impact scope before editing: callers, tests, fixtures, config, exports, data exposure/loss | NOT FOUND as a unit. Pre-edit read order covers the file, its tests, one pattern example, and types. Caller enumeration exists only in debug-error and only when graphify is ON. | `skills/uncle-dev-context-engineering/SKILL.md:214`; `skills/uncle-dev-debug-error/SKILL.md:107-122`; `commands/uncle-dev-build.md:61,66,111,115` |
| Smallest complete change: every requested part plus every affected caller/test/fixture | Partial. "Smallest complete piece" is per slice. "Every affected caller" is NOT FOUND. | `skills/uncle-dev-incremental-implementation/SKILL.md:27,86,196`; `commands/uncle-dev-build.md:8` |
| Vague request gets the smallest version doing the core job | Only in the duck thinking-partner skill. | `skills/uncle-dev-duck/SKILL.md:48` |
| Reuse chain: project helper → stdlib/platform → installed dep → custom | NOT FOUND as an ordered chain. Stdlib-over-dependency appears in the review skill. `stdlib`/`native` appear as audit tags (delete-side, not build-side). Re-implementation is diagnosed as a context problem the user fixes by pointing at the utility. | `skills/uncle-dev-code-review-and-quality/SKILL.md:410`; `skills/uncle-dev-over-engineering-audit/SKILL.md:41-48`; `skills/uncle-dev-context-engineering/SKILL.md:186-188,290` |
| House component beats native widget | NOT FOUND as a rule. Frontend skill has a "Design System Adherence" section. | `skills/uncle-dev-frontend-ui-engineering/SKILL.md:105-120` |
| Read code first; find every caller; fix the shared root cause | Read-first and root-cause exist. "Every caller of the buggy code" is NOT FOUND except via graphify. | `commands/uncle-dev-build.md:7`; `skills/uncle-dev-debug-error/SKILL.md:14-18,168-183,330-343`; `skills/uncle-dev-test-driven-development/SKILL.md:101` |
| Preserve validation, error handling, security, accessibility when moving/merging | Error behavior is named. Validation, security, accessibility are not named in the simplification contract. | `skills/uncle-dev-dev-code-simplification/SKILL.md:17,81,314,329` |
| One-liners stay readable; comments explain why | Present. | `skills/uncle-dev-dev-code-simplification/SKILL.md:44-73,82,129-130` |
| Non-trivial logic leaves one runnable check; trivial exempt; applies to a whole new script/app | Lite TDD mode says "write a test for each" non-trivial branch. The "self-check" wording and the whole-new-app clause are NOT FOUND. | `skills/uncle-dev-test-driven-development/SKILL.md:24,32-35,473` |
| Replies end with skipped/unchecked work and material risk | Pro mode says "if you skipped a step, say that"; source-driven has an `UNVERIFIED:` flag; incremental has `NOTICED BUT NOT TOUCHING:`. No end-of-reply rule exists in build. | `commands/uncle-dev-pro.md:13,29`; `skills/uncle-dev-source-driven-development/SKILL.md:137-142,176`; `skills/uncle-dev-incremental-implementation/SKILL.md:119-125` |
| Question unjustified scope before building | Assumption surfacing and push-back live in the always-on meta-skill; the design-time challenge lives in the uncle-senior agent. No build-time scope challenge. | `skills/uncle-dev-using-agent-skills/SKILL.md:43-84`; `agents/uncle-senior.md:57,66-71,84` |
| Intensity levels | strict/balanced/fast via `/uncle-dev-mode`, stored in `.uncle-dev/session-mode`, cleared on every SessionStart; tdd-mode lite/strict. | `commands/uncle-dev-mode.md:13-22`; `hooks/session-start.sh:23-29`; `commands/uncle-dev-build.md:71-75,120-124` |

Ownership today: no single build-side owner holds "impact scope" or "reuse first". The
fragments span context-engineering, incremental-implementation, debug-error,
dev-code-simplification, and code-review-and-quality.

Note: repo-root `CLAUDE.md` matched none of the keywords (caller, fixture, reuse, unchecked,
root cause). `AGENTS.md` is a 7-line stub.

### Area 2: Review and audit surfaces

Ponytail v5 rebuilt review and audit around correctness → safety → expected load → tests →
speed → leanness, with a concrete failure case per finding, Must/Should/Nice groups, and an
unchecked-scope disclosure.

| Concept | uncle-dev today | Evidence |
|---|---|---|
| Axis order | Correctness, Readability & Simplicity, Architecture, Security, Performance. Leanness is a bullet under axis 2. Tests are inside axis 1 plus a "review tests first" step. No expected-load axis. | `skills/uncle-dev-code-review-and-quality/SKILL.md:7,15-86,155-157`; `agents/uncle-dev-ag-code-reviewer.md:21-52` |
| Per-finding fix | Required for Critical and Important. | `agents/uncle-dev-ag-code-reviewer.md:15,74-80,95`; `commands/uncle-dev-review.md:10,78` |
| Per-finding concrete failure case / verification evidence | NOT FOUND, except the security auditor, which requires a proof of concept for Critical/High and treats theoretical risk as Info. | `agents/uncle-dev-ag-security-auditor.md:14-15,77-82,98` |
| Context / problem / smallest fix / consequence structure | NOT FOUND. | |
| Numbered findings for selective fixing | Only the synthesizer numbers its lists; no instruction says the user can pick by number. | `agents/uncle-dev-ag-review-synthesizer.md:64,69` |
| Severity vocabulary | Three vocabularies: Critical/Important/Suggestion (reviewer agent, skill `:247`), critical/major/minor (skill parallel prompt `:300-301`), Blocking/Non-blocking (synthesizer). "Must Fix" appears once. Security auditor uses Critical/High/Medium/Low/Info. | `agents/uncle-dev-ag-code-reviewer.md:58-62`; `skills/uncle-dev-code-review-and-quality/SKILL.md:178,247,300-301`; `agents/uncle-dev-ag-review-synthesizer.md:32-33,41-45` |
| Unchecked-scope disclosure | Closest is the reviewer's "Verification Story" (tests/build/security yes-no). Synthesizer notes absent reviewers. No "not reviewed" section. | `agents/uncle-dev-ag-code-reviewer.md:14,85-88,98`; `agents/uncle-dev-ag-review-synthesizer.md:85` |
| Expected-load reasoning; documented shortcut limits treated as decisions | `@debt` ceilings are defined as load/scale triggers, and uncle-senior probes 10x scale at design time. Review and audit never read `@debt` ceilings. | `skills/uncle-dev-spec-traceability/SKILL.md:166,173-174`; `agents/uncle-senior.md:37,57,157`; NOT FOUND in review/audit |
| "Unused" requires checking tests, fixtures, config, strings, dynamic refs | Review says "no remaining references" and "ask before deleting". Audit says confirm via graphify then grep. No enumerated list of reference types. | `skills/uncle-dev-code-review-and-quality/SKILL.md:353-366`; `skills/uncle-dev-over-engineering-audit/SKILL.md:72,119`; `commands/uncle-dev-overkill-detector.md:8,40` |
| Merge near-copies vs split unrelated responsibilities, not by line count | "Split by responsibility" and "duplicated logic → shared" exist in the simplify command. PR sizing uses line counts. No explicit contrast rule. | `commands/uncle-dev-code-simplify.md:31-32`; `skills/uncle-dev-code-review-and-quality/SKILL.md:44,90-96` |
| Audit modes and tags | Three modes (review/audit/debt), five tags (delete/stdlib/native/yagni/shrink), biggest-cut-first, `net: -N lines, -M deps possible`. Matches ponytail v4.x. | `commands/uncle-dev-overkill-detector.md:2,29-73`; `skills/uncle-dev-over-engineering-audit/SKILL.md:38-65` |
| Parallel review and synthesis | Three code-reviewer prompts (quality, architecture, change impact) plus optional security auditor and graph analyst; synthesizer dedups to higher severity and derives the verdict from the issue list. Audit mode reuses the same fan-out. | `skills/uncle-dev-code-review-and-quality/SKILL.md:252-340`; `agents/uncle-dev-ag-review-synthesizer.md:21,27,35,80-85`; `skills/uncle-dev-over-engineering-audit/SKILL.md:78-83` |

### Area 3: Shortcut marker and debt ledger

| Aspect | uncle-dev today | Ponytail v5.1 | Evidence |
|---|---|---|---|
| Marker | `@debt <ceiling>, <upgrade>`; both fields mandatory; split on first comma; all comment styles | neutral `shortcut:` marker | `skills/uncle-dev-spec-traceability/SKILL.md:161-184`; `harvest-debt.py:14-15,36-38,92-100` |
| Older or custom markers | NOT FOUND; regex matches literal `@debt` only | debt recognizes old `ponytail:` and supports custom markers | `harvest-debt.py:38` |
| Exclusion | Fixed `EXCLUDE_DIRS` set (node_modules, dist, build, .venv, target, vendor, .next, ...); `.gitignore` not read | respects `.gitignore` | `harvest-debt.py:45-49,62` |
| Output | stdout ledger or JSON; rot-risk sorted first; exit 1 on rot risk; no file written; no persistence wording | one-shot, persistence wording removed in v5.3 | `harvest-debt.py:154,158-159,173-206,232,237`; `commands/uncle-dev-debt.md:30-42` |
| Who writes markers | uncle-senior's `DEFERRED:` items become `@debt` when they live in code | main skill writes shortcut markers at build time | `agents/uncle-senior.md:71,84` |

### Area 4: Runtime, distribution, measurement

| Concept | uncle-dev today | Evidence |
|---|---|---|
| Session start | Injects only the `## Skill Discovery` and `## Quick Reference` slices of the meta-skill, three newest learn names, newest handoff path. No token budget. No codebase map. | `hooks/session-start.sh:35-46,48-63,65-85,91` |
| Mode state and compaction | Flag file at `.uncle-dev/session-mode`, not project-keyed; deleted at every SessionStart; no PreCompact hook; no startup/resume/clear matcher. | `hooks/uncle-dev-mode.sh:11-12,52-59`; `hooks/session-start.sh:23-29`; `hooks/hooks.json` |
| Subagent instruction injection | NOT FOUND as a hook. Only CLAUDE.md prose ("every spawned agent MUST first check" graphify). Model tiers come from `uncle-dev-subagent-model-routing`. | `hooks/hooks.json` (no SubagentStart); repo `CLAUDE.md` "Graphify — conditional for subagents" |
| Config resolution | env → session flag → YAML → default; env is scalar-only; session flag only for `execution_profile`. | `scripts/uncle-dev-config.sh:144-175` |
| Drift guard | `check-manifest.sh` checks marketplace lists, command copy hashes, README counts, version agreement, generated CLAUDE.md blocks, dead links, bash-3.2 compliance, and adapter bodies. No load-bearing-phrase invariant check. Runs in `run-all.sh` and `install.sh verify`, not in CI. | `scripts/check-manifest.sh:28-43,162-198,251-442`; `scripts/tests/run-all.sh:36-40`; `.github/workflows/` |
| Hosts | Copilot, Cline, Kiro, pi, Cursor, Windsurf, Gemini, OpenCode get instruction-only adapters derived from AGENTS.md; Claude hooks not activated by that installer; `UNCLE_DEV_SPLIT_SKILLS=1` trims dual-branch skills at install. | `scripts/install-plugin.sh:5-11,20-31,42,239-241,343,356,360` |
| Benchmark | Two arms (no-skill, uncle-dev); the uncle-dev arm is three hand-written bullets (SPEC-FIRST, SURGICAL CHANGES, REVIEW RIGOR), not the real hooks or skills; three tasks; pinned `claude-sonnet-4-6`; string grader; offline selftest in `run-all.sh`; live run needs an API key; nothing in CI. | `benchmarks/promptfooconfig.yaml:21-25`; `benchmarks/prompts/uncle-dev.txt:1-12`; `benchmarks/grader.py:1-40`; `scripts/tests/benchmarks.test.sh` |
| Evidence policy for instruction changes | NOT FOUND. No CONTRIBUTING file at root or in docs. | `.github/` has two workflows only |
| CI | `lint-skills.yml` runs nori-lint report-only; `test-plugin-install.yml` validates and installs the plugin. `run-all.sh`, `check-manifest.sh`, and the benchmark selftest do not run. | `.github/workflows/lint-skills.yml`; `.github/workflows/test-plugin-install.yml` |
| Usage/cost observability | NOT FOUND. Only the mode badge on the statusline. | `hooks/statusline-mode.sh`; grep of hooks/ and scripts/ for cost/tokens/ledger/metrics |

### Area 5: Historical context

**June 16 research cycle.** `2026-06-16-ponytail-how-it-works.md` mapped ponytail at its
v4-era state (five skills, `ponytail:` marker, lite/full/ultra, per-host adapters, drift
scripts, promptfoo benchmark). `2026-06-16-improving-uncle-dev-with-ponytail-patterns.md`
produced nine recommendations. All nine were implemented that day; evidence per item:

| # | Recommendation | Landed as | Commit |
|---|---|---|---|
| 1 | Drift guard | `scripts/check-manifest.sh`, wired in `run-all.sh:36-40` and `install.sh:86` | `3f39b75` |
| 2 | Over-engineering audit | `skills/uncle-dev-over-engineering-audit/`, `commands/uncle-dev-overkill-detector.md` | `6408b32` |
| 3 | Instruction adapters | `install-plugin.sh` targets cline/kiro/pi, writes `.github/copilot-instructions.md`, `.clinerules/`, `.kiro/steering/` | `17abf36` |
| 4 | `@debt` + harvest | `harvest-debt.py`, `commands/uncle-dev-debt.md`, `debt-harvest.test.sh` | `20a90c5` |
| 5 | Session mode + statusline | `uncle-dev-mode.sh`, `statusline-mode.sh`, `session-mode.test.sh` | `182d9b7` |
| 6 | Env override tier | `uncle-dev-config.sh:142-155` | `3f39b75` |
| 7 | Benchmark harness | `benchmarks/` | `47a7090` |
| 8 | Self-audit cut-list | R-5.1/R-5.2 in `docs/ears/ponytail-patterns-adoption.md:62-63`; cut-list was the deliverable, acting on it out of scope | `28b3a8f` |
| 9 | Dual-branch split | Install-time trim via `UNCLE_DEV:BRANCH` markers; source skills still carry both branches (task-selection 370 lines, planning 370, spec-driven 204) | `3f39b75` |

**Token-footprint work on this branch.** `2026-09-13-token-footprint-skills-commands-agents-rules.md`
measured 47 skill descriptions at 17,079 chars, SKILL.md bodies at about 136K tokens, 25 of 47
skills over the 5,000-token anatomy budget, and duplicated loader/principles blocks across 19
commands. The untracked `docs/{hld,lld,ears,tasks}/skill-token-footprint-reduction.md` set a
250-line target with a 350 ceiling, description rewrites to 120-350 chars, dedup onto existing
scripts, and extraction of six heavy skills starting with test-driven-development. Zero of 31
tasks are checked. Current largest skills: setup-local 565, code-review-and-quality 505,
test-driven-development 479, spec-traceability 390.

**Learns.** `.uncle-dev/learns/best-practices/durable-rules-go-to-tracked-files-not-memory-2026-05-30.md`
is the only entry. Its routing table sends project-wide conventions to root `CLAUDE.md`,
authoring rules to `docs/skill-anatomy.md`, per-skill behavior to that skill, and directory
rules to a colocated `AGENTS.md`. It does not mention ponytail.

## Code references

- `skills/uncle-dev-incremental-implementation/SKILL.md:27,86,115-125,196,222-224` — slice-level "smallest complete", Rule 0, NOTICED BUT NOT TOUCHING block, abstraction red flags
- `skills/uncle-dev-context-engineering/SKILL.md:186-188,214,290` — pre-edit read order; re-implementation as a context starvation symptom
- `skills/uncle-dev-debug-error/SKILL.md:107-122,168-183,330-343` — graph-only caller enumeration; root-cause step and checklist
- `skills/uncle-dev-dev-code-simplification/SKILL.md:17,44-73,81-82,97-104,129-130,314,329` — behavior-preservation contract; Chesterton's Fence questions; comment rules
- `skills/uncle-dev-test-driven-development/SKILL.md:9-13,21-39,101,473` — lite/strict table; Prove-It; verification
- `skills/uncle-dev-code-review-and-quality/SKILL.md:7,15-96,178,200-222,247,252-340,353-366,410` — axes, severity prefixes, parallel orchestration, dead-code hygiene, dependency rule
- `agents/uncle-dev-ag-code-reviewer.md:14-15,58-62,74-98` — severity tiers, finding template, Verification Story
- `agents/uncle-dev-ag-review-synthesizer.md:21-45,56-85` — dedup, verdict derivation, output format
- `agents/uncle-dev-ag-security-auditor.md:14-15,56-62,77-82,98` — proof-of-concept requirement, five-level scale
- `agents/uncle-senior.md:31-39,57,65-84,157` — seven questions, ceiling/upgrade, DEFERRED, verdicts
- `skills/uncle-dev-over-engineering-audit/SKILL.md:8-18,38-65,72,78-83,119,127-137` — tags, ranking, net line, delete verification, fan-out reuse
- `skills/uncle-dev-spec-traceability/SKILL.md:161-184` and `harvest-debt.py:14-15,36-62,92-100,154-237` — `@debt` grammar and harvester
- `commands/uncle-dev-build.md:7-8,23-24,61-75,111-124` — read-first, profile defaults, boundary check, scout, verification per profile
- `commands/uncle-dev-pro.md:13,15,19,21,29` — ground every claim, scope pause, effort matching
- `commands/uncle-dev-mode.md:13-33` — three profiles, flag file, resolution order, badge
- `hooks/session-start.sh:23-29,35-46,48-85` — mode clear, routing slice, learns and handoff pointers
- `hooks/hooks.json` — registered events (no PreCompact, no SubagentStart)
- `scripts/uncle-dev-config.sh:144-175` — env and session-flag tiers
- `scripts/check-manifest.sh:28-43,162-198,251-442` — drift checks
- `scripts/install-plugin.sh:5-11,20-31,42,134-145,239-241,262-264,343-360` — host targets, branch trim, adapter writers
- `benchmarks/promptfooconfig.yaml:21-25`, `benchmarks/prompts/uncle-dev.txt:1-12`, `benchmarks/grader.py:1-40` — arms, injected rules, grader
- `.github/workflows/lint-skills.yml`, `.github/workflows/test-plugin-install.yml` — the only CI

## Architecture documentation

uncle-dev separates concerns that ponytail folds into one 52-line skill:

- Build behavior is distributed across incremental-implementation, test-driven-development,
  debug-error, dev-code-simplification, source-driven-development, and the build command,
  with an always-on routing slice from using-agent-skills at session start.
- Review is a parallel fan-out (three reviewer prompts plus optional security and graph
  agents) feeding a synthesizer that owns the verdict. Audit mode reuses the fan-out.
- Deferred shortcuts flow design-time from uncle-senior's `DEFERRED:` to in-code `@debt`,
  harvested by `/uncle-dev-debt`.
- Strictness is a three-tier profile (strict/balanced/fast) resolved env → session flag →
  YAML → default and consumed by two guard hooks.
- Hosts other than Claude Code receive instruction-only adapters derived from AGENTS.md;
  hooks are Claude-only.
- Drift between canonical roots and hand-maintained copies is guarded by `check-manifest.sh`
  but only when `run-all.sh` or `install.sh verify` is run locally.

## Adoption assessment (requested by the user, separated from findings)

The ponytail doc's own ranking puts "explicit impact scope" and "smallest complete change" at
highest priority, review rebuild next, and runtime integrations last. Applied to uncle-dev:

### Highest priority: a build-side completeness contract

uncle-dev has no owner for "before editing, enumerate callers, tests, fixtures, config,
exports, and data risks" or for "a fix that leaves a broken caller is unfinished" (Area 1,
rows 1-2 and 6). The pieces exist in five files but no build step asks for them. The ponytail
caller-tracing benchmark (1/6 → 6/6 root-cause fixes) is the strongest narrow evidence in
their doc, and uncle-dev only enumerates callers when graphify is ON.

Smallest fit: add one step to `skills/uncle-dev-incremental-implementation/SKILL.md` (the
Increment Cycle, next to line 27) and one line to `commands/uncle-dev-build.md` Step 0 that
names the six scope items, plus an "every affected caller/test/fixture updated" item in the
Increment Checklist at line 196. Add "find every caller, fix the shared cause" as a non-graph
step in `skills/uncle-dev-debug-error/SKILL.md` Step 4 so it is not skipped when graphify is
OFF. The learns routing table says project-wide conventions go to root `CLAUDE.md`; the
compact eight-line wording at the end of the ponytail doc fits there as an always-on rule
without a new skill.

### High priority: an ordered reuse chain

uncle-dev only expresses "stdlib over dependency" in review and "stdlib/native" as audit tags
(Area 1, row 4). Nothing tells the agent, at build time, to look for a project helper before
writing one. The ponytail reuse rung was not shown to help in their June probes, so this is a
convention fix, not a measured gain. Smallest fit: one ordered bullet (project helper →
platform/stdlib → installed dep → custom) in incremental-implementation Rule 0, and name
validation, security, and accessibility alongside error behavior in
`skills/uncle-dev-dev-code-simplification/SKILL.md:17`.

### High priority: evidence-based findings and unchecked-scope disclosure in review

Three concrete gaps (Area 2): no concrete-failure-case requirement outside the security
auditor, no "not reviewed" section, and three severity vocabularies. The security auditor
already models the fix ("theoretical risks without a plausible exploit path are Info only",
proof of concept for Critical/High). Smallest fit: extend the reviewer template at
`agents/uncle-dev-ag-code-reviewer.md:74-80` to require a failure case for Critical and
Important, add an "Unchecked scope" line under Verification Story at line 85, and align the
parallel prompt at `skills/uncle-dev-code-review-and-quality/SKILL.md:300-301` to the
Critical/Important/Suggestion vocabulary the reviewer and synthesizer already use. Expected-load
reasoning can reuse `@debt` ceilings: a reviewer that sees a documented ceiling treats it as a
decision unless the change's expected load exceeds it. Do not add a second review command;
the ponytail doc warns against stacking overlapping reviews.

### Medium priority: debt harvester parity with v5.1

Two mechanical changes in `harvest-debt.py`: honor `.gitignore` instead of the fixed
`EXCLUDE_DIRS` set (lines 45-62), and accept a configurable marker list so teams migrating
from `TODO(debt)` or `shortcut:` are not forced to rename. Both are small and tested by
`scripts/tests/debt-harvest.test.sh`.

### Medium priority: an end-of-reply disclosure rule

Pro mode already says "if you skipped a step, say that" but only when pro is on. The
ponytail v5 rule is unconditional and positional (replies end with skipped/unchecked work and
material risk). The always-on candidate is `skills/uncle-dev-using-agent-skills/SKILL.md`
Core Operating Behaviors (lines 112-120, "Verify, Don't Assume"), which is the slice that
session-start does not inject; the injected slice is Skill Discovery and Quick Reference
only, so the rule would need to live in the Quick Reference or in root `CLAUDE.md` to be
always-on.

### Medium priority: measurement discipline

The benchmark's `uncle-dev` arm is three bullets, so it cannot detect whether a skill edit
changed behavior. The ponytail CONTRIBUTING rule ("benchmark evidence for changes to
instructions every user loads") and the scorer selftest in CI are the transferable practices.
Smallest fit: run `scripts/tests/run-all.sh` (which already includes `check-manifest.sh` and
the benchmark selftest) in `test-plugin-install.yml`, and add a `check-manifest.sh` invariant
for a handful of load-bearing phrases in the session-start slice, mirroring ponytail's
ten-phrase check. Making the benchmark arm load the real session-start slice is a larger
change and depends on the token-footprint work landing first.

### Low priority or not transferable

- **Codebase map at session start.** uncle-dev already routes to graphify when present and
  to scouts otherwise; the ponytail doc itself rates the map optional where an index exists.
- **Compaction state preservation.** uncle-dev's mode is intentionally cleared per session
  (R-10.7). The handoff flow covers context loss. Only relevant if mode is meant to survive
  compaction, which is a product decision not made.
- **Band/board cost metrics.** No equivalent exists and the ponytail doc flags the metrics as
  heuristic. Nothing in uncle-dev's goals calls for it.
- **Subagent instruction injection hook.** CLAUDE.md prose plus `uncle-dev-subagent-model-routing`
  covers model tiers and graphify checks; a SubagentStart hook would only matter if child
  agents demonstrably miss rules.
- **Single compressed skill.** ponytail's 120→52 rewrite is the shape of the token-footprint
  branch, already specced with a 250/350 line budget. Nothing to adopt beyond executing that
  plan.

### Suggested order

1. Build-side completeness contract and reuse chain (edits to three skills, one command, root CLAUDE.md).
2. Reviewer template: failure case, unchecked scope, one severity vocabulary.
3. `harvest-debt.py` gitignore and marker list.
4. CI runs `run-all.sh`; phrase invariants in `check-manifest.sh`.
5. Token-footprint tasks (already planned on this branch).

Each of 1 to 4 is a small enough change to go through `/uncle-dev-spec` as one segment with a
few EARS lines; the ponytail doc's pilot design (one multi-caller bug, one feature on existing
components, one risk path, one review) is the verification.

## Open questions

- Whether the build-side scope rule should live in root `CLAUDE.md` (always-on, per the learns
  routing table) or in incremental-implementation (only loaded during `/uncle-dev-build`).
  Both are defensible; the ponytail rule is always-on.
- Whether the session-start slice should carry the disclosure rule, given the token-footprint
  work is trying to shrink that slice.
- The cut-list from the June self-audit (R-5.1) was not located; whether any of its items were
  acted on is unknown.
- `skills/uncle-dev-context-engineering/SKILL.md` was read only in part by the scout (tool
  truncation); its middle section may contain reuse wording not captured here.
