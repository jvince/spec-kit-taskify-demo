import Database from "better-sqlite3";
/** Opens the task-board service's private SQLite database with WAL and safe busy handling. */
export function openTaskBoardDatabase(path = "data/task-board-service.sqlite"): Database.Database {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  return db;
}
/** Applies the task-board service's idempotent migration set to its own database only. */
export function migrateTaskBoardDatabase(db: Database.Database): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, assignee_user_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('todo','in_progress','in_review','done')), version INTEGER NOT NULL); INSERT OR IGNORE INTO schema_migrations VALUES ('001_init');"
  );
}
