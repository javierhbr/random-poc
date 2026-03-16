---
name: platform-spec
description: >
  Use this skill whenever someone asks a question that could be answered or informed
  by project specs, requirements, or documentation. This includes direct spec requests
  ('find the spec for X', 'search our docs', 'what specs do we have', 'check the
  requirements for Y', 'look up the docs on Z'), analytical questions where specs
  contain the answer ('what is the impact of changing X', 'how does our Y flow work',
  'what happens if Z'), and setup tasks (adding repos, scanning, troubleshooting the
  index). Trigger this skill even if the user doesn't say "spec" explicitly — if their
  question touches a domain that might be documented in spec files (.md, .mdx, .txt),
  search first. Also use when the user says 'what do our docs say about', 'is there
  a spec for', 'check the requirements', 'look up', or asks about any business process,
  product rule, API contract, or architectural decision that could be documented.
  Search first, answer grounded in results. Do NOT answer from general knowledge when
  spec content is available.
---

# Platform Spec

A CLI tool that indexes `.md`, `.mdx`, and `.txt` spec files across multiple repos and provides instant full-text search. Powered by SQLite FTS5. Single bash script, zero dependencies beyond `sqlite3`.

## Prerequisites

The `platform-spec` command must be on your PATH. The script lives at:

```
<project-root>/platform-spec.sh
```

If you get "command not found", run the script directly with its full path or add its directory to PATH. The only dependency is `sqlite3` (pre-installed on macOS and most Linux).

## Core workflow: search, read, reason

When a user asks ANY question that might be answered by specs, follow this pipeline. Specs are the authoritative source of truth for the project — answering from general knowledge when spec content exists risks contradicting what the team has actually agreed on.

### Step 1: Extract search terms

Break the user's question into 1-3 search queries. Focus on domain nouns, not verbs or filler words — FTS5 indexes words, and common verbs like "changing" or "adding" are noise that dilute relevance ranking.

| User asks | Search queries to run |
|---|---|
| "What's the impact of adding a new rule to payment eligibility?" | `platform-spec search "payment eligibility"` then `platform-spec search "refund"` |
| "How does our signup flow work?" | `platform-spec search "signup"` |
| "What are the deployment requirements?" | `platform-spec search "deployment"` then `platform-spec search "infrastructure"` |
| "Can international customers get refunds?" | `platform-spec search "refund international"` then `platform-spec search "refund eligibility"` |
| "What APIs need auth tokens?" | `platform-spec search "authentication" platform` |

Tips for extracting good queries:
- Use domain nouns: "payment eligibility" not "what is the impact of changing"
- Use OR for broader coverage: `platform-spec search "refund OR chargeback"`
- Use NOT to filter noise: `platform-spec search "billing NOT invoice"`
- Scope to a repo when you know which one: `platform-spec search "auth" platform`
- Run 2-3 searches if the question spans multiple domains
- FTS5 supports stemming: "refunding" matches "refund" automatically

### Step 2: Read the matched specs

For each relevant result from Step 1, read the full content:

```bash
platform-spec read refund
platform-spec read deployment
```

Read the top 2-4 matches. More than that floods your context with noise — BM25 ranking puts the most relevant first, so the tail is rarely useful.

For agent pipelines, use JSON output:

```bash
platform-spec json read refund
```

### Step 3: Reason over the spec content

Answer the user's question using what you found.

**Ground every claim.** Specs are what the team agreed on. If the spec says "refunds must be within 30 days", say exactly that. Hallucinating or paraphrasing loosely can lead users to act on wrong information.

**Cite your sources.** Name the spec file that informed each part of your answer: "According to the refund flow spec (payments/refund.md), eligibility requires..."

**Flag gaps explicitly.** If the specs don't cover part of the question, say so: "The current specs don't address [X]. This may need a new spec or an update to an existing one." This is more valuable than guessing — it surfaces documentation debt.

**Connect dots across specs.** If the question touches multiple specs, synthesize: "The refund spec requires [X], but the chargeback spec assumes [Y] — changing eligibility would affect both."

**Suggest next steps.** After answering, point to related specs: "You might also want to review: `platform-spec related refund`"

### Full example

User: "What's the impact of adding a new rule to the payment eligibility?"

**You run:**
1. `platform-spec search "payment eligibility"`
2. `platform-spec search "refund"`
3. `platform-spec read refund`
4. `platform-spec read chargeback`
5. `platform-spec related refund`

**You answer:**

Based on the refund flow spec (payments/refund.md), the current eligibility rules are: within 30 days, item not used, original payment method available. Partial refunds require manager approval.

Adding a new eligibility rule would impact:
- The support team's 24-hour review process (step 2 in the refund flow)
- The chargeback handling spec (payments/chargeback.md) — chargebacks that fail the new rule would need updated evidence packages
- Edge cases: international refunds (up to 10 business days) and gift card purchases (refunded as store credit) have separate paths that may also need the new rule applied

The specs don't currently cover how eligibility changes are rolled out or communicated to customers. That might need a new spec.

Related specs to review: payments/chargeback, billing/invoices.

### When NOT to search

- Pure setup questions: "how do I add a repo" — answer from the command reference below
- Questions clearly outside any documented domain — answer from general knowledge, note that no specs were found
- The user explicitly asks you not to check specs ("from your general knowledge", "don't check the docs")
- Follow-ups where you already have the spec content loaded from a previous step

## Setup (helping users get started)

```bash
platform-spec repo add /path/to/specs my-project   # auto-scans immediately
platform-spec search <keyword>                       # ready to use
```

The index auto-rebuilds when repos are added/removed and auto-detects when files change on next search. No manual scan needed.

## Essential commands

### Search
```bash
platform-spec search refund                   # keyword
platform-spec search "refund OR chargeback"   # boolean OR
platform-spec search "billing NOT fraud"      # exclude
platform-spec search refunding                # stemming: matches "refund"
platform-spec search refund my-repo           # filter by repo
```

### Read
```bash
platform-spec read refund                     # full content
platform-spec read signup my-repo             # from specific repo
```

### Browse
```bash
platform-spec list                            # all specs, all repos
platform-spec list my-repo                    # one repo
platform-spec projects                        # all projects
platform-spec tags                            # all tags
platform-spec related refund                  # related specs
```

### Repos
```bash
platform-spec repo add <folder> [name]        # register + auto-scan
platform-spec repo remove <name>              # unregister + auto-rebuild
platform-spec repo list                       # show all repos
```

### JSON (agent pipelines)
```bash
platform-spec json search "refund"            # ranked results
platform-spec json read refund                # full content as JSON
platform-spec json list my-repo               # listing
platform-spec json repos                      # all repos + counts
```

## References (load on demand)

For detailed documentation beyond what's above, read these files:

- `resources/commands.md` — Full command reference with all options, output examples, and edge cases
- `resources/troubleshooting.md` — Common problems, fixes, auto-rebuild behavior, file locations
- `resources/spec-format.md` — How to write spec files, YAML frontmatter, folder structure, indexing details
