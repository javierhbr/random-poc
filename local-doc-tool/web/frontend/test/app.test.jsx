import { render, screen } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { App } from '../src/app.jsx';

describe('App shell', () => {
  it('renders every labeled region', () => {
    render(<App />);

    const testids = [
      'repo-picker',
      'query-box',
      'region-activity',
      'region-answer',
      'region-graph',
      'region-sources',
      'region-provenance',
    ];

    for (const testid of testids) {
      expect(screen.getByTestId(testid)).toBeTruthy();
    }
  });

  it('has a submit control disabled in the initial no-repos state', () => {
    render(<App />);
    const submit = screen.getByRole('button', { name: /search/i });
    expect(submit).toBeTruthy();
    expect(submit.disabled).toBe(true);
  });
});
