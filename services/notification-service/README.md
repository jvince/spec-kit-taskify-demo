# Notification service

Owns recipient-specific notifications and authenticated SSE delivery in its private WAL SQLite database.

The authenticated `POST /v1/notification-events` ingestion boundary accepts a strict event payload
and publisher-provided idempotency key. It persists a recipient-specific event once, returns `202`
for accepted or duplicate delivery, and returns terminal validation/authorization failures without
creating a notification.
