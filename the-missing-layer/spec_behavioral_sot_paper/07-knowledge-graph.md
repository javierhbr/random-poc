# The Knowledge Graph Layer

The proposal includes a lightweight behavioral and technical graph layer.

Tools like Graphify are attractive because they are:
- repository-native,
- lightweight,
- fast,
- version-control friendly,
- AI-friendly,
- and based on JSON structures instead of heavy databases.

---

# Graph Relationships

The graph can model relationships between:
- functionalities,
- specifications,
- components,
- APIs,
- business rules,
- tests,
- ownership,
- dependencies,
- flows,
- events,
- and ADRs.

Example relationships:

```txt
Feature → implemented_by → Component
Component → publishes → Event
Event → consumed_by → Component
Rule → validated_by → Test
Spec → modifies → Feature
ADR → constrains → Flow
```

This creates structured operational context for:
- humans,
- AI agents,
- impact analysis,
- dependency understanding,
- and enterprise reasoning.
