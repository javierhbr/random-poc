# Meadows System Analysis Plugin

A deliberately small plugin surface for understanding complex topics with the **Iceberg Model**, **System Dynamics**, and **Donella Meadows leverage points**.

The plugin is designed to coexist with large agent environments. Instead of installing many common command and skill names, it exposes:

```text
1 command
3 parameterized skills
6 shared reference files
```

## Why this structure?

The earlier design had separate commands such as `iceberg`, `trace-flow`, `find-loops`, and `find-leverage`. That is convenient in isolation but noisy in a real harness where users may already have dozens of commands and skills.

Version 0.2 uses a recognizable namespace:

```text
/meadows ...
```

and moves specialization into the `action` parameter.

---

# Command

## `/meadows`

```text
/meadows <topic> action=<action> depth=<depth> focus=<focus>
```

### Actions

| Action | Use it for |
|---|---|
| `understand` | Complete analysis; default |
| `map` | Upstream/input/output/downstream orientation |
| `iceberg` | Events → Patterns → Structure → Mental Models |
| `trace` | Follow information/value/work end to end |
| `loops` | Reinforcing and balancing loops |
| `leverage` | Find high-leverage interventions |
| `challenge` | Attack assumptions and causal claims |
| `compare` | Compare intervention candidates |

### Common parameters

```text
action=understand|map|iceberg|trace|loops|leverage|challenge|compare
depth=quick|standard|deep
focus=<optional lens>
context=<current state / constraints>
goal=<desired outcome or decision>
evidence=<known facts or source material>
format=markdown|compact|json
```

---

# Skills

Skills are prefixed to minimize naming collisions.

### `meadows-analysis`
Frames the system, maps upstream/input/output/downstream, and applies the Iceberg Model.

### `meadows-dynamics`
Analyzes stocks, flows, reinforcing/balancing loops, delays, and constraints.

### `meadows-leverage`
Derives and compares interventions from the system model rather than from generic advice.

The skills stay intentionally short. Detailed method instructions live in `/references`, so improvements can be made once and reused everywhere.

---

# Examples

## 1. Understand something

### Prompt

```text
/meadows Why do software releases keep getting slower?
```

### Expected result

```text
System: software delivery flow from accepted work to production.

Context:
Product demand → planned work → development → review → test → deployment → customer outcome

Iceberg:
Events: recent releases missed expected dates.
Patterns: cycle time and WIP have increased over several iterations.
Structure: parallel initiatives, review queues, shared dependencies, delayed feedback.
Mental models: "keeping everyone busy maximizes productivity."

Dynamics:
R1 Pressure loop:
missed dates → pressure → more work started → WIP → context switching → slower delivery → missed dates

Evidence gaps:
Need historical WIP, cycle-time, and queue-time data before treating R1 as confirmed.
```

## 2. Map where something sits

### Prompt

```text
/meadows customer eligibility service action=map depth=quick
```

### Expected result

```text
Purpose: decide whether a customer satisfies product eligibility policy.
Upstream: customer/account data providers + tenant policy configuration.
Input: customer identifiers and policy context.
Transformation: retrieve facts → evaluate policy → produce decision.
Output: eligibility decision + reason/context.
Downstream: application or offer flow.
Outcome: product is shown, denied, or routed differently.
Impact: customer experience, risk/compliance, conversion, revenue.
Dependencies: identity, data providers, policy configuration, availability of required facts.
```

## 3. Analyze feedback loops

### Prompt

```text
/meadows technical debt action=loops focus=delivery depth=deep
```

### Expected result

```text
R1 Delivery-pressure loop:
pressure ↑ → shortcuts ↑ → debt ↑ → change cost ↑ → delivery speed ↓ → missed commitments ↑ → pressure ↑

B1 Refactoring loop:
pain visibility ↑ → refactoring priority ↑ → debt reduction ↑ → change cost ↓

Delay:
The cost of shortcuts appears later, while the delivery benefit appears immediately.

Interpretation:
The delay biases the organization toward the reinforcing loop unless refactoring receives an explicit signal/rule.
```

## 4. Find leverage points

### Prompt

```text
/meadows our team has high WIP and missed deadlines action=leverage context="12 engineers, 4 concurrent initiatives" goal="reduce cycle time"
```

### Expected result

```text
Candidate: WIP policy / pull rule
Mechanism: reduces work entering the active stock faster than completion capacity.
Chain:
WIP limit → fewer parallel tasks → less context switching → shorter queues → faster feedback → shorter cycle time

Potential blocker:
Leadership continues injecting urgent work outside the rule.

Counter-loop:
Perceived idle capacity may trigger pressure to start more work.

Validation:
Track active WIP, queue time, and median cycle time for several delivery cycles.
```

## 5. Challenge the model

### Prompt

```text
/meadows "high WIP causes our slow delivery" action=challenge
```

### Expected result

```text
Claim: high WIP → slow delivery
Status: hypothesis unless queue/cycle-time evidence is supplied.

Alternative explanations:
- unstable requirements
- slow external dependency
- review bottleneck
- test-environment scarcity

Discriminating evidence:
Compare cycle time against WIP and queue time by workflow stage.
```

## 6. Compare two interventions

### Prompt

```text
/meadows "limit WIP vs add two engineers" action=compare goal="reduce delivery cycle time"
```

### Expected result

```text
Limit WIP:
Changes a system rule and queue behavior; fast feedback; reversible.

Add engineers:
Changes capacity, but may increase coordination load and does not necessarily change intake pressure.

Preferred hypothesis:
Test WIP limits first if current evidence shows work is waiting rather than capacity being continuously constrained.
```

---

# Reference layout

```text
references/
├── framework.md        # Context map + Iceberg backbone
├── analysis-modes.md   # action semantics
├── dynamics.md         # stocks, flows, loops, delays
├── leverage.md         # leverage derivation and ranking
├── evidence.md         # observed/inferred/assumed discipline
└── output-contract.md  # consistent response shape
```

This separation is intentional: commands route, skills reason, references teach the method.

---

# Design principle

```text
Few commands.
Few skills.
Parameterized behavior.
Unique names.
Shared references.
No duplicated methodology.
```
