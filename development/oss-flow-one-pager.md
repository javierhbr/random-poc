# OSS-Flow — One-Pager

*A focus & sync system for a part-time open-source team on GitHub Projects.*

## Problem statement

Our contributors are **part-time volunteers** with variable, unpredictable hours, and
our workflow doesn't account for that. The result:

- The **backlog is huge** and the **In Progress column is bloated**, while very little
  reaches validation or release — motion without completion.
- **Tasks get claimed and abandoned.** Someone self-assigns an issue, works briefly,
  then goes quiet for weeks or months with no status updates — and our norms don't let
  us reassign it, so it's stuck.
- **Effort is scattered.** With free task-picking, scarce hours spread thinly across
  many issues instead of finishing a few.
- **Visibility depends on a meeting.** Status lives in the bi-weekly sync; anyone who
  misses it — or who never reports — drops off the radar entirely.

Net effect: things start, few things finish, and no one has a reliable, current picture
of where the project stands.

## Proposed solution

**OSS-Flow** — a lightweight, fully configurable layer on top of our existing GitHub
Project (no new tools, no Jira). Four parts:

1. **Focus over free choice.** Each month we pick **2–3 Objectives** (epics). Volunteer
   freedom is preserved but bounded: pick any task *within the active Objectives*. The
   backlog is prioritized by Objective, not task-by-task.
2. **A staleness lifecycle that respects our norms.** Issues move `fresh → aging →
   stale → released` on agreed time thresholds. We never yank a task from someone — the
   contributor accepts an **auto-release rule when they claim it**. Releasing ≠
   reassigning; it's a public, uniform policy.
3. **A metadata contract.** Namespaced labels (`type:`, `area:`, `size:`, `health:`),
   Projects fields (Status, Objective, Iteration), and native sub-issues for
   epic → task hierarchy. This is the shared vocabulary everything else reads.
4. **Automated visibility.** A `gh` CLI sync runs **twice a day**, classifies the board,
   and posts a **status report that becomes the source of truth** — replacing the
   meeting as the way we stay informed. An optional AI triage assistant (Claude Code)
   handles the judgment calls: prioritization, epic/sub-issue decisions, and grouping.

The whole system is parameterized in a single config file, so it drops onto any GitHub
project — our column names, our labels, our cadence.

## Process at a glance

```
  MONTHLY FOCUS ── pick 2–3 Objectives ── everything else is out of scope this cycle
        │
        ▼
 ┌─────────┐  DoR met  ┌────────┐  claim  ┌─────────────┐   ┌────────┐   ┌────────────┐   ┌──────┐
 │ BACKLOG │ ────────► │ READY  │ ──────► │ IN PROGRESS │ ─►│ REVIEW │ ─►│ VALIDATION │ ─►│ DONE │
 │ (by obj)│           │(up for │         │  (WIP ≤ N)  │   └────────┘   └────────────┘   └──────┘
 └─────────┘           │ grabs) │         └──────┬──────┘
                       └────────┘                │ no update ≥ 21d
                            ▲                     ▼
                            │              ┌──────────────┐
                            │  release     │ health:stale │ ──► ping assignee
                            └──────────────┤  ≥ 35d idle  │
                             (policy, NOT   └──────────────┘
                              reassignment)

 ───────────────────────────────────────────────────────────────────────────────────
  SYNC DAEMON  ·  gh CLI  ·  twice a day
     extract board ──► classify staleness ──► build graph ──► STATUS REPORT
     STATUS REPORT = single source of truth  ──►  replaces the bi-weekly meeting
```

Work only enters the board through a **Definition of Ready** gate and under an active
**Objective**. The **staleness loop** returns abandoned issues to `READY` by policy
(never a manual reassignment), and the **twice-daily sync** keeps everyone informed
without a meeting.

## Process change (before → after)

| Area | Before | After |
|------|--------|-------|
| **Task selection** | Pick anything from the backlog | Pick within 2–3 active Objectives |
| **Backlog priority** | Ad hoc, task-by-task | By Objective, monthly |
| **Abandoned tasks** | Sit indefinitely, can't reassign | Auto-flagged, pinged, then released to the pool by policy |
| **WIP** | Unbounded In Progress | Column limit + per-person limit |
| **Big tasks** | Enter the board whole | `size:xl` must be split into sub-issues (Definition of Ready) |
| **Status visibility** | Only via bi-weekly meeting | Twice-daily auto report = source of truth |
| **Triage** | Manual, inconsistent | Metadata contract + AI-assisted classification |

## What we're asking for

- Agreement on the **staleness thresholds** and **WIP limits** (land as a PR to
  `CONTRIBUTING.md` so the auto-release is expected, not a surprise).
- Agreement on this month's **2–3 Objectives**.
- A green light to run the sync in **read-only mode first**, then enable actions.

## Success looks like

More issues reaching Done, a shrinking "In Progress," no task idle >30 days unnoticed,
and every contributor — meeting or no meeting — able to see exactly what to pick up next.
