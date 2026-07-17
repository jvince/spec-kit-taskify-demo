import { afterEach, describe, expect, it } from "vitest";
import { SAMPLE_PROJECTS, SEEDED_USERS } from "../../packages/test-support/src/seed";
import { migrateProjectDatabase, openProjectDatabase } from "../../services/project-service/src/db";
import { listProjects } from "../../services/project-service/src/projects";
import { seedProjectService } from "../../services/project-service/src/seed";

const databases: { close(): void }[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));

describe("seeded local-demo workspace", () => {
  it("creates exactly one product manager, four engineers, and three sample projects", () => {
    const db = openProjectDatabase(":memory:");
    databases.push(db);
    migrateProjectDatabase(db);

    seedProjectService(db);
    seedProjectService(db);

    const users = db
      .prepare("SELECT id, display_name AS displayName, role FROM users ORDER BY id")
      .all();
    expect(users).toHaveLength(5);
    expect(users).toEqual([...SEEDED_USERS].sort((left, right) => left.id.localeCompare(right.id)));
    expect(
      users.filter((user) => (user as { role: string }).role === "product_manager")
    ).toHaveLength(1);
    expect(users.filter((user) => (user as { role: string }).role === "engineer")).toHaveLength(4);
    expect(listProjects(db)).toEqual(SAMPLE_PROJECTS);
  });
});
