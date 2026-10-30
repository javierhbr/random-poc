
## Why We Need This Platform Governance

Implementing a governance framework—often called an Architecture Spine—is not about creating bureaucratic bottlenecks; it is about establishing a shared operational reality. For a highly asynchronous, high-concurrency chat platform, governance acts as the foundational contract that allows autonomous teams to move fast without breaking the ecosystem.

  

- **Enabling Spec-Driven Development (SDD):** SDD relies on clear, upfront technical specifications. Without a defined Architecture Spine, every Spec becomes a philosophical debate about naming conventions, state ownership, or tool selection. Governance provides the constraints needed to make Spec writing objective and straightforward.
    
      
    
- **Preventing State Corruption:** Chat platforms handle complex, mutable states (e.g., transitioning from a bot to a human agent while a message is in flight). Explicit rules around the System of Record (SoR) and state machines ensure that multiple components do not attempt to overwrite the same entity simultaneously.
    
      
    
- **Decoupling and Resiliency:** By enforcing strict event contracts and defining choreography versus orchestration, we prevent tightly coupled monoliths in disguise. If a downstream CRM goes offline, governance dictates the exact fallback mechanism, ensuring the chat platform remains available to the customer.
    
      
    
- **Accelerating Onboarding and Review:** A single source of truth for the Ubiquitous Language and platform boundaries means new engineers can safely contribute faster, and Architecture/Peer reviews shift from subjective opinions to objective checklist validations.
    
      
    

## How to Use the Architecture Spine in Daily Workflows

This framework is a living, working tool designed to guide the software development lifecycle from conception to deployment. Here is how the team should interact with it at every stage:

  

### 1. During Discovery and Requirement Gathering

- **Consult the Ubiquitous Language:** Before writing a single line of a proposal, ensure you are using the exact domain terminology defined in the Spine. If a product manager asks for a "user text," translate and document it as a `Message` originating from a `Participant` to align with the platform's glossary.
    
      
    
- **Verify Platform Boundaries:** Check the "What We Don't Do" section. If a new feature requests the chat platform to process billing logic, use the boundary definitions to push that responsibility back to the appropriate external domain.
    
      
    

### 2. When Writing a Technical Spec (Spec-Driven Development)

- **Identify the Impacted Bounded Contexts:** Explicitly state which domains your change will touch and confirm you are respecting the designated System of Record (SoR) for any data you plan to mutate.
    
      
    
- **Draft Contracts First:** If your feature introduces a new event or API, attach the drafted AsyncAPI or OpenAPI contract directly in the Spec. Do not write code until the contract conforms to the Event Catalog standards.
    
      
    
- **Trace the Golden Path:** Map out the "Vertical Slice." Document how your feature alters the standard flow of a message and explicitly state how it will pass Correlation IDs for distributed tracing.
    
      
    
- **Acknowledge NFRs and Fallbacks:** Include a section in your Spec detailing how your feature adheres to the platform's latency SLAs and what happens if your new component fails (Graceful Degradation).
    
      
    

### 3. During Architecture and Peer Reviews

- **Use it as a Grading Rubric:** Reviewers should use the Architecture Spine to objectively evaluate Specs and Pull Requests. Instead of saying, "I don't like this data flow," reviewers should state, "This flow violates the SoR principle defined in the Spine by allowing the routing service to update the session state."
    
      
    
- **Validate State Machine Integrity:** If a Spec introduces a new feature (like a "timeout" mechanism), reviewers must check the Core State Machine definitions to ensure the new state transition is legal and handled by the authorized component.
    
      
    

### 4. During Implementation and PR Submission

- **Enforce Traceability:** Ensure that the code implementation explicitly handles the OpenTelemetry or correlation headers exactly as defined in the observability topology.
    
      
    
- **Implement Error Handling Patterns:** Verify that Circuit Breakers, Retries, and Dead Letter Queues (DLQs) are actively coded into the solution, matching the resilience standards outlined in the platform governance.
    
      
    

### 5. Continuous Evolution (Updating the Spine)

- **Propose Changes via RFC (Request for Comments):** The Spine is not immutable, but it requires consensus to change. If a developer finds a flaw in the current state machine or needs to add a new term to the Ubiquitous Language, they should submit a localized PR to the `ARCHITECTURE-SPINE.md` document for the architecture group to review and merge.
    
      
    

---
---

## documentation structure

Keeping architectural documentation directly alongside the codebase (Docs-as-Code) ensures the governance framework evolves in sync with the platform and remains highly visible to developers.

  

Plaintext

```
chat-platform-repo/
├── docs/
│   ├── architecture/
│   │   ├── ARCHITECTURE-SPINE.md       # Core principles, boundaries, and SoR definitions
│   │   ├── STATE-MACHINES.md           # Visuals (Mermaid.js) and rules for entity lifecycles
│   │   ├── NFRs-AND-RESILIENCE.md      # Latency SLAs, failover rules, and tracing topologies
│   │   └── DECISION-LOG/               # Architecture Decision Records (ADRs) for historical context
│   │       ├── 001-use-kafka-for-events.md
│   │       └── 002-decouple-nlp-engine.md
│   ├── domain/
│   │   └── UBIQUITOUS-LANGUAGE.md      # The immutable glossary of domain terms
│   ├── contracts/
│   │   ├── asyncapi/                   # The Event Catalog (Kafka/RabbitMQ payloads)
│   │   │   ├── ChatInitiated.yaml
│   │   │   └── MessageSent.yaml
│   │   └── openapi/                    # Synchronous REST/gRPC API definitions
│   │       └── ChatGatewayAPI.yaml
│   └── specs/                          # Spec-Driven Development (SDD) workspace
│       ├── _template/
│       │   └── sdd-template.md         # Standardized form developers must fill out
│       ├── drafts/                     # WIP specs undergoing Peer/Architecture review
│       └── approved/                   # Specs ready for implementation or already built
├── src/                                # Microservices / Platform Source Code
│   ├── chat-router/
│   ├── session-manager/
│   ├── webhook-handler/
│   └── bot-orchestrator/
├── .github/                            # CI/CD workflows and PR templates
│   └── PULL_REQUEST_TEMPLATE.md        # Forces developers to link to an approved Spec
├── docker-compose.yml
└── README.md                           # Entry point linking directly to ARCHITECTURE-SPINE.md
```

### Key Organizational Strategies for this Structure

- **Proximity to Code:** Placing `docs/` at the root of the monorepo (or main platform repository) ensures that updating contracts, glossary terms, or state machines requires the same Git workflow (branching, PRs, code reviews) as changing the application code.
    
      
    
- **Separation of Contracts and Code:** The `contracts/` directory acts as the absolute source of truth. Continuous Integration (CI) pipelines can be configured to read these YAML files and auto-generate the data models/SDKs inside the `src/` directories, physically enforcing the event contracts.
    
      
    
- **Spec Lifecycle Management:** The `specs/` folder creates a visible pipeline for SDD. A new feature starts as a Markdown file in `drafts/`. Once the technical approach, terminology, and contracts are approved against the Architecture Spine, it moves to `approved/`, signaling that coding can begin.
    
      
    
- **Decoupled Decision Logging:** The `DECISION-LOG/` (using the ADR pattern) captures _why_ a principle exists. If the platform uses Kafka instead of RabbitMQ, or if a specific component was designated as the System of Record, the reasoning is permanently recorded here so future developers do not reopen closed debates.
    
      
    

Would you like a detailed markdown template for the `sdd-template.md` file so developers know exactly what to fill out when proposing a new platform change?


---
---

## Categorizer requirements
  

Use this set of "Litmus Tests" (diagnostic questions and criteria) to identify exactly where a piece of logic or architecture belongs.

  

## 1. Domain vs. Bounded Context

People often confuse these. The **Domain** is the _problem space_ (how the business thinks). The **Bounded Context** is the _solution space_ (where the code and data live).

  

**Diagnostic for a Domain / Subdomain:**

  

- **The "Non-Tech" Test:** If you remove all software, servers, and code, does this concept still exist in the business?
    
      
    
- **The Expertise Test:** Is there a specific group of business people who are experts in this?
    
      
    
- _Example:_ "Customer Support," "Agent Routing," and "User Analytics" are Domains.
    
      
    

**Diagnostic for a Bounded Context:**

  

- **The Language Boundary Test:** Does a core term change meaning here? (e.g., Inside the `Chat Routing` context, a "Session" means an active WebSocket connection. Inside the `Billing` context, a "Session" means a billable time block). If the definition changes, you have crossed a Bounded Context.
    
      
    
- **The Autonomy Test:** Can a specific team own, build, and deploy this boundary independently without breaking other teams' databases?
    
      
    
- _Verdict:_ If it passes these tests, it is a Bounded Context and should likely be a distinct microservice (or cohesive set of services) with its own database.
    
      
    

## 2. Business Logic: Core Domain vs. Application Logic

When analyzing code or a new Spec, you must separate the "rules of the business" from the "plumbing."

  

**Diagnostic for Core Domain Logic:**

  

- **The "Business Rule" Test:** If you explain this logic to a non-technical Product Manager, do they care?
    
      
    
- **The Invariant Test:** Is this a rule that must _never_ be violated under any circumstances?
    
      
    
- _Examples:_ "A VIP customer must never wait longer than 30 seconds for an agent." "A chat cannot be closed if there is a pending payment."
    
      
    
- _Verdict:_ This goes into the heart of your Bounded Context (Domain Entities, Value Objects, or Domain Services). It should be pure logic, completely unaware of databases or APIs.
    
      
    

**Diagnostic for Application / Orchestration Logic:**

  

- **The "Plumbing" Test:** Is this just coordinating tasks? (e.g., "1. Fetch user from DB, 2. Call external CRM API, 3. Send payload to Kafka").
    
      
    
- _Verdict:_ This belongs in the Application Layer (Use Cases / Handlers). It orchestrates the Domain Logic but contains no actual business rules itself.
    
      
    

## 3. Identifying the System of Record (SoR)

When multiple components touch the same data, you must identify the single source of truth.

  

**Diagnostic for SoR:**

  

- **The "Audit" Test:** If two microservices disagree on the current state of a Chat Session, which database does the business trust for a legal audit?
    
      
    
- **The Write-Authority Test:** Is this the _only_ component allowed to mutate (create/update/delete) the state of this specific entity?
    
      
    
- _Verdict:_ The component that passes these tests is the SoR for that entity. Any other component holding that data is merely holding a "Read Model" or a cache, and must subscribe to events from the SoR to stay updated.
    
      
    

## 4. Identifying a Non-Functional Requirement (NFR)

Product teams usually ask for features (what it does). Architects must extract the NFRs (how it behaves).

  

**Diagnostic for NFRs:**

  

- **The "Ility" Test:** Does this describe scalability, reliability, observability, security, or maintainability?
    
      
    
- **The Constraint Test:** Does this define a strict operational boundary rather than a user action?
    
      
    
- **The Testing Test:** Can this be validated by a load tester, chaos monkey, or static analysis tool rather than a standard unit test?
    
      
    
- _Examples:_ "Messages must be delivered in under 200ms." "The system must handle 50,000 concurrent WebSockets." "PII must be masked in logs."
    
      
    
- _Verdict:_ These are NFRs. They do not belong in a single feature's business logic; they belong in the `NFRs-AND-RESILIENCE.md` global architecture document and must be enforced via platform-wide infrastructure (API gateways, service meshes, CI/CD rules).
    
      
    

## 5. Identifying Platform Boundaries (What We DON'T Do)

When a feature request threatens to bloat the chat platform with logic that belongs elsewhere.

  

**Diagnostic for Out-of-Bounds Logic:**

  

- **The "Enterprise Duplication" Test:** Does the company already have another system (CRM, ERP, Identity Provider) whose primary job is to do this?
    
      
    
- **The Context Starvation Test:** Does the chat platform require massive amounts of external data just to make this one decision? (e.g., calculating a user's credit score).
    
      
    
- _Verdict:_ If yes, this logic is outside the platform boundaries. The chat platform should act as a _pass-through_ or API consumer, rather than attempting to house the logic.
    
      
    

### The Analyst's Cheat Sheet

When reviewing a new PR, Spec, or legacy component, run it through this grid:

| **If the requirement is about...**                | **Then it is...**      | **Where it belongs**                     |
| ------------------------------------------------- | ---------------------- | ---------------------------------------- |
| **A broad area of business focus**                | Domain                 | High-level organizational strategy       |
| **A strictly defined model owned by one team**    | Bounded Context        | A specific Microservice / Module         |
| **A strict rule about how the business operates** | Core Business Logic    | Domain Entities / Value Objects          |
| **Coordinating API calls and DB saves**           | Application Logic      | Use Cases / Orchestrators                |
| **The ultimate source of truth for a state**      | System of Record (SoR) | The authoritative Database / Service     |
| **Speed, scale, security, or uptime constraints** | NFR                    | Global Architecture / Infrastructure     |
| **Logic duplicated from the Enterprise CRM**      | Out-of-Bounds          | External API call (do not build it here) |




----
----


## Part 1: Component-Level Audit Matrix

Use this worksheet to evaluate macro-components (microservices, modules, or databases) across the platform. The goal is to identify monolithic tendencies, misplaced responsibilities, and clear boundaries.

  

|**Component Name**|**Primary Domain**|**Bounded Context**|**System of Record (SoR) For:**|**NFRs & SLAs (Current vs Target)**|**Out-of-Bounds / Leaked Logic**|**Action Required**|
|---|---|---|---|---|---|---|
|_(Example) Chat Webhook API_|_Customer Support_|_Chat Ingestion_|_None (Pass-through only)_|_< 100ms latency, 10k concurrent_|_Currently formats timestamps based on user timezone (UI logic)._|_Move timezone formatting to frontend; keep API pure._|
|_(Example) Routing Engine_|_Customer Support_|_Agent Routing_|_Agent Availability, Queue State_|_High availability, strict FIFO_|_Queries CRM directly to check if user is VIP._|_Decouple. Ingestion should fetch VIP status and pass via event._|
||||||||
||||||||
||||||||

## Part 2: Logic & Behavior Triage Checklist

Use this worksheet during Spec reviews or when auditing a specific, tangled class/module to determine where individual pieces of logic actually belong.

  

**Instructions:** For each piece of behavior, answer the diagnostic questions (Y/N). Use the resulting pattern to determine its true architectural home.

  

|**Behavior / Logic Description**|**"Business Rule" Test (Non-tech PM cares?)**|**"Language" Test (Term meaning is unique here?)**|**"Write-Authority" Test (Sole mutator of state?)**|**"Constraint" Test (Dictates speed/scale/security?)**|**Architectural Verdict**|
|---|---|---|---|---|---|
|_(Example) "If user is VIP, bypass bot and assign to human"_|Y|Y|N (Routing mutates state, not this rule)|N|**Core Domain Logic** (Routing Context)|
|_(Example) "Update session status to CLOSED in database"_|N|Y|Y|N|**System of Record Mutation** (Session Context)|
|_(Example) "Retry CRM API 3 times with exponential backoff"_|N|N|N|Y|**NFR / Infrastructure** (API Gateway or Mesh)|
|_(Example) "Fetch user profile, then fetch chat history, then merge"_|N|N|N|N|**Application Logic** (BFF / Orchestrator)|
|||||||
|||||||

## Part 3: The SDD Refactoring Action Plan

Once you have audited the components and their internal logic, categorize the required architectural changes into this backlog to feed into your Spec-Driven Development (SDD) pipeline.

  

|**Finding Category**|**Symptom Discovered during Audit**|**Required Action (SDD Spec Target)**|**Priority**|
|---|---|---|---|
|**SoR Violation**|Two different components are writing directly to the `ChatSession` table.|Write a Spec to lock the DB to the Session Manager; force the other component to use an async `SessionUpdateRequested` event.|High|
|**Context Leakage**|The Chat Router contains 500 lines of code calculating agent payroll hours.|Write a Spec to extract payroll calculation out of the chat platform entirely; send a `ChatClosed` event to the external ERP.|High|
|**Missing NFR**|Webhooks drop payloads during traffic spikes because there is no queuing mechanism.|Write a Spec introducing a Dead Letter Queue (DLQ) and Kafka buffer before the webhook processor.|Medium|
|**Domain Anemia**|Business rules about "Idle Chat Timeouts" are scattered across 4 different UI frontend apps.|Write a Spec to move timeout invariant logic into the core Domain model of the Session Manager.|Low|

To run this audit effectively with your development teams, schedule a dedicated workshop where you map out just one "Golden Path" (e.g., an inbound WhatsApp message) and put every component it touches through these three worksheets. This grounds the abstract architecture concepts into their daily reality.