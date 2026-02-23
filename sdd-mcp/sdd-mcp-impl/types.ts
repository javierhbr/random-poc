// shared/src/types.ts
// Shared types for the SDD MCP server system

// ─── Platform MCP Types ───────────────────────────────────────────────────

export interface PlatformPolicy {
  id: string;
  category: 'ux' | 'security' | 'observability' | 'performance' | 'contract' | 'dod';
  level: 'MUST' | 'SHOULD' | 'MAY';
  rule: string;
  rationale: string;
  version: string;
}

export interface NFRBaseline {
  name: string;
  target: string;
  measurement: string;
  enforcedAt: 'gate4';
}

// ─── Domain MCP Types ─────────────────────────────────────────────────────

export interface DomainInvariant {
  id: string;
  domain: string;
  rule: string;
  rationale: string;
  violationRisk: 'high' | 'medium' | 'low';
  version: string;
}

export interface DomainEntity {
  name: string;
  domain: string;
  ownedBy: string;
  validStates: string[];
  fields: Record<string, string>;
}

export interface DomainEvent {
  name: string;
  version: string;
  ownedBy: string;
  schema: Record<string, string>;
  consumers: string[];
  description: string;
}

export interface DomainBoundary {
  domain: string;
  owns: string[];
  mustNotOwn: string[];
  mustNotCallDirectly: string[];
  communicatesVia: string[];
}

// ─── Integration MCP Types ────────────────────────────────────────────────

export interface Contract {
  uri: string;           // e.g. "contracts://order-placed/v3"
  name: string;
  type: 'event' | 'api';
  version: string;
  owner: string;
  schema: Record<string, unknown>;
  consumers: ContractConsumer[];
  status: 'active' | 'deprecated' | 'draft';
  deprecatedAt?: string;
  replacedBy?: string;
  compatibilityPlan?: string;
}

export interface ContractConsumer {
  service: string;
  fieldsDependedOn: string[];
  breakingChangeRisk: 'high' | 'medium' | 'low';
}

export interface ContractChangeImpact {
  contractUri: string;
  proposedChange: string;
  isBreaking: boolean;
  affectedConsumers: ContractConsumer[];
  compatibilityStrategy: string;
  dualPublishWindowDays?: number;
}

// ─── Component MCP Types ──────────────────────────────────────────────────

export interface ComponentPattern {
  component: string;
  category: 'architecture' | 'library' | 'pattern' | 'antipattern';
  name: string;
  description: string;
  example?: string;
}

export interface ComponentConstraint {
  component: string;
  constraint: string;
  reason: string;
}

export interface ComponentContext {
  component: string;
  techStack: {
    language: string;
    framework: string;
    database: string;
    messageBroker?: string;
    cache?: string;
  };
  patterns: ComponentPattern[];
  constraints: ComponentConstraint[];
  runbookUrl?: string;
  canonicalExamples: string[];
}

// ─── Context Pack Types ───────────────────────────────────────────────────

export interface ContextPack {
  version: string;
  initiativeId: string;
  generatedAt: string;
  domains: string[];
  platformPolicies: PlatformPolicy[];
  nfrBaselines: NFRBaseline[];
  domainInvariants: DomainInvariant[];
  domainEvents: DomainEvent[];
  domainBoundaries: DomainBoundary[];
  activeContracts: Contract[];
  componentContexts: ComponentContext[];
}

// ─── Spec Graph Types ─────────────────────────────────────────────────────

export type SpecStatus =
  | 'Planned' | 'Discovery' | 'Draft' | 'Approved'
  | 'Implementing' | 'Done' | 'Paused' | 'Blocked';

export interface SpecGraphEntry {
  id: string;
  type: 'initiative' | 'platform-spec' | 'component-spec' | 'contract-spec' | 'adr' | 'hotfix';
  title: string;
  status: SpecStatus;
  implements?: string;
  contextPack?: string;
  contractsReferenced?: string[];
  blockedBy?: string[];
  children?: string[];
  affects?: string[];
  filePath?: string;
}
