import type Database from "better-sqlite3";

/** Formats a validated notification event for an authenticated SSE client. */
export function sseEvent(event: string, payload: unknown, id?: number): string {
  return `${id === undefined ? "" : `id: ${id}\n`}event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

/** Replays only a recipient's events after the client-provided durable cursor. */
export function replayEvents(
  db: Database.Database,
  recipientUserId: string,
  afterId = 0
): string[] {
  const rows = db
    .prepare(
      "SELECT id, payload FROM notification_events WHERE recipient_user_id = ? AND id > ? ORDER BY id ASC"
    )
    .all(recipientUserId, afterId) as { id: number; payload: string }[];
  return rows.map((row) => sseEvent("notification.created", JSON.parse(row.payload), row.id));
}
