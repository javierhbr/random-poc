# Platform and Component Alignment

Use this reference when the platform has:

- one master repository for shared platform truth
- many component repositories for local implementation
- JIRA for delivery coordination

Core model:

```text
[Platform master repo]
  canonical platform truth
  + ownership/component-ownership-<name>.md  (one per component)
  + ownership/dependency-map.md              (one platform file)
  + ownership/glossary.md                    (one platform file)
        |
        v
[Component repo]
  versioned alignment + local OpenSpec artifacts
  + platform-ref.yaml (ownership + impact tiers)
  + jira-traceability.yaml
        |
        v
[JIRA]
  platform issue -> component epic -> stories -> PRs
  (structure driven by dependency map impact tiers)
```

Key rules:

- platform truth stays upstream in the master repo
- component repositories pin the platform version they align to
- OpenSpec artifacts stay local to the component repository
- JIRA links the delivery chain but does not replace the specs
- ownership boundaries are confirmed before any JIRA epic is opened (rule O-1)
- impact tiers from the dependency map drive JIRA structure, not team judgment (rule O-3)
- all terms in proposals and acceptance criteria must appear in the glossary (rule O-2)

Detailed methodology references:

- `../../unified-sdd-methodology/canonical-platform-truth-and-component-alignment.md`
- `../../unified-sdd-methodology/platform-ddd-spec.md`
- `../../unified-sdd-methodology/decisions/ADR-014-three-concept-ddd-for-platform-ownership-and-impact.md`

Template references:

- `../../unified-sdd-methodology/templates/README.md`
- `../../unified-sdd-methodology/templates/platform-template/README.md`
- `../../unified-sdd-methodology/templates/platform-template/ownership/component-ownership-template.md`
- `../../unified-sdd-methodology/templates/platform-template/ownership/dependency-map-template.md`
- `../../unified-sdd-methodology/templates/platform-template/ownership/glossary-template.md`
- `../../unified-sdd-methodology/templates/component-boilerplate/README.md`
- `../../unified-sdd-methodology/templates/platform-ref.yaml`
- `../../unified-sdd-methodology/templates/jira-traceability.yaml`
