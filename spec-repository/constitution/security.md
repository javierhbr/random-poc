# Security Standards

> Version: 1.0.0 | Applies when: external_facing, touches_payments, touches_pii

---

## MUST

- **MUST** use HTTPS for all external-facing endpoints — no HTTP in production
- **MUST** validate and sanitize all user inputs server-side, never trust the client
- **MUST** never log PII (email, full name, card number, address) in plain text
- **MUST** use tokenization for payment card data — raw card numbers never touch our systems
- **MUST** implement rate limiting on all public endpoints
- **MUST** use short-lived tokens (JWT max 1h, refresh tokens max 7d)
- **MUST** complete a threat model for any change that touches payments or authentication
- **MUST** store passwords using bcrypt with cost factor ≥ 12
- **MUST** implement CSRF protection on all state-mutating endpoints
- **MUST** set security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options

## SHOULD

- **SHOULD** implement request signing for service-to-service calls
- **SHOULD** use secrets manager (not env vars) for credentials in production
- **SHOULD** audit log all privileged operations (admin actions, data exports)

## PCI-DSS Scope (touches_payments)

- **MUST** ensure card data never traverses our infrastructure unencrypted
- **MUST** use a PCI-DSS compliant payment processor (Stripe, Adyen)
- **MUST** not store CVV or full PAN post-authorization
- **MUST** complete security review sign-off before any payment flow change goes live
