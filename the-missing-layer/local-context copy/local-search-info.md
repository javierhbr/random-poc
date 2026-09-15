`# How to Define the Search Scope with Local Search

## Introduction

Local Search Tool makes it possible to index Markdown files, documentation, and other text-based content so it can be discovered from any session and by different AI agents.

Searches can be performed using:

- Semantic content.
- Document names.
- Tags and metadata.
- Result relevance or weight.
- Relationships identified through the vector database and knowledge graph.

The goal is not simply to return a direct answer. Local Search identifies the most relevant documents so the agent can open them, read them, and extract the necessary information.

This allows the agent to use the original content as its source of context, improving the accuracy and quality of its responses.

## The Problem: Searching Across Too Many Repositories

When a user has only one or two indexed repositories or directories, searching across all of them is usually not a problem.

The situation changes when there are 15, 20, or even 30 different indexed sources. In that scenario, the primary challenge is not necessarily performance, but contextual accuracy.

A global search could mix:

- Current information with historical documentation.
- Implemented specifications with future proposals.
- Documentation from different components.
- Temporary research with official decisions.
- Content related to different platforms or domains.

Therefore, the more sources that are indexed, the more important it becomes to explicitly define the scope of each search.

## The Solution: Limit the Search to Indexed Repositories

The scope of a search is defined by specifying which indexed repository—or group of repositories—Local Search should use.

A search can use:

- A single indexed repository.
- Multiple related repositories.
- The project’s default repositories.
- The default repositories plus additional repositories explicitly included in the prompt.

This allows the agent to search only within the context relevant to the task.

> Semantic search determines which content is relevant. The scope determines the information universe in which that search takes place.

## Default Configuration per Project

Each project can include a Local Search configuration file inside its `.agents` directory:

```text
.agents/local-search.yaml
```

This file declares the indexed repositories that should be used by default whenever an agent works within that project.

For example, if we are working on the `payments-service` component, we will probably need to search:

1. The indexed repository for the component itself.
2. The indexed repository containing the platform’s official knowledge.

A conceptual configuration could look like this:

```yaml
repositories:
  default:
    - payments-service
    - payments-platform-current-reality
```

With this configuration, any agent session started within the project can automatically limit its searches to those two sources.

The user does not need to specify them in every prompt, and the agent starts with access to:

- The component’s local context.
- The platform’s official high-level view.
- The rules, dependencies, and decisions connecting the component to the rest of the system.

## Extending the Scope Through the Prompt

The default repositories represent the project’s normal context, but they are not a permanent limit.

If a task requires information from another indexed source, the user can explicitly add it in the prompt.

For example:

> Explain the relationship between Component A and Component B. Use the default Local Search configuration and also include the indexed repository `component-b`.

In this case, the agent will use:

- The repositories configured by default in `.agents/local-search.yaml`.
- The additional `component-b` repository specifically requested for the task.

This mechanism avoids permanently adding every possible repository to the project configuration. The normal context remains focused, while additional sources are included only when needed.

## Indexing the Entire Directory vs. Dividing It by Context

Local Search can index an entire directory and treat all its content as a single search source. This is a valid approach and may be sufficient when the documentation is limited or when all files belong to the same context.

However, when a directory contains different types of knowledge, it is better to divide the index based on the purpose, usage, or context of the information.

For example, a single Knowledge Base may contain:

- The platform’s current reality.
- Detailed component documentation.
- PRDs and changes currently in development.
- Research and technical evaluations.
- Temporary notes or content that has not yet been validated.

Although all these documents could be indexed together, doing so would make the search space too broad. The agent could retrieve content that is semantically similar to the query but belongs to a different context and is therefore irrelevant.

For example, a search about how payments currently work could retrieve:

- Documentation describing the current implementation.
- A PRD describing a future solution.
- Research about an alternative provider.
- Preliminary notes from a proof of concept.

All these results may discuss payments and have high semantic similarity, but they do not represent the same reality or carry the same level of authority.

By indexing each area separately, the scope becomes the first relevance boundary. Local Search then performs the semantic search only within the selected context.

The process works as follows:

1. **The index or repository defines where to search.**
2. **Semantic search determines which documents are most relevant within that space.**
3. **The agent opens and analyzes the selected sources to construct its response.**

This separation produces more precise searches, reduces noise, and improves the quality of the results provided to the agent.

> Local Search can index everything, but it should not always search everything. Dividing content by usage or context prevents semantically similar information from a different reality from being included.

## Strategy for Organizing a Knowledge Base

In a large Knowledge Base, indexing everything as a single source is not always the best approach.

A more effective strategy is to index its main directories separately. Even if they all belong to the same physical repository, each directory can become an independent logical source for Local Search.

For example:

```text
knowledge-base/
├── current-reality/
├── components/
├── work-in-progress/
├── research/
└── scratchpad/
```

Each section serves a different purpose.

### `current-reality`

Contains the current operational truth:

- How the platform works today.
- Capabilities currently available in production.
- Active processes.
- Current decisions.
- Existing integrations and dependencies.

Example search:

> How do payments currently work? Search only in `platform-current-reality`.

### `components`

Contains detailed information about the platform’s components:

- Responsibilities.
- Interfaces.
- Inputs and outputs.
- Dependencies.
- Events produced and consumed.
- Data persistence.
- Internal flows.

Example:

> Explain how the different components participate in payment processing. Search in `platform-components`.

### `work-in-progress`

Contains information that does not yet represent the current reality:

- PRDs.
- Proposals.
- Product intentions.
- Designs under evaluation.
- Changes currently in development.
- Pending decisions.

Example:

> What changes are planned for the payment system? Search in `platform-work-in-progress`.

### `research`

Contains research and exploratory material:

- Technology evaluations.
- Comparisons.
- Proofs of concept.
- External references.
- Alternatives that have not yet been approved.

### `scratchpad`

Contains temporary notes or information that has not yet been processed, validated, or promoted to an official section.

Results found here should be considered preliminary rather than a definitive source of truth.

## Example of Logical Indexes

The previous structure could be represented as independent sources:

```yaml
repositories:
  available:
    - platform-current-reality
    - platform-components
    - platform-work-in-progress
    - platform-research
    - platform-scratchpad
```

Each index can point to a different directory within the same Knowledge Base.

This allows the user and the agent to distinguish between questions such as:

- How does the system currently work?
- How is this capability distributed across the components?
- What changes are currently in development?
- What alternatives have been researched?
- What information is still preliminary?

## Complete Example

Suppose we are working inside the `component-a` repository.

Its default configuration could be:

```yaml
repositories:
  default:
    - component-a
    - platform-current-reality
    - platform-components
```

If the user asks:

> How does Component A currently process a transaction?

Local Search will use only the default repositories.

However, if the user asks:

> How does Component A interact with Component B during a transaction? Include the indexed repository `component-b`.

The search will use:

```text
component-a
platform-current-reality
platform-components
component-b
```

If the user wants to compare the current implementation with a future proposal, they could ask:

> Compare how payments currently work with the proposed changes. Search in `platform-current-reality`, `platform-components`, and `platform-work-in-progress`. Clearly distinguish between what already exists and what is still in development.

This separation prevents the agent from presenting a future proposal as though it were already available in production.

## Recommended Principles

### 1. Configure the Normal Context

Each project should declare the repositories it normally needs to search during regular work.

### 2. Keep the Default Scope Small

It is not necessary to include every indexed repository. Only repositories that provide recurring and directly relevant context should be configured as defaults.

### 3. Add Sources on Demand

When a task requires additional information, the prompt should explicitly identify the repository that needs to be added.

### 4. Separate Reality, Intent, and Research

Current documentation, future proposals, and experimental notes should not share the same search scope unless there is an explicit reason to search across them.

### 5. Divide Indexes by Usage and Context

Although Local Search can index an entire directory, separate indexes should be created when its content represents different purposes, states, or levels of authority.

The separation does not necessarily need to follow the repository’s physical structure. It should follow the logical boundaries of the knowledge and the ways in which that content will be searched.

The goal is not to create as many indexes as possible. The goal is to prevent a search from including similar documents that do not belong to the context of the question.

### 6. Use Descriptive Names

Index names should clearly communicate their content and level of authority:

```text
platform-current-reality
platform-components
platform-work-in-progress
platform-research
platform-scratchpad
```

### 7. Request Traceability

The agent should identify which documents it used and the indexed repositories from which they were retrieved. This makes it possible to verify the response and quickly return to the original sources.

## Outcome

This strategy turns Local Search into a contextual knowledge layer for each project.

The combination of default repositories and repositories added on demand makes it possible to:

- Reduce irrelevant results.
- Avoid mixing current documentation with future proposals.
- Improve the accuracy of the context provided to the agent.
- Keep different areas of knowledge separate.
- Support work across related components.
- Scale from a few repositories to dozens of indexed sources.
- Produce verifiable responses grounded in the original documents.

The central idea is simple:

> Each project defines its normal context. Each prompt can extend that context when the task requires it. Local Search searches only within that scope and provides the agent with the most relevant sources needed to understand the problem and respond accurately.`