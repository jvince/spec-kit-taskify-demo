import { SAMPLE_PROJECTS, SEEDED_USERS } from "../../../packages/test-support/src/seed";
import type Database from "better-sqlite3";
/** Seeds the fixed local-demo roster and projects transactionally and idempotently. */
export function seedProjectService(db: Database.Database): void {
  const seed = db.transaction(() => {
    const user = db.prepare(
      "INSERT OR IGNORE INTO users (id, display_name, role) VALUES (?, ?, ?)"
    );
    for (const entry of SEEDED_USERS) user.run(entry.id, entry.displayName, entry.role);
    const project = db.prepare(
      "INSERT OR IGNORE INTO projects (id, name, created_by_user_id, created_at) VALUES (?, ?, ?, ?)"
    );
    for (const entry of SAMPLE_PROJECTS)
      project.run(entry.id, entry.name, entry.createdByUserId, entry.createdAt);
  });
  seed();
}
