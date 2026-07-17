# Task-board service

Owns tasks, assignments, statuses, and optimistic versions in its private WAL SQLite database.

Assignment and reassignment are product-manager-only, use a matching task version, and publish an
idempotent `v1` notification event after the task transaction commits. The service never accesses
the notification database; it calls the authenticated notification-ingestion contract instead.

Status changes accept only one of the four contract states, require the current optimistic version,
and are authorized for either the assigned engineer or the product manager. A committed change
publishes a retry-safe `task_status_changed` event; notification-service downtime never rolls back
the task transaction.
