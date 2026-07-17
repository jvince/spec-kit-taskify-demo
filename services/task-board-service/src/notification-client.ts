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
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(new URL(NOTIFICATION_INGESTION_PATH, origin), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Credential": credential,
          [NOTIFICATION_IDEMPOTENCY_HEADER]: idempotencyKey
        },
        body: JSON.stringify(event)
      });
      if (response.ok) return;
      if (response.status !== 503)
        throw new Error("Notification delivery was rejected with a terminal response.");
    } catch (reason) {
      if (reason instanceof Error && reason.message.includes("terminal")) throw reason;
      if (attempt === 2)
        throw new Error("Notification delivery was not accepted.", { cause: reason });
    }
  }
  throw new Error("Notification delivery was not accepted.");
}
