Esta segunda parte incorpora la relación entre la realidad funcional de la plataforma y la realidad funcional de cada componente derivada del código fuente.

Proceso de construcción y trazabilidad del contexto funcional

1. Dos niveles complementarios de contexto

El proceso mantiene dos niveles de documentación que cumplen propósitos diferentes, pero que deben permanecer conectados:

1. Contexto funcional de la plataforma, construido a partir de requerimientos, funcionalidades, flujos y experiencias.
2. Contexto funcional de los componentes, construido mediante ingeniería inversa desde el código fuente.

El contexto de plataforma describe la experiencia y el comportamiento general que la plataforma ofrece a sus usuarios.

El contexto de componente describe cómo cada servicio, proceso, aplicación o artefacto participa en la implementación de esas capacidades.

La combinación de ambos niveles permite entender no solo qué hace la plataforma, sino también qué componentes soportan cada funcionalidad y qué comportamientos específicos existen dentro de ellos.

⸻

2. Construcción de la realidad actual de la plataforma

La realidad actual, o current reality, se genera acumulando, reconciliando y consolidando las funcionalidades descritas en múltiples documentos de requerimientos.

Cada documento puede representar:

* Una nueva funcionalidad.
* Un cambio sobre una funcionalidad existente.
* Una mejora de una experiencia.
* Una modificación de un flujo.
* Una nueva regla de negocio.
* Una excepción.
* Una integración.
* La evolución de una capacidad existente.

Estos documentos suelen describir cambios individuales ocurridos en distintos momentos. Por sí solos, no necesariamente representan el funcionamiento completo y vigente de la plataforma.

Por eso, el proceso no consiste simplemente en almacenar todos los requerimientos, sino en integrarlos para construir una representación coherente de cómo funciona la plataforma actualmente.

La realidad actual es el resultado acumulado de:

* Funcionalidades originales.
* Cambios posteriores.
* Extensiones.
* Correcciones.
* Excepciones.
* Nuevos escenarios.
* Decisiones funcionales vigentes.

El resultado se convierte en la fuente de la verdad funcional de la plataforma.

⸻

3. La realidad actual como fuente de la verdad

La documentación consolidada representa el comportamiento conocido y vigente de la plataforma.

Su función es responder preguntas como:

* ¿Qué experiencias ofrece la plataforma?
* ¿Qué puede hacer cada tipo de usuario?
* ¿Cómo funciona un flujo determinado?
* ¿Qué reglas de negocio se aplican?
* ¿Qué escenarios están soportados?
* ¿Qué componentes participan?
* ¿Qué sistemas externos intervienen?
* ¿Cuáles son las dependencias downstream?
* ¿Qué ocurre en condiciones normales y excepcionales?

Los documentos de requerimientos permanecen como evidencia histórica y como referencia de decisiones específicas.

Sin embargo, la fuente principal de contexto para agentes y modelos debe ser la representación consolidada de la realidad, no la suma sin procesar de documentos históricos.

⸻

4. Identificación de componentes y artefactos

Como parte de la construcción del contexto de plataforma, se identifican todos los componentes y artefactos que participan directa o indirectamente en sus funcionalidades.

Esto puede incluir:

* Aplicaciones web.
* Aplicaciones móviles.
* Servicios backend.
* Microservicios.
* APIs.
* Procesos batch.
* Procesadores de eventos.
* Workers.
* Bases de datos relevantes.
* Sistemas de integración.
* Plataformas externas.
* Servicios de terceros.
* Sistemas downstream.
* Sistemas upstream.
* Repositorios con lógica funcional.
* Procesos operacionales automatizados.

La relación entre la funcionalidad y los componentes debe formar parte del contexto de plataforma.

Por ejemplo, una funcionalidad como pago de tarjeta de crédito puede involucrar:

* La aplicación utilizada por el cliente.
* Un API gateway.
* Un servicio de pagos.
* Un servicio de cuentas.
* Un procesador externo.
* Un sistema antifraude.
* Un servicio de notificaciones.
* Procesos de conciliación.
* Sistemas downstream de reportes o contabilidad.

El contexto de plataforma identifica esta relación a un nivel general. Posteriormente, cada componente con código puede analizarse de forma independiente y con mayor profundidad.

⸻

5. Ingeniería inversa de los componentes

Para construir el contexto específico de cada servicio, proceso o componente, se utiliza un comando de Uncle Dev que ejecuta un proceso de ingeniería inversa sobre el código fuente.

En esta etapa, el código sí se utiliza como fuente primaria de evidencia.

Sin embargo, el objetivo del análisis no es documentar el código línea por línea ni generar una descripción de clases, métodos o archivos.

El objetivo es reconstruir el comportamiento funcional implementado por el componente.

La ingeniería inversa debe ayudar a descubrir:

* Qué funcionalidades implementa el componente.
* Qué casos de uso soporta.
* Qué reglas de negocio ejecuta.
* Qué escenarios especiales contempla.
* Qué validaciones aplica.
* Qué entradas recibe.
* Qué salidas produce.
* Qué eventos consume o publica.
* Qué APIs expone o invoca.
* Qué procesos ejecuta.
* Qué dependencias tiene.
* Qué errores o excepciones maneja.
* Qué estados funcionales administra.
* Qué capacidades de plataforma soporta.

El resultado debe ser una especificación funcional derivada del código, no una documentación técnica de bajo nivel.

⸻

6. Reverse engineering orientado a funcionalidades

La ingeniería inversa se realiza siguiendo la metodología de Spec-Driven Development definida para el proyecto y utilizando las capacidades de Uncle Dev.

El proceso debe interpretar el código desde una perspectiva funcional.

En lugar de preguntar:

¿Qué clases y métodos existen en este repositorio?

El análisis debe preguntar:

¿Qué comportamientos, reglas y capacidades de negocio están implementados en este repositorio?

Por ejemplo, en lugar de documentar únicamente que existe un método llamado:

processCreditCardPayment()

el resultado debería explicar funcionalmente:

* Qué condiciones permiten realizar un pago.
* Qué validaciones se aplican.
* Qué tipos de pago se soportan.
* Qué ocurre cuando el pago es rechazado.
* Cómo se manejan los reintentos.
* Qué sistemas externos participan.
* Qué eventos se generan.
* Cómo se informa el resultado al usuario.
* Qué procesos posteriores son activados.

⸻

7. Complemento entre documentación de plataforma y código

La ingeniería inversa no debe realizarse de manera aislada.

El análisis del componente debe complementarse con el contexto funcional de la plataforma.

El contexto de plataforma proporciona:

* La intención de negocio.
* El propósito de la funcionalidad.
* La experiencia esperada.
* Los actores involucrados.
* Los flujos principales.
* Las reglas conocidas.
* La terminología oficial.
* Los identificadores de los requerimientos.
* La relación con otros dominios y componentes.

El código proporciona:

* El comportamiento efectivamente implementado.
* Las validaciones reales.
* Los escenarios no documentados.
* Las excepciones.
* Las variantes.
* Las dependencias técnicas.
* Los flujos alternativos.
* La lógica acumulada con el tiempo.

La combinación de ambas fuentes permite identificar:

* Funcionalidad documentada e implementada.
* Funcionalidad documentada pero no encontrada en el código.
* Funcionalidad implementada pero no documentada.
* Diferencias entre el comportamiento esperado y el real.
* Escenarios de componente que no aparecen en la descripción de alto nivel.
* Reglas duplicadas o contradictorias.
* Posibles capacidades obsoletas.
* Dependencias desconocidas.

⸻

8. Trazabilidad mediante tags de requerimientos

Para mantener la trazabilidad entre la realidad de la plataforma y la implementación de los componentes, las funcionalidades utilizan identificadores o tags de requerimientos.

Estos tags permiten conectar:

* El requerimiento original.
* La funcionalidad consolidada de plataforma.
* El flujo o experiencia de usuario.
* El bounded context.
* El componente responsable.
* La especificación obtenida mediante ingeniería inversa.
* Los escenarios específicos implementados en el código.
* Las pruebas relacionadas.
* Las dependencias downstream.

Una funcionalidad de alto nivel puede tener un identificador principal.

Por ejemplo:

ER-PAYMENT-001

Este identificador puede representar la capacidad general:

Realizar el pago de una tarjeta de crédito.

Dentro de un componente específico, esa funcionalidad puede expandirse utilizando subtags.

Por ejemplo:

* ER-PAYMENT-001.01: Pago con cuenta interna.
* ER-PAYMENT-001.02: Pago desde cuenta externa.
* ER-PAYMENT-001.03: Pago programado.
* ER-PAYMENT-001.04: Pago recurrente.
* ER-PAYMENT-001.05: Validación de fondos.
* ER-PAYMENT-001.06: Rechazo del pago.
* ER-PAYMENT-001.07: Reintento de procesamiento.
* ER-PAYMENT-001.08: Cancelación de un pago programado.
* ER-PAYMENT-001.09: Notificación del resultado.
* ER-PAYMENT-001.10: Conciliación posterior.

El identificador principal mantiene la relación con la capacidad de plataforma.

Los subtags permiten documentar el detalle funcional que solo es visible al analizar el componente.

⸻

9. Jerarquía de funcionalidades

La trazabilidad puede organizarse mediante una jerarquía funcional.

Nivel 1: Experiencia o capacidad de plataforma

Representa lo que la plataforma ofrece al customer.

Ejemplo:

ER-PAYMENT

Experiencia: Administración de pagos.

Nivel 2: Flujo o funcionalidad principal

Representa una acción o resultado específico dentro de la experiencia.

Ejemplo:

ER-PAYMENT-001

Funcionalidad: Realizar el pago de una tarjeta de crédito.

Nivel 3: Escenario funcional

Representa variantes relevantes del flujo principal.

Ejemplo:

ER-PAYMENT-001.02

Escenario: Realizar el pago desde una cuenta bancaria externa.

Nivel 4: Comportamiento específico del componente

Representa una regla, validación o procesamiento interno que necesita trazabilidad propia.

Ejemplo:

ER-PAYMENT-001.02.03

Comportamiento: Rechazar el pago cuando la cuenta externa no ha sido verificada.

Esta jerarquía permite navegar desde una capacidad general de plataforma hasta un comportamiento concreto implementado dentro de un componente.

⸻

10. Nivel de detalle por contexto

El nivel de detalle no debe ser igual en todos los documentos.

Contexto de plataforma

Debe describir:

* La experiencia general.
* Los flujos principales.
* Las capacidades visibles.
* Los actores.
* Las reglas de negocio relevantes.
* Los resultados esperados.
* Los componentes participantes.
* Las dependencias principales.

Su objetivo es ofrecer una visión coherente y comprensible de la plataforma.

Contexto de componente

Debe describir:

* Los escenarios implementados.
* Las validaciones específicas.
* Las variantes del flujo.
* Las reglas ejecutadas por el componente.
* Las integraciones concretas.
* Los estados manejados.
* Los eventos.
* Las excepciones.
* Los reintentos.
* Los comportamientos internos funcionalmente relevantes.

Su objetivo es explicar con mayor precisión cómo el componente contribuye a las capacidades de la plataforma.

⸻

11. Ejemplo: pago de tarjeta de crédito

A nivel de plataforma, la funcionalidad podría documentarse de esta manera:

ER-PAYMENT-001: Pago de tarjeta de crédito

El customer puede realizar un pago sobre el balance de su tarjeta de crédito utilizando una fuente de fondos válida. La plataforma valida la solicitud, procesa el pago, informa el resultado y actualiza el estado correspondiente.

Esta descripción representa el comportamiento general esperado.

Sin embargo, el servicio de pagos puede contener una cantidad considerable de escenarios adicionales:

* Pago total.
* Pago mínimo.
* Pago por una cantidad personalizada.
* Pago inmediato.
* Pago programado.
* Pago recurrente.
* Pago desde cuenta interna.
* Pago desde cuenta externa.
* Cuenta externa no verificada.
* Fondos insuficientes.
* Pago duplicado.
* Pago rechazado por el procesador.
* Reintento automático.
* Cancelación de un pago programado.
* Modificación de un pago pendiente.
* Reverso.
* Conciliación.
* Error parcial.
* Timeout de una dependencia.
* Notificación exitosa o fallida.

No todos estos detalles necesitan aparecer en la descripción de alto nivel de la plataforma.

Sin embargo, deben quedar documentados dentro del contexto funcional del componente y conectados con la funcionalidad principal mediante tags y subtags.

⸻

12. Mapeo entre plataforma y componentes

Una vez terminada la ingeniería inversa, se realiza un proceso de mapeo entre:

* Las funcionalidades identificadas en la realidad de la plataforma.
* Las funcionalidades encontradas dentro de cada componente.
* Los escenarios derivados del código.
* Las dependencias entre componentes.

El mapeo puede representarse mediante una matriz como la siguiente:

Tag	Funcionalidad	Bounded Context	Componente	Tipo de relación	Estado
ER-PAYMENT-001	Pago de tarjeta	Payments	Customer App	Inicia el flujo	Mapeado
ER-PAYMENT-001	Pago de tarjeta	Payments	Payment API	Orquesta el flujo	Mapeado
ER-PAYMENT-001.05	Validación de fondos	Payments	Account Service	Valida fondos	Mapeado
ER-PAYMENT-001.06	Rechazo del pago	Payments	Payment Processor	Procesa rechazo	Mapeado
ER-PAYMENT-001.09	Notificación	Notifications	Notification Service	Informa el resultado	Mapeado
ER-PAYMENT-001.10	Conciliación	Payments	Settlement Batch	Concilia el pago	Mapeado

La relación no necesariamente es uno a uno.

Una funcionalidad puede involucrar múltiples componentes, y un mismo componente puede soportar múltiples funcionalidades.

⸻

13. Resultados del proceso de ingeniería inversa

El proceso aplicado a cada componente debe producir como mínimo:

13.1 Especificación funcional del componente

Describe qué hace el componente desde el punto de vista funcional.

13.2 Mapa de funcionalidades

Lista las funcionalidades de plataforma soportadas por el componente.

13.3 Catálogo de escenarios

Documenta los casos principales, alternativos y excepcionales.

13.4 Reglas de negocio

Identifica las reglas encontradas en la implementación.

13.5 Mapa de integraciones

Describe los sistemas upstream y downstream relacionados.

13.6 Mapa de trazabilidad

Relaciona los tags de plataforma con comportamientos concretos del componente.

13.7 Diferencias detectadas

Registra divergencias entre la documentación existente y el comportamiento encontrado en el código.

13.8 Preguntas abiertas

Identifica comportamientos ambiguos que requieren validación humana.

⸻

14. Flujo general del proceso

El flujo completo puede resumirse de la siguiente manera:

1. Recopilar documentos de requerimientos.
2. Organizar los documentos por dominio, experiencia y flujo.
3. Consolidar las funcionalidades acumuladas.
4. Construir la realidad actual de la plataforma.
5. Asignar tags de trazabilidad a las funcionalidades.
6. Identificar todos los componentes y dependencias relacionados.
7. Localizar los repositorios que contienen código.
8. Ejecutar ingeniería inversa con Uncle Dev.
9. Analizar el código con foco funcional.
10. Complementar el análisis con el contexto de plataforma.
11. Mapear las funcionalidades encontradas contra los tags existentes.
12. Crear subtags para los escenarios detallados del componente.
13. Detectar diferencias y vacíos.
14. Validar los resultados.
15. Publicar la documentación del componente.
16. Actualizar Local Search.
17. Mantener sincronizado el contexto de plataforma con los contextos de componentes.

⸻

15. Principio central

El principio central del proceso es:

La documentación de plataforma explica la realidad funcional desde la perspectiva del negocio y del customer. La documentación derivada del código explica cómo esa realidad está soportada, distribuida y expandida dentro de los componentes.

Ninguna de las dos perspectivas es suficiente por sí sola.

La documentación de plataforma sin análisis del código puede omitir escenarios realmente implementados.

La documentación del código sin contexto de plataforma puede describir comportamientos sin explicar su propósito, su significado ni su relación con la experiencia del usuario.

La fuente de verdad completa surge de la conexión trazable entre ambas.

En la siguiente iteración convendría definir cómo se detectan y resuelven las diferencias entre la realidad documentada y la realidad encontrada en el código, incluyendo quién tiene autoridad para actualizar cada nivel.

