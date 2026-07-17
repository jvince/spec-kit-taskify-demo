/* global URL, console, process */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const localEnvironment = fileURLToPath(new URL("../apps/web/.env.local", import.meta.url));
if (existsSync(localEnvironment)) process.loadEnvFile(localEnvironment);

process.env.TASKIFY_DEPLOYMENT_MODE ||= "local-demo";
process.env.TASKIFY_PROJECT_SERVICE_ORIGIN ||= "http://127.0.0.1:4101";
process.env.TASKIFY_TASK_BOARD_SERVICE_ORIGIN ||= "http://127.0.0.1:4102";
process.env.TASKIFY_COLLABORATION_SERVICE_ORIGIN ||= "http://127.0.0.1:4103";
process.env.TASKIFY_NOTIFICATION_SERVICE_ORIGIN ||= "http://127.0.0.1:4104";

if ((process.env.TASKIFY_SERVICE_CREDENTIAL?.length ?? 0) < 24) {
  console.error(
    "Set TASKIFY_SERVICE_CREDENTIAL to at least 24 characters in apps/web/.env.local before running dev:all."
  );
  process.exit(1);
}

const dataDirectory = fileURLToPath(new URL("../.taskify-data/", import.meta.url));
mkdirSync(dataDirectory, { recursive: true });
process.env.PROJECT_DATABASE_PATH ||= `${dataDirectory}/project.sqlite`;
process.env.TASK_BOARD_DATABASE_PATH ||= `${dataDirectory}/task-board.sqlite`;
process.env.COLLABORATION_DATABASE_PATH ||= `${dataDirectory}/collaboration.sqlite`;
process.env.NOTIFICATION_DATABASE_PATH ||= `${dataDirectory}/notification.sqlite`;

const tsx = fileURLToPath(import.meta.resolve("tsx/cli"));
const next = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
const serviceEntry = fileURLToPath(new URL("./start-service.ts", import.meta.url));
const commands = [
  ["project", [tsx, serviceEntry, "project", "4101"], root],
  ["task-board", [tsx, serviceEntry, "task-board", "4102"], root],
  ["collaboration", [tsx, serviceEntry, "collaboration", "4103"], root],
  ["notification", [tsx, serviceEntry, "notification", "4104"], root],
  ["web", [next, "dev"], fileURLToPath(new URL("../apps/web/", import.meta.url))]
];
const children = new Map();
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children.values()) child.kill();
  process.exitCode = exitCode;
}

for (const [name, args, cwd] of commands) {
  const child = spawn(process.execPath, args, { cwd, env: process.env, stdio: "inherit" });
  children.set(name, child);
  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    children.delete(name);
    if (!stopping) {
      console.error(`[${name}] exited (${signal ?? code ?? "unknown"}); stopping dev environment.`);
      stop(code || 1);
    }
  });
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
