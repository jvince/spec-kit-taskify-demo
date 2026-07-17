import type Database from "better-sqlite3";
import type { Comment } from "../../../packages/contracts/src/index";
import { resolveActor } from "../../../packages/validation/src/actor";
import {
  hasExactKeys,
  isAllowedText,
  isRecord,
  isTaskId,
  PATTERNS
} from "../../../packages/validation/src/index";

type CommentResult = {
  comment?: Comment;
  code?: "validation_error" | "forbidden";
};

/** Lists append-only comments for one validated task in creation order. */
export function listComments(db: Database.Database, taskId: string): Comment[] {
  if (!isTaskId(taskId)) return [];
  return db
    .prepare(
      "SELECT id, task_id AS taskId, author_user_id AS authorUserId, body, created_at AS createdAt FROM comments WHERE task_id = ? ORDER BY created_at, id"
    )
    .all(taskId) as Comment[];
}

/** Validates and persists a permanent comment attributed to an allow-listed actor. */
export function createComment(
  db: Database.Database,
  actorId: string,
  taskId: string,
  payload: unknown
): CommentResult {
  if (!resolveActor(actorId)) return { code: "forbidden" };
  if (
    !isTaskId(taskId) ||
    !isRecord(payload) ||
    !hasExactKeys(payload, ["body"]) ||
    !isAllowedText(payload.body, PATTERNS.commentBody, 1, 2000)
  )
    return { code: "validation_error" };
  const body = payload.body.trim();
  if (!body) return { code: "validation_error" };
  const comment: Comment = {
    id: `cmt-${crypto.randomUUID()}`,
    taskId,
    authorUserId: actorId,
    body,
    createdAt: new Date().toISOString()
  };
  db.prepare(
    "INSERT INTO comments (id, task_id, author_user_id, body, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(comment.id, comment.taskId, comment.authorUserId, comment.body, comment.createdAt);
  return { comment };
}
