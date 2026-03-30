---
id: review-code
description: Conduct a structured code review covering correctness, security, performance, architecture alignment, and test coverage. Use when a PR is ready for review before merge.
primary_role: staff-fullstack
---

# workflow: review-code

Conduct a thorough, structured code review. Reviews are not approval stamps — they are mentoring opportunities and quality gates.

## When to use
- A PR is open and needs review before merge
- Checking implementation against the design document
- Reviewing for security, performance, or architecture concerns

## Do not use when
- The code has not been implemented yet — review happens after implementation
- You are reviewing your own code — get another agent or human to review

## Steps

### Step 1: Load context
1. Read `openspec/changes/<change-id>/proposal.md` — what should be built
2. Read `openspec/changes/<change-id>/design.md` — how it should be built
3. Read the PR diff or changed files

### Step 2: Review by lens

#### Lens 1: Correctness
- Does the implementation match the acceptance criteria in `proposal.md`?
- Does it match the API contracts in `design.md`?
- Are all acceptance criteria covered?
- Are edge cases handled (empty data, invalid input, concurrent access)?

#### Lens 2: Security
- SQL injection, NoSQL injection
- Authentication bypass (missing auth middleware)
- Sensitive data in logs or responses
- Input validation missing at API boundaries
- CORS misconfiguration
- Hardcoded secrets or credentials

#### Lens 3: Performance
- N+1 database query patterns
- Missing indexes on queried columns
- Unbounded queries (no pagination, no LIMIT)
- Large synchronous blocking operations
- Unnecessary re-renders in React components
- Bundle size impact from new dependencies

#### Lens 4: Architecture alignment
- Does it follow the patterns established in `design.md`?
- Are package/module boundaries respected?
- Is there separation of concerns (no business logic in route handlers)?
- Are new abstractions warranted, or is this premature?

#### Lens 5: Test coverage
- Are acceptance criteria covered by tests?
- Are error paths tested?
- Are tests readable and focused?
- Are there brittle tests that will break on unrelated changes?

#### Lens 6: Readability
- Are variable and function names clear and descriptive?
- Are non-obvious decisions explained with comments?
- Is the code structured logically?
- Are there dead code blocks or commented-out code?

### Step 3: Write structured feedback

For each issue found:
```
**[Lens] File:Line**
**What:** <describe the issue>
**Why:** <why it matters>
**How to fix:** <concrete suggestion>
**Severity:** blocking / non-blocking / suggestion
```

### Step 4: Give a verdict

```markdown
## Code Review: <change-id> / PR #<number>

### Summary
<1-2 sentence overall assessment>

### Blocking Issues (must fix before merge)
- [Security] `src/api/users.ts:42` — Missing input validation on `email` field. SQL injection risk. Add Zod schema validation.

### Non-blocking Issues (should fix)
- [Performance] `src/db/queries.ts:15` — N+1 query pattern in user list. Add eager load or batch query.

### Suggestions (optional improvements)
- [Readability] `src/utils/format.ts:8` — `x` is unclear. Rename to `formattedDate`.

### Verdict
- [ ] ✅ Approved — ready to merge
- [ ] 🔄 Approved with minor changes — fix non-blocking before merge
- [ ] ❌ Changes requested — fix blocking issues and re-review
```

## Output
- Structured review comments
- Clear verdict: approved / changes requested

## Done when
- [ ] All six lenses checked
- [ ] Blocking issues clearly labeled
- [ ] Feedback is actionable (what + why + how)
- [ ] Verdict is explicit

## Rules
| Rule | Why |
|------|-----|
| Explain the why, not just the what | Developers learn from understanding context |
| Separate blocking from non-blocking | Reviewees need to know what stops the merge |
| No vague feedback | "This could be better" is not a review comment |
| Review against the spec | Check criteria from proposal.md, not your preferences |
