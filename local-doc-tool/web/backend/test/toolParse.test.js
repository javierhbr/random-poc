import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCommand, stripAndParse, deriveEvents } from '../src/toolParse.js';

test('R-2b.1: classifyCommand maps command strings to subcommands', () => {
  const cases = [
    ['local-search json search --scope a,b "auth"', 'json search'],
    ['local-search json context --scope a "x"', 'json context'],
    ['local-search json repos', 'json repos'],
    ['local-search graph search --scope a "x"', 'graph search'],
    ['/usr/local/bin/local-search json search "q"', 'json search'],
    ['local-search.sh graph search "q"', 'graph search'],
    ['  local-search   json   search   "q"  ', 'json search'],
    ['ls -la', 'other'],
    ['local-search json help', 'other'],
    ['echo hi', 'other'],
  ];
  for (const [cmd, expected] of cases) {
    assert.equal(classifyCommand(cmd), expected, cmd);
  }
});

test('R-2b.2: stripAndParse strips progress prefix/suffix and parses object', () => {
  const stdout = 'Searching...\nfound 2 candidates\n{"scope":["a"],"missing":[]}\nDone.\n';
  assert.deepEqual(stripAndParse(stdout), { scope: ['a'], missing: [] });
});

test('R-2b.2: stripAndParse parses a top-level array with noise around it', () => {
  const stdout = 'progress line\n[{"name":"x"},{"name":"y"}]\ntrailer';
  assert.deepEqual(stripAndParse(stdout), [{ name: 'x' }, { name: 'y' }]);
});

test('stripAndParse returns null when there is no JSON', () => {
  assert.equal(stripAndParse('no json here at all'), null);
  assert.equal(stripAndParse('{ not valid'), null);
});

test('R-2b.3: json search result -> sources + activity', () => {
  const stdout = 'progress\n[{"name":"a","relevance":0.9}]\n';
  const evs = deriveEvents({ command: 'local-search json search "q"', stdout });
  const types = evs.map((e) => e.type);
  assert.deepEqual(types, ['sources', 'activity']);
  assert.deepEqual(evs[0].data, [{ name: 'a', relevance: 0.9 }]);
});

test('R-2b.3: json context with {scope,missing} -> sources + provenance + activity', () => {
  const stdout = '{"sources":[{"name":"a"}],"scope":["a"],"missing":[{"repo":"b","reason":"x","fix":"y"}]}';
  const evs = deriveEvents({ command: 'local-search json context --scope a,b "q"', stdout });
  const types = evs.map((e) => e.type);
  assert.deepEqual(types, ['sources', 'provenance', 'activity']);
  assert.deepEqual(evs[1].data, { scope: ['a'], missing: [{ repo: 'b', reason: 'x', fix: 'y' }] });
});

test('R-2b.3: graph search result -> graph + activity', () => {
  const stdout = 'building graph\n{"directed":false,"nodes":[{"id":"n1"}],"links":[]}\n';
  const evs = deriveEvents({ command: 'local-search graph search "q"', stdout });
  const types = evs.map((e) => e.type);
  assert.deepEqual(types, ['graph', 'activity']);
  assert.deepEqual(evs[0].data.nodes, [{ id: 'n1' }]);
});

test('R-2b.4: recognized command with unparseable result -> activity only, no throw', () => {
  const stdout = 'error: something went wrong, no json';
  let evs;
  assert.doesNotThrow(() => {
    evs = deriveEvents({ command: 'local-search json search "q"', stdout });
  });
  assert.deepEqual(evs.map((e) => e.type), ['activity']);
  assert.equal(evs[0].data.unparseable, true);
});

test('R-2b.5: other command -> activity only, no parse attempt', () => {
  const evs = deriveEvents({ command: 'ls -la', stdout: '{"should":"not parse"}' });
  assert.deepEqual(evs.map((e) => e.type), ['activity']);
});
