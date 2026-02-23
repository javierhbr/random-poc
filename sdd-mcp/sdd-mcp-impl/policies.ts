/**
 * Platform Policies Data
 *
 * This file IS your Platform MCP content. Edit it to match your organization's
 * actual standards. Every policy here becomes a citable Source in specs.
 *
 * To add a policy:  add an entry to the relevant category array
 * To update policy: change the rule + bump CONSTITUTION_VERSION
 * To deprecate:     add a `deprecated: true` field (keep for historical traceability)
 */

export const CONSTITUTION_VERSION = '2.0';

export const PLATFORM_POLICIES = {

  // ── UX & Design ────────────────────────────────────────────────────────
  ux: [
    {
      id: 'UX-001',
      category: 'ux',
      level: 'MUST',
      rule: 'All UI components must use atomic design system tokens — no hardcoded colors, spacing, or typography',
      rationale: 'Ensures visual consistency across domains. Violations create UX fragmentation that breaks user trust.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'UX-002',
      category: 'ux',
      level: 'MUST',
      rule: 'All interactive flows must meet WCAG 2.1 AA accessibility requirements',
      rationale: 'Legal requirement and product quality baseline. Include keyboard navigation and screen reader support.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'UX-003',
      category: 'ux',
      level: 'MUST',
      rule: 'Error states must show human-readable messages — no raw error codes exposed to users',
      rationale: 'Error messages are a UX surface. Raw codes break trust and increase support burden.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'UX-004',
      category: 'ux',
      level: 'SHOULD',
      rule: 'Loading states must show skeleton screens or progress indicators for operations > 300ms',
      rationale: 'Prevents perceived freezes. Maintains perceived performance even when backend is slow.',
      version: CONSTITUTION_VERSION,
    },
  ],

  // ── Security & PII ─────────────────────────────────────────────────────
  security: [
    {
      id: 'SEC-001',
      category: 'security',
      level: 'MUST',
      rule: 'PII fields (email, name, address, card last4, phone) must be masked at API boundaries — never in plaintext in logs or events',
      rationale: 'Regulatory compliance (GDPR, CCPA). Violations create direct legal liability.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'SEC-002',
      category: 'security',
      level: 'MUST',
      rule: 'No raw card data (PAN, CVV, expiry) may be stored or logged at any layer — use payment_intent_id references only',
      rationale: 'PCI-DSS compliance. Storing raw card data requires full PCI audit scope.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'SEC-003',
      category: 'security',
      level: 'MUST',
      rule: 'All service-to-service calls must use mTLS or signed JWTs — no unauthenticated internal API calls',
      rationale: 'Zero-trust network model. Internal network is not trusted.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'SEC-004',
      category: 'security',
      level: 'MUST',
      rule: 'Every spec must declare which fields are PII and specify the masking strategy for each',
      rationale: 'Forces explicit PII analysis at spec time, not retroactively after an incident.',
      version: CONSTITUTION_VERSION,
    },
  ],

  // ── Observability ──────────────────────────────────────────────────────
  observability: [
    {
      id: 'OBS-001',
      category: 'observability',
      level: 'MUST',
      rule: 'All services must emit structured JSON logs with fields: timestamp, service, trace_id, span_id, level, event, context',
      rationale: 'Enables cross-service log correlation. Unstructured logs are unsearchable at scale.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'OBS-002',
      category: 'observability',
      level: 'MUST',
      rule: 'All services must emit OpenTelemetry traces. Every inbound HTTP request and outbound call must create a span',
      rationale: 'Distributed tracing is required to debug latency and failures in a microservice environment.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'OBS-003',
      category: 'observability',
      level: 'MUST',
      rule: 'Business-critical operations must emit metrics to Datadog: counters for success/failure, histogram for latency',
      rationale: 'Alerting and SLO tracking depend on metrics. Missing metrics create blind spots during incidents.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'OBS-004',
      category: 'observability',
      level: 'MUST',
      rule: 'Every spec must declare: (a) log events emitted, (b) metrics emitted with dimensions, (c) trace spans created',
      rationale: 'Observability must be designed at spec time, not bolted on after incidents.',
      version: CONSTITUTION_VERSION,
    },
  ],

  // ── Performance ────────────────────────────────────────────────────────
  performance: [
    {
      id: 'PERF-001',
      category: 'performance',
      level: 'MUST',
      rule: 'Synchronous API responses must have p95 latency < 300ms under normal load',
      rationale: 'User-perceived performance threshold. Above 300ms users notice lag.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'PERF-002',
      category: 'performance',
      level: 'MUST',
      rule: 'Operations expected to exceed 500ms must use async patterns (events, webhooks, polling) — never block a synchronous request',
      rationale: 'Prevents cascading failures. Long-running synchronous calls exhaust connection pools.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'PERF-003',
      category: 'performance',
      level: 'MUST',
      rule: 'Every spec must declare the expected p95 latency target for each operation',
      rationale: 'Performance targets must be explicit at spec time to enable load testing and capacity planning.',
      version: CONSTITUTION_VERSION,
    },
  ],

  // ── Contract Versioning ────────────────────────────────────────────────
  contracts: [
    {
      id: 'CON-001',
      category: 'contract',
      level: 'MUST',
      rule: 'All APIs and events must use semantic versioning (MAJOR.MINOR.PATCH). Breaking changes increment MAJOR',
      rationale: 'Consumers depend on version stability. Surprise breaking changes cause production incidents.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'CON-002',
      category: 'contract',
      level: 'MUST',
      rule: 'Breaking contract changes require dual-publish of old and new versions for a minimum of 30 days',
      rationale: 'Consumer teams need migration runway. Instant cutover breaks dependent services.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'CON-003',
      category: 'contract',
      level: 'MUST',
      rule: 'All consumers of a contract must be identified before a contract change is approved',
      rationale: 'Unknown consumers break silently. Consumer identification is the prerequisite for safe change.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'CON-004',
      category: 'contract',
      level: 'MUST',
      rule: 'Contract changes require a Contract Change Spec in the Platform Repo before any implementation proceeds',
      rationale: 'Contracts are cross-domain artifacts. Changes need platform-level review, not just local approval.',
      version: CONSTITUTION_VERSION,
    },
  ],

  // ── Definition of Done ─────────────────────────────────────────────────
  dod: [
    {
      id: 'DOD-001',
      category: 'dod',
      level: 'MUST',
      rule: 'No implementation begins without an approved spec. Draft specs do not qualify.',
      rationale: 'The core SDD rule. Unapproved specs allow implementation of wrong things.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'DOD-002',
      category: 'dod',
      level: 'MUST',
      rule: 'All 5 gates must PASS on /speckit.analyze before /speckit.implement is run',
      rationale: 'Gates are the automated enforcement layer. Skipping them defeats the entire system.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'DOD-003',
      category: 'dod',
      level: 'MUST',
      rule: 'spec-graph.json must be updated with implements/dependsOn/affects/status after every implementation run',
      rationale: 'Traceability is not optional. The Spec Graph is how the organization navigates decisions months later.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'DOD-004',
      category: 'dod',
      level: 'MUST',
      rule: 'Every spec section must declare its Source (MCP name + version). No undeclared assumptions.',
      rationale: 'Source declarations prevent context invention. They make specs auditable and rebasing possible.',
      version: CONSTITUTION_VERSION,
    },
    {
      id: 'DOD-005',
      category: 'dod',
      level: 'MUST',
      rule: 'Specs are never deleted. Cancelled or superseded specs are versioned and set to Paused or Cancelled status.',
      rationale: 'Historical context is organizational memory. Deleting specs destroys the record of decisions and abandoned paths.',
      version: CONSTITUTION_VERSION,
    },
  ],
};

export const NFR_BASELINES = [
  {
    name: 'API Response Latency',
    target: 'p95 < 300ms',
    measurement: 'OpenTelemetry histogram — http.server.duration',
    enforcedAt: 'gate4' as const,
  },
  {
    name: 'Async Operation Threshold',
    target: 'Operations > 500ms must be async',
    measurement: 'Code review + /speckit.analyze check',
    enforcedAt: 'gate4' as const,
  },
  {
    name: 'Log Completeness',
    target: 'All state transitions emit structured JSON log',
    measurement: 'Log coverage review in /speckit.analyze',
    enforcedAt: 'gate4' as const,
  },
  {
    name: 'Metric Coverage',
    target: 'Each operation: 1 counter (success/failure) + 1 latency histogram',
    measurement: 'Datadog metric validation in CI',
    enforcedAt: 'gate4' as const,
  },
  {
    name: 'Trace Coverage',
    target: 'Every inbound request + every outbound call creates a span',
    measurement: 'OpenTelemetry span review in /speckit.analyze',
    enforcedAt: 'gate4' as const,
  },
];
