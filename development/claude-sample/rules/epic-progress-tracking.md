# Epic Progress Tracking

## When this rule applies

- When creating a new OpenSpec change folder under `openspec/changes/PF-NNN-<slug>/` for any ProfitFlow epic
- When running `/propose`, `/plan-change`, `/openspec-change`, or `/uncle-dev:spec` for a ProfitFlow epic
- When a `handoff.md` State table is fully ☑ (all rows checked) and the change is being archived
- When completing QA signoff on a change and archiving the folder

This rule ensures the team's epic tracker stays live throughout the development lifecycle.

---

## Canonical tracker file

**Single source of truth:** `openspec/changes/profitflow-epics-tracker.yaml`

Every agent working on an epic must update this file when starting or completing the work.

---

## Status vocabulary

Valid status values (exactly three):

| Status | Meaning | Context |
|---|---|---|
| `"Pending Implementation"` | No work started | Epic not yet assigned |
| `"In Progress"` | OpenSpec change folder exists and is active | `started_at` set; `completed_at` is null |
| `"Completed"` | Change archived after QA signoff | `completed_at` set |

---

## Mapping: OpenSpec change ↔ Epic ID

To determine which epic a `PF-NNN-<slug>` change belongs to:

1. **Read the change's `proposal.md`** — it will reference the epic by ID (e.g., "Epic 1.2 — Upload Center")
2. **Cross-reference the tracker** — find the matching epic entry by id (e.g., `id: "1.2"`)
3. **Record the epic id → PF-NNN mapping** in the tracker

Example:
- Change `PF-004-upload-center` references "Epic 1.2 — Upload Center" in proposal.md
- Tracker entry with `id: "1.2"` should have `openspec_change_name: "PF-004-upload-center"`

---

## On Epic START (Creating the OpenSpec change)

**Trigger:** A new folder `openspec/changes/PF-NNN-<slug>/` is created for an epic

**Required updates to the tracker:**

Update the epic's entry in `openspec/changes/profitflow-epics-tracker.yaml`:

```yaml
status: "In Progress"
openspec_change_name: "PF-NNN-<slug>"
started_at: "YYYY-MM-DD"   # today's date in ISO format
completed_at: null
```

**Who does this?** The agent creating the OpenSpec change folder (`/uncle-dev:spec`, `/propose`, etc.).

**When?** Immediately after creating the `openspec/changes/PF-NNN-<slug>/` folder structure.

---

## On Epic COMPLETE (Archiving after QA signoff)

**Trigger:** ALL of the following are true:
1. The `handoff.md` State table has every row marked ☑ (all phases complete)
2. QA engineer has reviewed and signed off on the change
3. The change folder is moved from `openspec/changes/PF-NNN-<slug>/` to `openspec/changes/archive/`

**Required updates to the tracker:**

Update the epic's entry in `openspec/changes/profitflow-epics-tracker.yaml`:

```yaml
status: "Completed"
completed_at: "YYYY-MM-DD"   # today's date in ISO format
# openspec_change_name and started_at remain unchanged
```

**Who does this?** The QA engineer, DevOps lead, or agent moving the change to archive.

**When?** After all QA sign-off steps are complete and before/as the folder is archived.

---

## After updating the tracker: Next epic guidance

Once the tracker is updated, the **Dev Manager or next implementing agent should:**

1. **Read the tracker** — check the `epics[]` array and note all epics with `status: "Pending Implementation"`
2. **Identify next epic by sequencing** — use the `critical_paths[]` section of the tracker to find the recommended next epic in order
3. **Verify dependencies** — check that all dependency epics (listed in the epic's `dependencies[]` array) are either `"Completed"` or `"In Progress"`
4. **Suggest the next epic** to the team with its epic ID, name, and recommended OpenSpec change name

Example workflow:
- Review tracker → Epic 1.3 (Transactions) is next in `critical_paths[0].path`
- Check dependencies → depends on 1.1 (Accounts, In Progress) and 1.2 (Upload Center, In Progress) ✓ okay to start
- Suggest: "Next epic: 1.3 Transactions — create `PF-005-transactions`"

---

## Tier sequencing rules

Tier 2 and above cannot start until their dependencies are stable:

| Rule | Details |
|---|---|
| **Tier 1 → Tier 2** | Tier 2 epics can start when all 5 Tier 1 epics are either `"In Progress"` or `"Completed"` |
| **Tier 2 → Tier 3** | Tier 3 epics can start when all Tier 1+2 dependencies are either `"In Progress"` or `"Completed"` |
| **Tier 3 → Tier 4** | Tier 4 epics can start when Tier 1+2+3 core epics are stable (see `critical_paths` for exact order) |

Always check the epic's `dependencies[]` array — if any dependency is `"Pending Implementation"`, that epic cannot start yet.

---

## What NOT to do (Forbidden)

- ❌ **Mark an epic "Completed" without QA signoff** — only QA engineer can set this status
- ❌ **Start an epic (set In Progress) without creating an openspec change folder** — status must match reality
- ❌ **Leave the tracker un-updated after creating or archiving a change** — this defeats the purpose
- ❌ **Use any status value other than the three defined above** — no partial, provisional, or custom states
- ❌ **Set `started_at` or `completed_at` in the future** — use today's date only
- ❌ **Move a change to archive without updating the tracker first** — tracker update must precede (or accompany) the move

---

## Real-world example

**Scenario:** Agent starts Epic 1.2 (Upload Center).

1. Agent creates folder: `openspec/changes/PF-004-upload-center/`
2. Agent writes `proposal.md`, `tasks.md`, `handoff.md`
3. **Agent IMMEDIATELY updates the tracker:**
   ```yaml
   - id: "1.2"
     name: "Upload Center"
     ...
     status: "In Progress"
     openspec_change_name: "PF-004-upload-center"
     started_at: "2026-05-09"
     completed_at: null
   ```
4. Weeks later: QA signs off, all tasks done, change archived
5. **QA/DevOps agent updates the tracker before archiving:**
   ```yaml
   - id: "1.2"
     ...
     status: "Completed"
     started_at: "2026-05-09"
     completed_at: "2026-05-20"
   ```
6. Agent reads tracker → Epic 1.3 (Transactions) is next in `critical_paths[0]`; dependencies OK → **suggest PF-005-transactions**

---

## Cross-reference

- **Rule files:** see `architecture_notes.` in the tracker for all `.claude/rules/` files that govern implementation
- **Coordination:** see `.claude/CLAUDE.md` for OpenSpec workflow and role routing
- **Change template:** see `openspec/changes/PF-001-foundations-cross-cutting/proposal.md` for the canonical change proposal format
- **Sequencing authority:** see `critical_paths[]` and `tier_summaries[]` in the tracker for the sequencing source of truth
