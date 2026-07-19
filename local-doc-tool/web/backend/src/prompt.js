/**
 * buildPrompt({ query, repos }) -> a self-contained, scope-pinned prompt string.
 *
 * R-2.4: instruct Claude to attach the scope flag appropriate to EACH command
 * (`json search --scope <repos>`, `json context --scope <repos>`, and
 * `graph search` per its own scoping) and NOT rely on server-CWD scope
 * resolution. The prompt embeds the search->read->reason instructions, tells
 * Claude to run `graph search` for the graph, and to ask a clarifying question
 * if it lacks what it needs.
 */
export function buildPrompt({ query, repos } = {}) {
  const repoList = Array.isArray(repos) ? repos : [];
  const scope = repoList.join(',');

  return [
    'You are answering a question about indexed code/spec repositories using the',
    '`local-search` CLI, invoked through the Bash tool. Follow a search -> read -> reason loop.',
    '',
    `Scope: the ONLY repos in scope are: ${scope}`,
    'Always pass scope explicitly on every command. Do NOT rely on the current working',
    'directory or any .local-search.toml to resolve scope.',
    '',
    'Commands (attach the scope flag appropriate to EACH command):',
    `- Lexical/semantic search: local-search json search --scope ${scope} "<terms>"`,
    `- Context/provenance:       local-search json context --scope ${scope} "<terms>"`,
    `- Knowledge graph:          local-search graph search --scope ${scope} "<terms>"`,
    '',
    'Steps:',
    '1. Run `json search` (scoped) to find candidate specs, then read the most relevant files.',
    '2. Run `graph search` (scoped) to retrieve the similarity graph for the answer.',
    '3. Reason over what you read and produce a clear natural-language answer in markdown.',
    'If you lack what you need to answer well, ask ONE concise clarifying question instead of guessing.',
    '',
    `Question: ${query ?? ''}`,
  ].join('\n');
}
