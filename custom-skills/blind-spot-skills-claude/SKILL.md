---
name: blind-spot-finder
description: >
  Find the material considerations that are absent from the author's current
  frame in any artifact — idea, plan, task, proposal, decision, strategy,
  architecture or technical design, PRD, article, post, paper, and especially
  specs written for spec-driven development (spec.md / requirements / design /
  plan / tasks). Surfaces hidden assumptions, missing perspectives,
  dependencies, failure modes, second-order effects, evidence gaps, ambiguity,
  incentives, and scope omissions, then forces each one into a decision:
  resolve, assume, exclude, or accept risk. Use this whenever the user asks
  "what am I missing", "what haven't I thought of", "poke holes in this",
  "premortem", "red team this", "before I ship / publish / present / commit",
  "review my spec before implementation", or wants an independent adversarial
  read — even if they don't say "blind spot". Do NOT use for generic editing,
  summarising, or improving what is already present.
---

# Blind Spot Finder

## Purpose

Find important things the author has not considered. Do not review,
summarise, rewrite, or polish what is already there — that is a different job.
Focus on what is **absent from the current frame**.

A blind spot is a material consideration that could change the
interpretation, decision, implementation, outcome, risk, or credibility of the
artifact. "Material" is the filter: a consideration is not a finding merely
because it exists.

**Optimisation function:** find the smallest number of missing considerations
with the greatest potential to change the outcome. If you find 27 issues and
only 4 could realistically change the author's decision, deliver the 4.

## The two questions that define this skill

> What might be important here that is absent from the current frame?

> What would a smart outsider ask that the author would be surprised they
> hadn't considered?

## Choose a mode first

| Mode | When | What runs |
|---|---|---|
| **Light** | Short artifact (task, idea, short post), or user wants a quick pass | Steps 0–3, then Top 3 with dispositions. No subagents. |
| **Full** | Plan, design, spec, paper, decision, anything the user is about to commit to | All steps, independent passes via subagents when available (see `references/orchestration.md`). |

Default to Full when the artifact is something the user will ship, publish,
present, or build from. Say which mode you chose in the output header.

## Step 0 — Capture what the author already considered

This is the step the original design was missing. "Absent from the frame"
presupposes knowing what the author already evaluated and rejected. Without
it, the skill flags things that were consciously excluded and wastes the
user's attention.

Before analysing, ask (or extract from the conversation / linked documents):

- What alternatives did you already consider and discard, and why?
- What is intentionally out of scope?
- Has a previous blind-spot pass been run? If so, obtain its dispositions.
- Who is the audience and what decision does this artifact drive?

If the user does not want to answer, proceed and mark the gap as an
**UNKNOWN**, not as an assumption. Anything the author says was "considered
and rejected" is not a blind spot; it can only reappear if the rejection
reasoning itself has a hole, and then it is reported as such.

## Step 1 — Understand the artifact

Determine: artifact type, objective, audience, decision being pursued,
explicit constraints, stated scope, known facts, stated assumptions. Do not
invent missing context. When context is unavailable, represent it as an
assumption or unknown. Then read the matching section of
`references/artifact-lenses.md` — and for specs, `references/spec-blind-spots.md`.

## Step 2 — Select lenses, not all of them

Pick the lenses the artifact type warrants: framing, assumptions, missing
actors, dependencies, inputs/outputs, failure modes, edge conditions,
incentives and human behaviour, evidence, ambiguity, contradictions,
scalability, operability, security, sequencing, ownership, reversibility,
second-order effects, scope boundaries, maintenance and evolution.

Applying every lens mechanically produces the 35-item list this skill exists
to avoid.

## Step 3 — Find blind spots and classify what you know

For each candidate, label the underlying claim:

- **KNOWN** — supported explicitly by the artifact or available evidence
- **ASSUMED** — required to be true but not established
- **INFERRED** — reasonably derived but not stated
- **UNKNOWN** — cannot be determined with available information

Never silently convert UNKNOWN into ASSUMED.

## Step 4 — Independent passes (Full mode)

These passes are deliberately run with **fresh context** — a subagent that
sees the artifact and the Step 0 exclusions but *not* your Step 3 findings —
so they are not anchored on what you already noticed. When subagents are
unavailable, run them sequentially and state in the output that independence
was reduced. Full rationale, prompts, and model guidance:
`references/orchestration.md`. Prompt templates: `agents/`.

**4a. Premortem** (`agents/premortem.md`) — assume the artifact was followed
exactly as written and still produced a bad outcome. Use the artifact-specific
framing:
- Plan: why did execution fail?
- Task: it was marked complete, yet the outcome wasn't achieved. What was missing?
- Article: knowledgeable readers strongly rejected it. What did the author overlook?
- Design: why did it fail operationally or organisationally?
- Decision: why did it produce an unexpected result?
- Spec: it was implemented exactly as specified and the stakeholder said "that's not what I meant". What did the spec leave to interpretation?

**4b. Success stress test** (same agent as 4a, second question) — what
happens if this succeeds far more than expected? Look for scaling,
operational burden, new dependencies, changed incentives, governance,
maintenance, downstream consequences.

**4c. Outsider questions** (`agents/outsider.md`) — one agent per
perspective, 2–4 perspectives chosen from the artifact's actual stakeholders
(operator, security, finance, legal, support, newcomer, adversary, future
maintainer, downstream consumer). Each returns its strongest 2–3 questions.

**4d. Red team** (`agents/red-team.md`) — assume the author is competent and
the artifact is generally strong. Find the single strongest objection that
still stands, and what evidence or change would neutralise it. Prefer a
different model family here when available; independence matters most in this
pass.

## Step 5 — Merge, deduplicate, and apply the materiality filter

You are the orchestrator. Merge your own findings with the returned passes.
When two passes independently surface the same issue, that convergence is
itself evidence of materiality — note it. Discard anything that would not
change the outcome. Rank:

- 🔴 **CRITICAL** — could invalidate the approach or desired outcome
- 🟠 **IMPORTANT** — could materially change implementation, interpretation, or results
- 🟡 **CONSIDER** — worth evaluating, does not currently threaten the approach
- ⚪ **EXPLICIT SCOPE** — legitimate consideration that can reasonably be excluded

Deliver 3–7 blind spots. Severity is your proposal; the author calibrates it
(Step 7).

## Step 6 — Force a disposition, and propose all four honestly

Every material blind spot ends with one recommended disposition:

- **RESOLVE** — investigate or modify before proceeding
- **ASSUME** — continue under an explicit, documented assumption
- **OUT OF SCOPE** — exclude deliberately and state the boundary
- **ACCEPT RISK** — acknowledge and proceed on purpose

Write a concrete one-line draft for the recommended disposition — an
assumption statement, a scope boundary sentence, or a risk acceptance note.
Do not default to ASSUME: an assumption is the cheapest disposition and the
easiest to abuse. If RESOLVE is what an honest reviewer would pick, say so.

Never leave a major blind spot as "something to think about".

## Step 7 — Calibrate with the author and record state

After presenting, invite the author to confirm or downgrade each severity and
choose the disposition. Then produce a compact **Disposition Record** (see
output template). This record is the input to any future run on the same
artifact: a re-run must load it in Step 0 so decided items do not reopen
unless the underlying facts changed.

## Output

Use this template. Omit sections that had no material content rather than
padding them.

```markdown
# Blind Spot Analysis — <artifact name>

## Understanding
Mode: Light | Full (subagents: yes / no — independence reduced)
Artifact: ...
Objective: ...
Audience / decision: ...
Already considered by author (from Step 0): ...
Confidence in understanding: High | Medium | Low

## Current Frame
One paragraph: what the author is implicitly treating as the problem and the
solution space.

## Top Blind Spots

### 🔴 1. <name>
Why it matters: ...
Hidden assumption or unknown: (KNOWN / ASSUMED / INFERRED / UNKNOWN) ...
What could happen if ignored: ...
Surfaced by: orchestrator | premortem | outsider(<persona>) | red team  (list all; convergence = stronger signal)
Recommended disposition: RESOLVE | ASSUME | OUT OF SCOPE | ACCEPT RISK
Draft statement: "<one line the author can paste into the artifact>"

### 🟠 2. ...

## Hidden Assumptions
| Assumption | Status | Confidence | Impact if false |
|---|---|---|---|

## Premortem — "This failed because..."
1. ...

## Success Stress Test — "If this works far better than expected..."
...

## Strongest Counterargument (red team)
Objection: ...
What would neutralise it: ...

## Outsider Questions
- (<persona>) "What about ...?"

## Explicit Scope Candidates
Safe to consciously exclude: ...

## Recommended Decisions Before Proceeding
1. Resolve ...
2. State assumption ...
3. Mark ... out of scope

## Verdict
No material blind spots | Safe with explicit assumptions |
Important blind spots should be resolved | Critical blind spot threatens the approach
One or two sentences of justification.

## Disposition Record (fill after author calibration)
| # | Blind spot | Severity (final) | Disposition | Statement | Date |
|---|---|---|---|---|---|
```

## Measuring whether the skill worked

The skill is working if, after a run, at least one of these is true:
the author changed a decision, added an explicit assumption or scope
statement to the artifact, or rejected a finding with a reason that reveals
context you lacked (which improves Step 0 next time). If none of these
happen across several runs, the skill is producing noise — reduce the number
of findings, not increase it.

## Behaviour

- Be sceptical without being cynical. Do not manufacture problems.
- Do not confuse improvements with blind spots. Do not turn every unknown into a blocker.
- Challenge the frame, not just the implementation.
- Prefer questions that could change the decision over questions that add detail.
- Do not recommend solving something when explicitly excluding it is reasonable.
- Never reopen an item that has a recorded disposition unless facts changed; say why if you do.
- The goal is not to prove the artifact wrong. It is to make invisible assumptions visible so the author can decide consciously.

## Files

- `references/artifact-lenses.md` — which lenses to emphasise per artifact type
- `references/spec-blind-spots.md` — the spec-driven-development variant (read for any spec / requirements / design / tasks document)
- `references/orchestration.md` — where and why to use subagents, model choice, merge rules, fallback without subagents
- `agents/premortem.md`, `agents/outsider.md`, `agents/red-team.md` — subagent prompt templates
