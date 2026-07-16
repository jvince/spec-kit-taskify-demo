import Database from "better-sqlite3";
/** Opens the collaboration service's private SQLite database with WAL and safe busy handling. */
export function openCollaborationDatabase(
  path = "data/collaboration-service.sqlite"
): Database.Database {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  return db;
}
/** Applies the collaboration service's idempotent migration set to its own database only. */
export function migrateCollaborationDatabase(db: Database.Database): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, author_user_id TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL); INSERT OR IGNORE INTO schema_migrations VALUES ('001_init');"
  );
}
