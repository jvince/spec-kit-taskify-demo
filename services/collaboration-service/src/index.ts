/** Collaboration service entry point; HTTP hosting is configured by the deployment adapter. */
export { migrateCollaborationDatabase, openCollaborationDatabase } from "./db";
export { handleCollaborationRequest } from "./http";
