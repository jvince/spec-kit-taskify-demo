import { createServer } from "node:http";
import { migrateProjectDatabase, openProjectDatabase } from "./db";
import { handleProjectRequest } from "./http";
/** Starts the independently deployable project HTTP service. */
export function startProjectServer(port = 4001): void {
  const db = openProjectDatabase(process.env.PROJECT_DATABASE_PATH);
  migrateProjectDatabase(db);
  createServer((req, res) => {
    const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`, {
      method: req.method,
      headers: req.headers as HeadersInit
    });
    const result = handleProjectRequest(request, db, process.env.TASKIFY_SERVICE_CREDENTIAL);
    result.text().then((text) => {
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(text);
    });
  }).listen(port);
}
