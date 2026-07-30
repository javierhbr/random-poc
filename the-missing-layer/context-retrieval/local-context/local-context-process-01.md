Local availability of repositories and context sources

1. Current constraint

One of the main challenges of the process is that agents cannot always use MCP servers freely or uniformly.

Depending on the environment, there may be limitations related to:

* MCP server availability.
* Compatibility with the agent or model used.
* Access permissions.
* Authentication.
* Connectivity.
* Corporate restrictions.
* Differences between tools and clients.
* Context persistence across sessions.
* Ability to reliably query multiple repositories.

Additionally, it still needs to be validated whether remote access via MCP can offer the same level of precision, speed, isolation, and control as the process based on local files indexed by Local Search.

For these reasons, the current process maintains as a principle that the necessary documentation must be available locally.

⸻

2. Local availability requirement

For Local Search to index information, the files must exist within the local file system.

This includes:

* The platform's consolidated context.
* Documentation of domains and bounded contexts.
* Functional specifications.
* Documents generated through reverse engineering.
* Component repositories.
* Historical documents used as evidence.
* References from upstream and downstream services.

Sources can be found in different directories, volumes, or workspaces. Everything does not need to be within a single main repository.

Local Search can register each directory independently and treat it as a queryable repository.

⸻

3. Strategy based on multiple local clones

The first strategy consists of locally cloning each necessary repository.

For example:

/workspaces/
├── platform-context/
├── payment-service/
├── account-service/
├── notification-service/
├── fraud-service/
└── settlement-process/

Each repository maintains:

* Its own Git history.
* Its remote configuration.
* Its branches.
* Its update cycle.
* Its internal structure.
* Its specifications directory.

The relevant directories are subsequently registered in Local Search.

For example:

platform-current-reality
payment-service-specs
account-service-specs
notification-service-specs

This strategy allows independence between repositories to be maintained and avoids introducing dependencies within the main repository.

⸻

4. Advantages of independent clones

Keeping each repository cloned independently provides:

* Full access to code and documentation.
* The ability to switch branches.
* Access to change history.
* Updates via git pull.
* Local execution of reverse engineering.
* Direct indexing with Local Search.
* Clear separation between components.
* Lower coupling with the context repository.
* The ability to work with private repositories according to the user's permissions.

The main disadvantage is operational: the user must manage several clones, paths, credentials, and update processes.

⸻

5. Limitations of Git submodules

An alternative considered is using Git submodules to incorporate other repositories within the main workspace.

For example:

/platform-knowledge/
├── current-reality/
└── components/
    ├── payment-service/
    ├── account-service/
    └── notification-service/

However, submodules present an important limitation for this use case:

A submodule references an entire repository and does not allow selecting only a specific directory within that repository.

This means that if only the following directory is needed:

payment-service/specs/

the submodule must incorporate the reference to the entire payment-service repository.

This restriction can be problematic when:

* The repository is very large.
* Only a small section of documentation is needed.
* You don't want to expose or copy all the code.
* There are many components.
* The main workspace must remain lightweight.
* Users are not familiar with handling submodules.
* Errors occur due to uninitialized or outdated submodules.

⸻

6. Additional complexity of submodules

In addition to requiring the entire repository, submodules introduce other difficulties:

* The main repository stores a reference to a specific commit.
* Changes in the child repository are not updated automatically.
* Submodules must be explicitly initialized and updated.
* Changing the submodule's commit generates a change in the parent repository.
* Users can end up working with different versions.
* Cloning operations require additional commands.
* Branch handling can be confusing.
* Pipelines must account for submodule initialization.
* Agents may accidentally interpret the structure as a single repository.

For a context-retrieval-oriented system, this relationship can add more complexity than necessary.

The goal is not to build a code dependency between repositories, but to have documentation available locally for search and analysis.

⸻

7. Alternative: local materialization without a Git relationship

A solution being explored consists of using GitHub's capabilities, potentially through its MCP integration, to obtain the necessary content from a repository and materialize it within a local directory without keeping it as a submodule.

The result would be a local copy of the necessary files, but without maintaining a nested Git relationship within the main repository.

For example:

/platform-knowledge/
├── current-reality/
└── external-context/
    ├── payment-service-specs/
    ├── account-service-specs/
    └── notification-service-specs/

These directories would contain synchronized copies of the relevant documentation, but would not necessarily include:

* The .git directory.
* The complete history.
* The branches.
* The remote configuration.
* All the content of the original repository.

This avoids the need to use Git submodules and allows incorporating only the relevant paths.

⸻

8. Partial content selection

The main advantage of this strategy is being able to select a specific path within a repository.

For example:

Repository:
github.com/company/payment-service
Required path:
docs/specs/

The process could copy only:

docs/specs/

into:

external-context/payment-service-specs/

Without necessarily downloading:

* The complete source code.
* Pipelines.
* Assets.
* Development files.
* Tests.
* Other directories not related to context.

This allows building a smaller, more focused knowledge workspace.

⸻

9. Two modes of materialization

Local materialization can be used in two ways.

9.1 Materialization of existing documentation

When the remote repository already contains validated functional specifications, only the documentation directories need to be copied.

Example:

payment-service/docs/specs/

This is appropriate when the reverse engineering process has already been executed and the results were published in the component's repository.

9.2 Materialization of code for reverse engineering

When a functional specification does not yet exist, it may be necessary to obtain the source code or a sufficient part of the repository to run reverse engineering locally.

In that case, the following can be materialized:

* The complete repository.
* A set of code directories.
* Manifests and configuration files.
* API definitions.
* Functional tests.
* Files required to understand dependencies.

The selection must ensure that the analysis retains enough context to correctly interpret the behavior.

Copying only an isolated directory may be insufficient when the functionality depends on shared modules, configurations, or contracts located in other paths.

⸻

10. Difference between clone, submodule, and materialization

The three strategies serve different purposes.

Strategy	Git History	Full Repository	Directory Selection	Relationship to Parent Repository	Main Use
Independent clone	Yes	Usually yes	Limited via additional techniques	No	Development and full analysis
Git submodule	Yes	Yes	No	Yes	Versioned dependency between repositories
Local materialization	Not necessarily	No	Yes	No	Context, documentation, and indexing

For this process, local materialization is not intended to replace Git as a development tool.

Its goal is to create a consumable and indexable copy of the sources needed by agents.

⸻

11. Potential role of GitHub MCP

GitHub MCP can act as an access layer to:

* Discover repositories.
* Query file trees.
* Select directories.
* Retrieve specific files.
* Retrieve documentation.
* Query branches or commits.
* Identify changes.
* Materialize content locally.
* Update previously downloaded copies.

Within this architecture, MCP would not necessarily replace Local Search.

The responsibilities would be different:

GitHub MCP

Allows access and retrieval of content from GitHub.

Synchronization layer

Materializes or updates the selected files in the local system.

Local Search

Indexes local files and allows retrieving them through semantic searches and filters by repository.

Agent

Decides which sources to consult, opens the results, and processes the content.

The flow would be:

GitHub
   ↓
GitHub MCP or API
   ↓
Local materialization
   ↓
Context directories
   ↓
Local Search
   ↓
Local and vector index
   ↓
Agents and models

⸻

12. Why keep a local copy even if MCP exists

Even if MCP allows querying GitHub directly, keeping a local copy can continue to be useful.

The local copy provides:

* Faster searches.
* Temporary offline operation.
* Controlled vector indexing.
* Isolation by directories.
* Consistency across different agents.
* Less dependence on API rate limits.
* Reduced remote calls.
* The ability to work with multiple sources together.
* Access to locally generated documentation.
* Control over the exact version of indexed content.
* Reproducibility of analyses.

MCP can become the acquisition or synchronization mechanism, while Local Search remains the retrieval mechanism.

⸻

13. Risk of duplication and staleness

Local materialization introduces a risk: the copy can become outdated relative to the original repository.

For this reason, each materialized source must record metadata such as:

source:
  provider: github
  repository: company/payment-service
  branch: main
  path: docs/specs
  commit: 4f8a21c
  synchronized_at: 2026-07-30T10:30:00-05:00
  synchronization_method: github-mcp

This metadata makes it possible to know:

* Where the content came from.
* Which branch was used.
* Which path was copied.
* Which commit it represents.
* When it was synchronized.
* How it should be updated.

Without this information, a local copy could be mistaken for the original source or considered current when it is no longer valid.

⸻

14. Source manifest

The context workspace should maintain a manifest that defines the external sources that must be available.

For example:

sources:
  - id: payment-service-specs
    type: github-directory
    repository: company/payment-service
    branch: main
    remote_path: docs/specs
    local_path: external-context/payment-service-specs
    local_search_repository: component-payment-service
    sync_strategy: incremental
  - id: account-service-specs
    type: github-directory
    repository: company/account-service
    branch: main
    remote_path: docs/specs
    local_path: external-context/account-service-specs
    local_search_repository: component-account-service
    sync_strategy: incremental

This manifest can be used by Uncle Dev, a synchronization CLI, or a skill to:

1. Validate which sources exist.
2. Download the missing ones.
3. Update the copies.
4. Detect changes.
5. Re-run the Local Search scan.
6. Record the indexed version.

⸻

15. Recommended synchronization process

The process could run as follows:

1. Read the source manifest.
2. Validate credentials and permissions.
3. Query the remote status.
4. Compare the remote commit with the last synchronized commit.
5. Download only the configured paths.
6. Replace or update the local copy.
7. Preserve the provenance metadata.
8. Detect added, modified, or deleted files.
9. Run Local Search only on the changes.
10. Update the vector index.
11. Record the synchronization result.
12. Report sources that could not be updated.

⸻

16. States of a source

Each local source could have one of the following states:

* Synchronized: matches the configured remote version.
* Outdated: a newer remote version exists.
* Not available: the local copy does not exist.
* Access denied: there are no permissions to query the repository.
* Partial: some files could not be retrieved.
* Modified locally: the copy contains changes not coming from the source.
* Unverifiable: it was not possible to check the remote status.
* Pending indexing: it is up to date locally, but Local Search has not scanned it yet.
* Indexed: it is available in the Local Search index.

This distinction avoids assuming that an existing directory necessarily contains current information.

⸻

17. Separation between managed and materialized content

It is advisable to physically separate documents created and maintained within the workspace from copies generated from external sources.

For example:

/platform-knowledge/
├── authored/
│   ├── current-reality/
│   ├── domains/
│   └── shared-rules/
│
├── generated/
│   └── reverse-engineering/
│
├── external/
│   ├── payment-service-specs/
│   ├── account-service-specs/
│   └── notification-service-specs/
│
└── source-manifest.yaml

authored

Contains documentation maintained and validated directly by the team.

generated

Contains documentation generated by agents or reverse-engineering processes that may require validation.

external

Contains copies materialized from other repositories and should not be edited manually.

This separation helps prevent accidental modifications to content that will be overwritten during the next synchronization.

⸻

18. Recommended architecture

The recommended architecture is hybrid:

Remote sources
GitHub repositories
        │
        ├── Full clone when deep development or reverse engineering is needed
        │
        └── Partial materialization when only documentation is needed
                    ↓
          Local context workspace
                    ↓
           Provenance manifest
                    ↓
              Local Search
                    ↓
       SQLite + vector indexes
                    ↓
          CLI and skill for agents

This architecture allows selecting the appropriate strategy for each source without forcing the same mechanism to be used for all repositories.

⸻

19. Criteria for choosing the strategy

Use an independent clone when:

* You need to analyze the complete code.
* Development will be performed.
* Access to history is required.
* You need to switch branches.
* Reverse engineering depends on multiple modules.
* Local tests or tools must be run.

Use partial materialization when:

* Only documentation is needed.
* The repository is too large.
* Only a single directory is required.
* The source will be used exclusively as context.
* Git operations are not needed.
* You want to avoid submodules.

Use submodules when:

* There is a real versioned dependency between repositories.
* The parent repository must point to an exact commit of the child repository.
* The team already has a clear process for managing them.
* The Git relationship must be formally preserved.

Submodules should not be used solely to make context search easier.

⸻

20. Core principle

The core principle of this stage is:

Sources can live in multiple remote repositories, but the context used by Local Search must be able to be materialized, versioned, and indexed locally in a controlled way.

MCP can facilitate access and synchronization.

Independent clones allow full analysis to be performed.

Partial materialization allows retrieving only the necessary documentation.

Git submodules should be reserved for real dependencies between repositories, not as a general mechanism for assembling a knowledge workspace.
