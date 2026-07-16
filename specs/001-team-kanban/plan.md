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

**Language/Version**: TypeScript on the current Node.js LTS release

**Primary Dependencies**: Next.js App Router, React, SQLite driver and migration tool, schema
validation library, drag-and-drop library, and test runner

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
transactional, and conflict-aware; comments are immutable

**Scale/Scope**: One shared workspace with five seeded users, three sample projects, four Kanban
columns, and in-app event notifications only

## Constitution Check

| Principle | Pre-design evidence | Post-design result |
|---|---|---|
| I. Security-First Input Validation | Validate actor, IDs, enums, text bounds, payload shape, and role for every mutation. | PASS — contract and data model define explicit bounds, actor validation, and no-partial-change errors. |
| II. Specification-First Delivery | Plan maps work to the four specified user stories and 16 functional requirements. | PASS — quickstart validates each primary journey. |
| III. Testable Outcomes | Require unit, contract, integration, and browser tests before delivery. | PASS — quickstart gives executable acceptance checks. |
| IV. Microservice Architecture | Separate service ownership and no shared database. | PASS — four service-owned SQLite stores and documented v1 REST contract. |
| V. Documentation Is a Deliverable | Publish contracts, data model, research decisions, quickstart, and service runbooks. | PASS — implementation tasks must add service/API/runbook documentation. |
| VI. Incremental, Reviewable Delivery | Build foundation then independently validate project/task, board, comments, and seed-workspace stories. | PASS — tasks can be grouped by user story. |
| VII. Simplicity and Operational Clarity | Use REST plus SSE instead of bidirectional sockets; keep SQLite local per service. | PASS — research documents alternatives and scale boundary. |

**Security exception boundary**: The active actor is deliberately not authenticated because login is
explicitly out of scope. It is strictly a seeded, validated local-demo context; externally exposed
deployment fails closed until real authentication replaces it. Each service independently validates
input and authorization, while authenticated service credentials are rotated and redacted.

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
