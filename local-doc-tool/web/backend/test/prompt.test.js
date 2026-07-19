import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt } from '../src/prompt.js';

test('R-2.4: prompt scopes each command with the correct scope flag', () => {
  const p = buildPrompt({ query: 'how does auth work', repos: ['a', 'b'] });
  assert.match(p, /json search --scope a,b/);
  assert.match(p, /json context --scope a,b/);
  assert.match(p, /graph search --scope a,b/);
});

test('prompt embeds the query verbatim', () => {
  const p = buildPrompt({ query: 'how does auth work', repos: ['a', 'b'] });
  assert.match(p, /how does auth work/);
});

test('R-2.4: prompt tells Claude not to rely on CWD and to run graph search', () => {
  const p = buildPrompt({ query: 'q', repos: ['x'] });
  assert.match(p, /working directory|CWD|\.local-search\.toml/i);
  assert.match(p, /graph search/);
});

test('prompt instructs a clarifying question when info is missing', () => {
  const p = buildPrompt({ query: 'q', repos: ['x'] });
  assert.match(p, /clarifying question/i);
});
