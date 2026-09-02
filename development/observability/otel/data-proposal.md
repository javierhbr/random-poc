

## **The Principle: Envelope + Context + Event Data**

I would use something like this:

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

And here is the important part: **not every field needs to exist in every event.**

---

## **What Should Be Required**

I would keep the required core very small.

|**Field**|**Purpose**|
|---|---|
|`event.id`|Deduplication|
|`event.name`|What happened|
|`event.version`|Contract evolution|
|`event.occurred_at`|When it actually happened|
|`producer.platform`|Platform|
|`producer.component`|Who produced it|
|`producer.component_type`|UI/API/worker/etc.|
|`producer.environment`|prod/dev/etc.|
|`outcome.status`|success/failure/partial/etc.|

Then `customer`, `channel`, `trace`, `operation`, `performance`, and `attributes` become contextual sections that are included when applicable.

---

## 

## 

## **1.**

**`event`**

**: What Happened?**

I would avoid technical names such as:

```text
POST_PAYMENT_RETURNED_200
```

and use domain language instead:

```text
customer.login.started
customer.login.completed
customer.login.failed

payment.authorization.started
payment.authorization.completed
payment.authorization.declined

order.created
order.submitted
order.completed
```

That completely changes the value of the data lake.

You can ask:

```text
How many payment.authorization.completed events occurred?
```

without caring whether they were produced by Java, Lambda, mobile, REST, Kafka, or SQS.

---

## 

## 

## **2.**

**`producer`**

**: Who Observed the Event?**

This is fundamental in a distributed platform.

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

`component_type` could be a controlled enum:

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

Then you can analyze things such as:

```text
failure rate by component
latency by component
volume by component_type
customer journeys crossing components
```

---

## 

## 

## 

## **3.**

**`channel`**

**: It Is Important to Distinguish It from**

**`producer`**

There is an important distinction here that is worth preserving.

An event may be produced by:

```text
authorization-service
```

while the original interaction came from:

```text
mobile
```

That is why I would not put `client_type` inside `producer`.

```json
"channel": {
  "type": "mobile",
  "application": "customer-mobile",
  "os": "ios",
  "app_version": "8.2.1"
}
```

Possible values could include:

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

This allows you to answer questions such as:

How do customers behave on mobile versus web?

without touching the tracing system.

---

## 

## 

## **4.**

**`trace`**

**: Connecting the Universes**

This is where analytics connects with observability.

```json
"trace": {
  "trace_id": "...",
  "span_id": "...",
  "correlation_id": "...",
  "parent_event_id": "..."
}
```

This creates something very powerful.

You have:

```text
Analytics event
      ↓
trace_id
      ↓
distributed trace
      ↓
logs
      ↓
metrics
```

Analytics can tell you:

17% of customers abandoned this operation.

Tracing can answer:

Why?

They are two views of the same reality, but you do not need to put the entire trace into the data lake.

---

## 

## 

## **5.**

**`operation`**

**: What Was the System Trying to Do?**

This avoids transporting full request/response payloads.

```json
"operation": {
  "name": "authorize-payment",
  "action": "authorize",
  "resource": "payment",
  "stage": "completed"
}
```

You could standardize `stage`:

```text
started
processing
completed
cancelled
failed
timeout
```

This works particularly well for an asynchronous platform because one operation may cross multiple components.

For example:

```text
Mobile
  ↓
payment.requested

API
  ↓
payment.validation.completed

Queue
  ↓
payment.authorization.requested

Worker
  ↓
payment.authorization.completed

Event consumer
  ↓
payment.notification.sent
```

These are all different events, but they can be reconstructed as one story.

---

## 

## 

## **6.**

**`outcome`**

**: What Happened?**

This is probably one of the most valuable sections for analytics.

```json
"outcome": {
  "status": "failure",
  "code": "DEPENDENCY_TIMEOUT",
  "reason": "risk-service-timeout",
  "retryable": true
}
```

I would control `status` especially carefully:

```text
success
failure
partial
declined
cancelled
timeout
unknown
```

I would not rely only on:

```json
"success": true
```

because that becomes too limited very quickly.

---

## **7. I Would Not Add “Downtime” Directly**

I would represent the downtime scenario you mentioned slightly differently.

A normal event could have:

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

Availability itself could then be represented through separate events:

```text
component.availability.degraded
component.availability.restored
dependency.unavailable
dependency.restored
```

I would not mix **customer behavior** with **platform health**, even if both use the same envelope.

---

## 

## **8. The Flexible Part:**

**`attributes`**

I agree with the direction you were considering, with one small difference.

Instead of:

```json
"details": "{\"foo\":\"bar\",\"xyz\":\"123\"}"
```

I would prefer:

```json
"attributes": {
  "foo": "bar",
  "xyz": 123,
  "risk_model": "v4",
  "decision": "review"
}
```

This is much better for a data lake because the data remains directly queryable.

For example:

```sql
SELECT
    attributes.risk_model,
    count(*)
FROM events
WHERE event.name = 'payment.authorization.completed'
GROUP BY attributes.risk_model
```

If everything is stringified, every consumer has to parse it again.

### **But I Would Still Allow an Escape Hatch**

For exceptional cases:

```json
"extensions": {
  "content_type": "application/json",
  "payload": "{\"someFutureThing\":123}"
}
```

But I would treat this as an **escape hatch, not the normal mechanism**.

---

## **The Contract I Would Propose**

The full hierarchy would look like this:

```text
PlatformEvent
│
├── event
│   ├── id
│   ├── name
│   ├── version
│   ├── type
│   └── occurred_at
│
├── producer
│   ├── platform
│   ├── component
│   ├── component_type
│   ├── version
│   ├── environment
│   └── region
│
├── customer
│   ├── id
│   ├── tenant_id
│   └── session_id
│
├── channel
│   ├── type
│   ├── application
│   ├── os
│   └── app_version
│
├── trace
│   ├── trace_id
│   ├── span_id
│   ├── correlation_id
│   └── parent_event_id
│
├── operation
│   ├── name
│   ├── action
│   ├── resource
│   └── stage
│
├── outcome
│   ├── status
│   ├── code
│   ├── reason
│   └── retryable
│
├── performance
│   └── duration_ms
│
├── attributes
│   └── dynamic key/value
│
└── extensions
    └── opaque data
```

## **One Important Architectural Rule**

The stream should not answer:

What did the code do?

It should answer:

What happened in the platform?

For example, avoid:

```text
lambda.executed
database.query.completed
http.request.finished
sqs.message.received
```

Those primarily belong to operational observability.

Prefer:

```text
customer.authentication.completed
application.submitted
payment.authorized
document.validation.failed
customer.preference.changed
```

You can then introduce a classification such as:

```text
event.type

business
customer
operational
system
integration
```

while keeping the exact same envelope across all of them.

That gives you **one event language across the entire platform, with different purposes and consumers**.

---

## **The 80/20 Version I Would Implement First**

I would not try to standardize 50 fields from day one. I would start by requiring only this:

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

Then I would allow the contract to evolve over time.

The key is that **`attributes`** **gives teams flexibility, while the envelope protects platform-wide consistency**.

I would also place a **Schema Registry / Event Catalog** around this model. Every `event.name + event.version` should document who produces it, what it means, when it is emitted, which event-specific attributes are allowed, and which teams or datasets consume it.

That helps prevent the real problem behind **bad data for analytics**. The issue is usually not a lack of events. It is having events that are ambiguous, duplicated, inconsistent, or whose meaning nobody understands six months later.

Conceptually, this also fits very well with the **Multiverse of Observability** idea: traces explain **how something happened technically**, while analytics events explain **what happened from the platform or customer perspective**.

The `trace_id` becomes the portal connecting both universes.
