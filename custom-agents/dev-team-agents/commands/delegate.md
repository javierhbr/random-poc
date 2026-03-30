Route a task to the appropriate agent based on its type and current state.

The user will provide: a task description, change ID (optional), and project name (optional).

Follow this routing logic:

1. Read `~/coding-projects/project-map.yaml` to confirm the project exists
2. If a change ID is provided, read `openspec/changes/<change-id>/handoff.md` to understand current state
3. Apply the routing table:

| Situation | Route to |
|-----------|----------|
| Requirements unclear or missing | [role:po] |
| Need to create change folder and break down tasks | [role:manager] |
| Architecture decision or design.md needed | [role:tech-lead] |
| Web, backend, API, DB, or UI implementation | [role:sr-fullstack] |
| Architecture ownership, complex design, code review | [role:staff-fullstack] |
| Flutter/mobile implementation | [role:mobile] |
| Testing, verification, QA signoff | [role:qa] |
| GCP deployment, infrastructure, CI/CD | [role:devops] |
| Blocker escalation, cross-team issue | escalate to [role:cto] |

4. Explain your routing decision: which agent, why, and what they should do
5. Provide the delegating message for that agent, including:
   - Project code and change ID
   - What the task is
   - What context they should read
   - Expected output

Format the output as:
```
**Routing to:** <agent>
**Reason:** <why this agent owns this task>

**Message to <agent>:**
---
Project: <code>
Change: <change-id>
Task: <what to do>
Read: <what files to read first>
Expected output: <what they should produce>
---
```
