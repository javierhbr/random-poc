# Data Governance & PII

> Version: 1.0.0 | Applies when: touches_pii, touches_payments

---

## PII Classification

| Data Type | Classification | Retention | Storage Rule |
|-----------|---------------|-----------|--------------|
| Email address | PII | 3 years | Encrypted at rest |
| Full name | PII | 3 years | Encrypted at rest |
| Shipping address | PII | 3 years | Encrypted at rest |
| IP address | PII | 90 days | Hashed in logs |
| Device fingerprint | PII | 90 days | Hashed in logs |
| Payment card number | Sensitive PII | Never stored | Tokenize immediately |
| CVV | Sensitive PII | Never stored | Never persist |

## MUST

- **MUST** encrypt PII at rest using AES-256
- **MUST** never log PII in plain text — hash or mask before logging
- **MUST** implement data deletion capability (right to erasure / GDPR)
- **MUST** document PII fields in API contracts and event schemas
- **MUST** complete a Privacy Impact Assessment (PIA) for any feature that introduces new PII collection
- **MUST** apply data minimization — collect only what is strictly necessary
- **MUST** honour user consent preferences — do not use data beyond declared purpose

## Guest User Data

- Guest session data MUST be tied to a session token, not a persistent user ID
- Guest PII collected during checkout (email for order confirmation) MUST be:
  - Used only for the declared purpose (order tracking, save-for-later recovery)
  - Retained for maximum 90 days post-order if not converted to account
  - Deleted on explicit request

## Data Residency

- EU customer data MUST remain within EU-region infrastructure
- Logs containing PII MUST NOT be exported to third-party analytics without explicit consent
