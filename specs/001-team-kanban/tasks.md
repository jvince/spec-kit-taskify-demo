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
- [X] T008 Complete the blocking repository-governance gate: retain CI clean-install, Changesets, lint, type-check, unit-test, contract-test, integration-test, and end-to-end-test gates in .github/workflows/ci.yml; add the required specification/plan links, CI evidence, and release-relevant changeset status to .github/pull_request_template.md; apply protected-main repository settings requiring pull requests and all configured CI status checks, with no mandatory maintainer approval, from .github/branch-protection/main.json; and record applied-settings verification in docs/development.md. No remaining implementation task may begin until the repository settings are active and verified.

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

### Contract Prerequisite and Tests for User Story 1

- [X] T022 [US1] Define the authenticated v1 notification-ingestion endpoint, payload schema, idempotency key, retry owner, stable error semantics, and terminal-failure behavior in specs/001-team-kanban/contracts/openapi.yaml and packages/contracts/src/notification-ingestion.ts; then add project, task, and notification-ingestion REST contract tests, including task patches that reject both or neither mutable field and coverage for the ingestion payload shape, authenticated service credentials, stable v1 error envelopes, and rejection of unknown fields in tests/contract/projects-tasks.contract.test.ts and tests/contract/notification-ingestion.contract.test.ts.
- [X] T023 [P] [US1] After T022, add project/task authorization and notification-ingestion integration tests covering invalid input, invalid service credentials, idempotent retries, and preservation of committed task state when notification delivery is unavailable in tests/integration/project-task-authorization.test.ts and tests/integration/notification-ingestion.test.ts.
- [X] T024 [P] [US1] After T022, add product-manager project/task browser flow coverage in tests/e2e/project-task-management.spec.ts, including local-demo actor selection and confirmation that the new assignee can list the assignment notification while the acting product manager cannot.

### Implementation for User Story 1

- [X] T025 [US1] Implement project validation, creation, lookup, and persistence in services/project-service/src/projects.ts.
- [X] T026 [US1] Implement task creation, assignment/reassignment authorization, version updates, and persistence in services/task-board-service/src/tasks.ts.
- [X] T027 [US1] Implement the task-board notification client in services/task-board-service/src/notification-client.ts and notification-service handler in services/notification-service/src/http.ts; publish assignment and reassignment events through the approved v1 notification-ingestion contract with retry-safe failure handling, update the affected service runbooks, and do not import notification-service source modules.
- [X] T028 [US1] Implement project and task REST handlers in apps/web/app/api/v1/projects/route.ts, apps/web/app/api/v1/projects/[projectId]/route.ts, apps/web/app/api/v1/projects/[projectId]/tasks/route.ts, and apps/web/app/api/v1/tasks/[taskId]/route.ts; update the v1 project/task contract and project-service and task-board-service runbooks with the same change.
- [X] T029 [US1] Deliver the Phase 3 UI as three reviewable changes through the required pull-request workflow: (a) local-demo active-actor selection and state in apps/web/components/active-user-selector.tsx and apps/web/lib/active-actor.ts; (b) product-manager project/task creation, assignment, reassignment, and validation feedback in apps/web/app/projects/page.tsx and apps/web/components/project-task-form.tsx; and (c) recipient notification listing and actor-switching behavior in apps/web/components/notification-list.tsx.

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

- [X] T030 [P] [US2] Add task status PATCH contract tests for permitted statuses, stale versions, and rejection of both or neither mutable field in tests/contract/task-status.contract.test.ts.
- [X] T031 [P] [US2] Add task-move authorization, notification, and relationship-preservation integration tests proving that accepted and rejected status moves do not change task project or assignee in tests/integration/task-status-authorization.test.ts.
- [X] T032 [P] [US2] Add drag-and-drop, real-time multi-client, and empty-board browser coverage, including four visible empty columns and preservation of project and assignee after moves, in tests/e2e/kanban-realtime.spec.ts.

### Implementation for User Story 2

- [X] T033 [US2] Implement validated task status mutations, role checks, and optimistic-version conflict handling in services/task-board-service/src/tasks.ts.
- [X] T034 [US2] Publish task status notifications and board-update events through the authenticated v1 notification-ingestion contract in services/task-board-service/src/notification-client.ts with retry-safe failure handling; do not import notification-service source modules.
- [X] T035 [US2] Implement the project board query and status mutation REST handlers in apps/web/app/api/v1/projects/[projectId]/route.ts and apps/web/app/api/v1/tasks/[taskId]/route.ts; update the board mutation, SSE, and accessibility documentation with the same change.
- [X] T036 [US2] Implement the four-column accessible drag-and-drop board, including an empty-board state that keeps all four columns visible, in apps/web/app/projects/[projectId]/page.tsx and apps/web/components/kanban-board.tsx.
- [X] T037 [US2] Implement the authenticated event-stream client and board refresh behavior in apps/web/lib/notification-stream.ts and apps/web/components/kanban-board.tsx.

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
- [ ] T040 [P] [US3] Add multi-user task-detail browser coverage proving comments and authors are visible, comments are immutable, and an empty comment list states that no comments are available in tests/e2e/task-comments.spec.ts.

### Implementation for User Story 3

- [ ] T041 [US3] Implement append-only comment validation, persistence, and task-reference checks in services/collaboration-service/src/comments.ts.
- [ ] T042 [US3] Implement the collaboration notification client in services/collaboration-service/src/notification-client.ts and publish comment notifications for the task assignee and product manager whenever either is not the author, excluding the actor, through the authenticated v1 notification-ingestion contract with retry-safe failure handling; do not import notification-service source modules.
- [ ] T043 [US3] Implement comment list/create REST handlers and a task-detail UI that shows immutable comments with their authors and an explicit empty-comment state in apps/web/app/api/v1/tasks/[taskId]/comments/route.ts and apps/web/components/task-comments.tsx; update the collaboration API contract and service runbook with the same change.

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

- [ ] T046 [US4] Integrate the existing predefined-user selector into the initial workspace and implement local-demo active-actor selection persistence and reset behavior in apps/web/app/page.tsx and apps/web/lib/active-actor.ts.
- [ ] T047 [US4] Implement initial workspace project list and roster display in apps/web/app/page.tsx and apps/web/components/workspace-overview.tsx; update seeded-workspace and local-demo deployment guidance with the same change.

**Checkpoint**: The seeded, no-login workspace is ready for an end-to-end demonstration.

---

## Phase 7: Polish and Cross-Cutting Concerns

**Purpose**: Complete notification visibility, operational documentation, accessibility, security,
and release validation across all user stories.

- [ ] T048 Enhance the in-app recipient notification list with live refresh, reconnection behavior, and an explicit empty-notification state in apps/web/components/notification-list.tsx and apps/web/app/layout.tsx.
- [ ] T049 [P] Add accessibility verification for keyboard drag-and-drop, every board operation and form control, visible focus, and announced status results in tests/e2e/kanban-accessibility.spec.ts and docs/accessibility.md.
- [ ] T050 [P] Add performance, concurrency, input-validation, relationship-preservation, and no-sensitive-diagnostics coverage in tests/integration/performance-boundary.test.ts, tests/integration/input-validation.test.ts, and tests/integration/diagnostics.test.ts.
- [ ] T051 Reconcile API, service, deployment, and operational documentation for the completed release in docs/api.md, docs/deployment.md, docs/runbook.md, and README.md.
- [ ] T052 Run the end-to-end quickstart validation and record results, including the SC-001, SC-002, SC-005, and SC-006 timing thresholds, in specs/001-team-kanban/quickstart.md.

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
- T049 and T050 can run in parallel after the completed board behavior is available; T048 follows
  the notification-list and stream implementation, and T047 remains part of US4.

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
5. Complete notification UI and cross-cutting quality work before release; repository governance
   is already enforced by the blocking T008 setup gate.

### Format Validation

All 52 tasks use a checkbox, sequential task ID, optional parallel marker, required user-story
label when applicable, and exact file paths.
