/**
 * Domain MCP Server
 *
 * Exposes domain knowledge as governed, versioned context.
 * Each domain's invariants, entities, events, and boundaries are queryable.
 * This prevents agents from inventing domain rules or crossing ownership lines.
 *
 * Resources exposed:
 *   domain://<name>/invariants   → business rules that must never be violated
 *   domain://<name>/entities     → owned entities and their valid states
 *   domain://<name>/events       → owned events with schemas and consumers
 *   domain://<name>/boundaries   → what this domain owns vs. must not own
 *   domain://all                 → full domain map
 *
 * Tools exposed:
 *   get_domain_invariants        → get invariants for one or more domains
 *   get_domain_events            → get owned events for a domain
 *   get_domain_boundaries        → get ownership rules for a domain
 *   check_invariant_violation    → validate a spec decision against domain rules
 *   get_event_consumers          → who consumes a specific domain event
 *   list_domains                 → list all registered domains
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { DOMAIN_REGISTRY, DOMAIN_VERSION } from './data/domains.js';

const server = new Server(
  { name: 'sdd-domain-mcp', version: '1.0.0' },
  { capabilities: { resources: {}, tools: {} } }
);

const domainNames = Object.keys(DOMAIN_REGISTRY);

// ─── Resources ─────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'domain://all',
      name: `Domain Map v${DOMAIN_VERSION} — All Domains`,
      description: 'Complete domain map: all invariants, entities, events, and boundaries',
      mimeType: 'text/markdown',
    },
    ...domainNames.flatMap(domain => [
      {
        uri: `domain://${domain}/invariants`,
        name: `${capitalize(domain)} — Invariants`,
        description: `Business rules for the ${domain} domain that must never be violated`,
        mimeType: 'text/markdown',
      },
      {
        uri: `domain://${domain}/events`,
        name: `${capitalize(domain)} — Owned Events`,
        description: `Events emitted by the ${domain} domain, with schemas and consumers`,
        mimeType: 'text/markdown',
      },
      {
        uri: `domain://${domain}/boundaries`,
        name: `${capitalize(domain)} — Ownership Boundaries`,
        description: `What the ${domain} domain owns vs. must not own or call directly`,
        mimeType: 'text/markdown',
      },
    ]),
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const { uri } = req.params;

  if (uri === 'domain://all') {
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: formatDomainMap(),
      }],
    };
  }

  // Parse domain://<name>/<section>
  const match = uri.match(/^domain:\/\/([^/]+)\/(.+)$/);
  if (!match) throw new Error(`Invalid domain URI: ${uri}`);

  const [, domain, section] = match;
  const domainData = DOMAIN_REGISTRY[domain];
  if (!domainData) throw new Error(`Unknown domain: ${domain}. Available: ${domainNames.join(', ')}`);

  switch (section) {
    case 'invariants':
      return { contents: [{ uri, mimeType: 'text/markdown', text: formatInvariants(domain, domainData) }] };
    case 'events':
      return { contents: [{ uri, mimeType: 'text/markdown', text: formatEvents(domain, domainData) }] };
    case 'boundaries':
      return { contents: [{ uri, mimeType: 'text/markdown', text: formatBoundaries(domain, domainData) }] };
    default:
      throw new Error(`Unknown section: ${section}. Valid: invariants, events, boundaries`);
  }
});

// ─── Tools ─────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_domains',
      description: 'List all registered domains. Use at the start of any spec to know what domains exist.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_domain_invariants',
      description: 'Get invariants for one or more domains. Use when writing Domain Understanding section of a spec.',
      inputSchema: {
        type: 'object',
        properties: {
          domains: {
            type: 'array',
            items: { type: 'string' },
            description: 'Domain names to get invariants for (e.g., ["cart", "checkout"])',
          },
        },
        required: ['domains'],
      },
    },
    {
      name: 'get_domain_events',
      description: 'Get all events owned by a domain, with schemas and consumer lists.',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
        },
        required: ['domain'],
      },
    },
    {
      name: 'get_domain_boundaries',
      description: 'Get ownership boundaries for a domain — what it owns, must not own, and must not call directly.',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
        },
        required: ['domain'],
      },
    },
    {
      name: 'check_invariant_violation',
      description: 'Check if a proposed spec decision violates any domain invariant. Returns violations found or PASS.',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain being checked' },
          proposedDecision: { type: 'string', description: 'The spec decision or design choice to check' },
        },
        required: ['domain', 'proposedDecision'],
      },
    },
    {
      name: 'get_event_consumers',
      description: 'Get all consumers of a specific event. Critical for Gate 3 (Integration Safety) validation.',
      inputSchema: {
        type: 'object',
        properties: {
          eventName: { type: 'string', description: 'Event name (e.g., "OrderPlaced")' },
          version: { type: 'string', description: 'Event version (e.g., "v3")' },
        },
        required: ['eventName'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  switch (name) {
    case 'list_domains': {
      const list = domainNames.map(d => {
        const dom = DOMAIN_REGISTRY[d];
        return `- **${d}**: ${dom.invariants.length} invariants, ${dom.events.length} owned events`;
      }).join('\n');
      return { content: [{ type: 'text', text: `# Registered Domains (v${DOMAIN_VERSION})\n\n${list}` }] };
    }

    case 'get_domain_invariants': {
      const { domains } = args as { domains: string[] };
      const results = domains.map(d => {
        const dom = DOMAIN_REGISTRY[d];
        if (!dom) return `❌ Unknown domain: ${d}`;
        return formatInvariants(d, dom);
      }).join('\n\n---\n\n');
      return { content: [{ type: 'text', text: results }] };
    }

    case 'get_domain_events': {
      const { domain } = args as { domain: string };
      const dom = DOMAIN_REGISTRY[domain];
      if (!dom) throw new Error(`Unknown domain: ${domain}`);
      return { content: [{ type: 'text', text: formatEvents(domain, dom) }] };
    }

    case 'get_domain_boundaries': {
      const { domain } = args as { domain: string };
      const dom = DOMAIN_REGISTRY[domain];
      if (!dom) throw new Error(`Unknown domain: ${domain}`);
      return { content: [{ type: 'text', text: formatBoundaries(domain, dom) }] };
    }

    case 'check_invariant_violation': {
      const { domain, proposedDecision } = args as { domain: string; proposedDecision: string };
      const dom = DOMAIN_REGISTRY[domain];
      if (!dom) throw new Error(`Unknown domain: ${domain}`);

      const violations = dom.invariants.filter(inv => {
        // Simple keyword-based check — in production, use LLM-based semantic check
        const keywords = inv.violationKeywords || [];
        return keywords.some(kw => proposedDecision.toLowerCase().includes(kw.toLowerCase()));
      });

      if (violations.length === 0) {
        return {
          content: [{ type: 'text', text: `✅ **Gate 2 Check: PASS**\n\nNo invariant violations detected for domain \`${domain}\`.\n\nProposed: "${proposedDecision}"\n\n> Note: This is a keyword-based check. Always review invariants manually for complex decisions.` }],
        };
      }

      const violationText = violations.map(v =>
        `⚠️ **${v.id}**: ${v.rule}\n   Rationale: ${v.rationale}`
      ).join('\n\n');

      return {
        content: [{
          type: 'text',
          text: `❌ **Gate 2 Check: FAIL — Invariant Violation(s) Detected**\n\nProposed: "${proposedDecision}"\n\n${violationText}`,
        }],
      };
    }

    case 'get_event_consumers': {
      const { eventName, version } = args as { eventName: string; version?: string };
      const results: string[] = [];

      for (const [domainName, dom] of Object.entries(DOMAIN_REGISTRY)) {
        for (const event of dom.events) {
          const nameMatch = event.name.toLowerCase() === eventName.toLowerCase();
          const versionMatch = !version || event.version === version;
          if (nameMatch && versionMatch) {
            results.push(
              `**${event.name} ${event.version}** (owned by: ${domainName})\n` +
              `Consumers: ${event.consumers.length === 0 ? 'none registered' : event.consumers.join(', ')}`
            );
          }
        }
      }

      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No event found matching: ${eventName}${version ? ` ${version}` : ''}` }] };
      }

      return { content: [{ type: 'text', text: `# Consumers for ${eventName}${version ? ` ${version}` : ''}\n\n${results.join('\n\n')}` }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ─── Formatters ────────────────────────────────────────────────────────────

function formatInvariants(domain: string, dom: any): string {
  const header = `# ${capitalize(domain)} Domain — Invariants (v${DOMAIN_VERSION})\n\nSource: \`Domain MCP — ${domain} v${DOMAIN_VERSION}\`\n\n`;
  const items = dom.invariants.map((inv: any) =>
    `## ${inv.id}: ${inv.rule}\n**Risk if violated:** ${inv.violationRisk}\n**Rationale:** ${inv.rationale}`
  ).join('\n\n');
  return header + items;
}

function formatEvents(domain: string, dom: any): string {
  const header = `# ${capitalize(domain)} Domain — Owned Events (v${DOMAIN_VERSION})\n\n`;
  if (dom.events.length === 0) return header + '_No events registered._';
  const items = dom.events.map((evt: any) =>
    `## ${evt.name} ${evt.version}\n` +
    `**Description:** ${evt.description}\n` +
    `**Schema:**\n\`\`\`json\n${JSON.stringify(evt.schema, null, 2)}\n\`\`\`\n` +
    `**Consumers:** ${evt.consumers.length ? evt.consumers.join(', ') : 'none registered'}`
  ).join('\n\n');
  return header + items;
}

function formatBoundaries(domain: string, dom: any): string {
  const b = dom.boundary;
  return `# ${capitalize(domain)} Domain — Ownership Boundaries (v${DOMAIN_VERSION})\n\n` +
    `**Owns:**\n${b.owns.map((o: string) => `- ${o}`).join('\n')}\n\n` +
    `**Must NOT own:**\n${b.mustNotOwn.map((o: string) => `- ${o}`).join('\n')}\n\n` +
    `**Must NOT call directly:**\n${b.mustNotCallDirectly.map((o: string) => `- ${o}`).join('\n')}\n\n` +
    `**Communicates via:**\n${b.communicatesVia.map((o: string) => `- ${o}`).join('\n')}`;
}

function formatDomainMap(): string {
  return `# Domain Map v${DOMAIN_VERSION}\n\n` +
    domainNames.map(d => {
      const dom = DOMAIN_REGISTRY[d];
      return `## ${capitalize(d)}\n` +
        `**Owns:** ${dom.boundary.owns.join(', ')}\n` +
        `**Invariants:** ${dom.invariants.length}\n` +
        `**Owned Events:** ${dom.events.map((e: any) => `${e.name} ${e.version}`).join(', ') || 'none'}`;
    }).join('\n\n');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Start ─────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SDD Domain MCP server running');
}

main().catch(console.error);
