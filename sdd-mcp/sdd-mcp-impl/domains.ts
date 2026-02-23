/**
 * Domain Registry
 *
 * This is your Domain MCP content. Register each bounded context here.
 * Each domain entry defines its invariants, owned entities, owned events, and boundaries.
 *
 * To add a domain:     add a new key to DOMAIN_REGISTRY
 * To update invariants: edit the invariants array + bump DOMAIN_VERSION
 * To add an event:     add to events array (include consumers list)
 *
 * violationKeywords: words that trigger the check_invariant_violation tool
 * (simple keyword matching — useful for catching obvious violations)
 */

export const DOMAIN_VERSION = '1.4';

export const DOMAIN_REGISTRY: Record<string, DomainDefinition> = {

  // ── Cart Domain ─────────────────────────────────────────────────────────
  cart: {
    invariants: [
      {
        id: 'CART-INV-001',
        domain: 'cart',
        rule: 'Cart owns session state exclusively — Checkout must not store or mutate cart session',
        rationale: 'Prevents split-brain on session data. A single owner means no consistency conflicts.',
        violationRisk: 'high',
        violationKeywords: ['checkout stores session', 'checkout updates cart', 'checkout reads cart db'],
        version: DOMAIN_VERSION,
      },
      {
        id: 'CART-INV-002',
        domain: 'cart',
        rule: 'Guest sessions must have a TTL of at minimum 30 minutes after last activity',
        rationale: 'Users returning within 30 minutes expect their cart to persist. Shorter TTL causes cart abandonment.',
        violationRisk: 'medium',
        violationKeywords: ['ttl 5 minutes', 'ttl 10 minutes', 'session expires immediately'],
        version: DOMAIN_VERSION,
      },
      {
        id: 'CART-INV-003',
        domain: 'cart',
        rule: 'Cart must not depend on authentication service — guest checkout must work without auth',
        rationale: 'Auth service failure must not cascade to cart. Decoupled for resilience.',
        violationRisk: 'high',
        violationKeywords: ['auth required', 'jwt required', 'must be logged in', 'require authentication'],
        version: DOMAIN_VERSION,
      },
    ],
    entities: [
      {
        name: 'Cart',
        domain: 'cart',
        ownedBy: 'cart-service',
        validStates: ['ACTIVE', 'CHECKOUT_INITIATED', 'ABANDONED', 'CONVERTED'],
        fields: {
          cart_id: 'uuid',
          guest_token: 'string (nullable for authenticated users)',
          items: 'CartItem[]',
          session_expires_at: 'timestamp',
          status: 'CartStatus',
        },
      },
    ],
    events: [
      {
        name: 'CartUpdated',
        version: 'v2',
        ownedBy: 'cart-service',
        description: 'Emitted when cart items change. v2 adds guest_token field.',
        schema: {
          cart_id: 'string',
          guest_token: 'string | null',
          items: 'CartItem[]',
          updated_at: 'ISO8601 timestamp',
          version: '"v2"',
        },
        consumers: ['checkout-service', 'analytics-service'],
      },
    ],
    boundary: {
      domain: 'cart',
      owns: ['cart state', 'guest session tokens', 'cart item list', 'cart TTL'],
      mustNotOwn: ['order state', 'payment authorization', 'fulfillment status', 'user authentication'],
      mustNotCallDirectly: ['checkout-db', 'payments-db', 'fulfillment-db', 'auth-service-db'],
      communicatesVia: ['CartUpdated event', 'REST: GET /cart/{id}', 'REST: POST /cart/{id}/items'],
    },
  },

  // ── Checkout Domain ─────────────────────────────────────────────────────
  checkout: {
    invariants: [
      {
        id: 'CHK-INV-001',
        domain: 'checkout',
        rule: 'Checkout owns the order lifecycle: PENDING → CONFIRMED → FAILED. No other domain may mutate order state.',
        rationale: 'Order state consistency requires a single writer. Multiple writers cause state conflicts.',
        violationRisk: 'high',
        violationKeywords: ['payments updates order', 'fulfillment changes order status', 'cart sets order state'],
        version: DOMAIN_VERSION,
      },
      {
        id: 'CHK-INV-002',
        domain: 'checkout',
        rule: 'A checkout session must hold a reference to a cart_id — it cannot exist without a valid cart',
        rationale: 'Checkout without a cart is an orphaned session. Prevents orders with no items.',
        violationRisk: 'high',
        violationKeywords: ['checkout without cart', 'no cart_id required'],
        version: DOMAIN_VERSION,
      },
      {
        id: 'CHK-INV-003',
        domain: 'checkout',
        rule: 'Checkout must only transition order to CONFIRMED after receiving PaymentAuthorized event — never on a synchronous payment call response alone',
        rationale: 'Event-driven confirmation prevents double-confirmation bugs and decouples from payment provider latency.',
        violationRisk: 'high',
        violationKeywords: ['confirm on api response', 'confirm synchronously', 'skip payment event'],
        version: DOMAIN_VERSION,
      },
    ],
    entities: [
      {
        name: 'Order',
        domain: 'checkout',
        ownedBy: 'checkout-service',
        validStates: ['PENDING', 'PAYMENT_PROCESSING', 'CONFIRMED', 'FAILED', 'CANCELLED'],
        fields: {
          order_id: 'uuid',
          cart_id: 'uuid (FK to cart)',
          guest_email: 'string (masked in logs)',
          payment_intent_id: 'string',
          status: 'OrderStatus',
          placed_at: 'timestamp',
        },
      },
    ],
    events: [
      {
        name: 'OrderPlaced',
        version: 'v3',
        ownedBy: 'checkout-service',
        description: 'Emitted when order transitions to CONFIRMED. v3 adds payment_intent_id and guest_email.',
        schema: {
          order_id: 'string',
          cart_id: 'string',
          payment_intent_id: 'string',
          guest_email: 'string (PII — masked in logs)',
          items: 'OrderItem[]',
          total_amount_cents: 'number',
          placed_at: 'ISO8601 timestamp',
          version: '"v3"',
        },
        consumers: ['fulfillment-service', 'shipping-service', 'analytics-service', 'notification-service'],
      },
    ],
    boundary: {
      domain: 'checkout',
      owns: ['order state', 'order lifecycle', 'checkout session', 'order confirmation logic'],
      mustNotOwn: ['cart session', 'payment authorization', 'fulfillment pick/pack', 'shipping routing'],
      mustNotCallDirectly: ['cart-db', 'payments-db', 'fulfillment-db'],
      communicatesVia: ['OrderPlaced event', 'Consumes: CartUpdated v2', 'Consumes: PaymentAuthorized v1', 'REST: POST /checkout/session'],
    },
  },

  // ── Payments Domain ─────────────────────────────────────────────────────
  payments: {
    invariants: [
      {
        id: 'PAY-INV-001',
        domain: 'payments',
        rule: 'Every payment capture must be idempotent — retries with the same payment_intent_id must not result in double charges',
        rationale: 'Network failures cause retries. Non-idempotent payments double-charge customers, creating legal and reputational risk.',
        violationRisk: 'high',
        violationKeywords: ['no idempotency', 'new charge on retry', 'skip idempotency key'],
        version: DOMAIN_VERSION,
      },
      {
        id: 'PAY-INV-002',
        domain: 'payments',
        rule: 'Raw card data (PAN, CVV, expiry) must never be stored, logged, or passed through this service. Use payment_intent_id only.',
        rationale: 'PCI-DSS compliance. Any storage of raw card data triggers full PCI audit scope.',
        violationRisk: 'high',
        violationKeywords: ['store card number', 'log cvv', 'pass raw card', 'store pan'],
        version: DOMAIN_VERSION,
      },
      {
        id: 'PAY-INV-003',
        domain: 'payments',
        rule: 'Payments must emit PaymentAuthorized event before Checkout can confirm an order',
        rationale: 'Event-driven confirmation decouples payment provider from checkout flow. Prevents synchronous coupling.',
        violationRisk: 'medium',
        violationKeywords: ['checkout polls payment', 'synchronous confirmation', 'direct payment api call from checkout'],
        version: DOMAIN_VERSION,
      },
    ],
    entities: [
      {
        name: 'PaymentIntent',
        domain: 'payments',
        ownedBy: 'payments-service',
        validStates: ['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'],
        fields: {
          payment_intent_id: 'uuid (idempotency key)',
          order_id: 'uuid (FK to checkout)',
          amount_cents: 'number',
          currency: 'ISO 4217 code',
          status: 'PaymentIntentStatus',
          provider_reference: 'string (external payment provider ID)',
        },
      },
    ],
    events: [
      {
        name: 'PaymentAuthorized',
        version: 'v1',
        ownedBy: 'payments-service',
        description: 'Emitted when payment is successfully authorized. Triggers order confirmation in Checkout.',
        schema: {
          payment_intent_id: 'string',
          order_id: 'string',
          amount_cents: 'number',
          currency: 'string',
          authorized_at: 'ISO8601 timestamp',
          version: '"v1"',
        },
        consumers: ['checkout-service'],
      },
      {
        name: 'PaymentFailed',
        version: 'v1',
        ownedBy: 'payments-service',
        description: 'Emitted when authorization or capture fails. Triggers order failure in Checkout.',
        schema: {
          payment_intent_id: 'string',
          order_id: 'string',
          failure_reason: 'string',
          failed_at: 'ISO8601 timestamp',
          version: '"v1"',
        },
        consumers: ['checkout-service', 'notification-service'],
      },
    ],
    boundary: {
      domain: 'payments',
      owns: ['payment authorization', 'payment capture', 'payment intent lifecycle', 'refund processing'],
      mustNotOwn: ['order state', 'cart state', 'fulfillment logic', 'shipping routing'],
      mustNotCallDirectly: ['checkout-db', 'cart-db', 'fulfillment-db'],
      communicatesVia: ['PaymentAuthorized event', 'PaymentFailed event', 'REST: POST /payments/authorize'],
    },
  },

  // ── Fulfillment Domain ──────────────────────────────────────────────────
  fulfillment: {
    invariants: [
      {
        id: 'FUL-INV-001',
        domain: 'fulfillment',
        rule: 'Fulfillment must handle duplicate OrderPlaced events idempotently — same order_id must not trigger double pick/pack',
        rationale: 'Event brokers deliver at-least-once. Duplicate processing ships duplicate orders.',
        violationRisk: 'high',
        violationKeywords: ['process every event', 'no deduplication', 'skip idempotency'],
        version: DOMAIN_VERSION,
      },
      {
        id: 'FUL-INV-002',
        domain: 'fulfillment',
        rule: 'Fulfillment must not start pick/pack until OrderPlaced event is received — never on a direct API call from Checkout',
        rationale: 'Decouples fulfillment from checkout latency. Direct calls create tight coupling and cascading failure risk.',
        violationRisk: 'medium',
        violationKeywords: ['direct api call to fulfillment', 'fulfillment called synchronously'],
        version: DOMAIN_VERSION,
      },
    ],
    entities: [
      {
        name: 'FulfillmentOrder',
        domain: 'fulfillment',
        ownedBy: 'fulfillment-service',
        validStates: ['RECEIVED', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'RETURNED'],
        fields: {
          fulfillment_id: 'uuid',
          order_id: 'uuid (FK from checkout)',
          idempotency_key: 'string (order_id used for dedup)',
          status: 'FulfillmentStatus',
          picked_at: 'timestamp | null',
          shipped_at: 'timestamp | null',
        },
      },
    ],
    events: [
      {
        name: 'OrderShipped',
        version: 'v1',
        ownedBy: 'fulfillment-service',
        description: 'Emitted when order is handed to shipping carrier.',
        schema: {
          fulfillment_id: 'string',
          order_id: 'string',
          tracking_number: 'string',
          carrier: 'string',
          shipped_at: 'ISO8601 timestamp',
          version: '"v1"',
        },
        consumers: ['notification-service', 'analytics-service'],
      },
    ],
    boundary: {
      domain: 'fulfillment',
      owns: ['pick/pack operations', 'fulfillment order lifecycle', 'warehouse state'],
      mustNotOwn: ['order state', 'payment state', 'cart state', 'shipping routing'],
      mustNotCallDirectly: ['checkout-db', 'payments-db', 'cart-db'],
      communicatesVia: ['Consumes: OrderPlaced v3', 'OrderShipped event', 'REST: GET /fulfillment/{order_id}'],
    },
  },
};

// Type for domain registry entries
interface DomainDefinition {
  invariants: Array<{
    id: string;
    domain: string;
    rule: string;
    rationale: string;
    violationRisk: 'high' | 'medium' | 'low';
    violationKeywords?: string[];
    version: string;
  }>;
  entities: Array<{
    name: string;
    domain: string;
    ownedBy: string;
    validStates: string[];
    fields: Record<string, string>;
  }>;
  events: Array<{
    name: string;
    version: string;
    ownedBy: string;
    description: string;
    schema: Record<string, unknown>;
    consumers: string[];
  }>;
  boundary: {
    domain: string;
    owns: string[];
    mustNotOwn: string[];
    mustNotCallDirectly: string[];
    communicatesVia: string[];
  };
}
