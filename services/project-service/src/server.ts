import { createServer } from "node:http";
import { migrateProjectDatabase, openProjectDatabase } from "./db";
import { handleProjectRequest } from "./http";
import { seedProjectService } from "./seed";
/** Starts the independently deployable project HTTP service. */
export function startProjectServer(port = 4001): void {
  const db = openProjectDatabase(process.env.PROJECT_DATABASE_PATH);
  migrateProjectDatabase(db);
  seedProjectService(db);
  createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const payload = Buffer.concat(chunks);
      const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: ["GET", "HEAD"].includes(req.method ?? "GET") || !payload.length ? undefined : payload
      });
      void handleProjectRequest(request, db, process.env.TASKIFY_SERVICE_CREDENTIAL).then(
        async (result) => {
          res.writeHead(result.status, Object.fromEntries(result.headers));
          res.end(await result.text());
        }
      );
    });
  }).listen(port);
}
