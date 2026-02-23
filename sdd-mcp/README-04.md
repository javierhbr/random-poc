# One Pager
## Spec-Driven Development (SDD) con SpecKit + MCPs para plataformas multi-componente

### Problema

En plataformas modernas (e-commerce, fintech, SaaS), el desarrollo distribuido por dominios suele generar:

- Interpretaciones distintas del mismo requerimiento
- Inconsistencias de experiencia de usuario
- Cambios que rompen contratos entre servicios
- Decisiones no documentadas (conocimiento tribal)
- Retrabajo y bugs de integración

El problema principal no es solo el código: es la falta de una fuente de verdad ejecutable.

### Solución

Adoptar SDD con:

- **SpecKit**: disciplina de proceso (cómo se trabaja)
- **MCPs**: acceso a contexto gobernado (qué se debe cumplir)
- **Spec Graph**: trazabilidad total (qué se hizo y por qué)

### Concepto clave

No se escribe código sin una spec validada contra el contexto del sistema.

Los agentes (humanos o IA) no inventan contexto: lo consumen desde MCPs.

### Componentes

1. **SpecKit (workflow)**
   - Discovery → Spec → Plan → Implement → Verify
   - Plantillas
   - Gates obligatorios
   - Definition of Done

2. **MCP (Model Context Protocol)**
   - Platform MCP: UX, seguridad, observabilidad
   - Domain MCP: invariantes, entidades
   - Integration MCP: APIs/eventos, versionado
   - Component MCP: contexto local

3. **Specs**
   - Qué se construye (plataforma)
   - Cómo se implementa (componente)
   - Cómo se integra (contratos)

4. **Spec Graph**
   - Initiative → Platform Spec → Component Specs → Contracts → ADRs

### Flujo de trabajo

```text
Roadmap
  ↓
Platform Spec (SpecKit)
  ↓
MCP Router → Context Pack
  ↓
Component Specs
  ↓
Implementation
  ↓
Validation (Gates)
  ↓
Spec Graph
```

### Ejemplo (Guest Checkout)

- Platform Spec define UX end-to-end, responsabilidades y contratos
- Cart, Checkout y Payments crean specs locales
- Integration MCP valida compatibilidad
- Gates previenen inconsistencias

### Comparación

| Sin SDD | Con SDD |
|---|---|
| Specs implícitas | Specs explícitas |
| Bugs de integración | Contratos versionados |
| Decisiones en chats | ADRs trazables |
| Retrabajo | Gates preventivos |

### Beneficios

- Consistencia entre equipos
- Menos bugs de integración
- Trazabilidad completa
- Mejor onboarding
- Mejor soporte para agentes IA

### Insight

SDD + MCP convierte el desarrollo en un sistema de conocimiento ejecutable.

---

# Six Pager
## Spec-Driven Development con SpecKit + MCPs para plataformas multi-componente

### 1. Contexto

Las plataformas modernas incluyen múltiples dominios (Catalog, Search, Cart, Checkout, Payments, Shipping, Fulfilment), cada uno con su propio modelo, lógica y equipo.

La fricción aparece porque la experiencia del usuario es única, pero la implementación es distribuida.

### 2. Problema estructural

Sin un sistema de specs:

1. Desalineación de interpretación entre equipos
2. Integraciones frágiles por cambios en APIs/eventos
3. Falta de trazabilidad de decisiones
4. Dependencia del conocimiento individual

### 3. Principio base

Diseñar el sistema como una red de conocimiento, no solo como código.

### 4. Componentes de la solución

#### 4.1 SpecKit (proceso)

Fases:

1. Discovery
2. Spec
3. Plan
4. Implementation
5. Verification

Gates:

- Context completeness
- Domain validity
- Integration safety
- NFR compliance
- Implementation readiness

No se avanza si no se cumple el gate.

#### 4.2 MCP (contexto)

- **Platform MCP**: UX guidelines, seguridad, observabilidad, Definition of Done
- **Domain MCP**: entidades, estados, invariantes
- **Integration MCP**: APIs, eventos, versionado, consumidores
- **Component MCP**: arquitectura local, patrones, limitaciones

El **MCP Router** combina fuentes y genera el Context Pack.

#### 4.3 Context Pack

Contiene:

- Policies (MUST/SHOULD)
- Domain invariants
- Contracts
- Constraints locales
- Templates
- Gates

#### 4.4 Specs

Tipos principales:

- Platform Spec
- Component Spec
- Contract Spec
- ADR

#### 4.5 Spec Graph

```text
Initiative
 ├── Platform Spec
 │   ├── Component Specs
 │   ├── Contract Specs
 │   └── ADRs
```

### 5. Flujo de desarrollo

```text
Roadmap
  ↓
Platform Spec
  ↓
Context Pack (MCP)
  ↓
Component Specs
  ↓
Implementation
  ↓
Verification
  ↓
Spec Graph
```

### 6. Ejemplo real: Guest Checkout

#### Sin SDD

- Checkout implementa flujo
- Cart maneja estados distintos
- Payments rompe eventos
- Shipping falla
- QA detecta tarde

Resultado: bugs + retrabajo.

#### Con SDD

- Platform Spec define UX, contratos y responsabilidades
- Component Specs detallan implementación por dominio
- Contract Specs versionan cambios
- Gates validan consistencia antes de implementar

Resultado: coherencia y menos errores.

### 7. Change Management

#### 7.1 Change Request de plataforma

- Nueva versión de spec
- Actualización de context pack
- Impacto multi-componente

#### 7.2 Change Request de componente

- Spec local
- Validación de contratos
- Implementación

### 8. Prioridades

Estados sugeridos:

- Planned
- Draft
- Approved
- Implementing
- Paused
- Done

Regla: no eliminar specs, solo versionarlas.

### 9. ADRs

Estados:

- Proposed
- In Review
- Approved
- Rejected

Dependencia explícita:

```text
BlockedBy ADR
```

### 10. Bugs y hotfix

#### Bug

- Mini spec
- Fix
- Registro en Spec Graph

#### Hotfix

```text
Incident → Fix → Follow-up Spec
```

Requisitos mínimos:

- Rollback
- Observabilidad
- Validación rápida

### 11. Integración con JIRA

- **Epic**: ECO-124
- **Specs**: SPEC-PLAT-124, SPEC-CART-01, SPEC-PAY-02
- **Contracts**: SPEC-CONTRACT-10
- **ADR**: ADR-100
- **Bug**: BUG-200
- **Hotfix**: HOTFIX-01

### 12. Beneficios

- Consistencia cross-domain
- Menos bugs de integración
- Trazabilidad
- Escalabilidad organizacional
- Mejor soporte para agentes IA

### 13. Riesgos

- Overhead inicial
- Resistencia cultural
- Specs mal mantenidas

Mitigación: automatización + disciplina operativa.

### 14. Plan de implementación

1. Definir policies de plataforma
2. Definir dominios y ownership
3. Definir contratos y versionado
4. Crear templates
5. Definir gates
6. Construir Spec Graph
7. Integrar con tracking (JIRA)

### 15. Insight final

El código deja de ser la única fuente de verdad.

La verdad operativa pasa a ser la red de especificaciones versionadas.

### 16. Conclusión

SDD + SpecKit + MCP conecta producto, arquitectura y ejecución, reduce incertidumbre y permite escalar equipos y agentes IA en sistemas complejos.
