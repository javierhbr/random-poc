# Estrategia local de conocimiento y riesgo de desactualización

## 1. Decisión principal: mantener el contexto localmente

Para utilizar Local Search, la información debe estar disponible en el sistema de archivos local.

Esto puede lograrse mediante distintas estrategias:

- Clonando completamente los repositorios necesarios.
- Descargando o materializando únicamente directorios específicos desde GitHub.
- Combinando clones completos con copias parciales.
- Manteniendo documentación propia en directorios locales.
- Incorporando especificaciones generadas mediante reverse engineering.

Aunque inicialmente la necesidad de tener todo local puede parecer una limitación, en la práctica ofrece ventajas importantes.

La experiencia muestra que trabajar directamente con archivos locales puede entregar mejores resultados que depender exclusivamente de fuentes consultadas dinámicamente mediante MCP.

---

## 2. Por qué el acceso local puede ser superior

Los servidores MCP normalmente actúan como una capa intermedia entre el agente y la fuente original.

Esta capa puede:

- Limitar la cantidad de información recuperada.
- Seleccionar solamente ciertos fragmentos.
- Aplicar filtros propios.
- Resumir contenido.
- Excluir archivos o rutas.
- Reducir el detalle de la respuesta.
- Imponer límites de resultados.
- Cambiar la estructura original de la información.
- Depender de las capacidades particulares de cada implementación MCP.

Esto significa que el agente no siempre recibe una representación completa de la fuente.

Cuando la documentación está disponible localmente, el agente puede:

- Navegar libremente por los archivos.
- Abrir documentos completos.
- Revisar múltiples secciones.
- Seguir referencias entre archivos.
- Comparar documentos.
- Inspeccionar estructuras de directorios.
- Ejecutar búsquedas repetidas con distintos criterios.
- Utilizar herramientas locales adicionales.
- Acceder al contenido sin depender de filtros remotos.

Por esta razón, mantener el contexto localmente puede proporcionar mayor control, transparencia y profundidad.

---

## 3. MCP como mecanismo de adquisición, no necesariamente de consulta final

El uso de MCP continúa siendo útil, especialmente para acceder a contenido remoto.

Por ejemplo, GitHub MCP puede utilizarse para:

- Consultar repositorios.
- Recuperar directorios específicos.
- Descargar documentación.
- Identificar archivos relevantes.
- Materializar una parte de un repositorio localmente.
- Evitar incorporar repositorios completos mediante submodules.

Sin embargo, una vez recuperado el contenido, puede ser más conveniente utilizarlo desde el sistema de archivos local.

La separación de responsabilidades sería:

```text
GitHub MCP
    ↓
Obtención o sincronización de contenido
    ↓
Sistema de archivos local
    ↓
Local Search
    ↓
Descubrimiento y recuperación
    ↓
Lectura directa por humanos o agentes
```

En este modelo, MCP facilita el acceso a las fuentes, pero no controla necesariamente cómo se consulta el conocimiento durante el trabajo diario.

---

## 4. Beneficios de mantener las fuentes localmente

La disponibilidad local proporciona varios beneficios.

### Acceso completo

El agente puede acceder al archivo completo y no solamente a un fragmento seleccionado por una herramienta remota.

### Menor filtrado

La información no depende de la interpretación, segmentación o política de recuperación de un servidor MCP.

### Mejor navegación

Es posible seguir enlaces, referencias, imports, tags, rutas y relaciones entre documentos.

### Indexación personalizada

Local Search puede aplicar su propia estrategia de fragmentación, vectorización, metadata e indexación.

### Aislamiento controlado

Cada directorio puede convertirse en un repositorio independiente dentro de Local Search.

### Búsqueda entre múltiples fuentes

Los resultados pueden combinar información proveniente de distintos directorios y repositorios.

### Operación independiente

La búsqueda puede continuar funcionando aunque una fuente remota esté temporalmente indisponible.

### Reproducibilidad

Es posible saber exactamente qué versión del contenido fue utilizada durante un análisis.

### Integración con herramientas locales

Los agentes pueden combinar Local Search con comandos del sistema, scripts, Uncle Dev y otras herramientas.

---

## 5. El problema que Local Search ayuda a resolver

Mantener toda la información localmente introduce una estructura distribuida.

La documentación puede encontrarse en:

- Distintos repositorios Git.
- Diferentes workspaces.
- Carpetas de componentes.
- Directorios de documentación.
- Repositorios de plataforma.
- Especificaciones generadas.
- Copias parciales provenientes de GitHub.
- Diferentes volúmenes o ubicaciones del computador.

Sin una capa adicional, el usuario o el agente tendría que recordar:

- Dónde está cada fuente.
- Qué repositorio contiene cada funcionalidad.
- Qué directorio corresponde a cada componente.
- Qué archivos deben revisarse.
- Cómo combinar información de diferentes ubicaciones.

Local Search resuelve este problema registrando e indexando los directorios relevantes como repositorios lógicos.

El usuario no necesita tratar todos los archivos como si pertenecieran a un único repositorio físico.

Local Search proporciona una capa común de acceso sobre fuentes distribuidas.

---

## 6. Agregación lógica de fuentes distribuidas

La información continúa físicamente separada, pero puede consultarse de manera conjunta.

Por ejemplo:

```text
~/work/platform-current-reality/
~/work/payment-service/specs/
~/work/account-service/specs/
~/external/notification-platform/docs/
~/knowledge/shared-business-rules/
```

Cada directorio se registra individualmente:

```text
platform-current-reality
component-payment-service
component-account-service
external-notification-platform
shared-business-rules
```

Al realizar una búsqueda, Local Search puede consultar:

- Un solo repositorio.
- Un conjunto seleccionado de repositorios.
- Todos los repositorios disponibles.

Por lo tanto, Local Search crea una agregación lógica sin obligar a mover o duplicar físicamente toda la documentación dentro de un único directorio.

---

## 7. Ejemplo de agregación

Supongamos que se necesita entender el flujo completo de un pago rechazado.

La información puede estar distribuida de la siguiente manera:

```text
platform-current-reality/
└── payments/
    └── credit-card-payment.md

payment-service/
└── specs/
    └── payment-decline.md

account-service/
└── specs/
    └── funding-source-validation.md

notification-platform/
└── docs/
    └── declined-payment-notification.md
```

Local Search permite ejecutar una sola búsqueda sobre estos repositorios y entregar un resultado agregado.

El resultado puede indicar:

- Qué documento explica la experiencia general.
- Qué servicio valida la fuente de fondos.
- Qué componente procesa el rechazo.
- Qué sistema envía la notificación.
- Qué tags conectan todos los comportamientos.

El usuario o agente puede navegar desde ese resultado hacia cada archivo original.

---

## 8. Riesgo principal: desactualización de las copias locales

La principal desventaja de mantener las fuentes localmente es que pueden quedar desactualizadas respecto de sus repositorios de origen.

Actualmente, la actualización depende en gran medida de acciones manuales realizadas por una persona.

Por ejemplo:

- Ejecutar `git pull`.
- Cambiar a la branch correcta.
- Descargar nuevamente un directorio.
- Consultar el repositorio remoto.
- Actualizar una copia materializada.
- Ejecutar un nuevo escaneo de Local Search.
- Verificar que el índice corresponda con los archivos actuales.

Si alguno de estos pasos no se realiza, Local Search puede continuar entregando resultados correctos desde el punto de vista del índice, pero basados en una versión antigua de los documentos.

Por lo tanto, existen dos estados diferentes que deben distinguirse:

1. El índice coincide con los archivos locales.
2. Los archivos locales coinciden con la fuente remota.

Local Search puede asegurar el primer estado después de un escaneo, pero no necesariamente el segundo.

---

## 9. Cadena de vigencia de la información

Para considerar que una fuente está actualizada, debe mantenerse completa la siguiente cadena:

```text
Fuente remota actual
        ↓
Copia local sincronizada
        ↓
Local Search escaneado
        ↓
Índice actualizado
        ↓
Resultado vigente para el agente
```

La cadena puede romperse en distintos puntos.

### Caso 1: fuente remota actualizada, copia local antigua

El repositorio de GitHub cambió, pero nadie actualizó el clon o la copia local.

### Caso 2: copia local actualizada, índice antiguo

Se ejecutó `git pull`, pero Local Search no volvió a escanear los archivos.

### Caso 3: actualización parcial

Algunos repositorios fueron sincronizados, pero otros componentes relacionados siguen utilizando versiones anteriores.

### Caso 4: branch incorrecta

La copia local está actualizada, pero corresponde a una branch diferente de la definida como fuente canónica.

### Caso 5: copia materializada sin procedencia

Los archivos existen localmente, pero no se sabe de qué commit, branch o fecha provienen.

---

## 10. Dos problemas diferentes de mantenimiento

Es importante separar dos problemas que, aunque están relacionados, no son iguales.

### Problema A: sincronización de las copias locales

Este problema consiste en asegurar que los archivos disponibles localmente correspondan con la versión actual de sus fuentes remotas.

Incluye:

- Clones desactualizados.
- Directorios materializados antiguos.
- Branches incorrectas.
- Archivos eliminados remotamente que continúan localmente.
- Índices de Local Search no regenerados.

Este es el problema principal abordado en esta etapa.

### Problema B: mantenimiento de la fuente original

Este problema consiste en asegurar que la documentación almacenada dentro de los repositorios de GitHub sea correcta, completa y vigente.

Incluye preguntas como:

- ¿Quién es responsable de actualizar la documentación?
- ¿Cuándo debe actualizarse?
- ¿Cómo se valida?
- ¿Cómo se evita que el código cambie sin actualizar las specs?
- ¿Qué equipo es dueño de cada documento?
- ¿Qué proceso de gobernanza debe seguirse?

Este segundo problema es importante, pero queda fuera del alcance específico de esta parte del proceso.

Aunque una sincronización sea perfecta, una fuente remota incorrecta o abandonada continuará produciendo contexto incorrecto.

---

## 11. Responsabilidad específica de Local Search

Local Search no resuelve por sí solo la gobernanza de la documentación ni garantiza que las fuentes remotas estén actualizadas.

Su responsabilidad es distinta.

Local Search ayuda a:

- Registrar múltiples directorios.
- Indexar archivos locales.
- Mantener fuentes separadas.
- Ejecutar búsquedas por repositorio.
- Combinar resultados de diferentes fuentes.
- Encontrar documentos relacionados.
- Mostrar las relaciones entre archivos.
- Permitir que los agentes naveguen hacia las fuentes originales.
- Reducir la necesidad de buscar manualmente en múltiples directorios.

Local Search resuelve el problema de **descubrimiento y agregación del contexto local distribuido**.

No resuelve automáticamente el problema de **vigencia de la fuente**.

---

## 12. Necesidad de una capa de sincronización

Para reducir el riesgo de desactualización, el sistema necesita una capa adicional de sincronización.

Esta capa debe trabajar antes del proceso de indexación.

Su responsabilidad debería incluir:

- Identificar la fuente remota de cada directorio.
- Determinar si existe una versión más reciente.
- Actualizar clones completos.
- Actualizar directorios materializados.
- Detectar archivos nuevos, modificados o eliminados.
- Registrar el commit o versión sincronizada.
- Solicitar un nuevo escaneo de Local Search.
- Informar qué fuentes no pudieron actualizarse.
- Evitar búsquedas silenciosas sobre fuentes obsoletas.

La arquitectura completa sería:

```text
Repositorios y fuentes remotas
              ↓
       Capa de sincronización
              ↓
      Directorios locales
              ↓
          Local Search
              ↓
     SQLite e índice vectorial
              ↓
     Resultados agregados
              ↓
      Humanos y agentes
```

---

## 13. Estados mínimos de sincronización

Cada repositorio indexado debería exponer un estado claro.

### Actualizado

La copia local corresponde con la versión remota esperada y Local Search ya la indexó.

### Actualización disponible

Existe una versión remota más reciente.

### Pendiente de escaneo

Los archivos locales fueron actualizados, pero el índice todavía representa una versión anterior.

### Origen desconocido

No se puede determinar de dónde provienen los archivos locales.

### No verificable

No fue posible consultar la fuente remota.

### Desactualizado

La copia local no coincide con la fuente remota configurada.

### Parcialmente sincronizado

Algunas rutas o archivos no pudieron actualizarse.

### Modificado localmente

Existen cambios locales que pueden ser sobrescritos o que no existen en la fuente remota.

Estos estados deben estar disponibles tanto para usuarios como para agentes.

---

## 14. Metadatos de vigencia

Cada repositorio registrado en Local Search debería incluir metadatos que permitan evaluar la vigencia de la información.

Por ejemplo:

```yaml
repository:
  id: component-payment-service
  local_path: /work/payment-service/specs

source:
  type: git
  provider: github
  repository: company/payment-service
  branch: main
  remote_path: docs/specs
  commit: a91f24d

synchronization:
  last_checked_at: 2026-07-30T09:45:00-05:00
  last_synced_at: 2026-07-30T09:46:10-05:00
  status: current

index:
  last_scanned_at: 2026-07-30T09:47:02-05:00
  indexed_commit: a91f24d
  status: current
```

Con estos datos, Local Search podría informar:

> Los resultados provienen del commit `a91f24d`, sincronizado e indexado el 30 de julio de 2026.

O podría advertir:

> La copia local fue actualizada, pero Local Search todavía no ha regenerado el índice.

---

## 15. Verificación antes de una búsqueda

Una búsqueda podría incluir una validación previa de vigencia.

El flujo sería:

1. El agente selecciona los repositorios.
2. Local Search revisa los metadatos.
3. Identifica repositorios actuales, desconocidos o desactualizados.
4. Ejecuta la búsqueda.
5. Incluye advertencias cuando alguna fuente no está verificada.
6. Opcionalmente solicita o ejecuta una sincronización.
7. Vuelve a escanear únicamente los repositorios modificados.

La búsqueda no necesariamente debe bloquearse cuando una fuente está desactualizada.

Sin embargo, el estado debe ser visible para evitar presentar información antigua como si fuera actual.

---

## 16. Sincronización manual asistida

Una primera solución puede mantener la acción manual, pero hacerla más sencilla y segura.

Por ejemplo:

```bash
local-search sync component-payment-service
```

El comando podría:

1. Identificar el origen del repositorio.
2. Revisar el estado remoto.
3. Actualizar la copia local.
4. Detectar cambios.
5. Ejecutar el escaneo.
6. Actualizar los metadatos.
7. Mostrar un resumen.

También podría permitir:

```bash
local-search sync --selected \
  platform-current-reality \
  component-payment-service \
  component-account-service
```

O sincronizar todos los repositorios relacionados con una funcionalidad:

```bash
local-search sync --tag ER-PAYMENT-001
```

---

## 17. Sincronización automática o semiautomática

Posteriormente, el proceso puede automatizarse utilizando diferentes disparadores.

### Al iniciar una sesión

Verificar si las fuentes relevantes tienen actualizaciones disponibles.

### Antes de una búsqueda crítica

Comprobar la vigencia de los repositorios seleccionados.

### Después de un `git pull`

Ejecutar automáticamente el escaneo de Local Search.

### Después de un merge o rebase

Detectar cambios en documentación y regenerar el índice.

### En intervalos programados

Revisar periódicamente si existen cambios remotos.

### Al abrir un proyecto

Sincronizar únicamente las fuentes asociadas al workspace actual.

### Bajo solicitud del agente

Permitir que una skill verifique el estado antes de realizar un análisis.

La automatización debe evitar actualizar indiscriminadamente todos los repositorios cuando solo se necesita un subconjunto.

---

## 18. Sincronización contextual

La estrategia más eficiente es sincronizar según el contexto de la tarea.

Por ejemplo, para analizar pagos de tarjeta:

```text
platform-current-reality
component-payment-service
component-account-service
component-notification-service
```

Antes de la búsqueda, el sistema verifica únicamente esas fuentes.

Esto evita:

- Consultar decenas de repositorios innecesarios.
- Ejecutar múltiples operaciones remotas.
- Regenerar índices que no se utilizarán.
- Consumir tiempo y recursos sin beneficio.

El principio recomendado es:

> Sincronizar y escanear el conjunto mínimo de fuentes necesarias para la tarea actual.

---

## 19. Indicadores de confianza en los resultados

Los resultados de Local Search podrían incluir información sobre la vigencia de cada fuente.

Por ejemplo:

```text
Resultado 1
Archivo: credit-card-payment.md
Repositorio: platform-current-reality
Estado: actualizado
Última sincronización: 2026-07-30
Último escaneo: 2026-07-30

Resultado 2
Archivo: external-account-validation.md
Repositorio: component-account-service
Estado: actualización disponible
Última sincronización: 2026-07-24
```

Esto permite que el agente distinga entre:

- Un resultado semánticamente relevante.
- Un resultado relevante y actualizado.
- Un resultado relevante pero potencialmente obsoleto.

La similitud semántica no debe confundirse con la confiabilidad o vigencia de la fuente.

---

## 20. Principio de diseño

La decisión de mantener el contexto localmente se basa en el siguiente principio:

> Es preferible conservar acceso completo y controlado sobre las fuentes, aunque esto requiera administrar su sincronización, que depender exclusivamente de capas remotas que pueden filtrar, limitar o transformar la información.

Local Search hace posible trabajar con conocimiento local distribuido sin tener que consolidarlo físicamente en un único repositorio.

La sincronización garantiza que las copias locales continúen representando sus fuentes remotas.

La indexación garantiza que las búsquedas representen los archivos locales actuales.

La combinación de ambas capas permite construir un sistema de contexto completo, navegable y verificable.

---

## 21. Resumen de responsabilidades

```text
Fuente remota
Responsabilidad:
Mantener la documentación oficial.

Capa de sincronización
Responsabilidad:
Mantener las copias locales alineadas con las fuentes remotas.

Local Search
Responsabilidad:
Indexar, aislar, buscar y agregar el conocimiento local distribuido.

Agente o usuario
Responsabilidad:
Seleccionar las fuentes adecuadas, revisar su vigencia y procesar los documentos encontrados.
```

El problema de mantenimiento editorial de la fuente remota debe tratarse mediante un proceso de gobernanza separado.

El problema de sincronización local debe resolverse mediante metadata, verificaciones y automatización.

Local Search permanece como la capa que conecta toda la información local y la presenta como un conjunto consultable.