<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles: I Specification-First Delivery -> I Security-First Input Validation;
  II Testable Outcomes -> III Testable Outcomes; III Security and Data Integrity by Design ->
  I Security-First Input Validation; IV Incremental, Reviewable Delivery -> VI Incremental,
  Reviewable Delivery; V Simplicity and Operational Clarity -> VII Simplicity and Operational
  Clarity
- Added sections: IV Microservice Architecture; V Documentation Is a Deliverable
- Removed sections: none
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ✅ updated: .specify/templates/spec-template.md
- Follow-up TODOs: none
-->
# Taskify Constitution

## Core Principles

### I. Security-First Input Validation
Security is a non-negotiable product requirement. Every user-controlled input, including HTTP
requests, messages, files, headers, query parameters, and configuration received across a trust
boundary, MUST be validated against explicit allow-list rules before use or persistence. Features
MUST define authorization, authentication, error-handling, secret handling, and privacy needs.
Sensitive data MUST NOT be logged or exposed in user-facing errors. Rationale: unvalidated input
and implicit trust are unacceptable attack paths.

### II. Specification-First Delivery
Every feature MUST have a clear, user-focused specification before implementation planning
begins. Specifications MUST define prioritized, independently testable user journeys,
acceptance scenarios, functional requirements, and measurable outcomes. Implementation work
MUST remain traceable to those artifacts. Rationale: a shared definition of value prevents
building unvalidated or out-of-scope functionality.

### III. Testable Outcomes
Each delivered user story MUST have an independently executable validation path that proves
its acceptance scenarios. Changes to executable behavior MUST include automated tests at the
most appropriate level, unless a documented plan exception explains why automation is not
feasible. Tests MUST fail before a defect fix is accepted and MUST pass before delivery.
Rationale: repeatable evidence protects user outcomes as the project evolves.

### IV. Microservice Architecture
Taskify MUST be composed as independently deployable services with bounded responsibilities.
Service-to-service communication MUST use versioned, documented contracts and authenticated,
authorized trust boundaries. Services MUST own their data; direct cross-service datastore access
is prohibited. A plan MUST document each new or changed service, its owner, dependencies,
failure behavior, and migration or compatibility strategy. Rationale: explicit boundaries enable
independent delivery without hidden coupling.

### V. Documentation Is a Deliverable
All production code MUST be documented at the level needed to understand its purpose, public
interfaces, inputs, outputs, side effects, error behavior, security assumptions, and operational
use. Public APIs, service contracts, configuration, deployment procedures, and runbooks MUST be
kept current with the change that affects them. Rationale: correct code that cannot be safely
understood or operated is incomplete.

### VI. Incremental, Reviewable Delivery
Work MUST be organized into small, independently usable user-story increments, ordered by
priority. Each increment MUST be demonstrable without relying on later stories, and code
review MUST verify its requirements, tests, and constitution compliance. Rationale: small
increments expose misunderstanding early and keep the project releasable.

### VII. Simplicity and Operational Clarity
The simplest design that satisfies approved requirements MUST be preferred. New dependencies,
abstractions, services, or infrastructure MUST have a documented need and a rejected simpler
alternative when they add material complexity. Production-affecting behavior MUST emit useful,
privacy-safe diagnostics appropriate to the system. Rationale: deliberate simplicity makes
Taskify easier to operate, change, and trust.

## Quality and Delivery Constraints

Plans MUST identify relevant performance, reliability, privacy, accessibility, compatibility,
and threat-model constraints. Each trust boundary MUST specify validation rules and authorization
decisions. Service contracts MUST define versioning, error semantics, authentication, and
compatibility expectations. Requirements that affect users or operations MUST state measurable
success criteria or an explicit reason why a measure is not applicable. A change is not complete
until its code documentation, contracts, configuration, migration notes, runbooks, and diagnostics
are updated where applicable.

## Development Workflow

Use the Spec Kit flow to create a specification, plan the implementation, generate
dependency-ordered tasks, implement, and assess convergence. The plan's Constitution Check MUST
record how each principle is met or explicitly justify any exception before implementation.
Tasks MUST include validation, service-contract, and documentation work required by the relevant
principles. Reviewers MUST reject work that lacks traceability to an approved requirement,
adequate evidence of validation, or current operational documentation.

## Governance

This constitution supersedes conflicting project practices. Amendments MUST be documented in
this file with a Sync Impact Report and propagated to affected templates and guidance before
the amended rules are used. The maintainers approve amendments through the normal review process.

Versioning follows semantic intent: MAJOR for incompatible principle or governance changes,
MINOR for new or materially expanded principles or sections, and PATCH for clarifications that do
not alter obligations. Every plan and review MUST assess compliance; unresolved MUST-level
violations block delivery unless this constitution is amended first.

**Version**: 1.1.0 | **Ratified**: 2026-07-16 | **Last Amended**: 2026-07-16
