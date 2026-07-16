# Taskify development

## Prerequisites

- Node.js 22 or later and npm 10 or later, or Docker Desktop with Compose support.
- Do not create production-facing deployments from this Phase 1 foundation: no authentication
  exists yet, and Phase 2 will explicitly fail closed outside the local seeded-demo environment.

## Local browser shell

Install dependencies and start the App Router shell:

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. The page is intentionally a shell; services, seeded persistence,
and API endpoints are implemented in the following phases.

## Containerized shell

```sh
docker compose up
```

The Compose configuration mounts the workspace for local development and persists only installed
Node modules in its named Docker volume. Do not place secrets in the repository or Compose file.

## Quality gates

Run each required gate before opening a change:

```sh
npm run lint
npm run typecheck
npm run format:check
npm run test
```

The test commands accept empty suites during Phase 1. Later phases add unit, contract,
integration, and browser tests to their corresponding directories.

## Dependency security note

The current stable Next.js release vendors a PostCSS version flagged by GHSA-qx2v-qp2m-jg93.
The affected PostCSS path runs only while building the application. Taskify's build must therefore
use only reviewed repository sources; it must never compile untrusted CSS. Upgrade Next.js as soon
as a stable release includes PostCSS 8.5.10 or later, then re-run `npm audit --omit=dev`.
