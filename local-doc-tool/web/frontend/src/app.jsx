// Single-view shell for the explainable-search web UI.
// Renders the repo picker, query box, and empty result regions that later
// stories mount into. No logic here — just labeled placeholder regions.

function Region({ testid, title }) {
  return (
    <section class="region" data-testid={testid}>
      <h2 class="region-title">{title}</h2>
      <div class="region-body region-empty">No data yet</div>
    </section>
  );
}

export function App() {
  return (
    <div class="app">
      <header class="app-header">
        <h1>Explainable Search</h1>
      </header>

      <section class="repo-picker" data-testid="repo-picker">
        <h2 class="region-title">Repositories</h2>
        <p class="placeholder">Select repositories</p>
      </section>

      <section class="query-box" data-testid="query-box">
        <h2 class="region-title">Query</h2>
        <textarea
          class="query-input"
          placeholder="Ask a question…"
          disabled
        />
        <button type="button" class="query-submit" disabled>
          Search
        </button>
      </section>

      <div class="regions">
        <Region testid="region-activity" title="Session Activity" />
        <Region testid="region-answer" title="Answer" />
        <Region testid="region-graph" title="Graph" />
        <Region testid="region-sources" title="Sources" />
        <Region testid="region-provenance" title="Provenance" />
      </div>
    </div>
  );
}
