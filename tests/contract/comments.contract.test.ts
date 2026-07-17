import { afterEach, describe, expect, it } from "vitest";
import {
  migrateCollaborationDatabase,
  openCollaborationDatabase
} from "../../services/collaboration-service/src/db";
import { handleCollaborationRequest } from "../../services/collaboration-service/src/http";

const databases: { close(): void }[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));

function request(method: string, body?: unknown) {
  return new Request("http://collaboration/v1/tasks/tsk-contract/comments", {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Actor-Id": "usr-casey-eng",
      "X-Service-Credential": "test-credential"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

describe("immutable comment REST contract", () => {
  it("lists comments and creates a strictly shaped comment", async () => {
    const db = openCollaborationDatabase(":memory:");
    databases.push(db);
    migrateCollaborationDatabase(db);
    const task = { id: "tsk-contract", assigneeUserId: "usr-blake-eng" };
    const created = await handleCollaborationRequest(
      request("POST", { body: "A useful update" }),
      db,
      "test-credential",
      async () => task
    );
    expect(created.status).toBe(201);
    await expect(created.json()).resolves.toMatchObject({
      taskId: task.id,
      authorUserId: "usr-casey-eng",
      body: "A useful update"
    });
    const listed = await handleCollaborationRequest(
      request("GET"),
      db,
      "test-credential",
      async () => task
    );
    await expect(listed.json()).resolves.toHaveLength(1);
  });

  it.each(["PUT", "PATCH", "DELETE"])("rejects immutable %s operations", async (method) => {
    const db = openCollaborationDatabase(":memory:");
    databases.push(db);
    migrateCollaborationDatabase(db);
    const response = await handleCollaborationRequest(
      request(method, { body: "changed" }),
      db,
      "test-credential"
    );
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, POST");
  });

  it("rejects unknown fields and control characters", async () => {
    const db = openCollaborationDatabase(":memory:");
    databases.push(db);
    migrateCollaborationDatabase(db);
    const resolveTask = async () => ({ id: "tsk-contract", assigneeUserId: "usr-blake-eng" });
    expect(
      (
        await handleCollaborationRequest(
          request("POST", { body: "valid", extra: true }),
          db,
          "test-credential",
          resolveTask
        )
      ).status
    ).toBe(400);
    expect(
      (
        await handleCollaborationRequest(
          request("POST", { body: "bad\ntext" }),
          db,
          "test-credential",
          resolveTask
        )
      ).status
    ).toBe(400);
  });
});
