import { afterEach, describe, expect, it } from "vitest";
import { migrateProjectDatabase, openProjectDatabase } from "../../services/project-service/src/db";
import { createProject } from "../../services/project-service/src/projects";
import {
  migrateTaskBoardDatabase,
  openTaskBoardDatabase
} from "../../services/task-board-service/src/db";
import { createTask, patchTask } from "../../services/task-board-service/src/tasks";

const databases: { close(): void }[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));

describe("project and task authorization", () => {
  it("rejects engineer project creation and preserves existing task state on invalid mutations", () => {
    const projects = openProjectDatabase(":memory:");
    const tasks = openTaskBoardDatabase(":memory:");
    databases.push(projects, tasks);
    migrateProjectDatabase(projects);
    migrateTaskBoardDatabase(tasks);
    expect(createProject(projects, "usr-blake-eng", { name: "Unauthorized" }).code).toBe(
      "forbidden"
    );
    const created = createTask(tasks, "usr-ada-pm", "prj-product-launch", {
      title: "Validate task",
      assigneeUserId: "usr-blake-eng"
    }).task;
    expect(created).toBeDefined();
    expect(
      patchTask(tasks, "usr-blake-eng", created!.id, {
        assigneeUserId: "usr-casey-eng",
        version: 1
      }).code
    ).toBe("forbidden");
    expect(
      patchTask(tasks, "usr-ada-pm", created!.id, { status: "todo", version: 1, extra: true }).code
    ).toBe("validation_error");
    expect(
      patchTask(tasks, "usr-ada-pm", created!.id, { status: "todo", version: 1 }).task
    ).toMatchObject({ version: 2 });
    expect(patchTask(tasks, "usr-ada-pm", created!.id, { status: "done", version: 1 }).code).toBe(
      "conflict"
    );
  });
});
