import { buildPrompt } from './prompt.js';
import { spawnClaude as realSpawnClaude, killTree } from './claude.js';
import { createNormalizer } from './normalize.js';

function sendJson(res, status, obj) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

/**
 * handleQuery(req, res, { registry, deps }) — POST /api/query {q, repos}.
 * R-2.2: empty/absent repos -> 400, spawn nothing.
 * R-2.9: a session already active -> 409 (single active session).
 * R-2.1: otherwise build prompt, spawnClaude (injected), register a session with the
 *   child + normalizer, respond {sessionId}.
 * R-2.6: spawn ENOENT (claude missing) -> 500 explicit JSON naming the missing binary.
 */
export async function handleQuery(req, res, { registry, deps = {} } = {}) {
  const spawnClaude = deps.spawnClaude ?? realSpawnClaude;
  const body = await readJsonBody(req);
  if (body === null) {
    return sendJson(res, 400, { error: 'bad_json', message: 'invalid JSON body' });
  }

  const { q, repos } = body;
  if (!Array.isArray(repos) || repos.length === 0) {
    // R-2.2
    return sendJson(res, 400, { error: 'repos_required', message: 'at least one repo is required' });
  }

  // R-2.9: single active session — reject a second concurrent query.
  const active = registry.list().find((s) => s.child && s.phase !== 'done');
  if (active) {
    return sendJson(res, 409, { error: 'session_active', message: 'a session is already active' });
  }

  const prompt = buildPrompt({ query: q, repos });

  let child;
  try {
    child = spawnClaude({ prompt });
  } catch (err) {
    // R-2.6: claude binary missing (ENOENT) -> explicit 500.
    const missing = err?.code === 'ENOENT';
    return sendJson(res, 500, {
      error: missing ? 'claude_missing' : 'spawn_failed',
      message: missing ? 'the `claude` binary is not on PATH' : err?.message ?? String(err),
    });
  }

  const normalizer = createNormalizer();
  const session = registry.create({ child, normalizer, phase: 'running' });

  // R-2.6 (async): spawn errors that surface after creation (async ENOENT) end the session.
  child.on('error', (err) => {
    session.phase = 'done';
    const missing = err?.code === 'ENOENT';
    for (const client of session.sseClients) {
      writeSse(client, 'error', {
        message: missing ? 'the `claude` binary is not on PATH' : err?.message ?? String(err),
        kind: 'spawn',
      });
    }
  });

  return sendJson(res, 200, { sessionId: session.id });
}

/** Write one SSE frame: event:<type>\ndata:<json>\n\n */
function writeSse(res, type, data) {
  res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * handleStream(req, res, { registry, id }) — GET /api/session/:id/stream (SSE).
 * R-2.3: set SSE headers, register res in session.sseClients, read the child's stdout
 *   line-by-line (NDJSON), run each line through the normalizer, and flush each
 *   normalized event as an SSE frame — never buffer the whole run.
 * R-2.5: on child close with no answer -> error.
 * Captures claudeSessionId from the init status onto the session.
 */
export function handleStream(req, res, { registry, id } = {}) {
  const session = registry.get(id);
  if (!session) {
    return sendJson(res, 404, { error: 'no_session', message: 'unknown session' });
  }

  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });

  session.sseClients.add(res);

  const { child, normalizer } = session;
  let sawAnswer = false;
  let sawQuestion = false;
  let buffer = '';

  const onData = (chunk) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let obj;
      try {
        obj = JSON.parse(line);
      } catch {
        continue; // ignore non-JSON stdout noise
      }
      for (const ev of normalizer.push(obj)) {
        if (ev.type === 'status' && ev.data?.sessionId) {
          session.claudeSessionId = ev.data.sessionId;
        }
        if (ev.type === 'answer') sawAnswer = true;
        if (ev.type === 'question') {
          sawQuestion = true;
          session.phase = 'awaiting-reply';
        }
        writeSse(res, ev.type, ev.data);
      }
    }
  };

  const onClose = () => {
    // R-8.1/R-8.3: a turn that ended with a question is not a failure; keep it
    // awaiting a reply and do NOT emit an error.
    if (sawQuestion) {
      res.end();
      return;
    }
    session.phase = 'done';
    // R-2.5: closed with no usable answer -> explicit error.
    if (!sawAnswer) {
      writeSse(res, 'error', { message: 'the run ended without producing an answer', kind: 'exit' });
    }
    res.end();
  };

  child.stdout?.on('data', onData);
  child.on('close', onClose);

  // R-9.5: if the SSE client disconnects, kill the child's process group.
  req.on('close', () => {
    session.sseClients.delete(res);
    if (session.phase !== 'done' && session.phase !== 'awaiting-reply') {
      killTree(child);
    }
  });
}
