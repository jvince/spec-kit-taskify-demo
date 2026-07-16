import {
  NOTIFICATION_IDEMPOTENCY_HEADER,
  NOTIFICATION_INGESTION_PATH,
  type NotificationIngestionInput
} from "../../../packages/contracts/src/notification-ingestion";

/** Publishes an owned task event through the authenticated notification-service v1 boundary. */
export async function publishTaskNotification(
  origin: string,
  credential: string,
  event: NotificationIngestionInput,
  idempotencyKey = `evt-${crypto.randomUUID()}`
): Promise<void> {
  const response = await fetch(new URL(NOTIFICATION_INGESTION_PATH, origin), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Service-Credential": credential,
      [NOTIFICATION_IDEMPOTENCY_HEADER]: idempotencyKey
    },
    body: JSON.stringify(event)
  });
  if (!response.ok) throw new Error("Notification delivery was not accepted.");
}
