# Performance Budgets

> Version: 1.0.0 | Applies when: external_facing, new_feature, migration

---

## Core Web Vitals (User-Facing Pages)

| Metric | Budget | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | p75, real users |
| FID / INP (Interaction to Next Paint) | < 200ms | p75, real users |
| CLS (Cumulative Layout Shift) | < 0.1 | p75, real users |
| TTFB (Time to First Byte) | < 600ms | p75, real users |

## API Latency Budgets

| Endpoint Category | p50 | p99 |
|-------------------|-----|-----|
| Read (product, cart) | < 50ms | < 200ms |
| Mutation (add to cart, save) | < 100ms | < 500ms |
| Checkout initiation | < 200ms | < 1000ms |
| Payment processing | < 500ms | < 3000ms |

## Bundle Size (Frontend)

| Asset | Budget |
|-------|--------|
| Initial JS bundle (gzipped) | < 200KB |
| Per-route chunk | < 50KB |
| Critical CSS (inline) | < 15KB |

## Availability & Reliability

| Metric | Target |
|--------|--------|
| Checkout service availability | 99.95% |
| Cart service availability | 99.9% |
| Payment service availability | 99.99% |
| Error rate (5xx) | < 0.1% |

## MUST

- **MUST** run load tests before shipping any change to checkout or payment flow
- **MUST** define and document the latency budget in the component spec for every new API endpoint
- **MUST** alert when p99 exceeds the budget for > 5 minutes
