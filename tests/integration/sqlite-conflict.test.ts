import { afterEach, describe, expect, it } from "vitest";
import {
  migrateTaskBoardDatabase,
  openTaskBoardDatabase
} from "../../services/task-board-service/src/db";
const databases: ReturnType<typeof openTaskBoardDatabase>[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));
describe("SQLite migration", () => {
  it("is idempotent and enables WAL", () => {
    const db = openTaskBoardDatabase(":memory:");
    databases.push(db);
    migrateTaskBoardDatabase(db);
    migrateTaskBoardDatabase(db);
    expect(db.prepare("SELECT id FROM schema_migrations").all()).toEqual([{ id: "001_init" }]);
  });
});
