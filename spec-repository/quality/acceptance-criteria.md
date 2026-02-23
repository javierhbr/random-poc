# Global Acceptance Criteria Standards

> Version: 1.0.0

---

## Format

Use one of these two formats for all ACs:

### Given/When/Then
```
Given [a specific context or precondition]
When [the user/system takes an action]
Then [the expected observable outcome]
```

### AC-NNN Label
```
AC-001: [One sentence describing the verifiable outcome]
```

## Quality Bar for ACs

A good AC is:
- **Specific**: refers to a concrete action and observable outcome
- **Testable**: a QA engineer can write a test for it without ambiguity
- **Independent**: can be verified without depending on another AC being tested first
- **Bounded**: describes one thing, not multiple

A bad AC is:
- "The feature works correctly" — not testable
- "Performance is good" — not specific (use NFRs for this)
- "Users can manage their saved items" — too broad, break into multiple ACs

## Minimum AC Count by Change Type

| Change Type | Minimum ACs |
|-------------|-------------|
| new_feature | 3 |
| integration | 2 |
| migration | 2 |
| bug_fix | 1 |
| refactor | 1 |

## Edge Cases

Every spec SHOULD include ACs for:
- The happy path
- At least one error/failure path
- At least one boundary condition
