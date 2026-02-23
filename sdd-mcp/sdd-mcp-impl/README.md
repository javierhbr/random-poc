# SDD MCP Servers
## Governed Knowledge Layer for Spec-Driven Development

This directory contains the four MCP servers and the MCP Router that power
the SDD Operating Model's knowledge layer.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP ROUTER                               │
│   Aggregates all four servers into versioned Context Packs  │
│   Written to .specify/memory/context-<initiative>.md        │
└──────┬──────────┬──────────────┬───────────────┬────────────┘
       │          │              │               │
       ▼          ▼              ▼               ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────────┐
│ Platform │ │  Domain  │ │ Integration  │ │  Component     │
│   MCP    │ │   MCP    │ │    MCP       │ │    MCP         │
│          │ │          │ │              │ │                │
│ Policies │ │ Domain   │ │ Versioned    │ │ Local arch     │
│ NFRs     │ │ invari-  │ │ API/event    │ │ patterns       │
│ Security │ │ ants     │ │ contracts    │ │ constraints    │
│ UX rules │ │ entities │ │ consumers    │ │ runbooks       │
│ DoD      │ │ events   │ │ compat rules │ │ examples       │
└──────────┘ └──────────┘ └──────────────┘ └────────────────┘
```

## Servers

| Server | Port (stdio) | Owned By |
|---|---|---|
| `platform-mcp` | stdio | Platform Architect |
| `domain-mcp` | stdio | Domain Owners |
| `integration-mcp` | stdio | Integration Owner |
| `component-mcp` | stdio | Component Teams |
| `router` | stdio | Platform Architect |

## Quick Start

```bash
# Install dependencies for all servers
npm install

# Build all servers
npm run build

# Configure in Claude Code / Claude Desktop (see claude_mcp_config.json)
```

## File Layout

```
mcp-servers/
├── README.md                    ← this file
├── package.json                 ← monorepo root
├── tsconfig.json                ← shared TS config
├── claude_mcp_config.json       ← copy into your Claude config
├── shared/src/
│   └── types.ts                 ← shared types across all servers
├── platform-mcp/src/
│   ├── index.ts                 ← server entry point
│   └── data/policies.ts         ← platform policies data
├── domain-mcp/src/
│   ├── index.ts                 ← server entry point
│   └── data/domains.ts          ← domain invariants data
├── integration-mcp/src/
│   ├── index.ts                 ← server entry point
│   └── data/contracts.ts        ← contracts registry data
├── component-mcp/src/
│   ├── index.ts                 ← server entry point
│   └── data/components.ts       ← component patterns data
└── router/src/
    └── index.ts                 ← MCP Router (aggregates all servers)
```

## Connecting to Claude

Add to your Claude Code or Claude Desktop config:

```json
{
  "mcpServers": {
    "sdd-platform": { "command": "node", "args": ["./mcp-servers/platform-mcp/dist/index.js"] },
    "sdd-domain":   { "command": "node", "args": ["./mcp-servers/domain-mcp/dist/index.js"] },
    "sdd-integration": { "command": "node", "args": ["./mcp-servers/integration-mcp/dist/index.js"] },
    "sdd-component": { "command": "node", "args": ["./mcp-servers/component-mcp/dist/index.js"] },
    "sdd-router":   { "command": "node", "args": ["./mcp-servers/router/dist/index.js"] }
  }
}
```
