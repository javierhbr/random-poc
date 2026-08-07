# Local Search

Here is an illustrated guide explaining the concepts of Local Search based on your documentation.

---

## **The Core Idea**

**Local Search is a local knowledge retrieval layer for distributed information.** In a real-world organization, information is rarely centralized. It typically lives across many locations (e.g., specific repositories for Platform Docs, Company Standards, AWS/API Docs, ADRs, etc.).

Without Local Search, an AI agent generally only understands the files inside its current workspace. Finding information outside that workspace requires knowing *where to look first*. Local Search removes that limitation.

* **Illustration Description:** This sleek, isometric visualization models the knowledge flow. In the background, transparent, glowing data islands (representing distributed sources like ADRs, Company Standards, and Platform Docs) converge downwards via light paths into a central, glowing hexagonal platform: the **Local Search Index**. From this unified index, a holographic AI agent interface can retrieve specific "Authoritative Answer" cards efficiently.

---

## **What is Local Search?**

Local Search allows users to register multiple local directories as **repositories**. Each repository can represent a different source of knowledge, such as platform documentation, company standards, or Architecture Decision Records (ADRs).

Everything happens locally. The knowledge stays exactly where it naturally belongs on your machine. There is no need to upload documentation to a server, synchronize it to the cloud, or duplicate it inside every project.

* **Illustration Description:** This detailed photograph captures a local developer workstation monitor. The "Local Search Repository Manager" interface lists active local directories (`Platform Docs`, `ADRs`, `Domain Knowledge`) on the user’s drive. The central area visualizes these local folders glowing and emitting streams of digital documents that fuse into a simmering, stacked disk icon labeled **SHARED LOCAL KNOWLEDGE INDEX**. A prominent badge explicitly states: "100% Local. No Uploads," reinforcing the privacy and local-only nature.

---

## **More Than Vector Search**

During indexing, Local Search does more than simply record text. It analyzes every document and automatically extracts useful metadata, including attributes, keywords, patterns, and tags. These enrich the indexed content and help identify complex relationships between documents.

Because of this rich data, Local Search supports multiple retrieval strategies. Not every question should be answered using the same technique; the system can choose the most appropriate strategy.

* **Illustration Description:** This conceptual infographic visualizes the advanced indexing pipeline. A standardized stream of text documents enters a complex, glowing crystal processor. Inside, beams of light split the documents, extracting metadata. Three distinct retrieval streams emerge with distinct holographic icons: a mathematical cloud points for **Semantic/Vector Search**, a complex 3D network for **Graph Relationship Search**, and a clean database grid for **Structured Database Queries**. All three streams converge into a central interface labeled "MULTI-STRATEGY RETRIEVAL," expanding on the high-tech visual language.

---

## **The Most Important Concept**

**The agent does not need to know where knowledge is stored.**

Imagine an agent is working *only* inside `/projects/payment-service/`. To complete a task, it may need information from five or six *completely different* repositories (Security Standards, Platform Architecture, AWS Docs, etc.). Local Search is a **context retrieval system**, not simply a search engine.

* **Illustration Description:** This split-screen comparison focuses on clarity vs. confusion. On the left ("Without Local Search"), a bewildered robot avatar with a flashlight is lost in a dark, chaotic labyrinth of towering, unorganized file cabinets and folders, asking "Where is this information?" (referring to scattered sources like AWS Docs). On the right ("With Local Search"), the same robot is calm and illuminated. It stands before a sleek holographic interface. It asks, "What information is relevant?" and instantly, brightly glowing digital books labeled **Company Security Standards**, **Platform Architecture**, and **Payment ADRs** point *directly* to their authoritative sources.

---

## **Repositories Define the Search Scope**

Searching dozens—or hundreds—of repositories for every query would be inefficient. Local Search allows repositories to be associated with a project or workspace as **default knowledge sources**. Users do not need to rebuild the context or specify repositories for every query manually.

Whenever an AI session starts inside the `payment-service` project, the relevant repositories (e.g., Company Standards, Payment ADRs, AWS Docs) are automatically included in every Local Search query.

* **Illustration Description:** This isometric UI visualization demonstrates automatic context filtering. The screen displays a control panel titled "SEARCH SCOPE MANAGER." A central panel shows a local directory tree; the folder `/projects/payment-service/` is highlighted in blue. Green data streams flow from this active project folder into an adjacent "Active Repositories" list, which is illuminated and shows specific, check-marked entries like **Payment Platform**, **Payment Domain**, and **AWS Documentation**. Other grayed-out repositories illustrate excluded scope, visualizing how context defines the search focus.

---

## **Where Does Uncle Dev Fit?**

It is important to distinguish the responsibilities. Uncle Dev integrates Local Search as a native context provider for AI agents.

The goal is not for the agent to think, "I should use Local Search now." Instead, Local Search becomes part of the agent’s **Context Retrieval Process**, allowing it to automatically gather the most relevant knowledge before performing any reasoning or implementation.

```text
                 UNCLE DEV
                     │
              Context Retrieval
                     │
             Local Search Skill
                     │
              Local Search CLI
                     │
             Local Knowledge Index

```

* **Illustration Description:** This macro photograph features a transparent, layered holographic interface. The composition is a clear hierarchy, building on the established blue and gold aesthetic. At the top, a sophisticated AI avatar hologram, labeled **UNCLE DEV**, looks downward. A data layer directly beneath it is labeled **Context Retrieval (Local Search Skill)**. This skill layer manages the powerful **Local Knowledge Index** (like the core in previous images) below, which is visibly segmented into glowing data blocks labeled **Company OS**, **Platform Docs**, and **Domain Docs**. All layers are connected by pulsing light paths, emphasizing Uncle Dev as the high-level manager of the infrastructure.

---

## **Local Search Does Not Replace Traditional Search**

Local Search is an *optimization layer* for retrieving relevant knowledge quickly. It should never become a limitation. The retrieval flow is structured to be robust:

**Index first. Fall back to traditional search whenever necessary.**

This approach improves retrieval speed and context quality while preserving the flexibility of traditional file exploration (like traditional filesystem search or repository exploration).

* **Illustration Description:** This visual diagram illustrates the workflow on a transparent holographic display set within the familiar dim workstation environment. A central glowing decision diamond is labeled **NEED CONTEXT**. An arrow points downwards to a bright, pulsing button: **PATH A: LOCAL SEARCH INDEX**. If Path A shows "Insufficient Results," a red arrow automatically activates **PATH B: TRADITIONAL SEARCH (FALLBACK)**, which is symbolized by a traditional file folder icon and a `grep` command prompt on an adjacent, dimly lit screen. The illustration emphasizes optimized priority (Path A is brightly lit, Path B is grayed out but ready).