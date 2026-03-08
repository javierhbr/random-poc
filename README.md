custom-skills/sdd/bmad-codex-skill
custom-skills/sdd/openspec-codex-skill
custom-skills/sdd/speckit-codex-skill

I wasnt to create an Agent, Skills and rules to the best od thes three skills, to create a unified spec-driven development workflow that combines the strengths of BMAD's progressive planning and agent roles, OpenSpec's spec-first approach and artifact management, and Speckit's focus on executable specifications.

I want to use the openspec-codex-skill for 




I want to create an Agent, Skills and rules to help the platform teams to follow the SDD methodology using these three skills, on a platform with multiple artifacts and teams using the best of these three skills, to create a unified spec-driven development workflow that combines the strengths of BMAD's progressive planning and agent roles, OpenSpec's spec-first approach and artifact management, and Speckit's focus on executable specifications.

- custom-skills/sdd/bmad-codex-skill
- custom-skills/sdd/openspec-codex-skill
- custom-skills/sdd/speckit-codex-skill



think if we can simplify the workflow methodoloty described on [team-proposal.md](custom-skills/sdd/unified-sdd-methodology/team-proposal.md) to make the implementation in phases .  but I want to start from the beginning the intrataction from plarform to development and deploy, and how the agents will interact with the platform and teams, and how the skills will be used in each phase, and how the rules will be applied in each phase.

I want to unserstant from  platform to development  the phases.  but 


split the implementation on 2  iterations:

Iteration 1: focus on the first 3 phases: Platform, Route, Specify
- Platform
- Route
- Specify

Iteration 2: focus on the remaining 2 phases: Plan, Deliver
- Plan
- Deliver can be split into Build and Deploy if needed in the future


now for eact items in the first iteration 2, I want to define the following:
1. The main objectives and outcomes of each phase.
2. concepts and activities to learn and apply in each phase.
3. The specific agent roles and responsibilities in each phase.
4. The skills that will be used in each phase and how they will be applied.
5. The rules that will govern the interactions and outputs in each phase.
6. The expected artifacts and deliverables from each phase.
7. The criteria for moving from one phase to the next.
8. The potential challenges and mitigation strategies for each phase.
9. The feedback and iteration process for continuous improvement in each phase.


Phases:
- Plan
- Deliver can be split into Build and Deploy if needed in the future


I want it super Clear , simple and actionable for the teams to follow, with a focus on practical implementation and real-world application of the SDD methodology using the combined strengths of the three skills.


custom-skills/sdd/unified-sdd-methodology/team-proposal.md
custom-skills/sdd/unified-sdd-methodology/iteration-2-playbook.md
custom-skills/sdd/unified-sdd-methodology/iteration-1-playbook.md


I want to create an Agent, Skills and rules to help the platform teams to follow the SDD methodology using these three skills, on a platform with multiple artifacts and teams using the best of these three skills, to create a unified spec-driven development workflow that combines the strengths of BMAD's progressive planning and agent roles, OpenSpec's spec-first approach and artifact management, and Speckit's focus on executable specifications.


custom-skills/sdd/unified-sdd-methodology/team-proposal.md
custom-skills/sdd/unified-sdd-methodology/iteration-2-playbook.md
custom-skills/sdd/unified-sdd-methodology/iteration-1-playbook.md


Iteration 1: focus on the first 3 phases: Platform, Route, Specify
- Platform
- Route
- Specify

Iteration 2: focus on the remaining 2 phases: Plan, Deliver
- Plan
- Deliver can be split into Build and Deploy if needed in the future



CReate one agent by role, and each agent will have access to the three skills, but will use them differently based on their responsibilities in each phase.

| Primary owner |
| ------------- |
| Architect     |
| Team Lead     |
| Product       |
| Architect     |
| Team Lead     |
| Developer     |


I want the each roles to have clear responsibilities and interactions with the platform and teams, and to use the skills in a way that supports their role in the SDD workflow. For example, the Architect might use the BMAD skill for high-level planning and design, while the Developer might use the Speckit and/or OpenSpec skill for writing executable specifications and implementing features.

Prompt examples:
- For the Architect: "Using the BMAD skill, create a high-level architecture plan for the new feature, ensuring it aligns with our platform's principles and constraints."
- For the Team Lead: "Using the OpenSpec skill, break down the feature into specific tasks and create a roadmap for the development team, ensuring that all tasks are clearly defined and traceable to the specifications."
- For the Developer: "Using the Speckit skill, write executable specifications for the assigned tasks, ensuring that they are clear, testable, and aligned with the overall architecture and roadmap."
- For the Product: "Using the OpenSpec skill, define the user stories and acceptance criteria for the new feature, ensuring that they are aligned with the business goals and user needs."
- For the Architect: "Using the BMAD skill, review the architecture plan and provide feedback on any potential risks or improvements, ensuring that it remains aligned with our platform's principles and constraints."
- For the Team Lead: "Using the OpenSpec skill, monitor the progress of the development team and ensure that all tasks are being completed according to the specifications, providing support and guidance as needed."
- For the Developer: "Using the Speckit skill, implement the assigned tasks according to the executable specifications, ensuring that all code is well-documented and tested."
- For the Product: "Using the OpenSpec skill, review the user stories and acceptance criteria with the development team, providing feedback and ensuring that they are being met throughout the development process."




Think how to crete a skills  that helpt to start the methodology from the very beginning on a platform already exist and with teams already working, to help them set the best way the `Iteration 1 phases: Platform phase` "create shared context and durable rules" to review and document the platform's current state, identify gaps and areas for improvement, and establish a shared understanding of the principles and constraints that will guide the SDD workflow. This skill could be called "Platform Contextualizer" and would use a combination of the skills that fits the most to facilitate discussions, gather information, and document the platform's context in a way that is accessible and actionable for all teams involved.



## Phase guide and prompt catalog

### Platform

Primary owner: `Architect`

Goal:
- create shared context and durable rules for the platform

Use this phase to:
- document current constraints and conventions
- define platform principles and guardrails
- establish role boundaries for later phases

#### Role instructions and prompt examples:

##### `Architect`
  - use `BMAD` first for brownfield context and role framing
  - use `OpenSpec` to encode durable context
  - use `Speckit` to turn principles into explicit rules

###### Prompt examples:
  - prompt: "Using the BMAD skill, review the current platform, identify its architectural constraints, and draft a shared platform baseline that teams can use during Platform, Route, and Specify."
  - prompt: "Using the BMAD skill, create a high-level architecture plan for the platform baseline, ensuring it aligns with our platform's principles and constraints."

##### `Team Lead`
  - provide current team conventions, delivery constraints, and adoption risks
  - use `BMAD` to surface operating realities from active teams
  - use `OpenSpec` to capture durable team-level context that should become shared
###### Prompt examples:
  - "Using the BMAD and OpenSpec skills, document the current team conventions, handoff points, and delivery constraints that the shared platform baseline must respect."