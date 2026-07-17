import { afterEach, describe, expect, it } from "vitest";
import {
  migrateCollaborationDatabase,
  openCollaborationDatabase
} from "../../services/collaboration-service/src/db";
import { createComment, listComments } from "../../services/collaboration-service/src/comments";
import { migrateProjectDatabase, openProjectDatabase } from "../../services/project-service/src/db";
import { createProject, listProjects } from "../../services/project-service/src/projects";
import {
  migrateTaskBoardDatabase,
  openTaskBoardDatabase
} from "../../services/task-board-service/src/db";
import { createTask, listTasks, patchTask } from "../../services/task-board-service/src/tasks";

const databases: { close(): void }[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));

describe("cross-capability input and relationship validation", () => {
  it("rejects malformed and unknown project/task input without changing state", () => {
    const projects = openProjectDatabase(":memory:");
    const tasks = openTaskBoardDatabase(":memory:");
    databases.push(projects, tasks);
    migrateProjectDatabase(projects);
    migrateTaskBoardDatabase(tasks);
    expect(createProject(projects, "usr-ada-pm", { name: "<script>", extra: true }).code).toBe(
      "validation_error"
    );
    expect(listProjects(projects)).toEqual([]);
    expect(
      createTask(tasks, "usr-ada-pm", "not-a-project", {
        title: "Invalid relation",
        assigneeUserId: "usr-unknown"
      }).code
    ).toBe("validation_error");
    expect(listTasks(tasks, "prj-product-launch")).toEqual([]);
  });

  it("preserves task relationships and immutable comments after rejected mutations", () => {
    const tasks = openTaskBoardDatabase(":memory:");
    const comments = openCollaborationDatabase(":memory:");
    databases.push(tasks, comments);
    migrateTaskBoardDatabase(tasks);
    migrateCollaborationDatabase(comments);
    const task = createTask(tasks, "usr-ada-pm", "prj-preserved", {
      title: "Preserve relationships",
      assigneeUserId: "usr-blake-eng"
    }).task!;
    expect(patchTask(tasks, "usr-casey-eng", task.id, { status: "done", version: 1 }).code).toBe(
      "forbidden"
    );
    expect(listTasks(tasks, "prj-preserved")[0]).toEqual(task);
    expect(createComment(comments, "usr-casey-eng", task.id, { body: "\u0000unsafe" }).code).toBe(
      "validation_error"
    );
    expect(listComments(comments, task.id)).toEqual([]);
  });
});
