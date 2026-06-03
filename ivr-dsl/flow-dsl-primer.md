# Designing a Flow DSL for a Conversational Bank IVR
### A primer for a junior developer **and** a junior product owner

---

## 0. How to read this document

This paper explains how we want to build the "brain" of a bank phone system — the thing that decides what to say to a caller and what to do next.

It is written for two readers at once:

- **The Product Owner (PO)** — you care about *what* it does, *why* it's built this way, what it enables, and what the trade-offs and risks are. Look for the **🟦 For the PO** callouts.
- **The Developer (Dev)** — you care about *how* it works, the moving parts, and the code shape. Look for the **🟩 For the Dev** callouts.

You can read straight through. The analogies are for everyone; the code blocks are safe to skim if you're on the product side.

---

## 1. The 60-second version

We are building an **IVR** (Interactive Voice Response — the automated "press 1 for balances" phone system) for a bank.

The problem: an IVR mixes three very different concerns that usually get tangled together —

1. **The conversation** ("ask the caller how much they want to send").
2. **The services** ("call the system that actually moves money").
3. **The vendors** ("…and we happen to use Acme for identity and Genesys for telephony").

When these are tangled, every small change is risky and slow, and you can't easily switch a vendor or try a smarter "AI" conversation style without rewriting everything.

**Our solution:** a small, purpose-built language (a **DSL**) that lets us describe the conversation **once**, in a clean, vendor-free way. That single description can then be run in **two different styles**:

- **Deterministic** — the classic, rock-solid "menu tree" (press 1, press 2…).
- **Probabilistic** — the modern, natural-language style ("Hi, I'd like to send $500 to my mom").

Same description. Two ways to run it. And the bank's safety rules are enforced no matter which way we run it.

---

## 2. Background — what problem are we actually solving?

> **🟦 For the PO:** Today, changing an IVR usually means a developer editing low-level vendor code. A copy change, a new menu option, or swapping a supplier can each become a multi-week project with its own QA cycle. It's also hard to experiment: we can't easily offer customers a friendlier "just tell me what you need" experience without rebuilding the whole call flow. This design fixes that by separating the *idea of the conversation* from the *plumbing*.

> **🟩 For the Dev:** Concretely, we're applying **separation of concerns** plus **ports & adapters (hexagonal architecture)**. The conversation logic becomes a declarative artifact with zero knowledge of HTTP, gRPC, telephony SDKs, or which ASR engine we bought this quarter. Vendor churn stops leaking into business logic.

### A few terms, in plain language

| Term | Plain-language meaning |
|---|---|
| **IVR** | The automated phone system that talks to callers. |
| **DSL** (Domain-Specific Language) | A tiny language built for *one* job — like how SQL exists only for databases. Ours exists only for describing call flows. |
| **SDK** | The toolkit/library developers use to write in that language. |
| **Flow** | One end-to-end customer journey, e.g. "transfer money" or "check balance." |
| **Step** | A single beat in the flow, e.g. "authenticate," "ask for amount," "confirm." |
| **Slot** | A blank on a form the conversation fills in, e.g. `amount`, `payee`. |
| **Deterministic** | Behaves like a vending machine — exact buttons, exact, repeatable result. |
| **Probabilistic** | Behaves like a helpful human who *understands* what you meant, even if you phrased it loosely. |
| **IR** (Intermediate Representation) | The neutral, written-down version of the flow that the computer actually runs. Think "a recipe written in a standard notation any cook can follow." |
| **Port / Adapter** | A port is a standard socket ("I need *an* identity service"); an adapter is the specific plug for a specific vendor ("…use Acme"). |
| **Policy** | A bank rule that must *always* hold, e.g. "never move money without an explicit confirmation." |

---

## 3. The big idea: write it once, run it many ways

The heart of the design is one sentence:

> **The flow is written once as a neutral description (the IR). Whether it runs as a rigid menu or as a natural conversation is a choice we make later — it is NOT baked into the flow.**

Analogy: think of a **screenplay**. The script says *what happens* and *what each character wants*. Whether it becomes a stage play, a radio drama, or a film is a separate production decision. The script doesn't change. Our flow is the screenplay; "deterministic" and "probabilistic" are two productions of it.

---

## 4. The three layers (progressive refinement)

We describe the system in **three layers**, each adding more detail. This matches the spirit of the **C4 model** (a way of drawing software at increasing zoom levels).

A good everyday analogy is **building a house**:

1. **Layer 1 — the floor plan**: where the rooms are and how you move between them. (No brands, no wiring details.)
2. **Layer 2 — the engineering spec**: "this wall needs an electrical circuit rated for X." (Still no specific brand.)
3. **Layer 3 — the suppliers**: "buy the wiring from this manufacturer, hire this contractor."

Or, in restaurant terms: **the menu** (Layer 1) → **the recipe** (Layer 2) → **the specific suppliers/brands** (Layer 3).

```
╔════════════════════════════════════════════════════════════════════════╗
║                   AUTHORING  —  progressive refinement                   ║
║                      (≈ C4 "zoom-in" levels)                             ║
╠════════════════════════════════════════════════════════════════════════╣
║  LAYER 1 · FLOW            ── what the caller experiences ──              ║
║  vendor- & service-agnostic                                              ║
║  ┌────────────────────────────────────────────────────────────────────┐║
║  │ slots · steps(requires/produces) · interactions · goals · policies   │║
║  │  [authenticate] → [collect_amount] → [confirm] → [execute_transfer]  │║
║  └────────────────────────────────────────────────────────────────────┘║
║                                  │ refine                                ║
║                                  ▼                                       ║
║  LAYER 2 · SERVICE BINDING   ── which capability realizes each step ──   ║
║  ports + I/O contracts (still no vendor)                                 ║
║  ┌────────────────────────────────────────────────────────────────────┐║
║  │  authenticate ──uses──▶ IdentityPort.verifyCaller                    │║
║  │  in:{ani,pin}  out:{verified,risk}  retry×2  timeout 4s  idempotent  │║
║  └────────────────────────────────────────────────────────────────────┘║
║                                  │ refine                                ║
║                                  ▼                                       ║
║  LAYER 3 · VENDOR ADAPTER    ── who actually does it ──                  ║
║  ┌────────────────────────────────────────────────────────────────────┐║
║  │ IdentityPort→acme-auth   telephony→Genesys   asr→Deepgram            │║
║  │ tts→Azure   nlu→llmPlanner(conf .7, fallback = deterministic)        │║
║  └────────────────────────────────────────────────────────────────────┘║
╚════════════════════════════════════════════════════════════════════════╝
                                   │ compile
                                   ▼
                   ┌─────────────────────────────────────┐
                   │  FLOW IR  (JSON / Protobuf)          │
                   │  = planning domain + state machine   │
                   │    + policies                        │
                   │  ──── single source of truth ────    │
                   └─────────────────────────────────────┘
```

### Layer 1 — Flow: the conversation contract

This layer knows **only about the caller**. It does not know what an API is. It declares:

- **slots** — the pieces of information the conversation needs (`amount`, `payee`).
- **steps** — each beat, with what it **requires** before it can run and what it **produces** after.
- **interactions** — *intent* to say something ("ask for the amount"), never the literal audio file or wording.
- **goal** — when the flow is considered done.
- **policies** — rules that must always hold.

```typescript
const transfer = flow('funds_transfer', (f) => {
  f.slot('payee',  t.entity('payee'))     // a blank to fill: who to pay
  f.slot('amount', t.money({ min: 1 }))   // a blank to fill: how much
  f.fact('authenticated', t.bool())       // a yes/no state we track

  f.step('authenticate', {
    intent: 'Verify the caller identity',
    produces: { authenticated: true },          // effect once done
    interaction: ask('identity.challenge'),      // abstract prompt, no wording yet
  })

  f.step('collect_amount', {
    requires: { authenticated: true },           // can't run before auth
    collects: ['amount'],
    interaction: ask('transfer.amount'),
  })

  f.step('confirm', {
    requires: { payee: present, amount: present },
    interaction: confirm('transfer.summary', ['payee', 'amount']),
  })

  f.step('execute_transfer', {
    requires: { confirmed: true },
    produces: { transferRef: t.string() },
  })

  f.goal({ transferRef: present })               // done when we have a reference
  f.path('authenticate -> collect_amount -> confirm -> execute_transfer')
  f.policy('no_money_movement_without_confirmation', requires({ confirmed: true }))
})
```

> **🟦 For the PO:** This layer is the closest thing to a "spec the business owns." It's readable, it's about the customer journey, and — importantly — it can eventually be edited in a visual tool by a non-engineer, because it's just structured data underneath.

> **🟩 For the Dev:** Notice there is no I/O here. `interaction: ask('transfer.amount')` is a *key*, not a string. Wording, language, and channel rendering are resolved downstream. `requires`/`produces` double as a planning domain (more on that in §8–9).

### Layer 2 — Service binding: ports + contracts

Now we say *which capability* realizes a step — but against an **abstract port**, not a named vendor.

```typescript
const IdentityPort = port('Identity', {
  verifyCaller: op({
    in:  t.object({ ani: t.string(), pin: t.string() }),
    out: t.object({ verified: t.bool(), risk: t.number() }),
  }),
})

bind(transfer.step('authenticate'), {
  uses: IdentityPort, operation: 'verifyCaller',
  input:  (ctx) => ({ ani: ctx.channel.callerId, pin: ctx.slot('pin') }),
  output: (res) => ({ authenticated: res.verified, riskScore: res.risk }),
  onError: { strategy: 'retry', max: 2, then: 'escalate' },
  timeoutMs: 4000,
  idempotencyKey: (ctx) => ctx.sessionId,   // safe to retry without double-charging
})
```

> **🟦 For the PO:** "Port" = a standard socket. We declare "this step needs *an* identity check that takes X and returns Y." We have NOT yet picked the supplier. That keeps us free to negotiate or switch vendors without touching the conversation.

> **🟩 For the Dev:** This is the hexagonal boundary: input/output mapping, retry/timeout/idempotency policy. The port is a typed contract; nothing here imports a vendor SDK.

### Layer 3 — Vendor adapter: the concrete binding

Finally, the real suppliers — pure adapters plus environment config.

```typescript
const acmeIdentity = adapter(IdentityPort, {
  vendor: 'acme-auth',
  verifyCaller: async (input, cfg) => {
    const r = await httpPost(`${cfg.baseUrl}/v3/verify`, input, cfg.auth)
    return { verified: r.status === 'OK', risk: r.risk_score }
  },
})

const prod = environment({
  ports:     { Identity: acmeIdentity },
  telephony: genesysAdapter(/* … */),
  asr: deepgram(/* … */),  tts: azureTts(/* … */),
  nlu: llmPlanner({ confidence: 0.7, fallback: 'deterministic' }),
})
```

> **🟦 For the PO:** Swapping a vendor is a change *only here* — it never climbs up into the conversation. That's the whole point: vendor risk is contained in one thin layer.

> **🟩 For the Dev:** Adapters translate the port contract to/from the vendor's real API. Environment wiring also selects which **engine** runs the conversation (deterministic vs probabilistic), which is the bridge to the next sections.

---

## 5. The IR — the keystone

When you compile the three layers, you get the **Flow IR**: a serializable file (JSON or Protobuf) that is the single source of truth. It contains the steps, slots, the explicit path, the goal, and the policies.

> **🟩 For the Dev:** Because the IR is plain serialized data, you can: version it, diff it in code review, snapshot-test it, simulate calls against it offline, and feed the *same* IR to two different runtime engines.

> **🟦 For the PO:** Think of the IR as the "single agreed recipe." Everyone — both engines, the test suite, and eventually a visual editor — reads the same recipe, so we don't get drift between "what we designed" and "what runs."

---

## 6. Two ways to run the same IR

The IR carries control flow in **two encodings at once**, so each engine reads the part it understands.

| IR field | Deterministic engine uses it as… | Probabilistic engine uses it as… |
|---|---|---|
| `requires` (preconditions) | a runtime assertion / guard | a planning guard (can this step fire yet?) |
| `produces` (effects) | apply to state | apply to state **and** reason forward |
| `path` (explicit edges) | **the script** | a soft hint at most |
| `goal` | reached by construction | actively **planned toward** |
| `policies` | hard check | hard constraint the planner can't route around |
| `interaction` | fixed prompt / DTMF menu | live natural-language generation |

### 6.1 Deterministic engine — the menu tree

It follows the authored edges. The flow *is* a state machine.

```
state = {}
step  = entry
while step not terminal:
    assert step.requires hold in state      # guard; else error / fallback edge
    prompt = catalog[step.interaction]       # fixed audio + DTMF / limited grammar
    input  = collectConstrained(prompt)      # digits or yes/no — exact, no probability
    state.apply(step.collects, input)
    state.apply(step.produces)               # effects become true
    enforce(policies, state)                 # hard check
    step = nextEdge(step) whose guard holds  # the AUTHORED edge decides next
```

**Trace:**
```
authenticate    → "Enter your PIN"            → 1234 → authenticated = true
collect_amount  → "Enter amount, then #"      → 500  → amount = 500
(edge amount>10000? no)
confirm         → "Send $500 to Maria, press 1" → 1  → confirmed = true
execute_transfer → "Done, reference 7781."
```

> **🟦 For the PO:** Every caller walks the identical path. It's predictable, easy to certify with auditors, and works on any phone (no speech needed). The downside: it can feel robotic and slow ("press 1… press 4… press 2…").

> **🟩 For the Dev:** Input is constrained (digits / yes-no grammar), so interpretation is exact and runs are fully reproducible. `requires` is used defensively; the graph is the truth.

### 6.2 Probabilistic engine — the natural conversation

It treats each step as an **operator**: it can fire any step whose `requires` are met, and it chooses actions that move state toward the `goal`. It uses speech recognition + language understanding (NLU/LLM) to fill slots, each with a **confidence score**.

```
state = {}
while not goal.satisfied(state):
    utterance = listen()                       # free speech
    extracted = nlu(utterance)                 # intents + slots + confidence
    state.mergeAbove(threshold, extracted)     # low confidence → confirm / re-ask
    fireable  = steps.where(requires hold in state)
    next      = planner.choose(fireable, goal, state, policies)  # policies = HARD limits
    if next.needsSlot: speak(nlg(next.interaction)); continue
    state.apply(next.produces)
    enforce(policies, state)
speak(nlg(goal.completion))
```

**Trace of the SAME flow:**
```
Caller: "Move five hundred to my mom."
   NLU → amount = 500 (conf 0.93), payee = "mom" (conf 0.70, needs resolving)
Planner: goal needs transferRef; missing authenticated, resolved payee, confirmed.
   authenticate.requires empty → fire it first → "First, let's verify you…"
payee "mom" resolved against saved payees (maybe one clarifying question)
amount already filled → it does NOT ask again
Planner CANNOT pick execute_transfer (requires confirmed)
   → must run confirm → "Send $500 to Maria — shall I go ahead?" → "yes" → confirmed
execute_transfer → "Done."
```

> **🟦 For the PO:** This feels like talking to a smart assistant. The caller can say everything in one breath and skip questions the system already understood. The trade-off: it needs guardrails, confidence handling, and a fallback when it's unsure — which we build in. It's harder to make 100% predictable, so we keep the riskiest steps deterministic (next section).

> **🟩 For the Dev:** The authored `path` is at most a prior. Ordering is decided by the planner from `requires` + `produces` + `goal`. Confidence below threshold triggers confirmation/disambiguation; repeated low confidence or out-of-scope triggers the configured `fallback` (deterministic or human handoff).

### 6.3 Why one IR is enough for both

When you author `requires:{authenticated:true}` **and** `produces:{authenticated:true}`, you have *simultaneously* given:

- the deterministic engine an assertion, and
- the probabilistic planner a precondition + effect.

No duplicate work. The `path` you write is the deterministic script *and* a hint for the planner. That's the trick that lets one definition serve two runtimes.

---

## 7. The part banks care about most: hybrid, per-step strategy

A bank will **not** run money movement on a "best guess." So the execution style is an annotation **per step**, not a single global switch:

```
authenticate     : probabilistic   (natural, voice-friendly)
collect_amount   : probabilistic
confirm          : DETERMINISTIC   (explicit "say YES" — auditable)
execute_transfer : DETERMINISTIC
```

Because both engines share the same `state` (the filled slots and facts), the handoff mid-call is seamless: the probabilistic engine gathers `amount` and `payee` from natural speech, then hands the populated state to the deterministic `confirm` step.

> **🟦 For the PO:** This is the best of both worlds — a friendly conversation for the easy parts, and a locked-down, auditable confirmation exactly where money (and risk) is involved.

> **🟩 For the Dev:** The runtime orchestrates the engine handoff; state is the shared contract, so neither engine needs to know the other ran.

---

## 8. Control flow, composition & call control

Real telephony needs more than a straight line of steps. We need sub-flows, loops, error handling, jumping between flows, transferring the call, and ending the call (whether *we* end it or the *caller* hangs up). The key insight is that these are **not all the same kind of thing** — sorting them into three categories keeps the design clean.

**The three categories**

- **A. Composition & control flow** you *author into the graph*: sub-flows, loops, jumps, error handling.
- **B. Call-control actions** the flow *performs* through the telephony port: transfer, hangup/terminate.
- **C. Asynchronous events** that happen *to* the call no matter where you are: caller hangup, line drop, no-input, no-match, timeout, transfer success/failure, barge-in (caller talks over the prompt).

**The three runtime additions they require**

1. A **call stack (frames)** — so a flow can `invoke` a sub-flow and *return*, and so errors can *bubble up* to a handler. (Serves sub-flows + errors.)
2. **Session-scoped state** above flow-local state — so you can *jump* between flows without losing identity/auth. (Serves jumps.)
3. An **event/interrupt layer** above *both* engines — global handlers for async events. It is engine-independent. (Serves category C + flow-initiated termination.)

```
            ┌────────────────────────────────────────────────┐
            │  EVENT / INTERRUPT LAYER  (engine-agnostic)      │
            │  hangup · noInput · noMatch · timeout ·          │
            │  transferDone · bargeIn       → global handlers  │
            └───────────────────────┬────────────────────────┘
                                    │ pause / resume / abort
            ┌───────────────────────▼────────────────────────┐
            │  ACTIVE ENGINE   (deterministic | probabilistic) │
            │  executes steps of the current flow              │
            └───────────────────────┬────────────────────────┘
                ┌───────────────────┴───────────────────┐
                ▼                                        ▼
    ┌─────────────────────┐                ┌──────────────────────────┐
    │ CALL STACK (frames)  │                │ SESSION STATE             │
    │ invoke ↦ push / pop   │                │ authenticated, identity,  │
    │ errors bubble upward  │                │ risk — shared across flows│
    └─────────────────────┘                └──────────────────────────┘
                                    │ all service calls
                                    ▼
                        PORTS → ADAPTERS → VENDORS
                     (Telephony port handles transfer / hangup)
```

> **🟦 For the PO:** The simple takeaway: the system can reuse pieces (sub-flows), retry safely (loops with limits), recover from failures (errors), hand the caller to a human (transfer), let the caller change their mind ("actually, my balance" → jump), and behave correctly when a call drops. None of these can break the safety rules — that's enforced below.

> **🟩 For the Dev:** The event layer sits *above* the engine; when an event fires it pauses the active engine step, runs a handler, then resumes / jumps / aborts. Both engines expose `pause`/`resume`/`abort`, which keeps event handling identical regardless of engine.

### 8.1 The constructs (with DSL sketches)

**Sub-flow** — a reusable flow called like a function (e.g. `authenticate`, reused everywhere).
```typescript
f.invoke('authenticate_flow', {
  input:  { channel: ctx.channel },
  output: (r) => ({ authenticated: r.verified, customerId: r.customerId }),
  onError: { auth_failed: goto('handle_auth_failure') },
})
```

**Loop** — bounded repetition; *never* unbounded.
```typescript
f.repeat('collect_amount', { until: { amount: present }, maxAttempts: 3,
                             onExhausted: transferTo('support_queue') })
f.forEach('payees', (item) => f.step('confirm_payee', { /* … */ }))   // iterate over data
```

**Error** — structured try/catch at step, sub-flow, flow, or session scope; unhandled errors bubble up the call stack.
```typescript
f.step('execute_transfer', {
  uses: PaymentsPort, operation: 'transfer', requires: { confirmed: true },
  onError: {
    service_unavailable: retry({ max: 2, backoff: '1s' }).then(goto('apologize_later')),
    insufficient_funds:  goto('inform_insufficient'),
    default:             escalate(),    // bubble to nearest handler
  },
})
f.onError('*', transferTo('support_queue'))   // flow-level catch-all
```
The two classic voice errors — `no_input` (caller silent) and `no_match` (couldn't understand) — are first-class, with built-in reprompt-then-escalate counters. They are literally the same mechanism as the probabilistic engine's confidence fallback.

**Call transfer** — a port-backed action; warm or blind; *carries context so the caller never repeats themselves*; can fail.
```typescript
f.transfer('to_agent', {
  type: 'warm', target: skill('fraud_team'),
  context: ['customerId', 'riskScore', 'lastIntent'],   // screen-pop for the agent
  onFailure: { queue_full: goto('offer_callback') },
})
```

**Jump between flows** — `goto` that *replaces* the current flow (no return), unlike `invoke` (which returns).
```typescript
f.jump('funds_transfer', { carry: ['authenticated', 'customerId'] })

session.globalIntents({                 // global commands / digressions
  check_balance:  jumpTo('balance_flow'),
  speak_to_human: transferTo('support_queue'),
  main_menu:      jumpTo('root'),        // deterministic equivalent = "press 9"
})
```

**Termination** — two forms: flow-initiated (a terminal step) and caller/network-initiated (an async event).
```typescript
f.step('goodbye', { interaction: inform('farewell'), then: hangup() })

session.on('hangup', (ctx) => { ctx.abortInFlight(); ctx.logDisposition('caller_hangup') })
session.on('sessionTimeout', () => transferTo('support_queue'))
```

### 8.2 How each construct behaves in the two engines

| Construct | Deterministic engine | Probabilistic engine |
|---|---|---|
| **Sub-flow** | Subroutine: push frame, run, pop, continue | Macro-operator (hierarchical planning): planned as one black-box action whose preconditions = the sub-flow's entry needs, effects = its goal |
| **Loop** | `while`-guard + counter; edge loops back to the body | Re-fires a still-eligible step until its guard clears; **max-iterations is a hard policy** so the planner must terminate |
| **Error** | Throw → unwind to nearest handler | Error becomes a *fact* in state; recovery steps match it as a precondition; unhandled → bubble + escalate |
| **Transfer** | A branching/terminal step via the Telephony port | Same port; also the natural fallback the planner picks on low confidence or policy escalation |
| **Jump** | `goto` another flow's entry; replace the frame | NLU detects a new top-level intent → planner switches the active flow |
| **Termination** | Terminal step (flow-initiated) | Same — *plus* the engine-agnostic event layer handles caller/network hangup |

### 8.3 Four safety guarantees baked into these constructs

- **No unbounded loops.** Every loop carries a `maxAttempts`/`maxIterations` that is policy-enforced, so neither engine — especially the probabilistic planner — can spin forever.
- **Hangup during money movement is safe by construction.** The confirm-before-move policy + `idempotencyKey` + a transactional `execute` + the `hangup` handler's `abortInFlight()`/compensation mean a dropped call cannot leave a half-completed or duplicated transfer.
- **Transfers preserve context.** The `context` payload (identity, risk, last intent) rides along to the agent, so the caller never re-authenticates or re-explains.
- **Jumps cannot bypass policies.** A `jump` lands the caller on a target step, but that step still enforces its own `requires` — so you physically cannot jump *past* authentication into a sensitive step. The precondition model protects jumps automatically.

> **🟦 For the PO:** This last point is worth repeating to risk/compliance: there is no "side door." However the caller navigates — natural language, menu, jump, digression — they cannot reach a protected action without meeting its preconditions. Safety is a property of the steps themselves, not of the path taken to reach them.

---

## 9. Policies & compliance — the safety floor

**Policies** are first-class declarations, *not* code comments or developer discipline. Examples:

- "No money movement without an explicit confirmation."
- "Never disclose a balance before authentication."
- "Mask PII (personal data) in all logs."
- "At most 3 retries before escalating to a human."

These compile into **hard checks for both engines**. The deterministic engine treats them as guards; the probabilistic planner treats them as constraints it literally cannot violate (it can't even *select* `execute_transfer` until `confirmed` is true).

> **🟦 For the PO:** This is how we promise auditors and risk teams that the safety rules hold *regardless* of how clever or conversational the system gets. The rules live in one place and apply everywhere.

> **🟩 For the Dev:** Treat policies as invariants injected into the planning domain and into the state-machine guards at compile time. They should also be the assertions your test suite checks against both engines.

---

## 10. End-to-end worked example (the whole journey)

Let's follow "send $500 to mom," top to bottom, hybrid mode.

1. **Layer 1 (Flow)** defines: slots `amount`, `payee`; steps `authenticate → collect_amount → confirm → execute_transfer`; goal = have a `transferRef`; policy = confirm before moving money.
2. **Layer 2 (Service binding)** maps `authenticate` to `IdentityPort.verifyCaller`, `execute_transfer` to `PaymentsPort.transfer`, etc., with retries/timeouts.
3. **Layer 3 (Vendors)** wires `IdentityPort → Acme`, telephony → Genesys, speech → Deepgram/Azure, and sets the probabilistic engine with `fallback: deterministic`.
4. **Compile → IR.**
5. **Runtime:**
   - Caller speaks naturally → **probabilistic** engine fills `amount` (high confidence) and resolves `payee`.
   - It must run `authenticate` first (precondition) → calls `IdentityPort` → adapter calls Acme.
   - It cannot run `execute_transfer` (policy needs `confirmed`) → control hands to the **deterministic** `confirm` step → "Say YES to send $500 to Maria."
   - On "yes," `confirmed = true` → `execute_transfer` calls `PaymentsPort` → adapter calls the core banking vendor → returns `transferRef`.
   - Goal satisfied → "Done, your reference is 7781."

Same IR. Two engines cooperating. Vendor calls isolated at the bottom. Policy enforced throughout.

---

## 11. Trade-offs — a quick decision guide

| Question | Deterministic | Probabilistic | Hybrid (recommended) |
|---|---|---|---|
| Predictable / auditable? | ★★★ | ★ | ★★★ for the sensitive steps |
| Natural / fast for the caller? | ★ | ★★★ | ★★★ for the easy steps |
| Works without speech (any phone)? | ★★★ | ★ | depends on step |
| Effort to get safe in production | low | higher (needs guardrails) | medium |
| Best for | menus, legal confirmations | intent capture, slot filling | most real bank flows |

> **🟦 For the PO:** The realistic default is **hybrid**: conversational where it delights the customer, deterministic where it protects the bank.

---

## 12. SDK decomposition & compilation pipeline

The conceptual layers (§4) describe *what* the system separates. This section describes *how it is packaged and built* — and the shape it takes is a well-known one: a **compiler / transpiler architecture**. One language, one intermediate representation, many backends. It is the same structure as LLVM (a single IR with many target backends) and, at the modeling level, exactly OMG's MDA *model-to-platform transformation*. Naming it "a compiler" matters, because every hard problem here already has a proven solution in compiler design.

### 12.1 The five components

| Component | What it is (compiler analogy) | Contains | Maps to |
|---|---|---|---|
| **Core DSL SDK** | the language + type system (front-end grammar) | flows, steps, slots, attributes, decisions, prompts, variables, transitions, conditions, events, policies | the Layer 1 vocabulary (Appendix B) |
| **Binding SDK** | the back-end interface | one binding *contract per DSL entity* a target must satisfy | the Ports concept, generalized to every entity |
| **Flow Authoring Layer** | the source programs | the actual authored journeys (welcome, auth, transfer…) | Layer 1 flow instances |
| **Compiler / Engine SDK** | front-end + IR + middle + back-ends + packaging | parse → IR → validate/lower → emit per target | the IR (§5) + code generators |
| **Vendor Runtime** | the target machine | executes the emitted artifact | Layer 3 execution |

### 12.2 The pipeline

```
   INPUTS                       COMPILER / ENGINE SDK                        OUTPUTS / RUNTIMES
   ──────                       ─────────────────────                        ──────────────────
┌──────────────────┐
│ CORE DSL SDK      │ defines the
│ language + types  │ legal concepts
│ (Appendix B)      │───────────┐
└──────────────────┘            │
                                ▼
┌──────────────────┐     ┌───────────────────────────────────────────────┐
│ FLOW AUTHORING    │     │ FRONT-END   parse authored flows → AST          │
│ authored flows    │────►│        │                                        │
│ (source)          │     │        ▼                                        │
└──────────────────┘     │   ┌─────────────────────────┐                   │
                         │   │        FLOW IR           │  single source    │
                         │   │  state machine +         │  of truth         │
                         │   │  planning domain +       │                   │
                         │   │  policies                │                   │
                         │   └────────────┬────────────┘                   │
                         │                ▼                                 │
                         │   MIDDLE  validate · capability-check · lower    │
                         │                │                                 │
                         │                ▼                                 │
┌──────────────────┐     │   BACK-ENDS  (one per target, via Binding SDK)   │
│ BINDING SDK       │────►│   ┌─────────┬─────────┬─────────┬────────────┐  │
│ per-entity        │each │   │ Genesys │ Amazon  │ Omilia /│  CUSTOM     │  │
│ backend contract  │back-│   │Architect│ Connect │  CCAI   │  RUNTIME    │  │
│ (Visitor)         │end  │   └────┬────┴────┬────┴────┬────┴─────┬──────┘  │
└──────────────────┘imps └────────┼─────────┼─────────┼──────────┼─────────┘
                                   ▼         ▼         ▼          ▼
                              ┌────────┐┌─────────┐┌────────┐┌───────────────┐
                              │Genesys ││ Connect ││Omilia /││ YOUR dual-     │
                              │runtime ││ runtime ││ CCAI   ││ engine runtime │
                              │(det)   ││ (+Lex)  ││ (NLU)  ││ (det + prob)   │
                              └────────┘└─────────┘└────────┘└───────────────┘
```

### 12.3 The Binding SDK is a Visitor over the IR

A binding contract *per entity* is the right granularity, and it has a clean implementation: each vendor back-end is a **Visitor** that knows how to emit every IR node type — a step, a decision, a prompt, a transition. This gives one enforceable rule: **when the Core DSL gains a new entity, the Binding SDK gains a new contract method, and every back-end must either implement it or formally declare it unsupported.** The compiler refuses to build a back-end that would silently ignore a node.

### 12.4 The fork: transpile vs. your own runtime

Two deployment strategies live in the same architecture, and the key realization is that **your own runtime is just one back-end among many**:

- **Transpile to a vendor** → emit native artifacts (Genesys Architect, Amazon Connect flows, Omilia, CCAI) that run on the *vendor's* runtime. You operate nothing; you inherit the vendor's capabilities and limits.
- **Emit to your custom runtime** → the only target where the full **per-step deterministic + probabilistic hybrid** from §6–7 actually runs, because you control the engine.

So deterministic vs. probabilistic becomes a **target capability**: a menu-style target compiles to deterministic artifacts; an NLU/LLM target compiles to probabilistic ones; only the custom-runtime back-end gives you both per step. The dual-engine design is therefore the *spec for your richest back-end* and the *semantic reference* the others approximate.

### 12.5 The capability matrix (the part that makes multi-vendor safe)

Targets are genuinely different machines, so not every DSL construct maps to every one. Each back-end declares a **capability profile**, and a compiler pass **validates the authored flow against the chosen target** before emitting — either rejecting unsupported constructs or *lowering* them to a supported approximation (e.g. an LLM slot-fill becomes a fixed prompt + grammar).

*Illustrative template — verify the actual cells per vendor and version:*

| DSL feature | Genesys Architect | Amazon Connect | Omilia / CCAI | Custom runtime |
|---|---|---|---|---|
| Deterministic menu / DTMF | ✓ | ✓ | ✓ | ✓ |
| NLU slot-filling | partial | ✓ (Lex) | ✓ | ✓ |
| Probabilistic planner | ✗ | ✗ | partial | ✓ |
| Sub-flows (invoke/return) | ✓ | ✓ | depends | ✓ |
| Jumps between flows | ✓ | ✓ | ✓ | ✓ |
| Per-step hybrid engine | ✗ | ✗ | ✗ | ✓ |
| Policies as hard invariants | partial | partial | partial | ✓ |
| Call transfer / hangup | ✓ | ✓ | ✓ | ✓ |

Recommended stance: keep the DSL **fully expressive** and let each back-end report what it can't honor — rather than shrinking the language down to the weakest vendor (the lowest-common-denominator trap).

### 12.6 Two operational rules of "author once, deploy many"

- **Generated artifacts are build outputs, not source.** Nobody hand-edits the emitted Genesys/Connect config, or the author-once guarantee is lost. CI regenerates from the DSL; downstream patching is forbidden by process.
- **Per-target conformance testing.** Compile one authored flow to every target and run the same behavioral suite against each, asserting equivalence *within that target's capability profile*. That is what makes "deploy across vendors without changing the design" actually true.

> **🟦 For the PO:** This is the business case made concrete: design and sign off a journey *once*, then ship it to whichever vendor a given market or client requires. Switching vendors becomes a recompile, not a redesign — and the capability matrix tells you up front what each vendor can and can't do, before you promise it to a client.

> **🟩 For the Dev:** Treat it like any cross-compiler: stable IR, a back-end SDK with a conformance test kit, capability profiles as data, and lowering passes for graceful degradation. Start with two back-ends (your custom runtime + one vendor) to force the IR and Binding SDK to be genuinely target-neutral early.

---

## 13. FAQ

**Is the "probabilistic" engine just ChatGPT answering freely?**
No. The language model is fenced inside the IR: it can only fill declared slots and select declared steps whose preconditions are met, and it can never violate a policy. It plans *within* rails we defined.

**If we add a new vendor, what changes?**
Only a Layer-3 adapter and some config. The conversation (Layer 1) and the contracts (Layer 2) are untouched.

**Can a non-engineer change the flow?**
Eventually yes — because Layer 1 compiles to plain data (the IR), a visual editor can read and write the same IR a developer would.

**How do we test that both engines behave?**
Run the same scenario suite against both engines and assert that both stay within the policies and reach the same goal. Equivalence-within-policy is the bar.

**If a caller jumps around or asks for something mid-flow, can they skip a security step?**
No. Jumps, transfers, and digressions all land on a *step*, and every step enforces its own preconditions (`requires`). There is no path that reaches a protected action without satisfying that action's guards.

---

## 14. Suggested next steps

1. **Lock the IR schema** (JSON/Protobuf) — it constrains everything else.
2. **Define the engine contract** both runtimes implement (so they're swappable per step), including `pause`/`resume`/`abort` for the event layer.
3. **Build the deterministic engine first** — simplest, certifiable, gives a working IVR fast.
4. **Add the runtime backbone**: call stack (for sub-flows + error bubbling), session-scoped state (for jumps), and the event/interrupt layer (hangup, no-input, no-match, timeout, transfer outcomes).
5. **Layer in the probabilistic engine** behind confidence + fallback.
6. **Codify policies + an equivalence test suite** before going near production money movement.
7. **Define the Binding SDK back-end interface and a capability profile per target** — then build two back-ends (your custom runtime + one vendor) so the IR is forced to stay target-neutral from day one.

---

## Appendix A — Glossary (one line each)

- **IVR** — automated phone system that talks to callers.
- **DSL** — a tiny language for one job (ours: describing call flows).
- **Flow** — one customer journey (e.g. transfer money).
- **Step** — one beat in a flow.
- **Slot** — a blank the conversation fills (e.g. amount).
- **Fact** — a tracked yes/no state (e.g. authenticated).
- **IR** — the neutral, compiled, runnable version of the flow.
- **Deterministic** — fixed menu-tree execution.
- **Probabilistic** — natural-language, planner-driven execution.
- **Port** — an abstract "socket" for a capability.
- **Adapter** — the concrete plug for a specific vendor.
- **Policy** — an always-true bank rule, enforced by both engines.
- **Goal** — the condition that means the flow is complete.
- **Planner** — the part of the probabilistic engine that decides the next step from preconditions, effects, and the goal.
- **Sub-flow** — a reusable flow called from another and returned from, like a function.
- **Invoke vs Jump** — *invoke* calls a flow and comes back; *jump* switches to another flow and does not return.
- **Call stack (frame)** — runtime structure that tracks invoked sub-flows and lets errors bubble up.
- **Session state** — facts shared across all flows in a call (e.g. authenticated), so jumps don't lose context.
- **Event / interrupt layer** — engine-agnostic handlers for things that happen *to* the call (hangup, no-input, no-match, timeout, transfer outcomes, barge-in).
- **Transfer (warm/blind)** — handing the call to a human/queue; *warm* briefs the agent, *blind* drops the caller in directly.
- **Barge-in** — the caller speaking over a prompt before it finishes.
- **Idempotency key** — a token that makes a retried service call safe (no double charge / double transfer).

---

## Appendix B — Layer 1 element catalog (the complete vocabulary)

This is the full set of elements that may appear in **Layer 1**. One rule governs the entire list:

> **Layer 1 describes the caller's experience and the flow's data/decision needs in the abstract. Anything concrete — a service, a vendor, literal wording, an API field, a phone number — is only *named* here and *bound* in Layers 2–3.**

The **Resolution** column says where each element is fully resolved: *pure L1* (lives and dies in Layer 1), or *declared L1 → bound L2/L3* (named here, wired below).

> **🟦 For the PO:** Treat this as the menu of building blocks a flow is made of. You won't use all of them in every flow, but every flow is assembled from this list — nothing else.

> **🟩 For the Dev:** This doubles as the checklist for the IR schema. Each row is a node type (or annotation) the compiler must accept and the engines must interpret.

### B.1 Flow container & lifecycle
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| `flow` | top-level container for one journey | `flow('funds_transfer', …)` | pure L1 |
| metadata | name, version, description, category | `meta({ version:'1.3', category:'payments' })` | pure L1 |
| `entry` | where the flow starts | `entry('authenticate')` | pure L1 |
| params (inputs) | data passed in when invoked as a sub-flow | `params({ channel, locale })` | pure L1 |
| returns (outputs) | what the flow hands back to its caller | `returns(['transferRef'])` | pure L1 |
| `goal` | success / completion criteria | `goal({ transferRef: present })` | pure L1 |
| scope | flow-local vs session-shared state | `scope: 'session'` | pure L1 |

### B.2 State & data
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| `slot` | typed value collected from the caller | `slot('amount', t.money())` | caller-sourced |
| `fact` | tracked boolean / derived state | `fact('authenticated', t.bool())` | produced |
| `attr` (attribute) | a decision input with provenance | `attr('riskScore', enum, {source:'service'})` | caller / context / computed / **service→bound** |
| types | the type system | money, date, phone, accountRef, enum, entity, list, object | pure L1 |
| validation | constraints on a value | `t.money({ min:1, max:50000 })` | pure L1 |
| default | fallback value | `default(0)` | pure L1 |
| computed | pure derivation over other attrs | `computed(s => s.amount > 10000)` | pure L1 |
| context | ambient channel data | `ctx.callerId`, `ctx.locale`, `ctx.time` | context-sourced |
| config ref | abstract config value | `config('daily_limit')` | value bound L2/L3 |

### B.3 Step types
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| collect | ask for and capture a slot | `step.collect('amount')` | prompt L1; capture by engine |
| `decide` | multi-way branch on guards | `decide({ when…: goto…, else })` | pure L1 |
| `confirm` | read back + get yes/no | `confirm('summary', [...])` | pure L1 |
| `inform` | say something, no capture | `inform('balance_is', ['balance'])` | prompt L1 |
| `action` | trigger an abstract capability | `action('Payments.transfer')` | declared L1 → bound L2/L3 |
| `invoke` | call a sub-flow (returns) | `invoke('authenticate_flow')` | pure L1 |
| `jump` | switch flow (no return) | `jump('balance_flow')` | pure L1 |
| `transfer` | hand call to human / queue | `transfer(skill('fraud'))` | declared L1 → bound L2/L3 |
| `hangup` | end the call | `hangup('done')` | declared L1 → bound L2/L3 |
| `wait` | pause / hold / "processing" | `wait('processing')` | declared L1 → bound L2/L3 |
| `set` | assign a fact / slot | `set({ confirmed: true })` | pure L1 |
| checkpoint | analytics marker (no-op) | `checkpoint('reached_confirm')` | pure L1 |

### B.4 Interaction elements (what the caller experiences — abstractly)
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| prompt intent | abstract thing to say | `ask('transfer.amount')` | wording bound downstream |
| variables | interpolate data into a prompt | `inform('balance_is', ['balance'])` | pure L1 |
| choice set / menu | options the caller picks from | `choices(['checking','savings'])` | rendering bound (DTMF/NLU) |
| expected response | shape we expect | `expect: 'choice' \| 'number' \| 'yesno' \| 'free'` | pure L1 |
| expected intents | what the caller might mean | `intents(['transfer','balance'])` | NLU bound L3 |
| reprompt | what to say on no-input/no-match | `reprompt('didnt_catch', { max:2 })` | pure L1 |
| confirmation style | explicit vs implicit | `confirm: 'explicit'` | pure L1 |
| barge-in | may the caller interrupt the prompt | `bargeIn: true` | behavior bound by engine/telephony |
| locale | language set for this interaction | `locale: 'es-CO'` | pure L1 |

### B.5 Control flow
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| `path` / edges | explicit ordering (det script / planner prior) | `path('a -> b -> c')` | pure L1 |
| guard | condition on a transition | `when({ amount: '>10000' })` | pure L1 |
| `requires` | preconditions for a step | `requires:{ authenticated:true }` | pure L1 |
| `produces` | effects after a step | `produces:{ authenticated:true }` | pure L1 |
| `repeat` | bounded loop | `repeat(body, { until, maxAttempts })` | pure L1 |
| `forEach` | iterate over a collection | `forEach('payees', body)` | pure L1 |
| invoke / return | sub-flow call & return | see B.3 | pure L1 |
| background | fetch in parallel while prompting | `background(action('lookup'))` | action bound L2 |
| terminal | success / failure / abandon ends a flow | `terminal('success')` | pure L1 |

### B.6 Actions & triggers (abstract capabilities)
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| service action | call an abstract capability | `action('Accounts.getBalance')` | declared L1 → bound L2/L3 |
| notify | send a message to the customer | `notify('sms.transfer_done')` | declared L1 → bound L2/L3 |
| audit / log | record a business / audit event | `audit('transfer_initiated')` | declared L1 → bound L2/L3 |
| emit event | raise a business event | `emit('fraud_suspected')` | declared L1 → bound L2/L3 |
| write-back | update a record | `action('Profile.update')` | declared L1 → bound L2/L3 |

### B.7 Call-control actions (the telephony "IVR actions")
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| transfer (warm/blind) | to agent / queue / number, with context | `transfer({ type, target, context })` | bound telephony L2/L3 |
| hangup / terminate | end the call | `hangup(reason)` | bound L2/L3 |
| hold / resume | put caller on hold | `hold()` / `resume()` | bound L2/L3 |
| play media | announcement / audio | via `inform` | bound TTS/audio |
| collect DTMF | gather digits | via `collect` (deterministic render) | bound L2/L3 |
| record | start/stop compliance recording | `record({ consent:true })` | bound + policy |
| send DTMF | drive a downstream IVR | `sendDtmf('123#')` | bound L2/L3 |
| callback | offer / schedule a callback | `offerCallback()` | bound L2/L3 |

### B.8 Events, interrupts & digressions (declared as handlers)
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| `onHangup` | caller / network disconnect | `on('hangup', cleanup)` | session scope |
| `onNoInput` | caller silent | `on('noInput', reprompt)` | step / flow |
| `onNoMatch` | not understood | `on('noMatch', reprompt)` | step / flow |
| `onTimeout` | step / session inactivity | `on('timeout', …)` | scope |
| `onTransferDone` / `onTransferFailed` | transfer outcome | `on('transferFailed', goto)` | scope |
| `onBargeIn` | caller interrupts a prompt | `on('bargeIn', …)` | step |
| globalIntents / digression | global commands that interrupt & may resume | `globalIntents({ … })` | session |
| limits | hard call / turn caps | `limit({ maxDuration:'8m', maxTurns:40 })` | policy |

### B.9 Error handling
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| error taxonomy | categories: `no_input`, `no_match`, `validation_failed`, `auth_failed`, `service_unavailable`, business errors | — | pure L1 taxonomy |
| `onError` | handler at step / sub-flow / flow scope | `onError({ auth_failed: goto('retry') })` | pure L1 |
| retry policy | abstract retry-then-escalate | `retry({ max:2, then: escalate })` | L1 (timing/IO bound L2) |
| fallback | where to go when stuck | `fallback: 'deterministic' \| transfer` | pure L1 |
| `raise` | throw a custom error | `raise('limit_exceeded')` | pure L1 |
| recovery step | a normal step gated on an error fact | `requires:{ 'error.kind':'service_unavailable' }` | pure L1 |

### B.10 Policies, limits & compliance
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| invariant | rule that must always hold | `policy('no_move_without_confirm')` | enforced by **both** engines |
| limit | numeric cap (retries, loops, duration, amount) | `policy({ maxRetries:3 })` | enforced |
| authorization | per-step access requirement | `requires:{ authenticated:true, riskScore:'low' }` | pure L1 |
| consent | capture required consent | `consent('recording')` | L1 + action |
| PII handling | masking / redaction directive | `pii(['pin','ssn'])` | enforced downstream |
| confidence threshold | min confidence for the probabilistic engine | `policy({ minConfidence:0.7 })` | prob engine |
| allowed digressions | which global jumps are permitted where | `policy({ allowDigression:['main_menu'] })` | pure L1 |

### B.11 Outcomes, dispositions & analytics
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| outcome | terminal classification | `terminal('success' \| 'failed' \| 'abandoned')` | pure L1 |
| disposition code | reporting label for the call | `disposition('transfer_completed')` | analytics |
| KPI checkpoint | funnel / analytics marker | `checkpoint('auth_passed')` | analytics |
| reason code | why a path was taken | `reason('high_value_review')` | analytics |

### B.12 Cross-cutting metadata
| Element | What it is | Sketch | Resolution |
|---|---|---|---|
| version | flow version | `meta({ version:'1.3' })` | pure L1 |
| locales | supported languages | `locales(['en','es-CO'])` | pure L1 |
| channels | voice / chat reuse | `channels(['voice'])` | pure L1 |
| A/B variant | experiment marker | `variant('confirm_v2')` | pure L1 |
| tags / category | routing & search | `tags(['payments','high-risk'])` | pure L1 |
| step strategy | per-step deterministic/probabilistic hint | `strategy: 'deterministic'` | engine selection |

### B.13 The one consistency check that ties it together
At compile time the IR is validated so that **every concrete-bound element actually has a binding**: each `attr` with `source:'service'`, each `action`, each `transfer`/`notify`/`audit`, and each `config` must be wired in Layer 2 (and through to Layer 3). A missing binding is a build error — Layer 1 can *name* a need, but it can never be shipped *unfulfilled*.

---

## Appendix C — How the DSL artifacts interact

### C.1 Artifact interaction across the three layers

This shows the **artifacts** the DSL produces (not the runtime) and how they reference, bind, implement, and compile into one another. The golden rule again: Layer 1 only *names* things; the lower-layer artifacts *satisfy* those names.

```
                          ┌─────────────── LAYER 1 (agnostic) ───────────────┐
                          │  FLOW definition artifact                         │
                          │   steps · slots · attrs · decisions               │
                          │   interactions = prompt KEYS                      │
                          │   goals · policies                                │
                          └───────────────────┬───────────────────────────────┘
                              declares by NAME only:
                              attributes · actions · prompt keys
                                              │
            ┌──────────────────────────────────┼──────────────────────────────────┐
            ▼                                  ▼                                  ▼
 ┌────────────────────┐        ┌──────────────────────────────┐     ┌────────────────────────┐
 │ PROMPT CATALOG      │        │  SERVICE BINDINGS   (LAYER 2) │     │  PORT CONTRACTS  (L2)   │
 │ key → text / SSML   │        │  step  → port.operation      │ ───►│  Identity · Payments ·  │
 │ resolved per locale │        │  attr  ← port.output.field   │ ref │  Telephony  (typed I/O) │
 └─────────┬──────────┘        │  input / output maps         │     └────────────▲───────────┘
           │                    │  retry · timeout · idempotency             implements
           │                    └───────────────┬──────────────┘     ┌────────────┴───────────┐
           │                                    │                    │  VENDOR ADAPTERS  (L3)  │
           │                                    │                    │  acme-auth · Genesys ·  │
           │                                    │                    │  Azure TTS · Deepgram   │
           │                                    │                    └────────────▲───────────┘
           │                                    │                              wires │
           │                                    │                    ┌────────────┴───────────┐
           │                                    │                    │  ENVIRONMENT CONFIG (L3)│
           │                                    │                    │  ports → adapters       │
           │                                    │                    │  prompt keys → TTS      │
           │                                    │                    │  ENGINE select det|prob │
           │                                    │                    └─────────────────────────┘
           └──────────────────┬──────────────────┘
                              ▼  COMPILE   (fails if any declared name is unbound)
                  ┌───────────────────────────────┐
                  │            FLOW IR             │   ← single source of truth
                  │  state machine + planning      │
                  │  domain + policies             │
                  └───────────────┬───────────────┘
                                  ▼ consumed by
                  ┌───────────────────────────────┐        ┌────────────────────────┐
                  │     ACTIVE ENGINE  (det|prob)  │◄───────│  EVENT LAYER            │
                  └───────────────┬───────────────┘        │ hangup·noInput·timeout  │
                                  ▼ at runtime, calls       └────────────────────────┘
                      PORTS → ADAPTERS → VENDORS
```

Reading it: the **Flow artifact** declares names → **Service bindings** connect those names to **Port contracts** → **Vendor adapters** implement the ports → **Environment config** wires ports to adapters, prompt keys to a TTS vendor, and picks the engine. The **compiler** fuses Flow + Bindings + Policies into the **IR**, failing the build if any declared name is unbound. At runtime a single **engine** interprets the IR, with the **event layer** above it and **ports → adapters → vendors** below.

> **🟦 For the PO:** Each box is something a different person can own. A conversation designer owns the Flow artifact; an integration engineer owns the bindings and adapters; ops owns the environment config. They can work in parallel, and the compiler guarantees the pieces actually fit before anything ships.

### C.2 A simple welcome flow — which artifact each line is

Here is the smallest realistic flow (greet → capture what they want → route), with every line tagged to its element category from Appendix B.

```
flow('welcome', f => {                              ◄ B.1  flow container
  f.meta({ version:'1.0', category:'entry' })       ◄ B.12 metadata
  f.entry('greet')                                  ◄ B.1  entry point

  f.attr('locale',    t.string(),     {source:'context'})    ◄ B.2  context attribute
  f.attr('timeOfDay', t.enum('am','pm'),{source:'context'})  ◄ B.2  context attribute
  f.attr('greeting',  t.string(),                            ◄ B.2  computed attribute
         { computed: s => greetingFor(s.timeOfDay) })

  f.step('greet', {                                 ◄ B.3  inform step
    interaction: inform('welcome.greeting',         ◄ B.4  prompt intent (key)
                        ['greeting']),              ◄ B.4  prompt variable
    then: 'capture_intent',                         ◄ B.5  transition / edge
  })

  f.step('capture_intent', {                        ◄ B.3  collect step
    collects: ['intent'],                           ◄ B.2  slot
    interaction: ask('welcome.menu'),               ◄ B.4  prompt intent
    expect: 'choice',                               ◄ B.4  expected response
    intents: ['balance','transfer','agent'],        ◄ B.4  expected intents
  })

  f.decide('route', {                               ◄ B.3  decide step
    when({ intent:'balance'}):  jump('balance'),    ◄ B.3  jump
    when({ intent:'transfer'}): jump('transfer'),   ◄ B.5  guard + jump
    when({ intent:'agent'}):    transfer(skill('cs')), ◄ B.7 call-control action
  })

  f.onNoInput(reprompt('welcome.repeat', { max:2 }))◄ B.8  event handler
  f.onHangup(ctx => audit('abandoned_at_welcome'))  ◄ B.8  event handler + B.6 audit
  f.policy({ maxNoInput:2, then: transfer(skill('cs')) }) ◄ B.10 limit / policy
  f.goal({ routed:true })                           ◄ B.1  goal
})
```

And the key insight — a simple flow is *almost entirely* pure Layer 1; only a handful of concrete bits ever reach Layers 2–3:

```
WHAT ACTUALLY BINDS DOWN (everything else is pure Layer 1)

  prompt key 'welcome.greeting'  ──L3──►  TTS vendor renders audio per locale
  attr 'locale' / 'timeOfDay'    ──L3──◄  Telephony context (ANI / SIP / clock)
  step 'capture_intent'          ──L3──►  deterministic → DTMF menu
                                          probabilistic → NLU intent match
  transfer(skill('cs'))          ─L2/L3►  Telephony port → telephony vendor

  PURE LAYER 1 (no binding):  flow · meta · entry · computed attr · decide ·
                              edges · jumps · goal · event handlers · policy
```

> **🟩 For the Dev:** Notice the greeting's *wording* never appears in the flow — `inform('welcome.greeting', ['greeting'])` is a key plus a variable. The literal phrasing (and its localization and SSML) lives in the prompt catalog and is rendered by the TTS adapter, so changing copy or language touches zero flow code.

> **🟦 For the PO:** This is why a "simple change" really is simple here: re-wording the welcome message is a prompt-catalog edit, switching the speech vendor is an adapter swap, and turning the menu from "press 1" into "just tell me what you need" is an engine setting — none of which require rewriting the welcome flow itself.


