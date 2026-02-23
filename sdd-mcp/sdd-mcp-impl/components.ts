export const COMPONENTS_VERSION = '1.1';

export const COMPONENT_REGISTRY: Record<string, any> = {
  'cart-service': {
    techStack: { language: 'TypeScript', framework: 'Node.js/Express', database: 'PostgreSQL', cache: 'Redis', messageBroker: 'Kafka' },
    patterns: [
      { category: 'pattern', name: 'Redis for guest sessions', description: 'Store guest session state in Redis with TTL. Key: guest-session:{token}. Use SET with EX for atomic TTL.', example: 'redis.set(`guest-session:${token}`, JSON.stringify(cart), "EX", 1800)' },
      { category: 'pattern', name: 'Optimistic locking for cart updates', description: 'Use version fields on Cart entity to detect concurrent modifications. Retry on conflict, never silently overwrite.' },
      { category: 'library', name: 'ioredis for Redis', description: 'Use ioredis (not node-redis). Team has established patterns with ioredis.' },
      { category: 'library', name: 'kafkajs for Kafka', description: 'Use kafkajs for producing CartUpdated events. Use transactional outbox pattern for reliability.' },
      { category: 'architecture', name: 'Transactional outbox for events', description: 'Write to outbox table in same DB transaction as cart update. Separate relay process reads outbox and publishes to Kafka.' },
      { category: 'antipattern', name: 'Do not publish events directly in transaction', description: 'Publishing to Kafka inside a DB transaction creates a two-phase commit problem. Use outbox pattern.' },
      { category: 'antipattern', name: 'Do not store session state in PostgreSQL', description: 'Session state is high-frequency read/write. PostgreSQL is not the right store. Use Redis.' },
    ],
    constraints: [
      { constraint: 'No direct calls to checkout-db, payments-db, or fulfillment-db', reason: 'Domain boundary enforcement. Cross-domain DB calls create hidden coupling and break ownership model.' },
      { constraint: 'No authentication middleware on guest checkout endpoints', reason: 'Cart must work without auth. Adding auth to cart endpoints breaks guest checkout.' },
      { constraint: 'No synchronous Kafka calls — use async/fire-and-forget pattern', reason: 'Cart updates must not block on Kafka availability. Producer failures must not fail cart operations.' },
    ],
  },

  'checkout-service': {
    techStack: { language: 'TypeScript', framework: 'Node.js/Fastify', database: 'PostgreSQL', messageBroker: 'Kafka' },
    patterns: [
      { category: 'pattern', name: 'State machine for order lifecycle', description: 'Use explicit state machine (e.g., xstate or custom) for order status transitions. Invalid transitions must throw.', example: 'ORDER_STATES: PENDING → PAYMENT_PROCESSING → CONFIRMED | FAILED' },
      { category: 'pattern', name: 'Event-driven order confirmation', description: 'Listen for PaymentAuthorized event on Kafka. Only transition order to CONFIRMED after event received — never on synchronous API response.' },
      { category: 'pattern', name: 'Idempotency via order_id', description: 'Use order_id as idempotency key for all state transitions. Duplicate events must not cause duplicate state changes.' },
      { category: 'library', name: 'Fastify for HTTP', description: 'All new endpoints use Fastify (not Express). Existing Express routes being migrated.' },
      { category: 'architecture', name: 'CQRS for order reads', description: 'Order writes go through command handlers. Order reads go through separate read model. Do not mix.' },
      { category: 'antipattern', name: 'Do not call payment provider directly', description: 'Checkout must not call payment APIs. All payment interaction is via Payments domain through events.' },
    ],
    constraints: [
      { constraint: 'No direct calls to payments-db or cart-db', reason: 'Domain boundary. Cross-domain DB access breaks single ownership model.' },
      { constraint: 'No synchronous confirmation — must wait for PaymentAuthorized event', reason: 'Synchronous confirmation creates race conditions and couples checkout latency to payment provider latency.' },
    ],
  },

  'payments-service': {
    techStack: { language: 'TypeScript', framework: 'Node.js/Express', database: 'PostgreSQL', messageBroker: 'Kafka' },
    patterns: [
      { category: 'pattern', name: 'payment_intent_id as idempotency key', description: 'Every payment capture call must include payment_intent_id. On retry, return existing result if payment_intent_id already processed.', example: 'const existing = await db.findByIntentId(payment_intent_id); if (existing) return existing;' },
      { category: 'pattern', name: 'Stripe SDK for payment provider', description: 'Use official Stripe Node.js SDK. No direct REST calls to Stripe API.' },
      { category: 'pattern', name: 'Provider reference stored, not card data', description: 'Store only provider_reference (Stripe PaymentIntent ID). Never store PAN, CVV, or expiry.' },
      { category: 'architecture', name: 'Circuit breaker for payment provider', description: 'Use opossum circuit breaker for Stripe API calls. Configure: 5 failures in 10s opens circuit. 30s recovery window.' },
      { category: 'antipattern', name: 'Do not store raw card data', description: 'PCI violation. Store payment_intent_id reference only.' },
    ],
    constraints: [
      { constraint: 'No raw card data in logs, events, or DB', reason: 'PCI-DSS compliance (Platform MCP SEC-002). Any card data storage triggers full PCI audit.' },
      { constraint: 'All payment operations must be idempotent via payment_intent_id', reason: 'Network failures cause retries. Non-idempotent operations result in double charges.' },
      { constraint: 'No direct calls to checkout-db, cart-db, or fulfillment-db', reason: 'Domain boundary enforcement.' },
    ],
  },

  'fulfillment-service': {
    techStack: { language: 'Java', framework: 'Spring Boot', database: 'PostgreSQL', messageBroker: 'Kafka' },
    patterns: [
      { category: 'pattern', name: 'Idempotent event consumption via order_id', description: 'On receiving OrderPlaced, check if fulfillment_order already exists for order_id. If yes, skip processing (idempotent).', example: 'if (fulfillmentRepo.existsByOrderId(orderId)) return; // already processed' },
      { category: 'pattern', name: 'Kafka consumer group per feature', description: 'Use dedicated consumer group IDs: fulfillment-service-order-processing. Never share consumer groups across features.' },
      { category: 'library', name: 'Spring Kafka for Kafka', description: 'Use Spring Kafka (not raw KafkaConsumer). Leverage @KafkaListener and ConcurrentKafkaListenerContainerFactory.' },
      { category: 'architecture', name: 'Saga pattern for multi-step fulfillment', description: 'Use choreography-based saga for pick → pack → ship. Each step emits an event, next step listens.' },
      { category: 'antipattern', name: 'Do not call Checkout synchronously for order confirmation', description: 'Fulfillment is triggered by events. Polling or calling checkout directly creates coupling.' },
    ],
    constraints: [
      { constraint: 'Must handle duplicate OrderPlaced events idempotently', reason: 'Kafka at-least-once delivery guarantees duplicate events. Non-idempotent processing ships duplicate orders.' },
      { constraint: 'No direct calls to checkout-db, cart-db, or payments-db', reason: 'Domain boundary enforcement.' },
      { constraint: 'Java only — no Node.js services in fulfillment', reason: 'Existing team expertise and existing infrastructure. Language consistency in this domain.' },
    ],
  },
};
