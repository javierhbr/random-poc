# Uncle SDD — Operating Model Detail

## 4. Use canonical platform truth + versioned component alignment

When the platform uses one master repository plus many component repositories:

- keep shared platform truth upstream in the platform repo
- keep local Sdd-OpenSpec artifacts in the component repo
- pin platform version and platform refs in each affected component repo
- use JIRA for issue hierarchy and delivery status, not as the full spec store

Use:

- `platform-ref.yaml` for platform version and platform refs
- `jira-traceability.yaml` for platform issue, component epic, and stories
- a local read-only platform MCP gateway when teams need fast local access to
  platform truth without hosted infrastructure

### 4a. Keep three durable ownership artifacts in the platform repo

Write once during Platform. Read at every Assess step.

- `ownership/component-ownership-<name>.md` — one file per component; records
  what the component owns, what it does NOT own, and its published and consumed
  contracts; makes ownership a lookup, not a judgment
- `ownership/dependency-map.md` — one platform file; records which components
  must change together (tier 1), which need monitoring (tier 2), and which
  adapt independently (tier 3); drives JIRA structure decisions
- `ownership/glossary.md` — one platform file; defines shared terms with
  "what it is NOT" clauses; prevents spec ambiguity before Specify begins

Impact tier rules:

- tier 1 `must_change_together` → open coordinated component epics immediately
  at Assess; treat as hard constraints in design.md at Plan; verify in PR and
  archive at Deliver
- tier 2 `watch_for_breakage` → add watch note in `alignment_notes` at Assess;
  note as rollout risks in design.md at Plan; check after deploy at Deliver
- tier 3 `adapts_independently` → no additional coordination required

Constitution rules that enforce these artifacts:

- O-1: confirm component ownership before opening any JIRA epic
- O-2: all terms in proposal and acceptance criteria must be in the glossary
- O-3: impact tiers from the dependency map drive JIRA structure

## 5. Keep humans accountable and agents supportive

Humans own:

- intent
- tradeoffs
- approvals
- release decisions

Agents support:

- drafting
- routing
- artifact generation
- ambiguity checks
- review guidance

## 6. Route by size and impact

Use size to choose planning depth.
Use impact to choose validation and control depth.

Do not mix them.

## 7. Prefer the smallest sufficient workflow

- small work -> compact planning artifacts
- medium work -> standard path
- large or architecture-heavy work -> deeper planning and phased delivery

## 8. Keep delivery reviewable

Deliver in slices.
Each slice should normally produce one reviewable pull request.

## 9. Update artifacts as reality changes

Do not let specs, design, tasks, PR state, or archive drift from what was
actually implemented.

## Default skill mix by phase

### Platform

- Sdd-Speckit first
- Sdd-OpenSpec second
- Sdd-Bmad third

### Assess

- Sdd-Bmad first
- Sdd-OpenSpec second
- Sdd-Speckit only when ambiguity blocks routing

### Specify

- Sdd-OpenSpec first
- Sdd-Speckit second
- Sdd-Bmad third

### Plan

- Sdd-Bmad first
- Sdd-OpenSpec second
- Sdd-Speckit third

### Deliver

- Sdd-Bmad for implementation and review support
- Sdd-OpenSpec for apply and archive
- Sdd-Speckit for task discipline and phased execution
