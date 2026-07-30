I like this better. Context Retrieval Process describes the complete flow rather than a specific technology. It also leaves room to incorporate new context engines in the future without changing the architecture.

I would structure it like this:

Context Retrieval Process

Purpose

The Context Retrieval Process is responsible for discovering, retrieving, correlating, and ranking the information required by humans and AI agents before executing any task.

Rather than relying on a single source of truth or a single retrieval engine, the process orchestrates multiple specialized context providers, each optimized for a different type of knowledge.

Its objective is to deliver the smallest, highest-quality, and most authoritative context necessary for the task.

⸻

Design Principles

* No single retrieval engine understands the entire platform.
* Different types of knowledge require different retrieval strategies.
* Documentation and source code are complementary, not interchangeable.
* Context quality comes from correlating specialized knowledge sources.
* Agents should consume the minimum context required and progressively expand the search only when necessary.

⸻

Context Providers

Local Search

Primary responsibility

Retrieve functional and business knowledge stored in documentation.

Examples:

* Platform Representation of Reality
* Domain Knowledge
* Bounded Contexts
* Business Rules
* Functional Specifications
* PRDs
* ADRs
* Generated Documentation
* Team Knowledge

⸻

Graphify

Primary responsibility

Retrieve implementation knowledge from source code.

Examples:

* Repository structure
* Modules
* Classes
* Functions
* Dependencies
* APIs
* Events
* Call graphs
* Component relationships

Graphify may also index component specifications, but this is a secondary capability. Its primary focus remains understanding source code and implementation relationships.

⸻

Context Correlation

Neither Local Search nor Graphify replaces the other.

Instead, the Context Retrieval Process combines their results into a single contextual view.

                User Request
                      │
                      ▼
        Context Retrieval Process
                      │
       ┌──────────────┴──────────────┐
       │                             │
       ▼                             ▼
 Local Search                   Graphify
(Document Context)          (Code Context)
       │                             │
       └──────────────┬──────────────┘
                      ▼
         Correlation & Ranking
                      ▼
          Uncle Dev Skills & Commands
                      ▼
                 LLM / Agent
                      ▼
               Final Response

⸻

Why this architecture?

This architecture intentionally separates concerns.

Local Search answers:

* What does the platform do?
* Why does it behave this way?
* What are the business rules?
* What does the documentation say?

Graphify answers:

* How is it implemented?
* Which components participate?
* Which services communicate?
* Which functions execute?
* What dependencies exist?

The Context Retrieval Process answers:

What is the complete context required to solve this task?

⸻

Future-proof architecture

One of the benefits of naming this layer Context Retrieval Process is that it does not depend on a particular implementation.

Today it orchestrates:

* Local Search
* Graphify

Tomorrow it could also orchestrate:

* Company Knowledge Graph
* Vector databases
* MCP providers
* Documentation portals
* External knowledge bases
* Internal APIs

without changing the overall architecture.

⸻

I think Context Retrieval Process is even better than "Context Retrieval Architecture," because it emphasizes the workflow agents follow to discover, correlate, and prioritize context, rather than merely describing the system's components. It's a name more aligned with the rest of the Uncle Dev philosophy, where processes and skills orchestrate specialized tools instead of depending on a single technology.




Yes. I would add a brief mention, because this document is about the Context Retrieval Process, not the complete Company OS architecture. The idea is to explain where the knowledge comes from, not to develop the entire organizational hierarchy.

I would add a section like this:

⸻

Relationship with Team OS and Company OS

The Context Retrieval Process is independent of any specific repository or workspace.

It is designed to operate across the different knowledge layers defined by the Uncle Dev ecosystem.

At a high level, those layers include:

* Company OS — Organization-wide knowledge, standards, business domains, platform rules, shared ontologies, and canonical documentation.
* Platform OS — Knowledge shared by multiple teams working on the same platform or product area, including platform architecture, shared components, APIs, and technical standards.
* Team OS — Team-specific documentation, workflows, conventions, component specifications, ADRs, and project knowledge.
* Personal OS — Individual notes, research, drafts, and private working documents that support a user's day-to-day work.

The Context Retrieval Process can retrieve information from any combination of these layers, depending on the task being performed.

For example:

* A business question may primarily require Company OS documentation.
* A platform design question may combine Company OS and Platform OS.
* A feature implementation may combine Team OS documentation with Graphify results from the source code.
* Personal research may combine Personal OS notes with Team OS documentation.

The process does not distinguish between these layers based on their physical location, but rather on their authority, purpose, and relevance to the current task.

⸻

And I would add a very short sentence that ties the whole document together:

Team OS, Platform OS, Company OS, and Personal OS define where knowledge is organized. The Context Retrieval Process defines how that knowledge is discovered, correlated, and delivered to humans and AI agents.

I think that sentence summarizes the relationship between both concepts very well: the different OSes organize knowledge; the Context Retrieval Process is the mechanism that finds it and puts it into context to solve a task.
