// Knowledge-graph visualization (stories 4.1–4.4). Renders the NetworkX
// node-link `graph` event with Cytoscape.js. Pure element-building lives in
// graphElements.js; this component owns the Cytoscape lifecycle.

import { useEffect, useRef, useState } from 'preact/hooks';
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
      // Unlabeled by default: a dense `json related` graph has ~150 nodes, and
      // labeling them all turns the map into an unreadable wall of text. Only
      // the meaningful nodes (retrieved sources + the query) carry a label
      // below; the rest reveal theirs on hover (see the [hover] rule).
      label: '',
      'background-color': '#94a3b8',
      'font-family': 'Fira Code, monospace',
      'font-size': 9,
      color: '#0f172a',
      // Sit the label below the node (not over it) and truncate long titles so
      // neighboring labels stop stacking on top of one another.
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 4,
      'text-wrap': 'ellipsis',
      'text-max-width': 120,
      'text-background-color': '#ffffff',
      'text-background-opacity': 0.85,
      'text-background-padding': 2,
      // Hide labels once the graph is zoomed out far enough that they would
      // collide — they reappear as the user zooms in.
      'min-zoomed-font-size': 10,
    },
  },
  // Retrieved sources are the nodes worth naming — keep their labels on.
  {
    selector: 'node[?isSource]',
    style: { label: 'data(label)' },
  },
  // Reveal any node's label while hovered, so unlabeled nodes stay inspectable.
  {
    selector: 'node.hover',
    style: { label: 'data(label)', 'min-zoomed-font-size': 0, 'z-index': 9999 },
  },
  {
    // The synthesized center node ("your query") in the sources-fallback graph.
    selector: 'node[tag = "query"]',
    style: {
      label: 'data(label)',
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
      // No static edge label: repeating "lexical similarity (cosine)" on every
      // spoke buried the center of the map. The relationship is explained in
      // the pane intro instead; the label surfaces on hover (see edge.hover).
      label: '',
      'font-family': 'Fira Code, monospace',
      'font-size': 6,
      color: '#94a3b8',
    },
  },
  {
    selector: 'edge.hover',
    style: { label: 'lexical similarity (cosine)', 'line-color': '#94a3b8' },
  },
];

export function GraphView({ graph, sources }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasNodes = !!(graph && Array.isArray(graph.nodes) && graph.nodes.length > 0);

  useEffect(() => {
    if (!hasNodes || !containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: buildElements(graph, sources),
      headless: false,
      style: GRAPH_STYLE,
      // Without an explicit layout Cytoscape falls back to `preset`, which
      // drops every node at (0,0) — the pile-up in the top-left corner. `cose`
      // spreads the star (fallback) and arbitrary `json related` graphs alike.
      layout: {
        name: 'cose',
        padding: 30,
        fit: true,
        animate: false,
        nodeRepulsion: 8000,
        idealEdgeLength: 90,
        componentSpacing: 80,
      },
    });

    // Re-fit once the container has its final size (the tab may mount hidden,
    // so the first layout can run against a zero-width box).
    cyRef.current.ready(() => cyRef.current && cyRef.current.fit(undefined, 30));

    // Hover reveals the label of an otherwise-unlabeled node and the
    // relationship on an edge (see the `.hover` style rules).
    const cy = cyRef.current;
    cy.on('mouseover', 'node, edge', (e) => e.target.addClass('hover'));
    cy.on('mouseout', 'node, edge', (e) => e.target.removeClass('hover'));

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graph, sources, hasNodes]);

  // The container changes size when entering/leaving fullscreen; Cytoscape needs
  // an explicit resize + re-fit or it keeps rendering against the old box.
  useEffect(() => {
    if (!cyRef.current) return;
    // Defer to the next frame so the CSS class has applied its new dimensions.
    const id = requestAnimationFrame(() => {
      if (!cyRef.current) return;
      cyRef.current.resize();
      cyRef.current.fit(undefined, 30);
    });
    return () => cancelAnimationFrame(id);
  }, [isFullscreen]);

  // Escape leaves fullscreen — matches the usual native-fullscreen affordance.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  if (!hasNodes) {
    return (
      <div class="graph-view" data-testid="graph-view">
        <p class="graph-empty" data-testid="graph-empty">
          No graph to display yet.
        </p>
      </div>
    );
  }

  return (
    <div
      class={`graph-view${isFullscreen ? ' graph-view--fullscreen' : ''}`}
      data-testid="graph-view"
    >
      <button
        type="button"
        class="graph-fullscreen-btn"
        data-testid="graph-fullscreen-btn"
        onClick={() => setIsFullscreen((v) => !v)}
        title={isFullscreen ? 'Exit full screen (Esc)' : 'View full screen'}
        aria-label={isFullscreen ? 'Exit full screen' : 'View full screen'}
      >
        <i class={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`} />
        <span>{isFullscreen ? 'Exit' : 'Full screen'}</span>
      </button>
      <div class="graph-canvas" ref={containerRef} />
    </div>
  );
}
