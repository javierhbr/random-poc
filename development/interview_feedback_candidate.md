# Interview Feedback -- Candidate Evaluation

**Interviewer:** Senior Software Engineer\
**Interview Type:** Behavioral / Leadership & Collaboration

------------------------------------------------------------------------

# Question 1 -- Handling Risk and Ambiguity (Observatory Telemetry Project)

## Situation Summary

The candidate described a situation while working at an observatory
where he was responsible for the telemetry pipeline that captured
hardware data and processed it for backend systems and UI consumption.

During the project, the engineer responsible for the integration between
the hardware and the backend left the company. This person had been the
only subject matter expert in that integration layer, which created a
significant risk for the project.

To prevent the project from getting blocked, the candidate investigated
the hardware communication layer and performed some reverse engineering
to understand how the telemetry APIs worked. At the same time, he
proposed building a telemetry simulator that could emulate the hardware
output so the backend and UI teams could continue development while the
hardware integration knowledge gap was being resolved.

He presented the idea to the team and leadership and, according to him,
there was no pushback because the problem and the solution were clearly
identified.

The simulator ended up being successful and the project was completed.
The telemetry simulation platform later became part of the normal
development workflow because it allows teams to test changes without
directly interacting with physical hardware.

## Evaluation

This example shows good initiative and a strong sense of ownership. The
candidate identified a major delivery risk and proactively created a
solution that allowed the rest of the organization to continue
progressing without waiting for the missing hardware expertise.

However, the explanation itself was somewhat difficult to follow
initially. The candidate appeared anxious and spoke very quickly. I had
to ask him multiple times to slow down and repeat parts of the story.

Additionally, the initial explanation lacked clarity around
implementation details and measurable impact. Several follow‑up
questions were required to fully understand the outcome.

## Signal

-   Strong ownership and problem solving\
-   Good engineering judgment under uncertainty\
-   Moderate communication clarity

**Rating:** 4 / 5

------------------------------------------------------------------------

# Question 2 -- Cross-Team Coordination and System Evolution (Fabric Inc.)

## Situation Summary

The candidate described a project from his time as a Senior Backend
Engineer at Fabric Inc., a B2B platform.

He was responsible for implementing changes to what he described as the
"data model" of the backend. During the discussion it became clear that
he was primarily referring to changes to API contracts (request and
response structures).

The challenge was introducing these changes without breaking existing
consumers.

His solution was to introduce a versioned API strategy, creating a v2
version of the API while maintaining the original version in production.

This required coordination with multiple teams including backend
services and UI teams consuming the APIs.

## Evaluation

This example demonstrates solid engineering practice around API
evolution and backward compatibility.

One challenge during the explanation was terminology. The term "data
model" created confusion initially, and clarification was required to
understand the real scope of the change.

Overall the example shows the candidate can coordinate work across teams
and manage change rollout.

## Signal

-   Good collaboration across teams\
-   Sound engineering practices for API evolution\
-   Some ambiguity in explanation initially

**Rating:** 3.5 / 5

------------------------------------------------------------------------

# Question 3 -- Working with Non‑Software Stakeholders

## Situation Summary

The candidate described leading a project where many stakeholders were
not software engineers. Stakeholders included astrophysicists,
mechanical engineers, and other domain specialists.

The main challenges were extracting requirements, translating domain
knowledge into software requirements, and working without existing
documentation.

The candidate addressed this by working closely with stakeholders and
creating structured documentation using internal tools similar to
Confluence.

The documentation served as a shared source of truth for both engineers
and stakeholders.

## Evaluation

This was the clearest example from a communication standpoint. The
candidate clearly described the challenge and the steps taken to address
it.

The approach of combining collaboration and documentation was
appropriate for a domain‑heavy environment.

## Signal

-   Good stakeholder management\
-   Ability to extract and structure domain knowledge\
-   Clear communication in this example

**Rating:** 4 / 5

------------------------------------------------------------------------

# Overall Assessment

The candidate demonstrated:

-   Ownership and initiative
-   Practical engineering judgment
-   Ability to coordinate across teams
-   Ability to work with non‑software stakeholders

One area for improvement is communication clarity. Some explanations
required follow‑up questions before the impact and implementation were
fully understood.

------------------------------------------------------------------------

# Hiring Recommendation

Based on the behavioral interview, I would recommend proceeding with the
candidate.

If the candidate performs well in the technical interviews, I would feel
comfortable recommending moving forward with the hire.

However, based on the signals observed, the candidate appears closer to
the expectations of a **Manager role rather than a Senior Manager**.

If the technical evaluation is strong, I would support hiring him for a
Manager position. If the technical evaluation is weak, the gap relative
to a Senior Manager role would likely become more evident.

------------------------------------------------------------------------

# Original Raw Notes (Unedited)

## Pregunta 1

El candidato trabajaba en el observatorio en la parte de telemetría
capturando datos del hardware y procesándolos para la UI. El ingeniero
responsable de la integración entre hardware y backend dejó el proyecto
y era el único experto.

Esto generó un riesgo importante para el proyecto. El candidato decidió
hacer ingeniería inversa al hardware y a las APIs para entender cómo
funcionaban los datos. Para evitar bloquear al equipo propuso crear una
simulación de la telemetría del hardware.

Gracias a esta simulación, los equipos de backend y UI pudieron seguir
trabajando mientras el equipo investigaba y entendía mejor el hardware
real. Finalmente el proyecto terminó bien y la simulación quedó como
parte del proceso de desarrollo.

A nivel de comunicación el candidato hablaba muy rápido y tuve que
pedirle varias veces que repitiera o que bajara la velocidad para
entender bien la situación.

## Pregunta 2

El candidato trabajaba como Senior Backend Engineer en Fabric Inc. y
tenía que cambiar el data model del backend.

Después de varias preguntas entendí que en realidad se refería
principalmente a cambios en los contratos de las APIs (request/response)
que impactaban a la UI y otros consumidores.

La solución fue crear una versión 2 de la API y también de los
consumidores para poder desarrollar sin afectar producción. La
complejidad principal fue coordinar a múltiples equipos y stakeholders.

Tuve que hacer varias preguntas de follow‑up para entender el impacto y
qué significaba exactamente data model en este contexto.

## Pregunta 3

El candidato lideró un proyecto en el observatorio con stakeholders que
no tenían experiencia en software (astrofísicos, ingenieros mecánicos,
etc.).

El desafío fue entender los requerimientos, extraer conocimiento del
dominio y educar a los stakeholders sobre cómo trabajar con un equipo de
software.

También había muy poca documentación, por lo que decidió documentar todo
en herramientas internas similares a Confluence.

En esta pregunta la comunicación fue mejor, fue más claro y no tuve que
pedir tantas aclaraciones.
