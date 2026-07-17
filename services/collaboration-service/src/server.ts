import { createServer } from "node:http";
import { migrateCollaborationDatabase, openCollaborationDatabase } from "./db";
import { handleCollaborationRequest } from "./http";
/** Starts the independently deployable collaboration HTTP service. */
export function startCollaborationServer(port = 4003): void {
  const db = openCollaborationDatabase(process.env.COLLABORATION_DATABASE_PATH);
  migrateCollaborationDatabase(db);
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
      void handleCollaborationRequest(request, db, process.env.TASKIFY_SERVICE_CREDENTIAL).then(
        async (result) => {
          res.writeHead(result.status, Object.fromEntries(result.headers));
          res.end(await result.text());
        }
      );
    });
  }).listen(port);
}
