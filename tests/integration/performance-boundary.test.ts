import { afterEach, describe, expect, it } from "vitest";
import { migrateProjectDatabase, openProjectDatabase } from "../../services/project-service/src/db";
import { listProjects } from "../../services/project-service/src/projects";
import { seedProjectService } from "../../services/project-service/src/seed";
import {
  migrateTaskBoardDatabase,
  openTaskBoardDatabase
} from "../../services/task-board-service/src/db";
import { createTask, listTasks, patchTask } from "../../services/task-board-service/src/tasks";

const databases: { close(): void }[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));

describe("single-workspace performance and concurrency boundaries", () => {
  it("loads the three-project seed and a representative board within two seconds", () => {
    const projects = openProjectDatabase(":memory:");
    const tasks = openTaskBoardDatabase(":memory:");
    databases.push(projects, tasks);
    migrateProjectDatabase(projects);
    migrateTaskBoardDatabase(tasks);
    seedProjectService(projects);
    for (let index = 0; index < 100; index += 1)
      createTask(tasks, "usr-ada-pm", "prj-product-launch", {
        title: `Performance task ${index}`,
        assigneeUserId: "usr-blake-eng"
      });

    const started = performance.now();
    expect(listProjects(projects)).toHaveLength(3);
    expect(listTasks(tasks, "prj-product-launch")).toHaveLength(100);
    expect(performance.now() - started).toBeLessThan(2_000);
  });

  it("allows exactly one optimistic update for a shared task version", () => {
    const db = openTaskBoardDatabase(":memory:");
    databases.push(db);
    migrateTaskBoardDatabase(db);
    const task = createTask(db, "usr-ada-pm", "prj-concurrent", {
      title: "Concurrent update",
      assigneeUserId: "usr-blake-eng"
    }).task!;

    const first = patchTask(db, "usr-blake-eng", task.id, { status: "in_progress", version: 1 });
    const stale = patchTask(db, "usr-ada-pm", task.id, { status: "done", version: 1 });
    expect(first.task).toMatchObject({ status: "in_progress", version: 2 });
    expect(stale.code).toBe("conflict");
    expect(listTasks(db, "prj-concurrent")[0]).toMatchObject({
      projectId: "prj-concurrent",
      assigneeUserId: "usr-blake-eng",
      status: "in_progress"
    });
  });
});
