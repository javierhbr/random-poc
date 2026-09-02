

# **Platform Analytics Event Contract**

## **Architecture Proposal**

**Status:** Proposed  
**Audience:** Platform Engineering, Application Teams, Data Engineering, Analytics, Observability  
**Scope:** All components producing analytics-relevant events across the platform

---

# **1. Purpose**

This proposal defines a common event contract for collecting analytics data across a distributed, asynchronous, real-time platform.

The platform contains multiple types of components, including:

- Web applications
- Mobile applications
- APIs
- Backend services
- Queue producers and consumers
- Event processors
- Workers
- Batch processes
- External integrations

Each component observes a different part of the customer and platform journey.

The goal is to allow every component to describe what happened using a **consistent platform-wide language**, while still allowing individual domains and components to include event-specific information.

The contract is intended primarily for:

- Customer behavior analytics
- Product analytics
- Operational analytics
- Platform journey reconstruction
- Failure and outcome analysis
- Cross-component correlation
- Data lake ingestion

This contract is not intended to replace:

- Distributed tracing
- Application logs
- Metrics
- Debug telemetry

Instead, it complements those systems.

---

# **2. Architectural Principle**

The central principle is:

Each component tells a small part of the platform story using the same language.

All analytics events share a common structure:

```text
Envelope
+
Context
+
Event-Specific Data
```

The envelope provides consistency.

The context explains where, who, and how.

Event-specific attributes provide flexibility.

---

# **3. Architecture Overview**

A typical flow looks like:

```text
Web / Mobile / API / Worker / Consumer
                │
                │ Platform Analytics Event
                ▼
        Analytics Event Stream
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
   Data Lake        Real-Time Analytics
        │
        ▼
Analytics / Reporting / ML
```

Each producer publishes events using the same platform contract.

Consumers should not need to understand the internal architecture or implementation language of the producing component.

---

# **4. Separation of Concerns**

Analytics events should not duplicate observability telemetry.

The platform has different ways of observing the same reality.

```text
Analytics Events
What happened?

Tracing
How did it happen?

Logs
What did the application say while it happened?

Metrics
How often / how much is happening?
```

These systems complement one another.

For example:

```text
Analytics Event
      │
      │ trace_id
      ▼
Distributed Trace
      │
      ├── Logs
      │
      └── Metrics
```

Analytics might tell us:

17% of customers failed to complete payment authorization.

Tracing can then answer:

What happened technically during those transactions?

The connection between these two views is primarily the `trace_id` and correlation identifiers.

---

# **5. Event Contract**

The proposed top-level structure is:

```text
PlatformEvent
│
├── event
├── producer
├── customer
├── channel
├── trace
├── operation
├── outcome
├── performance
├── attributes
└── extensions
```

Example:

```json
{
  "event": {
    "id": "01J...",
    "name": "payment.authorization.completed",
    "version": "1.0",
    "type": "business",
    "occurred_at": "2026-09-02T12:34:56.123Z"
  },
  "producer": {
    "platform": "payments-platform",
    "component": "authorization-service",
    "component_type": "api",
    "version": "3.14.2",
    "environment": "production",
    "region": "us-east-1"
  },
  "customer": {
    "id": "cust_12345",
    "tenant_id": "tenant_abc",
    "session_id": "session_xyz"
  },
  "channel": {
    "type": "mobile",
    "application": "consumer-app",
    "os": "ios",
    "app_version": "8.2.1"
  },
  "trace": {
    "trace_id": "...",
    "span_id": "...",
    "correlation_id": "...",
    "parent_event_id": "..."
  },
  "operation": {
    "name": "authorize-payment",
    "action": "authorize",
    "resource": "payment",
    "stage": "completed"
  },
  "outcome": {
    "status": "success",
    "code": "APPROVED",
    "reason": null,
    "retryable": false
  },
  "performance": {
    "duration_ms": 187
  },
  "attributes": {
    "payment_method": "credit_card",
    "transaction_type": "purchase",
    "amount_bucket": "100-500",
    "risk_decision": "approved"
  }
}
```

Not every section is required for every event.

---

# **6. Required Core Fields**

The required contract should remain intentionally small.

|**Field**|**Description**|
|---|---|
|`event.id`|Globally unique event identifier|
|`event.name`|Semantic event name|
|`event.version`|Version of the event contract|
|`event.occurred_at`|Time when the event actually occurred|
|`producer.platform`|Platform producing the event|
|`producer.component`|Component producing the event|
|`producer.component_type`|Type of producer|
|`producer.environment`|Runtime environment|
|`outcome.status`|Result of the observed activity|

Everything else should be included when meaningful.

The goal is to avoid forcing producers to populate meaningless fields simply to satisfy the contract.

---

# **7. Event Semantics**

## **7.1 Events Describe Reality, Not Implementation**

Analytics events should answer:

What happened in the platform?

They should not primarily describe:

What did the code execute?

Avoid event names such as:

```text
lambda.executed
database.query.completed
http.request.returned_200
sqs.message.received
```

Those belong primarily to operational observability.

Prefer semantic events such as:

```text
customer.authentication.completed
application.submitted
payment.authorization.completed
document.validation.failed
customer.preference.changed
```

This distinction is essential.

The analytics stream should remain useful even if the implementation technology changes.

A migration from Lambda to containers, Kafka to another broker, or REST to another transport should not destroy the meaning of historical analytics.

---

# **8. Event Naming Convention**

Event names should use domain-oriented terminology.

Recommended format:

```text
<domain>.<entity-or-capability>.<action-or-state>
```

Examples:

```text
customer.login.started
customer.login.completed
customer.login.failed

payment.authorization.requested
payment.authorization.completed
payment.authorization.declined

application.submission.started
application.submission.completed

document.validation.completed
document.validation.failed
```

Names should represent meaningful business or platform states.

Avoid encoding:

- HTTP verbs
- HTTP status codes
- Programming language concepts
- Infrastructure technology
- Class names
- Method names

---

# **9. Event Lifecycle**

For long-running or asynchronous operations, events may represent multiple stages.

Example:

```text
payment.authorization.requested
payment.authorization.processing
payment.authorization.completed
payment.authorization.failed
```

Alternatively, the same event family may use `operation.stage`.

```json
"operation": {
  "name": "payment-authorization",
  "stage": "completed"
}
```

The platform should select one convention and apply it consistently within each event family.

Recommended stages:

```text
requested
started
processing
completed
failed
cancelled
timeout
```

---

# **10. Producer Context**

The `producer` section identifies where the event originated.

```json
"producer": {
  "platform": "customer-platform",
  "component": "profile-service",
  "component_type": "worker",
  "version": "2.8.4",
  "environment": "production",
  "region": "us-east-1"
}
```

Recommended `component_type` values:

```text
web
mobile
api
worker
consumer
producer
scheduler
batch
integration
```

This enables analysis such as:

```text
failure rate by component
latency by component
volume by component type
event distribution by platform component
```

---

# **11. Channel Context**

`channel` identifies where the customer interaction originated.

This must remain separate from `producer`.

For example:

```text
Customer
   │
   ▼
Mobile App
   │
   ▼
API
   │
   ▼
Authorization Service
```

The authorization service may produce the analytics event, but the original channel is still mobile.

Example:

```json
"channel": {
  "type": "mobile",
  "application": "customer-mobile",
  "os": "ios",
  "app_version": "8.2.1"
}
```

Recommended channel values:

```text
web
mobile
api
ivr
agent
batch
system
partner
```

This separation allows analytics such as:

```text
conversion by channel
failure rate by channel
mobile vs web behavior
customer journeys by entry point
```

---

# **12. Customer Context**

Customer identifiers allow events to be connected into journeys.

```json
"customer": {
  "id": "cust_12345",
  "tenant_id": "tenant_abc",
  "session_id": "session_xyz"
}
```

Identifiers should be stable enough for analytics but should follow applicable privacy and data governance requirements.

Sensitive customer information should not be included unless explicitly approved.

Prefer identifiers over customer details.

For example, avoid:

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "..."
}
```

when an internal customer identifier provides the necessary analytical value.

---

# **13. Trace Context**

Trace context connects analytics with operational observability.

```json
"trace": {
  "trace_id": "...",
  "span_id": "...",
  "correlation_id": "...",
  "parent_event_id": "..."
}
```

These identifiers serve different purposes.

`trace_id` connects the event to distributed tracing.

`span_id` connects the event to a specific execution segment when available.

`correlation_id` connects related platform interactions or messages.

`parent_event_id` can represent causal relationships between analytics events.

For asynchronous systems, these identifiers are especially important.

---

# **14. Operation Context**

The operation section represents what the platform was attempting to accomplish.

```json
"operation": {
  "name": "authorize-payment",
  "action": "authorize",
  "resource": "payment",
  "stage": "completed"
}
```

This provides useful semantic information without publishing the full request or response.

For example:

```text
operation.name
authorize-payment

operation.action
authorize

operation.resource
payment
```

This allows analytics to remain meaningful while avoiding unnecessary data duplication.

---

# **15. Outcome**

The outcome section describes the result.

```json
"outcome": {
  "status": "failure",
  "code": "DEPENDENCY_TIMEOUT",
  "reason": "risk-service-timeout",
  "retryable": true
}
```

Recommended `status` values:

```text
success
failure
partial
declined
cancelled
timeout
unknown
```

Avoid reducing outcome to:

```json
"success": true
```

A boolean does not provide enough semantic information for complex distributed workflows.

---

# **16. Performance Context**

Performance information may be included when useful for analytics.

Example:

```json
"performance": {
  "duration_ms": 187
}
```

This should not become a replacement for platform metrics.

Its purpose is to provide performance context to specific business or customer events.

For example:

```text
checkout completion time by customer channel

authorization latency by outcome

document processing time by document type
```

---

# **17. Flexible Attributes**

Each event may require domain-specific information.

This belongs in `attributes`.

Example:

```json
"attributes": {
  "payment_method": "credit_card",
  "transaction_type": "purchase",
  "amount_bucket": "100-500",
  "risk_decision": "approved"
}
```

`attributes` provides flexibility without changing the global envelope.

This is the main extension mechanism for domain teams.

However, attributes should still be governed at the individual event level.

For example:

```text
payment.authorization.completed@1.0
```

may define:

```text
payment_method
transaction_type
amount_bucket
risk_decision
```

while another event may define completely different attributes.

---

# **18. Avoid Stringified JSON by Default**

Avoid:

```json
"details": "{\"risk_model\":\"v4\",\"decision\":\"review\"}"
```

Prefer:

```json
"attributes": {
  "risk_model": "v4",
  "decision": "review"
}
```

Structured data remains directly queryable in the data lake.

Stringified JSON forces every downstream consumer to parse the value again and makes schema discovery harder.

---

# **19. Extensions / Escape Hatch**

There may occasionally be cases where opaque or not-yet-standardized data must be transported.

For those cases:

```json
"extensions": {
  "content_type": "application/json",
  "payload": "{\"someFutureThing\":123}"
}
```

This should be considered an escape hatch.

It should not become the default extension mechanism.

The expected maturity path should be:

```text
Experimental Data
      ↓
extensions
      ↓
validated usage
      ↓
formal attributes
```

---

# **20. Platform Health vs Customer Behavior**

Platform health events and customer behavior events should not be mixed semantically.

A failed customer interaction might include:

```json
"outcome": {
  "status": "failure",
  "code": "DEPENDENCY_UNAVAILABLE"
}
```

and:

```json
"attributes": {
  "dependency": "customer-profile-service"
}
```

Platform availability itself could produce separate events:

```text
component.availability.degraded
component.availability.restored

dependency.unavailable
dependency.restored
```

Both may use the same envelope.

However, their semantic purpose remains different.

---

# **21. Event Classification**

Events may optionally be classified using:

```json
"event": {
  "type": "business"
}
```

Recommended values:

```text
business
customer
operational
system
integration
```

This allows the same event infrastructure to support multiple analytical purposes without forcing all events into one semantic category.

---

# **22. Asynchronous Journey Reconstruction**

A major goal of the contract is to allow events from distributed components to be reconstructed into a journey.

Example:

```text
Customer
   │
   ▼
Mobile
   │
   └── payment.requested
           │
           ▼
API
   │
   └── payment.validation.completed
           │
           ▼
Queue
   │
   └── payment.authorization.requested
           │
           ▼
Worker
   │
   └── payment.authorization.completed
           │
           ▼
Consumer
   │
   └── payment.notification.sent
```

Each event describes only what that component observed.

The combination of:

```text
customer.id
session_id
correlation_id
trace_id
parent_event_id
```

allows downstream systems to reconstruct the larger story.

---

# **23. Schema Registry / Event Catalog**

The event contract should be supported by an Event Catalog or Schema Registry.

The catalog should describe each:

```text
event.name + event.version
```

For example:

```text
payment.authorization.completed@1.0
```

The catalog should contain:

```text
Event name
Event version
Description
Business meaning
Owning team
Producing components
Trigger condition
Required attributes
Optional attributes
Example payload
Known consumers
Data classification
Retention requirements
Deprecation status
```

This catalog becomes the semantic source of truth for platform analytics.

---

# **24. Schema Evolution**

Events must be versioned.

Example:

```json
"event": {
  "name": "payment.authorization.completed",
  "version": "1.0"
}
```

Non-breaking changes may include:

```text
adding optional attributes
adding optional context fields
adding new allowed enum values when consumers tolerate them
```

Breaking changes require a new event version.

Examples:

```text
changing field meaning
changing field type
removing a required field
renaming an existing field
changing semantic interpretation
```

Existing event versions should remain available for an agreed migration period.

---

# **25. Data Quality Rules**

The contract should include basic quality rules.

At minimum:

```text
event.id must be unique

event.name must exist in the Event Catalog

event.version must be registered

event.occurred_at must represent event time, not ingestion time

producer.component must identify the actual producer

outcome.status must use an approved value

attributes must comply with the registered event schema

restricted or prohibited data must not be included
```

Invalid events should be measurable and observable.

Do not silently drop malformed events without telemetry.

---

# **26. Event Time vs Ingestion Time**

The contract should distinguish:

```text
occurred_at
```

from downstream ingestion time.

For example:

```text
event.occurred_at
2026-09-02T12:34:56Z

stream_ingested_at
2026-09-02T12:34:57Z

data_lake_ingested_at
2026-09-02T12:35:04Z
```

Only `occurred_at` belongs to the producer contract.

Ingestion timestamps should generally be added by infrastructure.

This distinction becomes important when dealing with delayed, retried, replayed, or out-of-order events.

---

# **27. Delivery Semantics and Deduplication**

Distributed event systems may deliver the same event more than once.

Therefore:

```text
event.id
```

must be unique and stable across retries.

A producer retry should not generate a new semantic event ID unless a new business event actually occurred.

Consumers should be able to deduplicate using `event.id`.

---

# **28. Privacy and Data Governance**

The analytics stream should not become a copy of application payloads.

Avoid publishing entire:

```text
HTTP requests
HTTP responses
database entities
customer profiles
message payloads
```

Instead, publish only the information required to understand the event.

Prefer:

```json
"attributes": {
  "document_type": "passport",
  "validation_result": "failed"
}
```

rather than publishing the entire document validation request.

This reduces:

```text
privacy risk
PII exposure
data duplication
storage cost
schema coupling
downstream dependency on implementation details
```

---

# **29. Producer Responsibility**

Every producer is responsible for:

```text
Generating a unique event ID

Choosing a registered event name

Providing the correct event version

Providing producer metadata

Providing meaningful outcome information

Propagating trace/correlation context when available

Publishing only permitted attributes
```

Producers should not invent new semantics without registering them in the Event Catalog.

---

# **30. Consumer Responsibility**

Consumers should depend on:

```text
event.name
event.version
documented schema
```

and should not rely on undocumented attributes.

Consumers should tolerate unknown optional fields.

This allows the contract to evolve safely.

---

# **31. Initial 80/20 Contract**

The first implementation should remain deliberately small.

Recommended initial contract:

```json
{
  "event": {
    "id": "...",
    "name": "...",
    "version": "1.0",
    "occurred_at": "..."
  },
  "producer": {
    "platform": "...",
    "component": "...",
    "component_type": "...",
    "environment": "..."
  },
  "customer": {
    "id": "..."
  },
  "channel": {
    "type": "mobile"
  },
  "trace": {
    "trace_id": "...",
    "correlation_id": "..."
  },
  "operation": {
    "name": "..."
  },
  "outcome": {
    "status": "success"
  },
  "attributes": {}
}
```

The contract can evolve once real usage demonstrates which additional fields provide consistent value.

---

# **32. Adoption Strategy**

The contract should be introduced incrementally.

Start with a small number of high-value customer journeys.

For example:

```text
authentication

application submission

payment

document processing
```

For each journey:

```text
Identify important business states

Define events

Register them in the Event Catalog

Instrument the relevant components

Validate analytics queries

Validate trace correlation

Measure event quality
```

Do not attempt to instrument every component and every operation at once.

---

# **33. Architectural Guardrail**

A useful review question for every proposed event is:

If the implementation technology changed tomorrow, would this event still make sense?

If the answer is no, the event is probably describing implementation rather than platform behavior.

Another useful question is:

Could an analyst understand what happened without reading the source code?

If the answer is yes, the event is probably at the right semantic level.

---

# **34. Desired Outcome**

With this contract in place, a distributed platform can produce a timeline such as:

```text
09:00:01
customer.login.completed

09:00:14
application.started

09:02:32
document.uploaded

09:02:34
document.validation.failed

09:03:12
document.uploaded

09:03:14
document.validation.completed

09:05:40
application.submitted
```

The analytics system sees the **customer and platform story**.

The observability system still sees the technical execution behind every step.

The two are connected through shared correlation and trace identifiers.

---

# **35. The Multiverse of Observability**

The same platform event can exist in multiple observational universes.

```text
                 PLATFORM REALITY
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      Analytics      Tracing      Logging
     What happened?  How?         What was said?
          │
          ▼
      Customer /
      Product Story
```

None of these views represents the whole reality by itself.

Analytics events describe the semantic story.

Tracing describes the execution path.

Logs provide technical evidence.

Metrics describe aggregate system behavior.

The `trace_id` acts as the portal connecting these universes.

---

# **Decision**

Adopt a common **Platform Analytics Event Contract** consisting of:

```text
Stable platform envelope
+
Optional contextual metadata
+
Controlled event-specific attributes
+
Trace and correlation identifiers
+
Schema Registry / Event Catalog
```

The architecture should optimize for **semantic consistency first and flexibility second**.

The goal is not to capture every piece of data available.

The goal is to capture enough meaningful information that the platform can reconstruct and understand what happened months or years later without requiring knowledge of the implementation that produced it.
