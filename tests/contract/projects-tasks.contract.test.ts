import { describe, expect, it } from "vitest";
import { TASK_STATUSES, type TaskPatch } from "../../packages/contracts/src";

function isTaskPatch(value: unknown): value is TaskPatch {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const patch = value as Record<string, unknown>;
  if (!Number.isInteger(patch.version) || (patch.version as number) < 1) return false;
  const hasAssignee = typeof patch.assigneeUserId === "string";
  const hasStatus =
    typeof patch.status === "string" && TASK_STATUSES.includes(patch.status as never);
  return hasAssignee !== hasStatus && Object.keys(patch).length === 2;
}

describe("v1 project and task contract", () => {
  it("defines the four persisted Kanban states", () => {
    expect(TASK_STATUSES).toEqual(["todo", "in_progress", "in_review", "done"]);
  });

  it("accepts exactly one mutable task field and a positive version", () => {
    expect(isTaskPatch({ assigneeUserId: "usr-blake-eng", version: 1 })).toBe(true);
    expect(isTaskPatch({ status: "in_progress", version: 2 })).toBe(true);
    expect(isTaskPatch({ version: 1 })).toBe(false);
    expect(isTaskPatch({ assigneeUserId: "usr-blake-eng", status: "todo", version: 1 })).toBe(
      false
    );
    expect(isTaskPatch({ status: "todo", version: 0 })).toBe(false);
    expect(isTaskPatch({ status: "todo", version: 1, ignored: true })).toBe(false);
  });
});
