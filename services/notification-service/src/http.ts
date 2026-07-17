import type Database from "better-sqlite3";
import { hasServiceCredential } from "../../../packages/contracts/src/service-auth";
import {
  isNotificationIngestionInput,
  NOTIFICATION_IDEMPOTENCY_HEADER
} from "../../../packages/contracts/src/notification-ingestion";
import { notificationRecipients, createNotification } from "./events";
import { listNotifications } from "./notifications";
import { saveNotification } from "./notifications";
import { replayEvents } from "./stream";
import { publishBoardUpdate, subscribe } from "./live";

/** Handles authenticated notification-service v1 reads without exposing its database to callers. */
export function handleNotificationRequest(
  request: Request,
  db: Database.Database,
  credential: string | undefined
): Response {
  if (!hasServiceCredential(request.headers.get("X-Service-Credential"), credential))
    return new Response(null, { status: 403 });
  const actorId = request.headers.get("X-Actor-Id");
  if (!actorId) return new Response(null, { status: 400 });
  const url = new URL(request.url);
  if (url.pathname === "/v1/notifications") return Response.json(listNotifications(db, actorId));
  if (url.pathname === "/v1/notifications/stream") {
    const afterId = Number(request.headers.get("Last-Event-ID") ?? "0");
    const cursor = Number.isSafeInteger(afterId) && afterId >= 0 ? afterId : 0;
    let unsubscribe: () => void = () => undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        for (const event of replayEvents(db, actorId, cursor))
          controller.enqueue(encoder.encode(event));
        controller.enqueue(encoder.encode(": connected\n\n"));
        unsubscribe = subscribe(actorId, controller);
      },
      cancel() {
        unsubscribe();
      }
    });
    return new Response(body, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
    });
  }
  return new Response(null, { status: 404 });
}

/** Validates and persists a service-published event exactly once for each idempotency key. */
export async function handleNotificationIngestion(
  request: Request,
  db: Database.Database,
  credential: string | undefined
): Promise<Response> {
  if (!hasServiceCredential(request.headers.get("X-Service-Credential"), credential))
    return new Response(null, { status: 403 });
  const key = request.headers.get(NOTIFICATION_IDEMPOTENCY_HEADER);
  if (!key || !/^evt-[a-z0-9-]{8,128}$/i.test(key)) return new Response(null, { status: 400 });
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!isNotificationIngestionInput(payload)) return new Response(null, { status: 400 });
  try {
    const duplicate = db
      .prepare("SELECT idempotency_key FROM notification_ingestions WHERE idempotency_key = ?")
      .get(key);
    if (duplicate) return Response.json({ accepted: true, duplicate: true }, { status: 202 });
    const persist = db.transaction(() => {
      db.prepare(
        "INSERT INTO notification_ingestions (idempotency_key, created_at) VALUES (?, ?)"
      ).run(key, new Date().toISOString());
      for (const recipient of notificationRecipients(
        payload.eventType,
        payload.actorUserId,
        payload.assigneeUserId,
        payload.productManagerUserId
      )) {
        const notification = createNotification(
          recipient,
          payload.actorUserId,
          payload.eventType,
          payload.taskId
        );
        if (notification) saveNotification(db, notification);
      }
    });
    persist();
    publishBoardUpdate(payload.taskId);
    return Response.json({ accepted: true, duplicate: false }, { status: 202 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
