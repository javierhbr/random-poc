El 80/20, en tu caso, es no empezar por la estructura de carpetas, ni por renombrar capas, ni por abstraer todo.

Empieza por introducir seams en los puntos donde hoy hay más riesgo de colaboración.

Mi orden sería este:

1. Identifica 1 flujo crítico y 1 dependencia variable.
    No tomes todo el componente. Busca un caso concreto donde hoy el código mezcle lógica de negocio con una implementación que probablemente otros equipos quieran cambiar o extender.
2. Extrae una interfaz pequeña delante de esa dependencia.
    Ejemplo: si hoy un service llama directamente a un cliente HTTP, repositorio, mapper, rule engine, strategy o provider, crea una interfaz mínima.

interface CustomerReader {
  getCustomer(id: string): Promise<Customer>;
}

3. Haz que la implementación actual implemente esa interfaz.
    Sin cambiar comportamiento.

class ApiCustomerReader implements CustomerReader {
  ...
}

4. Inyecta la dependencia en el código existente.
    El service deja de conocer la implementación concreta.

class OrderService {
  constructor(
    private readonly customerReader: CustomerReader
  ) {}
}

5. Agrega una regla automática que impida volver atrás.
    Esto es clave para cambiar el mindset. Por ejemplo:
    * application/domain no puede importar adapters concretos
    * integrations no pueden importar internals del domain
    * solo wiring/composition instancia implementaciones concretas
6. Haz que el siguiente caso de colaboración use ese patrón.
    Ahí empieza el cambio cultural real. No con una presentación de arquitectura, sino con un PR pequeño donde alguien ve:

define contract
→ implement contract
→ wire implementation
→ tests pass

Ese sería tu primer ciclo completo.

Qué NO haría primero

No empezaría con:

* mover carpetas masivamente
* crear domain/ports/adapters/application
* renombrar todos los services
* abstraer todos los repositorios
* introducir factories por todas partes
* crear 30 interfaces
* migrar todo el componente
* hacer un ADR enorme anunciando nueva arquitectura

Eso genera exactamente la reacción que quieres evitar y, peor aún, crea mucho churn sin darte todavía protección real.

El 20% más importante

Si tuviera que reducirlo aún más, haría solamente estas tres cosas:

Primero: abstraer dependencias en los hotspots.
Cada vez que algo pueda variar por equipo, tenant, use case o integración, pon una interfaz pequeña delante.

Segundo: invertir la dependencia.
El business/application code depende de la interfaz, no de la implementación.

Tercero: automatizar la frontera.
CI debe evitar que alguien importe implementaciones concretas desde donde no corresponde.

Ese 20% ya cambia bastante el sistema:

Before
BusinessService
   ↓
ConcreteClient
   ↓
Vendor/API/DB
After
BusinessService
   ↓
Contract
   ↑
ConcreteImplementation

Todavía no tienes “hexagonal architecture”.

Pero ya tienes la propiedad más importante de hexagonal architecture: dependency inversion alrededor del comportamiento que quieres proteger.

Luego progresas por oportunismo

Después no haría un roadmap tipo:

Sprint 1 migrate domain
Sprint 2 migrate integrations
Sprint 3 migrate repositories

Haría algo más parecido a:

feature/change arrives
        ↓
does it touch a risky dependency?
        ↓
yes
        ↓
introduce boundary there
        ↓
implement change behind boundary

Eso permite que la arquitectura aparezca gradualmente alrededor del código que realmente cambia.

En 3–6 meses puedes terminar con bastante separación sin haber tenido nunca “el refactor”.

Una regla simple para code review

Podrías introducir una sola pregunta nueva:

“Does this change introduce a dependency that is likely to vary independently?”

Si la respuesta es sí:

“Put a small contract in front of it.”

Nada más.

Eso empieza a enseñar el mindset sin hablar de arquitectura.

Y una segunda regla

Para modificaciones de comportamiento existente:

“Can this change be implemented without modifying the orchestration?”

Si sí, probablemente necesitas un:

* strategy
* rule
* provider
* handler
* transformer
* validator

detrás de una interfaz.

Si no, entonces probablemente sí estás cambiando comportamiento fundamental y merece review de owners.

Mi secuencia concreta de PRs sería muy pequeña

No más de algo así:

PR 1: introducir una interfaz en un hotspot real y adaptar la implementación actual. Sin cambio funcional.

PR 2: agregar la regla de dependencia/arquitectura que proteja esa frontera.

PR 3: implementar una feature real o colaboración usando esa frontera.

Ese tercer PR es probablemente el más importante, porque demuestra que no estabas haciendo “architecture astronautics”. Demuestra que ahora una colaboración puede entrar sin modificar medio componente.

Después simplemente repites el patrón donde tenga valor.

Si quieres una frase interna para guiar todo el proceso, usaría:

Don’t refactor the architecture. Refactor the next risky dependency.

Ese es probablemente el mejor 80/20 para un sistema que ya está en producción.


---
---
---



Sí. Para un App.vue de más de 1,000 líneas, el mismo principio aplica muy bien, pero en frontend el equivalente no es solamente “port/adapter”. El objetivo sería separar orquestación de UI, reglas de negocio, estado, integración y puntos de customización para que los equipos no tengan que entrar al mismo archivo central cada vez.

Yo no intentaría “componentizar todo”. Haría el mismo 80/20: extraer primero las zonas de cambio más frecuentes y convertirlas en extension points explícitos.

Una forma útil de pensar el App.vue sería:

App.vue
  │
  ├── Application orchestration
  │
  ├── Domain/UI state
  │
  ├── Use-case logic
  │
  ├── Integrations
  │
  └── Rendering/customization

El problema típico de un App.vue gigante es que esas cinco cosas están mezcladas.

Para colaboración, yo apuntaría a que termine conceptualmente así:

App.vue
  │
  ├── useApplication()
  ├── useFeatureX()
  ├── useFeatureY()
  │
  └── View composition
        │
        ├── Header
        ├── MainContent
        ├── Sidebar
        └── Extension slots

App.vue debería terminar siendo principalmente composition, no implementation.

Por ejemplo, si hoy tienes:

<script setup lang="ts">
const loading = ref(false)
const customers = ref([])
const selectedCustomer = ref(null)
async function loadCustomers() {
  loading.value = true
  const response = await fetch('/api/customers')
  customers.value = await response.json()
  loading.value = false
}
function calculateEligibility(customer) {
  // 50 lines
}
function handleSelection(customer) {
  // 30 lines
}
function buildMenu() {
  // 70 lines
}
// another 600 lines...
</script>

El primer cambio no debería ser crear veinte componentes.

Extraería primero un caso de uso completo:

export function useCustomers(
  customerProvider: CustomerProvider
) {
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  async function load() {
    loading.value = true
    try {
      customers.value =
        await customerProvider.getCustomers()
    } finally {
      loading.value = false
    }
  }
  return {
    customers,
    loading,
    load
  }
}

Y el contrato:

export interface CustomerProvider {
  getCustomers(): Promise<Customer[]>
}

Implementación actual:

export class ApiCustomerProvider
  implements CustomerProvider {
  async getCustomers(): Promise<Customer[]> {
    const response =
      await fetch('/api/customers')
    return response.json()
  }
}

Ya tienes el mismo concepto que hablábamos antes:

Vue component
     ↓
 composable
     ↓
 contract
     ↑
 implementation

Sin decir “hexagonal”.

En Vue hay 5 seams especialmente buenos

Yo usaría estos como “extension points” naturales:

1. Composables para comportamiento.
2. Interfaces TypeScript para dependencias variables.
3. Props + Emits como contrato entre componentes.
4. Slots para customización visual.
5. Registries/configuration para extensiones aportadas por otros equipos.

Ese quinto punto puede ser especialmente poderoso para tu caso.

Supongamos que varios equipos quieren agregar acciones a una pantalla.

No quieres esto:

<button v-if="teamA">...</button>
<button v-if="teamB">...</button>
<button v-if="teamC">...</button>

Eso convierte App.vue en un cementerio de customizaciones.

Mejor:

export interface AppAction {
  id: string
  label: string
  isVisible(
    context: AppContext
  ): boolean
  execute(
    context: AppContext
  ): Promise<void>
}

Y:

const actions: AppAction[] = [
  defaultAction,
  teamAAction,
  teamBAction
]

La UI simplemente hace:

<AppActionButton
  v-for="action in availableActions"
  :key="action.id"
  :action="action"
/>

Un equipo nuevo agrega:

export const teamCAction: AppAction = {
  id: 'team-c-export',
  label: 'Export',
  isVisible(context) {
    return context.permissions.canExport
  },
  async execute(context) {
    ...
  }
}

Y no toca el flujo principal.

Eso es exactamente el tipo de extensibilidad controlada que buscas.

Para customización visual: usa slots antes que condiciones

Si una sección puede variar por consumidor/equipo:

En vez de:

<div v-if="variant === 'team-a'">
  ...
</div>
<div v-else-if="variant === 'team-b'">
  ...
</div>

puedes tener:

<MainLayout>
  <template #sidebar>
    <DefaultSidebar />
  </template>
</MainLayout>

o:

<FeaturePanel>
  <template #actions>
    <component
      v-for="extension in actionExtensions"
      :is="extension.component"
    />
  </template>
</FeaturePanel>

Los slots son casi un UI extension port.

No necesitas llamarlos así al equipo.

Simplemente:

“This section is customizable through a slot instead of modifying the parent.”

Props y emits deberían tratarse como contratos

Un componente hijo no debería conocer todo el estado global.

Evitaría:

const store = useEverythingStore()

desde cada componente.

Preferiría:

<CustomerCard
  :customer="customer"
  :selected="selected"
  @select="handleSelect"
/>

El contrato es explícito.

Eso limita el blast radius.

Un contributor sabe:

input:
Customer
selected
output:
select event

No puede accidentalmente empezar a modificar diez partes del estado global.

Y aquí aplicaría la misma regla de “capabilities”

Si un componente necesita operar sobre algo, no le entregues todo.

Evita:

provide('app', entireApplicationObject)

Mejor:

export interface CustomerActions {
  select(id: string): void
  refresh(): Promise<void>
}

Entonces:

provide(customerActionsKey, customerActions)

Eso limita lo que una extensión puede hacer.

Qué haría primero con ese App.vue

No intentaría llevarlo inmediatamente de:

1000 lines

a:

100 lines

Ese número no debería ser el objetivo.

Buscaría primero tres tipos de código dentro del archivo:

1. API / integration logic
2. reusable business/use-case logic
3. team-specific conditional rendering

Y los atacaría en ese orden.

Primera extracción: integración

Todo esto:

fetch()
axios()
localStorage
browser APIs
websocket

fuera del componente.

Por ejemplo:

App.vue
before:
App.vue → fetch
after:
App.vue
 ↓
useCustomers
 ↓
CustomerProvider
 ↓
ApiCustomerProvider

Es una extracción relativamente segura porque puedes mantener exactamente el mismo comportamiento.

Segunda extracción: comportamiento

Funciones como:

calculateSomething()
validateSomething()
determineState()
buildOptions()
filterAvailableActions()

normalmente deberían salir.

Dependiendo del caso:

pure function
composable
domain object
strategy

Por ejemplo:

export function calculateEligibility(
  customer: Customer
): Eligibility {
  ...
}

No todo necesita ser una clase ni una interface.

Eso es importante: no convertir Vue en Java.

Tercera extracción: customizaciones

Busca:

if (team === 'A')
if (tenant === 'B')
switch(product)
switch(flow)

Esos son probablemente tus mayores candidatos para extension points.

Por ejemplo:

interface PanelExtension {
  supports(context: AppContext): boolean
  component: Component
}

o:

interface BehaviorExtension {
  supports(context: Context): boolean
  execute(context: Context): Promise<Result>
}

Ahí es donde realmente empiezas a permitir colaboración sin convertir App.vue en territorio compartido.

Evitaría un “mega composable”

Hay un riesgo importante.

Puedes pasar de:

App.vue
1000 lines

a:

useApp.ts
900 lines

y no arreglaste absolutamente nada.

Por eso los composables deberían representar capabilities/use cases:

useCustomerSelection()
useEligibility()
useNavigation()
useSearch()
useNotifications()

No:

useApp()

con todo adentro.

Puede existir un useApplication() pequeño que componga los otros, pero no debería convertirse en el nuevo monolito.

Stores también con cuidado

Si estás usando Pinia, no movería todo automáticamente al store.

Store debería representar principalmente:

shared application state

No:

every function previously in App.vue

Por ejemplo:

CustomerStore
  customers
  selectedCustomer

puede tener sentido.

Pero:

CustomerApi
EligibilityRules
NavigationRules
DOM logic

no necesariamente deberían vivir ahí.

Si pones todo en Pinia, simplemente cambias:

God Component

por:

God Store

Tu equivalente de “core / port / adapter” en Vue

Sin usar esos nombres, podría quedar:

src/
  app/
    App.vue
    application.ts
  features/
    eligibility/
      useEligibility.ts
      eligibility.rules.ts
      EligibilityPanel.vue
    customers/
      useCustomers.ts
      CustomerList.vue
  contracts/
    customer-provider.ts
    eligibility-policy.ts
  integrations/
    api-customer-provider.ts
  extensions/
    team-a/
    team-b/
  components/
    shared/

Y se puede explicar sencillamente como:

features
contracts
implementations
extensions
shared UI

Nada que suene a migración arquitectónica.

Las reglas que sí automatizaría

Aquí es donde consigues realmente “forzar” el diseño.

Por ejemplo:

components/
    cannot import integrations/
features/
    can depend on contracts/
    cannot depend on team-specific extensions/
extensions/
    can implement contracts/
    cannot mutate core stores directly
App.vue
    should not call APIs directly
shared components/
    cannot depend on feature-specific code

Puedes hacer buena parte con ESLint y restricciones de imports.

Por ejemplo conceptualmente:

// forbidden
import { ApiCustomerProvider }
  from '@/integrations/...'
// inside presentation component

El componente debería consumir algo ya resuelto/injectado.

El primer PR que yo haría

Concretamente, tomando ese App.vue de 1,000+ líneas:

PR #1: Extraer solamente una capability de alto cambio.

Por ejemplo:

Customer Selection

Antes:

App.vue
├── state
├── API call
├── filtering
├── selection
├── validation
├── render
└── events

Después:

App.vue
│
├── useCustomerSelection()
│
└── <CustomerSelector />

Y:

customer/
├── useCustomerSelection.ts
├── CustomerSelector.vue
├── customer.types.ts
└── customer-provider.ts

Sin tocar las otras 800 líneas.

Si funciona bien, el siguiente feature que cambie recibe el mismo tratamiento.

El principio que usaría para Vue

Podrías poner incluso esto en el contribution guide:

App.vue composes features. Features own behavior. Components render UI. Contracts isolate variation. Extensions customize without owning orchestration.

En español:

App.vue compone.
Los features implementan comportamiento.
Los componentes presentan.
Los contratos aíslan lo que puede variar.
Las extensiones customizan sin tomar control de la aplicación.

Eso es prácticamente el mismo modelo que estabas buscando en backend, pero aplicado naturalmente a Vue.

Y el 80/20 específico para ese archivo sería:

1000-line App.vue
1. remove direct integrations
           ↓
2. extract high-change behavior into feature composables
           ↓
3. replace team-specific conditions with extension registries / slots
           ↓
4. enforce import boundaries
           ↓
5. gradually componentize only where it creates a useful boundary

No necesitas “refactorizar el frontend”. Necesitas empezar a convertir App.vue de lugar donde se implementa todo a lugar donde se compone todo.

Esa diferencia, por sí sola, probablemente te dé la mayor parte del beneficio que buscas.


