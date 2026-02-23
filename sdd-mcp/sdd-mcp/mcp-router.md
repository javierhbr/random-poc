# Running the MCP Router to Generate a Context Pack

The MCP Router aggregates Platform, Domain, Integration, and Component MCPs into a
single Context Pack file for a specific initiative. It must be run BEFORE /speckit.specify.

## What a Context Pack contains

- Platform policies (from constitution.md / Platform MCP)
- Domain invariants for all domains involved in this initiative
- Active contracts for those domains (from Integration MCP)
- Component patterns for affected services (from Component MCPs)

## How to run it

If you have the MCP Router implemented as a TypeScript service:

```typescript
// In mcp-servers/router/
const pack = await generateContextPack('ECO-124', ['cart', 'checkout', 'payments', 'fulfillment']);
// Writes to .specify/memory/context-ECO-124.md
```

If you are running it manually (early stage):

1. Read `.specify/memory/constitution.md`
2. Read each relevant domain file: `.specify/memory/domains/cart.md`, etc.
3. Read the contracts registry for those domains
4. Consolidate into `.specify/memory/context-<initiative-id>.md`

## Referencing the Context Pack in your spec prompt

When running /speckit.specify, include in your prompt:

```
Context pack available at: .specify/memory/context-ECO-124.md
Please use it as the primary source for domain invariants and contract baselines.
Context Pack version: cp-v2
```

## When to regenerate

Regenerate the Context Pack when:
- Platform policies change (constitution updated)
- Domain invariants change (domain MCP updated)
- A contract is deprecated or a new version published
- Resuming a Paused initiative (always regenerate — never resume against stale context)

After regeneration, update the `Context Pack: cp-vN` field in all affected specs and
re-run /speckit.analyze to re-validate gates.
