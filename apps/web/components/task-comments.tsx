"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Comment } from "@taskify/contracts/src";
import { ACTIVE_ACTOR_CHANGED, LOCAL_DEMO_USERS, readActiveActor } from "../lib/active-actor";

/** Lists permanent attributed comments and provides the only supported mutation: append. */
export function TaskComments({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/v1/tasks/${encodeURIComponent(taskId)}/comments`, {
      headers: { "X-Actor-Id": readActiveActor().id },
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Comments are unavailable.");
    const value: unknown = await response.json();
    setComments(Array.isArray(value) ? value.filter(isComment) : []);
  }, [taskId]);

  useEffect(() => {
    void load().catch(() => setMessage("Comments are unavailable."));
    window.addEventListener(ACTIVE_ACTOR_CHANGED, load);
    return () => window.removeEventListener(ACTIVE_ACTOR_CHANGED, load);
  }, [load]);

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = String(new FormData(form).get("body") ?? "").trim();
    const hasControlCharacter = [...body].some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127;
    });
    if (!body || body.length > 2000 || hasControlCharacter) {
      setMessage("Comments must contain 1–2,000 printable characters.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/v1/tasks/${encodeURIComponent(taskId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Actor-Id": readActiveActor().id },
        body: JSON.stringify({ body })
      });
      if (!response.ok) throw new Error("Comment could not be added.");
      form.reset();
      await load();
      setMessage("Comment added. Comments cannot be edited or deleted.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Comment could not be added.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel task-comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments</h2>
      {comments.length ? (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <strong>{displayName(comment.authorUserId)}</strong>
              <p>{comment.body}</p>
              <small>{new Date(comment.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments are available for this task.</p>
      )}
      <form onSubmit={(event) => void addComment(event)}>
        <label>
          Comment
          <textarea name="body" required maxLength={2000} rows={5} />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add comment"}
        </button>
      </form>
      <p role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}

function isComment(value: unknown): value is Comment {
  const comment = value as Comment;
  return (
    !!comment &&
    typeof comment.id === "string" &&
    typeof comment.taskId === "string" &&
    typeof comment.authorUserId === "string" &&
    typeof comment.body === "string" &&
    typeof comment.createdAt === "string"
  );
}

function displayName(actorId: string) {
  return LOCAL_DEMO_USERS.find((actor) => actor.id === actorId)?.displayName ?? "Unknown user";
}
