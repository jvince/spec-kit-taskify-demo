# Quickstart: Team Kanban Validation

## Prerequisites

- Node.js 24.16.0 and npm 11.13.0.
- A local workspace with the seeded SQLite databases initialized.
- The web application and all four services running locally.

## Start the workspace

1. Install project dependencies reproducibly with `npm ci`.
2. Initialize the seeded roster, projects, and service-owned SQLite databases with the documented
   project seed command.
3. Start the development workspace with `npm run dev`.
4. Open the displayed local web address and confirm the user selector contains one product manager
   and four engineers, and the project list contains three sample projects.

## End-to-end validation

### Project and task management

1. Select the product manager as active actor.
2. Create a project with a valid name, then create a task assigned to an engineer.
3. Confirm the task is in To Do and the engineer has an assignment notification.
4. Attempt the same mutation as an engineer; confirm no project, task, or assignment changes.

### Drag-and-drop board updates

1. Select the assigned engineer and open the task's project board in two browser windows.
2. Drag the task to In Progress, In Review, Done, and back to To Do.
3. Confirm each update succeeds for the assignee and appears in the second window without a manual
   page refresh.
4. Confirm the product manager can move any task, while a different engineer cannot move it.
5. Submit an unsupported status through the REST contract and confirm a validation error with no
   board change.
6. Disconnect and reconnect one board, confirm it refreshes before another move, then complete a
   keyboard status-change flow with visible focus and an announced result.

### Assignment and comments

1. Select the product manager and reassign the task; confirm its column is unchanged and the new
   assignee receives a notification.
2. Select each predefined user and add a valid comment; confirm the author and comment appear on
   the task.
3. Attempt empty, oversized, edit, and delete comment actions; confirm they fail without changing
   the original comment.
4. Confirm notifications go only to the recipients defined for assignment, status changes, and
   comments, never to the actor who caused the event.

### REST contract checks

1. Exercise project, task, comment, notification, and event-stream operations defined in
   [contracts/openapi.yaml](contracts/openapi.yaml).
2. Verify all mutation calls supply a valid `X-Actor-Id`, use valid request payloads, and return
   the documented validation, authorization, not-found, or conflict response where applicable.
3. Create two conflicting task updates with the same version; confirm one succeeds and the stale
   request returns a conflict without overwriting the successful update.

## Expected outcomes

- The full project-to-task flow completes in under two minutes.
- Dragging a task through all four columns completes in under one minute.
- Invalid and unauthorized inputs never partially change data.
- Connected board clients receive a real-time update after accepted task mutations.

## Recorded release validation

Validated on 2026-07-18 from branch `001-team-kanban-phase-7` with Playwright against the local
Next.js development server and mocked service boundaries. The complete seven-scenario browser
suite passed in 5.1 seconds (5.683 seconds including runner startup). Boundary integration tests
also covered optimistic concurrency, invalid inputs, relationship preservation, two-second initial
workspace performance, and privacy-safe diagnostics.

| Criterion | Automated scenario | Measured browser time | Threshold | Result |
|---|---|---:|---:|---|
| SC-001 | Product-manager project creation, task creation, assignment, and To Do confirmation | 1.1 s | 120 s | PASS |
| SC-002 | Assignee moves a task through To Do, In Progress, In Review, and Done with a second live client | 2.7 s | 60 s | PASS |
| SC-005 | Reviewer verifies five seeded users and three sample projects | 1.1 s | 60 s | PASS |
| SC-006 | User adds a comment and sees its author | 1.3 s | 30 s | PASS |

Commands used:

```sh
npm run test:integration
npm run test:e2e
npm run test:e2e -- --grep "four-column board"
```

The release validation also confirmed the explicit empty states, global recipient notification
refresh, reconnect status, keyboard status control, visible focus, announced move results, safe
error envelopes, and rejection of stale or unauthorized mutations without partial state changes.
