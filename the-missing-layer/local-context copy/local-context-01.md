Esta sección introduce una restricción operativa importante: el contexto debe estar disponible localmente para que Local Search y los agentes puedan consultarlo de forma consistente, incluso cuando las fuentes originales estén distribuidas en varios repositorios.

Disponibilidad local de repositorios y fuentes de contexto

1. Restricción actual

Uno de los principales desafíos del proceso es que los agentes no siempre pueden utilizar servidores MCP libremente o de manera uniforme.

Dependiendo del entorno, pueden existir limitaciones relacionadas con:

* Disponibilidad del servidor MCP.
* Compatibilidad con el agente o modelo utilizado.
* Permisos de acceso.
* Autenticación.
* Conectividad.
* Restricciones corporativas.
* Diferencias entre herramientas y clientes.
* Persistencia del contexto entre sesiones.
* Capacidad para consultar múltiples repositorios de manera confiable.

Además, todavía debe validarse si el acceso remoto mediante MCP puede ofrecer el mismo nivel de precisión, velocidad, aislamiento y control que el proceso basado en archivos locales e indexados por Local Search.

Por estas razones, el proceso actual mantiene como principio que la documentación necesaria debe estar disponible localmente.

⸻

2. Requisito de disponibilidad local

Para que Local Search pueda indexar la información, los archivos deben existir dentro del sistema de archivos local.

Esto incluye:

* El contexto consolidado de la plataforma.
* La documentación de dominios y bounded contexts.
* Las especificaciones funcionales.
* Los documentos generados mediante ingeniería inversa.
* Los repositorios de los componentes.
* Los documentos históricos utilizados como evidencia.
* Las referencias provenientes de servicios upstream y downstream.

Las fuentes pueden encontrarse en diferentes directorios, volúmenes o workspaces. No es necesario que todo esté dentro de un único repositorio principal.

Local Search puede registrar cada directorio de forma independiente y tratarlo como un repositorio consultable.

⸻

3. Estrategia basada en múltiples clones locales

La primera estrategia consiste en clonar localmente cada repositorio necesario.

Por ejemplo:

/workspaces/
├── platform-context/
├── payment-service/
├── account-service/
├── notification-service/
├── fraud-service/
└── settlement-process/

Cada repositorio mantiene:

* Su propio historial Git.
* Su configuración remota.
* Sus branches.
* Su ciclo de actualización.
* Su estructura interna.
* Su directorio de especificaciones.

Los directorios relevantes se registran posteriormente en Local Search.

Por ejemplo:

platform-current-reality
payment-service-specs
account-service-specs
notification-service-specs

Esta estrategia permite mantener independencia entre los repositorios y evita introducir dependencias dentro del repositorio principal.

⸻

4. Ventajas de los clones independientes

Mantener cada repositorio clonado de manera independiente proporciona:

* Acceso completo al código y la documentación.
* Posibilidad de cambiar de branch.
* Acceso al historial de cambios.
* Actualización mediante git pull.
* Ejecución local del reverse engineering.
* Indexación directa con Local Search.
* Separación clara entre componentes.
* Menor acoplamiento con el repositorio de contexto.
* Posibilidad de trabajar con repositorios privados según los permisos del usuario.

La principal desventaja es operacional: el usuario debe administrar varios clones, rutas, credenciales y procesos de actualización.

⸻

5. Limitaciones de Git submodules

Una alternativa considerada es utilizar Git submodules para incorporar otros repositorios dentro del workspace principal.

Por ejemplo:

/platform-knowledge/
├── current-reality/
└── components/
    ├── payment-service/
    ├── account-service/
    └── notification-service/

Sin embargo, los submodules presentan una limitación importante para este caso de uso:

Un submodule referencia un repositorio completo y no permite seleccionar solamente un directorio específico dentro de ese repositorio.

Esto significa que, si solamente se necesita el directorio:

payment-service/specs/

el submodule debe incorporar la referencia al repositorio completo de payment-service.

Esta restricción puede ser problemática cuando:

* El repositorio es muy grande.
* Solo se necesita una pequeña sección de documentación.
* No se desea exponer o copiar todo el código.
* Existen muchos componentes.
* El workspace principal debe mantenerse liviano.
* Los usuarios no están familiarizados con el manejo de submodules.
* Se producen errores por submodules no inicializados o desactualizados.

⸻

6. Complejidad adicional de los submodules

Además de requerir el repositorio completo, los submodules introducen otras dificultades:

* El repositorio principal almacena una referencia a un commit específico.
* Los cambios del repositorio hijo no se actualizan automáticamente.
* Es necesario inicializar y actualizar los submodules explícitamente.
* Cambiar el commit del submodule genera un cambio en el repositorio padre.
* Los usuarios pueden terminar trabajando con versiones diferentes.
* Las operaciones de clonación requieren comandos adicionales.
* El manejo de branches puede resultar confuso.
* Los pipelines deben considerar la inicialización de los submodules.
* Los agentes pueden interpretar accidentalmente la estructura como un único repositorio.

Para un sistema orientado a la recuperación de contexto, esta relación puede agregar más complejidad de la necesaria.

El objetivo no es construir una dependencia de código entre repositorios, sino disponer localmente de documentación para búsqueda y análisis.

⸻

7. Alternativa: materialización local sin relación Git

Una solución que se ha estado explorando consiste en utilizar las capacidades de GitHub, potencialmente mediante su integración MCP, para obtener el contenido necesario de un repositorio y materializarlo dentro de un directorio local sin mantenerlo como un submodule.

El resultado sería una copia local de los archivos necesarios, pero sin conservar una relación Git anidada dentro del repositorio principal.

Por ejemplo:

/platform-knowledge/
├── current-reality/
└── external-context/
    ├── payment-service-specs/
    ├── account-service-specs/
    └── notification-service-specs/

Estos directorios contendrían copias sincronizadas de la documentación relevante, pero no necesariamente incluirían:

* El directorio .git.
* El historial completo.
* Las branches.
* La configuración remota.
* Todo el contenido del repositorio original.

Esto evita la necesidad de utilizar Git submodules y permite incorporar únicamente las rutas relevantes.

⸻

8. Selección parcial de contenido

La principal ventaja de esta estrategia es poder seleccionar una ruta concreta dentro de un repositorio.

Por ejemplo:

Repositorio:
github.com/company/payment-service
Ruta requerida:
docs/specs/

El proceso podría copiar solamente:

docs/specs/

hacia:

external-context/payment-service-specs/

Sin descargar necesariamente:

* El código fuente completo.
* Los pipelines.
* Los assets.
* Los archivos de desarrollo.
* Las pruebas.
* Otros directorios no relacionados con el contexto.

Esto permite construir un workspace de conocimiento más pequeño y enfocado.

⸻

9. Dos modalidades de materialización

La materialización local puede utilizarse de dos maneras.

9.1 Materialización de documentación existente

Cuando el repositorio remoto ya contiene especificaciones funcionales validadas, solamente es necesario copiar los directorios de documentación.

Ejemplo:

payment-service/docs/specs/

Esto es apropiado cuando el proceso de reverse engineering ya fue ejecutado y los resultados fueron publicados en el repositorio del componente.

9.2 Materialización del código para reverse engineering

Cuando todavía no existe una especificación funcional, puede ser necesario obtener el código fuente o una parte suficiente del repositorio para ejecutar el reverse engineering localmente.

En ese caso, se puede materializar:

* El repositorio completo.
* Un conjunto de directorios de código.
* Los manifiestos y archivos de configuración.
* Las definiciones de APIs.
* Las pruebas funcionales.
* Los archivos requeridos para comprender las dependencias.

La selección debe garantizar que el análisis conserve suficiente contexto para interpretar correctamente el comportamiento.

Copiar solamente un directorio aislado puede ser insuficiente cuando la funcionalidad depende de módulos compartidos, configuraciones o contratos ubicados en otras rutas.

⸻

10. Diferencia entre clone, submodule y materialización

Las tres estrategias cumplen propósitos diferentes.

Estrategia	Historial Git	Repositorio completo	Selección de directorios	Relación con repositorio padre	Uso principal
Clone independiente	Sí	Normalmente sí	Limitada mediante técnicas adicionales	No	Desarrollo y análisis completo
Git submodule	Sí	Sí	No	Sí	Dependencia versionada entre repositorios
Materialización local	No necesariamente	No	Sí	No	Contexto, documentación e indexación

Para este proceso, la materialización local no busca reemplazar Git como herramienta de desarrollo.

Su objetivo es crear una copia consumible e indexable de las fuentes necesarias para los agentes.

⸻

11. Rol potencial de GitHub MCP

GitHub MCP puede actuar como una capa de acceso para:

* Descubrir repositorios.
* Consultar árboles de archivos.
* Seleccionar directorios.
* Obtener archivos concretos.
* Recuperar documentación.
* Consultar branches o commits.
* Identificar cambios.
* Materializar contenido localmente.
* Actualizar copias previamente descargadas.

Dentro de esta arquitectura, MCP no reemplazaría necesariamente a Local Search.

Las responsabilidades serían diferentes:

GitHub MCP

Permite acceder y recuperar contenido desde GitHub.

Capa de sincronización

Materializa o actualiza los archivos seleccionados en el sistema local.

Local Search

Indexa los archivos locales y permite recuperarlos mediante búsquedas semánticas y filtros por repositorio.

Agente

Decide qué fuentes consultar, abre los resultados y procesa el contenido.

El flujo sería:

GitHub
   ↓
GitHub MCP o API
   ↓
Materialización local
   ↓
Directorios de contexto
   ↓
Local Search
   ↓
Índice local y vectorial
   ↓
Agentes y modelos

⸻

12. Por qué mantener una copia local aunque exista MCP

Incluso si MCP permite consultar GitHub directamente, mantener una copia local puede continuar siendo útil.

La copia local proporciona:

* Búsquedas más rápidas.
* Operación sin conexión temporal.
* Indexación vectorial controlada.
* Aislamiento por directorios.
* Consistencia entre diferentes agentes.
* Menor dependencia de límites de API.
* Reducción de llamadas remotas.
* Posibilidad de trabajar con múltiples fuentes conjuntamente.
* Acceso a documentación generada localmente.
* Control sobre la versión exacta del contenido indexado.
* Reproducibilidad de los análisis.

MCP puede convertirse en el mecanismo de adquisición o sincronización, mientras Local Search continúa siendo el mecanismo de recuperación.

⸻

13. Riesgo de duplicación y desactualización

La materialización local introduce un riesgo: la copia puede quedar desactualizada respecto del repositorio original.

Por eso, cada fuente materializada debe registrar metadatos como:

source:
  provider: github
  repository: company/payment-service
  branch: main
  path: docs/specs
  commit: 4f8a21c
  synchronized_at: 2026-07-30T10:30:00-05:00
  synchronization_method: github-mcp

Estos metadatos permiten saber:

* De dónde provino el contenido.
* Qué branch se utilizó.
* Qué ruta fue copiada.
* Qué commit representa.
* Cuándo se sincronizó.
* Cómo debe actualizarse.

Sin esta información, una copia local podría confundirse con la fuente original o considerarse vigente cuando ya no lo está.

⸻

14. Manifiesto de fuentes

El workspace de contexto debería mantener un manifiesto que defina las fuentes externas que deben estar disponibles.

Por ejemplo:

sources:
  - id: payment-service-specs
    type: github-directory
    repository: company/payment-service
    branch: main
    remote_path: docs/specs
    local_path: external-context/payment-service-specs
    local_search_repository: component-payment-service
    sync_strategy: incremental
  - id: account-service-specs
    type: github-directory
    repository: company/account-service
    branch: main
    remote_path: docs/specs
    local_path: external-context/account-service-specs
    local_search_repository: component-account-service
    sync_strategy: incremental

Este manifiesto puede ser utilizado por Uncle Dev, un CLI de sincronización o una skill para:

1. Validar qué fuentes existen.
2. Descargar las que faltan.
3. Actualizar las copias.
4. Detectar cambios.
5. Ejecutar nuevamente el escaneo de Local Search.
6. Registrar la versión indexada.

⸻

15. Proceso de sincronización recomendado

El proceso podría ejecutarse de la siguiente manera:

1. Leer el manifiesto de fuentes.
2. Validar las credenciales y permisos.
3. Consultar el estado remoto.
4. Comparar el commit remoto con el último commit sincronizado.
5. Descargar únicamente las rutas configuradas.
6. Reemplazar o actualizar la copia local.
7. Conservar los metadatos de procedencia.
8. Detectar archivos agregados, modificados o eliminados.
9. Ejecutar Local Search únicamente sobre los cambios.
10. Actualizar el índice vectorial.
11. Registrar el resultado de la sincronización.
12. Reportar fuentes que no pudieron ser actualizadas.

⸻

16. Estados de una fuente

Cada fuente local podría tener uno de los siguientes estados:

* Sincronizada: coincide con la versión remota configurada.
* Desactualizada: existe una versión remota más reciente.
* No disponible: la copia local no existe.
* Acceso denegado: no hay permisos para consultar el repositorio.
* Parcial: algunos archivos no pudieron recuperarse.
* Modificada localmente: la copia contiene cambios no provenientes de la fuente.
* No verificable: no fue posible consultar el estado remoto.
* Pendiente de indexación: está actualizada localmente, pero Local Search todavía no la ha escaneado.
* Indexada: está disponible en el índice de Local Search.

Esta distinción evita asumir que un directorio existente contiene necesariamente información vigente.

⸻

17. Separación entre contenido administrado y materializado

Es recomendable separar físicamente los documentos creados y mantenidos dentro del workspace de las copias generadas desde fuentes externas.

Por ejemplo:

/platform-knowledge/
├── authored/
│   ├── current-reality/
│   ├── domains/
│   └── shared-rules/
│
├── generated/
│   └── reverse-engineering/
│
├── external/
│   ├── payment-service-specs/
│   ├── account-service-specs/
│   └── notification-service-specs/
│
└── source-manifest.yaml

authored

Contiene documentación mantenida y validada directamente por el equipo.

generated

Contiene documentación generada por agentes o procesos de ingeniería inversa que puede requerir validación.

external

Contiene copias materializadas desde otros repositorios y no debería editarse manualmente.

Esta separación ayuda a prevenir modificaciones accidentales sobre contenido que será sobrescrito durante la siguiente sincronización.

⸻

18. Arquitectura recomendada

La arquitectura recomendada es híbrida:

Fuentes remotas
GitHub repositories
        │
        ├── Clone completo cuando se necesita desarrollo o reverse engineering profundo
        │
        └── Materialización parcial cuando solo se necesita documentación
                    ↓
          Workspace local de contexto
                    ↓
           Manifiesto de procedencia
                    ↓
              Local Search
                    ↓
       SQLite + índices vectoriales
                    ↓
          CLI y skill para agentes

Esta arquitectura permite seleccionar la estrategia adecuada para cada fuente sin obligar a utilizar el mismo mecanismo para todos los repositorios.

⸻

19. Criterio para elegir la estrategia

Utilizar un clone independiente cuando:

* Se necesita analizar el código completo.
* Se realizará desarrollo.
* Se requiere acceso al historial.
* Es necesario cambiar de branch.
* El reverse engineering depende de múltiples módulos.
* Se deben ejecutar pruebas o herramientas locales.

Utilizar materialización parcial cuando:

* Solo se necesita documentación.
* El repositorio es demasiado grande.
* Se requiere únicamente un directorio.
* La fuente se utilizará exclusivamente como contexto.
* No se necesitan operaciones Git.
* Se desea evitar submodules.

Utilizar submodules cuando:

* Existe una dependencia versionada real entre repositorios.
* El repositorio padre debe apuntar a un commit exacto del repositorio hijo.
* El equipo ya tiene un proceso claro para administrarlos.
* Se necesita preservar formalmente la relación Git.

Los submodules no deberían utilizarse solamente para facilitar la búsqueda de contexto.

⸻

20. Principio central

El principio central de esta etapa es:

Las fuentes pueden vivir en múltiples repositorios remotos, pero el contexto utilizado por Local Search debe poder materializarse, versionarse e indexarse localmente de forma controlada.

MCP puede facilitar el acceso y la sincronización.

Los clones independientes permiten realizar análisis completos.

La materialización parcial permite recuperar solamente la documentación necesaria.

Git submodules deben reservarse para dependencias reales entre repositorios, no como mecanismo general para ensamblar un workspace de conocimiento.

Aquí aparece una decisión arquitectónica importante: GitHub MCP puede funcionar como capa de adquisición, pero Local Search continúa siendo la capa local de indexación y recuperación. Esto permite probar MCP sin hacer que todo el sistema dependa de su disponibilidad.



----
----


I need to prepate a workshop demo to cover the following items

- local context strategy
- process to Generate Local Context
- How to use Local Search to retrieve context 
- When Graphify to retrieve context
  

Read the content from :

.devlocal/local-context/context-retrieval-process.md
.devlocal/local-context/local-context-01.md
.devlocal/local-context/local-context-02.md
.devlocal/local-context/local-context-process-01.md
.devlocal/local-context/local-context-strategy.md


I want a ready-to-use workshop demo that covers the following items:
- Local Context Strategy
- Process to Generate Local Context
- How to use Local Search to retrieve context
- When to use Graphify to retrieve context

and how we can use Company OS and Team OS to support the context retrieval process.