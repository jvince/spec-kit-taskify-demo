import { afterEach, describe, expect, it, vi } from "vitest";
import {
  migrateCollaborationDatabase,
  openCollaborationDatabase
} from "../../services/collaboration-service/src/db";
import { createComment, listComments } from "../../services/collaboration-service/src/comments";
import { handleCollaborationRequest } from "../../services/collaboration-service/src/http";
import { publishCommentNotification } from "../../services/collaboration-service/src/notification-client";
import { notificationRecipients } from "../../services/notification-service/src/events";

const databases: { close(): void }[] = [];
afterEach(() => {
  databases.splice(0).forEach((db) => db.close());
  vi.restoreAllMocks();
});

describe("comment validation, attribution, and notification recipients", () => {
  it("attributes append-only comments to every predefined actor", () => {
    const db = openCollaborationDatabase(":memory:");
    databases.push(db);
    migrateCollaborationDatabase(db);
    for (const actorId of [
      "usr-ada-pm",
      "usr-blake-eng",
      "usr-casey-eng",
      "usr-devon-eng",
      "usr-ellis-eng"
    ])
      expect(
        createComment(db, actorId, "tsk-comments", { body: `Update from ${actorId}` }).comment
      ).toMatchObject({ authorUserId: actorId, taskId: "tsk-comments" });
    expect(listComments(db, "tsk-comments")).toHaveLength(5);
    expect(createComment(db, "usr-unknown", "tsk-comments", { body: "No" }).code).toBe("forbidden");
    expect(createComment(db, "usr-casey-eng", "tsk-comments", { body: "   " }).code).toBe(
      "validation_error"
    );
  });

  it("rejects an unavailable task reference without persisting a comment", async () => {
    const db = openCollaborationDatabase(":memory:");
    databases.push(db);
    migrateCollaborationDatabase(db);
    const response = await handleCollaborationRequest(
      new Request("http://collaboration/v1/tasks/tsk-missing/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Actor-Id": "usr-casey-eng",
          "X-Service-Credential": "test-credential"
        },
        body: JSON.stringify({ body: "Must not persist" })
      }),
      db,
      "test-credential",
      async () => undefined
    );
    expect(response.status).toBe(404);
    expect(listComments(db, "tsk-missing")).toEqual([]);
  });

  it("notifies the assignee and product manager unless either is the author", async () => {
    expect(
      notificationRecipients("comment_added", "usr-casey-eng", "usr-blake-eng", "usr-ada-pm")
    ).toEqual(["usr-blake-eng", "usr-ada-pm"]);
    expect(
      notificationRecipients("comment_added", "usr-blake-eng", "usr-blake-eng", "usr-ada-pm")
    ).toEqual(["usr-ada-pm"]);
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }));
    await publishCommentNotification(
      "http://notification.test",
      "credential",
      {
        eventType: "comment_added",
        actorUserId: "usr-casey-eng",
        assigneeUserId: "usr-blake-eng",
        productManagerUserId: "usr-ada-pm",
        taskId: "tsk-comments"
      },
      "evt-comment-fixed"
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(fetchMock.mock.calls[1]?.[1]?.body);
  });
});
