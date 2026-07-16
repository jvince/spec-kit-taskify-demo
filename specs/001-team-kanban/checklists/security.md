# Security and Validation Requirements Checklist: Team Kanban

**Purpose**: Review whether security, validation, authorization, service-trust-boundary, and safe
failure requirements are complete, clear, consistent, and measurable.
**Created**: 2026-07-16
**Feature**: [spec.md](../spec.md)

## Input-Validation Completeness

- [x] CHK001 Are explicit allow-list rules documented for every user-controlled text, identifier, header, query parameter, and request body field at each service boundary? [Gap, Constitution §I; Spec §FR-008, QC-001]
- [x] CHK002 Are presence, maximum length, permitted character set, normalization, and duplicate handling requirements specified separately for project names, task titles, and comment content? [Gap, Spec §FR-003–FR-009]
- [x] CHK003 Are validation requirements defined for malformed, omitted, unexpected, and duplicate request fields rather than only invalid field values? [Gap, Spec §FR-008–FR-009; Contract §Components]
- [x] CHK004 Are identifier validation requirements clear about the accepted representation, scope, and behavior for references to absent or unavailable records? [Gap, Spec §QC-001–QC-003; Data Model §Entity Validation]
- [x] CHK005 Are the allowed active-actor values and the outcome for a missing, malformed, or non-seeded actor explicitly specified? [Completeness, Spec §FR-011, QC-001; Plan §Constraints]

## Authorization and No-Login Boundary

- [x] CHK006 Are role-authorized and role-forbidden outcomes specified for every state-changing action, including project creation, task creation, assignment, status changes, and comments? [Completeness, Spec §FR-003–FR-007, FR-013–FR-014]
- [x] CHK007 Is the active-actor selection model clearly bounded so it cannot be interpreted as authentication or a secure session? [Clarity, Spec §FR-011–FR-012, Assumptions; Plan §Constitution Check]
- [x] CHK008 Are requirements defined for an actor attempting to access or mutate a record outside the selected workspace or with an unrelated role? [Gap, Spec §Trust Boundaries]
- [x] CHK009 Is the external-deployment prohibition until real authentication is introduced stated as an enforceable requirement rather than only a planning exception? [Gap, Plan §Constitution Check]
- [x] CHK010 Are authorization decisions consistently specified across the functional requirements, REST contract, and service-boundary descriptions? [Consistency, Spec §FR-003–FR-014; Spec §Trust Boundaries; Contract §Paths]

## Service Trust Boundaries and Data Protection

- [x] CHK011 Are service-to-service authentication requirements specific about the credential source, validation, rotation, rejection behavior, and prohibition on logging secrets? [Gap, Constitution §I, IV; Plan §Constraints]
- [x] CHK012 Are authorization and validation responsibilities assigned unambiguously to the BFF and each owning service, so no trust boundary relies on a prior layer implicitly? [Clarity, Constitution §I, IV; Plan §Project Structure]
- [x] CHK013 Are service-contract error semantics and compatibility rules defined consistently for all four service owners, including notification ownership? [Completeness, Spec §Service Boundaries and Contracts; Plan §Summary]
- [x] CHK014 Are data-isolation requirements explicit enough to prevent direct cross-service SQLite access and describe the allowed contract-mediated alternatives? [Completeness, Constitution §IV; Plan §Storage]
- [x] CHK015 Are requirements defined for validation or authorization failures occurring after an inter-service request begins, including preservation of data consistency and notification behavior? [Gap, Spec §QC-003; Data Model §Mutation Semantics]

## Safe Failure, Diagnostics, and Acceptance Criteria

- [x] CHK016 Are safe error-message requirements specific about which client-visible details are permitted and which internal, personal, or secret values must be withheld? [Clarity, Spec §QC-002–QC-003]
- [x] CHK017 Are requirements defined for privacy-safe operational diagnostics, including correlation identifiers, event metadata, and redaction rules? [Gap, Constitution §I, VII; Plan §Constraints]
- [x] CHK018 Are invalid-input, not-found, forbidden, and conflict outcomes distinguishable in the requirements without revealing sensitive information? [Completeness, Spec §FR-009, QC-002–QC-003; Contract §Components]
- [x] CHK019 Can the requirement that rejected mutations make no partial data change be objectively assessed for each owned datastore and for emitted notification events? [Measurability, Spec §FR-009, QC-003; Data Model §Mutation Semantics]
- [x] CHK020 Are security-relevant exception and recovery scenarios specified for malformed service credentials, expired credentials, unavailable services, and interrupted requests? [Gap, Constitution §I, IV; Plan §Constraints]

## Assumptions and Conflicts

- [x] CHK021 Is the no-login demo assumption reconciled with the requirement for authenticated service-to-service communication and the stated external-deployment boundary? [Consistency, Spec §Assumptions; Plan §Constraints]
- [x] CHK022 Are the fixed seeded-user and single-workspace assumptions sufficient to define authorization behavior when a referenced user or project is unavailable? [Assumption, Spec §Assumptions; Spec §QC-003]

## Notes

- This is a standard-depth, PR-review checklist for requirement quality. It assesses the written
  specification and plan, not implementation behavior. The review is complete against the
  revised cross-artifact requirements.
