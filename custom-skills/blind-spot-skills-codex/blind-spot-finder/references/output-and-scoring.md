# Materiality, Budget, and Output

Load this reference when ranking findings or producing the final report.

## Materiality Filter

For every candidate ask:

1. If this is wrong, does something important change?
2. Could it change the decision or approach?
3. Could it prevent the intended outcome?
4. Could it materially change implementation?
5. Could it create a substantially different outcome?
6. Would a knowledgeable outsider reasonably challenge it?
7. Has the artifact already addressed it?
8. Can it safely be explicitly excluded?

Discard low-materiality candidates.

## Blind Spot Budget

Blind-spot analysis is not an exercise in finding everything that could possibly be missing.

Default to the 3–7 highest-value blind spots.

- Fewer is better when fewer are sufficient.
- If one material blind spot exists, report one.
- Never invent findings to fill the budget.
- Exceed the budget only when omitting additional critical findings would materially misrepresent the risk.

Prioritize approximately by:

> Impact × Likelihood × Uncertainty × Irreversibility

This is a reasoning heuristic, not a required numerical formula.

## Root-Cause Compression

Combine findings that share the same underlying cause.

Prefer:

> Governance and ownership are undefined.

instead of separately listing approval process, escalation path, owner, and change authority when they are
symptoms of the same root blind spot.

## Severity

### CRITICAL

Could invalidate the approach or intended outcome.

### IMPORTANT

Could materially change implementation, interpretation, or results.

### CONSIDER

Worth evaluating but does not currently threaten the approach.

### EXPLICIT SCOPE

A legitimate consideration that can reasonably be excluded if the boundary is explicit.

## Dispositions

### RESOLVE

Investigate or modify the artifact before proceeding.

### ASSUME

Proceed with a documented assumption.

### OUT OF SCOPE

Consciously exclude the consideration and state the boundary.

### ACCEPT RISK

Acknowledge the issue and intentionally proceed.

Never leave a material finding as merely “something to think about.”

## Final Template

```markdown
# Blind Spot Analysis

## Understanding

Artifact:
Objective:
Audience:
Current frame:
Confidence:

## Top Blind Spots

### [CRITICAL | IMPORTANT | CONSIDER] — Name

Why it matters:

Evidence or absence observed:

Hidden assumption / unknown:

What changes if this is wrong:

Recommended disposition:
RESOLVE | ASSUME | OUT OF SCOPE | ACCEPT RISK

Suggested assumption / scope / action:

## Hidden Assumptions

...

## Premortem

...

## Success Stress Test

...

## Strongest Independent Challenge

...

## Outsider Questions

...

## Recommended Decisions

...

## Verdict

No material blind spots found | Safe with explicit assumptions |
Important blind spots should be resolved | Critical blind spot threatens the approach
```

## Valid No-Finding Result

The skill must be allowed to conclude:

> No material blind spots identified. Minor omissions were found, but none appear likely to change the
> decision, outcome, implementation, or credibility of the artifact.

Do not manufacture criticism to avoid this result.
