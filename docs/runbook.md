# Taskify operations runbook

## Startup and health verification

1. Validate local-demo mode, private service origins, service credential, and four explicit
   service-owned SQLite paths.
2. Start project, task-board, collaboration, and notification services, then the web BFF.
3. Open `/` and verify five users and three projects. Open a project board and confirm its SSE
   status reaches connected. Switch actors and verify the global notification list refreshes.

## Recovery

- If a service is unavailable, keep its database intact, restore the process, and retry with the
  same idempotency key where the notification publisher owns a pending retry.
- If a board or notification stream disconnects, clients show reconnecting and refresh owned state
  after reconnection before another mutation.
- For SQLite busy/conflict responses, allow bounded busy handling to finish; clients refresh stale
  task versions before retrying. Never bypass optimistic concurrency.
- For a local-only reset, stop the affected service, remove only its explicitly configured SQLite
  file, then migrate and seed it. Never apply this reset to shared or production-like data.

## Diagnostics and secrets

Use opaque correlation IDs to locate redacted diagnostics. Never log credentials, request bodies,
notification payloads, or SQLite paths. Rotate a service credential by provisioning the new value
to the BFF and services atomically, restarting affected processes, verifying rejection metrics,
then revoking the old value. Escalate repeated service-unavailable, SQLite busy, SSE reconnect, or
notification retry failures with timestamps and correlation IDs only.
