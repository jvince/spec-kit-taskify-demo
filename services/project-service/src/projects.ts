import type Database from "better-sqlite3";
import type { Project } from "../../../packages/contracts/src/index";
import { isAllowedText, PATTERNS } from "../../../packages/validation/src/index";
import { isProductManager } from "../../../packages/validation/src/authorization";
import { resolveActor } from "../../../packages/validation/src/actor";

/** Returns the project owned by this service, or null when its identifier is unknown. */
export function findProject(db: Database.Database, projectId: string): Project | null {
  return (
    (db
      .prepare(
        "SELECT id, name, created_by_user_id AS createdByUserId, created_at AS createdAt FROM projects WHERE id = ?"
      )
      .get(projectId) as Project | undefined) ?? null
  );
}

/** Lists all projects in stable creation order for the local workspace. */
export function listProjects(db: Database.Database): Project[] {
  return db
    .prepare(
      "SELECT id, name, created_by_user_id AS createdByUserId, created_at AS createdAt FROM projects ORDER BY created_at, id"
    )
    .all() as Project[];
}

/** Validates and persists a product-manager-created project without accepting unknown fields. */
export function createProject(
  db: Database.Database,
  actorId: string,
  payload: unknown
): { project?: Project; code?: "validation_error" | "forbidden" | "conflict" } {
  const actor = resolveActor(actorId);
  if (!actor || !isProductManager(actor)) return { code: "forbidden" };
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    Object.keys(payload).length !== 1 ||
    !("name" in payload) ||
    !isAllowedText(payload.name, PATTERNS.projectName, 1, 120)
  )
    return { code: "validation_error" };
  const name = payload.name.trim();
  if (!name) return { code: "validation_error" };
  const project: Project = {
    id: `prj-${crypto.randomUUID()}`,
    name,
    createdByUserId: actor.id,
    createdAt: new Date().toISOString()
  };
  try {
    db.prepare(
      "INSERT INTO projects (id, name, created_by_user_id, created_at) VALUES (?, ?, ?, ?)"
    ).run(project.id, project.name, project.createdByUserId, project.createdAt);
    return { project };
  } catch {
    return { code: "conflict" };
  }
}
