# Taskify API

Taskify exposes browser-facing REST endpoints under `/api/v1`. The complete machine-readable
contract is in `specs/001-team-kanban/contracts/openapi.yaml`. Browser requests use a validated
`X-Actor-Id` from the fixed local-demo roster; this is demonstration context, not authentication.

## Resources

- `GET/POST /projects` lists projects or creates one as the product manager.
- `GET /projects/{projectId}` returns project context; `GET/POST
/projects/{projectId}/tasks` lists or creates tasks.
- `GET/PATCH /tasks/{taskId}` reads a task or changes exactly one of assignee or status with its
  current optimistic version.
- `GET/POST /tasks/{taskId}/comments` lists or appends immutable comments. PATCH and DELETE are
  rejected with method-not-allowed semantics.
- `GET /notifications` lists recipient-owned events. `GET /notifications/stream` provides
  authenticated SSE invalidations; clients refresh after events and reconnects.
- `POST /notification-events` is private service-to-service ingestion with a service credential
  and idempotency key. Browsers must never call it.

Unknown fields, malformed IDs, invalid enum values, unauthorized actors, missing records, and
stale task versions return stable safe categories with opaque correlation IDs. Response messages
never contain credentials, raw request bodies, database paths, or internal diagnostics. Breaking
changes require a new API version; additive compatible fields may remain in v1.
