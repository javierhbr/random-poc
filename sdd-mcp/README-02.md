# Spec-Driven Development con MCP
## Playbook para plataformas multi-agente y multi-dominio

Este playbook define una metodología práctica para desarrollar software con:

- **Spec-Driven Development (SDD)**
- **SpecKit** (workflow disciplinado de specs)
- **MCP (Model Context Protocol)** como sistema de contexto gobernado
- **Spec Graph** para trazabilidad total

## 1. Introducción

El objetivo es construir sistemas complejos (por ejemplo, e-commerce) donde múltiples componentes y agentes trabajen de forma coherente, sin depender de conocimiento implícito o tribal.

## 2. Problema que resuelve

En sistemas distribuidos tradicionales:

- Cada equipo interpreta requerimientos de forma distinta
- Los contratos entre servicios se rompen
- No hay trazabilidad de decisiones
- Los cambios generan efectos colaterales inesperados
- El contexto está disperso (tickets, chats, docs, código)

Resultado típico:

- Bugs de integración
- Retrabajo
- Inconsistencia de UX
- Deuda técnica

## 3. Conceptos clave

### 3.1 Spec-Driven Development (SDD)

No se implementa código sin una especificación clara, validada y trazable.

Flujo:

```text
Discovery → Spec → Plan → Implement → Verify
```

### 3.2 SpecKit

SpecKit define:

- Estructura de specs
- Fases del desarrollo
- Gates obligatorios
- Criterio de “ready to implement”

### 3.3 MCP (Model Context Protocol)

Los MCP entregan contexto estructurado:

- Especificaciones globales
- Políticas de plataforma
- Contratos de integración
- Contexto de dominio
- Contexto de componente

No son documentos sueltos; son **contexto gobernado**.

### 3.4 Context Pack

Resultado de consultar MCPs. Incluye:

- Policies (MUST/SHOULD)
- Domain invariants
- Integration contracts
- Component constraints
- Templates y gates

### 3.5 Spec Graph

Grafo de specs, decisiones y dependencias:

```text
Initiative → Platform Spec → Component Specs → Contracts → ADRs
```

Permite trazabilidad completa.

## 4. Arquitectura de MCP

### 4.1 Tipos de MCP

1. **Platform MCP**
   - UX guidelines
   - Seguridad / PII
   - Observabilidad
   - Definition of Done

2. **Domain MCP**
   - Entidades
   - Invariantes
   - Eventos
   - Reglas de negocio

3. **Integration MCP**
   - APIs / eventos
   - Versionado
   - Consumidores
   - Compatibilidad

4. **Component MCP**
   - Arquitectura local
   - Patrones aprobados
   - Limitaciones
   - Runbooks

### 4.2 MCP Router

Selecciona contexto relevante y genera el **Context Pack**.

## 5. Flujo de desarrollo

```text
Roadmap / Initiative
  ↓
Platform Spec (SpecKit)
  ↓
MCP Router → Context Pack
  ↓
Component Specs (OpenSpec / SpecKit)
  ↓
Implementation
  ↓
Verification
  ↓
Spec Graph (historia)
```

## 6. Ejemplo: e-commerce

Dominios comunes:

- Catalog
- Search
- Cart
- Checkout
- Payments
- Fulfilment
- Shipping

### 6.1 Flujo con SDD

1. Se crea Platform Spec
2. Se definen UX flow, contratos, responsabilidades y NFR
3. Cada componente crea su spec
4. Se validan gates
5. Se implementa

### 6.2 Flujo sin SDD

- Cada equipo interpreta distinto
- Se rompen contratos
- QA detecta tarde
- Se aplican hotfixes

### 6.3 Comparación

| Sin SDD | Con SDD |
|---|---|
| Interpretación libre | Specs claras |
| Bugs de integración | Contratos versionados |
| Conocimiento tribal | Spec Graph |
| Retrabajo | Gates preventivos |

## 7. Plantilla SpecKit (MCP-Aware)

Cada sección debe declarar fuentes:

```text
Source: Platform MCP / Domain MCP / Integration MCP / Component MCP
```

### Estructura sugerida

1. Metadata
2. Problem Statement
3. Goals / Non-Goals
4. User Experience
5. Domain Understanding
6. Cross-Domain Interactions
7. Contracts
8. Component Responsibilities
9. Technical Approach
10. NFRs
11. Observability
12. Risks
13. Rollout
14. Testing
15. Acceptance Criteria
16. Gates
17. ADRs
18. References
19. Spec Graph Links

## 8. Change Requests

### 8.1 A nivel plataforma

- Nueva versión de Platform Spec
- Context Pack actualizado
- Impacto multi-componente

### 8.2 A nivel componente

- Change spec local
- Validación de impacto contractual
- Implementación controlada

## 9. Manejo de prioridades

Estados recomendados:

- Planned
- Discovery
- Draft
- Approved
- Implementing
- Paused
- Done

Reglas:

- No borrar specs
- Versionar cambios
- Rebase con nuevo Context Pack

## 10. ADRs bloqueantes

Estados:

- Proposed
- In Review
- Approved
- Rejected

Dependencia explícita:

```text
Spec → BlockedBy ADR
```

No se implementa hasta aprobación.

## 11. Bugs

### Bug normal

- Mini spec
- Validación rápida
- Fix
- Registro en Spec Graph

### Hotfix

```text
Incident → Hotfix Spec → Fix → Verify → Done
                 ↓
          Follow-up Spec
```

## 12. Hotfix Path

Requisitos mínimos:

- Impacto
- Rollback
- Observabilidad mínima
- Validación rápida

Después: hardening spec.

## 13. Mapeo con JIRA

- **Epic**: ECO-124
- **Platform Spec**: SPEC-PLAT-124
- **Component Specs**: SPEC-CART-001, SPEC-PAY-002
- **Contract Spec**: SPEC-CONTRACT-10
- **ADR**: ADR-100
- **Bug**: BUG-500
- **Hotfix**: HOTFIX-20

## 14. Spec Graph

```text
Initiative
├── Platform Spec
│   ├── Component Specs
│   ├── Contract Specs
│   └── ADRs
```

## 15. Beneficios

- Consistencia global
- Menos bugs de integración
- Trazabilidad completa
- Escalabilidad organizacional
- Mejor soporte para agentes AI

## 16. Reglas clave

1. No implementar sin spec
2. Toda spec debe declarar fuentes MCP
3. No cambiar contratos sin Contract Spec
4. Toda decisión importante debe tener ADR
5. Todo cambio debe ser trazable

## 17. Insight final

Este modelo convierte el desarrollo en un sistema de conocimiento ejecutable:

- SpecKit: disciplina
- MCP: contexto
- Specs: verdad operativa
- Spec Graph: memoria institucional

## 18. Siguiente paso

Para operarlo en producción se necesita:

- Repositorio de specs
- MCP (conceptual o implementado)
- Templates estandarizados
- Integración con JIRA
- Cultura spec-first
