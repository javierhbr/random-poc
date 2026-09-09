# Materiality, Blind Spot Budget, and Output

## Materiality Filter

For each candidate ask:

1. If this assumption is false, does anything important change?
2. Could this change the decision or approach?
3. Could this prevent the intended outcome?
4. Could it materially change implementation?
5. Could it create a substantially different outcome?
6. Would a knowledgeable outsider reasonably challenge it?
7. Is it already addressed elsewhere?
8. Can it safely be made explicit and excluded?

Discard low-materiality candidates.

## Prioritization Heuristic

Use approximately:

**Impact × Likelihood × Uncertainty × Irreversibility**

This is a reasoning heuristic, not a required numerical formula.

A highly uncertain assumption with catastrophic consequences can rank above a likely but easily reversible issue.

## Blind Spot Budget

Default: **3–7 highest-value findings**.

Rules:

- fewer is better when fewer are sufficient
- one blind spot is valid if only one is material
- never invent findings to fill the budget
- exceed the budget only when omitting critical findings would misrepresent the situation

## Root-Cause Compression

Combine symptoms with the same underlying cause.

Prefer:

> Governance and ownership are undefined.

instead of separate findings for owner, approval, escalation, and change authority when they are symptoms of the same blind spot.

## Severity

### CRITICAL

Could invalidate the approach or intended outcome.

### IMPORTANT

Could materially change implementation, interpretation, risk, or results.

### CONSIDER

Worth evaluating but not currently outcome-threatening.

### EXPLICIT SCOPE

A legitimate consideration that can reasonably be excluded if the boundary is stated.

## Disposition Quality

### RESOLVE

Use when proceeding without clarification creates unacceptable uncertainty or risk.

### ASSUME

Use when proceeding is reasonable if the assumption is made explicit and testable where possible.

### OUT OF SCOPE

Use when the concern is valid but deliberately excluded. State the boundary and any dependency it creates.

### ACCEPT RISK

Use when the concern is understood and the cost of mitigation exceeds the benefit for the current decision.

## Recommended Output Shape

```markdown
# Blind Spot Analysis

## Understanding
Artifact:
Objective:
Audience:
Current frame:
Confidence:

## Top Blind Spots

### [SEVERITY] Name
Why it matters:
Evidence or absence observed:
Hidden assumption / unknown:
What changes if this is wrong:
Recommended disposition:
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
...
```

## Verdicts

Choose one:

- **No material blind spots found**
- **Safe with explicit assumptions**
- **Important blind spots should be resolved**
- **Critical blind spot threatens the approach**
