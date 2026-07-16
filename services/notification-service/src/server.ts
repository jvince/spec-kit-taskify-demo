import { createServer } from "node:http";
import { handleNotificationRequest } from "./http";
import { migrateNotificationDatabase, openNotificationDatabase } from "./db";

/** Starts the independently deployable notification HTTP service. */
export function startNotificationServer(port = 4004): void {
  const db = openNotificationDatabase(process.env.NOTIFICATION_DATABASE_PATH);
  migrateNotificationDatabase(db);
  createServer((request, response) => {
    const body = new ReadableStream({
      start(controller) {
        controller.close();
      }
    });
    const url = `http://${request.headers.host ?? "localhost"}${request.url ?? "/"}`;
    const result = handleNotificationRequest(
      new Request(url, {
        method: request.method,
        headers: request.headers as HeadersInit,
        body: ["GET", "HEAD"].includes(request.method ?? "GET") ? undefined : body
      }),
      db,
      process.env.TASKIFY_SERVICE_CREDENTIAL
    );
    response.writeHead(result.status, Object.fromEntries(result.headers));
    const reader = result.body?.getReader();
    if (!reader) return response.end();
    void (async () => {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          response.write(value);
        }
      } finally {
        response.end();
      }
    })();
    request.on("close", () => void reader.cancel());
  }).listen(port);
}
