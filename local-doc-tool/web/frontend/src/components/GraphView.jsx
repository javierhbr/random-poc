// Knowledge-graph visualization (stories 4.1–4.4). Renders the NetworkX
// node-link `graph` event with Cytoscape.js. Pure element-building lives in
// graphElements.js; this component owns the Cytoscape lifecycle.

import { useEffect, useRef } from 'preact/hooks';
import cytoscape from 'cytoscape';
import { buildElements } from './graphElements.js';
import './GraphView.css';

// Exported so tests can assert the stylesheet directly without a full mount
// (R-4.3 / R-4.4). Node size is driven by `relevance`, color by `tag`, source
// nodes get a distinct mark, and the edge label stays lexically honest.
export const GRAPH_STYLE = [
  {
    selector: 'node',
    style: {
      width: 'mapData(relevance, 0, 1, 12, 48)',
      height: 'mapData(relevance, 0, 1, 12, 48)',
      label: 'data(label)',
      'background-color': '#94a3b8',
      'font-family': 'Fira Code, monospace',
      'font-size': 9,
      color: '#0f172a',
      'text-margin-y': 3,
      'min-zoomed-font-size': 6,
    },
  },
  {
    // The synthesized center node ("your query") in the sources-fallback graph.
    selector: 'node[tag = "query"]',
    style: {
      'background-color': '#8b5cf6',
      'border-width': 2,
      'border-color': '#7c3aed',
      'font-weight': 'bold',
    },
  },
  { selector: 'node[tag = "code"]', style: { 'background-color': '#2563eb' } },
  { selector: 'node[tag = "doc"]', style: { 'background-color': '#16a34a' } },
  { selector: 'node[tag = "test"]', style: { 'background-color': '#dc2626' } },
  {
    selector: '[isSource]',
    style: {
      'border-width': 3,
      'border-color': '#16a34a',
    },
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      width: 'mapData(weight, 0, 1, 1, 5)',
      'line-color': '#cbd5e1',
      label: 'lexical similarity (cosine)',
      'font-family': 'Fira Code, monospace',
      'font-size': 6,
      color: '#94a3b8',
    },
  },
];

export function GraphView({ graph, sources }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  const hasNodes = !!(graph && Array.isArray(graph.nodes) && graph.nodes.length > 0);

  useEffect(() => {
    if (!hasNodes || !containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: buildElements(graph, sources),
      headless: false,
      style: GRAPH_STYLE,
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graph, sources, hasNodes]);

  if (!hasNodes) {
    return (
      <div class="graph-view" data-testid="graph-view">
        <p class="graph-empty" data-testid="graph-empty">
          No graph to display yet.
        </p>
      </div>
    );
  }

  return <div class="graph-view" data-testid="graph-view" ref={containerRef} />;
}
