# Local knowledge strategy and staleness risk

## 1. Main decision: keep context locally

To use Local Search, information must be available on the local file system.

This can be achieved through different strategies:

- Fully cloning the necessary repositories.
- Downloading or materializing only specific directories from GitHub.
- Combining full clones with partial copies.
- Maintaining proprietary documentation in local directories.
- Incorporating specifications generated through reverse engineering.

Although the need to have everything local may initially seem like a limitation, in practice it offers important advantages.

Experience shows that working directly with local files can deliver better results than relying exclusively on sources queried dynamically via MCP.

---

## 2. Why local access can be superior

MCP servers normally act as an intermediate layer between the agent and the original source.

This layer can:

- Limit the amount of information retrieved.
- Select only certain fragments.
- Apply its own filters.
- Summarize content.
- Exclude files or paths.
- Reduce the level of detail in the response.
- Impose result limits.
- Change the original structure of the information.
- Depend on the particular capabilities of each MCP implementation.

This means the agent does not always receive a complete representation of the source.

When documentation is available locally, the agent can:

- Freely browse the files.
- Open complete documents.
- Review multiple sections.
- Follow references between files.
- Compare documents.
- Inspect directory structures.
- Run repeated searches with different criteria.
- Use additional local tools.
- Access content without depending on remote filters.

For this reason, keeping context locally can provide greater control, transparency, and depth.

---

## 3. MCP as an acquisition mechanism, not necessarily the final query mechanism

The use of MCP continues to be useful, especially for accessing remote content.

For example, GitHub MCP can be used to:

- Query repositories.
- Retrieve specific directories.
- Download documentation.
- Identify relevant files.
- Materialize part of a repository locally.
- Avoid incorporating full repositories via submodules.

However, once the content has been retrieved, it may be more convenient to use it from the local file system.

The separation of responsibilities would be:

```text
GitHub MCP
    ↓
Content acquisition or synchronization
    ↓
Local file system
    ↓
Local Search
    ↓
Discovery and retrieval
    ↓
Direct reading by humans or agents
```

In this model, MCP facilitates access to sources, but does not necessarily control how knowledge is consulted during day-to-day work.

---

## 4. Benefits of keeping sources locally

Local availability provides several benefits.

### Full access

The agent can access the complete file and not just a fragment selected by a remote tool.

### Less filtering

Information does not depend on the interpretation, segmentation, or retrieval policy of an MCP server.

### Better navigation

It is possible to follow links, references, imports, tags, paths, and relationships between documents.

### Custom indexing

Local Search can apply its own strategy for chunking, vectorization, metadata, and indexing.

### Controlled isolation

Each directory can become an independent repository within Local Search.

### Search across multiple sources

Results can combine information from different directories and repositories.

### Independent operation

The search can keep working even if a remote source is temporarily unavailable.

### Reproducibility

It is possible to know exactly which version of the content was used during an analysis.

### Integration with local tools

Agents can combine Local Search with system commands, scripts, Uncle Dev, and other tools.

---

## 5. The problem Local Search helps solve

Keeping all information locally introduces a distributed structure.

Documentation can be found in:

- Different Git repositories.
- Different workspaces.
- Component folders.
- Documentation directories.
- Platform repositories.
- Generated specifications.
- Partial copies from GitHub.
- Different volumes or locations on the computer.

Without an additional layer, the user or agent would have to remember:

- Where each source is located.
- Which repository contains each feature.
- Which directory corresponds to each component.
- Which files should be reviewed.
- How to combine information from different locations.

Local Search solves this problem by registering and indexing the relevant directories as logical repositories.

The user does not need to treat all files as if they belonged to a single physical repository.

Local Search provides a common access layer over distributed sources.

---

## 6. Logical aggregation of distributed sources

The information remains physically separate, but can be queried together.

For example:

```text
~/work/platform-current-reality/
~/work/payment-service/specs/
~/work/account-service/specs/
~/external/notification-platform/docs/
~/knowledge/shared-business-rules/
```

Each directory is registered individually:

```text
platform-current-reality
component-payment-service
component-account-service
external-notification-platform
shared-business-rules
```

When performing a search, Local Search can query:

- A single repository.
- A selected set of repositories.
- All available repositories.

Therefore, Local Search creates a logical aggregation without forcing all documentation to be physically moved or duplicated into a single directory.

---

## 7. Aggregation example

Suppose you need to understand the full flow of a declined payment.

The information may be distributed as follows:

```text
platform-current-reality/
└── payments/
    └── credit-card-payment.md

payment-service/
└── specs/
    └── payment-decline.md

account-service/
└── specs/
    └── funding-source-validation.md

notification-platform/
└── docs/
    └── declined-payment-notification.md
```

Local Search allows running a single search across these repositories and delivering an aggregated result.

The result can indicate:

- Which document explains the general experience.
- Which service validates the funding source.
- Which component processes the decline.
- Which system sends the notification.
- Which tags connect all the behaviors.

The user or agent can navigate from that result to each original file.

---

## 8. Main risk: staleness of local copies

The main disadvantage of keeping sources locally is that they can become outdated relative to their source repositories.

Currently, the update largely depends on manual actions performed by a person.

For example:

- Running `git pull`.
- Switching to the correct branch.
- Re-downloading a directory.
- Querying the remote repository.
- Updating a materialized copy.
- Running a new Local Search scan.
- Verifying that the index matches the current files.

If any of these steps is not performed, Local Search may continue delivering correct results from the index's point of view, but based on an old version of the documents.

Therefore, there are two different states that must be distinguished:

1. The index matches the local files.
2. The local files match the remote source.

Local Search can guarantee the first state after a scan, but not necessarily the second.

---

## 9. Chain of information validity

For a source to be considered up to date, the following chain must remain intact:

```text
Current remote source
        ↓
Synchronized local copy
        ↓
Local Search scanned
        ↓
Updated index
        ↓
Current result for the agent
```

The chain can break at different points.

### Case 1: remote source updated, local copy old

The GitHub repository changed, but nobody updated the clone or the local copy.

### Case 2: local copy updated, index old

`git pull` was run, but Local Search did not rescan the files.

### Case 3: partial update

Some repositories were synchronized, but other related components still use older versions.

### Case 4: wrong branch

The local copy is up to date, but corresponds to a different branch than the one defined as the canonical source.

### Case 5: materialized copy without provenance

The files exist locally, but it is unknown which commit, branch, or date they came from.

---

## 10. Two different maintenance problems

It is important to separate two problems that, although related, are not the same.

### Problem A: synchronization of local copies

This problem consists of ensuring that the files available locally correspond to the current version of their remote sources.

Includes:

- Outdated clones.
- Old materialized directories.
- Incorrect branches.
- Files deleted remotely that remain locally.
- Local Search indexes not regenerated.

This is the main problem addressed at this stage.

### Problem B: maintenance of the original source

This problem consists of ensuring that the documentation stored within GitHub repositories is correct, complete, and current.

Includes questions such as:

- Who is responsible for updating the documentation?
- When should it be updated?
- How is it validated?
- How is it prevented that code changes without updating the specs?
- Which team owns each document?
- What governance process should be followed?

This second problem is important, but is outside the specific scope of this part of the process.

Even if synchronization is perfect, an incorrect or abandoned remote source will continue to produce incorrect context.

---

## 11. Local Search's specific responsibility

Local Search does not by itself solve documentation governance or guarantee that remote sources are up to date.

Its responsibility is different.

Local Search helps to:

- Register multiple directories.
- Index local files.
- Keep sources separate.
- Run searches per repository.
- Combine results from different sources.
- Find related documents.
- Show relationships between files.
- Allow agents to navigate to the original sources.
- Reduce the need to manually search across multiple directories.

Local Search solves the problem of **discovery and aggregation of distributed local context**.

It does not automatically solve the problem of **source validity**.

---

## 12. Need for a synchronization layer

To reduce the risk of staleness, the system needs an additional synchronization layer.

This layer must work before the indexing process.

Its responsibility should include:

- Identifying the remote source of each directory.
- Determining whether a more recent version exists.
- Updating full clones.
- Updating materialized directories.
- Detecting new, modified, or deleted files.
- Recording the synchronized commit or version.
- Requesting a new Local Search scan.
- Reporting which sources could not be updated.
- Avoiding silent searches over stale sources.

The complete architecture would be:

```text
Repositories and remote sources
              ↓
       Synchronization layer
              ↓
      Local directories
              ↓
          Local Search
              ↓
     SQLite and vector index
              ↓
     Aggregated results
              ↓
      Humans and agents
```

---

## 13. Minimum synchronization states

Each indexed repository should expose a clear state.

### Up to date

The local copy matches the expected remote version and Local Search has already indexed it.

### Update available

A more recent remote version exists.

### Pending scan

The local files were updated, but the index still represents an earlier version.

### Unknown origin

It cannot be determined where the local files came from.

### Unverifiable

It was not possible to query the remote source.

### Outdated

The local copy does not match the configured remote source.

### Partially synchronized

Some paths or files could not be updated.

### Modified locally

There are local changes that may be overwritten or that do not exist in the remote source.

These states must be available to both users and agents.

---

## 14. Validity metadata

Each repository registered in Local Search should include metadata that allows evaluating the validity of the information.

For example:

```yaml
repository:
  id: component-payment-service
  local_path: /work/payment-service/specs

source:
  type: git
  provider: github
  repository: company/payment-service
  branch: main
  remote_path: docs/specs
  commit: a91f24d

synchronization:
  last_checked_at: 2026-07-30T09:45:00-05:00
  last_synced_at: 2026-07-30T09:46:10-05:00
  status: current

index:
  last_scanned_at: 2026-07-30T09:47:02-05:00
  indexed_commit: a91f24d
  status: current
```

With this data, Local Search could report:

> Results come from commit `a91f24d`, synchronized and indexed on July 30, 2026.

Or it could warn:

> The local copy was updated, but Local Search has not yet regenerated the index.

---

## 15. Verification before a search

A search could include a prior validity check.

The flow would be:

1. The agent selects the repositories.
2. Local Search reviews the metadata.
3. It identifies current, unknown, or outdated repositories.
4. It runs the search.
5. It includes warnings when some source is not verified.
6. It optionally requests or runs a synchronization.
7. It rescans only the modified repositories.

The search does not necessarily need to be blocked when a source is outdated.

However, the state must be visible to avoid presenting old information as if it were current.

---

## 16. Assisted manual synchronization

A first solution can keep the manual action, but make it simpler and safer.

For example:

```bash
local-search sync component-payment-service
```

The command could:

1. Identify the repository's origin.
2. Check the remote status.
3. Update the local copy.
4. Detect changes.
5. Run the scan.
6. Update the metadata.
7. Show a summary.

It could also allow:

```bash
local-search sync --selected \
  platform-current-reality \
  component-payment-service \
  component-account-service
```

Or synchronizing all repositories related to a feature:

```bash
local-search sync --tag ER-PAYMENT-001
```

---

## 17. Automatic or semi-automatic synchronization

Later, the process can be automated using different triggers.

### When starting a session

Check whether the relevant sources have updates available.

### Before a critical search

Check the validity of the selected repositories.

### After a `git pull`

Automatically run the Local Search scan.

### After a merge or rebase

Detect changes in documentation and regenerate the index.

### At scheduled intervals

Periodically check whether remote changes exist.

### When opening a project

Synchronize only the sources associated with the current workspace.

### On agent request

Allow a skill to check the state before performing an analysis.

Automation must avoid indiscriminately updating all repositories when only a subset is needed.

---

## 18. Contextual synchronization

The most efficient strategy is to synchronize according to the task's context.

For example, to analyze credit card payments:

```text
platform-current-reality
component-payment-service
component-account-service
component-notification-service
```

Before the search, the system verifies only those sources.

This avoids:

- Querying dozens of unnecessary repositories.
- Running multiple remote operations.
- Regenerating indexes that will not be used.
- Consuming time and resources with no benefit.

The recommended principle is:

> Synchronize and scan the minimum set of sources needed for the current task.

---

## 19. Confidence indicators in results

Local Search results could include information about the validity of each source.

For example:

```text
Result 1
File: credit-card-payment.md
Repository: platform-current-reality
Status: up to date
Last synchronized: 2026-07-30
Last scanned: 2026-07-30

Result 2
File: external-account-validation.md
Repository: component-account-service
Status: update available
Last synchronized: 2026-07-24
```

This allows the agent to distinguish between:

- A semantically relevant result.
- A relevant and up-to-date result.
- A relevant but potentially stale result.

Semantic similarity should not be confused with the reliability or validity of the source.

---

## 20. Design principle

The decision to keep context locally is based on the following principle:

> It is preferable to retain complete and controlled access over sources, even if this requires managing their synchronization, than to rely exclusively on remote layers that can filter, limit, or transform the information.

Local Search makes it possible to work with distributed local knowledge without having to physically consolidate it into a single repository.

Synchronization ensures that local copies continue to represent their remote sources.

Indexing ensures that searches represent the current local files.

The combination of both layers makes it possible to build a complete, navigable, and verifiable context system.

---

## 21. Summary of responsibilities

```text
Remote source
Responsibility:
Maintain the official documentation.

Synchronization layer
Responsibility:
Keep local copies aligned with remote sources.

Local Search
Responsibility:
Index, isolate, search, and aggregate distributed local knowledge.

Agent or user
Responsibility:
Select the appropriate sources, check their validity, and process the documents found.
```

The problem of editorial maintenance of the remote source must be addressed through a separate governance process.

The problem of local synchronization must be solved through metadata, checks, and automation.

Local Search remains the layer that connects all local information and presents it as a queryable set.
