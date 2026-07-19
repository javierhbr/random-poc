/**
 * Tool-event parsing (Bash -> local-search). EARS Unit 2b.
 *
 * Claude runs `local-search` through the Bash tool, so stream-json carries the
 * command as a shell string in tool_use.input.command and the output as an
 * opaque stdout string in the matching tool_result.content. This module
 * classifies the command, strips progress noise from stdout, JSON.parses it,
 * and derives normalized events.
 */

/**
 * classifyCommand(cmdString) -> 'json search' | 'json context' | 'json repos'
 *                              | 'graph search' | 'other'.
 * R-2b.1: tolerant to extra flags, quoting, whitespace, and a leading path or
 * `local-search`/`local-search.sh` prefix.
 */
export function classifyCommand(cmdString) {
  if (typeof cmdString !== 'string') return 'other';

  // Tokenize on whitespace, dropping empty tokens.
  const tokens = cmdString.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 'other';

  // Find the local-search invocation token (may be a path like /usr/bin/local-search
  // or local-search.sh). Then look at the tokens that follow, skipping flags.
  let i = tokens.findIndex((t) => /(^|\/)local-search(\.sh)?$/.test(t));
  if (i === -1) return 'other';

  // Collect the non-flag words after the binary.
  const words = [];
  for (let j = i + 1; j < tokens.length && words.length < 2; j++) {
    const t = tokens[j];
    if (t.startsWith('-')) continue; // a flag; local-search flags here take no value we care about
    words.push(t);
  }

  const first = words[0];
  const second = words[1];

  if (first === 'json') {
    if (second === 'search') return 'json search';
    if (second === 'context') return 'json context';
    if (second === 'repos') return 'json repos';
    return 'other';
  }
  if (first === 'graph' && second === 'search') return 'graph search';
  return 'other';
}

/**
 * stripAndParse(stdout) -> parsed object/array, or null if no JSON found.
 * R-2b.2: strip leading/trailing non-JSON progress lines, then JSON.parse the
 * remaining payload. Finds the first `{`/`[` that begins valid JSON through the
 * last matching `}`/`]`.
 */
export function stripAndParse(stdout) {
  if (typeof stdout !== 'string') return null;

  const firstObj = stdout.indexOf('{');
  const firstArr = stdout.indexOf('[');
  const candidates = [firstObj, firstArr].filter((x) => x !== -1);
  if (candidates.length === 0) return null;
  const start = Math.min(...candidates);
  const opener = stdout[start];
  const closer = opener === '{' ? '}' : ']';
  const end = stdout.lastIndexOf(closer);
  if (end <= start) return null;

  const slice = stdout.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

/**
 * deriveEvents({ command, stdout }) -> normalized event array.
 * R-2b.3: json search/json context -> `sources` (json context also -> provenance
 *   when {scope,missing} present); graph search -> `graph`. Every recognized
 *   command also yields an `activity` event.
 * R-2b.4: if stripAndParse returns null for a recognized command, yield an
 *   `activity` event flagging "unparseable result" and NO sources/graph (never throw).
 * R-2b.5: for `other`, yield only an `activity` event, no parse attempt.
 */
export function deriveEvents({ command, stdout } = {}) {
  const kind = classifyCommand(command);

  if (kind === 'other') {
    return [{ type: 'activity', data: { command, resultSummary: 'other command' } }];
  }

  const parsed = stripAndParse(stdout);

  if (parsed === null) {
    return [
      {
        type: 'activity',
        data: { command, resultSummary: 'unparseable result', unparseable: true },
      },
    ];
  }

  const events = [];

  if (kind === 'json search' || kind === 'json context') {
    const rows = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.sources)
        ? parsed.sources
        : Array.isArray(parsed?.results)
          ? parsed.results
          : [];
    events.push({ type: 'sources', data: rows });
    if (
      kind === 'json context' &&
      parsed &&
      !Array.isArray(parsed) &&
      ('scope' in parsed || 'missing' in parsed)
    ) {
      events.push({
        type: 'provenance',
        data: { scope: parsed.scope ?? [], missing: parsed.missing ?? [] },
      });
    }
    events.push({
      type: 'activity',
      data: { command, resultSummary: `${rows.length} source(s)` },
    });
    return events;
  }

  if (kind === 'graph search') {
    events.push({ type: 'graph', data: parsed });
    const nodeCount = Array.isArray(parsed?.nodes) ? parsed.nodes.length : 0;
    events.push({
      type: 'activity',
      data: { command, resultSummary: `graph: ${nodeCount} node(s)` },
    });
    return events;
  }

  if (kind === 'json repos') {
    events.push({
      type: 'activity',
      data: { command, resultSummary: 'repos listed' },
    });
    return events;
  }

  return events;
}
