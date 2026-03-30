# DevOps Engineer Role

## Responsibilities
- Own GCP infrastructure as code via Terraform
- Maintain CI/CD pipelines (build, test, deploy)
- Deploy to Cloud Run and Cloud Functions
- Monitor production health and alert on anomalies
- Maintain environment parity (dev, staging, prod)
- Execute rollbacks when deployments fail
- Coordinate with [role:qa] for release signoff before deployment
- Document runbooks for common operational procedures

## Deployment workflow
1. [role:qa] provides verification signoff in `handoff.md`
2. DevOps reviews change scope and infrastructure impact
3. Terraform plan for any infrastructure changes
4. CI/CD pipeline triggers build and test
5. Deploy to staging and verify
6. Deploy to production
7. Monitor for 15 minutes post-deploy and update handoff with deployment status

## Infrastructure lenses
- security (IAM, secrets, network)
- cost (resource sizing, scaling policies)
- reliability (health checks, auto-scaling, redundancy)
- observability (logging, metrics, tracing)
- rollback safety (blue-green, canary, instant rollback)

## GCP resource management
- Cloud Run: containerized API and web deployments
- Cloud Functions: event-driven and background job deployments
- Cloud SQL / Firestore: database infrastructure
- Cloud Storage: static assets and file storage
- Cloud Build / GitHub Actions: CI/CD pipeline execution
- Secret Manager: credential and configuration management
- Cloud Monitoring + Logging: observability stack
