/**
 * Contract Registry
 *
 * Every API and event contract in the system.
 * Add entries here as new contracts are defined or versions are bumped.
 *
 * URI format:  contracts://<kebab-name>/v<N>
 * Status:      active | deprecated | draft
 */

export const CONTRACTS_VERSION = '3.0';

export const CONTRACT_REGISTRY = [

  // ── CartUpdated Event ────────────────────────────────────────────────────
  {
    uri: 'contracts://cart-updated/v1',
    name: 'CartUpdated',
    type: 'event' as const,
    version: 'v1',
    owner: 'cart-service',
    status: 'deprecated' as const,
    deprecatedAt: '2025-09-01',
    replacedBy: 'contracts://cart-updated/v2',
    schema: {
      cart_id: 'string',
      items: 'CartItem[]',
      updated_at: 'ISO8601 timestamp',
      version: '"v1"',
    },
    consumers: [
      { service: 'checkout-service', fieldsDependedOn: ['cart_id', 'items'], breakingChangeRisk: 'high' as const },
    ],
    compatibilityPlan: 'Migrate consumers to v2 — v1 deprecated, dual-publish ended',
  },
  {
    uri: 'contracts://cart-updated/v2',
    name: 'CartUpdated',
    type: 'event' as const,
    version: 'v2',
    owner: 'cart-service',
    status: 'active' as const,
    schema: {
      cart_id: 'string',
      guest_token: 'string | null',
      items: 'CartItem[]',
      updated_at: 'ISO8601 timestamp',
      version: '"v2"',
    },
    consumers: [
      { service: 'checkout-service', fieldsDependedOn: ['cart_id', 'guest_token', 'items'], breakingChangeRisk: 'high' as const },
      { service: 'analytics-service', fieldsDependedOn: ['cart_id', 'items', 'updated_at'], breakingChangeRisk: 'low' as const },
    ],
  },

  // ── OrderPlaced Event ────────────────────────────────────────────────────
  {
    uri: 'contracts://order-placed/v2',
    name: 'OrderPlaced',
    type: 'event' as const,
    version: 'v2',
    owner: 'checkout-service',
    status: 'deprecated' as const,
    deprecatedAt: '2025-11-01',
    replacedBy: 'contracts://order-placed/v3',
    schema: {
      order_id: 'string',
      cart_id: 'string',
      items: 'OrderItem[]',
      total_amount_cents: 'number',
      placed_at: 'ISO8601 timestamp',
      version: '"v2"',
    },
    consumers: [
      { service: 'fulfillment-service', fieldsDependedOn: ['order_id', 'items'], breakingChangeRisk: 'high' as const },
      { service: 'analytics-service', fieldsDependedOn: ['order_id', 'total_amount_cents'], breakingChangeRisk: 'medium' as const },
    ],
  },
  {
    uri: 'contracts://order-placed/v3',
    name: 'OrderPlaced',
    type: 'event' as const,
    version: 'v3',
    owner: 'checkout-service',
    status: 'active' as const,
    schema: {
      order_id: 'string',
      cart_id: 'string',
      payment_intent_id: 'string',
      guest_email: 'string (PII — masked in logs per SEC-001)',
      items: 'OrderItem[]',
      total_amount_cents: 'number',
      placed_at: 'ISO8601 timestamp',
      version: '"v3"',
    },
    consumers: [
      { service: 'fulfillment-service', fieldsDependedOn: ['order_id', 'items', 'guest_email'], breakingChangeRisk: 'high' as const },
      { service: 'shipping-service', fieldsDependedOn: ['order_id', 'items'], breakingChangeRisk: 'high' as const },
      { service: 'analytics-service', fieldsDependedOn: ['order_id', 'total_amount_cents', 'placed_at'], breakingChangeRisk: 'medium' as const },
      { service: 'notification-service', fieldsDependedOn: ['order_id', 'guest_email'], breakingChangeRisk: 'high' as const },
    ],
  },

  // ── PaymentAuthorized Event ──────────────────────────────────────────────
  {
    uri: 'contracts://payment-authorized/v1',
    name: 'PaymentAuthorized',
    type: 'event' as const,
    version: 'v1',
    owner: 'payments-service',
    status: 'active' as const,
    schema: {
      payment_intent_id: 'string',
      order_id: 'string',
      amount_cents: 'number',
      currency: 'ISO 4217 code',
      authorized_at: 'ISO8601 timestamp',
      version: '"v1"',
    },
    consumers: [
      { service: 'checkout-service', fieldsDependedOn: ['payment_intent_id', 'order_id'], breakingChangeRisk: 'high' as const },
    ],
  },

  // ── PaymentFailed Event ──────────────────────────────────────────────────
  {
    uri: 'contracts://payment-failed/v1',
    name: 'PaymentFailed',
    type: 'event' as const,
    version: 'v1',
    owner: 'payments-service',
    status: 'active' as const,
    schema: {
      payment_intent_id: 'string',
      order_id: 'string',
      failure_reason: 'string',
      failed_at: 'ISO8601 timestamp',
      version: '"v1"',
    },
    consumers: [
      { service: 'checkout-service', fieldsDependedOn: ['order_id', 'failure_reason'], breakingChangeRisk: 'high' as const },
      { service: 'notification-service', fieldsDependedOn: ['order_id', 'failure_reason'], breakingChangeRisk: 'medium' as const },
    ],
  },

  // ── Checkout Session API ─────────────────────────────────────────────────
  {
    uri: 'contracts://checkout-session/v1',
    name: 'GET /checkout/session',
    type: 'api' as const,
    version: 'v1',
    owner: 'checkout-service',
    status: 'active' as const,
    schema: {
      method: 'GET',
      path: '/checkout/session',
      queryParams: {
        cart_id: 'string (required)',
        guest_token: 'string (required for guest)',
      },
      response: {
        session_id: 'string',
        cart_id: 'string',
        order_id: 'string | null',
        status: 'PENDING | CONFIRMED | FAILED',
        expires_at: 'ISO8601 timestamp',
      },
      errorCodes: {
        400: 'Invalid cart_id or guest_token',
        404: 'Cart not found',
        410: 'Session expired',
      },
    },
    consumers: [
      { service: 'web-frontend', fieldsDependedOn: ['session_id', 'status', 'expires_at'], breakingChangeRisk: 'high' as const },
      { service: 'mobile-app', fieldsDependedOn: ['session_id', 'status'], breakingChangeRisk: 'high' as const },
    ],
  },
];
