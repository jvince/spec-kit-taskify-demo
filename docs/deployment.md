# Deployment boundary

This release is a seeded local demonstration, not an internet-facing authenticated application.
Set `TASKIFY_DEPLOYMENT_MODE=local-demo`; every other mode fails closed. Do not expose Taskify
outside a trusted development environment until the active-actor selector is replaced by real
authentication and authorization.

Run the Next.js BFF and four independently deployable Node.js services. Give each service its own
SQLite path and retain WAL mode. Configure the BFF with private HTTP origins for project,
task-board, collaboration, and notification services. Store a 24–128 character
`TASKIFY_SERVICE_CREDENTIAL` in deployment secret storage and provide it only to the BFF and
services. Never place credentials, private origins, or database files in browser configuration or
the repository.

Build only reviewed repository sources because the recorded Next.js/PostCSS build-time exception
remains active until the review date in the implementation plan. Install reproducibly with
`npm ci`, run all quality gates, and deploy from a merged, verified pull request. Back up and
restore each service-owned SQLite database independently; never combine or query them across
service boundaries.
