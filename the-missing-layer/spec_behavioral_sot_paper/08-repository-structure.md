# Proposed Repository Structure

```txt
/spec
  /current-behavior
    platform.md
    components/
      order-service.md
      payment-service.md
      marketplace-sync.md

  /changes
    2026-001-freeze-marketplace/
      proposal.md
      design.md
      tasks.md
      impact.md

  /decisions
    adr-001-region-routing.md
    adr-002-event-contracts.md

  /traceability
    features.yaml
    rules.yaml
    flows.yaml

  /graph
    graph.json
```

---

# Current Behavior Spec Example

```md
# Component: Marketplace Sync

## Current Responsibility

Describes what this component is responsible for today.

## Active Behaviors

- Pull marketplace orders
- Respect frozen account status
- Publish order digest events
- Skip disabled customers

## Business Rules

- Frozen accounts must not sync
- First-time setup can trigger 90-day sync
- Regional pullers must call marketplace APIs

## Supported Flows

- Scheduled sync
- Manual first sync
- Freeze/unfreeze lifecycle
- Tracking update event flow

## Active Contracts

- Input events
- Output events
- APIs consumed
- APIs exposed
```
