# local-doc

A fast, offline spec registry that searches your project documentation across multiple repos. One bash script, zero dependencies beyond `sqlite3`.

## Why

Teams store specs as markdown files scattered across repos. Finding the right spec means grepping, scrolling, or asking someone. MCP servers add latency and complexity. `local-doc` gives you instant full-text search across all your spec repos with a 3-word command.

## Install

```bash
cp local-doc-tool.sh /usr/local/bin/local-doc
chmod +x /usr/local/bin/local-doc
```

Requirements: `bash` + `sqlite3` (both pre-installed on macOS and most Linux). Optional: `git` for smart incremental updates on git repos.

## Quick start

```bash
# 1. Register your spec folders (auto-scans immediately)
local-doc repo add ./product-specs product
local-doc repo add ./platform-docs platform

# 2. Search — no manual scan needed, it just works
local-doc search refund
```

The index auto-rebuilds when you add/remove repos, and auto-detects when files change on your next search.

## Example output

### Search

```
$ local-doc search refund

Results for "refund":

  1. [product] payments/refund  (.md)
     Refund flow
     tags: billing, refund, customer, payments
```

### Search across multiple repos

```
$ local-doc search "refund OR authentication"

Results for "refund OR authentication":

  1. [product] payments/refund  (.md)
     Refund flow
     tags: billing, refund, customer, payments

  2. [platform] api/authentication  (.mdx)
     Authentication API
     tags: auth, security, api, tokens
```

### Stemming — "refunding" finds "refund"

```
$ local-doc search refunding

Results for "refunding":

  1. [product] payments/refund  (.md)
     Refund flow
     tags: billing, refund, customer, payments
```

### Exclude terms with NOT

```
$ local-doc search "billing NOT fraud"

Results for "billing NOT fraud":

  1. [product] billing/invoices  (.md)
     Invoice generation
     tags: billing, invoices, payments, accounting

  2. [product] payments/refund  (.md)
     Refund flow
     tags: billing, refund, customer, payments
```

### Deep content search — finds words inside files, not just titles

```
$ local-doc search webhook

Results for "webhook":

  1. [product] payments/chargeback  (.md)
     Chargeback handling
     tags: disputes, chargeback, fraud
```

### Filter by repo

```
$ local-doc search "billing" product

Results for "billing":
(filtered to repo: product)

  1. [product] billing/invoices  (.md)
     Invoice generation
     tags: billing, invoices, payments, accounting

  2. [product] payments/refund  (.md)
     Refund flow
     tags: billing, refund, customer, payments
```

### List all specs

```
$ local-doc list

All specs:

  [platform]
    api/authentication.mdx — Authentication API
    architecture/database.txt — database

  [product]
    billing/invoices.md — Invoice generation
    onboarding/signup.md — Signup flow
    payments/chargeback.md — Chargeback handling
    payments/refund.md — Refund flow
```

### List one repo

```
$ local-doc list platform

Specs in repo "platform":

  api/
    authentication.mdx — Authentication API
  architecture/
    database.txt — database
```

### Browse projects

```
$ local-doc projects

Projects:

  [platform] api (1 specs)
  [platform] architecture (1 specs)
  [product] billing (1 specs)
  [product] onboarding (1 specs)
  [product] payments (2 specs)
```

### Tags

```
$ local-doc tags

All tags:

  payments (2)
  billing (2)
  user (1)
  tokens (1)
  security (1)
  registration (1)
  refund (1)
  ...
```

### Stats

```
$ local-doc stats

Local Doc Stats

  Repos:          2
  Total specs:    6
  Projects:       5
  Unique tags:    16
  Total size:     2384 bytes
  File types:     md,mdx,txt
  Database:       56K
  Last scan:      2026-03-15 00:48:12

  Per repo:
    platform: 2 specs
    product: 4 specs
```

### JSON output for agents

```
$ local-doc json search "billing OR security"

[
  {
    "repo": "platform",
    "project": "api",
    "name": "authentication",
    "title": "Authentication API",
    "tags": "auth, security, api, tokens",
    "path": "api/authentication.mdx",
    "ext": "mdx",
    "relevance": -1.71
  },
  {
    "repo": "product",
    "project": "billing",
    "name": "invoices",
    "title": "Invoice generation",
    "tags": "billing, invoices, payments, accounting",
    "path": "billing/invoices.md",
    "ext": "md",
    "relevance": -0.95
  }
]
```

```
$ local-doc json repos

[
  {"repo": "platform", "path": "/path/to/platform-docs", "spec_count": 2},
  {"repo": "product",  "path": "/path/to/product-specs",  "spec_count": 4}
]
```

```
$ local-doc json read chargeback

{
  "path": "/path/to/product-specs/payments/chargeback.md",
  "content": "---\ntags: disputes, chargeback, fraud\n---\n\n# Chargeback handling\n\nProcess for managing payment chargebacks and disputes.\n..."
}
```

## Multi-repo support

Register as many repos as you need. Each gets a name for easy filtering.

```bash
local-doc repo add ./frontend-specs frontend
local-doc repo add ./backend-specs backend
local-doc repo add ./shared-docs shared

local-doc repo list          # See all repos
local-doc search auth        # Search across all
local-doc search auth backend # Search one repo
local-doc list frontend      # Browse one repo
```

## Supported file types

- `.md` — Markdown
- `.mdx` — MDX (Markdown + JSX)
- `.txt` — Plain text

## Spec format

Any repo structure works. The tool recursively scans for `.md`, `.mdx`, and `.txt` files — everything else is ignored. You don't need to reorganize anything.

```
# All of these work — flat, nested, monorepo, whatever
my-project/
  src/docs/api.md             ← found
  README.md                   ← found
  payments/refund.md          ← found
  deep/nested/folder/spec.txt ← found
  app.ts                      ← ignored (not .md/.mdx/.txt)
```

Optional YAML frontmatter adds tags:

```markdown
---
tags: billing, refund, customer
---

# Refund flow
...
```

## Full command reference

### Repo management
```bash
local-doc repo add <folder> [name]   # Add a repo (auto-scans)
local-doc repo remove <name>         # Remove a repo (auto-rebuilds)
local-doc repo list                  # List all repos
```

### Searching
```bash
local-doc search refund              # Keyword
local-doc search refunding           # Stemming (matches "refund")
local-doc search "refund OR signup"  # Boolean OR
local-doc search "billing NOT fraud" # Exclude
local-doc search "payment*"          # Prefix
local-doc search refund my-repo      # Filter by repo
```

### Browsing
```bash
local-doc list                       # All specs
local-doc list <repo>                # One repo
local-doc projects                   # All projects
local-doc tags                       # All tags
local-doc tags billing               # Specs with tag
local-doc recent 5                   # Recently modified
local-doc related refund             # Find related specs
```

### Reading
```bash
local-doc read refund                # Print full content
local-doc read signup my-repo        # From specific repo
```

### JSON output (for agents)
```bash
local-doc json search "refund"       # Ranked results
local-doc json search "refund" repo  # Filter by repo
local-doc json read signup           # Full content
local-doc json list my-repo          # Project listing
local-doc json repos                 # All repos + counts
local-doc json related refund        # Related specs
local-doc json tags                  # All tags
local-doc json stats                 # Stats
```

### Maintenance
```bash
local-doc scan                       # Force full rebuild
local-doc scan <repo>                # Rebuild one repo
local-doc stats                      # Index statistics
local-doc inspect                    # Dump full index
local-doc reset                      # Delete everything
```

## Search features

| Feature | Example | Description |
|---|---|---|
| Stemming | `search refunding` | Matches "refund", "refunds", "refunding" |
| BM25 ranking | any search | Most relevant results first |
| Boolean OR | `search "refund OR chargeback"` | Either term |
| Boolean NOT | `search "billing NOT fraud"` | Exclude terms |
| Prefix | `search "payment*"` | Words starting with prefix |
| Phrase | `search '"refund request"'` | Exact phrase match |
| Deep content | `search webhook` | Searches full file content |
| Cross-repo | `search auth` | Searches all registered repos |
| Repo filter | `search auth backend` | Limit to one repo |

## Change detection

`local-doc` automatically detects file changes before every query. It uses two strategies depending on whether your repo is a git repository.

### Git repos (default)

When a registered repo has git initialized, `local-doc` uses git to detect changes. This is faster and smarter than filesystem scanning — git already knows exactly what changed.

**How it works:**

1. On the first full scan (`local-doc scan` or `repo add`), the current `HEAD` commit hash is stored in the database
2. On every subsequent query, the tool compares the stored commit against the current `HEAD`
3. If commits differ, it asks git for the exact list of changed `.md`/`.mdx`/`.txt` files
4. It also checks for uncommitted changes (staged, unstaged, and untracked spec files)
5. Only the changed files are re-indexed — no full rebuild needed

**What gets detected:**

| Change type | Detected? | How |
|---|---|---|
| New commits (pushed or local) | Yes | `git diff --name-only <old>..<new>` |
| Edited but uncommitted files | Yes | `git diff --name-only` |
| Staged files | Yes | `git diff --cached --name-only` |
| New untracked spec files | Yes | `git ls-files --others --exclude-standard` |
| Deleted files | Yes | Removed from the index automatically |
| Files in `.gitignore` | No | Ignored, same as git |

**Incremental updates** mean that if you edited 2 files out of 500, only those 2 get re-indexed. The rest of the index stays untouched.

```
$ local-doc search refund
(product: git changes detected — incremental update...)

  product: 2 files updated (incremental)

Results for "refund":
  ...
```

### Non-git repos (fallback)

When a registered repo is **not** a git repository, `local-doc` falls back to filesystem timestamp comparison using `find -newer`. If any spec file has a modification time newer than the database file, a full rebuild is triggered.

This works reliably but is less efficient — it can't tell which files changed, so it rebuilds the entire index.

### Auto-rebuild triggers

| Event | Git repo | Non-git repo |
|---|---|---|
| `repo add` | Full scan + store commit hash | Full scan |
| `repo remove` | Full rescan remaining repos | Full rescan remaining repos |
| New commits since last query | Incremental update (changed files only) | N/A |
| Uncommitted/staged edits | Incremental update | Full rebuild |
| New untracked spec files | Incremental update | Full rebuild |
| Deleted spec files | Removed from index | Full rebuild |
| No changes at all | Skipped (zero cost) | Skipped (zero cost) |
| `local-doc scan` | Full rebuild + store commit hash | Full rebuild |

You never have to think about the index.

## How it works

1. Your files (.md, .mdx, .txt) are always the **source of truth**
2. `local-doc` reads them and builds a SQLite FTS5 index
3. The `.db` file is a **disposable cache** at `~/.local-doc/specs.db`
4. Searches use Porter stemming + BM25 ranking
5. Delete the `.db` anytime — it auto-rebuilds on next use
6. For git repos, commit hashes are stored in the database to enable incremental updates

## Performance

| Operation | Speed |
|---|---|
| Search | ~30ms |
| Boolean search | ~30ms |
| Read spec | ~50ms |
| JSON search | ~70ms |

CPU at rest: zero. Memory at rest: zero. Disk: one small `.db` file.

## Troubleshooting

### Common issues

| Problem | Fix |
|---|---|
| "No repos added yet" | `local-doc repo add /path/to/specs` |
| Search returns nothing | Check `local-doc repo list` — is the path correct? |
| Index seems stale | Should auto-rebuild. Force with `local-doc scan` |
| Something is broken | `rm ~/.local-doc/specs.db && local-doc scan` |
| Nuclear reset | `local-doc reset` |
| sqlite3 not found | `sudo apt install sqlite3` (Linux) / pre-installed (macOS) |

### Git-related issues

| Problem | Fix |
|---|---|
| Git changes not detected | Make sure the repo has at least one commit. Bare `git init` with no commits won't have a `HEAD` to compare against |
| Incremental update missed a file | Run `local-doc scan` to force a full rebuild. The git commit hash will be re-stored |
| "incremental update" on every query | You have uncommitted changes to spec files. Commit them or the tool will keep detecting them as dirty |
| Repo is git but using timestamp fallback | Check that `git` is on your `$PATH`. Run `git -C /path/to/repo status` to verify |
| Submodule or worktree repo not recognized | The tool checks for `.git` directory or runs `git rev-parse --git-dir`. Both submodules and worktrees are supported |

### Rebuilding from scratch

If anything feels off, the database is disposable:

```bash
# Option 1: delete and let it auto-rebuild on next query
rm ~/.local-doc/specs.db

# Option 2: force rebuild now
local-doc scan

# Option 3: nuclear — remove everything including repo registrations
local-doc reset
```

### Verifying the index

```bash
# Check what's registered
local-doc repo list

# See full index contents
local-doc inspect

# Check stats (repo count, spec count, last scan time)
local-doc stats
```

## FAQ

**Q: Do I need git installed for this to work?**
No. Git is optional. If a registered repo has git, the tool uses it for faster incremental updates. If not, it falls back to filesystem timestamp comparison. Both work automatically.

**Q: What happens if I add a non-git folder?**
It works the same as before — `find -newer` checks if any spec file was modified since the last scan. If so, the entire index is rebuilt.

**Q: Will it detect changes I haven't committed yet?**
Yes. For git repos, the tool checks committed changes (via `git diff`), staged changes (`git diff --cached`), unstaged edits (`git diff`), and new untracked files (`git ls-files --others`). Everything is covered.

**Q: How does incremental update differ from a full scan?**
A full scan (`local-doc scan`) drops the entire database and re-indexes everything from scratch. An incremental update only touches the files that changed — deleting removed entries, updating modified ones, and adding new ones. The rest of the index stays untouched.

**Q: Can I mix git and non-git repos?**
Yes. Each repo is evaluated independently. You can have three git repos and two plain folders registered at the same time. Each uses the appropriate change detection strategy.

**Q: Does it respect `.gitignore`?**
For git repos, yes. Untracked file detection uses `git ls-files --others --exclude-standard`, which honors `.gitignore`. For non-git repos, all `.md`/`.mdx`/`.txt` files are indexed regardless.

**Q: What if I rebase, amend, or force-push?**
The tool stores the last scanned commit hash. If `HEAD` changes for any reason (rebase, amend, reset, force-push), it detects the difference and incrementally updates. If the old commit hash no longer exists in history, git's `diff` may fail gracefully and the tool falls back to treating all spec files as changed.

**Q: What if I switch branches?**
Switching branches changes `HEAD`, so the tool detects it and incrementally updates the index with the files that differ between the old and new branch. This happens automatically on your next query.

**Q: How much faster is git detection vs filesystem scanning?**
For large repos with thousands of files, git detection is significantly faster because `git diff` is O(changed files) while `find -newer` must stat every file. For small repos (< 100 files), the difference is negligible.

**Q: Can I force a full rebuild even if git is available?**
Yes. `local-doc scan` always does a full rebuild regardless of git status. It also re-stores the current commit hash for future incremental updates.

**Q: Where is the commit hash stored?**
In the SQLite database's `meta` table, keyed as `git_commit_<reponame>`. It's part of the disposable cache — deleting the `.db` file clears it, and the next full scan re-stores it.

## Claude Code skill

`local-doc` ships with a custom Claude Code skill that teaches Claude how to search, read, and reason over your specs automatically. When the skill is active, Claude will search your specs before answering domain questions instead of relying on general knowledge.

### What the skill does

The skill gives Claude a three-step workflow:

1. **Extract search terms** from the user's question (domain nouns, not filler words)
2. **Read matched specs** — the top 2-4 results by relevance
3. **Reason over spec content** — ground every claim in what the specs actually say, cite sources, flag gaps

This means questions like "what's the impact of changing payment eligibility rules?" will trigger spec searches, read the relevant files, and produce answers grounded in your actual documentation.

### Installing the skill

Copy or symlink the `skills/local-doc/` folder into your project's `.claude/skills/` directory:

```bash
# From your project root
mkdir -p .claude/skills
cp -r /path/to/local-doc/skills/local-doc .claude/skills/

# Or symlink it (stays up to date automatically)
ln -s /path/to/local-doc/skills/local-doc .claude/skills/local-doc
```

The skill file lives at `.claude/skills/local-doc/SKILL.md`.

### How Claude uses it

Once installed, Claude triggers the skill when it detects questions that could be answered by spec files. This includes:

| User asks | What Claude does |
|---|---|
| "Find the spec for refund" | Direct spec lookup — `search` then `read` |
| "What specs do we have about billing?" | Browse + search — `search "billing"`, `list` |
| "How does our signup flow work?" | Domain question — `search "signup"`, `read signup`, answer from content |
| "What's the impact of changing payment eligibility?" | Multi-spec analysis — searches multiple terms, reads top matches, synthesizes |
| "What happens if a chargeback is disputed?" | Cross-reference — `search "chargeback dispute"`, reads and connects related specs |
| "Add my docs folder as a repo" | Setup — runs `repo add` |

### Skill behavior rules

The skill enforces these behaviors on Claude:

- **Search first, answer second.** Claude will not answer domain questions from general knowledge when spec content is available.
- **Cite sources.** Every claim references the spec file it came from: "According to payments/refund.md, eligibility requires..."
- **Flag gaps.** If specs don't cover part of the question, Claude says so explicitly instead of guessing.
- **Connect across specs.** When a question spans multiple specs, Claude reads all relevant files and synthesizes.
- **Suggest related specs.** After answering, Claude points to related specs using `local-doc related`.

### Search strategy examples

The skill teaches Claude how to extract good search queries from natural language:

```
User: "Can international customers get refunds?"
Claude runs:
  local-doc search "refund international"
  local-doc search "refund eligibility"
  local-doc read refund

User: "What APIs need auth tokens?"
Claude runs:
  local-doc search "authentication" platform
  local-doc read authentication

User: "What's the difference between a refund and a chargeback?"
Claude runs:
  local-doc search "refund OR chargeback"
  local-doc read refund
  local-doc read chargeback
```

### JSON mode for agent pipelines

The skill also supports JSON output for automated workflows:

```bash
local-doc json search "refund"       # ranked results as JSON
local-doc json read refund           # full content as JSON
local-doc json list my-repo          # listing as JSON
local-doc json repos                 # all repos + counts
```

### When the skill does NOT trigger

- Pure setup questions ("how do I add a repo") — Claude answers from the command reference
- Questions clearly outside any documented domain — Claude answers from general knowledge and notes no specs were found
- Follow-ups where spec content is already loaded from a previous step

### Customizing the skill

The skill file (`SKILL.md`) is plain markdown. You can edit it to:

- Add project-specific search strategies or domain terms
- Change the number of specs Claude reads per query
- Adjust the reasoning rules (e.g., always check a specific repo first)
- Add references to additional documentation files

The skill also supports on-demand reference loading. Detailed docs live in `references/` and are only read when needed:

```
references/
  commands.md          # Full command reference
  troubleshooting.md   # Common problems and fixes
  spec-format.md       # How to write spec files, frontmatter, folder structure
```

## File structure

```
~/.local-doc/
  repos          # Text file: repo_name|/absolute/path (one per line)
  specs.db       # SQLite database (disposable cache)

local-doc/
  local-doc-tool.sh              # Main script
  skills/local-doc/SKILL.md # Claude Code skill
  references/
    commands.md                 # Full command reference
    troubleshooting.md          # Troubleshooting guide
    spec-format.md              # Spec format documentation
  examples/                     # Sample spec repos for testing
```

## License

MIT
