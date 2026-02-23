# Inter-Service Communication Contracts

> Version: 1.0.0 | Applies when: integration, touches_events, touches_apis

---

## MUST

- **MUST** version all events and APIs from day one (v1, v2...)
- **MUST** use additive-only changes for backwards compatibility (add fields, never remove or rename)
- **MUST** maintain deprecated versions for a minimum 90-day window
- **MUST** document all consumers of an event or API before making changes
- **MUST** run consumer contract tests before publishing a new version
- **MUST** use UUIDs as identifiers in all cross-service payloads
- **MUST** include `event_id`, `event_type`, `occurred_at`, `version` in all domain events
- **MUST** make all mutation operations idempotent using an idempotency key

## Event Schema Rules

```yaml
# Every domain event MUST follow this envelope
envelope:
  event_id: UUID          # unique, stable
  event_type: string      # PascalCase, e.g. CartUpdated
  version: string         # semver, e.g. "1.0.0"
  occurred_at: ISO8601
  producer: string        # service name
  payload: object         # event-specific data
```

## API Rules

- **MUST** use RESTful conventions: nouns for resources, HTTP verbs for actions
- **MUST** return RFC 7807 Problem Details for errors
- **MUST** document with OpenAPI 3.x spec
- **MUST** use pagination for any list endpoint (cursor-based preferred)
- **SHOULD** support conditional requests (ETag, If-None-Match) for cacheable resources

## Breaking Change Policy

A breaking change is:
- Removing or renaming a field in an event or API response
- Changing a field type
- Changing required/optional semantics
- Removing an endpoint

Breaking changes MUST:
1. Create a new version (v2)
2. Produce a Contract Change Spec (CCH-XXX)
3. Notify all consumers
4. Run in parallel with old version for 90 days minimum
5. Get sign-off from platform-team
