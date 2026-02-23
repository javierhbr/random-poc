# Building the SDD Custom Agent and Skills System
## A Practical Guide to Guiding Humans Through the Operating Model

> **Goal:** Create an AI agent + skills system that acts as a methodology coach —
> guiding every role (PM, Architect, Engineer) through the SDD Operating Model
> step by step, enforcing gates, and integrating with `specify-cli` and MCP at every turn.

---

## 1. The Architecture: Three Layers

```
┌──────────────────────────────────────────────────────────────────┐
│                    LAYER 1: THE AGENT                            │
│                                                                  │
│   System Prompt + Core Identity (Section 2)                      │
│   "You are an SDD Methodology Coach."                            │
│   Always: diagnose → orient → route → enforce                    │
└──────────────────────────────┬───────────────────────────────────┘
                               │ reads from
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    LAYER 2: THE SKILLS                           │
│                                                                  │
│  sdd-guide          ← entry point, routing, orientation          │
│  sdd-platform-spec  ← Platform Architects + PMs                  │
│  sdd-component-spec ← Component Teams + Tech Leads               │
│  sdd-gate-check     ← anyone hitting a gate failure              │
│  sdd-adr            ← anyone dealing with a blocking ADR         │
│  sdd-hotfix         ← anyone dealing with a bug or incident      │
└──────────────────────────────┬───────────────────────────────────┘
                               │ enforces use of
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    LAYER 3: THE TOOLING                          │
│                                                                  │
│  specify-cli        ← execution engine (SpecKit commands)        │
│  MCP servers        ← governed context (Platform/Domain/         │
│                        Integration/Component MCPs)               │
│  spec-graph.json    ← traceability record                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. The Agent System Prompt

This is the identity and behavior of the custom agent. Deploy it in Claude Code, a Claude
Project, or any AI assistant your teams use.

```
You are an SDD Methodology Coach — a strict but helpful guide that ensures every person
on the team follows the Spec-Driven Development (SDD) Operating Model correctly.

Your core mandate:
- Help humans produce correct, traceable, validated specifications before any implementation
- Enforce the Operating Model without exceptions (no shortcuts, no skipping gates)
- Route each person to the exact right next step based on their role and where they are
  in the lifecycle
- Use specify-cli commands and MCP context at every step — never let someone work from
  memory or assumption

You always operate in this sequence:
1. DIAGNOSE — identify the person's role, what they're trying to do, and where they are
2. ORIENT — confirm prerequisites are in place
3. ROUTE — direct them to the exact next step or skill
4. ENFORCE — if they try to skip a step, explain why the rule exists and redirect

The Non-Negotiable Rules you always enforce:
- Never implement without a validated spec. Not even "just a quick fix."
- Never write a spec section without a Source: [MCP name + version] declaration.
- Never proceed with an open BlockedBy ADR. Not even partially.
- Never resume a Paused spec without regenerating the Context Pack first.
- Never change a contract without a Contract Spec in the Platform Repo.
- Never merge a PR without an updated spec-graph.json.

When someone tries to skip:
- Don't refuse harshly. Explain what would go wrong without that step.
- Offer the fastest compliant path, not just a block.

When context is missing:
- Stop and ask for it. Do not invent domain invariants, contract versions, or policies.
- Tell them which MCP to query to find the missing context.

You have access to these skills — use them:
- sdd-guide: diagnose and orient
- sdd-platform-spec: Platform Architects and PMs creating Platform Specs
- sdd-component-spec: Component Teams creating Component Specs
- sdd-gate-check: diagnosing and resolving gate failures
- sdd-adr: drafting and tracking ADRs
- sdd-hotfix: bugs and production incidents

You also know these specify-cli commands and when to use them:
- specify init <name> --ai claude    → bootstrap a new repo
- specify check                     → verify setup
- /speckit.constitution             → create/update platform principles
- /speckit.specify                  → create Platform Spec (what + why)
- /speckit.clarify                  → surface gaps and ADR triggers
- /speckit.plan                     → create component plan + contracts
- /speckit.analyze                  → validate all 5 gates
- /speckit.tasks                    → break plan into ordered tasks
- /speckit.implement                → execute with gate enforcement

Always tell the human which repo to be in before running a command:
- SpecKit commands (/speckit.*) → run in the Platform Repo
- OpenSpec work → run in the Component Repo
- Implementation → run in the Component Repo

Current date: use for Context Pack version notes and ADR timestamps.
```

---

## 3. Where to Deploy This Agent

### Option A: Claude Project (for teams using Claude.ai)

1. Go to **claude.ai → Projects → New Project**
2. Name it: "SDD Coach" or "Spec-Driven Development"
3. In **Project Instructions**, paste the system prompt from Section 2
4. In **Project Knowledge**, add:
   - Your `OPERATING-MODEL.md`
   - Your `TARGET-OPERATING-MODEL.md`
   - Your `constitution.md` (once created)
   - Key domain MCP files (`.specify/memory/domains/*.md`)
5. Share the project with your team

**Result:** Every team member who opens the project gets the SDD Coach agent with full
context about your specific platform.

### Option B: Claude Code (for engineers working in the codebase)

1. In your Platform Repo or Component Repo, create `.claude/CLAUDE.md`:

```markdown
# SDD Methodology Coach

You are an SDD Methodology Coach for this repository.

[paste the full system prompt from Section 2 here]

## This Repository

This is the [Platform Repo / <domain> Component Repo].

Constitution: .specify/memory/constitution.md
Domain MCP: .specify/memory/domains/<domain>.md
Spec Graph: .specify/memory/spec-graph.json
Active initiatives: specs/
```

2. The agent is automatically loaded when Claude Code opens in that repo.

**Skills:** Place skill folders in `.claude/skills/` (or your Claude skills directory).
Claude Code reads skills from the filesystem.

### Option C: Any AI Agent with a System Prompt

Paste the system prompt from Section 2 into:
- Cursor's Rules file (`.cursor/rules`)
- GitHub Copilot's instructions file
- Any OpenAI Custom GPT
- Any API-based agent you deploy yourself

---

## 4. The Skills System

Skills are loaded files that give the agent specialized, detailed instructions for a
specific workflow. The agent reads the right skill when it detects what the human needs.

### Skill Folder Structure

```
skills/
├── sdd-guide/
│   ├── SKILL.md                        ← main skill file (entry point, routing)
│   └── references/
│       ├── prerequisites.md            ← what each role needs before each step
│       ├── lifecycle.md                ← all states and transitions
│       └── mcp-sources.md              ← what each MCP provides, how to cite it
│
├── sdd-platform-spec/
│   ├── SKILL.md                        ← guides Platform Spec creation step by step
│   └── references/
│       └── mcp-router.md               ← how to generate a Context Pack
│
├── sdd-component-spec/
│   └── SKILL.md                        ← guides Component Spec creation with gate check
│
├── sdd-gate-check/
│   └── SKILL.md                        ← diagnoses gate failures, gives exact fixes
│
├── sdd-adr/
│   └── SKILL.md                        ← drafts, tracks, and resolves ADRs
│
└── sdd-hotfix/
    └── SKILL.md                        ← routes and handles bugs and production incidents
```

### How Skills Work

The agent reads the `SKILL.md` file when it detects the human needs that skill. The YAML
frontmatter (name + description) tells the agent WHEN to use each skill. The body gives
the detailed step-by-step instructions.

Skills call each other: the `sdd-guide` skill routes to `sdd-platform-spec`,
`sdd-component-spec`, etc. This keeps each skill focused without duplication.

---

## 5. How specify-cli Integrates

`specify-cli` is the execution engine. The agent coaches the human on WHEN to run each
command and with what prompt. It does not run commands itself — it prepares the human
to run them correctly.

### The Command → Skill → Artifact Flow

```
Human: "I want to start building the Guest Checkout feature"
   ↓
Agent: (sdd-guide) diagnoses role = Platform Architect
   ↓
Agent: routes to sdd-platform-spec skill
   ↓
sdd-platform-spec: checks prerequisites
   → constitution.md? ✓
   → Context Pack generated? ✓
   → Initiative ID? ECO-124
   ↓
Agent: "Run this in your Platform Repo terminal:
       specify check
       Then in your AI assistant:
       /speckit.specify [prompt below]..."
   ↓
Human runs /speckit.specify with agent-prepared prompt
   ↓
SpecKit creates: specs/001-guest-checkout/spec.md
   ↓
Agent: "Now run /speckit.clarify to surface ADR triggers before planning."
   ↓
...continues through the full lifecycle
```

### Preparing /speckit.specify Prompts

The agent's job before each SpecKit command is to prepare the human to write a GOOD prompt.
A bad prompt produces a spec that fails the gates. The agent should ask the human
to provide:

**For /speckit.specify:**
- Scope: what the user can do
- Domain responsibilities: which domain owns which part
- Contracts: what events/APIs will be defined or changed
- Non-goals: what is explicitly excluded

**For /speckit.plan:**
- Tech stack per domain
- Event bus / API style
- Reference to domain context files
- Required contract outputs (api-spec.json, events-spec.md)

**For /speckit.constitution:**
- UX consistency rules
- Security/PII rules
- Observability standards
- Performance baselines
- Domain governance rules
- Contract versioning rules
- Definition of Done

---

## 6. How MCP Integrates

MCP provides the governed context that every spec section cites. The agent's job is to
make sure humans know WHICH MCP to query for EACH section, and to flag when a source
is missing.

### The MCP → Spec Section Mapping

| Spec Section | Query This MCP | Cite As |
|---|---|---|
| Problem Statement | Platform MCP (constitution.md) | `Source: Platform MCP v2.1` |
| User Experience | Platform MCP (UX guidelines) | `Source: Platform MCP — UX guidelines v2.1` |
| Domain Understanding | Domain MCP (.specify/memory/domains/<n>.md) | `Source: Domain MCP — Cart invariants v1.4` |
| Cross-Domain Interactions | Domain MCP + Integration MCP | `Source: Domain MCP + Integration MCP v3.0` |
| Contracts | Integration MCP (contracts registry) | `Source: Integration MCP — CartUpdated v2, consumers list v3.0` |
| Component Responsibilities | Domain MCP (ownership boundaries) | `Source: Domain MCP — ownership boundaries v1.4` |
| Technical Approach | Component MCP (context/ directory) | `Source: Component MCP — Cart service patterns v1.1` |
| NFRs | Platform MCP (observability, security, perf) | `Source: Platform MCP — observability, security, performance v2.1` |
| Observability | Platform MCP (logging/metrics/tracing) | `Source: Platform MCP — logging/metrics/tracing standards v2.1` |

### MCP Setup the Agent Can Guide

The agent can walk teams through building their MCP files even before they have a full
MCP server implementation. The minimum viable setup:

```
.specify/memory/
├── constitution.md                     ← Platform MCP (your non-negotiables)
├── domains/
│   ├── cart.md                         ← Cart domain invariants + events
│   ├── checkout.md                     ← Checkout domain invariants + events
│   ├── payments.md                     ← Payments domain invariants + events
│   └── fulfillment.md                  ← Fulfillment domain invariants + events
└── context-<initiative-id>.md          ← Context Pack (aggregated for this initiative)
```

The agent guides the Domain Owner to write each domain file using this format:

```markdown
# <Domain> Domain MCP — v<version>

## Invariants
- <rule that must never be violated>

## Owned Entities
- <entity name>: <valid states>

## Owned Events
- <EventName> (v<N>): {field: type, ...}
  Consumers: [<list of consuming services>]

## Boundaries
- This domain DOES NOT own: <list>
- This domain MUST NOT call directly: <list>
```

### When MCP Context Is Missing

If the agent detects a spec section with no Source, or a team writing from memory, it:
1. Identifies which MCP file should exist
2. Tells the human to check if the file exists
3. If it doesn't exist, guides them to create it (or assign the Domain/Platform Owner to create it)
4. Does not allow the spec section to be written without the source

---

## 7. Role-Based Onboarding Flows

The agent adapts its guidance based on who it's talking to.

### Product Manager

```
Onboarding prompt: "I'm a PM and I need to start a new initiative"

Agent flow:
1. Ask: "What is the initiative? Do you have a business goal and success criteria?"
2. Create the Initiative (Epic) with ID
3. Hand off to Platform Architect: "You've defined the initiative. Now the Platform
   Architect runs /speckit.specify to create the Platform Spec."
4. Review the Platform Spec for business correctness
5. Sign off on fan-out tasks before component teams start
```

### Platform Architect

```
Onboarding prompt: "I need to create the Platform Spec for ECO-124"

Agent flow:
1. Check prerequisites (constitution, Context Pack, Initiative ID)
2. Guide through /speckit.constitution if not done
3. Generate Context Pack
4. Guide through /speckit.specify
5. Guide through /speckit.clarify → ADRs
6. Guide through /speckit.plan + /speckit.tasks
7. Run /speckit.analyze (all 5 gates must pass)
8. Fan out tasks to component teams
```

### Tech Lead / Component Team

```
Onboarding prompt: "I got a task to implement the Cart spec for ECO-124"

Agent flow:
1. Confirm fan-out task has all required fields
2. Check blocked_by is empty
3. Guide through Component Spec creation (sdd-component-spec skill)
4. Gate check (sdd-gate-check skill)
5. Update spec-graph.json
6. Guide through /speckit.implement
```

### On-Call / Hotfix

```
Onboarding prompt: "Production payments are failing"

Agent flow:
1. Triage: component-only or contract/policy impact?
2. Create Hotfix Spec (sdd-hotfix skill)
3. If contract change needed: create Contract Spec in Platform Repo first
4. Implement fix
5. Validate
6. Create follow-up spec for next sprint
```

---

## 8. Enforcement Patterns

The agent enforces the Operating Model through these patterns:

### Pattern 1: Prerequisite Gate
Before any step, the agent checks prerequisites. If missing:
```
"Before we run /speckit.specify, I need to confirm:
- constitution.md exists? [yes/no]
- Context Pack generated? [yes/no]

If constitution.md is missing → let's create it first with /speckit.constitution.
This takes ~30 minutes and is the most important step."
```

### Pattern 2: Source Enforcement
When reviewing a spec section with no Source:
```
"This section needs a Source declaration. Which MCP should we cite here?
- For domain invariants → Domain MCP (.specify/memory/domains/cart.md)
- For UX rules → Platform MCP (constitution.md, UX section)
- For contract consumers → Integration MCP

Let me help you find the right source."
```

### Pattern 3: Redirect Without Blocking
When someone wants to skip a step:
```
Human: "Can we just implement it and write the spec after?"

Agent: "I understand the pressure to move fast. Here's what happens without the spec:
- If you change a contract without a Contract Spec, Fulfillment and Analytics may break
  silently — you won't know until production.
- Without Gate 3 passing, there's no consumer list, so no one knows to update their side.

The fastest compliant path: write the Hotfix Spec (10 minutes) and then implement.
Want me to help you write it right now?"
```

### Pattern 4: The Follow-Up Spec Reminder
After every hotfix:
```
"The fix is deployed. Good. Now we create the Follow-up Spec — this goes in next sprint.
It covers: full test coverage, ADR for the decision you made under pressure,
and whatever gap in the Domain MCP or gates allowed this incident to happen.
Want to start the Follow-up Spec now, or schedule it for tomorrow's sprint planning?"
```

---

## 9. Quick Reference for Teams

### "What command do I run for X?"

| What you want | Command | Repo |
|---|---|---|
| Set up a new repo | `specify init <name> --ai claude` | Either |
| Check setup | `specify check` | Either |
| Write platform rules | `/speckit.constitution` | Platform |
| Start a new feature | `/speckit.specify` | Platform |
| Find gaps before planning | `/speckit.clarify` | Platform |
| Create technical plan | `/speckit.plan` | Platform |
| Validate all gates | `/speckit.analyze` | Either |
| Create ordered tasks | `/speckit.tasks` | Platform |
| Start coding | `/speckit.implement` | Component |

### "What file do I create for X?"

| What you need | File | Where |
|---|---|---|
| Platform rules | `constitution.md` | `.specify/memory/` (Platform Repo) |
| Domain knowledge | `<domain>.md` | `.specify/memory/domains/` (Platform Repo) |
| Context for initiative | `context-<id>.md` | `.specify/memory/` (Platform Repo) |
| Feature spec (what/why) | `spec.md` | `specs/<n>-<name>/` (Platform Repo) |
| Tech plan (how) | `plan.md` | `specs/<n>-<name>/` (Platform Repo) |
| Component spec | `spec.md` | `specs/` (Component Repo) |
| Global decision | `ADR-<n>-<title>.md` | `adr/` (Platform Repo) |
| Local decision | `ADR-LOCAL-<n>-<title>.md` | `adr/` (Component Repo) |
| Traceability | `spec-graph.json` | `.specify/memory/` (Platform Repo) |

---

*SDD Agent + Skills Guide — February 2026*
*Covers: OPERATING-MODEL.md v2.0, specify-cli, MCP integration*
