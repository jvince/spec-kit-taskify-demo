import type { NotificationEventType } from "./index";

const NOTIFICATION_EVENT_TYPES = new Set<NotificationEventType>([
  "task_assigned",
  "task_reassigned",
  "task_status_changed",
  "comment_added"
]);
const USER_ID_PATTERN = /^[a-z][a-z0-9-]{2,63}$/;
const TASK_ID_PATTERN = /^tsk-[a-z0-9-]{1,60}$/;

/** The versioned internal endpoint used by independently deployed services to publish task events. */
export const NOTIFICATION_INGESTION_PATH = "/v1/notification-events";

/** The header carrying a publisher-generated key that makes a delivery attempt idempotent. */
export const NOTIFICATION_IDEMPOTENCY_HEADER = "Idempotency-Key";

/** A validated event accepted by the notification service before recipient-specific persistence. */
export interface NotificationIngestionInput {
  eventType: NotificationEventType;
  actorUserId: string;
  assigneeUserId: string;
  productManagerUserId: string;
  taskId: string;
}

/** Validates the strict v1 ingestion payload before a notification service performs any persistence. */
export function isNotificationIngestionInput(value: unknown): value is NotificationIngestionInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  const fields = ["eventType", "actorUserId", "assigneeUserId", "productManagerUserId", "taskId"];
  if (Object.keys(input).length !== fields.length || !fields.every((field) => field in input))
    return false;
  return (
    typeof input.eventType === "string" &&
    NOTIFICATION_EVENT_TYPES.has(input.eventType as NotificationEventType) &&
    typeof input.actorUserId === "string" &&
    USER_ID_PATTERN.test(input.actorUserId) &&
    typeof input.assigneeUserId === "string" &&
    USER_ID_PATTERN.test(input.assigneeUserId) &&
    typeof input.productManagerUserId === "string" &&
    USER_ID_PATTERN.test(input.productManagerUserId) &&
    typeof input.taskId === "string" &&
    TASK_ID_PATTERN.test(input.taskId)
  );
}

/** The only successful result of notification ingestion, including duplicate idempotency-key delivery. */
export interface NotificationIngestionAccepted {
  accepted: true;
  duplicate: boolean;
}

/** A terminal ingestion error must not be retried with the same request. */
export const TERMINAL_NOTIFICATION_INGESTION_ERROR_CODES = [
  "validation_error",
  "forbidden",
  "conflict"
] as const;

/** A transient ingestion error is retried by the publishing service with the unchanged idempotency key. */
export const RETRYABLE_NOTIFICATION_INGESTION_ERROR_CODES = ["service_unavailable"] as const;
