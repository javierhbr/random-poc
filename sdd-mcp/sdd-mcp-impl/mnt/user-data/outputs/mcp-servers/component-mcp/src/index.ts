/**
 * Component MCP Server
 *
 * Exposes per-service context: approved patterns, tech stack, constraints, runbooks.
 * Used by component teams when writing Component Specs and implementing.
 * Prevents agents from using wrong patterns or violating local constraints.
 *
 * Resources:
 *   component://<n>/context    → full context for a service
 *   component://<n>/patterns   → approved patterns
 *   component://<n>/constraints → local constraints
 *   component://all               → all component contexts
 *
 * Tools:
 *   list_components               → list all registered services
 *   get_component_context         → full context for a service
 *   get_approved_patterns         → patterns to follow in this service
 *   get_antipatterns              → what NOT to do
 *   validate_tech_choice          → check if a library/approach is approved
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { COMPONENT_REGISTRY, COMPONENTS_VERSION } from './data/components.js';

const server = new Server(
  { name: 'sdd-component-mcp', version: '1.0.0' },
  { capabilities: { resources: {}, tools: {} } }
);

const componentNames = Object.keys(COMPONENT_REGISTRY);

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'component://all',
      name: `All Component Contexts v${COMPONENTS_VERSION}`,
      description: 'Tech stacks, patterns, and constraints for all registered services',
      mimeType: 'text/markdown',
    },
    ...componentNames.flatMap(name => [
      { uri: `component://${name}/context`, name: `${name} — Full Context`, description: `Tech stack, patterns, constraints for ${name}`, mimeType: 'text/markdown' },
      { uri: `component://${name}/patterns`, name: `${name} — Approved Patterns`, description: `What to do in ${name}`, mimeType: 'text/markdown' },
      { uri: `component://${name}/constraints`, name: `${name} — Constraints`, description: `What NOT to do in ${name}`, mimeType: 'text/markdown' },
    ]),
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const { uri } = req.params;

  if (uri === 'component://all') {
    return { contents: [{ uri, mimeType: 'text/markdown', text: formatAll() }] };
  }

  const match = uri.match(/^component:\/\/([^/]+)\/(.+)$/);
  if (!match) throw new Error(`Invalid URI: ${uri}`);
  const [, name, section] = match;

  const comp = COMPONENT_REGISTRY[name];
  if (!comp) throw new Error(`Unknown component: ${name}. Available: ${componentNames.join(', ')}`);

  switch (section) {
    case 'context':
      return { contents: [{ uri, mimeType: 'text/markdown', text: formatContext(name, comp) }] };
    case 'patterns':
      return { contents: [{ uri, mimeType: 'text/markdown', text: formatPatterns(name, comp) }] };
    case 'constraints':
      return { contents: [{ uri, mimeType: 'text/markdown', text: formatConstraints(name, comp) }] };
    default:
      throw new Error(`Unknown section: ${section}. Valid: context, patterns, constraints`);
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_components',
      description: 'List all registered component services.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_component_context',
      description: 'Get full context for a service: tech stack, patterns, constraints. Use when writing Technical Approach section.',
      inputSchema: {
        type: 'object',
        properties: { component: { type: 'string', description: 'Service name (e.g., "cart-service")' } },
        required: ['component'],
      },
    },
    {
      name: 'get_approved_patterns',
      description: 'Get approved implementation patterns for a service. Use to guide Technical Approach in Component Spec.',
      inputSchema: {
        type: 'object',
        properties: {
          component: { type: 'string' },
          category: { type: 'string', enum: ['architecture', 'library', 'pattern', 'all'], description: 'Pattern category (default: all)' },
        },
        required: ['component'],
      },
    },
    {
      name: 'get_antipatterns',
      description: 'Get anti-patterns to avoid in a service. Use during spec review and gate checks.',
      inputSchema: {
        type: 'object',
        properties: { component: { type: 'string' } },
        required: ['component'],
      },
    },
    {
      name: 'validate_tech_choice',
      description: 'Check if a library or approach is approved for a service. Returns APPROVED/NOT APPROVED with reasoning.',
      inputSchema: {
        type: 'object',
        properties: {
          component: { type: 'string', description: 'Service name' },
          choice: { type: 'string', description: 'Library or approach to check (e.g., "axios", "raw SQL queries", "Redis for sessions")' },
        },
        required: ['component', 'choice'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  switch (name) {
    case 'list_components': {
      const list = componentNames.map(n => {
        const c = COMPONENT_REGISTRY[n];
        return `- **${n}**: ${c.techStack.language} + ${c.techStack.framework} + ${c.techStack.database}`;
      }).join('\n');
      return { content: [{ type: 'text', text: `# Registered Components v${COMPONENTS_VERSION}\n\n${list}` }] };
    }

    case 'get_component_context': {
      const { component } = args as { component: string };
      const comp = COMPONENT_REGISTRY[component];
      if (!comp) throw new Error(`Unknown component: ${component}`);
      return { content: [{ type: 'text', text: formatContext(component, comp) }] };
    }

    case 'get_approved_patterns': {
      const { component, category = 'all' } = args as { component: string; category?: string };
      const comp = COMPONENT_REGISTRY[component];
      if (!comp) throw new Error(`Unknown component: ${component}`);
      return { content: [{ type: 'text', text: formatPatterns(component, comp, category) }] };
    }

    case 'get_antipatterns': {
      const { component } = args as { component: string };
      const comp = COMPONENT_REGISTRY[component];
      if (!comp) throw new Error(`Unknown component: ${component}`);
      return { content: [{ type: 'text', text: formatConstraints(component, comp) }] };
    }

    case 'validate_tech_choice': {
      const { component, choice } = args as { component: string; choice: string };
      const comp = COMPONENT_REGISTRY[component];
      if (!comp) throw new Error(`Unknown component: ${component}`);

      const lower = choice.toLowerCase();
      const approved = comp.patterns.some(p => p.name.toLowerCase().includes(lower) || (p.example || '').toLowerCase().includes(lower));
      const blocked = comp.constraints.some(c => c.constraint.toLowerCase().includes(lower) || c.reason.toLowerCase().includes(lower));

      if (blocked) {
        const constraint = comp.constraints.find(c => c.constraint.toLowerCase().includes(lower));
        return {
          content: [{
            type: 'text',
            text: `❌ **NOT APPROVED** for ${component}\n\nChoice: "${choice}"\n\nReason: ${constraint?.reason || 'See constraints for this component.'}\n\nConstraint: ${constraint?.constraint || ''}`,
          }],
        };
      }
      if (approved) {
        return { content: [{ type: 'text', text: `✅ **APPROVED** for ${component}\n\nChoice: "${choice}" is consistent with registered patterns.` }] };
      }
      return {
        content: [{
          type: 'text',
          text: `⚠️ **UNKNOWN** — "${choice}" is not explicitly registered for ${component}.\n\nCheck with the Component Owner before using. Add to Component MCP if approved.`,
        }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

function formatContext(name: string, comp: any): string {
  const ts = comp.techStack;
  return `# ${name} — Component Context v${COMPONENTS_VERSION}\n\n` +
    `**Tech Stack:** ${ts.language} | ${ts.framework} | ${ts.database}${ts.messageBroker ? ` | ${ts.messageBroker}` : ''}${ts.cache ? ` | ${ts.cache}` : ''}\n\n` +
    formatPatterns(name, comp) + '\n\n' + formatConstraints(name, comp) +
    `\n\n> Cite as: \`Source: Component MCP — ${name} patterns v${COMPONENTS_VERSION}\``;
}

function formatPatterns(name: string, comp: any, category = 'all'): string {
  const patterns = category === 'all'
    ? comp.patterns.filter((p: any) => p.category !== 'antipattern')
    : comp.patterns.filter((p: any) => p.category === category);
  return `## ${name} — Approved Patterns\n\n` +
    patterns.map((p: any) => `**[${p.category}] ${p.name}**\n${p.description}${p.example ? `\n_Example:_ \`${p.example}\`` : ''}`).join('\n\n');
}

function formatConstraints(name: string, comp: any): string {
  const antipatterns = comp.patterns.filter((p: any) => p.category === 'antipattern');
  const constraints = comp.constraints;
  return `## ${name} — Constraints & Anti-Patterns\n\n` +
    constraints.map((c: any) => `⛔ **${c.constraint}**\n_Reason:_ ${c.reason}`).join('\n\n') +
    (antipatterns.length ? '\n\n' + antipatterns.map((p: any) => `⚠️ **${p.name}**\n${p.description}`).join('\n\n') : '');
}

function formatAll(): string {
  return componentNames.map(n => formatContext(n, COMPONENT_REGISTRY[n])).join('\n\n---\n\n');
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SDD Component MCP server running');
}

main().catch(console.error);
