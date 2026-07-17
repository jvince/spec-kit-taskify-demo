# Board accessibility

The Kanban board always renders all four named workflow columns, including when they are empty.
Every task card exposes its title and status, shows its assignee, and includes a labelled native
status selector as a keyboard alternative to pointer drag-and-drop. Accepted, rejected, and stale
status changes are announced through a polite status region. Interactive controls use a visible
high-contrast focus outline. Dragging is an enhancement and is never the only way to move a task.

## Verification

Run `npm run test:e2e -- --grep "board controls"`. The browser check moves a task with only the
keyboard, verifies the native status selector retains focus with a non-empty computed outline, and
asserts the polite status region announces the accepted destination. It also checks that rendered
buttons, links, inputs, selects, and text areas expose an accessible label or text name.

Keyboard users can Tab to a task's **Status** selector, use arrow, Home, or End keys to choose any
of the four columns, and confirm with Enter. Project/task forms, actor selection, notification
refresh, task discussion links, and comment submission use native keyboard-operable controls. The
orange three-pixel `:focus-visible` outline is shared across buttons, links, inputs, selects, and
task cards.
