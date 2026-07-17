# Implementation Plan: Team Kanban

**Branch**: `001-team-kanban` | **Date**: 2026-07-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification and planning request for Next.js, SQLite, drag-and-drop boards,
real-time updates, and REST APIs for projects, tasks, and notifications.

## Summary

Build Taskify as a Next.js web application with an interactive drag-and-drop Kanban board. Four
independently deployable services own projects, tasks, comments, and notifications respectively.
Each service owns a SQLite database and exposes a versioned REST contract; the notification
service streams accepted changes to connected clients so board views refresh in real time.

## Technical Context

**Language/Version**: TypeScript 6.0.3 on Node.js 24.16.0 with npm 11.13.0

**Primary Dependencies**: Next.js 16.2.10, React 19.2.7, React DOM 19.2.7, ESLint 10.7.0,
Prettier 3.9.5, Vitest 4.1.10, Playwright 1.61.1, and Changesets 2.31.0. SQLite, schema
validation, drag-and-drop, and migration dependencies are deferred until an exact stable version,
compatibility evidence, and vulnerability result are recorded before their introduction.

**Storage**: One SQLite database per service in WAL mode; no cross-service database access

**Testing**: Unit tests for domain and validation rules; REST contract tests; integration tests for
service boundaries; browser end-to-end tests for drag-and-drop and real-time refreshes

**Target Platform**: Modern desktop browsers and a Node.js runtime; local development via npm
scripts and independently deployable services

**Project Type**: Web application with microservices and versioned REST interfaces

**Performance Goals**: Load the initial three-project workspace and show task locations within two
seconds; propagate accepted board updates to connected local clients within two seconds

**Constraints**: No login or credentials; every external input is allow-list validated; role checks
use a validated seeded active actor; service calls are authenticated; SQLite writes are short,
transactional, and conflict-aware; comments are immutable; direct dependencies, tools, and runtime
images use exact stable versions with a committed lockfile and `npm ci` validation

**Scale/Scope**: One shared workspace with five seeded users, three sample projects, four Kanban
columns, and in-app event notifications only

## Constitution Check

| Principle | Pre-design evidence | Post-design result |
|---|---|---|
| I. Security-First Input Validation | Validate actor, IDs, enums, text bounds, payload shape, and role for every mutation. | PASS — contract and data model define explicit bounds, actor validation, and no-partial-change errors. |
| II. Specification-First Delivery | Plan maps work to the four specified user stories and 17 functional requirements. | PASS — quickstart validates each primary journey. |
| III. Testable Outcomes | Require unit, contract, integration, and browser tests before delivery. | PASS — quickstart gives executable acceptance checks. |
| IV. Microservice Architecture | Separate service ownership and no shared database. | PASS — four service-owned SQLite stores and documented v1 REST contract. |
| V. Documentation Is a Deliverable | Publish contracts, data model, research decisions, quickstart, and service runbooks. | PASS — implementation tasks must add service/API/runbook documentation. |
| VI. Incremental, Reviewable Delivery | Build foundation then independently validate project/task, board, comments, and seed-workspace stories; require topic-branch pull requests linked to the feature artifacts. | PASS — T008 added the PR template and committed protection settings, while docs/development.md records verification of protected-main pull-request and CI enforcement; maintainer approval is optional under constitution 2.0.0. |
| VII. Simplicity and Operational Clarity | Use REST plus SSE instead of bidirectional sockets; keep SQLite local per service; pin every direct dependency and runtime image. | PASS — lockfile, `npm ci`, CI, and Changesets provide reproducible review; deferred dependencies require exact-version evidence before use. |

**Security exception boundary**: The active actor is deliberately not authenticated because login is
explicitly out of scope. It is strictly a seeded, validated local-demo context; externally exposed
deployment fails closed until real authentication replaces it. Each service independently validates
input and authorization, while authenticated service credentials are rotated and redacted.

**Dependency exception boundary**: `next@16.2.10` vendors `postcss@8.4.31`, reported as
GHSA-qx2v-qp2m-jg93. Its scope is build-time CSS processing only; builds MUST use reviewed
repository sources and never compile untrusted CSS. Owner: Taskify maintainers. Review date:
2026-08-16. Upgrade to a stable Next.js release that contains PostCSS 8.5.10 or later, then
re-run `npm audit --omit=dev` and remove this exception.

## Project Structure

### Documentation (this feature)

```text
specs/001-team-kanban/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
apps/
└── web/                         # Next.js App Router and drag-and-drop board UI
    ├── app/
    ├── components/
    └── lib/

services/
├── project-service/             # Seeded users and projects; own SQLite database
├── task-board-service/          # Tasks, assignments, statuses; own SQLite database
├── collaboration-service/       # Immutable comments; own SQLite database
└── notification-service/        # In-app notifications and SSE stream; own SQLite database

packages/
├── contracts/                   # Generated/shared v1 contract types only
├── validation/                  # Shared allow-list validation primitives
└── test-support/                # Seed and integration-test helpers

tests/
├── contract/
├── integration/
└── e2e/
```

**Structure Decision**: A Next.js application owns only the presentation and a narrow backend-for-
frontend layer. Each business capability remains independently deployable with its own datastore.
Shared packages contain contracts, validation primitives, and test support only; they contain no
service business rules or data access.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Four services for a small workspace | The constitution mandates independently deployable service boundaries and data ownership. | A single service or shared database violates the microservice and no cross-service data-access rules. |
| SSE update stream | Board changes must appear in real time. | Polling does not meet the timely-update objective; WebSockets add unused bidirectional complexity. |
