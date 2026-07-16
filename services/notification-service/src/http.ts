import type Database from "better-sqlite3";
import { hasServiceCredential } from "../../../packages/contracts/src/service-auth";
import { listNotifications } from "./notifications";
import { replayEvents } from "./stream";
import { subscribe } from "./live";

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
