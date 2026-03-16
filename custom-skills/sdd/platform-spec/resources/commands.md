# Command reference

Complete documentation for all `platform-spec` commands.

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
platform-spec repo add <folder> [name]
```

Register a spec folder. Automatically triggers a full scan.

- `folder` — path to your spec directory (absolute or relative)
- `name` — optional label (defaults to folder basename)
- Scans recursively through all subdirectories
- Indexes `.md`, `.mdx`, and `.txt` files

```bash
platform-spec repo add ./product-specs product
platform-spec repo add /home/team/docs
```

### repo remove

```bash
platform-spec repo remove <n>
```

Unregister a repo. Automatically rebuilds the index without it.

### repo list

```bash
platform-spec repo list
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
platform-spec scan            # all repos
platform-spec scan <repo>     # one repo
```

Rebuilds the search index. Usually not needed — the index auto-rebuilds when:
- A repo is added or removed
- Any spec file is modified (detected on next search)

Force a manual scan if auto-detection isn't catching changes.

---

## 3. Searching

### search

```bash
platform-spec search <query> [repo]
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
platform-spec read <n> [repo]
```

Print the full content of a spec. Matches by name (partial match).

```bash
platform-spec read refund              # first match across all repos
platform-spec read signup product      # from specific repo
```

If multiple specs match, shows all matches and displays the first.

---

## 5. Browsing

### list

```bash
platform-spec list                     # all specs, all repos
platform-spec list <repo>              # one repo
platform-spec list <project>           # one project (if not a repo name)
```

### projects

```bash
platform-spec projects
```

### tags

```bash
platform-spec tags                     # all tags with counts
platform-spec tags billing             # specs tagged "billing"
```

### related

```bash
platform-spec related <n>
```

Finds specs related to a given spec by analyzing its title and tags.

### recent

```bash
platform-spec recent [n]               # default: last 10
```

---

## 6. JSON output

Every command has a JSON equivalent for programmatic use by agents.

### json search

```bash
platform-spec json search <query> [repo]
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
platform-spec json read <n>
```

Returns:
```json
{
  "path": "/full/path/to/spec.md",
  "content": "full markdown content..."
}
```

### json list / json repos / json related / json tags / json stats

All return JSON arrays or objects. See `platform-spec json help` for details.

---

## 7. Maintenance

### stats

```bash
platform-spec stats
```

Shows repo count, spec count, projects, tags, file types, DB size, last scan time.

### inspect

```bash
platform-spec inspect
```

Dumps the full index as readable text. Useful for debugging.

### reset

```bash
platform-spec reset
```

Deletes everything (index + repo list) and starts fresh. Asks for confirmation.

### Manual rebuild

```bash
rm ~/.platform-spec/specs.db
platform-spec scan
```

The nuclear option. Deletes the cache and rebuilds from source files.
