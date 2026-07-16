# Task Card Requirements Checklist: Team Kanban

**Purpose**: Review the completeness, clarity, consistency, and measurability of requirements for
task-card status changes, assignment, comments, REST contracts, and real-time updates.
**Created**: 2026-07-16
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 Are all task-card fields visible to each permitted role explicitly specified, including title, assignee, status, comments, and notification context? [Completeness, Spec §FR-004–FR-007]
- [ ] CHK002 Are the product-manager and engineer permissions specified for every task-card mutation, including creation, reassignment, status changes, and comments? [Completeness, Spec §FR-003–FR-007, FR-013–FR-014]
- [ ] CHK003 Are notification recipient rules specified for each event type, including assignment, reassignment, status change, and comment creation? [Gap, Spec §FR-015]
- [ ] CHK004 Are requirements defined for a task card when its referenced project, assignee, or author is unavailable? [Gap, Spec §Edge Cases]
- [ ] CHK005 Are accessibility requirements specified for keyboard alternatives and focus behavior for task-card movement and status changes? [Gap]

## Requirement Clarity

- [ ] CHK006 Is the phrase “move … between any of the four defined columns” explicit about whether a move is allowed from every status to every other status? [Clarity, Spec §FR-006]
- [ ] CHK007 Are the allowed text character sets, trimming behavior, and duplicate-name rules fully specified for project names, task titles, and comments? [Gap, Spec §FR-003–FR-009]
- [ ] CHK008 Is the active-actor selection mechanism described sufficiently to distinguish a selected demo identity from authentication? [Clarity, Spec §FR-011, Assumptions]
- [ ] CHK009 Is the term “real-time” quantified consistently for all affected views, including the board and notification list? [Clarity, Plan §Performance Goals]

## Requirement Consistency

- [ ] CHK010 Do the notification requirements align with the assumption that notifications are out of scope, or is the out-of-scope statement updated? [Conflict, Spec §FR-015, Assumptions]
- [ ] CHK011 Are the service-boundary requirements consistent with the addition of a notification capability and its data ownership? [Consistency, Spec §Service Boundaries and Contracts, Plan §Summary]
- [ ] CHK012 Are comment immutability requirements consistent across functional requirements, acceptance scenarios, edge cases, and assumptions? [Consistency, Spec §FR-014, User Story 3, Edge Cases, Assumptions]
- [ ] CHK013 Are task-assignment permissions consistent between the role assumptions, functional requirements, and task state authorization rules? [Consistency, Spec §FR-004, FR-013, Assumptions; Data Model §Task State and Authorization]
- [ ] CHK014 Are no-login constraints consistent with the stated authorization and service-trust-boundary requirements? [Consistency, Spec §FR-011–FR-012, Quality Constraints; Plan §Constitution Check]

## Acceptance Criteria Quality

- [ ] CHK015 Are acceptance criteria defined for all notification events and recipient-specific visibility, not only notification creation? [Gap, Spec §FR-015]
- [ ] CHK016 Can the two-second board-update target be measured with a stated start point, end point, and connected-client condition? [Measurability, Spec §QC-004; Plan §Performance Goals]
- [ ] CHK017 Are success criteria defined for the new notification capability, including event delivery and recipient visibility? [Gap, Spec §Success Criteria]
- [ ] CHK018 Are stale-update/conflict requirements stated in a way that defines the expected user-visible outcome and preservation of the accepted change? [Completeness, Data Model §Task State and Authorization; Contract §/tasks/{taskId}]

## Scenario and Edge-Case Coverage

- [ ] CHK019 Are requirements defined for concurrent status moves or reassignments of the same task card? [Gap]
- [ ] CHK020 Are requirements defined for a status update arriving while a user is viewing a task card or dragging that same card? [Gap, Plan §Summary]
- [ ] CHK021 Are requirements defined for a notification event that targets the actor who caused it, including whether self-notifications are created? [Gap, Spec §FR-015]
- [ ] CHK022 Are recovery requirements defined for temporary loss and reconnection of real-time updates, including how the board becomes current again? [Gap, Plan §Summary]
- [ ] CHK023 Are requirements defined for the empty notification state and for tasks with no comments? [Coverage, Spec §Edge Cases]

## Security and Contract Requirements

- [ ] CHK024 Are the validation requirements explicit for every actor identifier, task identifier, project identifier, status value, assignee value, and text field exposed by the interface contract? [Completeness, Spec §FR-008–FR-009; Contract §Components]
- [ ] CHK025 Are authorization failure requirements defined consistently for each REST mutation, including task reassignment, status updates, and comment creation? [Completeness, Spec §FR-013–FR-014; Contract §Paths]
- [ ] CHK026 Is the no-authentication phase boundary accompanied by a requirement that prevents external deployment until real authentication is defined? [Gap, Plan §Constitution Check]
- [ ] CHK027 Are error response requirements sufficiently specific about safe message content and the absence of sensitive diagnostic data? [Clarity, Spec §QC-002–QC-003]

## Dependencies and Assumptions

- [ ] CHK028 Are SQLite concurrency limits and the single-team scale boundary translated into explicit requirements for mutation conflicts and retry behavior? [Gap, Research §SQLite; Data Model §Task State and Authorization]
- [ ] CHK029 Are versioning and compatibility requirements stated for all project, task, comment, and notification contracts? [Completeness, Spec §Service Boundaries and Contracts; Contract §Info]
- [ ] CHK030 Are the assumed seeded-user roster and fixed sample-project rules traceable to requirements and acceptance scenarios for every dependent task-card action? [Traceability, Spec §FR-001–FR-002, FR-011; User Story 4]

## Notes

- This is a standard-depth PR-review checklist focused on requirement quality, not implementation
  verification. The highest-priority known issue is CHK010: notifications are both required and
  listed as out of scope in the current specification.
