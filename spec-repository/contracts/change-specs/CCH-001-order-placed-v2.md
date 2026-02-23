---
id: "CCH-001"
title: "OrderPlaced → v2: Soporte para órdenes guest"
status: "approved"
approved_at: "2024-01-14"
initiative: "ECO-124"
author: "checkout-team"
contract: "events/OrderPlaced"
from_version: "v1"
to_version: "v2"
breaking: false
strategy: "additive"
---

## Motivation

La iniciativa ECO-124 introduce guest checkout. El evento `OrderPlaced` necesita
soportar órdenes donde `customer_id` es null (no hay cuenta) y en cambio
se propaga un `guest_session_id` para trazabilidad.

## Cambios

### Campo: `customer_id`
- **v1**: `required: true` (UUID)
- **v2**: `required: false, nullable: true` (UUID | null)
- **Impacto**: cambio de semántica en un campo existente

> ⚠️ Aunque el campo ya existía, cambiar de `required` a `nullable` es un
> cambio de semántica. Los consumers que asumen que `customer_id` siempre
> está presente DEBEN actualizarse.

### Campo nuevo: `guest_session_id`
- **Tipo**: UUID | null
- **Presente cuando**: orden completada como guest
- **Null cuando**: orden de usuario autenticado

### Campo nuevo: `guest_email`
- **Tipo**: string | null (SHA-256 hash)
- **Presente cuando**: orden completada como guest con email
- **PII**: el valor en el payload es el hash, nunca el email en claro

## Consumers — Plan de Migración

| Consumer | Acción requerida | Deadline |
|----------|-----------------|----------|
| fulfilment-service | Manejar `customer_id: null` — usar `guest_session_id` para trazabilidad | 2024-02-14 |
| analytics-service | Actualizar pipeline para campos nuevos y `customer_id` nullable | 2024-02-14 |
| notifications-service | Manejar guest orders: usar email de `guest_email` desencriptado desde payments | 2024-02-14 |
| loyalty-service | Ignorar órdenes guest (sin puntos para guests) — `customer_id: null` indica guest | 2024-02-14 |

## Backwards Compatibility

- Los campos nuevos son opcionales con valor null
- `customer_id` pasa de required a nullable — ÚNICO riesgo de breaking
- Periodo de coexistencia: v1 + v2 activos hasta **2024-04-14** (90 días)
- Los consumers que consumen v1 seguirán recibiéndolo hasta sunset

## Testing

- [ ] Consumer contract test actualizado para cada consumer listado
- [ ] Provider contract test actualizado en checkout-service
- [ ] Test: orden guest emite v2 con `customer_id: null` y `guest_session_id: UUID`
- [ ] Test: orden autenticada emite v2 con `customer_id: UUID` y `guest_session_id: null`
