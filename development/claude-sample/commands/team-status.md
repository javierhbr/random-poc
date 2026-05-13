Show the current status of all active changes and team assignments.

Read the following files and produce a summary:
1. `` — list all active projects
2. For each active project, read `.ai/shared-memory/current-focus.md`
3. For each active change listed, read `openspec/changes/<change-id>/handoff.md`

Output a status table:

```
## Team Status — <date>

### Active Projects
| Project | Code | Status |
|---------|------|--------|
| ... | ... | active |

### Active Changes
| Change ID | Project | Current Owner | Status | Blocked? | Next Step |
|-----------|---------|---------------|--------|----------|-----------|
| ... | ... | <agent> | in-progress | No | ... |

### Blockers
List any changes with "Blocked on" that is not "nothing".

### Idle (no active changes)
List projects with no changes in flight.
```

If no `current-focus.md` exists for a project, note it as "no active changes".
If a `handoff.md` is missing for a listed change, flag it as "handoff missing — needs update".
