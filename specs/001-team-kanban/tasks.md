# Tasks: Team Kanban

**Input**: Design documents from `specs/001-team-kanban/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/openapi.yaml](contracts/openapi.yaml), and
[quickstart.md](quickstart.md)

**Tests**: Automated tests are required by the constitution for every executable behavior change.

**Organization**: Tasks are grouped by user story so each story is independently implementable and
testable after the shared foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after dependencies are available.
- **[Story]**: User story owning the task; omitted only for shared setup, foundation, and polish.
- Every task includes an exact repository path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the workspace, shared contracts, quality tooling, and developer commands.

- [X] T001 Create the npm workspace configuration in package.json and apps/, services/, packages/, and tests/ directories.
- [X] T002 Configure exact-version TypeScript, linting, formatting, and test dependencies with a committed lockfile in tsconfig.json, eslint.config.mjs, prettier.config.mjs, package.json, and package-lock.json.
- [X] T003 [P] Create the Next.js App Router shell in apps/web/app/layout.tsx and apps/web/app/page.tsx.
- [X] T004 [P] Create shared contract types, strict one-operation task patches, and safe error types from specs/001-team-kanban/contracts/openapi.yaml in packages/contracts/src/index.ts.
- [X] T005 [P] Create shared allow-list validation primitives for IDs, headers, strict payloads, text bounds, and permitted characters in packages/validation/src/index.ts.
- [X] T006 [P] Create seeded-user and sample-project fixtures in packages/test-support/src/seed.ts.
- [X] T007 Configure local service orchestration and environment documentation in docker-compose.yml and docs/development.md.
- [X] T008 Create CI clean-install, Changesets, lint, type-check, unit-test, contract-test, integration-test, and end-to-end-test gates in .github/workflows/ci.yml.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement service boundaries, persistence, authorization context, REST error behavior,
and real-time event infrastructure required by every user story.

**CRITICAL**: No user-story work begins until this phase is complete.

- [X] T009 Select and record exact stable SQLite driver and migration-tool versions with compatibility and vulnerability evidence in specs/001-team-kanban/research.md and package.json.
- [X] T010 [P] Create the project-service package, SQLite migration runner, WAL configuration, and service runbook in services/project-service/src/index.ts, services/project-service/src/db.ts, services/project-service/migrations/001_init.sql, and services/project-service/README.md.
- [X] T011 [P] Create the task-board-service package, SQLite migration runner, WAL configuration, and service runbook in services/task-board-service/src/index.ts, services/task-board-service/src/db.ts, services/task-board-service/migrations/001_init.sql, and services/task-board-service/README.md.
- [X] T012 [P] Create the collaboration-service package, SQLite migration runner, WAL configuration, and service runbook in services/collaboration-service/src/index.ts, services/collaboration-service/src/db.ts, services/collaboration-service/migrations/001_init.sql, and services/collaboration-service/README.md.
- [X] T013 [P] Create the notification-service package, SQLite migration runner, WAL configuration, event stream, and service runbook in services/notification-service/src/index.ts, services/notification-service/src/db.ts, services/notification-service/src/stream.ts, services/notification-service/migrations/001_init.sql, and services/notification-service/README.md.
- [X] T014 Seed exactly five users and three sample projects through the project-service in services/project-service/src/seed.ts and packages/test-support/src/seed.ts.
- [X] T015 Implement validated active-actor resolution and role authorization in packages/validation/src/actor.ts and packages/validation/src/authorization.ts.
- [X] T016 Implement versioned REST error envelopes, validation failures, forbidden responses, not-found responses, and conflict responses in packages/contracts/src/errors.ts and apps/web/app/api/v1/_lib/response.ts.
- [X] T017 Implement authenticated service-to-service request credentials and request tracing in packages/contracts/src/service-auth.ts and packages/contracts/src/tracing.ts.
- [X] T018 Implement the Next.js backend-for-frontend REST proxy with validated X-Actor-Id forwarding and a deployment-mode guard that fails closed outside the seeded local-demo environment in apps/web/app/api/v1/[...path]/route.ts and apps/web/app/api/v1/_lib/deployment-mode.ts.
- [X] T019 Implement notification event publishing, the complete FR-015 recipient matrix, recipient-specific listing, authenticated SSE subscriptions, reconnect refresh, retry-safe event delivery, and notification REST handlers in services/notification-service/src/events.ts, services/notification-service/src/stream.ts, apps/web/app/api/v1/notifications/route.ts, and apps/web/app/api/v1/notifications/stream/route.ts.
- [X] T020 Add foundational unit, contract, and integration coverage for strict actor/payload validation, service authentication, deployment-mode fail-closed behavior, SQLite conflict handling, notification transaction failures, complete notification recipients, SSE authorization, reconnect refresh, and notification REST responses in tests/unit/actor.test.ts, tests/contract/notifications.contract.test.ts, tests/integration/service-auth.test.ts, tests/integration/sqlite-conflict.test.ts, tests/integration/notification-stream.test.ts, and tests/integration/deployment-mode.test.ts.
- [X] T021 Document local setup, seed/reset procedures, API versioning, credential rotation/redaction, safe diagnostics, and the fail-closed no-authentication deployment boundary in docs/development.md and docs/security-boundaries.md.

**Checkpoint**: Service ownership, validation, persistence, and real-time infrastructure are ready;
user-story work can proceed.

---

## Phase 3: User Story 1 - Manage Projects and Tasks (Priority: P1)

**Goal**: The product manager can create a project, create an assigned task, and reassign a task
without changing its project or status.

**Independent Test**: Select the product manager, create a valid project and task, assign then
reassign the task, and confirm the task remains in To Do with the correct assignee and
notification.

### Tests for User Story 1

- [ ] T022 [P] [US1] Add project and task REST contract tests, including task patches that reject both or neither mutable field, in tests/contract/projects-tasks.contract.test.ts.
- [ ] T023 [P] [US1] Add authorization and invalid-input integration tests in tests/integration/project-task-authorization.test.ts.
- [ ] T024 [P] [US1] Add product-manager project/task browser flow coverage in tests/e2e/project-task-management.spec.ts.

### Implementation for User Story 1

- [ ] T025 [US1] Implement project validation, creation, lookup, and persistence in services/project-service/src/projects.ts.
- [ ] T026 [US1] Implement task creation, assignment/reassignment authorization, version updates, and persistence in services/task-board-service/src/tasks.ts.
- [ ] T027 [US1] Publish assignment and reassignment notifications from services/task-board-service/src/tasks.ts through services/notification-service/src/events.ts.
- [ ] T028 [US1] Implement project and task REST handlers in apps/web/app/api/v1/projects/route.ts, apps/web/app/api/v1/projects/[projectId]/route.ts, apps/web/app/api/v1/projects/[projectId]/tasks/route.ts, and apps/web/app/api/v1/tasks/[taskId]/route.ts.
- [ ] T029 [US1] Implement the product-manager project and task creation interface in apps/web/app/projects/page.tsx and apps/web/components/project-task-form.tsx.

**Checkpoint**: The product manager can create and assign work, with documented REST behavior and
automated validation.

---

## Phase 4: User Story 2 - Track Work on a Kanban Board (Priority: P1)

**Goal**: Users view project work on four Kanban columns; assignees move their tasks and the
product manager moves any task, with live updates to connected boards.

**Independent Test**: Open the same project in two browser windows, move an assigned task through
all four columns, and confirm the other board updates in under two seconds; verify an unrelated
engineer is forbidden.

### Tests for User Story 2

- [ ] T030 [P] [US2] Add task status PATCH contract tests for permitted statuses, stale versions, and rejection of both or neither mutable field in tests/contract/task-status.contract.test.ts.
- [ ] T031 [P] [US2] Add task-move authorization and notification integration tests in tests/integration/task-status-authorization.test.ts.
- [ ] T032 [P] [US2] Add drag-and-drop and real-time multi-client browser coverage in tests/e2e/kanban-realtime.spec.ts.

### Implementation for User Story 2

- [ ] T033 [US2] Implement validated task status mutations, role checks, and optimistic-version conflict handling in services/task-board-service/src/tasks.ts.
- [ ] T034 [US2] Publish task status notifications and board-update events in services/task-board-service/src/tasks.ts and services/notification-service/src/events.ts.
- [ ] T035 [US2] Implement the project board query and status mutation REST handlers in apps/web/app/api/v1/projects/[projectId]/route.ts and apps/web/app/api/v1/tasks/[taskId]/route.ts.
- [ ] T036 [US2] Implement the four-column accessible drag-and-drop board in apps/web/app/projects/[projectId]/page.tsx and apps/web/components/kanban-board.tsx.
- [ ] T037 [US2] Implement the authenticated event-stream client and board refresh behavior in apps/web/lib/notification-stream.ts and apps/web/components/kanban-board.tsx.

**Checkpoint**: The board provides role-aware drag-and-drop status changes and real-time updates.

---

## Phase 5: User Story 3 - Discuss Tasks (Priority: P2)

**Goal**: Any predefined user adds immutable comments to a task, with author attribution and
recipient notifications.

**Independent Test**: Select each seeded user, add a valid comment, view it as another user, and
confirm attempted edit/delete actions preserve the original comment.

### Tests for User Story 3

- [ ] T038 [P] [US3] Add comment REST contract tests, including immutable-operation responses, in tests/contract/comments.contract.test.ts.
- [ ] T039 [P] [US3] Add comment validation, author attribution, and notification-recipient integration tests for the assignee and product manager when either is not the author in tests/integration/comments.test.ts.
- [ ] T040 [P] [US3] Add multi-user task-comment browser coverage in tests/e2e/task-comments.spec.ts.

### Implementation for User Story 3

- [ ] T041 [US3] Implement append-only comment validation, persistence, and task-reference checks in services/collaboration-service/src/comments.ts.
- [ ] T042 [US3] Publish comment notifications for the task assignee and product manager whenever either is not the author, excluding the actor, in services/collaboration-service/src/comments.ts and services/notification-service/src/events.ts.
- [ ] T043 [US3] Implement comment list/create REST handlers and task-card comment UI in apps/web/app/api/v1/tasks/[taskId]/comments/route.ts and apps/web/components/task-comments.tsx.

**Checkpoint**: Comments are attributed, immutable, validated, and visible to all predefined users.

---

## Phase 6: User Story 4 - Start with a Working Team Workspace (Priority: P2)

**Goal**: Users start with the fixed five-person roster and three sample projects, without login.

**Independent Test**: Reset the local workspace, select every seeded user, and verify exactly one
product manager, four engineers, and three sample projects are available.

### Tests for User Story 4

- [ ] T044 [P] [US4] Add seeded roster and sample-project integration coverage in tests/integration/workspace-seed.test.ts.
- [ ] T045 [P] [US4] Add initial-workspace and active-actor browser coverage in tests/e2e/seeded-workspace.spec.ts.

### Implementation for User Story 4

- [ ] T046 [US4] Implement the predefined-user selector and no-login active-actor context in apps/web/components/active-user-selector.tsx and apps/web/lib/active-actor.ts.
- [ ] T047 [US4] Implement initial workspace project list and roster display in apps/web/app/page.tsx and apps/web/components/workspace-overview.tsx.

**Checkpoint**: The seeded, no-login workspace is ready for an end-to-end demonstration.

---

## Phase 7: Polish and Cross-Cutting Concerns

**Purpose**: Complete notification visibility, operational documentation, accessibility, security,
and release validation across all user stories.

- [ ] T048 [P] Implement the in-app recipient notification list and live refresh UI in apps/web/components/notification-list.tsx and apps/web/app/layout.tsx.
- [ ] T049 Add accessibility requirements verification and keyboard drag-and-drop coverage in tests/e2e/kanban-accessibility.spec.ts and docs/accessibility.md.
- [ ] T050 Add performance, concurrency, input-validation, and no-sensitive-diagnostics coverage in tests/integration/performance-boundary.test.ts, tests/integration/input-validation.test.ts, and tests/integration/diagnostics.test.ts.
- [ ] T051 Update API, service, deployment, and operational documentation in docs/api.md, docs/deployment.md, docs/runbook.md, and README.md.
- [ ] T052 Run the end-to-end quickstart validation and record results in specs/001-team-kanban/quickstart.md.

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on setup and blocks all user stories.
- **US1 and US2 (Phases 3–4)**: Start after the foundation; US2 uses task creation from US1 for
  its demonstration, so deliver US1 first.
- **US3 (Phase 5)**: Starts after the foundation and can proceed in parallel with US2 when a
  seeded task exists.
- **US4 (Phase 6)**: Depends on the foundation and can be delivered independently; it is also
  required for repeatable demonstrations of all stories.
- **Polish (Phase 7)**: Depends on the desired user stories.

### User Story Dependency Graph

```text
Foundation
├── US1: Manage projects and tasks ──> US2: Track Kanban work
├── US3: Discuss tasks
└── US4: Seeded workspace

US1 + US2 + US3 + US4 ──> Polish and release validation
```

### Parallel Opportunities

- T003–T006 can run in parallel after T001–T002.
- T010–T013 can run in parallel after T009 selects the approved SQLite dependencies; T014–T021
  then establish their shared integration points.
- Within each user story, all tasks marked `[P]` are parallelizable test tasks.
- US3 and US4 may proceed in parallel with US2 after the foundation, subject to seeded-task
  availability for US3.
- T047–T050 can run in parallel after their dependent services and UI exist.

## Implementation Strategy

### MVP First: US1

1. Complete Setup and Foundational phases.
2. Complete US1 contract, integration, and browser tests before its implementation tasks.
3. Demonstrate product-manager project, task, assignment, and reassignment behavior.
4. Stop and validate the US1 independent test before adding board movement.

### Incremental Delivery

1. Deliver US1 to establish managed, assigned work.
2. Deliver US2 to make work state visible and real-time.
3. Deliver US3 for immutable task discussion.
4. Deliver US4 to guarantee a repeatable seeded demonstration.
5. Complete notification UI and cross-cutting quality work before release.

### Format Validation

All 52 tasks use a checkbox, sequential task ID, optional parallel marker, required user-story
label when applicable, and exact file paths.
