# Designing a Vendor-Agnostic IVR DSL in TypeScript

### A technical paper on structure, semantics, reuse, and compilation

---

## 1. Problem statement

IVR (Interactive Voice Response) flows are authored today inside vendor-specific
tools — Amazon Connect's contact-flow JSON, Amazon Lex's bot model, Omilia's
visual designer, and others. Each vendor expresses the same underlying concepts —
*play a prompt, collect input, branch on intent, call an API, route the caller* —
in an incompatible format.

The result is lock-in. The flow logic, which is the genuinely valuable
intellectual property, is trapped inside whichever vendor authored it. Migrating,
A/B testing two vendors, or running a fallback vendor becomes a rewrite rather
than a configuration change.

This paper describes a **Domain-Specific Language (DSL)**, embedded in
TypeScript, that lets a team author IVR flows once in a neutral form and
**compile** them down to each vendor's native artifact. It covers what the DSL
must model, how to express it idiomatically in TypeScript, how to support reuse
of objects and variables, and how the compilation pipeline produces vendor
output for Omilia, Lex, or any future target.

### 1.1 Scope and honest limits

A DSL of this kind can abstract the **orchestration skeleton** cleanly: states,
prompts, input collection, retries, timeouts, branching, transfers, API calls.
It can **normalize** — but not erase — differences in the NLU layer: confidence
scores, slot-filling behavior, and disambiguation differ between engines, so the
DSL standardizes the *contract* (intent name, entities, normalized confidence)
rather than pretending the engines are identical. It **cannot** abstract
genuinely vendor-specific capabilities (Omilia voice biometrics, a Lex-only
block); for those the DSL needs a deliberate *escape hatch*, not a false
abstraction. Designing with this ceiling in mind is what keeps the project
honest and maintainable.

Stated concretely, so expectations are set before a line of code is written:

**What the DSL can do**

- **Model the flow as one portable artifact.** The full state graph — `collect`,
  `decision`, `apiCall`, `transfer`, `playback`, `subflow`, `terminal` — authored
  once, version-controlled, compiled to every target.
- **Catch reference errors at the keystroke, structural errors at compile.**
  Two complementary lines of defence. The type system (§4.7) rejects the common
  "wrong reference" bugs *as the author types* — a prompt id that resolves to
  nothing, an `apiCall` to an undeclared dependency, a transition to a
  non-existent state, a guard reading an undeclared variable. The runtime
  validator (§7.2) then catches what types cannot express — unreachable states,
  undefined failure edges, a dependency with no mock, a DTMF key bound twice.
  Between them, a flow that compiles and validates is essentially free of
  mechanical error before anything reaches a vendor.
- **Make every definition reusable.** Prompts, retry/timeout policies,
  eligibility rules, API dependencies, transfer destinations, and whole
  sub-flows are ordinary TypeScript values — declared once, imported everywhere,
  refactored with normal tooling.
- **Normalize the NLU contract.** Produce a single `NluResult` shape (intent,
  entities, calibrated confidence) across engines, and project one canonical
  intent registry into each vendor's native model.
- **Standardize observability and logging.** Two distinct surfaces, both
  portable: a consistent **analytics event schema** for dashboards (§3.12) and a
  consistent **per-call log narrative** for debugging (§3.14) — state-entry,
  decision, API request/response, and fallback statements, with stable codes,
  log levels, and redaction. Adapters project each onto the platform's native
  surface (Omilia console logs and KVPs, CloudWatch, simulator buffers); the
  flow author writes once.
- **Carry portable metadata across platforms.** `Metadata` is projected by every
  adapter into the platform's native annotation facility — Omilia KVPs, Connect
  contact attributes, Lex session attributes — under a fixed contract (§4.5), so
  tags, ownership, trace markers, and debugging fields move with the flow.
- **Make flows testable without a vendor.** `testScenario` definitions compile
  into an in-process simulator run, so flow logic — including `InlineCode`
  snippets and log assertions — is exercised in CI with zero vendor dependency.
- **Carry vendor-specific escape hatches safely.** `vendorHints` for namespaced
  per-vendor tuning; `InlineCode` for genuine vendor-native code (e.g. Omilia's
  custom JS), vendor-tagged and tracked.
- **Generate vendor artifacts mechanically.** Connect contact-flow JSON and Lex
  bot models by direct generation; Omilia by generation or runtime orchestration
  depending on its API surface.
- **Make adding a vendor additive.** A new target is a new compiler backend; the
  DSL, the IR, and every existing flow are untouched.

**What the DSL cannot do**

- **It cannot make the NLU engines interchangeable.** It normalizes the
  *contract*, not the behavior. A given utterance may classify differently, score
  differently, or fill slots differently on Omilia's DiaManT versus Lex — the DSL
  cannot hide that, only calibrate around it.
- **It cannot abstract vendor-exclusive capabilities.** Omilia voice biometrics,
  a Lex-only block type, a Connect-only routing primitive — these have no neutral
  representation. They are reachable only through `vendorHints` or `InlineCode`,
  and a flow that depends on one is, by definition, not portable to a vendor that
  lacks it.
- **It cannot guarantee Omilia code-generation.** Whether the Omilia backend can
  *emit* flow artifacts at all depends on what Omilia's API/import surface
  supports — an open question to confirm with Omilia, not an assumption the DSL
  can make true.
- **It cannot eliminate per-vendor NLU work.** The canonical intent registry
  keeps names and entity shapes from drifting, but each engine's model still has
  to be trained, tuned, and tested on its own.
- **It is not a runtime by itself.** Compile-time generation produces artifacts
  the vendor runs natively; the "use both vendors live, switching mid-call"
  pattern additionally requires operating the stateful interpreter service
  described in §7.4 — latency, availability, and scaling become the team's
  problem, not the DSL's.
- **It cannot catch semantic or experience bugs.** The validator proves the graph
  is *structurally* sound — every edge defined, every reference resolved. It
  cannot tell you a prompt is confusing, a menu is too long, a routing rule sends
  callers to the wrong queue, or a grammar is too narrow. That is what
  `testScenario`s, real call testing, and analytics are for.
- **It cannot validate the inside of an `InlineCode` snippet.** The declared
  `reads`/`writes` interface keeps data-flow reasoning intact, but the JavaScript
  body itself is opaque to the compiler — a logic bug inside it is caught only by
  the simulator or in production.
- **It cannot abstract telephony and media specifics.** SIP trunking, codec
  negotiation, carrier behavior, DTMF detection quirks — these live below the
  DSL and remain vendor/platform concerns.
- **It is not a migration button.** It removes the *rewrite* cost of moving
  between vendors, but parity testing, NLU retraining, and cutover remain real
  project work.

---

## 2. Design goals

1. **Single source of truth.** One flow definition, version-controlled, that
   compiles to every target.
2. **Type safety by default.** The DSL is strict by construction, not strict if
   you opt in. Identifiers are branded or registry-derived literal unions rather
   than bare strings, the flow context is a closed declared interface, and the
   builder is generic over its own state ids — so a dangling state reference, a
   missing prompt, an undeclared API dependency, or a guard reading an undeclared
   variable is a `tsc` error at the call site, not a runtime failure on a live
   call (§4.7).
3. **Reuse.** Prompts, validation rules, sub-flows, and API definitions should
   be declarable once and referenced many times, as ordinary TypeScript values.
4. **Completeness.** The model must capture everything an IVR turn needs:
   prompts, accepted intents, DTMF options, retries, timeouts, fallbacks,
   transfers, API dependencies, eligibility rules, test scenarios, observability
   events, and mock requirements.
5. **Testability.** Test scenarios and mocks are first-class citizens of the
   DSL, not an afterthought bolted on later.
6. **Extensibility.** Adding a new vendor target means writing a new compiler
   backend, not touching the DSL or any existing flow.

---

## 3. The conceptual model

Every IVR flow, regardless of vendor, is a **state machine**. The canonical turn
within a state follows one shape:

```
Prompt → Input → Intent/DTMF → Validation → API Call → Decision → Next State
```

The DSL models this as a graph of **states**, each state being a typed object
with a fixed set of fields. The sections below walk each field of that object.

### 3.1 State

A `State` is the atomic unit. It has a unique `id`, a `kind` (what sort of turn
it is), and the fields relevant to that kind. State kinds typically include:

- `collect` — play a prompt and gather input (intent or DTMF)
- `decision` — branch with no caller input, purely on context/variables
- `apiCall` — invoke a backend dependency and store the result
- `transfer` — hand the call to a queue, agent, or external number
- `playback` — say something and move on (no input)
- `subflow` — delegate to a reusable nested flow
- `terminal` — end the call

Modeling `kind` as a discriminated union is the key TypeScript decision: it lets
the compiler enforce that a `transfer` state has a `destination` and a `collect`
state has `prompts`, while rejecting nonsensical combinations.

### 3.2 Prompts

A `Prompt` is the audio/text played to the caller. It is **not** a bare string —
it is a reusable object so the same prompt can appear in many states and be
localized or swapped centrally. A prompt carries:

- An `id` for reference and analytics.
- One or more `variants` keyed by locale (`en-US`, `es-US`, …).
- A `type`: plain text (for TTS), SSML, or a reference to a pre-recorded audio
  asset.
- Optional **interpolation slots** — placeholders filled from flow variables at
  runtime (e.g. "Your balance is {balance}").

Because prompts are objects, a `prompts/` module becomes the single place all
wording lives — exactly the reuse the requirements call for.

### 3.3 Accepted intents

For a `collect` state, `acceptedIntents` is the list of NLU intents that count
as valid input *in that state*. Each entry references a canonical intent from a
central **intent registry** (one source of truth for intent names and their
entity schemas). Listing accepted intents per state, rather than globally, lets
the compiler scope each vendor's grammar/model correctly and lets the DSL
validate that every referenced intent actually exists in the registry.

Each accepted intent maps to a **transition**: which state to go to, optionally
gated by a guard on the extracted entities or flow variables.

### 3.4 DTMF options

`dtmfOptions` is the keypad equivalent of accepted intents: a map from key (or
key sequence) to a transition. DTMF and intents coexist in the same `collect`
state — the caller may speak *or* press a key. Keeping both in one state object
means the compiler can emit both an SRGS/Lex grammar and a DTMF handler from a
single declaration, and can detect conflicts (e.g. key `0` bound twice).

### 3.5 Retries

`retries` configures what happens on `no-input` (caller said nothing) and
`no-match` (caller said something unrecognized). It specifies:

- `maxAttempts` per failure type.
- An **escalating prompt** strategy — attempt 1 plays the normal prompt,
  attempt 2 plays a more detailed reprompt, attempt 3 perhaps offers DTMF
  explicitly.
- The `onExhausted` transition — where to go when retries run out (commonly a
  fallback or a transfer).

Modeling retries declaratively, instead of as copy-pasted reprompt states, is
one of the biggest wins of the DSL: every vendor implements retries differently,
and the compiler hides that.

### 3.6 Timeouts

`timeouts` defines the temporal boundaries of a turn:

- `inputTimeout` — how long to wait for the caller to begin speaking / pressing.
- `completeTimeout` — silence gap that marks the end of speech.
- `apiTimeout` — for `apiCall` states, the deadline on the backend call, with
  its own transition on expiry.

Timeouts are separated from retries because they are a different failure mode
with different vendor knobs, and conflating them produces unportable flows.

### 3.7 Fallbacks

A `fallback` is the safety net: where control goes when something the flow did
not explicitly anticipate happens — retries exhausted, an unexpected error, an
API hard-failure with no specific handler. Fallbacks can be declared at three
levels, and the compiler resolves them in order of specificity:

1. **State-level** — this state's own `onExhausted` / `onError`.
2. **Flow-level** — a default for the whole flow.
3. **Global** — a project-wide last resort, almost always a transfer to a human.

Explicit, layered fallbacks mean there is never an undefined edge in the
compiled state machine.

### 3.8 Transfers

A `transfer` state moves the call off the automated flow. It declares:

- A `destination` — a queue, an agent skill/group, an external phone number, or
  a SIP endpoint.
- The **context payload** handed over: the structured data (intent, entities,
  auth status, a routing hint) that travels with the call so a downstream system
  or agent has context.
- An optional `whisper`/announcement prompt.

The transfer destination is itself a reusable object — `queues/disputes.ts` —
referenced by many flows.

### 3.9 API dependencies

`apiDependencies` declares the backend services a flow needs *before* any state
uses one. Each dependency is a typed object: a name, the operation(s) it
exposes, the **request and response schemas**, timeout and retry policy, and —
critically — its **mock requirements** (see 3.12). An `apiCall` state then
references a dependency operation rather than embedding a raw URL.

Declaring dependencies up front gives three benefits: the compiler can verify
every `apiCall` references a real declared operation; the test harness knows
exactly what to mock; and an integration team gets a generated manifest of every
backend the IVR touches.

### 3.10 Eligibility rules

An `eligibilityRule` is a named, reusable **predicate** over flow context —
caller attributes, prior API results, variables. Examples: `isAuthenticated`,
`hasActiveDispute`, `accountTierIsPremium`. Rules are used as the **guards** on
transitions and as conditions in `decision` states.

Making eligibility a first-class, named, reusable concept (rather than inline
boolean expressions) means the rules can be unit-tested in isolation,
documented, and reused across flows — and the compiler can emit them as the
right construct per vendor (a Lambda check, a contact-attribute comparison, an
Omilia condition).

### 3.11 Test scenarios

A `testScenario` is a declarative path through the flow paired with expected
outcomes. It specifies:

- A `startState` and an ordered list of **simulated inputs** (spoken intents
  with entities, DTMF presses, or API responses).
- The **expected** state sequence, the expected prompts played, and the expected
  final outcome (which transfer, which terminal state).
- The **mock bindings** — which mock response each declared API dependency
  returns for this scenario.

Because scenarios are part of the DSL, they compile not only into the vendor
artifact's companion test config but also into a **local simulator** run: the
flow can be exercised entirely in-process, with no vendor involved, in CI.

### 3.12 Observability events

`observabilityEvents` are the named, structured events the flow emits at defined
points — state entry/exit, intent recognized, retry triggered, API latency, API
error, transfer executed, flow completed. Each event has a stable `name` and a
typed `payload` schema. They are the **analytics surface**: low-cardinality,
machine-consumed, used to build dashboards and SLOs.

Declaring them in the DSL — rather than letting each vendor's logging leak
through — gives a **consistent analytics schema** across vendors. The compiler
wires each event into the target's native mechanism (CloudWatch + Connect
contact attributes, Omilia's event stream), but downstream dashboards see one
shape. Observability events are distinct from log statements (§3.14): events are
for *measurement*, logs are for *narrative debugging*. Both exist because
collapsing them produces dashboards full of free text and log files full of
metrics.

### 3.13 Mock requirements

`mockRequirements` are attached to each API dependency: the set of canned
responses (success variants, each error variant, timeout) that the test harness
and local simulator can serve in place of the real backend. They make 3.9 and
3.11 actually executable. Every declared dependency **must** declare at least a
success mock and a failure mock; the compiler can enforce this, so no flow ships
with an untestable backend call.

### 3.14 Logging

Some IVR platforms — Omilia among them — expose application-level logging or
console-style messages inside their platform: a stream of human-readable lines
emitted as the flow executes, used to trace what happened on a specific call.
Other platforms surface the equivalent through CloudWatch logs, custom log
sinks, or platform-specific telemetry pipes. The DSL needs to make this
*declarable in a vendor-neutral way* so a flow's debugging story does not have
to be rewritten when the underlying engine changes.

The DSL therefore provides logging as a first-class concept, separate from
observability events (§3.12) because the two answer different questions:

- *Observability events* answer "how is the system performing in aggregate?" —
  high-volume, low-cardinality, structured, consumed by dashboards.
- *Logging statements* answer "what happened on **this** call, and why?" —
  per-call, narrative, often free-text, consumed by humans during debugging.

A `LogStatement` is attached to a state (or fired around an `apiCall`) and
specifies what to record. The DSL recognizes five categories, matching the
moments where debugging actually needs them:

- **State-entry / state-exit logs.** "Entered `ask_intent`", "left `decide_route`
  via branch `isAuthenticated=true`". The skeleton trace of a call's path.
- **Decision logs.** When a `decision` state or a guarded transition fires, log
  which branch was taken and why — the eligibility rule's name, the key
  variables consulted. Decision logs are what turn "the call ended up at the
  agent" into "the call ended up at the agent *because* `hasActiveDispute` was
  false on attempt 2".
- **API request/response traces.** Around every `apiCall`: the operation
  invoked, the request shape (with redaction applied per declared sensitivity —
  see below), the response status/latency/error code. The body of the response
  is **never** logged by default; opting in requires explicit acknowledgement.
- **Fallback and error messages.** When `onError`, `onTimeout`, or
  `retries.onExhausted` fires — what went wrong and where control went next.
  These are the logs an on-call engineer actually reads.
- **Custom log messages.** Ad-hoc, author-defined lines for the cases the four
  above do not cover. Supports interpolation from typed flow variables so a
  message like `"Caller balance is {balance}"` benefits from the same `VarName`
  checking the rest of the DSL uses (§4.7).

Each statement carries a `level` (`debug` | `info` | `warn` | `error`), a stable
`code` (so logs can be searched without grepping free text), the typed message,
and an optional `redact` list naming variables whose values must be masked
before emission. Adapters honour redaction unconditionally; a redacted field
never appears in any vendor's log output.

**The portability contract.** The DSL specifies *what is captured and at what
level*; each vendor adapter decides *how* to deliver it:

```
   DSL LogStatement / Metadata
              ↓
       Provider adapter
              ↓
   Omilia: KVPs + console logs
   Connect: contact attributes + CloudWatch
   Lex: session attributes + CloudWatch
   Simulator: stdout + an in-memory log buffer the testScenarios can assert on
```

The simulator backend (§7.4) captures logs into a structured in-memory buffer so
`testScenario`s can assert not only on state sequence and outcome but on the
*log narrative* — "this scenario must produce a `decision.fallback` log at
`warn`" — which makes the logging surface itself testable in CI alongside the
flow.

**Honest scope.** The DSL portably specifies what to log; it cannot make
disparate vendor log surfaces *behaviourally* identical. Retention windows,
search capabilities, indexing, sampling thresholds, redaction enforcement, and
log-to-trace correlation all differ per vendor. The DSL standardizes the
producer side — the same flow logs the same things on every platform — and
documents per-vendor delivery characteristics so operators know what they get,
not what they wish they got.

---

## 4. Expressing the model in TypeScript

The DSL is an **internal (embedded) DSL**: flows are written as ordinary
TypeScript using a fluent builder API. This choice — over an external DSL with
its own parser — buys type-checking, IDE autocomplete, refactoring, and trivial
escape hatches for free, at the cost of syntax that is slightly more verbose
than a bespoke grammar. For a team that already writes TypeScript, it is the
right trade.

Beyond the structural model of §3, the embedded DSL gives every node three
extension surfaces that keep the language open without weakening its core:

- **Metadata and custom attributes** (§4.5) — non-executable annotation
  attached to any node (flow, state, prompt, transition). Used for
  documentation, ownership, tags, trace markers, debug fields, A/B flags, and
  per-vendor tuning hints. Each adapter projects metadata into the platform's
  native annotation surface — Omilia KVPs, Connect/Lex contact or session
  attributes — under a fixed portability contract, so the same flow keeps its
  annotation on every vendor.
- **Inline vendor code** (§4.6) — a typed escape hatch carrying a snippet of
  vanilla JavaScript that a *capable* vendor can execute natively. Omilia, in
  particular, allows custom JS on specific artifacts; this surface lets the DSL
  carry that code in a first-class, vendor-tagged way rather than forcing logic
  out into a separate Lambda.
- **Portable logging** (§4.8) — typed `LogStatement`s attached to states,
  covering state-entry/exit, decisions, API request/response, fallbacks, and
  custom messages, with `level`, stable `code`, and typed redaction. Adapters
  map them to the platform's native logging surface (Omilia console logs,
  CloudWatch, simulator buffers). The producer is portable; the sinks
  differ — and §3.14 is honest about which guarantees that does and does not
  carry.

Metadata and inline code are *escape hatches*; logging is a *primary
authoring surface* — flows should log liberally, the DSL is built for it.
None of the three weakens the typed structural model where flow logic lives;
each exists so the DSL never becomes a straitjacket when a vendor offers
something — or *requires* something — the abstraction would otherwise miss.

A fourth, non-negotiable property runs through the *whole* model rather than
being a surface on it: the DSL is **type-safe by default and strict by
construction** (§4.7). Identifiers are branded or registry-derived, not bare
strings; the flow context is a declared interface, not an open bag; the flow
builder is generic over the very state ids it has declared. The effect is that
the large majority of "wrong reference" bugs — a misspelled prompt id, a
transition to a state that does not exist, a guard reading an undeclared
variable, an undeclared `VarName` in a log message — are caught by `tsc` as the
author types, never reaching the runtime validator and certainly never reaching
a live call. The type definitions in §4.1 already apply this; §4.7 explains the
techniques and the one deliberate exception.

### 4.1 Core types

A design note before the types themselves: this DSL is **type-safe by default and
strict by construction**. Identifiers are not bare `string`s — they are branded
types or literal unions *derived from the registries that declare them*, so a
reference to a prompt, state, intent, API operation, or context variable that
does not exist is a **compile error**, not something the runtime validator
discovers later. The §7.2 validator still exists, but its job shrinks: it handles
only what types genuinely cannot express (graph reachability, "every dependency
has a mock," cross-flow analysis). Everything a type *can* catch, a type *does*
catch. Section 4.7 explains the strategy in full; the types below already apply
it.

```typescript
// ---- Branded identifiers ----------------------------------------------
// A brand makes two string-shaped ids non-interchangeable: a PromptId can
// never be passed where a StateId is expected, even though both are strings
// at runtime.
type Brand<T, B> = T & { readonly __brand: B };

type Locale = "en-US" | "es-US";

// ---- Registry-derived id unions ---------------------------------------
// Ids are NOT free-form. Each registry is frozen with `as const`, and its id
// type is *extracted from it* — so the id type is exactly the set of declared
// entries. The generic params below (TPrompt, TState, ...) are these unions,
// threaded through the model so every reference is checked against what exists.
type PromptId  = Brand<string, "PromptId">;
type StateId   = Brand<string, "StateId">;
type IntentName = Brand<string, "IntentName">;
type ApiName   = Brand<string, "ApiName">;
type OpName    = Brand<string, "OpName">;
type RuleName  = Brand<string, "RuleName">;
type FlowId    = Brand<string, "FlowId">;

// ---- The typed flow context -------------------------------------------
// FlowVars is a *declared interface*, not an open bag. Every variable a flow
// reads or writes must appear here. `keyof FlowVars` is then the only legal
// set of variable references anywhere in the flow.
interface FlowVars {
  authStatus: "authenticated" | "anonymous";
  balance: number;
  intent: IntentName;
  // ...declared per flow / per project
}
type VarName = keyof FlowVars;

interface FlowContext {
  vars: FlowVars;                          // strongly typed — no index signature
}

// ---- Prompts (reusable objects) ---------------------------------------
// `slots` is `VarName[]`, not `string[]` — a slot must name a declared
// variable. Authoring with `as const` (see 4.7) makes `id` a literal, not a
// widened string.
interface Prompt {
  id: PromptId;
  type: "text" | "ssml" | "audio";
  variants: Record<Locale, string>;        // text/ssml string or audio asset id
  slots?: VarName[];                       // interpolation placeholders — typed
  metadata?: Metadata;
}

// ---- Intent registry (single source of truth) ------------------------
interface IntentDef {
  name: IntentName;
  entities: Record<string, "string" | "number" | "date" | "amount">;
}

// ---- Eligibility rules (reusable predicates) --------------------------
// `evaluate` receives the *typed* FlowContext — `ctx.vars.authStaus` is a
// compile error; only declared FlowVars keys are reachable.
interface EligibilityRule {
  name: RuleName;
  describe: string;
  evaluate: (ctx: FlowContext) => boolean;
}

// ---- API dependencies + mocks -----------------------------------------
interface MockResponse {
  label: string;                           // "success", "not_found", "timeout"
  kind: "success" | "error" | "timeout";
  body: unknown;
}

interface ApiOperation {
  name: OpName;
  requestSchema: JsonSchema;
  responseSchema: JsonSchema;
  timeoutMs: number;
  mocks: MockResponse[];                   // mockRequirements live here
}

interface ApiDependency {
  name: ApiName;
  operations: ApiOperation[];
}

// ---- Transitions and guards -------------------------------------------
// `to` is StateId — and, in the builder of 4.7, narrowed further to the set
// of states that actually exist in *this* flow.
interface Transition {
  to: StateId;
  guard?: EligibilityRule;                 // optional eligibility gate
}

// ---- Retry / timeout config -------------------------------------------
// `escalatingPrompts` is PromptId[], not string[] — every entry must resolve
// to a declared prompt.
interface RetryPolicy {
  maxNoInput: number;
  maxNoMatch: number;
  escalatingPrompts: PromptId[];           // typed prompt references
  onExhausted: Transition;
}

interface TimeoutPolicy {
  inputTimeoutMs: number;
  completeTimeoutMs: number;
}

// ---- Observability events (see 3.12) ----------------------------------
// Structured, low-cardinality, machine-consumed. The analytics surface —
// distinct from LogStatement below, which is the debugging surface.
interface ObservabilityEvent {
  name: string;
  payloadSchema: JsonSchema;
}

// ---- Metadata + custom attributes (see 4.5) ---------------------------
// Free-form, non-executable annotation. Promoted from the original open-bag
// form: `traceMarkers` and `debug` are now first-class named fields rather
// than ad-hoc `attributes` entries, because adapters need to find them
// reliably to project into vendor KVPs / contact attributes (see 3.14's
// portability contract). Metadata is the one deliberately loose corner of
// the model (see 4.7) — it is inert by contract, so its looseness is safe.
interface Metadata {
  description?: string;
  owner?: string;                          // team / squad responsible
  tags?: string[];                         // e.g. ["pci", "experiment-A"]

  // First-class debugging affordances — adapters project these specifically:
  traceMarkers?: string[];                 // breadcrumb labels for call traces
  debug?: {
    breakpoint?: boolean;                  // simulator pauses here
    note?: string;                         // free-text aid for the next author
    expectVars?: Partial<FlowVars>;        // assertable in testScenarios
  };

  // Open bag for everything else the model has no dedicated field for.
  attributes?: Record<string, string | number | boolean>;

  // Per-vendor namespaced — leaks impossible across targets.
  vendorHints?: Partial<Record<VendorTarget, Record<string, unknown>>>;
}

type VendorTarget = "connect" | "lex" | "omilia" | "simulator";

// ---- Logging (see 3.14) ----------------------------------------------
// Per-call, narrative, human-consumed. Distinct from ObservabilityEvent.
// Each adapter maps these onto its native log surface — Omilia console
// logs / KVPs, CloudWatch for Connect/Lex, stdout + assertable buffer
// for the simulator — using the portability contract described in 3.14.
type LogLevel = "debug" | "info" | "warn" | "error";

type LogCategory =
  | "stateEntry"     // fired automatically on entering the state
  | "stateExit"      // fired automatically on leaving the state
  | "decision"       // a branch was selected — record which and why
  | "apiRequest"     // fired before an apiCall — operation + redacted req
  | "apiResponse"    // fired after an apiCall — status, latency, redacted body
  | "fallback"       // a fallback or error path was taken
  | "custom";        // author-defined ad-hoc message

interface LogStatement {
  category: LogCategory;
  level: LogLevel;
  code: string;                            // stable, searchable identifier
                                           //   e.g. "decision.routeByAuth"
  message: string;                         // human-readable; supports {var}
                                           //   interpolation, checked as VarName
  includeVars?: VarName[];                 // typed vars attached as structured
                                           //   context alongside the message
  redact?: VarName[];                      // typed vars whose values are masked
                                           //   by the adapter before emission
  description?: string;                    // documentation only
}

// ---- Inline vendor code (see 4.6) -------------------------------------
// A typed escape hatch carrying a vanilla-JS snippet that a capable vendor
// (e.g. Omilia) runs natively. `reads`/`writes` are VarName[] — even though
// the snippet *body* is opaque, its declared interface is fully typed, so
// data-flow checks still hold.
interface InlineCode {
  vendor: VendorTarget;                    // which backend may emit this
  hook: "onEntry" | "onExit" | "beforeApiCall" | "afterApiCall" | "onInput";
  language: "javascript";                  // reserved for future runtimes
  source: string;                          // the vanilla-JS snippet
  reads: VarName[];                        // typed context-var references
  writes: VarName[];                       // typed context-var references
  description?: string;
}
```

### 4.2 The discriminated state union

The `State` type is a discriminated union on `kind`. This is what makes the
compiler enforce structural correctness per state kind.

```typescript
interface BaseState {
  id: StateId;
  emits?: ObservabilityEvent[];           // analytics events (see 3.12)
  logs?: LogStatement[];                  // narrative log statements (see 3.14)
  metadata?: Metadata;                    // free-form annotation (see 4.5)
  inlineCode?: InlineCode[];              // vendor-native code hooks (see 4.6)
}

interface CollectState extends BaseState {
  kind: "collect";
  prompts: PromptId[];                    // typed prompt references
  acceptedIntents: {
    intent: IntentName;                   // typed — must exist in the registry
    transition: Transition;
  }[];
  dtmfOptions: Record<string, Transition>;// key -> transition
  retries: RetryPolicy;
  timeouts: TimeoutPolicy;
}

interface ApiCallState extends BaseState {
  kind: "apiCall";
  dependency: ApiName;                    // typed dependency reference
  operation: OpName;                      // typed operation reference
  saveAs: VarName;                        // must be a declared FlowVars key
  onSuccess: Transition;
  onError: Transition;
  onTimeout: Transition;
}

interface DecisionState extends BaseState {
  kind: "decision";
  branches: { when: EligibilityRule; transition: Transition }[];
  otherwise: Transition;
}

interface TransferState extends BaseState {
  kind: "transfer";
  destination: TransferDestination;       // reusable queue/agent/number object
  contextPayload: VarName[];              // typed — declared FlowVars keys
  whisperPrompt?: PromptId;               // typed prompt reference
}

interface PlaybackState extends BaseState {
  kind: "playback";
  prompts: PromptId[];                    // typed prompt references
  next: Transition;
}

interface SubflowState extends BaseState {
  kind: "subflow";
  flow: FlowId;                           // typed — must be a declared flow
  next: Transition;
}

interface TerminalState extends BaseState {
  kind: "terminal";
  reason: string;
}

type State =
  | CollectState | ApiCallState | DecisionState
  | TransferState | PlaybackState | SubflowState | TerminalState;
```

### 4.3 The flow object

```typescript
interface Flow {
  id: FlowId;
  entryState: StateId;                    // must be one of `states`
  states: State[];
  apiDependencies: ApiDependency[];
  flowFallback: Transition;               // flow-level fallback (see 3.7)
  testScenarios: TestScenario[];
  metadata?: Metadata;                    // flow-level annotation (see 4.5)
}

interface TestScenario {
  name: string;
  startState: StateId;
  steps: Array<
    | { input: "intent"; name: string; entities?: Record<string, unknown> }
    | { input: "dtmf"; key: string }
    | { input: "apiResponse"; dependency: string; mockLabel: string }
  >;
  expectStateSequence: StateId[];
  expectOutcome: { kind: "transfer" | "terminal"; id: string };
}
```

### 4.4 A fluent builder for ergonomics

Authoring raw object literals is verbose. A thin builder makes flows readable
while still producing the plain `Flow` object the compiler consumes. Crucially,
the builder is **generic over the state ids it has accumulated** (§4.7): each
`.collect(...)`, `.apiCall(...)`, etc. widens the builder's type parameter with
the id just declared, so a `to:` / `next:` can only reference a state that
already exists in *this* flow. Prompt, intent, and dependency references are the
registry-derived literal unions of §4.1, so those are checked too:

```typescript
const flow = defineFlow("card_services")
  .withDependencies([accountApi, disputeApi])
  .collect("main_menu", {
    prompts: ["welcome", "menuOptions"],        // PromptId[] — checked vs registry
    acceptedIntents: [
      { intent: "checkBalance", to: "balance_lookup" },   // IntentName + StateId
      { intent: "disputeTxn",  to: "dispute_subflow" },
    ],
    dtmf: { "1": "balance_lookup", "2": "dispute_subflow", "0": "to_agent" },
    retries: standardRetries("to_agent"),       // reused retry policy
    timeouts: standardTimeouts,                  // reused timeout policy
  })
  .apiCall("balance_lookup", {
    dependency: "accountApi",                   // ApiName — checked vs registry
    operation: "getBalance",                    // OpName — checked vs dependency
    saveAs: "balance",                          // VarName — checked vs FlowVars
    onSuccess: "play_balance",
    onError: "to_agent",
    onTimeout: "to_agent",
  })
  .playback("play_balance", {
    prompts: ["yourBalanceIs"],                 // interpolates {balance}
    next: "main_menu",                          // ✓ a state of this flow
  })
  .transfer("to_agent", {
    destination: queues.cardServices,
    contextPayload: ["intent", "balance", "authStatus"],  // VarName[]
  })
  .fallback("to_agent")
  .build();
// .playback("x", { next: "main_menyu" })  ✗ — "main_menyu" is not a state id
```

Every bare string in that example is, at the type level, a member of a specific
literal union — not free text. A typo in any id is a red squiggle at the call
site before the file is even saved.

### 4.5 Metadata and custom attributes

The structural model in §3 is deliberately fixed — that fixedness is what lets
the compiler validate flows. But real projects always accumulate information
that *is not flow logic*: who owns a state, which experiment a branch belongs
to, a PCI-scope marker, an analytics tag, a free-text note for the next author,
a trace breadcrumb for debugging. Forcing all of that into the typed model
would bloat it; leaving nowhere to put it pushes teams back into spreadsheets
and tribal knowledge. Most IVR platforms also offer their own annotation
mechanism — Omilia's KVPs, Connect's contact attributes, Lex's session
attributes — and a portable DSL has to bridge them.

`Metadata` is the bridge. It is an **optional, non-executable annotation bag**
attachable to any node — the `Flow`, any `State`, and (as shown in §6.1) reusable
objects like `Prompt`. It is organised into named, first-class fields where the
adapter needs to find things reliably, and an open `attributes` bag for the rest:

- `description` / `owner` / `tags` — cheap, conventional fields for
  documentation, ownership, and categorisation. Projected to KVPs / contact
  attributes by every adapter under fixed names.
- `traceMarkers` — string labels meant for **call traces**. Adapters emit these
  as breadcrumbs into the platform's trace stream (Omilia trace markers,
  Connect/Lex log attributes). This is what lets an on-call engineer follow a
  caller's path through a flow at a glance.
- `debug` — author-facing debugging affordances: `breakpoint` causes the
  simulator (§7.4) to pause at this state during scenario runs; `note` is a
  free-text aid; `expectVars` declares values that `testScenario`s can assert
  against. None of these affect production behaviour — they are tools for
  authors and for tests.
- `attributes` — the open `Record` of primitive values for everything the model
  has no dedicated field for (an A/B flag, a priority weight, a JIRA key).
  Adapters project this into the platform's KVP / attribute facility under the
  same keys.
- `vendorHints` — the same idea but **namespaced per vendor target**, so a tuning
  knob meant only for Omilia (`{ omilia: { bargeInSensitivity: 0.7 } }`) is
  carried explicitly and can never leak into the Connect or Lex artifact.

Authored through the builder, metadata is just another option on any node:

```typescript
.collect("ask_intent", {
  prompts: ["welcome"],
  acceptedIntents: [/* ... */],
  dtmf: { "0": "to_agent" },
  retries: standardRetries("to_agent"),
  timeouts: standardTimeouts,
  metadata: {
    description: "Top-level menu — first turn the caller hears",
    owner: "self-service-squad",
    tags: ["entry-point", "experiment-A"],
    traceMarkers: ["entry", "menu-v2"],
    debug: { note: "Watch out for barge-in on Spanish locale" },
    attributes: { abVariant: "menu_v2", priority: 1 },
    vendorHints: {
      omilia: { bargeInSensitivity: 0.7 },
      connect: { loggingBehavior: "Enabled" },
    },
  },
})
```

**The portability contract.** Metadata's value depends on adapters projecting it
*predictably*, so the contract is explicit rather than per-adapter folklore:

```
   DSL Metadata
        ↓
   Provider adapter
        ↓
   Omilia: KVPs (one per first-class field + each attributes entry)
           + trace markers as native trace breadcrumbs
   Connect: contact attributes (prefixed `meta.*` for cleanliness)
           + tags surfaced as logged attributes
   Lex: session attributes under the same naming
   Simulator: structured in-memory metadata buffer, assertable in tests
```

Every adapter implements this projection; vendor-specific knobs live only in
`vendorHints`, never in the portable fields. A flow that relies on metadata for
debugging therefore retains its debugging story across vendors — the *contents*
match, even when the *delivery surface* does not.

**How the compiler treats it.** Metadata is *inert by contract*: the validator
(§7.2) never branches flow behaviour on it, so it can never make a flow
incorrect. It travels through the IR untouched. At the backend stage (§7.4) each
vendor backend reads `vendorHints[itsOwnTarget]` to set native options and
projects the portable fields per the contract above; it simply ignores any hint
namespaced for a different vendor. The one rule the compiler enforces is a
*lint*: an unknown `vendorHints` namespace, or a hint key a backend does not
recognise, produces a warning — so typos surface instead of silently doing
nothing.

### 4.6 Inline vendor code

Metadata covers everything that is *data*. Some escape hatches, though, need to
be *behaviour*. Omilia in particular allows authors to attach custom
**vanilla-JavaScript** code to specific artifacts in its flow — a small snippet
that runs natively inside the Omilia engine at a defined point in the turn. This
is genuinely useful (a quick value transformation, a bespoke validation, a
formatting step) and the DSL should not throw that capability away just because
not every vendor has an equivalent.

The `InlineCode` type carries exactly this, as a **first-class, typed, vendor-
tagged escape hatch** rather than an untracked blob:

```typescript
.apiCall("lookup_balance", {
  dependency: "accountApi",                // ApiName
  operation: "getBalance",                 // OpName
  saveAs: "balanceRaw",                    // VarName — must be a declared FlowVars key
  onSuccess: "play_balance",
  onError: "to_agent",
  onTimeout: "to_agent",
  inlineCode: [{
    vendor: "omilia",
    hook: "afterApiCall",
    language: "javascript",
    // Runs natively inside Omilia after the API call returns.
    source: `
      // 'balanceRaw' is in scope; produce a display-formatted value.
      var n = Number(context.balanceRaw);
      context.balance = isNaN(n)
        ? "unavailable"
        : "$" + n.toFixed(2);
    `,
    reads:  ["balanceRaw"],                 // VarName[] — typed, even though the
    writes: ["balance"],                    // VarName[]   body itself is opaque
    description: "Format the raw balance for prompt interpolation",
  }],
})
```

Four design points make this safe rather than a hole in the abstraction:

1. **Vendor-scoped.** `vendor: "omilia"` means only the Omilia backend ever emits
   this snippet. The Connect/Lex backend, seeing inline code it cannot host, must
   do one of two things — and the project picks the policy: either **fail the
   compile** with a clear "this flow uses an Omilia-only capability the Connect
   target cannot satisfy" error, or fall back to an equivalent the target *can*
   do (emit the logic as a tiny Lambda step). The point is the mismatch is
   *explicit and detected*, never silent.
2. **Hook-anchored.** `hook` pins the snippet to a defined lifecycle point
   (`onEntry`, `afterApiCall`, …) so the backend knows exactly where in the
   generated artifact to place it, instead of guessing.
3. **Declared data flow.** `reads` and `writes` list the context variables the
   snippet touches. The body is opaque to the validator — it is vanilla JS — but
   because the *interface* is declared, §7.2's variable-typing checks still work:
   a snippet that `writes: ["balance"]` satisfies a later prompt slot `{balance}`,
   and a snippet that `reads` an undeclared variable is still caught.
4. **Testable.** The simulator backend (§7.4) runs `language: "javascript"`
   snippets in a sandboxed JS context during scenario runs, so a flow using
   inline code is still exercised end-to-end in CI — the escape hatch does not
   create an untested blind spot.

The guidance stays the same as for metadata: inline code is an **escape hatch,
not the main road**. If the same snippet appears across many flows, that is a
signal the structural model is missing a feature and should grow a proper typed
node — at which point the inline version can be retired. But for the genuinely
one-off, vendor-specific case, `InlineCode` lets the DSL carry Omilia's
custom-JS capability faithfully instead of pretending it does not exist.

### 4.7 Type safety by default — strict by construction

A type system that calls everything `string` is barely a type system. Consider
the loose version of a registry:

```typescript
// LOOSE — "typed" in name only
export const prompts = {
  welcome:       { id: "prompt.welcome",  type: "ssml", variants: { /* ... */ } },
  yourBalanceIs: { id: "prompt.balance",  type: "text", variants: { /* ... */ },
                   slots: ["balance"] },
} satisfies Record<string, Prompt>;

export const standardRetries = (escalateTo: StateId): RetryPolicy => ({
  maxNoInput: 2, maxNoMatch: 2,
  escalatingPrompts: ["prompt.reprompt1", "prompt.reprompt2"],  // unchecked strings
  onExhausted: { to: escalateTo },
});
```

Every weak point here is a bug the compiler waves through: `slots: ["blance"]`
compiles, `escalatingPrompts: ["promt.reprompt1"]` compiles, `onExhausted: { to:
"stat_that_does_not_exist" }` compiles, and a guard reading `ctx.vars.authStaus`
compiles. Each becomes a runtime failure the §7.2 validator must chase down — or,
worse, a failure on a live call. The strict design closes these at the type
layer. It rests on four techniques, all already reflected in §4.1.

**1. Branded identifiers.** A bare `string` lets any string stand in for any id.
A *brand* — `type PromptId = Brand<string, "PromptId">` — makes ids of different
kinds non-interchangeable. Passing a `PromptId` where a `StateId` is expected is
now a compile error, even though both are strings at runtime. The brand costs
nothing at runtime; it exists purely to give the compiler something to reject.

**2. Registry-derived literal unions via `as const`.** Ids should not be
free-form text — they should be *exactly the set that was declared*. Freeze each
registry with `as const` and extract the id type from it:

```typescript
// STRICT — the id type IS the set of declared prompts
export const prompts = {
  welcome:       { type: "ssml", variants: { /* ... */ } },
  yourBalanceIs: { type: "text", variants: { /* ... */ }, slots: ["balance"] },
} as const satisfies PromptRegistry;

export type PromptId = keyof typeof prompts;   // "welcome" | "yourBalanceIs"
```

Now `PromptId` is the literal union `"welcome" | "yourBalanceIs"`. A reference to
`"welcom"` does not compile — no validator pass is needed for that entire class
of bug, and the IDE autocompletes the legal set. The same pattern derives
`IntentName`, `ApiName`, `RuleName`, and the per-flow `StateId` set from their
respective registries.

**3. A declared, closed flow context.** `FlowContext.vars` is a declared
`interface` (`FlowVars`) with **no index signature** — so `keyof FlowVars` is the
complete and only set of legal variable references. Everything that names a
variable is then typed against it: a `Prompt`'s `slots` is `VarName[]`, an
`InlineCode` block's `reads`/`writes` are `VarName[]`, and an `EligibilityRule`'s
`evaluate` receives the typed `FlowContext`. `ctx.vars.authStaus` stops
compiling; `slots: ["blance"]` stops compiling.

**4. A flow builder generic over its own state ids.** This is the technique that
makes *intra-flow* references safe. The builder accumulates the set of state ids
declared so far as a type parameter, so a `.transition({ to })` can only target
a state that already exists in *this* flow:

```typescript
// Each builder call returns a builder whose type parameter is widened
// with the id just declared. `to:` is constrained to that accumulated union.
const flow = defineFlow("balance_inquiry")
  .collect("ask_intent", { /* ... */ })          // adds "ask_intent" to the set
  .apiCall("lookup_balance", { /* ... */ })      // adds "lookup_balance"
  .transfer("to_agent", { /* ... */ })           // adds "to_agent"
  .playback("play_balance", {
    prompts: ["yourBalanceIs"],
    next: { to: "ask_intent" },                  // ✓ exists in this flow
    // next: { to: "ask_intnt" },                // ✗ compile error — not a state
  })
  .build();
```

A dangling transition — the single most common IVR authoring bug — becomes
unrepresentable. The cost is honest: this is the most advanced TypeScript in the
codebase, compile times grow with very large flows, and a mismatch can produce a
verbose error. The mitigation is to keep individual flows modest and compose them
with `subflow` (§6.2) — which is good design regardless — and to invest in the
builder's error messages. The technique is worth its cost because the bug it
eliminates is both common and expensive.

**The one deliberate exception.** Strictness is the default *everywhere it
helps*, but `Metadata.attributes` and `Metadata.vendorHints` remain intentionally
loose (`Record<string, …>`). This is consistent, not contradictory: metadata is
**inert by contract** (§4.5) — the compiler and the simulator never branch
behaviour on it — so its looseness cannot produce an incorrect flow. Forcing a
closed type on a free-form annotation bag would defeat its purpose. The principle
is precise: *strict wherever a value can affect flow behaviour; loose only where
a value provably cannot.* That line is where the type system earns its keep, and
the metadata lint (§7.2) still catches the typo-class mistakes even there.

**What this leaves for the runtime validator.** Type safety shrinks the
validator's job; it does not remove it. Types are excellent at *existence and
kind* — does this id resolve, is this the right sort of id, is this variable
declared. Types are poor at, or incapable of, *whole-graph and cross-cutting
properties* — is every state reachable from the entry state, is there a cycle
with no exit, does every `ApiDependency` declare both a success and a failure
mock, does an `InlineCode` block target a vendor the flow is actually being
compiled to. Those stay in §7.2. The division is clean and complementary: the
type system is the first and cheapest line of defence, catching the common bugs
instantly and with good locality; the validator is the second line, catching the
structural properties that no type can express. Together they mean a flow that
compiles *and* validates has had essentially every mechanical error designed out
of it before a single vendor artifact is emitted.

### 4.8 Portable logging

Logging is declared on a state via the `logs` field on `BaseState`. Two
categories — `stateEntry` and `stateExit` — are fired automatically by the
adapter around the state's execution; the rest are placed where the author
intends them:

```typescript
.apiCall("lookup_balance", {
  dependency: "accountApi",
  operation: "getBalance",
  saveAs: "balance",
  onSuccess: "decide_route",
  onError: "to_agent",
  onTimeout: "to_agent",
  logs: [
    { category: "stateEntry", level: "info",
      code: "balance.lookup.start",
      message: "Looking up balance for caller" },

    { category: "apiRequest", level: "debug",
      code: "balance.request",
      message: "Calling accountApi.getBalance for {accountId}",
      includeVars: ["accountId"],                  // typed VarName references
      redact:      ["fullSsn"] },                  // never appears in any sink

    { category: "apiResponse", level: "info",
      code: "balance.response",
      message: "accountApi.getBalance returned in {apiLatencyMs}ms",
      includeVars: ["apiLatencyMs", "apiStatusCode"] },

    { category: "fallback", level: "warn",
      code: "balance.timeout",
      message: "Balance lookup timed out — routing to agent" },
  ],
})
```

**How adapters realise it.** Each backend honours the portability contract from
§3.14: Omilia maps `LogStatement`s to its console-log API and emits selected
fields as KVPs for searchability; Connect/Lex backends emit to CloudWatch with
the `code` as a structured field; the simulator captures everything into a
buffer the `testScenario`s can assert against. `redact` is enforced by every
adapter unconditionally — a redacted `VarName` is masked before the message ever
leaves the DSL's runtime model, so no vendor sees the cleartext value.

**Validation.** The validator (§7.2) adds two rules for logging: every `code` is
unique within a flow (so logs can be searched without ambiguity), and every
`{var}` in `message` plus every entry in `includeVars`/`redact` is a declared
`VarName` — undeclared variable references in log messages are caught at
compile, not when the log line first appears blank in production.

**Honest scope, restated at the type level.** The DSL guarantees that *the same
statements get produced on every vendor*, with the same `level`, `code`, and
redaction. It does **not** guarantee the same retention, search syntax,
sampling, or alerting on the receiving side — those remain platform concerns
(§3.14). Operators get one producer, many sinks; the producer is the part the
DSL can portably own.

---

## 5. What the DSL does, expressed through Clean Code and SOLID

The previous sections describe *what* the DSL models. This section is about *why
the architecture holds up* — stated against the Clean Code and SOLID principles,
because a DSL that will be maintained for years by a rotating team lives or dies
on exactly these properties. Each item below is a concrete capability of the
design, not an aspiration.

### 5.1 Single Responsibility Principle

**Every concept has exactly one reason to change.** The design deliberately
separates concerns that vendor tools tangle together:

- A `Prompt` owns wording and localization — nothing else. Change the script,
  change one object.
- A `RetryPolicy` owns reprompt behavior; a `TimeoutPolicy` owns temporal
  bounds. They are separate types precisely because they are separate reasons to
  change (§3.5–3.6).
- An `EligibilityRule` owns one predicate. `isAuthenticated` changes when the
  definition of "authenticated" changes, and for no other reason.
- The **front end** (build the IR), the **validator** (prove it correct), the
  **NLU normalizer**, and each **vendor backend** are separate modules in the
  compiler. A change to Connect's JSON schema touches the Connect backend and
  nothing else.

The practical payoff: a bug or a requirement change has a single, predictable
home. No "I changed the retry wording and the transfer broke."

### 5.2 Open/Closed Principle

**The DSL is open for extension, closed for modification.** This is the single
most important property for vendor-agnosticism:

- **Adding a vendor** means writing a new backend module that consumes the
  existing IR. The DSL grammar, the IR, the validator, and every already-written
  flow are not touched. The system extends without anyone editing tested code.
- **Adding a state kind** means adding one member to the `State` discriminated
  union and one handler per backend — the compiler's exhaustiveness checking
  (§5.4) then *tells you* every place that must be updated.
- **Adding a vendor capability** that has no neutral representation does not
  force a breaking change to the core model — it goes through the `vendorHints`
  or `InlineCode` escape hatches (§4.5–4.6), which were designed in precisely so
  the closed core never has to be pried open for a one-off.

### 5.3 Liskov Substitution Principle

**Every backend is substitutable behind the same contract.** A backend is, in
effect, an implementation of `compile(ir: IR) => VendorArtifact`. The compiler
driver invokes them through that one interface and depends on none of their
internals. The Connect backend, the Omilia backend, and the simulator backend
are interchangeable from the driver's point of view — which is what makes
"compile this flow to all targets" a loop, not a special case per vendor.
Likewise, every `State` variant honors the `BaseState` contract (`id`, optional
`emits`, `metadata`, `inlineCode`), so any graph-walking pass — validation,
reachability, IR lowering — treats states uniformly and only narrows on `kind`
where it genuinely must.

### 5.4 Interface Segregation Principle

**No node is forced to carry fields it does not use.** This is why `State` is a
*discriminated union* rather than one fat interface with every possible field
made optional:

- A `TransferState` has `destination` and `contextPayload`. It has no `retries`,
  no `acceptedIntents` — because a transfer does not collect input, and the type
  does not pretend otherwise.
- A `CollectState` has `acceptedIntents`, `dtmfOptions`, `retries`, `timeouts` —
  exactly the input-collection surface, and nothing from the API-call surface.

The author sees only the fields that are meaningful for the node in front of
them, and the compiler rejects a field that does not belong. Contrast the "one
giant optional-everything object" approach, where nothing guides the author and
nothing is enforced.

### 5.5 Dependency Inversion Principle

**High-level flow logic depends on abstractions, never on a vendor.** A `Flow`
references a `Prompt` by id, an `ApiDependency` by name, an `EligibilityRule` by
its declared interface. It never references "an Omilia prompt artifact" or "a Lex
slot." The concrete, vendor-specific detail is produced at the *bottom* of the
pipeline by the backends; the *top* of the pipeline — where the business logic
lives — knows only the neutral model. Inverting the dependency this way is the
literal mechanism of vendor-agnosticism: the valuable layer points at the stable
abstraction, and the volatile vendor layer is a leaf, not a root.

### 5.6 Clean Code properties the design buys

Beyond SOLID, several Clean Code qualities fall out of the choices already made:

- **Meaningful names, no magic values.** Flows reference `"welcome"`,
  `"checkBalance"`, `queues.cardServices` — but these are *not* bare strings.
  Each is a member of a registry-derived literal union or the builder's
  accumulated state-id set (§4.7), so a typo is a compile error at the call
  site, not a silent dead end on a live call. The DSL has the readability of
  string literals with the safety of an enum.
- **DRY by construction.** Because every definition is an importable value
  (§6), there is no copy-paste of prompts, policies, or rules. One
  definition, many references; change it once.
- **Small, composable units.** `subflow` lets a large IVR be assembled from
  small, independently comprehensible flows rather than one sprawling graph.
- **Fail fast, fail loud.** The validator (§7.2) rejects a structurally broken
  flow at compile time with a specific message — the opposite of discovering the
  break when a caller hits it at 2 a.m.
- **Tests live with the code.** `testScenario`s are part of the flow definition,
  compiled from the same source, so tests cannot silently drift from behavior.
- **Self-documenting, with a place for the rest.** The typed model documents the
  flow's structure; `Metadata` gives the genuinely free-form context (owner,
  rationale, tickets) a first-class home instead of a side wiki.
- **The escape hatch is honest.** `InlineCode` and `vendorHints` are explicit,
  typed, vendor-tagged, and lint-checked — when the abstraction must be bypassed,
  the bypass is visible and tracked, not smuggled in.

### 5.7 The one principled compromise

Clean architecture is about *managing* coupling, not pretending it away. The
DSL's deliberate, documented compromise is the escape hatch: `InlineCode` carries
an opaque JavaScript body the compiler cannot reason into (§4.6), and
`vendorHints` carries vendor-specific knobs. These are *controlled* violations —
scoped by `vendor`, anchored by `hook`, bounded by declared `reads`/`writes`,
covered by the simulator, surfaced by lint. The principle being honored is that a
necessary coupling made *explicit and contained* is clean; the same coupling
spread silently through the model is not. Naming the compromise is itself part of
keeping the design honest.

---

## 6. Reuse of objects and variables

Reuse is a primary requirement, and the embedded-DSL approach makes it natural
because **everything is just a TypeScript value**.

### 6.1 Reusing definition objects

Prompts, intents, eligibility rules, API dependencies, retry/timeout policies,
and transfer destinations are declared once in their own modules and *imported*.
Each registry is frozen with `as const` so its id type can be *derived from it*
(§4.7) — the registry is simultaneously the runtime data and the source of the
literal-union id type:

```typescript
// prompts/card-services.ts
// `as const` freezes the keys into literals; PromptId is then the exact set.
export const prompts = {
  welcome: {
    type: "ssml",
    variants: { "en-US": "<speak>Welcome to card services.</speak>",
                "es-US": "<speak>Bienvenido a servicios de tarjeta.</speak>" },
  },
  yourBalanceIs: {
    type: "text",
    variants: { "en-US": "Your balance is {balance}.",
                "es-US": "Su saldo es {balance}." },
    slots: ["balance"],          // VarName[] — "blance" would not compile
  },
} as const satisfies PromptRegistry;

export type PromptId = keyof typeof prompts;   // "welcome" | "yourBalanceIs"

// policies/retries.ts — one retry policy, reused across every collect state.
// `escalatingPrompts` is PromptId[]: every entry is checked against the
// prompt registry, so a typo'd prompt id is a compile error here, not a
// runtime miss on attempt two of a live call.
export const standardRetries = (escalateTo: StateId): RetryPolicy => ({
  maxNoInput: 2, maxNoMatch: 2,
  escalatingPrompts: ["reprompt1", "reprompt2"],   // PromptId[] — typed
  onExhausted: { to: escalateTo },
});

// rules/eligibility.ts — reusable predicates.
// `evaluate` receives the typed FlowContext: `ctx.vars.authStatus` resolves,
// `ctx.vars.authStaus` does not compile.
export const isAuthenticated: EligibilityRule = {
  name: "isAuthenticated" as RuleName,
  describe: "Caller has completed identity verification",
  evaluate: (ctx) => ctx.vars.authStatus === "authenticated",
};
```

Because these are ordinary modules, ordinary tooling applies: find-all-references
shows every flow that uses a prompt; renaming is a refactor; a change to
`standardRetries` propagates everywhere automatically. And because the ids are
registry-derived literal unions rather than bare strings, that same tooling is
*backed by the compiler* — a reference to a prompt, rule, or variable that does
not exist fails to compile at the reference site, with autocomplete offering the
legal set as the author types.

### 6.2 Reusing flow fragments

Whole sub-graphs are reusable through the `subflow` state kind. An
`authentication` flow, a `disputeIntake` flow, and a `survey` flow are authored
once and referenced by many parent flows. The compiler inlines or links them per
vendor as appropriate.

### 6.3 Runtime variables

`FlowContext` carries the typed runtime state — caller attributes, results saved
by `apiCall` states (`saveAs`), and intermediate values. Variables are:

- **Written** by `apiCall` (`saveAs`) and by entity extraction on `collect`.
- **Read** by prompt interpolation (`{balance}`), by eligibility rules, and by
  transfer `contextPayload`.

Keeping the context strongly typed means an eligibility rule referencing
`ctx.vars.balance` and a prompt slot `{balance}` can both be checked against the
same declared variable shape — a class of "undefined variable on a live call"
bug eliminated at compile time. The mechanism is the closed `FlowVars` interface
of §4.7: because it has no index signature, `keyof FlowVars` is the complete and
only legal set of variable names, and every field that names a variable —
`Prompt.slots`, `InlineCode.reads`/`writes`, `ApiCallState.saveAs`,
`TransferState.contextPayload` — is typed `VarName`, so a reference to an
undeclared variable simply does not compile.

---

## 7. The compilation process

Compilation is the heart of vendor-agnosticism. It is a classic **front-end →
intermediate representation → back-end** pipeline.

```
 TypeScript DSL          Validation &            Vendor backends
 (Flow objects)          normalization
 ───────────────  ──►   ─────────────────  ──►   ┌─────────────────────────┐
   defineFlow()         parse to IR              │ Connect/Lex backend     │
   builders        ──►  semantic checks   ──►    │  → contact-flow JSON    │
   imported defs        link references          │  → Lex bot model        │
                        normalize NLU            ├─────────────────────────┤
                                            ──►  │ Omilia backend          │
                                                 │  → flow artifact / API  │
                                                 ├─────────────────────────┤
                                            ──►  │ Simulator backend       │
                                                 │  → in-process test run  │
                                                 └─────────────────────────┘
```

### 7.1 Stage 1 — Front end: build the IR

Running the flow's TypeScript module produces a tree of `Flow` / `State` /
`Prompt` objects. The compiler walks this tree and lowers it into a flat,
serializable **Intermediate Representation (IR)**: a normalized graph of IR nodes
(`IRPrompt`, `IRCollect`, `IRApiCall`, `IRBranch`, `IRTransfer`, …) with explicit
typed edges. The IR — not the DSL — is the contract every backend consumes. It
is deliberately small and explicit; all author-friendly sugar from the builder
is gone by this point.

### 7.2 Stage 2 — Semantic validation

Before any backend runs, the compiler validates the IR. This is where most
"would have been a 2 a.m. production incident" bugs are caught:

- **Reference integrity** — every `Transition.to` points at a real state; every
  `prompts[]` id resolves to a declared `Prompt`; every `acceptedIntents` entry
  exists in the intent registry; every `apiCall` references a declared
  `ApiDependency` operation.
- **Reachability** — no orphan states; the entry state reaches every state; no
  state has an undefined edge (every failure mode resolves to a transition or a
  declared fallback).
- **Completeness** — every `collect` has a retry policy and a timeout policy;
  every `apiCall` has `onError` *and* `onTimeout`; every `ApiDependency` has at
  least one success and one failure mock.
- **DTMF/intent conflicts** — no key bound twice, no ambiguous grammar.
- **Variable typing** — every interpolation slot and every eligibility-rule
  variable reference resolves to a declared, typed context variable. This check
  also consumes the `reads`/`writes` of every `InlineCode` block: the snippet
  body is opaque, but its declared interface keeps data-flow reasoning intact.
- **Inline-code compatibility** — every `InlineCode` block is tagged with a
  `vendor`; the compiler records which targets a flow can therefore still be
  compiled to, and errors (or, per project policy, down-levels to a Lambda step)
  when a requested target cannot host a snippet it was handed.
- **Metadata lint** — `metadata` is inert and never fails a build on its own,
  but an unknown `vendorHints` namespace, or a hint key no backend recognises, is
  surfaced as a *warning* so typos do not silently no-op.
- **Log-statement integrity** — every `LogStatement.code` is unique within a
  flow (so logs are searchable without ambiguity); every `{var}` placeholder in
  a `message`, and every entry in `includeVars`/`redact`, resolves to a declared
  `VarName`. An undeclared variable reference in a log message is caught here,
  not when an operator notices a blank `{}` in a production log line.

A flow that fails validation never reaches a backend. This is the single biggest
argument for the DSL over hand-authoring vendor artifacts.

### 7.3 Stage 3 — NLU normalization

The IR carries the canonical intent registry. Stage 3 prepares the per-vendor
projection of it: the same canonical intents and entity schemas, expressed as
whatever each engine needs (a Lex bot model; an Omilia NLU configuration). It
also records the **per-vendor confidence calibration** metadata, because — as
noted in §1.1 — a raw 0.8 from one engine is not a 0.8 from another. The runtime
adapter later uses this to normalize scores into the common `NluResult` contract.
The DSL standardizes the *contract*; it does not pretend the engines are
interchangeable.

### 7.4 Stage 4 — Back ends: emit vendor artifacts

Each backend is an independent module that consumes the validated IR and emits
one target's native form. Adding a vendor = adding a backend; the DSL, the IR,
and every existing flow stay untouched.

- **Connect / Lex backend.** Fully mechanizable: emits Connect contact-flow JSON
  (a graph of blocks — Get customer input, Play prompt, Set contact attributes,
  Invoke Lambda, Transfer) plus a Lex bot definition. IR `apiCall` nodes become
  Lambda-invoke blocks; `eligibilityRule` guards become attribute checks or
  Lambda calls; `observabilityEvent`s become CloudWatch emissions and contact
  attributes. It reads `vendorHints.connect` for native options. Per the
  portability contract (§4.5), it projects portable `Metadata` —
  `description`/`owner`/`tags`/`traceMarkers` and every `attributes` entry —
  into Connect **contact attributes** (or Lex **session attributes**) under a
  predictable `meta.*` prefix; `LogStatement`s become structured CloudWatch
  emissions with `code` as a queryable field and `redact` applied before
  emission. For any `InlineCode` block *not* tagged `connect`, it applies the
  project's mismatch policy — fail the compile, or down-level the snippet into a
  small generated Lambda. Output is IaC-friendly (Terraform / CloudFormation).

- **Omilia backend.** The harder target, and one to be honest about: whether
  Omilia can be *generated into* depends entirely on what Omilia's API / import
  surface supports — something to confirm directly with Omilia, not assume. Two
  viable strategies:
  - *Compile-time generation* — if Omilia exposes programmatic flow import, the
    backend emits Omilia flow artifacts directly, analogous to the Connect
    backend.
  - *Runtime orchestration* — if it does not, the "backend" instead emits config
    for a small **interpreter service** that holds the flow logic and drives
    Omilia turn-by-turn through its runtime API (call Omilia for ASR + NLU, get
    a normalized result back, the interpreter decides the next IR state, pushes
    the next prompt). This works regardless of import support and makes
    "use both vendors" natural, at the cost of operating a stateful service on
    the call path.

  This backend is also the one that consumes `InlineCode` blocks tagged
  `omilia`: it places each snippet's `source` onto the matching Omilia artifact
  at the lifecycle point named by `hook`, which is exactly the native custom-JS
  capability Omilia exposes. It reads `vendorHints.omilia` for tuning knobs
  (barge-in sensitivity and similar). It projects portable `Metadata` into
  Omilia **KVPs** — one KVP per first-class field plus one per `attributes`
  entry — and `traceMarkers` as native trace breadcrumbs; `LogStatement`s are
  emitted through Omilia's console-log API with `code` carried as a KVP for
  searchability and `redact` applied before emission. A hybrid — generate
  Connect/Lex natively, orchestrate Omilia at runtime — is a perfectly
  reasonable production choice.

- **Simulator backend.** Emits nothing for a vendor at all; instead it runs the
  IR in-process. It walks the state graph, feeds it the `testScenario` inputs,
  serves `mockRequirements` in place of real APIs, executes `InlineCode`
  snippets in a sandboxed JS context so flows using the escape hatch are still
  covered, captures portable `Metadata` and `LogStatement`s into structured
  in-memory buffers so `testScenario`s can assert on the *log narrative* and on
  `debug.expectVars`, and asserts the `expectStateSequence` and
  `expectOutcome`. This is what makes the DSL's test scenarios executable in CI
  with zero vendor dependency.

### 7.5 Stage 5 — Test artifact generation

Alongside each vendor artifact, the compiler emits that vendor's companion test
configuration from the same `testScenario` definitions, and always runs the
simulator backend. One scenario definition therefore yields: a fast local CI
check (simulator), and a vendor-level integration check (vendor artifact + its
test config). Tests never drift from the flow because they are compiled from the
same source.

---

## 8. Testing the DSL and the vendor compilers

Section 7.5 covers how *flows authored in the DSL* are tested. This section is
about a different and equally important target: testing **the SDK itself** — the
type layer, the builder, the validator, and every vendor backend. These are the
components a flow author trusts implicitly; a bug here is a bug in every flow at
once. The testing strategy is layered, from cheapest and most-isolated to
most-integrated.

### 8.1 What is being tested, and why it is tractable

The SDK is, structurally, a compiler, and compilers are unusually testable
because every stage is a **pure function over data**: builder → `Flow` object,
`Flow` → `IR`, `IR` → validation diagnostics, `IR` → vendor artifact. No stage
needs a network, a phone call, or a vendor account to exercise. That property is
the foundation of everything below — almost the entire SDK can be tested
in-process, deterministically, in milliseconds.

The exception is the *final* hop — does the emitted artifact actually behave
correctly when a real vendor runs it — and §8.6 addresses that honestly as the
one place real vendor accounts are unavoidable.

### 8.2 Layer 1 — Unit tests: the type layer and the builder

The lowest layer tests the authoring surface in isolation.

- **Type-level tests.** The discriminated `State` union, `BaseState`, and the
  metadata/inline-code types encode rules the TypeScript compiler is supposed to
  enforce. Use a type-assertion approach (`tsd`, `expect-type`, or `@ts-expect-error`
  annotations) to prove the *negative* cases: a `TransferState` with a `retries`
  field must fail to compile; a `collect` missing `timeouts` must fail to
  compile. The strict-id machinery of §4.7 needs the same treatment and is
  arguably the highest-value type-level suite: assert that a `PromptId` is *not*
  assignable to a `StateId` (the brands must stay distinct), that a
  registry-derived union rejects an id not in the registry, that
  `Prompt.slots`/`InlineCode.reads` reject a non-`VarName`, and that the generic
  builder rejects a `to:` naming a state the flow has not declared. These tests
  guard the type layer against accidental loosening — the failure mode where a
  refactor quietly turns a branded id back into `string` and every downstream
  guarantee silently evaporates.
- **Builder tests.** The fluent builder (§4.4) is a pure transformation: given a
  sequence of calls, it must produce a specific `Flow` object. Assert on the
  resulting object structure. Cover the easy-to-get-wrong cases: builder calls
  in an unusual order, optional arguments omitted, metadata and `inlineCode`
  attached, `.fallback()` set and not set. The builder must also *reject* misuse
  loudly — e.g. two states with the same `id` — so test that it throws.

### 8.3 Layer 2 — The validator: exhaustive rule coverage

The validator (§7.2) is the SDK's single highest-value component — it is what
catches the 2 a.m. incident — so it deserves the most thorough testing. The
discipline here is **one focused test per rule, in both directions**:

- For every rule, a **passing fixture** — a minimal valid IR that the rule must
  accept — and one or more **failing fixtures** — minimal IRs that violate
  exactly that rule and nothing else.
- Assert not just *that* validation fails, but on the **specific diagnostic**:
  the right error code, the offending node id, a message a human can act on. A
  validator that fails for the wrong reason is barely better than one that does
  not fail.

Rules to cover individually: dangling `Transition.to`, unresolved prompt id,
unknown intent, undeclared `apiCall` dependency/operation, orphan/unreachable
state, undefined failure edge, missing retry or timeout policy on `collect`,
missing `onError`/`onTimeout` on `apiCall`, dependency with no success or no
failure mock, duplicate DTMF key, interpolation slot referencing an undeclared
variable, `InlineCode` reading/writing an undeclared variable,
inline-code-to-target compatibility, and the metadata `vendorHints` lint. A
**property-based** pass complements the fixtures: generate random well-formed
IRs and assert the validator accepts them, and generate IRs with one injected
defect and assert it is caught — this surfaces rule interactions the
hand-written fixtures miss.

### 8.4 Layer 3 — Vendor backends: golden-file and structural tests

Each backend is a pure `IR → artifact` function, which makes it testable without
ever touching the vendor.

- **Golden-file (snapshot) tests.** For a curated set of representative input
  IRs, commit the expected emitted artifact — the Connect contact-flow JSON, the
  Lex bot model, the Omilia artifact or interpreter config — as a checked-in
  golden file. The test recompiles and diffs. A golden diff is then a *review
  prompt*: an intended change is re-blessed, an unintended one is a caught
  regression. Keep the input IRs small and each one focused on a single feature
  (one with `inlineCode`, one with `vendorHints`, one with a `subflow`, etc.) so
  a diff points at a cause.
- **Structural assertions.** Golden files prove "the output did not change"; they
  do not prove "the output is correct." Complement them with targeted structural
  tests that assert *invariants* on the emitted artifact: every IR state produced
  a corresponding vendor block; every transition produced a matching edge; the
  Connect JSON validates against Amazon's contact-flow schema; the Lex model
  validates against the Lex import schema; emitted JSON is well-formed. These
  catch the case where the golden file was wrong and got blessed anyway.
- **Backend contract tests.** Because backends are substitutable (§5.3, Liskov),
  one shared test suite can run against *every* backend: feed each the same
  battery of IRs and assert the cross-cutting guarantees — no backend crashes on
  a valid IR, no backend silently drops a state, every backend either emits or
  explicitly rejects an `InlineCode` block per the project's mismatch policy
  (§4.6). New backends inherit this suite for free.
- **Round-trip tests, where a parser exists.** If a backend can also *read* its
  vendor format back into IR, compile → decompile → compare is a strong
  equivalence check. This is realistic for the JSON-based Connect/Lex targets;
  it may not be for Omilia, and the strategy should not depend on it.

### 8.5 Layer 4 — The simulator backend tests itself and everything upstream

The simulator backend (§7.4) is special: it is both *a component under test* and
*the test engine for authored flows*. Both facets need coverage.

- **Test the simulator as a component.** Feed it hand-built IRs with known
  correct paths and assert it walks them correctly: branches resolve on the
  right `EligibilityRule`, retries exhaust after the configured count, timeouts
  fire, `mockRequirements` are served, `InlineCode` snippets run in the sandbox
  and mutate context as declared. If the simulator is wrong, every authored-flow
  test built on it inherits that wrongness — so this is foundational.
- **Differential testing against a real backend.** The strongest check available
  without a live vendor: run the same `testScenario` through the simulator *and*
  through a real backend's emitted artifact executed in whatever local/emulated
  harness that vendor offers, and assert the observable behavior — state
  sequence, prompts played, final outcome — matches. A divergence means either
  the simulator or that backend is wrong; either way it is a real bug found
  cheaply.

### 8.6 Layer 5 — End-to-end vendor verification

This is the one layer that genuinely requires vendor accounts, and the paper is
deliberately honest that it cannot be skipped: golden files and the simulator
prove the SDK is *internally consistent*, not that the team's model of a vendor
is *correct*. Only deploying a compiled artifact to a real Connect instance, a
real Lex bot, or a real Omilia environment and placing test calls (automated
where the vendor's tooling allows) closes that gap.

Because this layer is slow, costly, and flakier than the rest, it is scoped
tightly: a small suite of representative flows, run on a schedule and before a
release rather than on every commit, gating deploys but not inner-loop
development. Its specific job is to catch what no in-process test can — a vendor
behaving differently from the backend's assumptions, an API quirk, a confidence
score that does not calibrate as expected (§7.3). Findings here usually feed back
as a corrected golden file or a new structural assertion, so a bug caught once at
this layer becomes a bug caught cheaply forever after at Layer 3.

### 8.7 What this layering buys

The shape is the standard test pyramid, and it falls out of the architecture
rather than being imposed on it: a wide base of fast, deterministic, in-process
tests (types, builder, validator, backends, simulator) because the SDK is a
pipeline of pure functions; a deliberately narrow cap of slow, real-vendor E2E
checks because that is the only thing in-process tests cannot cover. The
pure-function design (§5) is what makes Layers 1–4 cheap; the substitutable-
backend design (§5.3) is what lets Layer 4's contract suite be written once and
reused; and the honest scoping of Layer 5 keeps the expensive tests from
becoming the bottleneck. The same discipline the DSL imposes on flow authors —
fail fast, test with the code, make the escape hatch explicit — is the
discipline applied to the SDK that compiles them.

---

## 9. Worked example: the canonical turn

This ties the whole model together. The requested shape —

```
Prompt → Input → Intent/DTMF → Validation → API Call → Decision → Next State
```

— is expressed as a small cluster of reusable, typed states:

```typescript
import { prompts }      from "./prompts/card-services";   // exports PromptId union
import { intents }      from "./registry/intents";        // exports IntentName union
import { accountApi }   from "./apis/account";            // exports ApiName + OpName
import { isAuthenticated, hasActiveDispute } from "./rules/eligibility";
import { standardRetries, standardTimeouts } from "./policies";
import { queues }       from "./queues";

// Every quoted id below is a member of a registry-derived literal union or,
// for state ids, the set the builder has accumulated for THIS flow — not free
// text. A typo in any of them fails `tsc` at this call site.
export const balanceFlow = defineFlow("balance_inquiry")
  .withDependencies([accountApi])

  // 1. PROMPT + 2. INPUT + 3. INTENT/DTMF
  .collect("ask_intent", {
    prompts: ["welcome", "menuOptions"],                   // PromptId[]
    acceptedIntents: [
      { intent: "checkBalance", to: "lookup_balance" },    // IntentName + StateId
      { intent: "disputeTxn",
        to: "lookup_balance", guard: hasActiveDispute },   // 4. VALIDATION via guard
    ],
    dtmf: { "1": "lookup_balance", "0": "to_agent" },
    retries: standardRetries("to_agent"),                  // retries + fallback
    timeouts: standardTimeouts,
    emits: [{ name: "intent.recognized", payloadSchema: intentEventSchema }],
  })

  // 5. API CALL
  .apiCall("lookup_balance", {
    dependency: "accountApi",                              // ApiName
    operation: "getBalance",                               // OpName (of accountApi)
    saveAs: "balance",                                     // VarName (of FlowVars)
    onSuccess: "decide_route",
    onError: "to_agent",
    onTimeout: "to_agent",
    emits: [{ name: "api.latency", payloadSchema: latencyEventSchema }],
  })

  // 6. DECISION
  .decision("decide_route", {
    branches: [
      { when: isAuthenticated, transition: { to: "play_balance" } },
    ],
    otherwise: { to: "to_agent" },                         // 7. NEXT STATE
  })

  // 7. NEXT STATE (a): self-service answer, loops back
  .playback("play_balance", {
    prompts: ["yourBalanceIs"],                            // interpolates {balance}
    next: "ask_intent",
  })

  // 7. NEXT STATE (b): human transfer, with context handed over
  .transfer("to_agent", {
    destination: queues.cardServices,
    contextPayload: ["intent", "balance", "authStatus"],   // VarName[]
  })

  .fallback("to_agent")

  // Test scenario — compiled into both a simulator run and vendor test config
  .testScenario({
    name: "authenticated caller checks balance",
    startState: "ask_intent",
    steps: [
      { input: "intent", name: "checkBalance" },
      { input: "apiResponse", dependency: "accountApi", mockLabel: "success" },
    ],
    expectStateSequence: ["ask_intent", "lookup_balance", "decide_route", "play_balance"],
    expectOutcome: { kind: "terminal", id: "play_balance" },
  })

  .build();
```

Every field from the requirements is present: **states** (the graph),
**prompts** (referenced by id, defined once), **accepted intents** and **DTMF
options** (on the `collect` state), **retries** and **timeouts** (reused
policies), **fallbacks** (state `onExhausted` + flow `.fallback()`), **transfers**
(`to_agent` with a context payload), **API dependencies** (`accountApi`,
declared up front), **eligibility rules** (`isAuthenticated`, `hasActiveDispute`
as guards), **test scenarios** (compiled to simulator + vendor tests),
**observability events** (`intent.recognized`, `api.latency`), and **mock
requirements** (the `mockLabel: "success"` binding, served from the dependency's
declared mocks).

This single definition compiles — through the pipeline of §7 — to Connect
contact-flow JSON plus a Lex model, to an Omilia artifact or interpreter config,
and to an in-process simulator run, with no change to the flow itself.

---

## 10. Recommended build order

This is a substantial system, not a weekend library. A safe sequence:

1. **Core types + IR + validator.** The model of §4 and the §7.2 checks. This
   alone is valuable — it makes flows authorable and verifiable.
2. **Simulator backend.** Lets flows be tested end-to-end with zero vendor
   dependency. Build this *before* any real vendor backend; it de-risks
   everything else.
3. **One real backend — Connect/Lex.** The mechanizable one. Proves the IR is
   shaped right against a real target.
4. **A narrow vertical slice on the second vendor (Omilia).** One real flow, end
   to end, *including one vendor-specific feature through the escape hatch.* This
   slice answers the open question of compile-time generation vs runtime
   orchestration before the full surface is committed.
5. **Expand**: more state kinds, more backends, richer observability.

The flow-control DSL and IR are the approachable part. The genuinely hard part
is the Omilia backend (gated on their API reality), NLU confidence calibration,
a clean escape-hatch mechanism, and — if runtime orchestration is chosen —
operating a stateful service on the call path. Plan accordingly.

---

## 11. Summary

An IVR DSL embedded in TypeScript turns vendor lock-in from a rewrite problem
into a recompile problem. The DSL models the IVR as a typed state machine whose
states carry prompts, accepted intents, DTMF options, retries, timeouts,
fallbacks, transfers, API dependencies, eligibility rules, test scenarios,
observability events, and mock requirements. It is **type-safe by default and
strict by construction**: identifiers are branded or registry-derived literal
unions, the flow context is a closed declared interface, and the builder is
generic over its own state ids — so the common "wrong reference" bugs are
rejected by `tsc` at the call site. Because the DSL is ordinary TypeScript, every
definition is also a reusable, refactorable value, and runtime variables are
statically validated against the contexts that read them.

Compilation lowers the flow to a small intermediate representation, validates it
exhaustively for the whole-graph properties types cannot express, normalizes the
NLU contract, and emits per-vendor artifacts through independent backends —
Connect/Lex by direct generation, Omilia by generation or runtime orchestration
depending on what its API supports, and a simulator backend for vendor-free CI.
The honest boundary is the NLU layer: the DSL standardizes the
intent/entity/confidence *contract* and provides an escape hatch for genuinely
vendor-specific capability, rather than pretending the engines are identical.
Within that boundary, one strict, single source of truth drives every vendor —
which is exactly the vendor-agnostic SDK the design set out to build.
