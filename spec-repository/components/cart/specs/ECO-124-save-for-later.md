---
id: "ECO-124-save-for-later"
title: "Save-for-Later en Cart [Alto Nivel]"
component: "cart"
initiative: "ECO-124"
version: "1.0.0"
status: "approved"
author: "cart-team"
created_at: "2024-01-13"
approved_at: "2024-01-14"

implements: "ECO-124-platform-spec"
conforms_to:
  constitution: "1.0.0"
  data_governance: "1.0.0"

depends_on_contracts:
  - "events/CartUpdated@v1"

produces_contracts:
  - "events/CartUpdated@v1"    # additive: agrega saved_items[] al payload

references_adrs:
  - "cart/ADR-001"

gates_passed:
  - gate: "spec-gate"
    passed_at: "2024-01-14"
    score: 100

implementation_spec: "cart-service/docs/specs/ECO-124-save-for-later/"
---

## Context

Este documento define el **QUÉ** que debe hacer el Cart Service para soportar
la iniciativa ECO-124 (Guest Checkout). El CÓMO detallado — modelo de datos,
queries, endpoints exactos, casos edge — vive en el repo del servicio:
`cart-service/docs/specs/ECO-124-save-for-later/`.

Ver contexto completo en Platform Spec ECO-124.

## Comportamiento Esperado

El Cart Service DEBE permitir que un usuario (autenticado o guest) mueva
items de su carrito activo a una lista de "save for later" y los recupere
posteriormente, sin que esos items afecten el total del checkout.

Los saved items DEBEN persistir asociados al email del usuario durante
un máximo de 30 días.

## Functional Requirements

**AC-001**: Given un item en el carrito activo, When el usuario acciona
"save for later", Then el item desaparece del carrito activo y aparece
en la lista de saved items de la sesión.

**AC-002**: Given items en saved items, When el usuario accede a su carrito,
Then los saved items son visibles pero NO se incluyen en el subtotal ni en
el flujo de checkout.

**AC-003**: Given un item en saved items, When el usuario acciona "move to cart",
Then el item vuelve al carrito activo con la cantidad original.

**AC-004**: Given una sesión guest con saved items, When el usuario introduce
su email en el checkout, Then los saved items quedan asociados a ese email
y persisten durante 30 días.

**AC-005**: Given saved items asociados a un email, When el usuario se autentica
en cualquier sesión posterior, Then sus saved items se vinculan a su cuenta.

**AC-006**: Given un item en saved items que se queda sin stock, When el usuario
intenta moverlo al carrito, Then el sistema informa que el item no está disponible
y lo elimina de la lista de saved items.

## Non-Functional Requirements

- **Latencia**: operaciones de save/restore < 100ms p99
- **Consistencia**: eventual — no se requiere transacción fuerte entre
  cart_items y saved_items
- **TTL**: saved items expiran a los 30 días desde la fecha de guardado
- **Volumen esperado**: pico de 500 operaciones/min de save/restore

## Contract Output: CartUpdated (additive)

El evento `CartUpdated@v1` DEBE incluir el campo `saved_items[]` en su
payload. El campo es un array (vacío si no hay saved items).

```yaml
# Campo nuevo a agregar — backwards compatible
saved_items:
  type: array
  items:
    - saved_item_id: UUID
      product_id: UUID
      quantity: integer
      expires_at: ISO8601
  default: []
```

Los consumers existentes que ignoren este campo no se rompen.

## Out of Scope (Cart)

- Compartir saved items entre dispositivos sin cuenta (requiere autenticación)
- Límite de cantidad de items en saved list (sin límite en v1)
- Notificaciones de expiración de saved items (fase 2)
- Reemplazo automático por variante disponible si item sin stock

## Invariantes del Dominio

- Un item NO puede estar simultáneamente en `cart_items` y en `saved_items`
  para la misma sesión
- El precio mostrado en saved items es el precio actual del producto,
  no el precio al momento de guardar (puede haber cambiado)
- Los saved items NO bloquean stock — no hay reserva
