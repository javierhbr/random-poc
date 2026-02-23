---
id: "ECO-124-anonymous-recommendations"
title: "Anonymous Session Recommendations [Alto Nivel]"
component: "search"
initiative: "ECO-124"
version: "0.1.0"
status: "not-started"
author: "search-team"
created_at: "2024-01-17"

implements: "ECO-124-platform-spec"
conforms_to:
  constitution: "1.0.0"
  data_governance: "1.0.0"

depends_on_contracts:
  - "events/CartUpdated@v1"

produces_contracts: []
references_adrs: []
gates_passed: []
---

## Context

El Search Service DEBE proveer recomendaciones de productos relevantes
durante el checkout guest, basadas únicamente en señales de la sesión
actual (items en carrito, categorías navegadas, items vistos).

## Functional Requirements

**AC-001**: Given una sesión anónima con items en el carrito, When se solicitan
recomendaciones, Then el sistema devuelve hasta 6 productos relacionados
basados en las categorías y atributos de los items del carrito.

**AC-002**: Given recomendaciones para una sesión guest, When se generan,
Then no se usa ningún dato de historial de usuario — solo la sesión actual.

**AC-003**: Given un item añadido al carrito, When el servicio recibe
`CartUpdated`, Then actualiza las recomendaciones para esa sesión.

## Non-Functional Requirements

- **Latencia p99**: < 150ms para devolver recomendaciones
- **Privacidad**: ningún dato de sesión anónima se persiste más de 24h
- **Relevancia**: CTR de recomendaciones anónimas ≥ 60% del CTR de recomendaciones autenticadas

## Out of Scope (Search)

- Recomendaciones cross-sesión para guests (requiere cuenta)
- A/B testing de algoritmos de recomendación (fase 2)
- Recomendaciones basadas en comportamiento de usuarios similares (collaborative filtering) para guests
