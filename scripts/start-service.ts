import { startCollaborationServer } from "../services/collaboration-service/src/server";
import { startNotificationServer } from "../services/notification-service/src/server";
import { startProjectServer } from "../services/project-service/src/server";
import { startTaskBoardServer } from "../services/task-board-service/src/server";

const serviceName = process.argv[2];
const port = Number(process.argv[3]);
const starters: Record<string, (port: number) => void> = {
  project: startProjectServer,
  "task-board": startTaskBoardServer,
  collaboration: startCollaborationServer,
  notification: startNotificationServer
};
const start = serviceName ? starters[serviceName] : undefined;

if (!start || !Number.isInteger(port) || port < 1 || port > 65_535) {
  console.error(
    "Usage: npm run dev:service -- <project|task-board|collaboration|notification> <port>"
  );
  process.exit(1);
}

start(port);
console.log(`[${serviceName}] listening on http://127.0.0.1:${port}`);
