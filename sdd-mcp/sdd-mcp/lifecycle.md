# Lifecycle States and Transitions

## Spec States

```
Planned → Discovery → Draft → Approved → Implementing → Done
                                  ↓
                                Paused  ←──── (priority shift)
                                  ↓
                         [Rebase Context Pack]
                                  ↓
                               Approved (resume)

Blocked path:
Approved → Blocked  ←──── (ADR opens)
              ↓
           Approved  ←──── (ADR resolves)
              ↓
         Implementing
```

## ADR States

```
Proposed → In Review → Approved
                    → Rejected
```

## State Rules

| From | To | Trigger | Gate required? |
|---|---|---|---|
| Draft | Approved | PM + Architect review | All 5 gates PASS |
| Approved | Implementing | Fan-out task received | Gate 5 PASS (component level) |
| Implementing | Done | Implementation verified | — |
| Any | Paused | Priority shift | Freeze spec version, log decision note |
| Paused | Approved | Resume with new Context Pack | Regenerate Context Pack first |
| Approved | Blocked | ADR opens | — |
| Blocked | Approved | ADR resolves | — |

## Blocked ≠ Paused

- **Blocked**: spec is waiting for a technical decision (ADR). The ADR Owner must act.
- **Paused**: spec is waiting for business priority. The Product Manager must act.

## Fan-Out Task States (Platform → Component)

Each fan-out task is picked up by a component team. The task is:
- `Pending` until the component team creates their Component Spec
- `In Progress` while the Component Spec is being implemented
- `Done` when implementation is verified and Spec Graph is updated

## What "Rebase" means

When resuming a Paused spec:
1. Run the MCP Router: `generate context pack for <initiative-id>`
2. The new Context Pack may have updated policies, invariants, or contracts
3. Update the spec's `Context Pack:` field to the new version
4. Re-read each spec section and check if MCP sources have changed
5. Re-run /speckit.analyze to re-validate all gates against the new context
6. Only then: resume implementation
