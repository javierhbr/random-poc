---
description: Noony canonical middleware chain order — apply when composing or debugging a Noony handler pipeline.
globs: ["src/**/*.ts", "functions.ts", "server.ts"]
---

# Noony — Middleware Ordering Rules

Every Noony handler MUST follow this exact order:

| Position | Middleware | Rule |
|----------|-----------|------|
| 1 | `ErrorHandlerMiddleware` | MUST be first — catches all downstream errors |
| 2 | `OpenTelemetryMiddleware` | **REQUIRED as of change 028** in every Pub/Sub-consuming and HTTP handler in `packages/ebay-hooks`. Wraps full request including auth. Pass `{ shouldTrace: defaultShouldTrace }` from `@backyardcart/shared` to skip `/health*` paths. Tier-1 stance: W3C TraceContext only — do NOT add a `CompositePropagator` or the GCP-specific propagator (see `openspec/changes/028-pubsub-otel-trace-propagation/design.md` §Decision 3 / §Future Work). |
| 3–5 | Header/structural checks | Cheap fast-fail |
| 6 | `BodyParserMiddleware` | MUST precede BodyValidationMiddleware |
| 7 | `BodyValidationMiddleware` | Needs parsed body from position 6 |
| 8 | `PathParametersMiddleware` | Before auth guards |
| 9–12 | Auth middlewares | FirebaseAuth, OAuth2, RouteGuard |
| 13+ | DI / business logic | DependencyInjectionMiddleware, custom |
| Last | `ResponseWrapperMiddleware` | MUST be last |

Execution: `before` → 0→N, `after`/`onError` → N→0.

Inter-middleware state: use `context.businessData` Map — never modify Context interface.
Reserved key: `'otel_span'` — do not overwrite.
Response: choose ONE method — return value OR `context.res.json()`, never both.

## ProfitFlow foundations (PF-001) addendum

Foundations introduces four extra positions composed via `buildFoundationsChain()`:

| Position | Middleware | Notes |
|----------|-----------|-------|
| 5 | `RequestContextMiddleware` | Stashes `ipAddress`, `userAgent`, `requestId` into `businessData` so `AuditWriter` can default-fill them. |
| 6.5 | `IdempotencyMiddleware` | After `BodyParserMiddleware` (6), before `BodyValidationMiddleware` (7) — needs the parsed-but-unvalidated body to compute the SHA-256 collision hash. Replays cached responses for `Idempotency-Key` hits with matching body hash. |
| 11 | `RoleGuard` | After `JwtAuthMiddleware` (9). Reads `companyId` from path or query and looks up the active row in `userCompanyRoles`. Sets `companyId` and `userRole` in `businessData`. |
| 13.5 | `FilterPrecedenceMiddleware` | **After** `DependencyInjectionMiddleware` (13) — marketplace expansion requires Mongo. Enforces `accountId > marketplace` precedence and writes `FilterPrecedenceContext` to `businessData`. Fails closed with `FILTER_PRECEDENCE_NOT_READY` when the BankAccount model isn't registered (Tier 1 / Epic 1.1 ships it). |

Reserved `businessData` keys introduced by foundations: `'ipAddress'`, `'userAgent'`, `'requestId'`, `'userId'`, `'email'`, `'companyId'`, `'userRole'`, `'idempotency.cached'`, `'idempotency.request'`, `'filterPrecedence'`.
