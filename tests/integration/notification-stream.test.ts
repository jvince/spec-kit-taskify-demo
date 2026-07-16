import { afterEach, describe, expect, it } from "vitest";
import {
  migrateNotificationDatabase,
  openNotificationDatabase
} from "../../services/notification-service/src/db";
import {
  listNotifications,
  saveNotification
} from "../../services/notification-service/src/notifications";
import { replayEvents } from "../../services/notification-service/src/stream";
import { handleNotificationRequest } from "../../services/notification-service/src/http";
const databases: ReturnType<typeof openNotificationDatabase>[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));
describe("notification persistence", () => {
  it("lists notifications only for their recipient", () => {
    const db = openNotificationDatabase(":memory:");
    databases.push(db);
    migrateNotificationDatabase(db);
    saveNotification(db, {
      id: "ntf-one",
      recipientUserId: "usr-blake-eng",
      eventType: "task_assigned",
      taskId: "tsk-one",
      createdAt: "2026-01-01T00:00:00.000Z"
    });
    expect(listNotifications(db, "usr-blake-eng")).toHaveLength(1);
    expect(listNotifications(db, "usr-casey-eng")).toEqual([]);
    expect(replayEvents(db, "usr-blake-eng")).toHaveLength(1);
    expect(replayEvents(db, "usr-casey-eng")).toEqual([]);
  });
  it("requires a service credential and replays only events after the client cursor", async () => {
    const db = openNotificationDatabase(":memory:");
    databases.push(db);
    migrateNotificationDatabase(db);
    saveNotification(db, {
      id: "ntf-two",
      recipientUserId: "usr-blake-eng",
      eventType: "comment_added",
      taskId: "tsk-one",
      createdAt: "2026-01-01T00:00:00.000Z"
    });
    const forbidden = handleNotificationRequest(
      new Request("http://notification/v1/notifications", {
        headers: { "X-Actor-Id": "usr-blake-eng" }
      }),
      db,
      "credential"
    );
    expect(forbidden.status).toBe(403);
    const stream = handleNotificationRequest(
      new Request("http://notification/v1/notifications/stream", {
        headers: {
          "X-Actor-Id": "usr-blake-eng",
          "X-Service-Credential": "credential",
          "Last-Event-ID": "0"
        }
      }),
      db,
      "credential"
    );
    expect(stream.status).toBe(200);
    const reader = stream.body?.getReader();
    const first = await reader?.read();
    expect(new TextDecoder().decode(first?.value)).toContain("notification.created");
    await reader?.cancel();
  });
  it("rolls back the notification when durable-event persistence fails", () => {
    const db = openNotificationDatabase(":memory:");
    databases.push(db);
    migrateNotificationDatabase(db);
    db.exec(
      "CREATE TRIGGER reject_events BEFORE INSERT ON notification_events BEGIN SELECT RAISE(ABORT, 'event store unavailable'); END;"
    );
    expect(() =>
      saveNotification(db, {
        id: "ntf-three",
        recipientUserId: "usr-blake-eng",
        eventType: "comment_added",
        taskId: "tsk-one",
        createdAt: "2026-01-01T00:00:00.000Z"
      })
    ).toThrow("event store unavailable");
    expect(listNotifications(db, "usr-blake-eng")).toEqual([]);
  });
});
