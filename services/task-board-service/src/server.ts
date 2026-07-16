import { createServer } from "node:http";
import { migrateTaskBoardDatabase, openTaskBoardDatabase } from "./db";
import { handleTaskBoardRequest } from "./http";
/** Starts the independently deployable task-board HTTP service. */
export function startTaskBoardServer(port = 4002): void {
  const db = openTaskBoardDatabase(process.env.TASK_BOARD_DATABASE_PATH);
  migrateTaskBoardDatabase(db);
  createServer((req, res) => {
    const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`, {
      method: req.method,
      headers: req.headers as HeadersInit
    });
    const result = handleTaskBoardRequest(request, db, process.env.TASKIFY_SERVICE_CREDENTIAL);
    result.text().then((text) => {
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(text);
    });
  }).listen(port);
}
