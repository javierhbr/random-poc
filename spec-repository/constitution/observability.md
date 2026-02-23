# Observability Requirements

> Version: 1.0.0 | Applies when: new_feature, integration, migration

---

## The 4 Signals (MUST)

Every new feature MUST instrument all four:

### 1. Metrics (Prometheus)
- **MUST** emit a counter for every significant business event
  - Pattern: `{service}_{domain}_{action}_total` (labels: status, type)
  - Example: `cart_items_saved_total{status="success", session_type="guest"}`
- **MUST** emit a histogram for every operation with latency budget
  - Pattern: `{service}_{operation}_duration_seconds`
- **MUST** emit a gauge for current state when applicable
  - Example: `cart_active_sessions_total`

### 2. Structured Logs (JSON)
- **MUST** use structured JSON logging — no printf-style logs
- **MUST** include: `trace_id`, `span_id`, `service`, `level`, `timestamp`, `message`
- **MUST** include relevant business context: `session_id`, `order_id`, `user_id` (hashed)
- **MUST NOT** log PII in plain text

### 3. Distributed Traces (OpenTelemetry)
- **MUST** propagate trace context across all service boundaries
- **MUST** create a span for each significant operation within a request
- **MUST** tag spans with: `service.name`, `http.route`, `db.operation`

### 4. Alerts (PagerDuty / Slack)
- **MUST** define at least one alert per new feature:
  - Error rate alert: fires when `error_rate > 1%` for 2 minutes
  - Latency alert: fires when `p99 > latency_budget` for 5 minutes
- **MUST** document runbook link in alert definition

---

## Dashboards

- **SHOULD** create or update a Datadog/Grafana dashboard for the feature
- **SHOULD** include: request rate, error rate, p50/p99 latency, business KPIs
