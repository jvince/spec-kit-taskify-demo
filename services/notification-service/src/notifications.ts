import type Database from "better-sqlite3";
import type { Notification } from "../../../packages/contracts/src/index";
import { publishNotification } from "./live";
/** Persists a notification in the notification service's own database. */
export function saveNotification(db: Database.Database, notification: Notification): void {
  const eventId = db.transaction(() => {
    const event = db
      .prepare(
        "INSERT INTO notifications (id, recipient_user_id, event_type, task_id, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        notification.id,
        notification.recipientUserId,
        notification.eventType,
        notification.taskId,
        notification.createdAt
      );
    db.prepare(
      "INSERT INTO notification_events (notification_id, recipient_user_id, payload, created_at) VALUES (?, ?, ?, ?)"
    ).run(
      notification.id,
      notification.recipientUserId,
      JSON.stringify(notification),
      notification.createdAt
    );
    return Number(event.lastInsertRowid);
  })();
  publishNotification(notification, eventId);
}
/** Lists only the requesting recipient's notifications, newest first. */
export function listNotifications(db: Database.Database, recipientUserId: string): Notification[] {
  return db
    .prepare(
      "SELECT id, recipient_user_id AS recipientUserId, event_type AS eventType, task_id AS taskId, created_at AS createdAt FROM notifications WHERE recipient_user_id = ? ORDER BY created_at DESC"
    )
    .all(recipientUserId) as Notification[];
}
