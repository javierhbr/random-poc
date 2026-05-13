# OpenSpec Task Completion Rule

When completing a story in any PF-NNN change, three files MUST be updated in sync:

## Checklist: Story Completion

| File | Update | Example |
|------|--------|---------|
| **Code** | Implement feature, write tests, verify build | `git commit feat(PF-005): Story 1 - Models` |
| **`handoff.md`** | Mark story status ☑, document what was done | Update "Data Model (Story 1)" section |
| **`tasks.md`** | Mark acceptance criteria `[x]`, check off "What to do" | Convert `- [ ]` to `- [x]` |

## Order of Commits

```
1. git commit feat(PF-NNN): Story N - Implementation
   └─ Code + tests go in here

2. git commit docs(PF-NNN): Mark Story N complete in handoff
   └─ handoff.md status + acceptance criteria met

3. git commit docs(PF-NNN): Mark Story N acceptance criteria complete in tasks.md
   └─ tasks.md checkboxes + "What to do" items
```

## Why All Three

- **Code commit** = implementation is done
- **handoff.md** = blocks downstream stories (shows dependencies satisfied)
- **tasks.md** = team visibility (shows progress on the epic)

Without all three, the change's state is incomplete and other agents can't see the story is truly ready for the next phase.

## Forbidden

- ❌ Update only `handoff.md` without `tasks.md` — visibility is lost
- ❌ Update only code commit without either — state is ambiguous
- ❌ Mark a story done before tests pass — acceptance criteria not met

## See Also

- `.claude/CLAUDE.md` — OpenSpec change workflow
- `openspec/changes/PF-NNN-<slug>/proposal.md` — acceptance criteria source of truth
