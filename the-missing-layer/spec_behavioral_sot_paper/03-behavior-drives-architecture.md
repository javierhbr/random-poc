# Product Behavior Must Drive Architecture

A platform or system should ultimately implement and reflect what the business product defines.

Architectural artifacts such as:
- ADRs,
- non-functional requirements,
- high-level architecture,
- low-level architecture,
- design patterns,
- infrastructure decisions,
- scalability strategies,
- and implementation constraints

are all important from an engineering perspective.

However, they are not the primary concern.

The primary concern should always be:
- what the product is supposed to do,
- how the ecosystem behaves,
- how systems integrate,
- and why the behavior exists.

Architecture should support business behavior.

Business behavior should not be constrained by architecture patterns.

Patterns such as:
- Saga orchestration,
- Event-driven architecture,
- CQRS,
- distributed caching,
- messaging systems,
- Redis,
- microservices,
- streaming platforms

should not dictate product behavior.

Instead:

```txt
Business/Product Behavior
        ↓
Operational Expectations
        ↓
Functional Contracts
        ↓
Architecture and Implementation Choices
```

---

## Example

Migrating:
- from AWS to another cloud provider,
- from Oracle to NoSQL,
- or introducing Redis caching

may significantly change:
- infrastructure,
- deployment topology,
- scalability,
- latency,
- operational complexity,
- and implementation details.

But ideally, these changes should NOT alter:
- user expectations,
- business workflows,
- operational contracts,
- or functional behavior.

The behavior should remain stable while implementation evolves.
