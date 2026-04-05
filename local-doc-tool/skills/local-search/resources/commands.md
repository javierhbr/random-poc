# Command reference

Complete documentation for all `local-search` commands.

## Version

```bash
local-search -v
local-search --version
```

Prints the current version and exits.

## Table of contents

1. Repo management
2. Scanning
3. Searching
4. Reading
5. Browsing
6. JSON output (agents)
7. Maintenance

---

## 1. Repo management

### repo add

```bash
local-search repo add <folder> [name] [--skip-directory <folder-name>]...
```

Register a spec folder. Automatically triggers a full scan.

- `folder` — path to your spec directory (absolute or relative)
- `name` — optional label (defaults to folder basename)
- `--skip-directory` — exclude a folder by name during indexing (repeatable, persisted)
  - Matches by exact folder **name** only, not full path. `.skills` won't match `.skills-old`.
  - Applies to all future full and incremental scans
- Scans recursively through all subdirectories
- Indexes `.md`, `.mdx`, and `.txt` files

```bash
local-search repo add ./product-specs product
local-search repo add /home/team/docs
local-search repo add ./docs docs --skip-directory .skills
local-search repo add ~/code backend --skip-directory vendor --skip-directory .git
```

### repo remove

```bash
local-search repo remove <name>
  # Example: local-search repo remove product
```

Unregister a repo. Automatically rebuilds the index without it.

### repo list

```bash
local-search repo list
```

Shows all registered repos with paths.

```
  product               /home/team/product-specs
  platform              /home/team/platform-docs
```

---

## 2. Scanning

### scan

```bash
local-search scan              # all repos
local-search scan platform     # one repo
```

Rebuilds the search index. Usually not needed — the index auto-rebuilds when:
- A repo is added or removed
- Any spec file is modified (detected via git change detection on next search)

Force a manual scan if auto-detection isn't catching changes.

---

## 3. Searching

### search

```bash
local-search search <query> [--repo <name>] [--directory <path>] [--exclude-location <pattern>]...
```

Full-text search across all repos (or one repo if specified). Results show the **full filesystem path** of each match.

| Feature | Syntax | Example |
|---|---|---|
| Keyword | `search refund` | Matches "refund" in any field or content |
| Stemming | `search refunding` | Also matches "refund", "refunds" |
| Boolean OR | `search "refund OR chargeback"` | Either term |
| Boolean NOT | `search "billing NOT fraud"` | Exclude terms |
| Prefix | `search "payment*"` | Words starting with "payment" |
| Phrase | `search '"refund request"'` | Exact phrase |
| Repo filter (flag) | `search "refund" --repo product` | Only search "product" repo |
| Repo filter (positional) | `search refund product` | Legacy positional form |
| Directory filter | `search "refund" --directory billing/` | Only paths starting with `billing/` |
| Combine repo + dir | `search "event" --repo backend --directory integrations/` | Both filters together |
| Exclude location | `search refund --exclude-location archive` | Exclude paths containing "archive" |
| Multi-exclude | `search refund --exclude-location archive --exclude-location tmp` | Multiple patterns |

Results are ranked by relevance (BM25). Best matches first.

```
  [product] /home/team/product-specs/payments/refund-flow.md
    Refund flow  (billing, refund, customer)  .md
  [product] /home/team/product-specs/payments/chargeback.md
    Chargeback handling  (disputes, chargeback)  .md
```

---

## 4. Reading

### read

```bash
local-search read <name> [repo] [--repo <name>] [--directory <path>]
```

Print the full content of a spec. Matches by exact name.

```bash
local-search read refund-flow                       # first match across all repos
local-search read refund-flow product               # from specific repo
local-search read config backend --directory src/   # from specific repo and directory
```

`--directory` narrows by path prefix — useful when the same name exists in multiple directories. If multiple specs still match, all choices are listed.

---

## 5. Browsing

### list

```bash
local-search list                       # all specs, all repos
local-search list platform              # one repo
local-search list payments              # one project (if not a repo name)
```

### projects

```bash
local-search projects
```

### tags

```bash
local-search tags                       # all tags with counts
local-search tags billing               # specs tagged "billing"
```

### related

```bash
local-search related refund-flow
```

Finds specs related to a given spec by analyzing its title and tags.

### recent

```bash
local-search recent                     # default: last 10
local-search recent 20
```

---

## 6. JSON output

Every command has a JSON equivalent for programmatic use by agents.

### json search

```bash
local-search json search <query> [repo]
  # Example: local-search json search "payment" platform
```

Returns:
```json
[
  {
    "repo": "product",
    "project": "payments",
    "name": "refund-flow",
    "title": "Refund flow",
    "tags": "billing, refund, customer, payments",
    "path": "payments/refund-flow.md",
    "fullpath": "/home/team/product-specs/payments/refund-flow.md",
    "ext": "md",
    "relevance": -1.65
  }
]
```

### json read

```bash
local-search json read <name> [repo]
  # Example: local-search json read refund-flow
```

Returns:
```json
{
  "path": "/full/path/to/spec.md",
  "content": "full markdown content..."
}
```

### json list / json repos / json related / json tags / json stats

All return JSON arrays or objects.

---

## 7. Maintenance

### stats

```bash
local-search stats
```

Shows repo count, spec count, projects, tags, DB size, last scan time.

### inspect

```bash
local-search inspect
```

Dumps the full index as readable text. Useful for debugging.

### reset

```bash
local-search reset
```

Deletes everything (index + repo list) and starts fresh.

### Manual rebuild

```bash
rm ~/.local-search/specs.db
local-search scan
```

Deletes the cache and rebuilds from source files.

## File locations

| Path | Contents |
|---|---|
| `~/.local-search/repos` | Registered repo list (one `name\|path` or `name\|path\|skip1,skip2` per line) |
| `~/.local-search/specs.db` | SQLite database (disposable cache — source files are the truth) |
