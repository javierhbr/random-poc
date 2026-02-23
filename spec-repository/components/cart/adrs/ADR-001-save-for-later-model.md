---
id: "cart/ADR-001"
title: "Save-for-later: tabla separada vs flag en cart_items"
status: "accepted"
date: "2024-01-13"
initiative: "ECO-124"
author: "cart-team"
deciders:
  - "cart-team-lead"
  - "platform-architect"
---

## Contexto

Para implementar save-for-later necesitamos decidir cómo modelar en base de
datos los items guardados. Hay dos opciones principales.

## Opciones Consideradas

### Opción A: Flag `is_saved` en `cart_items`
Añadir una columna booleana `is_saved` a la tabla existente `cart_items`.

**Pros:**
- Cambio mínimo en schema
- Un solo query recupera todo el carrito

**Contras:**
- La tabla `cart_items` mezcla dos conceptos distintos
- Los queries de checkout deben filtrar siempre por `is_saved = false`
  (riesgo de incluir saved items en el total si se olvida el filtro)
- TTL diferente para saved items (30 días) vs cart items (sesión)
  complica la lógica de expiración
- La invariante "item no puede estar en ambas listas" se vuelve compleja

### Opción B: Tabla separada `saved_items` ← ELEGIDA
Crear una tabla nueva `saved_items` independiente de `cart_items`.

**Pros:**
- Separación clara de conceptos — dos listas, dos tablas
- Queries de checkout no necesitan filtrar por `is_saved`
- TTL independiente con índice propio en `expires_at`
- La invariante se implementa con una constraint o lógica explícita
- Más fácil de evolucionar (añadir campos como `note`, `priority`)

**Contras:**
- Schema migration adicional
- Dos queries para renderizar el carrito completo (activo + saved)
  — mitigado con una vista o query paralela

## Decisión

**Tabla separada `saved_items`** (Opción B).

El riesgo de bugs en checkout por olvidar el filtro `is_saved` supera el
costo de una tabla adicional. La claridad conceptual y la seguridad en
checkout son prioritarias.

## Consecuencias

- Nueva tabla `saved_items` en la próxima migración DB
- El endpoint `GET /cart` devuelve ambas listas en la respuesta
- El job de expiración opera sobre `saved_items.expires_at` con índice dedicado
- Los tests de checkout deben verificar que saved items no aparecen en el total
