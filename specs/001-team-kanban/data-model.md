# Data Model: Team Kanban

## Ownership Boundaries

| Service | Owned entities | Ownership rule |
|---|---|---|
| Project service | User, Project | Owns the seeded roster and project records. |
| Task-board service | Task | Owns assignments and Kanban state. |
| Collaboration service | Comment | Owns immutable task comments. |
| Notification service | Notification | Owns recipient-specific in-app event records and the update stream. |

Services reference another service's identifiers but never query or modify another service's
SQLite database directly.

## Entities

### User

| Field | Rules |
|---|---|
| id | Stable unique identifier; one of the five seeded users; the allow-list rejects all other values. |
| displayName | Required trimmed text, 1–120 characters, unique within the workspace. |
| role | Exactly `product_manager` or `engineer`; exactly one seeded product manager and four engineers. |

### Project

| Field | Rules |
|---|---|
| id | Stable unique identifier. |
| name | Required trimmed text, 1–120 characters, using letters, numbers, spaces, and `- _ . , ' ( )`; unique within the workspace. |
| createdByUserId | Must identify the product manager. |
| createdAt | Immutable creation timestamp. |

### Task

| Field | Rules |
|---|---|
| id | Stable unique identifier. |
| projectId | Required project-service identifier; must reference an existing project. |
| title | Required trimmed text, 1–200 characters, using letters, numbers, spaces, and `- _ . , ' ( )`. |
| assigneeUserId | Required seeded engineer identifier. |
| status | One of `todo`, `in_progress`, `in_review`, `done`; initial value is `todo`. |
| createdByUserId | Must identify the product manager. |
| createdAt / updatedAt | Immutable creation timestamp and current update timestamp. |
| version | Positive integer incremented by every task mutation for conflict detection. |

### Comment

| Field | Rules |
|---|---|
| id | Stable unique identifier. |
| taskId | Required task-board-service identifier; must reference an existing task. |
| authorUserId | Required seeded user identifier. |
| body | Required trimmed text, 1–2,000 characters, using printable Unicode text excluding control characters. |
| createdAt | Immutable creation timestamp. |

Notification recipients exclude the actor. Assignment and reassignment target the new assignee;
an engineer's status change targets the product manager; a product-manager status change targets
the assignee; a comment targets the assignee and product manager when either is not its author.

Comments are append-only: no update or delete lifecycle transition exists.

### Notification

| Field | Rules |
|---|---|
| id | Stable unique identifier. |
| recipientUserId | Required seeded user identifier. |
| eventType | One of `task_assigned`, `task_reassigned`, `task_status_changed`, `comment_added`. |
| taskId | Required task-board-service identifier. |
| projectId | Required project-service identifier. |
| actorUserId | Required seeded user identifier that caused the event. |
| createdAt | Immutable creation timestamp. |

## Relationships

- One Project has zero or more Tasks; one Task belongs to exactly one Project.
- One User may be assigned zero or more Tasks; each Task has exactly one engineer assignee.
- One Task has zero or more immutable Comments; each Comment has exactly one author.
- One User receives zero or more Notifications; each Notification describes one task event.

## Task State and Authorization

| Mutation | Authorized actor | Preconditions | Result |
|---|---|---|---|
| Create project | Product manager | Valid unique name | Project created. |
| Create task | Product manager | Valid project, title, engineer assignee | Task created in `todo`; assignment notification created. |
| Assign/reassign task | Product manager | Valid engineer assignee; matching task version; request has no status field | Assignee changes; new-assignee notification created. |
| Move task | Current assignee or product manager | Valid status; matching task version; request has no assignee field | Status changes to any permitted status; designated-recipient notification created. |
| Add comment | Any seeded user | Valid task and comment body | Immutable comment created; task assignee notified when the author differs. |

Invalid identifiers, invalid enum values, stale versions, and unauthorized actor roles make no
state change. Concurrent mutations use the matching version as the compare-and-swap condition:
exactly one may commit, and a stale version returns a conflict so the client refreshes before
retrying. SQLite busy conditions retry only a bounded number of times; a request that cannot
commit returns a safe failure and creates no notification.

Every mutation validates its complete payload and rejects unexpected, missing, malformed, or
duplicate fields before beginning a transaction. The owner persists its state and publishes any
notification only after the transaction commits; a failed or unavailable downstream request is
recorded for retry without exposing credentials or raw payloads. Services use authenticated,
rotatable credentials and correlation IDs, validate calls independently, and do not access another
service's database.
