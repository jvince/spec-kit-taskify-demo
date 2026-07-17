import { afterEach, describe, expect, it } from "vitest";
import {
  migrateTaskBoardDatabase,
  openTaskBoardDatabase
} from "../../services/task-board-service/src/db";
import { handleTaskBoardRequest } from "../../services/task-board-service/src/http";
import { createTask } from "../../services/task-board-service/src/tasks";

const databases: { close(): void }[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));

async function patch(payload: unknown, requestedVersion = 1) {
  const db = openTaskBoardDatabase(":memory:");
  databases.push(db);
  migrateTaskBoardDatabase(db);
  const task = createTask(db, "usr-ada-pm", "prj-contract", {
    title: "Contract task",
    assigneeUserId: "usr-blake-eng"
  }).task!;
  if (requestedVersion !== 1) payload = { ...(payload as object), version: requestedVersion };
  return handleTaskBoardRequest(
    new Request(`http://task/v1/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Actor-Id": "usr-blake-eng",
        "X-Service-Credential": "test-credential"
      },
      body: JSON.stringify(payload)
    }),
    db,
    "test-credential"
  );
}

describe("task status PATCH contract", () => {
  it.each(["todo", "in_progress", "in_review", "done"])("accepts %s", async (status) => {
    expect((await patch({ status, version: 1 })).status).toBe(200);
  });

  it("rejects stale versions and ambiguous patches", async () => {
    expect((await patch({ status: "done", version: 1 }, 2)).status).toBe(409);
    expect((await patch({ version: 1 })).status).toBe(400);
    expect(
      (await patch({ status: "done", assigneeUserId: "usr-casey-eng", version: 1 })).status
    ).toBe(400);
  });
});
