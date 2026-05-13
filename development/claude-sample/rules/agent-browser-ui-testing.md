# Agent Browser — UI Testing Rules

`agent-browser` (vercel-labs) is the **default UI testing tool** for the React dashboard in `packages/web`. Any agent implementing or verifying UI changes MUST use it.

## When this rule applies

- Writing a spec or proposal for a change touching `packages/web/**` (must consider agent-browser as the verification path).
- Planning tasks for a UI change (planning step must allocate an explicit "agent-browser self-test" sub-task in the implementation phase and an "agent-browser verification evidence" sub-task in the QA phase).
- Implementing or modifying anything in `packages/web/**` (React components, pages, routes, state, styling) — use as inner-loop dev tool AND for self-test before handoff.
- Verifying acceptance criteria that mention UI behavior.
- Reviewing visual regressions, hydration, or rendering performance.
- Producing evidence for QA signoff on a UI change.

It does **NOT** apply to: backend-only changes, Flutter/mobile work, infrastructure, or doc-only changes.

## Spec & planning requirements

When a change affects `packages/web/**`, the `proposal.md` and `tasks.md` MUST reflect agent-browser usage:

**`proposal.md` acceptance criteria** — at least one Given/When/Then must be expressed in agent-browser terms, e.g.:
- "Given the dashboard at `localhost:3000`, when I run `agent-browser snapshot -i --session pf-qa` after applying filter X, then the snapshot tree contains `<expected element>` and the screenshot diff against `tmp/qa/<change-id>/baseline.png` is within tolerance."

**`tasks.md` MUST include**:
- An implementation task labeled `agent-browser self-test` (owner: implementer) — produces `tmp/qa/<change-id>/dev-*.png` evidence.
- A verification task labeled `agent-browser QA evidence` (owner: `@qa-engineer`) — produces `tmp/qa/<change-id>/qa-*.png` + `errors --json` clean log, linked from `handoff.md`.

A UI proposal that does not name `agent-browser` in its acceptance criteria, or a `tasks.md` that does not allocate these two tasks, is incomplete and must be sent back to `@product-owner` / `@dev-manager` before transitioning out of `plan` phase.

## Mandatory checklist before marking a UI task done

- [ ] Dev server is running (`bun --cwd packages/web run dev` → `http://localhost:3000`).
- [ ] Ran `agent-browser snapshot -i --session pf-qa` against the changed view and confirmed expected interactive elements appear.
- [ ] Captured at least one annotated screenshot of the changed view: `agent-browser screenshot --annotate --session pf-qa <out>.png`.
- [ ] Console + errors clean: `agent-browser errors --session pf-qa --json` returns no unexpected entries.
- [ ] Evidence (screenshots, eval outputs) saved under `tmp/qa/<change-id>/` and referenced in handoff.

## Development workflow (inner loop)

Use `agent-browser` as the **inner loop while building** — not just at the end. Keep a `--session pf-dev` open the entire time you're editing components.

```bash
# one-time, at the start of an implementation session
bun --cwd packages/web run dev &
agent-browser open http://localhost:3000 --session pf-dev
```

After every meaningful edit (Vite HMR will refresh automatically):

```bash
agent-browser snapshot -i --session pf-dev          # confirm tree shape is what you expect
agent-browser screenshot --annotate --session pf-dev tmp/dev/iter-NN.png
agent-browser errors --session pf-dev --json        # catch runtime errors immediately
```

Targeted dev recipes:

- **Driving a flow you're building** — `snapshot -i` to find the ref, then `click @e3` / `fill @e7 "..."`. No need to manually drive the browser.
- **Zustand re-render audit** (see `.claude/rules/state-management.md`):
  ```bash
  agent-browser react renders start --session pf-dev
  # trigger the action
  agent-browser react renders stop --session pf-dev
  ```
- **State inspection mid-build** — `agent-browser eval "JSON.stringify(window.__zustandStores)" --session pf-dev`.
- **Form value read-back** — `agent-browser get value "@e7" --session pf-dev`.
- **Visual diff while refactoring** — `screenshot --annotate before.png` → refactor → `diff screenshot --baseline before.png`.
- **Vitals during dev** — `agent-browser vitals --session pf-dev` to spot LCP/CLS regressions before they reach QA.

Session conventions:
- `--session pf-dev` — implementation/inner-loop work (logged-in dev user, mock data, screenshots in `tmp/dev/`).
- `--session pf-qa` — verification (clean state, evidence in `tmp/qa/<change-id>/`).
- Sessions are isolated; never reuse `pf-dev` artifacts as QA evidence.

## How to use it for the React dashboard

### 1. Snapshot-driven exploratory QA — best fit for `@qa-engineer`

```bash
agent-browser open http://localhost:3000 --session pf-qa
agent-browser snapshot -i --session pf-qa            # accessibility tree with @e1, @e2 refs
agent-browser click "@e3" --session pf-qa
agent-browser fill "@e7" "test@metuur.dev" --session pf-qa
agent-browser screenshot --annotate --session pf-qa  # numbered overlay matching refs
```

### 2. ProfitFlow-specific checks (matches existing rules)

- **Filter precedence (`accountId > marketplace`)** — see `.claude/rules/filter-params-resolution.md`. Set both filters in the UI, screenshot, diff against baseline. The rendered list must reflect only the explicit `accountId`.
- **Hydration / Web Vitals audit** — `agent-browser vitals` catches LCP/CLS/INP regressions per change.
- **React render audit** — `agent-browser react renders start` around a filter/state change; confirm no extra rerenders.

### 3. Agent-driven workflows

```bash
agent-browser chat "log into the dashboard, switch the global filter to a specific eBay store, screenshot the closeout view, and verify only that store's orders show"
```

### 4. CI-friendly batch mode — multiple commands in one daemon turn

```bash
echo '[
  ["open","http://localhost:3000"],
  ["wait","[data-testid=global-filter-bar]"],
  ["screenshot","--annotate","./tmp/qa/01-home.png"],
  ["click","[data-testid=filter-account]"],
  ["screenshot","--annotate","./tmp/qa/02-after-filter.png"]
]' | agent-browser batch --session pf-qa --bail
```

## Where it fits vs. doesn't

| Use case | Tool |
|---|---|
| Agent-driven exploratory QA, design review, visual diffs, perf audits | **agent-browser** |
| Hermetic deterministic regression suite | Playwright (if/when added) |
| Flutter mobile UI | Not applicable — agent-browser is web-only |
| Backend-only API changes | Not applicable |

## Conventions

- **Session name:** always `--session pf-qa` for QA flows, `--session pf-dev` for implementation self-tests. Keeps state isolated and reusable.
- **Output dir:** screenshots and traces land in `tmp/qa/<change-id>/`. Never commit to repo root.
- **Headed vs headless:** default headless. Use `--headed` only for interactive debugging.
- **Selectors:** prefer accessibility-tree refs (`@e1`) returned by `snapshot -i`, then `data-testid` attributes, then ARIA roles. Avoid brittle CSS selectors.
- **Evidence in handoff:** when handing a change to the next agent, link the screenshot paths and any `eval` JSON outputs in `handoff.md` under a `## UI Verification Evidence` section.

## Forbidden

- Marking a UI change "done" without running agent-browser against it.
- Hand-waving UI verification with "looks fine in my IDE preview."
- Committing screenshots, traces, or HAR files to the repo (use `tmp/qa/`).
- Using agent-browser to test the Flutter mobile app — it's web-only.

## See also

- `.claude/rules/filter-params-resolution.md` — what to verify on filter changes.
- `.claude/rules/component-architecture.md` — component layering the snapshot tree should reflect.
- `.claude/rules/state-management.md` — Zustand patterns to watch for via `react renders`.
