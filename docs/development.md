# Taskify development

## Prerequisites

- Node.js 24.16.0 and npm 11.13.0, or Docker Desktop with Compose support.
- Do not create production-facing deployments from this Phase 1 foundation: no authentication
  exists yet, and Phase 2 will explicitly fail closed outside the local seeded-demo environment.

## Local seeded workspace

Install dependencies and start the App Router shell:

```sh
npm ci
npm run dev
```

Set `TASKIFY_DEPLOYMENT_MODE=local-demo` and a 24-character-or-longer
`TASKIFY_SERVICE_CREDENTIAL` in local secret storage. Configure private service origins with
`TASKIFY_PROJECT_SERVICE_ORIGIN`, `TASKIFY_TASK_BOARD_SERVICE_ORIGIN`,
`TASKIFY_COLLABORATION_SERVICE_ORIGIN`, and `TASKIFY_NOTIFICATION_SERVICE_ORIGIN`; browsers never
receive these credentials or origins. Run each service's exported `start…Server` adapter with its
own SQLite path to expose the v1 endpoints. The project service seeds the fixed roster and sample
projects at startup. Product/task mutations flow through the BFF; task-board publishes assignment
events through the private authenticated notification-ingestion endpoint, never through a shared
database or browser-visible service credential.

Project-service seeding is idempotent: call `seedProjectDatabase` after migration to create exactly
five predefined users and three sample projects. For a local reset, stop the service and delete only
its explicitly configured SQLite database file, then migrate and seed again. Never use this reset
procedure in a shared or production-like environment.

Open `/` to verify the fixed roster and sample projects and to select any predefined actor without
credentials. The selection persists in browser-local storage across navigation and reloads. Use
**Reset active user** to clear that browser state and return to the seeded product manager. This
selector and reset behavior are demonstration conveniences only: keep
`TASKIFY_DEPLOYMENT_MODE=local-demo`, and do not expose this deployment until real authentication
replaces the seeded actor context.

All public endpoints are namespaced under `/api/v1`; additive fields are compatible, while breaking
changes require a new API version and a migration plan.

## Containerized shell

```sh
docker compose up
```

The Compose configuration mounts the workspace for local development and persists only installed
Node modules in its named Docker volume. Do not place secrets in the repository or Compose file.

## Pull-request workflow and quality gates

Create a topic branch for every code, configuration, contract, or deployment change and open a
pull request to `main`; direct pushes are reserved for documented emergency remediations. Link
the relevant Spec Kit artifacts and include a changeset for release-relevant work. Before merge,
the pull request requires all configured CI checks to pass. Maintainer approval may be requested
but is not required. Configure GitHub branch protection on `main` to require pull requests and the
configured CI checks.

### Applied `main` protection evidence

The settings in `.github/branch-protection/main.json` document the repository protection verified
on 2026-07-17 with:

```sh
gh api repos/jvince/spec-kit-taskify-demo/branches/main/protection
```

The verified settings require pull requests, strict completion of the `verify` status check,
administrator enforcement, and conversation resolution. Force pushes and branch deletion are
disabled. The required approving-review count is zero, as permitted by constitution 2.0.0.

Re-run the command after any repository-rules change and reconcile the committed JSON and this
evidence before merging further implementation work. The committed JSON documents the intended
settings; GitHub repository settings remain the enforcement source of truth.

Run each required gate before opening or updating the pull request:

```sh
npm run lint
npm run typecheck
npm run format:check
npm run test
```

The test commands cover the Phase 2 foundation; later phases add feature and browser coverage.

## Dependency management

Use exact stable versions in every committed package manifest; do not use `latest`, wildcard, or
range specifiers. Commit the compatible lockfile and use `npm ci` for CI and reproducible local
validation. Record dependency additions or upgrades with their compatibility and vulnerability
evidence. Any exception requires a documented scope, mitigation, owner, and review or expiry date.

## Dependency security note

The current stable Next.js release vendors a PostCSS version flagged by GHSA-qx2v-qp2m-jg93.
The affected PostCSS path runs only while building the application. Taskify's build must therefore
use only reviewed repository sources; it must never compile untrusted CSS. Upgrade Next.js as soon
as a stable release includes PostCSS 8.5.10 or later, then re-run `npm audit --omit=dev`.

**Exception record**: Scope is the nested build-time PostCSS dependency; mitigation is reviewed
source-only builds. Owner: Taskify maintainers. Review date: 2026-08-16.
