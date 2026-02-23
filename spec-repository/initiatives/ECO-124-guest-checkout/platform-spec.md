---
id: "ECO-124-platform-spec"
title: "Guest Checkout — Platform Feature Spec"
initiative: "ECO-124"
version: "1.0.0"
status: "approved"
author: "product-team"
created_at: "2024-01-10"
approved_at: "2024-01-12"
risk_level: "critical"

conforms_to:
  constitution: "1.0.0"
  ux_principles: "1.0.0"
  compliance: "1.0.0"
  data_governance: "1.0.0"

depends_on_contracts:
  - "events/CartUpdated@v1"
  - "events/OrderPlaced@v1"
  - "apis/checkout-api@v1"

produces_contracts:
  - "events/OrderPlaced@v2"

gates_passed:
  - gate: "spec-gate"
    passed_at: "2024-01-12"
    score: 98
---

## Problem Statement

El 34% del abandono en el flujo de checkout ocurre en el paso de autenticación.
Los usuarios guest — que representan el 61% del tráfico de product pages — no
pueden completar una compra sin crear una cuenta. Esto genera una pérdida
estimada de €180K/mes en conversión. Esta iniciativa elimina el requisito de
cuenta para comprar e introduce save-for-later para sesiones guest, reduciendo
la fricción en el punto más crítico del funnel.

## Goals & Success Metrics

| Goal | Metric | Current | Target | Timeframe |
|------|--------|---------|--------|-----------|
| Reducir abandono en auth step | Abandonment rate en checkout step 2 | 34% | < 18% | 60 días post-lanzamiento |
| Habilitar guest checkout | % de órdenes completadas como guest | 0% | > 55% | 30 días post-lanzamiento |
| Save-for-later engagement | Items guardados / sesión guest | 0 | > 0.8 | 60 días post-lanzamiento |
| Conversión anónima a cuenta | Guests que crean cuenta post-orden | — | > 22% | 60 días post-lanzamiento |

## Domain Responsibilities

| Domain | Responsabilidad en esta iniciativa |
|--------|------------------------------------|
| **Cart** | Mantener carrito y saved-items sin sesión autenticada. Save-for-later vinculado a email (no requiere cuenta). |
| **Checkout** | Orquestar flujo guest de 4 pasos. Merge de carrito guest → autenticado si el usuario se loguea mid-flow. |
| **Payments** | Autorizar y capturar pago sin cuenta registrada. Tokenización — datos de tarjeta nunca persisten en nuestros sistemas. |
| **Search** | Recomendaciones basadas en señales de sesión anónima (items vistos, categorías, carrito actual). Sin historial de usuario. |

## UX Flow (alto nivel)

```
Guest entra al checkout
        │
        ▼
[1] Cart Review         ← ver items, opción save-for-later
        │
        ▼
[2] Contact & Shipping  ← email (para confirmación), dirección
        │               ← aquí se captura PII mínimo necesario
        ▼
[3] Payment             ← tarjeta tokenizada, Apple/Google Pay
        │
        ▼
[4] Confirmation        ← orden confirmada + CTA "Crear cuenta para tracking"
```

Reglas UX:
- Nunca mostrar "debes crear una cuenta" como bloqueo
- El CTA de crear cuenta aparece SOLO en la página de confirmación (post-compra)
- Progress indicator visible en todos los pasos
- Order summary persistente en sidebar en desktop, colapsable en mobile

## Functional Requirements (Alto Nivel)

**AC-001**: Un usuario que no tiene cuenta puede completar una compra desde
cart hasta confirmación de orden sin necesidad de autenticarse.

**AC-002**: Un usuario guest puede mover un item del carrito a "save for later"
introduciendo su email; el sistema guarda el item por 30 días asociado a ese email.

**AC-003**: Un usuario guest que inicia sesión mid-checkout ve su carrito
guest fusionado con su carrito autenticado sin perder items.

**AC-004**: El sistema emite `OrderPlaced@v2` con `guest_session_id` populated
y `customer_id` null para órdenes guest.

**AC-005**: Las recomendaciones en cart y checkout se generan a partir de la
sesión anónima actual sin requerir historial de usuario.

## Non-Functional Requirements

- **Checkout completion p99**: < 3000ms (paso de pago incluido)
- **Cart operations p99**: < 200ms
- **Availability checkout**: 99.95% mensual
- **Error rate**: < 0.1% en flujo de pago
- **PII**: email de guest cifrado en reposo, nunca en logs en texto plano
- **Guest session TTL**: 24h de inactividad; saved-items TTL: 30 días

## Contract Changes

### OrderPlaced → v2 (additive, no breaking)
Campo nuevo: `guest_session_id` (string | null)
- null para órdenes de usuarios autenticados
- populated para órdenes guest
- Ver: `contracts/change-specs/CCH-001-order-placed-v2.md`

### CartUpdated → v1 (additive field, no version bump)
Campo nuevo: `saved_items[]` agregado al payload existente
- Array vacío `[]` para carritos sin saved-items (backwards compatible)

## Out of Scope

- Loyalty points para usuarios guest
- Guardar método de pago para uso futuro en sesiones guest
- Historial de órdenes para guests no convertidos a cuenta
- Recomendaciones personalizadas cross-sesión para guests
- Guest checkout en la app móvil nativa (fase 2)

## Risk & Rollback

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Fraude aumenta con guest checkout | Media | Alto | Velocity checks, 3DS para guests, fraud score mínimo |
| Merge de carrito genera duplicados | Media | Medio | Idempotency key + unit tests para merge logic |
| PCI scope se amplía | Baja | Alto | Tokenización delegada 100% a Stripe, threat model pre-launch |
| Save-for-later no convierte | Baja | Bajo | Feature flag, métrica monitoreada, rollback en 1 click |

**Feature flag**: `guest_checkout_enabled` (global) + `save_for_later_guest_enabled`
**Rollback**: Desactivar flag. Flujo vuelve a requerir autenticación.
**Canary**: 5% → 25% → 100% en ventanas de 48h

## Dependencies

- Stripe SDK actualizado para tokenización sin cuenta
- Fraud scoring service (existente) — verificar que acepta guest sessions
- Email service — confirmación de orden para guests

## Threat Model

Ver: [Threat Model ECO-124](../../../security/threat-models/ECO-124.md)
Security review sign-off: pendiente (blocker para ir a producción)
