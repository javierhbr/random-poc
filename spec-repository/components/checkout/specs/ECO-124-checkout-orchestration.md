---
id: "ECO-124-checkout-orchestration"
title: "Guest Checkout Orchestration [Alto Nivel]"
component: "checkout"
initiative: "ECO-124"
version: "0.9.0"
status: "in-progress"
author: "checkout-team"
created_at: "2024-01-15"

implements: "ECO-124-platform-spec"
conforms_to:
  constitution: "1.0.0"
  ux_principles: "1.0.0"
  compliance: "1.0.0"

depends_on_contracts:
  - "apis/cart-api@v1"
  - "apis/payments-api@v1"
  - "events/PaymentAuthorized@v1"

produces_contracts:
  - "events/OrderPlaced@v2"

references_adrs: []

gates_passed: []
---

## Context

El Checkout Service DEBE orquestar el flujo de compra completo para usuarios
guest sin requerir autenticación. El detalle de implementación vive en
`checkout-service/docs/specs/ECO-124-checkout-orchestration/`.

## Comportamiento Esperado

El servicio DEBE guiar a un usuario guest por un flujo de 4 pasos (Cart →
Shipping → Payment → Confirmation) y emitir `OrderPlaced@v2` al completar
la compra con `customer_id: null` y `guest_session_id` populated.

## Functional Requirements

**AC-001**: Given un carrito con items, When un usuario sin cuenta inicia
el checkout, Then puede avanzar por todos los pasos sin que el sistema
requiera crear una cuenta.

**AC-002**: Given un usuario en el paso de Shipping que introduce su email,
When el email corresponde a una cuenta existente, Then el sistema sugiere
iniciar sesión pero NO lo obliga — puede continuar como guest.

**AC-003**: Given un usuario guest que inicia sesión en cualquier paso del
checkout, Then su carrito guest se fusiona con su carrito autenticado y
el checkout continúa con todos los items.

**AC-004**: Given una orden guest completada, When el sistema confirma el pago,
Then emite `OrderPlaced@v2` con `guest_session_id` filled y `customer_id: null`.

**AC-005**: Given la página de confirmación de orden guest, When se muestra,
Then incluye un CTA "Crear cuenta para gestionar tu pedido" con el email
pre-rellenado.

**AC-006**: Given un error en el paso de Payment, When ocurre, Then el usuario
puede reintentar sin perder los datos de Shipping ya introducidos.

## Non-Functional Requirements

- **Checkout completion p99**: < 3000ms (pasos 1-3 acumulados, excl. payment processor)
- **Step transitions p99**: < 500ms
- **Disponibilidad**: 99.95%
- **Idempotencia**: cada paso DEBE ser idempotente — reintentos seguros

## Contract Output: OrderPlaced@v2

```yaml
event_type: "OrderPlaced"
version: "2.0.0"
payload:
  order_id: UUID
  customer_id: UUID | null      # null para guests
  guest_session_id: UUID | null # populated para guests
  guest_email: string | null    # hashed en logs, plain en payload cifrado
  items: array
  total_amount: number
  currency: string
  shipping_address: object
  placed_at: ISO8601
```

## Out of Scope (Checkout)

- Checkout en múltiples pestañas simultáneas (comportamiento no definido)
- Guardar dirección de shipping para futuros pedidos guest
- Express checkout (Apple Pay / Google Pay) — fase 2
- Reordenar orden previa como guest

## Invariantes del Dominio

- No se crea una orden sin autorización de pago confirmada
- El precio de cada item al crear la orden DEBE ser el precio vigente
  al momento del checkout, no el precio al añadir al carrito
- Una sesión guest no puede ser checkout en paralelo (lock por session_id)
