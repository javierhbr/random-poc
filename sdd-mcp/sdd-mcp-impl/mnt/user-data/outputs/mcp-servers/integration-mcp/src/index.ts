/**
 * Integration MCP Server
 *
 * Exposes versioned API and event contracts as governed context.
 * This is Gate 3 (Integration Safety) enforcement infrastructure.
 *
 * Resources exposed:
 *   contracts://all               → full contract registry
 *   contracts://<name>/v<N>       → specific contract version schema
 *
 * Tools exposed:
 *   list_contracts                → all registered contracts with versions + status
 *   get_contract                  → get schema for a specific contract version
 *   get_contract_consumers        → who depends on a contract (Gate 3 critical)
 *   check_breaking_change         → assess if a proposed change breaks consumers
 *   get_compatibility_plan        → get dual-publish / migration guidance
 *   list_deprecated_contracts     → find contracts being sunset
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CONTRACT_REGISTRY, CONTRACTS_VERSION } from './data/contracts.js';

const server = new Server(
  { name: 'sdd-integration-mcp', version: '1.0.0' },
  { capabilities: { resources: {}, tools: {} } }
);

// ─── Resources ─────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'contracts://all',
      name: `Contract Registry v${CONTRACTS_VERSION}`,
      description: 'All registered contracts: APIs and events, all versions, with consumer lists',
      mimeType: 'text/markdown',
    },
    ...CONTRACT_REGISTRY.map(c => ({
      uri: c.uri,
      name: `${c.name} (${c.status})`,
      description: `${c.type === 'event' ? '📨 Event' : '🔌 API'} — ${c.consumers.length} consumers — owned by ${c.owner}`,
      mimeType: 'application/json',
    })),
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const { uri } = req.params;

  if (uri === 'contracts://all') {
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: formatContractRegistry(),
      }],
    };
  }

  const contract = CONTRACT_REGISTRY.find(c => c.uri === uri);
  if (!contract) {
    throw new Error(`Unknown contract URI: ${uri}. Use list_contracts to see available contracts.`);
  }

  return {
    contents: [{
      uri,
      mimeType: 'application/json',
      text: JSON.stringify({
        ...contract,
        _source: `Integration MCP v${CONTRACTS_VERSION}`,
        _cite_as: `Source: Integration MCP — ${contract.name} v${CONTRACTS_VERSION}`,
      }, null, 2),
    }],
  };
});

// ─── Tools ─────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_contracts',
      description: 'List all registered contracts. Use at the start of Platform Spec or Component Spec to see what contracts exist.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['event', 'api', 'all'], description: 'Filter by type (default: all)' },
          status: { type: 'string', enum: ['active', 'deprecated', 'draft', 'all'], description: 'Filter by status (default: active)' },
        },
      },
    },
    {
      name: 'get_contract',
      description: 'Get the full schema for a specific contract version. Use when writing the Contracts section of a spec.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Contract name (e.g., "OrderPlaced")' },
          version: { type: 'string', description: 'Version (e.g., "v3")' },
        },
        required: ['name', 'version'],
      },
    },
    {
      name: 'get_contract_consumers',
      description: 'GATE 3 CRITICAL: Get all consumers of a contract. Must be called before any contract change is proposed.',
      inputSchema: {
        type: 'object',
        properties: {
          contractUri: { type: 'string', description: 'Contract URI (e.g., "contracts://order-placed/v3")' },
        },
        required: ['contractUri'],
      },
    },
    {
      name: 'check_breaking_change',
      description: 'Assess if a proposed schema change is breaking. Returns risk level, affected consumers, and compatibility strategy.',
      inputSchema: {
        type: 'object',
        properties: {
          contractUri: { type: 'string', description: 'Existing contract URI' },
          proposedChange: { type: 'string', description: 'Description of the proposed change (e.g., "remove guest_token field", "rename amount to amount_cents")' },
        },
        required: ['contractUri', 'proposedChange'],
      },
    },
    {
      name: 'get_compatibility_plan',
      description: 'Get a dual-publish / migration plan for a breaking contract change. Required for Gate 3 PASS on breaking changes.',
      inputSchema: {
        type: 'object',
        properties: {
          contractUri: { type: 'string', description: 'Contract being changed' },
          newVersion: { type: 'string', description: 'New version string (e.g., "v4")' },
        },
        required: ['contractUri', 'newVersion'],
      },
    },
    {
      name: 'list_deprecated_contracts',
      description: 'List all contracts currently in deprecated state. Consumers must migrate before the deprecation window closes.',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  switch (name) {
    case 'list_contracts': {
      const { type = 'all', status = 'active' } = args as { type?: string; status?: string };
      let filtered = CONTRACT_REGISTRY;
      if (type !== 'all') filtered = filtered.filter(c => c.type === type);
      if (status !== 'all') filtered = filtered.filter(c => c.status === status);
      return { content: [{ type: 'text', text: formatContractList(filtered) }] };
    }

    case 'get_contract': {
      const { name: cName, version } = args as { name: string; version: string };
      const contract = CONTRACT_REGISTRY.find(
        c => c.name.toLowerCase() === cName.toLowerCase() && c.version === version
      );
      if (!contract) {
        const available = CONTRACT_REGISTRY
          .filter(c => c.name.toLowerCase() === cName.toLowerCase())
          .map(c => c.version).join(', ');
        throw new Error(`Contract "${cName} ${version}" not found. Available versions: ${available || 'none'}`);
      }
      return { content: [{ type: 'text', text: formatContractDetail(contract) }] };
    }

    case 'get_contract_consumers': {
      const { contractUri } = args as { contractUri: string };
      const contract = CONTRACT_REGISTRY.find(c => c.uri === contractUri);
      if (!contract) throw new Error(`Contract not found: ${contractUri}`);

      const consumerText = contract.consumers.length === 0
        ? '_No consumers registered. Add consumers before marking contract as active._'
        : contract.consumers.map(consumer =>
          `- **${consumer.service}**\n  Depends on: ${consumer.fieldsDependedOn.join(', ')}\n  Breaking change risk: ${consumer.breakingChangeRisk}`
        ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `# Gate 3 — Contract Consumers\n\n**${contract.name} ${contract.version}**\n\n${consumerText}\n\n` +
            `> Cite as: \`Source: Integration MCP — ${contract.name} ${contract.version}, consumers list v${CONTRACTS_VERSION}\``,
        }],
      };
    }

    case 'check_breaking_change': {
      const { contractUri, proposedChange } = args as { contractUri: string; proposedChange: string };
      const contract = CONTRACT_REGISTRY.find(c => c.uri === contractUri);
      if (!contract) throw new Error(`Contract not found: ${contractUri}`);

      const lower = proposedChange.toLowerCase();
      const isBreaking = BREAKING_CHANGE_KEYWORDS.some(kw => lower.includes(kw));
      const highRiskConsumers = contract.consumers.filter(c => c.breakingChangeRisk === 'high');

      const assessment = isBreaking
        ? `⚠️ **LIKELY BREAKING CHANGE DETECTED**\n\nProposed: "${proposedChange}"\n\n` +
          `High-risk consumers:\n${highRiskConsumers.map(c => `- ${c.service}: depends on ${c.fieldsDependedOn.join(', ')}`).join('\n')}\n\n` +
          `**Required actions (Gate 3):**\n1. Create Contract Change Spec in Platform Repo\n2. Design dual-publish strategy\n3. Get Integration Owner approval\n4. Notify all consumers before implementation`
        : `✅ **Likely non-breaking change**\n\nProposed: "${proposedChange}"\n\nStill required (Gate 3): create Contract Change Spec and notify consumers.`;

      return { content: [{ type: 'text', text: assessment }] };
    }

    case 'get_compatibility_plan': {
      const { contractUri, newVersion } = args as { contractUri: string; newVersion: string };
      const contract = CONTRACT_REGISTRY.find(c => c.uri === contractUri);
      if (!contract) throw new Error(`Contract not found: ${contractUri}`);

      const consumerList = contract.consumers.map(c => `- ${c.service}`).join('\n');

      return {
        content: [{
          type: 'text',
          text: `# Compatibility Plan\n\n` +
            `**Contract:** ${contract.name} ${contract.version} → ${newVersion}\n` +
            `**Consumers to notify:**\n${consumerList}\n\n` +
            `## Dual-Publish Strategy\n\n` +
            `1. **Publish ${newVersion}** alongside ${contract.version} (do NOT remove old version yet)\n` +
            `2. **Notify consumers** (list above) of the new version and migration timeline\n` +
            `3. **Set dual-publish window**: 30 days minimum (per Platform MCP CON-002)\n` +
            `4. **Track migration**: update consumer list as each service migrates\n` +
            `5. **Deprecate ${contract.version}** after all consumers have migrated\n` +
            `6. **Remove ${contract.version}** after deprecation window closes\n\n` +
            `## Contract Change Spec Required\n\n` +
            `Create \`SPEC-CONTRACT-<n>\` in Platform Repo before implementation.\n` +
            `Integration Owner must approve before any consumer is impacted.\n\n` +
            `Cite as: \`Source: Integration MCP — compatibility rules v${CONTRACTS_VERSION}\``,
        }],
      };
    }

    case 'list_deprecated_contracts': {
      const deprecated = CONTRACT_REGISTRY.filter(c => c.status === 'deprecated');
      if (deprecated.length === 0) {
        return { content: [{ type: 'text', text: 'No deprecated contracts.' }] };
      }
      const text = deprecated.map(c =>
        `- **${c.name} ${c.version}** — deprecated ${c.deprecatedAt || 'date unknown'}, replaced by ${c.replacedBy || 'unknown'}\n  Consumers must migrate: ${c.consumers.map(cs => cs.service).join(', ') || 'none'}`
      ).join('\n');
      return { content: [{ type: 'text', text: `# Deprecated Contracts\n\n${text}` }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ─── Breaking change detection keywords ────────────────────────────────────

const BREAKING_CHANGE_KEYWORDS = [
  'remove', 'delete', 'drop', 'rename', 'change type',
  'make required', 'remove field', 'change field', 'restructure',
  'split', 'merge fields', 'change format',
];

// ─── Formatters ────────────────────────────────────────────────────────────

function formatContractRegistry(): string {
  const groups = { event: [] as any[], api: [] as any[] };
  CONTRACT_REGISTRY.forEach(c => groups[c.type].push(c));

  return `# Contract Registry v${CONTRACTS_VERSION}\n\n` +
    `## Events\n\n` + groups.event.map(formatContractSummary).join('\n') +
    `\n\n## APIs\n\n` + groups.api.map(formatContractSummary).join('\n');
}

function formatContractList(contracts: any[]): string {
  if (contracts.length === 0) return '_No contracts match filters._';
  return `# Contracts (${contracts.length})\n\n` + contracts.map(c =>
    `- **${c.name} ${c.version}** [${c.status}] — ${c.consumers.length} consumers — ${c.uri}`
  ).join('\n');
}

function formatContractSummary(c: any): string {
  return `- **${c.name} ${c.version}** [${c.status}] — ${c.consumers.length} consumers (${c.consumers.map((cs: any) => cs.service).join(', ') || 'none'})`;
}

function formatContractDetail(c: any): string {
  return `# ${c.name} ${c.version}\n\n` +
    `**Type:** ${c.type} | **Status:** ${c.status} | **Owner:** ${c.owner}\n\n` +
    `## Schema\n\`\`\`json\n${JSON.stringify(c.schema, null, 2)}\n\`\`\`\n\n` +
    `## Consumers\n${c.consumers.map((cs: any) => `- **${cs.service}**: depends on ${cs.fieldsDependedOn.join(', ')} (risk: ${cs.breakingChangeRisk})`).join('\n') || '_none_'}\n\n` +
    `> Cite as: \`Source: Integration MCP — ${c.name} ${c.version} v${CONTRACTS_VERSION}\``;
}

// ─── Start ─────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SDD Integration MCP server running');
}

main().catch(console.error);
