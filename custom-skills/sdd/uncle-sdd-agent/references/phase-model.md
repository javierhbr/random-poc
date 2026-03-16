# Phase Model

The default workflow is:

```text
[Platform] -> [Assess] -> [Specify] -> [Plan] -> [Deliver]
```

Iteration rollout:

```text
Iteration 1
[Platform] -> [Assess] -> [Specify]

Iteration 2
[Plan] -> [Deliver]
```

Platform phase has an embedded sub-step:

```text
[Platform]
  1. Constitution + config + role map          (Speckit + OpenSpec + BMAD)
  1.5 Ownership artifacts                      (Architect, human-authored)
      - ownership/component-ownership-<name>.md
      - ownership/dependency-map.md
      - ownership/glossary.md
```

Assess phase reads the ownership artifacts:

```text
[Assess]
  1. Classify size + impact                    (BMAD)
  2. Confirm owner from component-ownership    (lookup)
  3. Read dependency-map -> populate impact tiers in platform-ref.yaml
  4. Open change package                       (OpenSpec)
```

Deliver flow:

```text
[Deliver]
  Build -> Create PR -> Review PR -> Verify -> Deploy -> Archive
  (PR notes tier 1/2 verification; archive flags ownership/tier changes)
```

Future option:

```text
[Plan] -> [Build] -> [Deploy]
```

Only split Build and Deploy when release coordination becomes large enough to
deserve its own phase.
