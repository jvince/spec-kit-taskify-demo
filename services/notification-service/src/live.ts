import type { Notification } from "../../../packages/contracts/src/index";
import { sseEvent } from "./stream";

const encoder = new TextEncoder();
const subscribers = new Map<string, Set<ReadableStreamDefaultController<Uint8Array>>>();

/** Registers a recipient-specific stream and returns its idempotent cleanup function. */
export function subscribe(
  recipientUserId: string,
  controller: ReadableStreamDefaultController<Uint8Array>
): () => void {
  const recipientSubscribers = subscribers.get(recipientUserId) ?? new Set();
  recipientSubscribers.add(controller);
  subscribers.set(recipientUserId, recipientSubscribers);
  return () => {
    recipientSubscribers.delete(controller);
    if (recipientSubscribers.size === 0) subscribers.delete(recipientUserId);
  };
}

/** Pushes an already-persisted event; a reconnect uses the durable event cursor if delivery fails. */
export function publishNotification(notification: Notification, eventId: number): void {
  const payload = encoder.encode(sseEvent("notification.created", notification, eventId));
  for (const controller of subscribers.get(notification.recipientUserId) ?? []) {
    try {
      controller.enqueue(payload);
    } catch {
      subscribers.get(notification.recipientUserId)?.delete(controller);
    }
  }
}
