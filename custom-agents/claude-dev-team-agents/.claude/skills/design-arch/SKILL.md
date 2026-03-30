---
name: design-arch
description: Produce an architecture design document for a complex change. Covers API contracts, DB schema, component architecture, security, and rollback plan. Use before implementation of any non-trivial change. Invoke with /design-arch.
---

# skill: design-arch

Produce a complete `design.md` for a complex change before any implementation begins. Good design documents prevent architecture drift, miscommunication between frontend and backend, and unsafe migrations.

## When to use
- New API surface or changed API contracts
- Database schema changes (new tables, migrations, index changes)
- New service or significant refactor
- Cross-package or cross-team impact
- Tech Lead or Staff developer explicitly requested

## Do not use when
- The change is a small UI tweak with no API or schema changes
- The change is a bug fix with no new surface area
- A design document already exists and is approved

## Steps

### Step 1: Load context
1. Locate project via `~/coding-projects/project-map.yaml`
2. Read `openspec/changes/<change-id>/proposal.md` for requirements
3. Read `.ai/shared-memory/project-context.md` and `decision-log.md`
4. Explore the relevant codebase: existing API routes, DB schema, component structure

### Step 2: Identify the design surfaces
Determine which of these surfaces the change touches:
- [ ] New or changed API endpoints
- [ ] New or changed database tables/columns/indexes
- [ ] New or changed UI components or state flow
- [ ] Authentication or authorization changes
- [ ] New external service integration
- [ ] Infrastructure changes

### Step 3: Write design.md

Create `openspec/changes/<change-id>/design.md`:

```markdown
# Design: <change-id>

## Summary
<One paragraph: what is being built, why, and key design decisions>

## API Contract
| Method | Path | Request Body | Response | Status Codes | Auth |
|--------|------|-------------|----------|--------------|------|
| POST | /api/v1/... | `{ field: string }` | `{ id: string }` | 201, 400, 401 | Bearer |

## Database Schema Changes
```sql
-- Migration: <timestamp>_<name>
CREATE TABLE ... (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_... ON ...(...);
```

## Component Architecture
```
<FeaturePage>
  ├── <FeatureList> — fetches and renders list
  │   └── <FeatureItem> — single item with actions
  └── <FeatureForm> — create/edit form
```
- State: <where state lives and how it flows>
- Data fetching: <how data is fetched: REST/tRPC/SWR/React Query>

## Security Considerations
- Authentication: <how the user is identified>
- Authorization: <who can do what>
- Input validation: <where and how>
- Sensitive data: <what data is sensitive and how it's handled>

## Performance Considerations
- Expected query cost: <describe query complexity>
- Bundle impact: <new dependencies or code splitting changes>
- Caching strategy: <if applicable>

## Rollback Plan
<Step-by-step: how to safely revert this change if it goes wrong>
- Down migration: `npm run migrate:down`
- Feature flag: <if applicable>
- Service rollback: `gcloud run services update-traffic ...`

## Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Migration data loss | Low | High | Run on copy first; backup before apply |

## Decisions
| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| Use REST not GraphQL | Existing codebase uses REST | GraphQL adds complexity |
```

### Step 4: Update decision-log
Add architecture decisions to `.ai/shared-memory/decision-log.md` for cross-cutting choices.

### Step 5: Hand off
Update `handoff.md`:
- Owner → `@dev-manager` or first implementation owner
- Status → design approved
- Next step → implementation

## Output
- `openspec/changes/<change-id>/design.md`
- Updated `.ai/shared-memory/decision-log.md` (for cross-cutting decisions)
- Updated `handoff.md`

## Done when
- [ ] API contracts are explicit with all methods, paths, request/response shapes, and status codes
- [ ] DB migrations are written (even if not applied)
- [ ] Component architecture is described
- [ ] Security considerations are addressed
- [ ] Rollback plan exists
- [ ] Decisions are documented with rationale

## Rules
| Rule | Why |
|------|-----|
| No implementation before design is approved | Prevents rework and architecture drift |
| All API changes explicit | QA and frontend need exact contracts |
| Rollback plan required | Every deploy must be reversible |
| Cross-cutting decisions in decision-log | Future developers need the rationale |
