import { createServer } from "node:http";
import { handleNotificationIngestion, handleNotificationRequest } from "./http";
import { migrateNotificationDatabase, openNotificationDatabase } from "./db";

/** Starts the independently deployable notification HTTP service. */
export function startNotificationServer(port = 4004): void {
  const db = openNotificationDatabase(process.env.NOTIFICATION_DATABASE_PATH);
  migrateNotificationDatabase(db);
  createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on(
      "end",
      () =>
        void (async () => {
          const payload = Buffer.concat(chunks);
          const url = `http://${request.headers.host ?? "localhost"}${request.url ?? "/"}`;
          const incoming = new Request(url, {
            method: request.method,
            headers: request.headers as HeadersInit,
            body:
              ["GET", "HEAD"].includes(request.method ?? "GET") || !payload.length
                ? undefined
                : payload
          });
          const result =
            new URL(url).pathname === "/v1/notification-events"
              ? await handleNotificationIngestion(
                  incoming,
                  db,
                  process.env.TASKIFY_SERVICE_CREDENTIAL
                )
              : handleNotificationRequest(incoming, db, process.env.TASKIFY_SERVICE_CREDENTIAL);
          response.writeHead(result.status, Object.fromEntries(result.headers));
          const reader = result.body?.getReader();
          if (!reader) return response.end();
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              response.write(value);
            }
          } finally {
            response.end();
          }
          request.on("close", () => void reader.cancel());
        })()
    );
  }).listen(port);
}
