// Presentational panel for the streamed answer. Renders markdown as HTML
// (R-3.1), shows a running indicator while streaming (R-3.2), an explicit
// "no answer" message when finished empty (R-3.3), and always reflects the
// latest markdown across partial re-renders (R-3.4).

import { marked } from 'marked';
import './AnswerPanel.css';

export function AnswerPanel({ markdown = '', running = false, done = false }) {
  const hasAnswer = markdown.trim().length > 0;
  const html = hasAnswer ? marked(markdown) : '';

  return (
    <section class="answer-panel" data-testid="answer-panel">
      {running && (
        <div class="answer-running" data-testid="answer-running">
          <span class="answer-running-dot" aria-hidden="true" />
          <span>Answering…</span>
        </div>
      )}

      {hasAnswer && (
        <div
          class="answer-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {done && !hasAnswer && (
        <p class="answer-none" data-testid="answer-none">
          No answer produced.
        </p>
      )}
    </section>
  );
}
