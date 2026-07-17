# Feature Specification: Team Kanban

**Feature Branch**: `001-team-kanban`

**Created**: 2026-07-16

**Status**: Approved for implementation

**Input**: User description: "Develop Taskify, a team productivity platform where predefined
users create projects, assign tasks, comment, and move tasks across Kanban columns (To Do, In
Progress, In Review, Done). Five users (one product manager, four engineers), three sample
projects, no login for this first phase."

## Clarifications

### Session 2026-07-16

- Q: Who may move a task between Kanban columns? → A: The assigned engineer may move their task
  between any Kanban columns; the product manager may move any task.
- Q: Who may assign or reassign a task? → A: Only the product manager may assign or reassign a
  task to one of the four engineers.
- Q: What comment permissions apply? → A: All predefined users may add comments; comments cannot
  be edited or deleted in this phase.
- Q: Who receives notifications? → A: Assignment and reassignment notify the new assignee. A
  status change notifies the product manager when an engineer makes the change, or the assignee
  when the product manager makes it. A comment notifies the task assignee and product manager
  when either is not the author. The actor never receives their own notification.
- Q: May a task update change both status and assignee? → A: No. Each update changes exactly one
  of status or assignee and includes the task version.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Projects and Tasks (Priority: P1)

The product manager creates projects and captures the work the team must complete as assigned
tasks, so the team has a clear, shared backlog.

**Why this priority**: A project and its assigned work are the minimum useful unit of team
coordination; without them, the board has nothing to organize.

**Independent Test**: Select the product manager, create a project, create a task within it,
assign the task to an engineer, and confirm the task appears in that project with its assignee.

**Acceptance Scenarios**:

1. **Given** the product manager is the active predefined user, **When** they create a project
   with a valid name, **Then** the project is listed and available for task management.
2. **Given** an existing project, **When** the product manager creates a task with a valid title
   and assigns it to one of the four engineers, **Then** the task appears in the project's To Do
   column and identifies its assignee.
3. **Given** an existing task, **When** the product manager reassigns it to a different
   predefined engineer, **Then** the task identifies the new assignee without changing its
   project or Kanban column.
4. **Given** an invalid, missing, or oversized project name or task title, **When** a user submits
   it, **Then** the system rejects it with a clear message and does not create or change data.
5. **Given** a task assignment or reassignment, **When** it is accepted, **Then** the new
   assignee can list one notification for that event and the acting product manager receives none.

---

### User Story 2 - Track Work on a Kanban Board (Priority: P1)

An engineer sees the tasks in a project and moves assigned work through To Do, In Progress, In
Review, and Done, so the team can see each item's current state.

**Why this priority**: Visible work state is the platform's central productivity outcome and is
needed immediately after tasks are created.

**Independent Test**: Select an engineer, open a project with an assigned task, move it through
each defined column, and confirm the board shows the task in the selected column at every step.

**Acceptance Scenarios**:

1. **Given** a task in a project, **When** a user opens that project's board, **Then** every task
   appears in exactly one of the four defined columns.
2. **Given** an assigned task, **When** its assignee moves it to a different defined column or
   the product manager moves it, **Then** the new column is visible to all predefined users
   viewing the project.
3. **Given** a requested column value outside the four defined columns, **When** a task update is
   submitted, **Then** the system rejects the request and preserves the task's existing column.
4. **Given** a connected board, **When** an accepted status change occurs, **Then** every
   connected view of that project shows the new column within two seconds of acceptance; a view
   that reconnects refreshes its project board before accepting a further move.

---

### User Story 3 - Discuss Tasks (Priority: P2)

The product manager and engineers add comments to tasks, so decisions, progress, and requests
remain attached to the work item.

**Why this priority**: Discussion improves collaboration, but projects, tasks, and state tracking
deliver the first viable planning workflow without it.

**Independent Test**: Select a predefined user, add a comment to an existing task, and confirm
the comment shows its author and is visible when another predefined user views the same task.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** a predefined user submits a valid non-empty comment,
   **Then** the comment is recorded with that user as author and displayed on the task.
2. **Given** an empty, invalid, or oversized comment, **When** a user submits it, **Then** the
   system rejects it with a clear message and does not add a comment.
3. **Given** an existing comment, **When** a user attempts to edit or delete it, **Then** the
   system preserves the original comment and reports that comment changes are unavailable.
4. **Given** a new comment, **When** it is accepted, **Then** each intended recipient other than
   the author can list one comment notification.

---

### User Story 4 - Start with a Working Team Workspace (Priority: P2)

A team member starts with the agreed five-person roster and three sample projects, so Taskify is
ready to demonstrate and use without setup or sign-in.

**Why this priority**: Seeded content makes the first-phase product immediately understandable
and supports the no-login scope.

**Independent Test**: Open Taskify in its initial state and verify the roster contains exactly one
product manager and four engineers, and that exactly three sample projects are available.

**Acceptance Scenarios**:

1. **Given** a newly initialized workspace, **When** a user views the people roster, **Then** it
   contains exactly five predefined users: one product manager and four engineers.
2. **Given** a newly initialized workspace, **When** a user views projects, **Then** exactly three
   sample projects are available.

### Edge Cases

- A project with no tasks displays an empty board with all four columns available.
- A task cannot be assigned to a person outside the predefined five-person roster.
- A task remains associated with its original project when its state changes or a comment is added.
- Comments are immutable in this phase: they cannot be edited or deleted after creation.
- A task card shows its title, assignee, and current Kanban column; its task detail shows comments
  and their authors. An empty project board, comment list, or notification list states that no
  items are available.
- The system preserves existing data when a submitted project, task, assignment, move, or comment
  fails validation.
- In this phase, a selected predefined user represents the active actor; no credential collection,
  login, registration, or password recovery is available.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide exactly five predefined users: one product manager and four
  engineers.
- **FR-002**: The system MUST provide exactly three sample projects in a newly initialized
  workspace.
- **FR-003**: The system MUST allow the product manager to create a project with a valid,
  non-empty name.
- **FR-004**: The system MUST allow the product manager to create a task within a project with a
  valid title and assign or reassign it to one predefined engineer.
- **FR-005**: The system MUST display each task in exactly one of these columns: To Do, In
  Progress, In Review, or Done.
- **FR-006**: The system MUST allow a task's assignee to move that task between any of the four
  defined columns and allow the product manager to move any task between those columns.
- **FR-007**: The system MUST allow each predefined user to add a valid non-empty comment to a
  task and display the comment's author and content.
- **FR-008**: The system MUST validate all user-controlled project names, task titles,
  assignments, column changes, and comment content before accepting or persisting them.
- **FR-009**: The system MUST reject invalid input with a user-visible explanation and without
  changing existing data.
- **FR-010**: The system MUST preserve project, task, assignment, column, and comment
  relationships when users view or update a workspace.
- **FR-011**: The system MUST provide a way to select one predefined user as the active actor
  without collecting credentials.
- **FR-012**: The system MUST NOT offer login, account registration, password reset, or external
  user management in this phase.
- **FR-013**: The system MUST reject an assignment or reassignment attempted by an engineer
  without changing the task.
- **FR-014**: The system MUST preserve every accepted comment as immutable; no predefined user
  may edit or delete it in this phase.
- **FR-015**: The system MUST create a notification for a task assignment, task reassignment,
  task status change, or new task comment and allow its intended predefined recipient to list
  their notifications. The recipient rules are: the new assignee for assignment or reassignment;
  the product manager for an engineer's status change; the assignee for a product-manager status
  change; and the assignee and product manager for a comment when they are not its author. The
  actor MUST NOT receive their own notification.
- **FR-016**: The system MUST accept a task update that changes exactly one of assignee or status,
  together with a positive task version; a request that attempts both, neither, or an unsupported
  field MUST be rejected without changing the task.
- **FR-017**: The system MUST show each task's title, assignee, and status on its board card, and
  provide a task detail that shows immutable comments with their authors.

### Input Validation Rules

- Project names MUST be trimmed, contain 1–120 characters, and use only letters, numbers, spaces,
  and `- _ . , ' ( )`.
- Task titles MUST be trimmed, contain 1–200 characters, and use only letters, numbers, spaces,
  and `- _ . , ' ( )`.
- Comment content MUST be trimmed, contain 1–2,000 printable Unicode characters, and contain no
  control characters.
- User, project, and task identifiers MUST match their documented contract formats and resolve to
  records valid for the requested relationship. Assignments MUST resolve to one of the four
  predefined engineers, and task columns MUST be one of the four values defined by FR-005.

### Key Entities *(include if feature involves data)*

- **User**: A predefined team member with a name and role of product manager or engineer.
- **Project**: A named container for a collection of tasks.
- **Task**: A work item belonging to one project, with a title, one engineer assignee, and one
  Kanban column.
- **Comment**: A dated discussion entry authored by one predefined user and attached to one task.
- **Notification**: A dated, recipient-specific record describing a task assignment, status
  change, or comment event.
- **Kanban Column**: One of the four permitted workflow states: To Do, In Progress, In Review, or
  Done.

### Quality, Security, and Delivery Constraints

- **QC-001**: Every user-controlled input MUST be checked against explicit rules for presence,
  length, permitted values, and relationship validity before it is stored or used to change state.
- **QC-002**: The no-login phase MUST collect no credentials and expose no sensitive values in
  error messages or operational diagnostics.
- **QC-003**: Invalid input, unavailable referenced records, and unauthorized role actions MUST
  produce a safe, clear outcome without partial data changes.
- **QC-004**: The primary project-board view MUST show a project and its task locations within two
  seconds for the initial workspace of three projects and five users.
- **QC-005**: Every board operation and form control MUST be keyboard operable, show visible
  keyboard focus, and provide an announced text alternative for a task status change.
- **QC-006**: For an accepted task mutation, a project board already connected to its update
  stream MUST reflect the accepted state within two seconds. A disconnected board MUST refresh
  the project before it permits another mutation after reconnection. A connected notification list
  MUST likewise show an accepted notification for its recipient within two seconds.
- **QC-007**: The active-actor selector MUST be available only in the local seeded-demo
  deployment; any externally exposed deployment MUST fail closed until real authentication and
  authorization requirements replace this phase's actor model.
- **QC-008**: User-visible errors MUST identify only the safe failure category (invalid input,
  unavailable record, forbidden action, or stale version). Diagnostics MUST use a correlation ID
  and MUST NOT include credentials, raw request bodies, or other sensitive values.

### Service Boundaries and Contracts

- **Service Ownership**: Project management owns users and projects; task-board management owns
  tasks, assignments, and workflow state; collaboration owns comments; notification management
  owns notification records and update streams. Each capability owns the data it changes.
- **Contract Changes**: The initial feature defines documented, versioned contracts for project,
  task-board, and collaboration interactions; no prior contract compatibility is required.
- **Trust Boundaries**: A selected predefined user is the active actor. Role actions, assignments,
  column values, all identifiers, headers, request fields, and submitted text are validated before
  a capability changes its owned data. Every service repeats validation and authorization for its
  owned mutation; it does not trust a prior service or the frontend implicitly. Service-to-service
  requests use authenticated credentials that are rotated and redacted from diagnostics.
- **Failure and Compatibility Rules**: Unknown request fields, malformed or missing values,
  unknown identifiers, unauthorized roles, stale versions, and unavailable referenced records
  MUST be rejected before a mutation. A rejected mutation MUST create no partial record or
  notification. Version 1 contracts use stable error categories and remain compatible within the
  phase; a breaking change requires a new contract version. Service credentials originate only
  from deployment configuration, are rotatable, and are rejected when missing, malformed, or
  expired; service unavailability preserves committed state and records a retry-safe event.
- **Operational Documentation**: The initial release documents the public behavior, input rules,
  service contracts, configuration, and operating steps for the seeded workspace.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A product manager can create a project, create an assigned task, and confirm it is
  in To Do in under two minutes.
- **SC-002**: An engineer can locate an assigned task and move it through all four workflow
  columns in under one minute.
- **SC-003**: In acceptance testing, 100% of invalid project, task, assignment, column, and
  comment submissions are rejected without creating or changing data.
- **SC-004**: In acceptance testing, 100% of displayed tasks appear in exactly one permitted
  column and retain their project and assignee after a column move.
- **SC-005**: A reviewer can verify the five predefined users and three sample projects from a
  newly initialized workspace in under one minute.
- **SC-006**: A user can add a valid comment and see its author on the task in under 30 seconds.
- **SC-007**: In acceptance testing, 100% of accepted assignment, reassignment, status-change,
  and comment events create notifications only for the recipients defined in FR-015.
- **SC-008**: In acceptance testing, 100% of keyboard status-change flows provide a visible focus
  indicator and an announced status result.

## Assumptions

- A simple selection of a predefined user establishes the active actor for this first phase; it is
  not authentication and does not establish a secure user session.
- The product manager creates projects and tasks and is the only role that assigns or reassigns
  them; engineers are the eligible task assignees and may move their assigned tasks. All five
  predefined users may add comments, which are immutable in this phase.
- Each task has one assignee and belongs to one project; subtasks, task due dates, labels,
  attachments, notification delivery channels or settings, and task deletion are out of scope.
- The three sample projects and five predefined users are fixed initial workspace content; editing
  the roster or creating additional user accounts is out of scope.
- The first phase targets a single shared team workspace and does not include multiple teams,
  organization administration, external integrations, push delivery, or notification settings.
