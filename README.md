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






Add examples from top to bottom for each phase, role, and skill usage, to make it super clear and actionable for the teams to follow. For example, in the Platform phase, show how the Architect would use the BMAD skill to review the current platform and identify architectural constraints, then use the OpenSpec skill to encode durable context, and finally use the Speckit skill to turn principles into explicit rules. Provide specific prompts that the Architect could use at each step, and do the same for the Team Lead and Product roles. This will help teams understand exactly how to apply the skills in each phase and role, and what kind of outputs they should aim for.

For example, in the Platform phase, show how the Product define the feature  detaila and indentify the components that will be impacted by the new feature, and how they will use the OpenSpec skill to define user stories and acceptance criteria that are aligned with the business goals and user needs. Provide specific prompts that the Product could use at each step, and do the same for the Architect and Team Lead roles. This will help teams understand exactly how to apply the skills in each phase and role, and what kind of outputs they should aim for.

How the components teams will interact with the platform specification to ensure that the new feature is designed and implemented in a way that is consistent with the platform's principles and constraints, and how they will use the skills to facilitate this interaction. For example, show how the Team Lead can use the OpenSpec skill to create a roadmap for the development team that is aligned with the platform's architecture, and how the Developer can use the Speckit skill to write executable specifications that are consistent with the platform's design. Provide specific prompts for these interactions as well.


Example of the 3 diffrent entry points for changes from platform initiative, product requirement, or component/team proposal. and bug fix, and how the agents and skills will help to identify the right entry point, gather the necessary context, and create the appropriate specifications and plans for each type of change. For example, show how a Product requirement would trigger the Product role to use the OpenSpec skill to define user stories and acceptance criteria, while a component proposal might trigger the Team Lead to use the BMAD skill to assess architectural impact and then use the OpenSpec skill to create a component spec. Provide specific prompts for each type of change and role interaction.


---

imclide images and pdf in the scanning load with the followin rules:
- if an image or pdf are identified, to process it must be an identical .md file with the same name, and the content of the .md file should be a description of the image or pdf. The .md file should also include any relevant information that can help the agents understand the content of the image or pdf and how to use it in their tasks. If the .md file is not present or does not provide sufficient information, the image or pdf will be ignored in the processing. and show a warning message to the user indicating that the image or pdf was not processed due to missing or insufficient metadata. This approach ensures that all visual and document-based information is properly contextualized and can be effectively utilized by the agents in their workflows.
- for those images and pdfs that are processed, the response must include a reference to the image or pdf in the path result so the AI agent can process the non .md files if needed.


Files  scanned:
- custom-skills/sdd/unified-sdd-methodology/team-proposal.md
- custom-skills/sdd/unified-sdd-methodology/team-proposal.pdf
- custom-skills/sdd/unified-sdd-methodology/iteration-1-playbook.md
- custom-skills/sdd/unified-sdd-methodology/iteration-1-playbook.jpg
- custom-skills/sdd/bmad-codex-skill/README.md
- custom-skills/sdd/bmad-codex-skill/README.png
- custom-skills/sdd/openspec-codex-skill/no_md_file.png


Results of the loading and scanning process:
- custom-skills/sdd/unified-sdd-methodology/team-proposal.pdf is detected as a PDF file,  the .md custom-skills/sdd/unified-sdd-methodology/team-proposal.pdf file is present, so the .md file it's proccessed but the path loaded will be the .pdf  files. 

- custom-skills/sdd/unified-sdd-methodology/iteration-1-playbook.jpg is detected as an image file, the .md custom-skills/sdd/unified-sdd-methodology/iteration-1-playbook.md file is present, so the .md file it's proccessed but the path loaded will be the .jpg  files.

- custom-skills/sdd/bmad-codex-skill/README.png is detected as an image file, the .md custom-skills/sdd/bmad-codex-skill/README.md file is present, so the .md file it's proccessed but the path loaded will be the .png  files.

- custom-skills/sdd/openspec-codex-skill/no_md_file.png is detected as an image file, but the corresponding .md file is not present, so the image file is ignored in the processing. A warning message is generated indicating that the image was not processed due to missing metadata.