# Taskify

Taskify is a security-first, seeded Team Kanban demonstration built with Next.js, TypeScript, four
independently deployable services, service-owned SQLite databases, REST, and Server-Sent Events.
It starts with five fixed users and three sample projects and intentionally provides no login.

## Develop and verify

Use Node.js 24.16.0 and npm 11.13.0.

```sh
npm ci
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm run build
npm test
```

The actor selector is permitted only with `TASKIFY_DEPLOYMENT_MODE=local-demo`; all other modes
fail closed. See [development setup](docs/development.md), [API behavior](docs/api.md),
[deployment boundary](docs/deployment.md), [operations runbook](docs/runbook.md),
[accessibility](docs/accessibility.md), and the
[validation quickstart](specs/001-team-kanban/quickstart.md).

Each change uses a topic branch and pull request with linked specification/plan evidence, required
CI, and a Changeset when release relevant. Service credentials and SQLite files are never committed
or exposed to browsers.
