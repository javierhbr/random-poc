# UX Principles

> Version: 1.0.0 | Applies when: external_facing, new_feature

---

## MUST

- **MUST** never use dark patterns: pre-checked opt-ins, hidden fees, misleading CTAs
- **MUST** show progress indicators for multi-step flows (e.g. checkout steps)
- **MUST** display the total price including taxes and shipping before the final confirmation step
- **MUST** provide clear error messages — state what went wrong and how to fix it
- **MUST** support guest flows for any purchase — account creation is never mandatory
- **MUST** preserve user data on validation errors (do not clear the form)
- **MUST** confirm destructive actions (e.g. remove item, cancel order)

## SHOULD

- **SHOULD** reduce the number of steps to complete checkout to the minimum necessary
- **SHOULD** remember user preferences (shipping address, payment method) for logged-in users
- **SHOULD** provide inline validation — do not wait for form submission to show errors
- **SHOULD** support autofill for address and payment fields

## Checkout-Specific Rules

- Maximum 4 steps in checkout: Cart → Details → Payment → Confirmation
- Each step MUST have a clear back navigation
- Order summary MUST be visible on every checkout step
- Payment step MUST show accepted payment methods upfront

## Mobile

- Touch targets MUST be at minimum 44x44px
- Forms MUST trigger appropriate mobile keyboard (numeric for card number, email for email field)
- CTA buttons MUST be thumb-reachable (bottom of viewport preferred)
