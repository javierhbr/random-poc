# Why EARS and LID Do Not Fully Solve the Problem

## EARS

EARS (Easy Approach to Requirements Syntax) is extremely effective at:
- writing structured requirements,
- reducing ambiguity,
- standardizing behavioral expressions,
- improving readability,
- and making requirements easier for humans and AI systems to interpret.

Example:

```txt
WHEN a marketplace account is frozen
THEN the poller SHALL stop processing synchronization jobs.
```

However, EARS is fundamentally requirement-centric.

It describes:
- intended behavior,
- desired behavior,
- or required behavior.

But it does not inherently define:
- what behavior is currently active,
- what requirements are deprecated,
- what functionality is partially implemented,
- or what subset of requirements represents operational reality today.

Repositories accumulate:
- active,
- obsolete,
- future,
- experimental,
- and superseded requirements.

EARS does not provide a native mechanism to separate:

## Current Operational Truth
from
## Historical Requirement History

---

## LID (Linked-Intent Development)

LID (Linked-Intent Development) gets significantly closer to this vision.

Reference:
https://github.com/jszmajda/lid

LID introduces:
- intent preservation,
- linked specifications,
- traceability,
- annotation-based relationships,
- and structured evolution tracking.

It creates continuity between:
- business intent,
- implementation,
- and evolution.

However, even LID still allows multiple temporal states to coexist:
- current functionality,
- future proposals,
- deprecated behavior,
- historical evolution,
- and experimental concepts.

This still forces:
- developers,
- architects,
- and AI agents

to reconstruct the actual current operational behavior of the system.

---

# Key Difference

The core difference introduced by this vision is the explicit separation between:

## Historical Evolution
and
## Current Operational State

The proposal is to maintain:
- specs for evolution,
- and a dedicated operational Source of Truth for current behavior.
