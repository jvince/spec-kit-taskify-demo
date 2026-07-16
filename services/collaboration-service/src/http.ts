import type Database from "better-sqlite3";
import { hasServiceCredential } from "../../../packages/contracts/src/service-auth";
/** Handles authenticated immutable-comment reads without exposing the private database. */
export function handleCollaborationRequest(
  request: Request,
  db: Database.Database,
  credential?: string
): Response {
  if (!hasServiceCredential(request.headers.get("X-Service-Credential"), credential))
    return new Response(null, { status: 403 });
  const taskId = new URL(request.url).searchParams.get("taskId");
  if (!taskId || !/^tsk-[a-z0-9-]{1,60}$/.test(taskId)) return new Response(null, { status: 400 });
  return Response.json(
    db
      .prepare(
        "SELECT id, task_id AS taskId, author_user_id AS authorUserId, body, created_at AS createdAt FROM comments WHERE task_id = ? ORDER BY created_at"
      )
      .all(taskId)
  );
}
