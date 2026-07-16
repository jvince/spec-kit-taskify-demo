import { describe, expect, it } from "vitest";
import {
  NOTIFICATION_IDEMPOTENCY_HEADER,
  NOTIFICATION_INGESTION_PATH,
  RETRYABLE_NOTIFICATION_INGESTION_ERROR_CODES,
  TERMINAL_NOTIFICATION_INGESTION_ERROR_CODES,
  isNotificationIngestionInput,
  type NotificationIngestionAccepted,
  type NotificationIngestionInput
} from "../../packages/contracts/src/notification-ingestion";
import { safeError } from "../../packages/contracts/src/errors";

describe("v1 notification-ingestion contract", () => {
  const event: NotificationIngestionInput = {
    eventType: "task_assigned",
    actorUserId: "usr-ada-pm",
    assigneeUserId: "usr-blake-eng",
    productManagerUserId: "usr-ada-pm",
    taskId: "tsk-contract-test"
  };

  it("defines an authenticated idempotent endpoint and strict payload", () => {
    const accepted: NotificationIngestionAccepted = { accepted: true, duplicate: false };
    expect(NOTIFICATION_INGESTION_PATH).toBe("/v1/notification-events");
    expect(NOTIFICATION_IDEMPOTENCY_HEADER).toBe("Idempotency-Key");
    expect(event).toEqual({
      eventType: "task_assigned",
      actorUserId: "usr-ada-pm",
      assigneeUserId: "usr-blake-eng",
      productManagerUserId: "usr-ada-pm",
      taskId: "tsk-contract-test"
    });
    expect(accepted).toEqual({ accepted: true, duplicate: false });
    expect(isNotificationIngestionInput(event)).toBe(true);
    expect(isNotificationIngestionInput({ ...event, unexpected: true })).toBe(false);
    expect(isNotificationIngestionInput({ ...event, taskId: "project-id" })).toBe(false);
  });

  it("keeps errors stable and distinguishes terminal from retryable failures", () => {
    expect(TERMINAL_NOTIFICATION_INGESTION_ERROR_CODES).toEqual([
      "validation_error",
      "forbidden",
      "conflict"
    ]);
    expect(RETRYABLE_NOTIFICATION_INGESTION_ERROR_CODES).toEqual(["service_unavailable"]);
    expect(safeError("service_unavailable", "req-contract-0001")).toEqual({
      code: "service_unavailable",
      message: "The service is temporarily unavailable; retry later.",
      correlationId: "req-contract-0001"
    });
  });
});
