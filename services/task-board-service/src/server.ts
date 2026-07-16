import { createServer } from "node:http";
import { migrateTaskBoardDatabase, openTaskBoardDatabase } from "./db";
import { handleTaskBoardRequest } from "./http";
/** Starts the independently deployable task-board HTTP service. */
export function startTaskBoardServer(port = 4002): void {
  const db = openTaskBoardDatabase(process.env.TASK_BOARD_DATABASE_PATH);
  migrateTaskBoardDatabase(db);
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
      void handleTaskBoardRequest(request, db, process.env.TASKIFY_SERVICE_CREDENTIAL).then(
        async (result) => {
          res.writeHead(result.status, Object.fromEntries(result.headers));
          res.end(await result.text());
        }
      );
    });
  }).listen(port);
}
