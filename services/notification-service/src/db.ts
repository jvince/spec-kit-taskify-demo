import Database from "better-sqlite3";
/** Opens the notification service's private SQLite database with WAL and safe busy handling. */
export function openNotificationDatabase(
  path = "data/notification-service.sqlite"
): Database.Database {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  return db;
}
/** Applies the notification service's idempotent migration set to its own database only. */
export function migrateNotificationDatabase(db: Database.Database): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, recipient_user_id TEXT NOT NULL, event_type TEXT NOT NULL, task_id TEXT NOT NULL, created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS notification_events (id INTEGER PRIMARY KEY AUTOINCREMENT, notification_id TEXT NOT NULL UNIQUE, recipient_user_id TEXT NOT NULL, payload TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS notification_ingestions (idempotency_key TEXT PRIMARY KEY, created_at TEXT NOT NULL); INSERT OR IGNORE INTO schema_migrations VALUES ('001_init');"
  );
}
