import type Database from "better-sqlite3";
import { hasServiceCredential } from "../../../packages/contracts/src/service-auth";
/** Handles authenticated project-service reads without exposing the private database. */
export function handleProjectRequest(
  request: Request,
  db: Database.Database,
  credential?: string
): Response {
  if (!hasServiceCredential(request.headers.get("X-Service-Credential"), credential))
    return new Response(null, { status: 403 });
  if (new URL(request.url).pathname !== "/v1/projects") return new Response(null, { status: 404 });
  return Response.json(
    db
      .prepare(
        "SELECT id, name, created_by_user_id AS createdByUserId, created_at AS createdAt FROM projects ORDER BY created_at"
      )
      .all()
  );
}
