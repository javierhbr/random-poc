---
name: deploy-gcp
description: Deploy a verified change to GCP via Terraform and CI/CD. Requires QA signoff in handoff.md before proceeding. Covers Cloud Run, Cloud Functions, and infrastructure changes. Invoke with /deploy-gcp.
---


# workflow: deploy-gcp

Deploy a QA-verified change to GCP safely. Always deploys staging first, monitors health, then promotes to production.

## When to use
- QA signoff is confirmed in `handoff.md`
- Deploying a new service, feature, or infrastructure change to GCP
- Running a rollback after a failed deployment

## Do not use when
- QA verification status in `handoff.md` is not `passed` — get signoff first
- You are making an ad-hoc fix without a change folder — create one first

## Steps

### Step 1: Confirm prerequisites
1. Read `openspec/changes/<change-id>/handoff.md`
2. Confirm: `Verification status: passed` and `Ready for deployment: YES`
3. Read `design.md` for infrastructure changes to apply
4. Read `.ai/shared-memory/project-context.md` for deployment config

**STOP** if QA signoff is missing or says NO. Do not proceed.

### Step 2: Infrastructure changes (if any)
If `design.md` includes infrastructure changes:
```bash
cd infra/
terraform init
terraform plan -out=tfplan      # Review the plan carefully
terraform apply tfplan           # Apply after confirming the plan is correct
```

Review the Terraform plan for:
- Unexpected resource deletions
- IAM permission changes
- Network/firewall rule changes
- Cost implications (new instance types, scaling configs)

### Step 3: CI/CD pipeline
Trigger the CI/CD pipeline (GitHub Actions / Cloud Build):
```bash
git push origin main     # or merge the PR
```

Monitor the pipeline run:
- Build stage: Docker image built and pushed to Artifact Registry
- Test stage: All tests pass
- Deploy-staging stage: Service deployed to staging environment

### Step 4: Staging verification
After staging deploy:
```bash
# Check service health
gcloud run services describe <service> --region=<region> --format="value(status.conditions)"

# Check logs for errors
gcloud logs read "resource.type=cloud_run_revision AND severity>=ERROR" --limit=20

# Smoke test the staging URL
curl -f https://<staging-url>/health
```

If staging shows errors → stop, do not deploy to production. Investigate and fix.

### Step 5: Production deployment
After staging is healthy:
```bash
# Trigger production deployment (via CI/CD or manual promote)
gcloud run services update-traffic <service> --to-latest --region=<region>
```

Or via CI/CD: merge to `main` / approve the production stage in the pipeline.

### Step 6: Post-deploy monitoring (15 minutes)
Watch these signals:
- Error rate: should not spike above baseline
- Latency (p50, p95, p99): should stay within normal range
- Request volume: should match expected traffic pattern

```bash
# Quick error check
gcloud logs read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --freshness=15m --limit=50
```

### Step 6b: Transition phase state
After deployment is complete and monitoring window passes:
```
openspec_change({ action: "transition", projectCode: "<code>", changeId: "<id>" })
```
This advances from `deployment` → `done`. Prerequisite: `release.md` must have content.

### Step 7: Update handoff
```markdown
## Deployment: <change-id>

- **Deployed at:** <timestamp>
- **Staging:** ✅ healthy
- **Production:** ✅ healthy
- **Terraform changes:** <applied / none>
- **Monitoring:** no error spike observed for 15 minutes
- **Rollback plan:** `gcloud run services update-traffic <service> --to-revisions=<prev>=100`
- **Status:** DEPLOYED — change complete
```

### Rollback procedure (if something goes wrong)
```bash
# Cloud Run: instant traffic revert
gcloud run services update-traffic <service> \
  --to-revisions=<previous-revision>=100 --region=<region>

# Cloud Functions: redeploy previous
gcloud functions deploy <function-name> --source=<previous-tag>

# Database: run down migration
npm run migrate:down
```

## Output
- Change deployed to production
- `handoff.md` updated with deployment status and rollback plan

## Done when
- [ ] QA signoff confirmed before starting
- [ ] Terraform changes applied (if any)
- [ ] Staging deployment verified healthy
- [ ] Production deployment verified healthy
- [ ] 15-minute monitoring window passed without error spike
- [ ] Rollback plan documented in `handoff.md`
- [ ] Change marked complete

## Rules
| Rule | Why |
|------|-----|
| No deploy without QA signoff | Prod is not a test environment |
| Staging always before production | Catch issues before they hit users |
| No manual console changes | Terraform only — everything reproducible |
| Document the rollback plan | Every deploy must be reversible |
