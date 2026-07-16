import type Database from "better-sqlite3";
import { hasServiceCredential } from "../../../packages/contracts/src/service-auth";
/** Handles authenticated task-board reads without exposing the private database. */
export function handleTaskBoardRequest(
  request: Request,
  db: Database.Database,
  credential?: string
): Response {
  if (!hasServiceCredential(request.headers.get("X-Service-Credential"), credential))
    return new Response(null, { status: 403 });
  const projectId = new URL(request.url).searchParams.get("projectId");
  if (!projectId || !/^prj-[a-z0-9-]{1,60}$/.test(projectId))
    return new Response(null, { status: 400 });
  return Response.json(
    db
      .prepare(
        "SELECT id, project_id AS projectId, title, assignee_user_id AS assigneeUserId, status, version FROM tasks WHERE project_id = ?"
      )
      .all(projectId)
  );
}
