import { afterEach, describe, expect, it, vi } from "vitest";
import {
  migrateTaskBoardDatabase,
  openTaskBoardDatabase
} from "../../services/task-board-service/src/db";
import { createTask, patchTask } from "../../services/task-board-service/src/tasks";
import { publishTaskNotification } from "../../services/task-board-service/src/notification-client";
import { notificationRecipients } from "../../services/notification-service/src/events";

const databases: { close(): void }[] = [];
afterEach(() => {
  databases.splice(0).forEach((db) => db.close());
  vi.restoreAllMocks();
});

describe("task move authorization and preservation", () => {
  it("allows the assignee and product manager while preserving project and assignee", () => {
    const db = openTaskBoardDatabase(":memory:");
    databases.push(db);
    migrateTaskBoardDatabase(db);
    const original = createTask(db, "usr-ada-pm", "prj-preserved", {
      title: "Move safely",
      assigneeUserId: "usr-blake-eng"
    }).task!;
    expect(patchTask(db, "usr-casey-eng", original.id, { status: "done", version: 1 }).code).toBe(
      "forbidden"
    );
    expect(
      patchTask(db, "usr-blake-eng", original.id, { status: "in_review", version: 1 }).task
    ).toMatchObject({
      projectId: original.projectId,
      assigneeUserId: original.assigneeUserId,
      status: "in_review"
    });
    expect(
      patchTask(db, "usr-ada-pm", original.id, { status: "done", version: 2 }).task
    ).toMatchObject({
      projectId: original.projectId,
      assigneeUserId: original.assigneeUserId,
      status: "done"
    });
  });

  it("retries transient notification failures with the same event", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }));
    await publishTaskNotification(
      "http://notification.test",
      "credential",
      {
        eventType: "task_status_changed",
        actorUserId: "usr-blake-eng",
        assigneeUserId: "usr-blake-eng",
        productManagerUserId: "usr-ada-pm",
        taskId: "tsk-move"
      },
      "evt-fixed-key"
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(fetchMock.mock.calls[1]?.[1]?.body);
    expect(
      notificationRecipients("task_status_changed", "usr-blake-eng", "usr-blake-eng", "usr-ada-pm")
    ).toEqual(["usr-ada-pm"]);
    expect(
      notificationRecipients("task_status_changed", "usr-ada-pm", "usr-blake-eng", "usr-ada-pm")
    ).toEqual(["usr-blake-eng"]);
  });
});
