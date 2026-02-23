/**
 * MCP Router
 *
 * Aggregates all four MCP servers into a single Context Pack for a given initiative.
 * This is the bridge between the MCP layer and SpecKit's .specify/memory/ directory.
 *
 * Tools exposed:
 *   generate_context_pack      → THE MAIN TOOL: create a versioned context pack for an initiative
 *   get_context_pack           → retrieve an existing context pack
 *   list_context_packs         → list all generated context packs
 *   invalidate_context_pack    → mark a context pack as stale (after policy/domain change)
 *   get_spec_graph             → read the current spec-graph.json
 *   update_spec_graph          → update spec-graph.json with a new or changed artifact
 *
 * Workflow:
 *   1. Before /speckit.specify: call generate_context_pack
 *   2. Router queries all four MCPs for the relevant domains
 *   3. Router writes context-<initiative>.md to .specify/memory/
 *   4. Agent passes the context pack path to /speckit.specify prompt
 *   5. After implementation: call update_spec_graph
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ── Import data directly (router aggregates all servers' data) ─────────────
// In production, these could be HTTP/stdio calls to running MCP servers
import { PLATFORM_POLICIES, NFR_BASELINES, CONSTITUTION_VERSION } from '../../platform-mcp/src/data/policies.js';
import { DOMAIN_REGISTRY, DOMAIN_VERSION } from '../../domain-mcp/src/data/domains.js';
import { CONTRACT_REGISTRY, CONTRACTS_VERSION } from '../../integration-mcp/src/data/contracts.js';
import { COMPONENT_REGISTRY, COMPONENTS_VERSION } from '../../component-mcp/src/data/components.js';

const server = new Server(
  { name: 'sdd-mcp-router', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// ─── Router version — bump when any underlying MCP changes ─────────────────
const ROUTER_VERSION = `cp-v${CONSTITUTION_VERSION}-d${DOMAIN_VERSION}-i${CONTRACTS_VERSION}-c${COMPONENTS_VERSION}`;

// ─── Determine .specify/memory path relative to cwd ────────────────────────
function getMemoryPath(): string {
  const memoryPath = join(process.cwd(), '.specify', 'memory');
  if (!existsSync(memoryPath)) {
    mkdirSync(memoryPath, { recursive: true });
  }
  return memoryPath;
}

// ─── Tools ─────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_context_pack',
      description: 'CALL THIS BEFORE /speckit.specify. Generates a versioned Context Pack for an initiative and writes it to .specify/memory/. Returns the file path and version to reference in the spec.',
      inputSchema: {
        type: 'object',
        properties: {
          initiativeId: { type: 'string', description: 'Initiative ID (e.g., "ECO-124")' },
          domains: {
            type: 'array',
            items: { type: 'string' },
            description: 'Domains involved in this initiative (e.g., ["cart", "checkout", "payments", "fulfillment"])',
          },
          components: {
            type: 'array',
            items: { type: 'string' },
            description: 'Component services involved (e.g., ["cart-service", "checkout-service"])',
          },
        },
        required: ['initiativeId', 'domains'],
      },
    },
    {
      name: 'get_context_pack',
      description: 'Retrieve a previously generated context pack by initiative ID.',
      inputSchema: {
        type: 'object',
        properties: {
          initiativeId: { type: 'string', description: 'Initiative ID' },
        },
        required: ['initiativeId'],
      },
    },
    {
      name: 'list_context_packs',
      description: 'List all generated context packs in .specify/memory/.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_current_versions',
      description: 'Get the current version of each MCP layer. Use to confirm what version to cite in specs.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_spec_graph',
      description: 'Read the current spec-graph.json. Use to check existing artifact links before creating new ones.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'update_spec_graph',
      description: 'Update spec-graph.json with a new or changed artifact. Call after every /speckit.implement run.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Artifact ID (e.g., "SPEC-CART-01")' },
          type: { type: 'string', enum: ['initiative', 'platform-spec', 'component-spec', 'contract-spec', 'adr', 'hotfix'] },
          title: { type: 'string', description: 'Short title' },
          status: { type: 'string', enum: ['Planned', 'Discovery', 'Draft', 'Approved', 'Implementing', 'Done', 'Paused', 'Blocked'] },
          implements: { type: 'string', description: 'Parent spec ID (e.g., "PLAT-124 v1")' },
          contextPack: { type: 'string', description: 'Context Pack version used' },
          contractsReferenced: { type: 'array', items: { type: 'string' }, description: 'Contract URIs referenced' },
          blockedBy: { type: 'array', items: { type: 'string' }, description: 'ADR IDs blocking this' },
          children: { type: 'array', items: { type: 'string' }, description: 'Child spec IDs' },
          affects: { type: 'array', items: { type: 'string' }, description: 'Domains/APIs/events affected' },
          filePath: { type: 'string', description: 'Path to spec file in repo' },
        },
        required: ['id', 'type', 'title', 'status'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  switch (name) {

    case 'generate_context_pack': {
      const { initiativeId, domains, components = [] } = args as {
        initiativeId: string;
        domains: string[];
        components?: string[];
      };

      // Gather platform policies
      const platformSection = buildPlatformSection();

      // Gather domain invariants, events, boundaries for requested domains
      const domainSection = buildDomainSection(domains);

      // Gather relevant contracts (those owned by or consumed by requested domains)
      const contractSection = buildContractSection(domains);

      // Gather component contexts
      const componentSection = buildComponentSection(components);

      const contextPack = [
        `# Context Pack: ${initiativeId}`,
        `**Version:** ${ROUTER_VERSION}`,
        `**Generated:** ${new Date().toISOString()}`,
        `**Domains:** ${domains.join(', ')}`,
        `**Components:** ${components.join(', ') || 'none specified'}`,
        '',
        '> **Cite this Context Pack as:** `Context Pack: ' + ROUTER_VERSION + '`',
        '> **Reference path:** `.specify/memory/context-' + initiativeId.toLowerCase() + '.md`',
        '',
        '---',
        '',
        platformSection,
        '',
        '---',
        '',
        domainSection,
        '',
        '---',
        '',
        contractSection,
        '',
        '---',
        '',
        componentSection,
        '',
        '---',
        '',
        '## How to Use This Context Pack',
        '',
        '### In /speckit.specify prompt:',
        '```',
        `Context pack available at: .specify/memory/context-${initiativeId.toLowerCase()}.md`,
        `Context Pack version: ${ROUTER_VERSION}`,
        'Please use it as the primary source for domain invariants and contract baselines.',
        '```',
        '',
        '### In each spec section, cite:',
        `- Platform policies → \`Source: Platform MCP v${CONSTITUTION_VERSION}\``,
        `- Domain invariants → \`Source: Domain MCP — <domain> v${DOMAIN_VERSION}\``,
        `- Contracts → \`Source: Integration MCP — <contract> v${CONTRACTS_VERSION}\``,
        `- Component patterns → \`Source: Component MCP — <service> v${COMPONENTS_VERSION}\``,
      ].join('\n');

      // Write to .specify/memory/
      const memoryPath = getMemoryPath();
      const filePath = join(memoryPath, `context-${initiativeId.toLowerCase()}.md`);
      writeFileSync(filePath, contextPack, 'utf-8');

      return {
        content: [{
          type: 'text',
          text: `✅ Context Pack generated\n\n` +
            `**Initiative:** ${initiativeId}\n` +
            `**Version:** ${ROUTER_VERSION}\n` +
            `**File:** ${filePath}\n\n` +
            `**Next step:** In your /speckit.specify prompt, include:\n` +
            `\`\`\`\nContext pack available at: ${filePath}\nContext Pack version: ${ROUTER_VERSION}\n\`\`\``,
        }],
      };
    }

    case 'get_context_pack': {
      const { initiativeId } = args as { initiativeId: string };
      const filePath = join(getMemoryPath(), `context-${initiativeId.toLowerCase()}.md`);
      if (!existsSync(filePath)) {
        return {
          content: [{
            type: 'text',
            text: `❌ No context pack found for initiative: ${initiativeId}\n\nRun \`generate_context_pack\` first.`,
          }],
        };
      }
      const content = readFileSync(filePath, 'utf-8');
      return { content: [{ type: 'text', text: content }] };
    }

    case 'list_context_packs': {
      const memoryPath = getMemoryPath();
      const { readdirSync } = await import('fs');
      const files = readdirSync(memoryPath).filter(f => f.startsWith('context-') && f.endsWith('.md'));
      if (files.length === 0) {
        return { content: [{ type: 'text', text: 'No context packs generated yet. Run `generate_context_pack` for your first initiative.' }] };
      }
      return {
        content: [{
          type: 'text',
          text: `# Context Packs in .specify/memory/\n\n` +
            files.map(f => `- ${f}`).join('\n'),
        }],
      };
    }

    case 'get_current_versions': {
      return {
        content: [{
          type: 'text',
          text: `# Current MCP Versions\n\n` +
            `| MCP | Version | Cite as |\n|---|---|---|\n` +
            `| Platform MCP | v${CONSTITUTION_VERSION} | \`Source: Platform MCP v${CONSTITUTION_VERSION}\` |\n` +
            `| Domain MCP | v${DOMAIN_VERSION} | \`Source: Domain MCP — <domain> v${DOMAIN_VERSION}\` |\n` +
            `| Integration MCP | v${CONTRACTS_VERSION} | \`Source: Integration MCP — <contract> v${CONTRACTS_VERSION}\` |\n` +
            `| Component MCP | v${COMPONENTS_VERSION} | \`Source: Component MCP — <service> v${COMPONENTS_VERSION}\` |\n\n` +
            `**Context Pack version string:** \`${ROUTER_VERSION}\``,
        }],
      };
    }

    case 'get_spec_graph': {
      const filePath = join(getMemoryPath(), 'spec-graph.json');
      if (!existsSync(filePath)) {
        return { content: [{ type: 'text', text: 'spec-graph.json not found. It will be created on first update_spec_graph call.' }] };
      }
      const graph = JSON.parse(readFileSync(filePath, 'utf-8'));
      return { content: [{ type: 'text', text: JSON.stringify(graph, null, 2) }] };
    }

    case 'update_spec_graph': {
      const entry = args as any;
      const filePath = join(getMemoryPath(), 'spec-graph.json');

      let graph: Record<string, any> = { artifacts: {} };
      if (existsSync(filePath)) {
        graph = JSON.parse(readFileSync(filePath, 'utf-8'));
      }
      if (!graph.artifacts) graph.artifacts = {};

      graph.artifacts[entry.id] = {
        ...entry,
        updatedAt: new Date().toISOString(),
      };

      writeFileSync(filePath, JSON.stringify(graph, null, 2), 'utf-8');

      return {
        content: [{
          type: 'text',
          text: `✅ Spec Graph updated\n\n**ID:** ${entry.id}\n**Status:** ${entry.status}\n**File:** ${filePath}`,
        }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ─── Context Pack Section Builders ─────────────────────────────────────────

function buildPlatformSection(): string {
  const lines = ['## Platform Policies (MUST follow)'];
  lines.push(`_Source: Platform MCP v${CONSTITUTION_VERSION}_\n`);

  for (const [category, policies] of Object.entries(PLATFORM_POLICIES)) {
    lines.push(`### ${category.toUpperCase()}`);
    (policies as any[]).filter(p => p.level === 'MUST').forEach(p => {
      lines.push(`- **[${p.id}]** ${p.rule}`);
    });
  }

  lines.push('\n### NFR Baselines');
  NFR_BASELINES.forEach(nfr => {
    lines.push(`- **${nfr.name}**: ${nfr.target}`);
  });

  return lines.join('\n');
}

function buildDomainSection(domains: string[]): string {
  const lines = ['## Domain Knowledge'];

  for (const domain of domains) {
    const dom = DOMAIN_REGISTRY[domain];
    if (!dom) {
      lines.push(`\n### ⚠️ ${domain} — NOT REGISTERED\nAdd this domain to Domain MCP before writing specs.`);
      continue;
    }

    lines.push(`\n### ${domain.toUpperCase()} Invariants`);
    lines.push(`_Source: Domain MCP — ${domain} v${DOMAIN_VERSION}_\n`);
    dom.invariants.forEach((inv: any) => {
      lines.push(`- **[${inv.id}]** ${inv.rule}`);
    });

    lines.push(`\n### ${domain.toUpperCase()} Owned Events`);
    dom.events.forEach((evt: any) => {
      lines.push(`- **${evt.name} ${evt.version}** — consumers: ${evt.consumers.join(', ') || 'none'}`);
    });

    lines.push(`\n### ${domain.toUpperCase()} Boundaries`);
    lines.push(`Owns: ${dom.boundary.owns.join(', ')}`);
    lines.push(`Must NOT call: ${dom.boundary.mustNotCallDirectly.join(', ')}`);
  }

  return lines.join('\n');
}

function buildContractSection(domains: string[]): string {
  const relevant = CONTRACT_REGISTRY.filter(c => {
    const ownerDomain = c.owner.replace('-service', '');
    const consumerDomains = c.consumers.map((cs: any) => cs.service.replace('-service', ''));
    return domains.includes(ownerDomain) || consumerDomains.some(cd => domains.includes(cd));
  });

  const active = relevant.filter(c => c.status === 'active');
  const deprecated = relevant.filter(c => c.status === 'deprecated');

  const lines = ['## Integration Contracts'];
  lines.push(`_Source: Integration MCP v${CONTRACTS_VERSION}_\n`);

  lines.push('### Active Contracts');
  active.forEach(c => {
    lines.push(`\n**${c.name} ${c.version}** (\`${c.uri}\`)`);
    lines.push(`Owner: ${c.owner} | Consumers: ${c.consumers.map((cs: any) => cs.service).join(', ') || 'none'}`);
    lines.push(`Schema: ${Object.entries(c.schema).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  });

  if (deprecated.length > 0) {
    lines.push('\n### ⚠️ Deprecated Contracts (do NOT use in new specs)');
    deprecated.forEach(c => {
      lines.push(`- **${c.name} ${c.version}** → replaced by ${c.replacedBy}`);
    });
  }

  return lines.join('\n');
}

function buildComponentSection(components: string[]): string {
  if (components.length === 0) return '## Component Contexts\n_No components specified. Pass `components` array to include tech stack and patterns._';

  const lines = ['## Component Contexts'];
  lines.push(`_Source: Component MCP v${COMPONENTS_VERSION}_\n`);

  for (const comp of components) {
    const ctx = COMPONENT_REGISTRY[comp];
    if (!ctx) {
      lines.push(`\n### ⚠️ ${comp} — NOT REGISTERED\nAdd to Component MCP.`);
      continue;
    }
    const ts = ctx.techStack;
    lines.push(`\n### ${comp}`);
    lines.push(`**Stack:** ${ts.language} + ${ts.framework} + ${ts.database}${ts.cache ? ` + ${ts.cache}` : ''}${ts.messageBroker ? ` + ${ts.messageBroker}` : ''}`);
    const approved = ctx.patterns.filter((p: any) => p.category !== 'antipattern');
    lines.push(`**Key patterns:** ${approved.map((p: any) => p.name).join(', ')}`);
    lines.push(`**Key constraints:**`);
    ctx.constraints.forEach((c: any) => lines.push(`  - ${c.constraint}`));
  }

  return lines.join('\n');
}

// ─── Start ─────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SDD MCP Router running');
}

main().catch(console.error);
