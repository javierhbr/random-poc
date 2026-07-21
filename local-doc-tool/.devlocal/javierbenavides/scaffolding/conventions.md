# Shared conventions — explainable-search web UI (POC)

Pinned so parallel stories stay consistent. All web code lives under `web/` at repo root.
**Zero changes to Go `code/`.**

## Layout
```
web/
  backend/          # Node HTTP glue (story 0.1)
    package.json    # "type":"module", no web-framework deps
    src/
      server.js       # createServer({port,staticDir,deps}) -> node:http server; serves static + routes
      sessions.js     # in-memory session registry: create/get/delete/list
      (later: repos.js, query.js, sse.js, toolParse.js, prompt.js, resume.js, provenance.js)
    test/
      *.test.js       # node:test + node:assert; run: `node --test`
  frontend/         # Preact + Vite (story 0.2)
    package.json    # preact, vite, vitest, @testing-library/preact, jsdom
    index.html
    vite.config.js  # @preact/preset-vite; test.environment='jsdom'
    src/
      main.jsx        # mounts <App/>
      app.jsx         # single view: RepoPicker, QueryBox, regions: Activity/Answer/Graph/Sources/Provenance
      components/      # one component per region (later stories)
      api.js          # fetch helpers + SSE client (later)
    test/
      *.test.jsx      # vitest + @testing-library/preact
```

## Backend conventions (0.1)
- ESM only. Node 20 built-ins: `node:http`, `node:child_process`, `node:path`, `node:fs`.
- `server.js` exports a factory `createServer(opts)` returning an unstarted `http.Server` so tests can
  drive it without binding a fixed port. A thin `bin/serve.js` (or `npm start`) calls it with a port.
- Dependency injection: the factory takes `deps` (e.g. `runRepos`, `spawnClaude`) so tests inject fakes
  and no test ever shells out to the real `claude`/`local-search`.
- `sessions.js`: `createRegistry()` -> `{ create(), get(id), delete(id), list() }`.
  Session shape: `{ id, claudeSessionId, child, sseClients:Set, startedAt, phase }`.
- Tests use `node:test`. Assert HTTP via `server.listen(0)` + `fetch` against the ephemeral port, or by
  calling exported handlers directly.

## Frontend conventions (0.2)
- Preact + Vite, ESM, JSX via `@preact/preset-vite`.
- Vitest with `environment: 'jsdom'`, `@testing-library/preact` for render/query.
- `app.jsx` renders the shell with clearly labeled, initially-empty regions (data-testid per region:
  `region-activity`, `region-answer`, `region-graph`, `region-sources`, `region-provenance`, plus
  `repo-picker`, `query-box`).
- Backend serves `web/frontend/dist` (built). Dev can proxy `/api` to the backend via Vite.

## Test commands
- backend: `cd web/backend && node --test`
- frontend: `cd web/frontend && npx vitest run`

## TDD (tdd-mode: lite, profile: balanced)
- Write a focused failing test asserting the story's EARS requirement, then implement to green.
- Targeted tests per slice; full suite + build when a story is marked complete.
