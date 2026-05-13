# Project Memory Index

## Feedback — Hard-learned constraints

- **Noony errors → rules + skill first, source code never** — Any Noony handler/API error: read `.claude/rules/noony-*.md` and invoke `noony-framework` skill before opening any source file or node_modules. Proved necessary when `initializeDependencies is not a function` was debugged by reading fastify-wrapper source instead of the DI rule that covers it.

- **`agent-browser` is the only UI testing tool for `packages/web`** — `mcp__playwright__*` tools are forbidden as a substitute even when loaded and available. No exceptions. Rule: `.claude/rules/agent-browser-ui-testing.md`.

## See Also

- `.claude/CLAUDE.md` — team structure, skill preferences, hard constraints
- `.claude/rules/` — all enforcement rules (Noony, agent-browser, filter params, etc.)
