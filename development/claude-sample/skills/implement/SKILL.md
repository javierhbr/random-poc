---
name: implement
description: Implement a feature following the OpenSpec change spec. Reads proposal.md, design.md, and tasks.md before writing any code. Covers backend and frontend implementation with tests. Invoke with /implement.
---


# workflow: implement

Implement a feature end-to-end following the OpenSpec change specification. Always reads the spec before writing a single line of code.

## When to use
- Implementing a feature that has a `proposal.md` and (if complex) a `design.md`
- Starting implementation on an assigned task from `tasks.md`
- Resuming work after a handoff

## Do not use when
- `proposal.md` is missing — use /propose first
- Design is needed but `design.md` is missing — use /design-arch first
- Acceptance criteria are unclear — return to @product-owner

## Steps

### Step 1: Load full context
1. Locate project via ``
2. Read the full change folder:
   - `openspec/changes/<change-id>/proposal.md` — what to build
   - `openspec/changes/<change-id>/design.md` — how to build it (if exists)
   - `openspec/changes/<change-id>/tasks.md` — your specific task
   - `openspec/changes/<change-id>/handoff.md` — current state
3. Read `.ai/shared-memory/project-context.md` and `lessons-learned.md`
4. Explore existing code patterns in the area you're changing

### Step 2: Confirm scope and mark task in progress
- Identify your specific task(s) in `tasks.md`
- Confirm branch/worktree — one change per branch
- Verify no parallel owner is working on the same files
- Mark your task in progress:
```
openspec_task({ action: "task_update", changeId: "<change-id>", id: "<task-id>", status: "in_progress" })
```

### Step 3: Implement

**Backend:**
- Follow API contracts in `design.md`
- Follow existing project conventions for routing, middleware, error handling
- Write database migrations for schema changes
- Add input validation at API boundaries
- Handle error states explicitly

**Frontend:**
- Follow component architecture from `design.md`
- Use existing state management approach
- Handle loading, error, and empty states in every view
- Follow the project's styling system
- **Use `agent-browser` as the inner-loop tool** — open a `--session pf-dev` against `http://localhost:3000` and run `snapshot -i` / `screenshot --annotate` / `errors --json` after meaningful edits. See `.claude/rules/agent-browser-ui-testing.md` (Development workflow section).
- **Before marking the frontend task done**, run the agent-browser self-test sub-task (allocated by `/plan-change`) and save evidence to `tmp/qa/<change-id>/dev-*.png`. Reference these paths in the task comment when calling `task_update status: done`.

**General:**
- Small, focused commits: one concern per commit
- No silent contract changes without notifying @qa-engineer and @tech-lead
- Document non-obvious decisions with inline comments

### Step 4: Write tests
Write tests **before** marking the task done:
- Unit tests for business logic
- Integration tests for API endpoints (happy + error paths)
- Component tests for interactive UI
- Edge cases: empty data, invalid input, concurrent access

```bash
npm test              # or equivalent
npm run test:watch    # during development
```

### Step 4b: Mark task done and log activity
After all tests pass:
```
openspec_task({ action: "task_update", changeId: "<change-id>", id: "<task-id>", status: "done" })

openspec_task({
  action: "task_comment",
  changeId: "<change-id>",
  id: "<task-id>",
  role: "sr-fullstack",
  content: "<brief summary of what was implemented and any notable decisions>"
})
```

### Step 5: Update handoff
Update `openspec/changes/<change-id>/handoff.md`:
```markdown
- **Owner:** @qa-engineer
- **Status:** implementation complete — <summary of what was done>
- **Branch/Worktree:** <branch>
- **Files changed:** <list key files>
- **API changes:** <any contract changes — notify QA and Tech Lead>
- **Schema changes:** <any migration applied>
- **Next step:** verification by @qa-engineer
- **Verification status:** pending
```

### Step 5b: Transition phase state
After handoff.md is updated:
```
openspec_change({ action: "transition", projectCode: "<code>", changeId: "<id>" })
```
This advances from `implementation` → `verification`. Prerequisite: `handoff.md` must have content.

### Step 6: Prepare PR
- PR title: `[<change-id>] <brief description>`
- PR description: what changed, why, how to verify, link to `proposal.md`
- Ensure all tests pass before marking ready for review

## Output
- Implemented code with tests
- Updated `handoff.md` pointing to @qa-engineer
- PR ready for review

## Done when
- [ ] All acceptance criteria from `proposal.md` are implemented
- [ ] Tests are written and passing
- [ ] No silent API or schema changes without team notification
- [ ] Handoff updated with what changed and next owner
- [ ] PR description is complete and clear

## Common mistakes to avoid
| Mistake | Fix |
|---------|-----|
| Implementing without reading design.md | Always read design.md first |
| Skipping error state handling | Every happy path needs a sad path |
| Changing API contract without telling QA | Update handoff with contract changes |
| Large monolithic commit | One concern per commit |
| Marking done without running tests | Run full test suite before handoff |
