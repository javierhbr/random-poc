# Command reference

Complete documentation for all `local-doc` commands.

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
local-doc repo add <folder> [name]
```

Register a spec folder. Automatically triggers a full scan.

- `folder` — path to your spec directory (absolute or relative)
- `name` — optional label (defaults to folder basename)
- Scans recursively through all subdirectories
- Indexes `.md`, `.mdx`, and `.txt` files

```bash
local-doc repo add ./product-specs product
local-doc repo add /home/team/docs
```

### repo remove

```bash
local-doc repo remove <n>
```

Unregister a repo. Automatically rebuilds the index without it.

### repo list

```bash
local-doc repo list
```

Shows all registered repos with paths and file counts.

```
Registered repos:

  product
    /home/team/product-specs
    42 files (.md .mdx .txt)

  platform
    /home/team/platform-docs
    18 files (.md .mdx .txt)
```

---

## 2. Scanning

### scan

```bash
local-doc scan            # all repos
local-doc scan <repo>     # one repo
```

Rebuilds the search index. Usually not needed — the index auto-rebuilds when:
- A repo is added or removed
- Any spec file is modified (detected on next search)

Force a manual scan if auto-detection isn't catching changes.

---

## 3. Searching

### search

```bash
local-doc search <query> [repo]
```

Full-text search across all repos (or one repo if specified).

| Feature | Syntax | Example |
|---|---|---|
| Keyword | `search refund` | Matches "refund" in any field or content |
| Stemming | `search refunding` | Also matches "refund", "refunds" |
| Boolean OR | `search "refund OR chargeback"` | Either term |
| Boolean NOT | `search "billing NOT fraud"` | Exclude terms |
| Prefix | `search "payment*"` | Words starting with "payment" |
| Phrase | `search '"refund request"'` | Exact phrase |
| Repo filter | `search refund product` | Only search "product" repo |

Results are ranked by relevance (BM25). Best matches first.

```
Results for "refund":

  1. [product] payments/refund  (.md)
     Refund flow
     tags: billing, refund, customer, payments

  2. [product] payments/chargeback  (.md)
     Chargeback handling
     tags: disputes, chargeback, fraud
```

---

## 4. Reading

### read

```bash
local-doc read <n> [repo]
```

Print the full content of a spec. Matches by name (partial match).

```bash
local-doc read refund              # first match across all repos
local-doc read signup product      # from specific repo
```

If multiple specs match, shows all matches and displays the first.

---

## 5. Browsing

### list

```bash
local-doc list                     # all specs, all repos
local-doc list <repo>              # one repo
local-doc list <project>           # one project (if not a repo name)
```

### projects

```bash
local-doc projects
```

### tags

```bash
local-doc tags                     # all tags with counts
local-doc tags billing             # specs tagged "billing"
```

### related

```bash
local-doc related <n>
```

Finds specs related to a given spec by analyzing its title and tags.

### recent

```bash
local-doc recent [n]               # default: last 10
```

---

## 6. JSON output

Every command has a JSON equivalent for programmatic use by agents.

### json search

```bash
local-doc json search <query> [repo]
```

Returns:
```json
[
  {
    "repo": "product",
    "project": "payments",
    "name": "refund",
    "title": "Refund flow",
    "tags": "billing, refund, customer, payments",
    "path": "payments/refund.md",
    "ext": "md",
    "relevance": -1.65
  }
]
```

### json read

```bash
local-doc json read <n>
```

Returns:
```json
{
  "path": "/full/path/to/spec.md",
  "content": "full markdown content..."
}
```

### json list / json repos / json related / json tags / json stats

All return JSON arrays or objects. See `local-doc json help` for details.

---

## 7. Maintenance

### stats

```bash
local-doc stats
```

Shows repo count, spec count, projects, tags, file types, DB size, last scan time.

### inspect

```bash
local-doc inspect
```

Dumps the full index as readable text. Useful for debugging.

### reset

```bash
local-doc reset
```

Deletes everything (index + repo list) and starts fresh. Asks for confirmation.

### Manual rebuild

```bash
rm ~/.local-doc/specs.db
local-doc scan
```

The nuclear option. Deletes the cache and rebuilds from source files.
