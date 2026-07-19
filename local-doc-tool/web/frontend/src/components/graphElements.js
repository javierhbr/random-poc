// Pure helper — turns a NetworkX node-link `graph` event plus the `sources`
// array into a Cytoscape elements array. Kept free of Cytoscape imports so it
// stays testable in jsdom (R-4.1, R-4.2).

// Collect the set of identifiers a source row exposes (path / name / id), so a
// graph node counts as a "source" node when its id OR path matches any of them.
function sourceKeys(sources) {
  const keys = new Set();
  if (!Array.isArray(sources)) return keys;
  for (const s of sources) {
    if (!s) continue;
    for (const v of [s.path, s.name, s.title, s.id]) {
      if (v != null && v !== '') keys.add(v);
    }
  }
  return keys;
}

// buildElements(graph, sources) → Cytoscape elements array.
// Tolerates missing fields; returns [] when there are no nodes.
export function buildElements(graph, sources) {
  if (!graph || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
    return [];
  }

  const keys = sourceKeys(sources);
  const elements = [];

  for (const node of graph.nodes) {
    if (!node || node.id == null) continue;
    const isSource = keys.has(node.id) || (node.path != null && keys.has(node.path));
    elements.push({
      data: {
        id: node.id,
        label: node.label != null ? node.label : node.path != null ? node.path : node.id,
        relevance: node.relevance,
        tag: node.tag,
        isSource,
      },
    });
  }

  // node-link uses `links` (not `edges`); preserve source/target verbatim.
  const links = Array.isArray(graph.links) ? graph.links : [];
  for (const link of links) {
    if (!link || link.source == null || link.target == null) continue;
    elements.push({
      data: {
        id: `${link.source}-${link.target}`,
        source: link.source,
        target: link.target,
        weight: link.weight,
      },
    });
  }

  return elements;
}
