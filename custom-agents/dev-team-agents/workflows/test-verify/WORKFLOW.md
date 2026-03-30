---
id: test-verify
description: Verify a completed change against its acceptance criteria. Traces each criterion to a test or manual check, documents evidence, and produces QA signoff. Use after implementation is complete before deployment.
primary_role: qa
---

# workflow: test-verify

Verify a completed change against its acceptance criteria and produce evidence-based QA signoff. No deployment happens without this step.

## When to use
- Implementation is complete and handoff points to [role:qa]
- Verifying a bug fix before closing
- Running regression tests before a release

## Do not use when
- Implementation is not done yet — check `handoff.md` status first
- Acceptance criteria are missing — return to [role:po]

## Steps

### Step 1: Load context
1. Locate project via `~/coding-projects/project-map.yaml`
2. Read `openspec/changes/<change-id>/proposal.md` — extract all acceptance criteria
3. Read `openspec/changes/<change-id>/design.md` — API contracts to verify
4. Read `openspec/changes/<change-id>/handoff.md` — what was implemented, what changed

### Step 2: Map criteria to tests
For each acceptance criterion in `proposal.md`:

| Criterion | Test/Check | Type |
|-----------|-----------|------|
| Given X, when Y, then Z | `test/feature.test.ts:42` | Automated |
| Given A, when B, then C | Manual: navigate to screen, verify | Manual |

Identify gaps — criteria with no test coverage.

### Step 3: Execute
```bash
# Run automated tests
npm test               # Unit + integration
npm run test:e2e       # E2E if available
flutter test           # For mobile changes

# Check for regressions
git diff main -- package.json   # New dependencies?
npm audit                        # Security vulnerabilities?
```

For manual checks: follow the steps, observe the outcome, record the result.

### Step 4: Document evidence

Write verification results in `handoff.md`:

```markdown
## Verification Results: <change-id>

### Acceptance Criteria Coverage
| Criterion | Test/Check | Result | Notes |
|-----------|-----------|--------|-------|
| Given X, when Y, then Z | `test/feature.test.ts:42` | ✅ Pass | |
| Given A, when B, then C | Manual test | ✅ Pass | |
| Given error, when Z, then safe | `test/feature.test.ts:89` | ✅ Pass | |

### Regression
- [ ] All existing tests pass: ✅
- [ ] No new console errors: ✅
- [ ] API returns expected status codes: ✅
- [ ] DB migrations ran cleanly: ✅ / N/A

### API Contract Verification
- [ ] Endpoint matches design.md contract: ✅

### Gaps and Risks
- <anything not covered or uncertain>

### Signoff
**Verification status:** PASSED / FAILED
**Ready for deployment:** YES / NO
**Reason (if NO):** <what needs to be fixed>
```

### Step 5: Handle failures
If verification fails:
- Record the defect specifically (what failed, what was expected, what happened)
- Update `handoff.md` status to `failed`, owner back to the developer
- Record in `.ai/shared-memory/mistake-log.md` if it's an escaped defect pattern
- Do NOT give deployment signoff

### Step 6: Give signoff
If all criteria pass:
- Set `handoff.md` verification status to `passed`
- Set next owner to [role:devops]
- Write clear "Ready for deployment: YES" with summary

## Output
- Updated `handoff.md` with verification evidence and signoff
- `mistake-log.md` updated if defects found
- `lessons-learned.md` updated if reusable insight discovered

## Done when
- [ ] All acceptance criteria traced to a test or manual check
- [ ] Evidence documented per criterion
- [ ] Gaps and risks explicitly stated
- [ ] Deployment signoff is YES or NO with clear reason
- [ ] Handoff updated with next owner

## Rules
| Rule | Why |
|------|-----|
| No signoff without evidence | "I think it works" is not QA |
| Use criteria from proposal.md only | Don't invent acceptance criteria |
| Record every defect | The next team member deserves to learn from it |
| Block deployment if criteria fail | Protecting prod is the job |
