// Single-view shell for the explainable-search web UI. Orchestrates the full
// flow: pick repos, submit a query, open the SSE stream, and fan the streamed
// events out into the result regions.

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { fetchRepos, postQuery, openStream, postReply, postCancel } from './api.js';
import { RepoPicker, canSubmit } from './components/RepoPicker.jsx';
import { AnswerPanel } from './components/AnswerPanel.jsx';
import { GraphView } from './components/GraphView.jsx';
import { SourcesPanel } from './components/SourcesPanel.jsx';
import { ProvenancePanel } from './components/ProvenancePanel.jsx';
import { ActivityFeed } from './components/ActivityFeed.jsx';
import { ReplyInput } from './components/ReplyInput.jsx';
import { ElapsedTimer } from './components/ElapsedTimer.jsx';
import { RankedSources } from './components/RankedSources.jsx';
import RetrievalPath from './components/RetrievalPath.jsx';

export function App() {
  const [repos, setRepos] = useState([]);
  const [reposError, setReposError] = useState(null);
  const [selected, setSelected] = useState([]);

  const [q, setQ] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [phase, setPhase] = useState('idle');
  const [model, setModel] = useState(null);
  const [activityEvents, setActivityEvents] = useState([]);
  const [answerMarkdown, setAnswerMarkdown] = useState('');
  const [graph, setGraph] = useState(null);
  const [sources, setSources] = useState([]);
  const [provenance, setProvenance] = useState({});
  const [question, setQuestion] = useState('');
  const [done, setDone] = useState(false);

  const streamRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchRepos()
      .then((rows) => {
        if (active) setRepos(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (active) setReposError(err?.message ?? String(err));
      });
    return () => {
      active = false;
      if (streamRef.current) streamRef.current.close();
    };
  }, []);

  const onToggle = useCallback((name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  const appendActivity = useCallback((type, data) => {
    setActivityEvents((prev) => [...prev, { type, data }]);
  }, []);

  const closeStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.close();
      streamRef.current = null;
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!canSubmit(selected) || running) return;

    // Reset run-scoped state for a fresh query.
    setActivityEvents([]);
    setAnswerMarkdown('');
    setGraph(null);
    setSources([]);
    setProvenance({});
    setQuestion('');
    setErrorMsg(null);
    setCancelled(false);
    setDone(false);
    setModel(null);
    setPhase('idle');

    let id;
    try {
      const resp = await postQuery({ q, repos: selected });
      id = resp.sessionId;
    } catch (err) {
      setErrorMsg(err?.message ?? String(err));
      return;
    }

    setSessionId(id);
    setRunning(true);
    setStartedAt(Date.now());

    const handlers = {
      status: (d) => {
        if (d.phase) setPhase(d.phase);
        if (d.model) setModel(d.model);
      },
      activity: (d) => appendActivity('activity', d),
      assistant: (d) => appendActivity('assistant', d),
      question: (d) => {
        setQuestion(d.text || '');
        appendActivity('question', d);
      },
      sources: (rows) => setSources(Array.isArray(rows) ? rows : []),
      provenance: (d) => setProvenance(d || {}),
      graph: (d) => setGraph(d || null),
      answer: (d) => {
        setAnswerMarkdown(d.markdown || '');
        setRunning(false);
        setDone(true);
        closeStream();
      },
      reply: (d) => appendActivity('reply', d),
      error: (d) => {
        setErrorMsg(d.message || 'stream error');
        setRunning(false);
        closeStream();
      },
      done: (d) => {
        setRunning(false);
        setDone(true);
        if (d && d.cancelled) setCancelled(true);
        closeStream();
      },
    };

    streamRef.current = openStream(id, handlers);
  }, [selected, running, q, appendActivity, closeStream]);

  const onReply = useCallback(
    (text) => {
      if (!sessionId) return;
      postReply(sessionId, text).catch((err) =>
        setErrorMsg(err?.message ?? String(err))
      );
      appendActivity('reply', { text });
      setQuestion('');
      setRunning(true);
      setDone(false);
    },
    [sessionId, appendActivity]
  );

  const onCancel = useCallback(() => {
    if (!sessionId) return;
    postCancel(sessionId).catch((err) =>
      setErrorMsg(err?.message ?? String(err))
    );
  }, [sessionId]);

  const currentActivity = (() => {
    for (let i = activityEvents.length - 1; i >= 0; i--) {
      const ev = activityEvents[i];
      if (ev.type === 'activity') return ev.data.command;
    }
    return null;
  })();

  const submitDisabled = !canSubmit(selected) || running;

  return (
    <div class="app">
      <header class="app-header">
        <h1>Explainable Search</h1>
        {model && <span class="app-model" data-testid="app-model">{model}</span>}
      </header>

      <RepoPicker repos={repos} selected={selected} onToggle={onToggle} error={reposError} />

      <section class="query-box" data-testid="query-box">
        <h2 class="region-title">Query</h2>
        <textarea
          class="query-input"
          placeholder="Ask a question…"
          value={q}
          onInput={(e) => setQ(e.target.value)}
        />
        <button type="button" class="query-submit" disabled={submitDisabled} onClick={onSubmit}>
          Search
        </button>
        {running && (
          <button type="button" class="query-cancel" data-testid="query-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
        {cancelled && (
          <p class="query-cancelled" data-testid="query-cancelled">Cancelled.</p>
        )}
        {errorMsg && (
          <p class="query-error" data-testid="query-error">{errorMsg}</p>
        )}
      </section>

      <ReplyInput question={question} onReply={onReply} />

      <div class="regions">
        <section class="region" data-testid="region-activity">
          <ActivityFeed events={activityEvents} phase={phase} running={running} />
          <ElapsedTimer startedAt={startedAt} running={running} currentActivity={currentActivity} />
        </section>

        <section class="region" data-testid="region-answer">
          <AnswerPanel markdown={answerMarkdown} running={running} done={done} />
        </section>

        <section class="region" data-testid="region-graph">
          <GraphView graph={graph} sources={sources} />
        </section>

        <section class="region" data-testid="region-sources">
          <SourcesPanel sources={sources} />
          <RankedSources sources={sources} />
        </section>

        <section class="region" data-testid="region-provenance">
          <ProvenancePanel provenance={provenance} selected={selected} />
          <RetrievalPath />
        </section>
      </div>
    </div>
  );
}
