import { createServer } from "node:http";
import { migrateCollaborationDatabase, openCollaborationDatabase } from "./db";
import { handleCollaborationRequest } from "./http";
/** Starts the independently deployable collaboration HTTP service. */
export function startCollaborationServer(port = 4003): void {
  const db = openCollaborationDatabase(process.env.COLLABORATION_DATABASE_PATH);
  migrateCollaborationDatabase(db);
  createServer((req, res) => {
    const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`, {
      method: req.method,
      headers: req.headers as HeadersInit
    });
    const result = handleCollaborationRequest(request, db, process.env.TASKIFY_SERVICE_CREDENTIAL);
    result.text().then((text) => {
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(text);
    });
  }).listen(port);
}
