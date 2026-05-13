---
name: noony-uncle-noony
description: Use this skill whenever a developer asks for help with the Noony framework, is confused about where to start, asks "how do I...", needs guidance picking the right approach, or mentions being new to the framework. Also use when the developer's question spans multiple skills and you need to orchestrate a workflow. Think of this as the first skill to check — if someone mentions Noony, handlers, middleware, Cloud Functions, or serverless and seems to need direction, noony-uncle-noony is your starting point.
---

# skill:noony-uncle-noony

## Does exactly this

Acts as the central orchestrator for all 16 Noony skills. Diagnoses what the developer needs, routes them to the right skill or combination of skills, and provides guided workflows for multi-step tasks.

## When to use

- "How do I get started with Noony?"
- "I'm new to this framework"
- "What's the best way to..."
- "I need help building an endpoint"
- "How does this all fit together?"
- Developer seems lost or is asking broad questions
- Task clearly spans multiple skills

## Do not use this skill when

- Developer explicitly names a specific skill (e.g., "apply `noony-validation-schemas`" — go directly there)
- Developer asks a narrowly scoped question that maps 1:1 to a single skill
- Question is purely about code syntax unrelated to Noony

## Quick Dispatch Table

When the developer knows exactly what they want, skip the journey and route directly:

| Intent | Apply skill |
|--------|-------------|
| Set up local Fastify dev server | `noony-create-fastify-server` |
| Convert Cloud Functions to Fastify | `noony-convert-cloud-functions-to-fastify` |
| Build adapter for Koa/Hapi/other | `noony-custom-adapter` |
| Handle path parameters (`:id`, `:userId`) | `noony-path-parameters` |
| Initialize DB/services at startup | `noony-dependency-initialization` |
| Full dual-entry example (Fastify + GCP) | `noony-complete-dual-entry` |
| Reduce boilerplate with type inference | `noony-type-inference` |
| Create custom middleware | `noony-middleware-development` |
| Add Zod body validation | `noony-validation-schemas` |
| Handle errors with status codes | `noony-error-handling` |
| Resolve services with TypeDI | `noony-dependency-injection` |
| Add auth guards and permissions | `noony-guard-system` |
| Optimize cold starts and memory | `noony-performance-optimization` |
| Write handler tests | `noony-testing-handlers` |
| Get middleware ordering right | `noony-middleware-ordering` |

## How noony-uncle-noony works

Uncle Noony does not write code directly — he figures out what the developer needs and assembles the right skills in the right order.

### Step 1: Diagnose the developer's situation

Ask yourself: **What is this developer trying to accomplish?** Map their intent to one of these journeys:

| Developer says... | Journey | Skills to apply (in order) |
|------------------|---------|---------------------------|
| "I'm starting from scratch" | **New Project** | Apply `noony-create-fastify-server`, then `noony-dependency-initialization`, then `noony-complete-dual-entry`, then `noony-middleware-ordering`, then `noony-error-handling` |
| "I need to build an endpoint" | **New Endpoint** | Apply `noony-middleware-ordering`, then `noony-validation-schemas`, then `noony-error-handling`, then `noony-middleware-development` if custom logic needed |
| "I need path parameters" | **Path Params** | Apply `noony-path-parameters`, then `noony-validation-schemas` or `noony-guard-system` as needed |
| "I need auth on my routes" | **Add Auth** | Apply `noony-guard-system`, then `noony-middleware-ordering` (check: is `noony-error-handling` already set up?) |
| "My handler is slow" | **Performance** | Apply `noony-performance-optimization`, then `noony-dependency-injection` |
| "I need to test this" | **Testing** | Apply `noony-testing-handlers` |
| "I'm moving to Fastify for local dev" | **Local Dev** | Apply `noony-create-fastify-server`, then `noony-convert-cloud-functions-to-fastify`, then `noony-complete-dual-entry` |
| "I want to add validation" | **Validation** | Apply `noony-validation-schemas`, then `noony-middleware-ordering` |
| "I need custom middleware" | **Custom Middleware** | Apply `noony-middleware-development`, then `noony-middleware-ordering` |
| "How do I resolve services?" | **DI Setup** | Apply `noony-dependency-injection`, then `noony-performance-optimization` for optimization |
| "Types are breaking" | **Type Issues** | Apply `noony-type-inference`, then `noony-middleware-development` |

### Step 2: Check prerequisites

Before diving into a journey, verify what the developer already has in place:

- **Does the handler already have ErrorHandlerMiddleware?** If not, include `noony-error-handling` skill in the plan.
- **Is middleware ordering already correct?** If unsure, include `noony-middleware-ordering` skill.
- **Are generics `<TBody, TUser>` already flowing?** If types seem off, prepend `noony-type-inference` skill.

### Step 3: Brief the developer

Give a **one-paragraph orientation** so the developer understands the plan before you start applying skills.

### Step 4: Execute skills in sequence

Walk through the relevant skills one at a time. After each skill completes, check in before proceeding to the next.

### Step 5: Verify the full picture

Once all skills are applied, review the complete handler against the verification checklist below.

## Rules

- Always start with orientation — never jump straight into code without context
- Follow skill ordering from the journey table — the order matters
- When in doubt, ask the developer rather than guessing their intent
- Keep explanations conversational — noony-uncle-noony is a mentor, not a manual
- If a developer is clearly experienced, skip the orientation and go direct

## Anti-patterns

- Dumping all 16 skills at once — overwhelms the developer, pick the relevant journey
- Skipping middleware ordering (`noony-middleware-ordering` skill) — the #1 class of bugs in Noony apps
- Starting with code before understanding the goal — diagnose first, then prescribe
- Assuming the developer knows the framework — check their experience level first
- Forgetting ErrorHandlerMiddleware — every handler needs it, remind every time
- Recommending `noony-dependency-initialization` AND `noony-performance-optimization` together for the same concern — `noony-performance-optimization` covers the initialization pattern from `noony-dependency-initialization` plus broader optimizations; use `noony-performance-optimization` for performance, use `noony-dependency-initialization` only when the sole goal is initialization setup
- Skipping prerequisite checks — always verify what the developer already has before prescribing

## Done when

- Developer has a working handler with the right middleware chain
- All relevant skills have been applied in the correct order
- Developer understands why each piece is there, not just what it does
- Error handling is in place (`noony-error-handling` skill always applies)
- Types flow correctly through the chain (generics preserved)

---

## Reference: Skill Relationship Diagram

```
                         ┌──────────────────────┐
                         │   00 noony-uncle-noony      │
                         │   (orchestrator)      │
                         └──────────┬─────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          v                         v                         v
 ┌─────────────────┐    ┌─────────────────┐     ┌──────────────────┐
 │ FRAMEWORK SETUP │    │  REQUEST PIPELINE│     │   QUALITY        │
 │                 │    │                  │     │                  │
 │  01 fastify     │    │  04 path-params  │     │  14 testing      │
 │  02 convert     │    │  09 validation   │     │                  │
 │  03 adapter     │    │  10 errors       │     └──────────────────┘
 │  06 dual-entry  │    │  17 ordering     │
 └─────────────────┘    └─────────────────┘
          │                         │
          v                         v
 ┌─────────────────┐    ┌─────────────────┐
 │   TYPE SAFETY   │    │   DATA & AUTH   │
 │                 │    │                 │
 │  07 inference   │    │  05 init        │
 │  08 middleware   │    │  11 DI          │
 │     dev         │    │  12 guards      │
 └─────────────────┘    │  13 performance │
                        └─────────────────┘
```

## Reference: Journey Details

### New Project Journey

**Step 1** — `noony-create-fastify-server`: Set up Fastify server for local dev. Hot-reload, real HTTP server.

**Step 2** — `noony-dependency-initialization`: Singleton initialization guard. DB connections initialized once.

**Step 3** — `noony-complete-dual-entry`: Wire dual-entry — same handler runs locally (Fastify) and in production (Cloud Functions). Zero code duplication.

**Step 4** — `noony-middleware-ordering`: Learn canonical middleware order. #1 source of bugs for new developers.

**Step 5** — `noony-error-handling`: Set up `ErrorHandlerMiddleware` and error class hierarchy. Every handler needs this.

### New Endpoint Journey

**Step 1** — `noony-middleware-ordering`: Start with canonical middleware order for your endpoint type.

**Step 2** — `noony-validation-schemas`: Define Zod schema. `context.req.validatedBody` is fully typed.

**Step 3** — `noony-error-handling`: Pick right error classes. 404 for missing resources, 409 for duplicates, 403 for permission denied.

**Step 4 (if needed)** — `noony-middleware-development`: Only if endpoint needs custom cross-cutting logic.

### Add Auth Journey

**Prerequisite**: Does handler have `ErrorHandlerMiddleware`? If not, apply `noony-error-handling` first.

**Step 1** — `noony-guard-system`: Set up `RouteGuards` with `GuardSetup` presets.

**Step 2** — `noony-middleware-ordering`: Auth middleware must come after body parsing and parameter extraction.

### Performance Journey

**Note on skill 05 vs 13**: Skill 05 teaches initialization HOW-TO. Skill 13 covers broader performance including that same pattern plus container pool, zero-copy DI, and memory analysis. For performance work, start with skill 13.

**Step 1** — `noony-performance-optimization`: Implement container pool and singleton initialization guard. Move heavy initialization to process-level scope.

**Step 2** — `noony-dependency-injection`: Use hybrid proxy container for zero-copy DI.

## Reference: Verification Checklist

### Structure
- [ ] `ErrorHandlerMiddleware` is the **first** middleware in the chain
- [ ] Middleware follows canonical ordering (skill `noony-middleware-ordering`)
- [ ] Handler uses `<TBody, TUser>` generics consistently
- [ ] No code duplication between entry points

### Error Handling
- [ ] All error paths throw typed errors (not generic `Error()`)
- [ ] External API calls use cause chaining
- [ ] No manual `res.status().json()` — errors thrown, not returned

### Type Safety
- [ ] `context.req.validatedBody` is typed (not `unknown`)
- [ ] `context.user` is typed (not `unknown`)
- [ ] Custom middleware preserves `<TBody, TUser>` generics
- [ ] No `as any` casts

### DI & Initialization
- [ ] Global services use singleton guard pattern
- [ ] Request-scoped data uses local container scope
- [ ] Services accessed via `getService()` helper

### Testing
- [ ] At least one test per error path
- [ ] Middleware chain tested as a unit
- [ ] DI services properly mocked

## Reference: "I'm Stuck" Scenarios

| Symptom | Likely Cause | Skills to Apply |
|---------|-------------|-----------------|
| Handler returns 500 for everything | `ErrorHandlerMiddleware` missing or not first | `noony-error-handling` + `noony-middleware-ordering` |
| `validatedBody` is `unknown` | Missing generics on `Handler` or middleware | `noony-type-inference` + `noony-validation-schemas` |
| `context.user` is undefined after auth | Auth runs before body parsing | `noony-guard-system` + `noony-middleware-ordering` |
| Path params are undefined | `PathParameterMiddleware` missing | `noony-path-parameters` + `noony-middleware-ordering` |
| Cold starts taking 3+ seconds | Services initialized inside handler | `noony-performance-optimization` |
| Custom middleware breaks type chain | Missing generics on `implements BaseMiddleware` | `noony-middleware-development` + `noony-type-inference` |
| Services resolve to `undefined` | `DependencyInjectionMiddleware` missing or wrong position | `noony-dependency-injection` + `noony-middleware-ordering` |

## Reference: Decision Tree

```
Start here: What are you trying to do?
|
+-- "Build something new"
|   +-- From scratch? --> New Project Journey (apply 01, 05, 06, 17, 10)
|   +-- New endpoint? --> New Endpoint Journey (apply 17, 09, 10)
|   +-- New middleware? --> Apply noony-middleware-development
|   +-- Need path params? --> Path Params Journey (apply 04, then 09 or 12)
|
+-- "Fix something broken"
|   +-- Types wrong? --> Apply noony-type-inference, then noony-middleware-development
|   +-- Errors wrong status? --> Apply noony-error-handling
|   +-- Middleware order? --> Apply noony-middleware-ordering
|   +-- Auth not working? --> Apply noony-guard-system, then noony-middleware-ordering
|   +-- Params undefined? --> Apply noony-path-parameters, then noony-middleware-ordering
|   +-- Services undefined? --> Apply noony-dependency-injection, then noony-middleware-ordering
|   +-- Slow cold starts? --> Performance Journey (apply 13, 11)
|
+-- "Add a capability"
|   +-- Authentication? --> Add Auth Journey (apply 12, 17)
|   +-- Validation? --> Apply noony-validation-schemas
|   +-- Path parameters? --> Apply noony-path-parameters
|   +-- DI / services? --> Service Resolution Journey (apply 11, then 13)
|   +-- Local dev? --> Local Dev Journey (apply 01, 02, 06)
|   +-- Custom framework? --> Apply noony-custom-adapter
|
+-- "Test or optimize"
    +-- Write tests? --> Apply noony-testing-handlers
    +-- Performance? --> Performance Journey (apply 13, 11)
    +-- Reduce boilerplate? --> Apply noony-type-inference
```
