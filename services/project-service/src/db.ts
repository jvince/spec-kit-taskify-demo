import Database from "better-sqlite3";
/** Opens the project service's private SQLite database with WAL and safe busy handling. */
export function openProjectDatabase(path = "data/project-service.sqlite"): Database.Database {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  return db;
}
/** Applies the project service's idempotent migration set to its own database only. */
export function migrateProjectDatabase(db: Database.Database): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('product_manager','engineer'))); CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_by_user_id TEXT NOT NULL, created_at TEXT NOT NULL); INSERT OR IGNORE INTO schema_migrations VALUES ('001_init');"
  );
}
