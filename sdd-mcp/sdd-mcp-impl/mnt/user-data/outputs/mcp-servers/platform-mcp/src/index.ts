/**
 * Platform MCP Server
 *
 * Exposes platform-wide policies as governed, versioned context.
 * This is the "constitution" layer — the non-negotiables every spec section must cite.
 *
 * Resources exposed:
 *   policies://ux              → UX consistency rules
 *   policies://security        → Security & PII rules
 *   policies://observability   → Logging, metrics, tracing standards
 *   policies://performance     → p95 targets, throughput baselines
 *   policies://contracts       → Contract versioning rules
 *   policies://dod             → Definition of Done
 *   policies://all             → Full platform constitution
 *
 * Tools exposed:
 *   get_policy_by_category     → Query policies for a specific category
 *   get_nfr_baselines          → Get NFR targets for gate 4 validation
 *   validate_spec_section      → Check if a spec section meets platform requirements
 *   get_constitution_version   → Get current constitution version
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PLATFORM_POLICIES, NFR_BASELINES, CONSTITUTION_VERSION } from './data/policies.js';

const server = new Server(
  { name: 'sdd-platform-mcp', version: '1.0.0' },
  { capabilities: { resources: {}, tools: {} } }
);

// ─── Resources ─────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'policies://all',
      name: `Platform Constitution v${CONSTITUTION_VERSION}`,
      description: 'Full platform constitution — all policies, NFRs, and Definition of Done',
      mimeType: 'text/markdown',
    },
    {
      uri: 'policies://ux',
      name: 'UX & Design Standards',
      description: 'UX consistency rules, design system tokens, accessibility requirements',
      mimeType: 'text/markdown',
    },
    {
      uri: 'policies://security',
      name: 'Security & PII Policies',
      description: 'PII masking rules, API boundary security, data handling requirements',
      mimeType: 'text/markdown',
    },
    {
      uri: 'policies://observability',
      name: 'Observability Standards',
      description: 'Mandatory logging format, metric naming, tracing span requirements',
      mimeType: 'text/markdown',
    },
    {
      uri: 'policies://performance',
      name: 'Performance NFR Baselines',
      description: 'p95 latency targets, throughput requirements, async-first thresholds',
      mimeType: 'text/markdown',
    },
    {
      uri: 'policies://contracts',
      name: 'Contract Versioning Rules',
      description: 'Semantic versioning requirements, dual-publish windows, deprecation rules',
      mimeType: 'text/markdown',
    },
    {
      uri: 'policies://dod',
      name: 'Definition of Done',
      description: 'What must be true before any feature is considered complete',
      mimeType: 'text/markdown',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const { uri } = req.params;
  const category = uri.replace('policies://', '') as keyof typeof PLATFORM_POLICIES;

  if (category === 'all') {
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: formatConstitution(),
      }],
    };
  }

  const policies = PLATFORM_POLICIES[category];
  if (!policies) {
    throw new Error(`Unknown policy category: ${category}. Valid: ux, security, observability, performance, contracts, dod, all`);
  }

  return {
    contents: [{
      uri,
      mimeType: 'text/markdown',
      text: formatPoliciesAsMarkdown(category, policies),
    }],
  };
});

// ─── Tools ─────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_policy_by_category',
      description: 'Get all policies for a specific category. Use when writing a spec section to find what must be cited.',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['ux', 'security', 'observability', 'performance', 'contracts', 'dod'],
            description: 'Policy category to retrieve',
          },
        },
        required: ['category'],
      },
    },
    {
      name: 'get_nfr_baselines',
      description: 'Get NFR baselines for Gate 4 validation. Returns targets for logging, metrics, tracing, security, performance.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'validate_spec_section',
      description: 'Check if a spec section content meets platform policy requirements. Returns PASS/FAIL with specific gaps.',
      inputSchema: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: ['observability', 'security', 'performance', 'ux'],
            description: 'Which spec section to validate',
          },
          content: {
            type: 'string',
            description: 'The spec section content to validate',
          },
        },
        required: ['section', 'content'],
      },
    },
    {
      name: 'get_constitution_version',
      description: 'Get the current constitution version. Use to confirm what version to cite in spec Source declarations.',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  switch (name) {
    case 'get_policy_by_category': {
      const { category } = args as { category: string };
      const policies = PLATFORM_POLICIES[category as keyof typeof PLATFORM_POLICIES];
      if (!policies) throw new Error(`Unknown category: ${category}`);
      return {
        content: [{
          type: 'text',
          text: formatPoliciesAsMarkdown(category, policies),
        }],
      };
    }

    case 'get_nfr_baselines': {
      const text = NFR_BASELINES.map(nfr =>
        `**${nfr.name}**\n- Target: ${nfr.target}\n- Measurement: ${nfr.measurement}`
      ).join('\n\n');
      return { content: [{ type: 'text', text: `# NFR Baselines (Gate 4)\n\n${text}` }] };
    }

    case 'validate_spec_section': {
      const { section, content } = args as { section: string; content: string };
      const result = validateSpecSection(section, content);
      return { content: [{ type: 'text', text: result }] };
    }

    case 'get_constitution_version': {
      return {
        content: [{
          type: 'text',
          text: `Platform Constitution version: **${CONSTITUTION_VERSION}**\n\nCite as: \`Source: Platform MCP v${CONSTITUTION_VERSION}\``,
        }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatPoliciesAsMarkdown(category: string, policies: any[]): string {
  const header = `# Platform Policies — ${category.toUpperCase()} (v${CONSTITUTION_VERSION})\n\n`;
  return header + policies.map(p =>
    `## ${p.id}: ${p.rule}\n**Level:** ${p.level}\n**Rationale:** ${p.rationale}`
  ).join('\n\n');
}

function formatConstitution(): string {
  const sections = Object.entries(PLATFORM_POLICIES).map(([cat, policies]) =>
    `## ${cat.toUpperCase()} Policies\n\n` +
    (policies as any[]).map(p => `- **[${p.level}]** ${p.rule}`).join('\n')
  ).join('\n\n');

  const nfrs = NFR_BASELINES.map(n => `- **${n.name}**: ${n.target}`).join('\n');

  return `# Platform Constitution v${CONSTITUTION_VERSION}\n\n${sections}\n\n## NFR Baselines\n\n${nfrs}`;
}

function validateSpecSection(section: string, content: string): string {
  const checks: Record<string, { required: string[]; label: string }> = {
    observability: {
      label: 'Gate 4 — Observability',
      required: ['log', 'metric', 'trace', 'span'],
    },
    security: {
      label: 'Gate 4 — Security/PII',
      required: ['pii', 'mask', 'sensitive'],
    },
    performance: {
      label: 'Gate 4 — Performance',
      required: ['p95', 'latency', 'ms'],
    },
    ux: {
      label: 'Gate 4 — UX',
      required: ['design system', 'accessibility', 'token'],
    },
  };

  const check = checks[section];
  if (!check) return `Unknown section: ${section}`;

  const lower = content.toLowerCase();
  const missing = check.required.filter(kw => !lower.includes(kw));

  if (missing.length === 0) {
    return `✅ **${check.label}: PASS**\nAll required elements found.`;
  }

  return `❌ **${check.label}: FAIL**\nMissing elements: ${missing.join(', ')}\n\nAdd explicit coverage of: ${missing.map(m => `\`${m}\``).join(', ')} per Platform MCP v${CONSTITUTION_VERSION}`;
}

// ─── Start ─────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SDD Platform MCP server running');
}

main().catch(console.error);
