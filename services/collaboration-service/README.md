# Collaboration service

Owns append-only task comments in its private WAL SQLite database.

`GET /v1/tasks/{taskId}/comments` lists permanent comments in creation order. `POST` accepts only
`{ "body": string }`, attributes it to a validated predefined actor, verifies the task through the
authenticated task-board API, and publishes a retry-safe `comment_added` event after commit.
Update and delete methods return `405` because comments are immutable. Notification or task-board
storage is never accessed directly.
