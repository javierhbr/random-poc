# Regulatory Compliance

> Version: 1.0.0 | Applies when: touches_payments, touches_pii, external_facing

---

## GDPR (EU Customers)

- **MUST** display cookie consent banner before setting non-essential cookies
- **MUST** provide data export capability (Article 20 — data portability)
- **MUST** honour deletion requests within 30 days (Article 17 — right to erasure)
- **MUST** document lawful basis for each data processing activity
- **MUST** report data breaches to supervisory authority within 72 hours

## PCI-DSS (Payment Card Data)

- **MUST** use a Level 1 PCI-DSS compliant payment processor
- **MUST** never store, process, or transmit raw card data on our infrastructure
- **MUST** complete annual SAQ (Self-Assessment Questionnaire)
- **MUST** scan for vulnerabilities quarterly

## Consumer Protection

- **MUST** display full price including taxes before checkout confirmation
- **MUST** provide order confirmation within 5 minutes of payment
- **MUST** honour stated return policy
- **MUST** not use dark patterns in checkout flow (pre-checked boxes, hidden fees)

## Accessibility (WCAG 2.1 AA)

- **MUST** meet WCAG 2.1 Level AA for all user-facing changes
- **MUST** support keyboard-only navigation for checkout flow
- **MUST** provide text alternatives for non-text content
