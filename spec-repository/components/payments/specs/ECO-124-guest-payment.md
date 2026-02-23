---
id: "ECO-124-guest-payment"
title: "Guest Payment Processing [Alto Nivel]"
component: "payments"
initiative: "ECO-124"
version: "0.5.0"
status: "draft"
author: "payments-team"
created_at: "2024-01-16"

implements: "ECO-124-platform-spec"
conforms_to:
  constitution: "1.0.0"
  security: "1.0.0"
  compliance: "1.0.0"
  data_governance: "1.0.0"

depends_on_contracts:
  - "stripe-api@external"

produces_contracts:
  - "events/PaymentAuthorized@v1"
  - "events/PaymentFailed@v1"

references_adrs: []
gates_passed: []

blockers:
  - "Threat model sign-off pendiente (security-team)"
  - "Definir fraud score mínimo para guest checkout"
---

## Context

El Payments Service DEBE soportar autorización y captura de pagos para
usuarios sin cuenta (guest). Los datos de tarjeta NUNCA tocan nuestros
sistemas — se tokeniza 100% via Stripe Elements en el frontend.

## Comportamiento Esperado

El servicio DEBE aceptar un payment intent de un usuario guest,
pasarlo a Stripe para autorización con 3DS cuando el fraud score lo requiera,
y emitir `PaymentAuthorized` o `PaymentFailed` sin persistir ningún dato
de tarjeta en nuestra infraestructura.

## Functional Requirements

**AC-001**: Given un guest con items en checkout, When provee datos de tarjeta
via Stripe Elements, Then el Payments Service crea un PaymentIntent en Stripe
y devuelve el client_secret para que el frontend complete la autorización.

**AC-002**: Given un PaymentIntent de un guest confirmado por Stripe, When
el webhook de Stripe lo notifica, Then el servicio emite `PaymentAuthorized`
con `customer_id: null` y `guest_session_id` populated.

**AC-003**: Given un pago guest con fraud score > umbral definido, When se
intenta autorizar, Then el sistema activa 3DS obligatorio antes de proceder.

**AC-004**: Given un pago guest fallido, When Stripe lo reporta, Then el
sistema emite `PaymentFailed` con el código de error y el guest puede reintentar.

**AC-005**: Given cualquier operación de pago, When se procesa, Then ningún
dato de tarjeta (PAN, CVV, expiry) persiste en nuestra base de datos o logs.

## Non-Functional Requirements

- **Autorización p99**: < 2000ms (incluye round-trip a Stripe)
- **Disponibilidad**: 99.99%
- **Idempotencia**: crear PaymentIntent DEBE ser idempotente (idempotency-key)
- **PCI**: datos de tarjeta nunca en nuestra infraestructura (Stripe JS tokeniza en cliente)
- **Retención**: payment records se retienen 7 años (requisito fiscal)

## Out of Scope (Payments)

- Guardar métodos de pago para guests (requiere cuenta Stripe Customer)
- Reembolsos iniciados por guests directamente (pasan por customer service)
- Wallets (Apple Pay, Google Pay) — fase 2

## Invariantes del Dominio

- No se captura pago sin order_id válido y confirmado por Checkout
- Cada intento de pago tiene un idempotency-key único
- El amount capturado DEBE coincidir exactamente con el amount autorizado
- Los webhooks de Stripe DEBEN verificarse con firma HMAC antes de procesar

## Security Notes

- Threat model requerido antes de ir a producción (blocker)
- 3DS thresholds a definir con fraud team
- Rate limiting: max 5 intentos de pago por session_id en 30 minutos
