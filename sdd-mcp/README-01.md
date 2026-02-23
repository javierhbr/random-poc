A continuación tienes una guía integral (conceptual y operativa) para aplicar Spec-Driven Development (SDD) con SpecKit + MCPs + Specs versionadas + Spec Graph, en una plataforma tipo e-commerce multi-dominio. Incluye comparaciones “con y sin SDD”, manejo de cambios, prioridades, ADRs bloqueantes, bugs/hotfix y ejemplos estilo JIRA.

⸻

Guía: SDD con SpecKit + MCPs para plataformas multi-componente

Qué hace esta metodología

Objetivo

Asegurar que cualquier agente (humano o IA) que implemente una funcionalidad en un componente (Payments, Cart, Search…) lo haga:
- alineado al producto/plataforma (UX, seguridad, observabilidad, estándares)
- sin inventar contexto (bounded contexts, invariantes, contratos)
- con trazabilidad (qué spec implementó, qué decisión lo habilitó, qué contratos cambió)
- sin romper integraciones (eventos/APIs versionadas)

Rol de los MCP

Los MCPs son el “sistema de acceso a conocimiento gobernado” para agentes. Sirven para:
- entregar Context Packs (paquetes relevantes) con:
- policies de plataforma (MUST/SHOULD)
- invariantes del dominio
- contratos de integración y consumidores
- contexto local del repo
- ejemplos canónicos y anti-patterns
- habilitar gates del proceso SpecKit (“no pasas si no cumples”)
- preservar historia (versiones de políticas/contratos/specs)

En simple: los MCP no son docs; son “contexto curado y verificable” para implementar specs correctamente en el ecosistema.

⸻

Cómo funciona (visión general)

Diagrama general de flujo
```text
┌──────────────────────────┐
│ Roadmap / Product Intent  │
└─────────────┬────────────┘
              ▼
┌──────────────────────────┐
│ Platform Spec (SpecKit)   │  <-- "qué" + UX end-to-end + NFR + contratos
└─────────────┬────────────┘
              ▼
┌──────────────────────────┐
│ MCP Router / Context Pack │  <-- junta policies + invariants + contracts + local ctx
└───────┬───────────┬──────┘
        ▼           ▼
┌──────────────┐  ┌─────────────────┐
│ Platform MCP  │  │ Component MCPs  │
└──────┬───────┘  └───────┬─────────┘
       ▼                  ▼
  Context Pack        Local Context Pack
       └──────────────┬───────────────┘
                      ▼
         ┌────────────────────────┐
         │ Component Specs         │  <-- "cómo" por dominio
         │ (OpenSpec o SpecKit)    │
         └────────────┬───────────┘
                      ▼
         ┌────────────────────────┐
         │ Implementation + Verify │
         └────────────┬───────────┘
                      ▼
         ┌────────────────────────┐
         │ Spec Graph (History)    │  <-- trazabilidad total
         └────────────────────────┘
```

⸻

Comparación: desarrollo sin SDD vs con SDD + MCP

Ejemplo realista: “Guest Checkout” en e-commerce

Sin SDD (patrón común)
- Product pide “Guest Checkout”
- Checkout implementa “como entiende”
- Cart asume otra cosa
- Payments rompe compatibilidad de evento
- Fulfilment recibe order incompleta
- QA descubre inconsistencias al final
- Se arregla con hotfixes + reuniones + “tribal knowledge”

Resultado típico:
- integraciones rotas
- specs “en la cabeza”
- deuda técnica + retrabajo
- decisiones no registradas
- cada equipo interpreta distinto

Con SDD + MCP (mismo caso)
- Se crea Platform Spec (SpecKit) con:
- UX end-to-end
- responsabilidades por dominio
- contratos/events y compatibilidad
- NFR (PII, auditoría, observabilidad)
- Cada componente crea su Component Spec (OpenSpec/SpecKit) referenciando:
- la Platform Spec
- políticas de plataforma
- invariantes del dominio
- contratos vigentes
- Cambios a contratos pasan por Contract Spec + versionado
- Gates evitan implementar sin evidencia

Resultado típico:
- coherencia UX y técnica
- compatibilidad controlada
- trazabilidad (“qué cambió y por qué”)
- menos incidentes de integración

⸻

Pasos para implementarla en tu organización

Paso 1: Define el “Sistema de Verdad”

Necesitas 4 “bibliotecas” (no tecnológicas; conceptuales):
1. Platform Policies & Constitution
- UX principles, accesibilidad, seguridad/PII, observabilidad, quality bar, Definition of Done

2. Domain Knowledge
- bounded contexts, ownership, entidades, invariantes, eventos del dominio

3. Integration Contracts Registry
- APIs/events versionados, consumidores, reglas de compatibilidad y deprecación

4. Component Context
- arquitectura local, patrones aprobados, constraints, runbooks, ejemplos canónicos

Estas 4 alimentan los MCP (Platform / Domain / Integration / Component).

⸻

Paso 2: Estándar de Specs (SpecKit)
- Adopta una plantilla única (como la que ya definimos)
- Obliga a incluir en cada sección: Source: Platform/Domain/Integration/Component

Esto es lo que convierte el proceso en “anti-invención”.

⸻

Paso 3: Define “Gates” (lo que bloquea avance)

Ejemplos de gates típicos:
- Context Completeness Gate: todas las fuentes y versiones citadas
- Domain Validity Gate: no rompe invariantes
- Integration Safety Gate: consumidores identificados + compat plan
- NFR Gate: logging/metrics/tracing + seguridad + performance
- Ready-to-Implement Gate: spec ejecutable, sin ambigüedad

⸻

Paso 4: Decide la división Platform Spec vs Component Specs

Regla simple:
- Platform Spec define “qué” + UX + contratos + responsabilidades.
- Component Spec define “cómo” dentro del repo: data model, lógica, pruebas, rollout local.

⸻

Paso 5: Spec Graph (historia)

Cada spec debe enlazar:
- Implements (spec padre)
- DependsOn (contratos/policies/ADRs)
- Affects (dominios, APIs, eventos)
- Status (draft/review/approved/implemented)

Esto hace que puedas auditar y navegar decisiones con el tiempo.

⸻

Cómo aplicar un Change Request a un Context Pack

Un Change Request (CR) es una modificación de alcance/contrato/política que afecta una spec o su contexto.

Caso A: Change Request a nivel Plataforma (cross-domain)

Ejemplos:
- cambia el flujo UX
- cambia un contrato de evento compartido
- cambia una policy (PII, observabilidad, performance bar)

Proceso:
1. CR genera una Platform Change Spec (o nueva versión de Platform Spec)
2. El MCP Router produce un Context Pack v2 (policies/contracts actualizados)
3. Se crea una lista de Component Impact:
   - qué specs locales quedan “stale”
   - qué componentes deben rebaselinar su spec
4. Cada componente crea un Component Change Spec o actualiza su spec

Resultado: plataforma y componentes se re-alinean con versiones claras.

Caso B: Change Request aislado a un componente (local)

Ejemplos:

- optimización interna
- refactor sin afectar contratos
- feature local no cross-domain

Proceso:

1. CR genera una Component Change Spec
2. Se consulta Component MCP + Platform MCP (para NFR/quality bar)
3. Gate de integración verifica que no hay impacto a contratos
4. Se implementa y se registra en el Spec Graph

⸻

Cómo manejar cambios de prioridad de features

En la vida real, prioridades cambian cada semana. Con SDD+MCP lo manejas sin caos con estas reglas:

Regla 1: la Iniciativa (roadmap item) manda

Todo trabajo está anclado a una Initiative ID (ej. ECO-124).

Regla 2: estados claros por iniciativa

- Planned
- In Discovery
- Spec Draft
- Approved
- Implementing
- Paused (por prioridad)
- Cancelled
- Done

Regla 3: “Pause” no destruye historia

Si se reprioriza:

- se marca Paused
- se congela la versión de specs actuales
- se registra un mini-ADR o nota de decisión (“pausado por Q2 focus shift”)
- cuando vuelve, se hace Rebase con nuevo Context Pack (policies/contracts vigentes)

⸻

ADRs no aprobados que bloquean otra spec

Esto pasa mucho en sistemas grandes: “necesito decidir X antes de implementar Y”.

Patrón recomendado: ADR como “Dependency” explícita

Una spec debe poder declarar:
- BlockedBy ADR-XYZ

Flujo de bloqueo:

1. Spec detecta decisión necesaria → crea ADR Draft

2. El ADR queda con estado:

   - Proposed → In Review → Approved / Rejected

3. Mientras esté en Proposed/In Review:

   - las specs dependientes quedan en Blocked
   - se pueden avanzar secciones no dependientes (Discovery, riesgos, pruebas), pero no pasar Gate Ready-to-Implement

Qué gana esto:

- no se implementa con decisiones “implícitas”
- se evita retrabajo por cambiar decisión tarde
- el bloqueo es visible (tracking)

⸻

Manejo de bugs y hotfix

Bug normal (no urgente)

Tratamiento como “mini-spec” con contexto mínimo:

1. Crear Bug Spec (ligero)
2. Source mínimo:

   - Component MCP (cómo funciona aquí)
   - Platform MCP (calidad / observabilidad)
3. Gate rápido:

   - reproduce
   - impacto
   - fix plan
   - pruebas

4. Implementar + verificar
5. Actualizar Spec Graph (link a bug)

Hotfix (urgente, producción)

Necesitas velocidad pero sin romper gobernanza. Se usa un “Hotfix Path”:

Hotfix Path (controlado):
- se permite implementar con spec mínima pre-aprobada (plantilla corta)
- requisito obligatorio:
- impacto y rollback
- observabilidad mínima (logs/metric)
- verificación rápida (test mínimo + reproducibilidad)
- post-fix: se crea “Follow-up Spec” (deuda) para:
- tests completos
- refactor si aplica
- documentación y ADR si hubo decisión

Esto refleja la realidad: en producción a veces se parchea, pero sin perder trazabilidad.

⸻

Ejemplos de “situaciones reales” que esto evita
- Breaking change accidental: cambiar un evento que consume Fulfilment y romper envíos
- UX inconsistente: Checkout muestra “free shipping” pero Shipping domain no lo soporta
- Reglas duplicadas: Cart y Checkout implementan validación de stock distinta
- Observabilidad incompleta: incidente sin trazas/métricas para diagnosticar
- Decisiones en Slack: nadie recuerda por qué se eligió cierto approach

Con SDD+MCP, estas situaciones se fuerzan a aparecer en la spec (contratos, invariantes, gates).

⸻

Ejemplos estilo JIRA para tracking por producto

Abajo algunos tickets típicos (formato conceptual):

1) Epic (Iniciativa de producto)

ECO-124 — Guest Checkout + Save-for-Later
- Owner: Product Platform
- Status: In Discovery
- Links:
- Platform Spec: SPEC-PLAT-124 v1
- Contract Spec (si aplica): SPEC-CONTRACT-77 v2
- Components: Cart / Checkout / Payments / Shipping

2) Story (Platform Spec)

SPEC-PLAT-124 — Platform Spec (SpecKit)
- Includes:
- UX flow end-to-end
- Domain responsibilities
- NFR pack
- Contract baseline references
- Acceptance:
- pasa gates globales
- lista de impactos por componente

3) Tasks por componente (Implementation Specs)

SPEC-CART-881 — Cart Implementation Spec
- Implements: SPEC-PLAT-124 v1
- DependsOn: Contract CartUpdated v3
- Status: Draft → Review → Approved → Implementing

SPEC-PAY-552 — Payments Implementation Spec
- DependsOn: ADR-219 idempotency approach
- Status: Blocked

4) Contract Change (si cambias eventos)

SPEC-CONTRACT-77 — OrderPlaced v2
- Consumers impacted: Fulfilment, Shipping, Analytics
- Compatibility plan: dual publish / deprecate schedule

5) ADR ticket

ADR-219 — Idempotency strategy for payment capture
- Status: In Review
- Blocks: SPEC-PAY-552

6) Bug ticket

BUG-3321 — Checkout fails when cart has saved items
- Linked Spec: SPEC-CHECKOUT-104
- Fix Spec: SPEC-HOTFIX-12 (si urgente)

7) Hotfix ticket

HOTFIX-12 — Production: payment authorization timeout
- Required fields:
- impact
- mitigation
- rollback
- postmortem follow-up spec link

⸻

Un diagrama de estados para manejar prioridad, bloqueos y hotfix
```
Planned
  ▼
Discovery
  ▼
Spec Draft ───────────────► Paused (priority shift)
  ▼                            │
In Review                      │ (rebase w/ new context pack)
  ▼                            ▼
Approved ───────────────► Blocked (ADR pending)
  ▼                            │
Implementing                   │ (ADR approved)
  ▼                            ▼
Verify / Release          Approved (resume)
  ▼
Done

HOTFIX PATH:
Production incident → Hotfix Spec (minimal) → Implement → Verify → Done
                                  │
                                  ▼
                          Follow-up Spec (hardening)
```

⸻

Checklist de implementación (práctico)

- [ ] Definir Platform Constitution (policies/NFR/UX)
- [ ] Definir Domain Map (bounded contexts + ownership + invariants)
- [ ] Definir Contract Registry (events/APIs + consumers + versioning)
- [ ] Definir Component Context packs (por repo)
- [ ] Estándar de SpecKit template (con Sources por sección)
- [ ] Establecer Gates + estados
- [ ] Definir Hotfix Path + post-fix hardening
- [ ] Adoptar Initiative ID + Spec Graph links en cada spec
- [ ] Integrar con JIRA: Epic=Initiative, Story=Platform Spec, Tasks=Component Specs, ADR/Contract/Bug como issue types

