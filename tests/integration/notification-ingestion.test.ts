import { afterEach, describe, expect, it } from "vitest";
import {
  migrateNotificationDatabase,
  openNotificationDatabase
} from "../../services/notification-service/src/db";
import { handleNotificationIngestion } from "../../services/notification-service/src/http";
import { listNotifications } from "../../services/notification-service/src/notifications";

const databases: ReturnType<typeof openNotificationDatabase>[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));

function eventRequest(key: string, credential = "service-secret") {
  return new Request("http://notification.local/v1/notification-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Service-Credential": credential,
      "Idempotency-Key": key
    },
    body: JSON.stringify({
      eventType: "task_assigned",
      actorUserId: "usr-ada-pm",
      assigneeUserId: "usr-blake-eng",
      productManagerUserId: "usr-ada-pm",
      taskId: "tsk-contract-test"
    })
  });
}

describe("notification ingestion", () => {
  it("authenticates publisher requests and deduplicates safe retries", async () => {
    const db = openNotificationDatabase(":memory:");
    databases.push(db);
    migrateNotificationDatabase(db);
    expect(
      (
        await handleNotificationIngestion(
          eventRequest("evt-contract-0001", "wrong"),
          db,
          "service-secret"
        )
      ).status
    ).toBe(403);
    expect(
      (await handleNotificationIngestion(eventRequest("evt-contract-0001"), db, "service-secret"))
        .status
    ).toBe(202);
    expect(
      (
        await handleNotificationIngestion(eventRequest("evt-contract-0001"), db, "service-secret")
      ).json()
    ).resolves.toEqual({ accepted: true, duplicate: true });
    expect(listNotifications(db, "usr-blake-eng")).toHaveLength(1);
  });
});
