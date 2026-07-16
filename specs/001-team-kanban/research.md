# Research: Team Kanban

## Decision: Next.js App Router for the web application

**Rationale**: The App Router supports server-rendered pages and interactive client components;
the board requires client-side drag and drop while the rest of the workspace can remain
server-rendered. Route Handlers provide standard HTTP methods for the REST-facing application
surface.

**Alternatives considered**:

- Pages Router: supported, but the App Router is the current Next.js direction.
- A separate single-page application: adds deployment and integration complexity without a
  feature need.

**Evidence**: Next.js documents App Router as its current router and Route Handlers as custom
request handlers for App Router routes. See the official [App Router documentation](https://nextjs.org/docs/app)
and [Route Handlers guide](https://nextjs.org/docs/app/getting-started/route-handlers).

## Decision: REST mutations plus Server-Sent Events for real-time board refreshes

**Rationale**: REST supplies explicit, versioned create/update operations. Server-Sent Events
(SSE) provides a simple one-way event stream from the notification service to connected board
clients; on an event, the client refreshes the affected project or notification list. Taskify
does not need bidirectional socket messages in this first phase.

**Alternatives considered**:

- Polling: simpler but delays board updates and creates unnecessary reads.
- WebSockets: bidirectional capability is unnecessary for the stated event notifications and
  increases connection-management complexity.

## Decision: Four independently deployable services with service-owned SQLite databases

**Rationale**: Project, task-board, collaboration, and notification capabilities have distinct
owned data and versioned REST contracts. Each service keeps its own SQLite file, eliminating
direct cross-service database access while satisfying the microservice constitution rule.

**Alternatives considered**:

- One shared SQLite database: conflicts with service data ownership.
- A network database from the outset: adds operational complexity beyond the seeded workspace.

**Operational constraint**: SQLite WAL mode improves reader/writer concurrency but still permits
only one writer per database at a time. Each mutation remains short and transactional; retryable
busy handling is required. Reassess SQLite before scaling beyond the single-team workspace. See
the official [SQLite WAL documentation index](https://www.sqlite.org/docs.html).

## Decision: better-sqlite3 12.11.1 with SQL migrations

**Rationale**: `better-sqlite3` provides a small synchronous SQLite interface that supports WAL
configuration and short explicit transactions. A numbered SQL migration directory keeps each
service's schema independently reviewable without adding a second migration framework.

**Compatibility and security evidence**: Version 12.11.1 is pinned with matching type package
7.6.13 and is validated under Node.js 24.16.0. `npm audit --omit=dev` must be recorded for each
upgrade; the documented Next.js/PostCSS exception remains the only known audit finding.

## Decision: Active actor is a validated development-phase context, not authentication

**Rationale**: The approved scope excludes login. Every request carries an active predefined-user
identifier which is allow-list validated and used for role authorization. Internal service calls
use service credentials. This limits the feature to a controlled demo/shared-workspace context;
real authentication and authorization hardening are prerequisites for external deployment.

**Alternatives considered**:

- Implement login now: explicitly out of scope.
- Trust unvalidated actor input: rejected because it violates the security-first constitution.

## Decision: Notification scope is event records, not delivery channels

**Rationale**: The requested notification REST API records assignment, reassignment, status, and
comment events for their recipients. In-app listing and SSE updates meet the real-time need;
email, push delivery, preferences, and read-state are deferred.

**Alternatives considered**:

- No notifications: conflicts with the planning request.
- External push/email delivery: requires user accounts, credentials, and delivery integrations
that are outside the no-login first phase.
