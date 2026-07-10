I think you mean Google’s Open Knowledge Format (OKF) (not “Open Acknowledge Format”). It was introduced by Google Cloud in 2026 as an open, vendor-neutral specification for organizing knowledge so both humans and AI agents can consume it effectively.  

The idea is surprisingly simple:

Instead of storing knowledge in proprietary databases, wikis, or AI-specific formats, you store it as a directory of Markdown files. Each file represents a single concept (an API, database table, metric, playbook, business rule, architecture decision, etc.) with a small YAML metadata section at the top.

For example:

---
type: API Endpoint
title: Create Customer
description: Creates a new customer record
tags:
  - customer
  - api
resource: https://internal.docs/api/customer
timestamp: 2026-07-10
---
# Purpose
Creates a customer in the CRM.
## Inputs
...
## Outputs
...
## Related
- [Customer Model](customer.md)
- [Authentication](authentication.md)

Why Google created it

Current AI systems struggle because company knowledge is scattered across:

* Confluence
* Google Docs
* Notion
* PDFs
* Wikis
* Source code
* Data catalogs
* Runbooks

RAG (Retrieval-Augmented Generation) helps retrieve document fragments, but it often loses the relationships between concepts.

OKF tries to solve that by making knowledge:

* human-readable
* Git-friendly
* version-controlled
* cross-linked
* easy for AI agents to traverse
* independent of any vendor or framework  

The philosophy

Google describes it as “format, not platform.”

Meaning:

* No database
* No SDK
* No runtime
* No proprietary APIs

If you can:

* open a Markdown file
* clone a Git repository

then you already know how to use OKF.  

What an OKF bundle looks like

knowledge/
    index.md
    architecture/
        system.md
        services.md
        events.md
    apis/
        create-user.md
        delete-user.md
    runbooks/
        deployment.md
        incident.md
    metrics/
        revenue.md
        churn.md
    glossary/
        customer.md
        subscription.md

Every Markdown file is one “concept.”

Those concepts link together just like documentation.

How AI agents use it

Instead of asking an LLM to search thousands of pages:

What is the customer lifecycle?

the agent can:

1. Open index.md
2. Follow links
3. Read only the relevant concepts
4. Traverse relationships intentionally

Rather than relying purely on semantic search, it navigates an explicit knowledge graph built from Markdown documents.

Comparison with other approaches

Technology	Purpose
RAG	Retrieves relevant text chunks from documents
MCP	Standard protocol for AI tools to expose capabilities and resources
AGENTS.md	Tells coding agents how they should behave
llms.txt	Helps LLMs discover website documentation
OKF	Organizes an organization’s knowledge in a portable, AI-friendly format

These are complementary rather than competing technologies.  

Why I think you’ll find it interesting

Based on the kinds of systems you’ve been designing—AI-assisted software engineering, PRDs, skills, agents, architecture documentation, and tracer-bullet development—OKF aligns very closely with your approach.

For example, your projects already include:

* PRDs
* architecture documents
* skills
* commands
* workflows
* playbooks
* design decisions

Those artifacts could each become an OKF “concept.” An AI agent could then navigate them as structured knowledge instead of treating them as unrelated Markdown files.

In fact, your vision could extend beyond the base specification by organizing concepts such as:

* Project
* Epic
* Capability
* Feature
* Requirement
* ADR
* Architecture
* API
* Domain Model
* Decision
* Workflow
* Skill
* Prompt
* Test Strategy
* Business Rule

That would effectively create an AI-native knowledge graph for software development while remaining compatible with Google’s lightweight format.

I think this has strong potential to complement your work on Uncle Dev, your PRD standardization efforts, and your spec-driven development framework by providing a common, portable knowledge layer that any AI agent—not just one specific platform—can understand.




----


Here’s how I would reshape it. Instead of opening with a technical problem, it starts with a simple analogy that everyone immediately understands. It gradually introduces the problem, then reveals why OKF is important—not as another documentation format, but as the missing representation of reality.

⸻

The Balance, Not the Ledger

Why the Future of AI-Native Software Development Depends on a Representation of Reality

Imagine opening your banking app to check how much money you have.

Instead of seeing your account balance, the application shows you every transaction you’ve made over the past ten years.

Every paycheck.

Every grocery purchase.

Every mortgage payment.

Every credit card charge.

Every transfer.

Every refund.

The information is all there.

Technically, you could calculate your balance yourself.

But no one would consider that a useful banking application.

What people really need is not the complete history of transactions—they need a representation of reality.

They need to know one simple thing:

How much money do I have right now?

The transaction history still matters. It explains how the balance came to be. It provides accountability, traceability, and historical context.

But it is not the source you consult to understand your financial reality.

The balance is.

⸻

Software organizations unknowingly make this exact mistake every day.

Over the years, we produce thousands of artifacts describing our products.

Product Requirement Documents.

Architecture Decision Records.

RFCs.

User stories.

Implementation plans.

Design documents.

Runbooks.

Technical specifications.

Each one captures a transaction in the life of the product—a decision, a change, a discussion, or an implementation.

None of them is wrong.

Together, they tell the story of how the product evolved.

But if someone asks a deceptively simple question—

How does our platform actually work today?

—the answer is rarely found in a single place.

Instead, engineers reconstruct reality by reading years of documentation, searching code repositories, reviewing tickets, and asking the people who happen to remember.

We have an incredibly detailed ledger.

What we lack is the balance.

⸻

This challenge has become even more visible with the rise of AI-assisted software development.

Large Language Models excel at reasoning from consistent and structured knowledge.

What they struggle with is reconstructing the present from years of historical transactions.

We ask AI to infer today’s platform by reading hundreds of documents that each describe only a small moment in time.

Sometimes it succeeds.

Often it doesn’t.

Not because the AI lacks intelligence, but because we are asking it the wrong question.

We’re asking it to compute the balance from the ledger every single time.

⸻

Google recently gave this missing concept a name.

They introduced the Open Knowledge Format (OKF), an open specification for organizing organizational knowledge into small, interconnected, version-controlled concepts.

On the surface, OKF looks deceptively simple: Markdown files with metadata, linked together like a knowledge graph.

But the real innovation isn’t the file format.

The real innovation is recognizing that organizations need something fundamentally different from another documentation repository.

Google effectively gave a name to what many engineering organizations have been missing for years:

A representation of reality.

Not another collection of documents.

Not another wiki.

Not another knowledge base filled with historical decisions.

A living representation of what is true today.

⸻

This distinction changes everything.

PRDs become the record of intended change.

ADRs become the explanation of architectural decisions.

RFCs become the record of explored alternatives.

Implementation tasks describe the work that was performed.

They remain incredibly valuable.

Just as bank transactions remain valuable.

But none of them should be mistaken for reality itself.

Reality deserves its own artifact.

⸻

This idea aligns naturally with the vision behind PRD Standardization and Uncle Dev.

The purpose of standardizing PRDs has never been simply to write better documents.

Its purpose is to make product knowledge consistent, reusable, and understandable—for both humans and AI.

Every approved PRD introduces new knowledge into the organization.

A business rule changes.

A capability evolves.

A workflow is redesigned.

An API is extended.

A domain concept gains new meaning.

Today, those changes remain trapped inside the PRD that introduced them.

Months later, another PRD modifies the same capability.

Then another.

And another.

Eventually, understanding the current behavior of the platform requires reading the entire history.

Again, we end up with a ledger instead of a balance.

⸻

Imagine a different lifecycle.

A PRD no longer represents the product.

It represents only the proposed change.

The implementation delivers that change.

Tests validate it.

And once the work is complete, the organization’s Representation of Reality is updated.

The PRD remains part of history.

The Representation of Reality becomes the present.

Every future project begins from that shared understanding instead of reconstructing it from years of documentation.

⸻

Within Uncle Dev, this transforms how AI participates in software development.

Rather than beginning with fragmented documentation, AI agents begin with the organization’s living Representation of Reality.

They already understand:

* the business domain,
* current platform behavior,
* architectural boundaries,
* business rules,
* APIs,
* security policies,
* operational procedures,
* coding standards,
* ownership,
* and domain language.

The PRD simply describes what will become different.

After implementation, those changes are merged back into the Representation of Reality, ensuring that the organization’s knowledge evolves alongside the software itself.

Knowledge stops lagging behind development.

It evolves with it.

⸻

Over time, this Representation of Reality becomes something far more valuable than documentation.

It becomes the organization’s collective memory.

Developers consult it.

Architects refine it.

Product managers extend it.

QA validates it.

AI agents reason from it.

New employees learn from it.

Every role operates from the same understanding of the business and the platform.

History remains available whenever context is needed.

Reality remains immediately accessible whenever decisions need to be made.

⸻

This is why I believe OKF is far more significant than another documentation standard.

Google introduced an open format.

More importantly, they gave our industry a language for something we’ve been missing:

A Representation of Reality.

Uncle Dev and PRD Standardization extend that idea one step further.

PRDs describe what is about to change.

Code implements how it changes.

Tests prove that it changed correctly.

The Representation of Reality captures what is now true.

That distinction may seem subtle.

In practice, it changes how organizations build software, preserve knowledge, onboard engineers, and collaborate with AI.

Because in the end, no one wants to reconstruct their bank balance by reading ten years of transactions.

And no engineering team should have to reconstruct their platform the same way.