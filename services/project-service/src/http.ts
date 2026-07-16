import type Database from "better-sqlite3";
import { hasServiceCredential } from "../../../packages/contracts/src/service-auth";
import { createProject, findProject, listProjects } from "./projects";
/** Handles authenticated project-service reads without exposing the private database. */
export async function handleProjectRequest(
  request: Request,
  db: Database.Database,
  credential?: string
): Promise<Response> {
  if (!hasServiceCredential(request.headers.get("X-Service-Credential"), credential))
    return new Response(null, { status: 403 });
  const url = new URL(request.url);
  const actorId = request.headers.get("X-Actor-Id") ?? "";
  if (url.pathname === "/v1/projects" && request.method === "GET")
    return Response.json(listProjects(db));
  if (url.pathname === "/v1/projects" && request.method === "POST") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return new Response(null, { status: 400 });
    }
    const result = createProject(db, actorId, payload);
    return result.project
      ? Response.json(result.project, { status: 201 })
      : new Response(null, {
          status: result.code === "forbidden" ? 403 : result.code === "conflict" ? 409 : 400
        });
  }
  const match = /^\/v1\/projects\/(prj-[a-z0-9-]{1,60})$/.exec(url.pathname);
  if (match && request.method === "GET") {
    const project = findProject(db, match[1]);
    return project ? Response.json(project) : new Response(null, { status: 404 });
  }
  return new Response(null, { status: 404 });
}
