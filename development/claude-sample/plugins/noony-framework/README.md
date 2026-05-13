# noony-framework Plugin

Complete skill set for the Noony Serverless Framework — type-safe Cloud Functions with middleware chains, dependency injection, Zod validation, error handling, testing, and performance optimization.

## Installation

This plugin is auto-discovered as a project-local plugin. No registration required.

## Usage

### Skills (slash commands)

Invoke via `/noony-framework:<skill-name>` or `@noony-framework:<skill-name>`:

| Skill | Command | When to use |
|-------|---------|-------------|
| Entry point & routing | `/noony-framework:uncle-noony` | Start here — routes you to the right skill |
| Middleware ordering | `/noony-framework:middleware-ordering` | Canonical handler chain order |
| Middleware development | `/noony-framework:middleware-development` | Build custom middleware |
| Error handling | `/noony-framework:error-handling` | Typed errors, cause chaining |
| Type inference | `/noony-framework:type-inference` | `<TBody, TUser>` generics flow |
| Validation schemas | `/noony-framework:validation-schemas` | Zod schemas, parsedBody/validatedBody |
| Dependency injection | `/noony-framework:dependency-injection` | ContainerPool, global/local scopes |
| Dependency initialization | `/noony-framework:dependency-initialization` | Singleton guard, concurrent-safe init |
| Guard system | `/noony-framework:guard-system` | RBAC, RouteGuards, permissions |
| Path parameters | `/noony-framework:path-parameters` | Route params, UUID/numeric parsing |
| Testing handlers | `/noony-framework:testing-handlers` | executeGeneric, mock factories, DI mocking |
| Performance optimization | `/noony-framework:performance-optimization` | Cold start, lazy/eager init, connection pooling |
| Complete dual-entry | `/noony-framework:complete-dual-entry` | Production pattern: Fastify + Cloud Functions |
| Create Fastify server | `/noony-framework:create-fastify-server` | Local dev server from scratch |
| Convert to Fastify | `/noony-framework:convert-cloud-functions-to-fastify` | Migrate existing Cloud Functions |
| Custom adapter | `/noony-framework:custom-adapter` | Koa/Hapi/NestJS or rawBody in Fastify routes |

### Agent

The `uncle-noony` agent orchestrates all skills and handles open-ended Noony questions:

```
@uncle-noony help me set up a new handler with auth and validation
@uncle-noony how do I test my handler with mocked services?
@uncle-noony convert this Cloud Function to work locally with Fastify
```

## Quick Start Decision Tree

```
New project?
  → /noony-framework:complete-dual-entry

Existing Cloud Functions to migrate?
  → /noony-framework:convert-cloud-functions-to-fastify

Just need a local dev server fast?
  → /noony-framework:create-fastify-server

Non-Fastify framework OR need rawBody in Fastify?
  → /noony-framework:custom-adapter

Not sure where to start?
  → @uncle-noony <describe what you're trying to do>
```

## Canonical Middleware Order

Every Noony handler MUST follow this order:

```
1. ErrorHandlerMiddleware       ← MUST be first
2. OpenTelemetryMiddleware      ← wraps full request
3-5. Header/structural checks   ← cheap fast-fail
6. BodyParserMiddleware         ← MUST precede BodyValidation
7. BodyValidationMiddleware     ← needs parsed body from position 6
8. PathParametersMiddleware     ← before auth guards
9-12. Auth middlewares          ← FirebaseAuth, OAuth2, RouteGuard
13+. DI / business logic        ← DependencyInjectionMiddleware
Last. ResponseWrapperMiddleware ← MUST be last
```

See `/noony-framework:middleware-ordering` for the full reference.
