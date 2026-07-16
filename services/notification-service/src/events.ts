import type { Notification, NotificationEventType } from "../../../packages/contracts/src/index";
/** Builds one recipient-specific notification, excluding the actor before persistence. */
export function createNotification(
  recipientUserId: string,
  actorUserId: string,
  eventType: NotificationEventType,
  taskId: string
): Notification | null {
  return recipientUserId === actorUserId
    ? null
    : {
        id: `ntf-${crypto.randomUUID()}`,
        recipientUserId,
        eventType,
        taskId,
        createdAt: new Date().toISOString()
      };
}

/** Calculates the FR-015 recipients and always excludes the actor. */
export function notificationRecipients(
  eventType: NotificationEventType,
  actorUserId: string,
  assigneeUserId: string,
  productManagerUserId: string
): string[] {
  const candidates =
    eventType === "comment_added"
      ? [assigneeUserId, productManagerUserId]
      : eventType === "task_status_changed"
        ? [actorUserId === productManagerUserId ? assigneeUserId : productManagerUserId]
        : [assigneeUserId];
  return [...new Set(candidates.filter((userId) => userId !== actorUserId))];
}
