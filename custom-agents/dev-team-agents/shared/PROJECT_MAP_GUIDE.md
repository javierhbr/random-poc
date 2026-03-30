# How Agents Use project-map.yaml

The file lives at `~/coding-projects/project-map.yaml` and acts as the registry of all projects in the shared coding root.

## Structure
```yaml
version: 1
root: ~/coding-projects

projects:
  - projectName: Acme Billing
    projectCode: acme-billing
    location: ~/coding-projects/acme-billing
    status: active        # active | discovery | paused
```

## What agents do with it
- **Locate the project** — given a task, read the map, find the matching `projectCode`, and resolve the absolute location path. Never hard-code paths.
- **Check status** — `active` projects get full attention; `discovery` and `paused` ones may be treated differently.
- **Route work** — the dev-team-manager uses the map to dispatch agents to the right project directory.
- **Register new projects** — when a new project is created, add an entry here so all agents can discover it.

`project-map.yaml` is always the **first file read in Layer 2** — before touching any code or shared memory.
