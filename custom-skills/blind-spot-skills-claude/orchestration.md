# Orchestration: where subagents make the analysis more independent

## The problem subagents solve

A single context that reads the artifact, forms a view, and then "red teams"
its own view is anchored. Its premortem will rediscover the issues it already
listed; its counterargument will be one it already knows how to answer. The
value of the adversarial passes comes from **not** knowing what the
orchestrator found. Subagents give each pass a clean context.

Independence comes from three things, in order of impact:
1. **Fresh context** — the subagent sees the artifact, not the orchestrator's findings.
2. **A narrow, different question** — "why did this fail?" is not "what is missing?"
3. **A different model** — reduces shared blind spots between passes.

If you can only get one, get fresh context.

## Which steps run where

| Step | Runs in | Why |
|---|---|---|
| 0 Author context | Orchestrator | Needs the conversation with the user |
| 1 Understand | Orchestrator | Establishes the frame everything else uses |
| 2 Lenses | Orchestrator | Judgement about the artifact type |
| 3 Find blind spots | Orchestrator | Baseline analytical pass |
| 4a/4b Premortem + success stress | **Subagent** | Must not be anchored on Step 3 |
| 4c Outsider questions | **Subagents**, one per persona, in parallel | Each persona is a distinct frame; mixing them in one context blurs them |
| 4d Red team | **Subagent**, different model if possible | The pass where anchoring costs the most |
| 5 Merge + materiality | Orchestrator | Needs everything, including author context, to judge materiality |
| 6 Dispositions | Orchestrator | A disposition needs the author's constraints |
| 7 Calibration + record | Orchestrator | Conversation with the user |

Do not send Step 3 findings, severities, or the Current Frame paragraph to any
subagent. Do send the Step 0 exclusions — a subagent that flags something the
author already rejected wastes the merge step.

## What each subagent receives

Common payload:
- The artifact, verbatim (or the relevant part if very long)
- Artifact type and the one-sentence objective (Step 1) — this is frame,
  not findings, and prevents the subagent from misreading the artifact
- The Step 0 list: "already considered and rejected", "out of scope", prior
  Disposition Record
- Its role prompt from `agents/`
- A hard cap on output (e.g., 3 items) — this is the blind spot budget applied at the source

Do **not** include: the orchestrator's candidate blind spots, other
subagents' outputs, or the intended severity scale.

## Model selection

- **Orchestrator:** the most capable model available. Merge and materiality judgement is the hardest step.
- **Red team:** a different model family or, failing that, a different model in the same family, run at a somewhat higher temperature. If only one model exists, still use a fresh context — that is most of the benefit.
- **Premortem / stress test:** capable model; the question rewards imagination about failure paths.
- **Outsider personas:** a cheaper, fast model is fine; the value is in the perspective, not depth. Run them in parallel.

When a platform exposes only one model (e.g., Claude.ai without subagents),
see the fallback below.

## Merge rules (Step 5)

1. Normalise: rewrite each returned item as "<consideration> — <why it changes the outcome>".
2. Deduplicate across passes. Keep the clearest phrasing; record every source under "Surfaced by".
3. Convergence: an item raised independently by two or more passes gets one severity bump at most, and only if the orchestrator agrees it is material.
4. Drop anything on the Step 0 rejection list, unless a pass exposes a hole in the rejection reasoning — then report the hole, not the original item.
5. Apply the budget: 3–7 items total. If the red team's strongest objection did not survive materiality, say so explicitly in the Strongest Counterargument section rather than omitting the section — "the strongest remaining objection is X, and it is neutralised by Y" is a valid, useful result.

## Fallback without subagents (Claude.ai, single context)

Run the passes sequentially in the same context, but:
- Run 4a–4d **before** writing up Step 3 findings in full. Do the baseline lens pass only as brief notes, then the adversarial passes, then merge.
- For each pass, restate the role prompt and answer it as if the artifact were being seen for the first time. Do not reference earlier notes while answering.
- Mark the output header: "subagents: no — independence reduced". The user deserves to know the red team was not blind.

## Sanity checks on the orchestration

- If every subagent returns the same three items, the artifact probably has one dominant issue — report it once, not three times.
- If the red team returns nothing that survives merge, that is a finding ("no strong objection found") — do not manufacture one.
- If outsider personas return only questions the artifact already answers, the personas were chosen badly; pick stakeholders who bear consequences, not observers.
