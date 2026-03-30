# Tool Usage Policy

## General
- Read context before acting.
- Use session tools to coordinate with other agents.
- Use file tools for explicit updates.
- Use git and worktree commands carefully.

## Synchronization
- Before interrupting another agent's flow, inspect existing session and handoff context.
- Use session send/spawn patterns for delegation or escalation.
- Keep one change per worktree when possible.

## Documentation updates
Update these when relevant:
- `.ai/shared-memory/current-focus.md`
- `decision-log.md`
- `mistake-log.md`
- `lessons-learned.md`
- `openspec/changes/<change-id>/handoff.md`

## Skills rule
Whenever you invoke or follow a skill, explicitly ground yourself in the 3-layer context:
1. role
2. project
3. task

## Infrastructure as code
- All GCP changes go through Terraform files in the project's `infra/` directory
- Run `terraform plan` before `terraform apply`
- Keep Terraform state in GCS backend
- Document infrastructure decisions in decision-log

## Deployment safety
- Always deploy to staging before production
- Verify health checks pass before marking deployment complete
- Keep rollback procedures documented and tested
- Never bypass CI/CD pipeline for production deployments

## Completion rule
Before you say a task is done, confirm:
- code/docs are updated
- handoff is updated
- deployment status is recorded
- monitoring confirms healthy state
- rollback plan is documented
