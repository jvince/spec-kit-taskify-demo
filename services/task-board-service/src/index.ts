/** Task-board service entry point; HTTP hosting is configured by the deployment adapter. */
export { migrateTaskBoardDatabase, openTaskBoardDatabase } from "./db";
export { handleTaskBoardRequest } from "./http";
