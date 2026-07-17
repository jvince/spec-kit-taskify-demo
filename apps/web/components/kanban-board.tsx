"use client";

import { useCallback, useEffect, useState } from "react";
import { TASK_STATUSES, type Task, type TaskStatus } from "@taskify/contracts/src";
import {
  ACTIVE_ACTOR_CHANGED,
  LOCAL_DEMO_USERS,
  readActiveActor,
  type ActiveActor
} from "../lib/active-actor";
import { connectBoardStream } from "../lib/notification-stream";

const LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done"
};

/** Renders four persistent columns with pointer and keyboard-accessible status controls. */
export function KanbanBoard({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Keep SSR and the first client render identical; localStorage is restored in the effect.
  const [actor, setActor] = useState<ActiveActor>(LOCAL_DEMO_USERS[0]);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string>();

  const loadTasks = useCallback(async () => {
    const response = await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/tasks`, {
      headers: { "X-Actor-Id": readActiveActor().id },
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Board tasks are unavailable.");
    const value: unknown = await response.json();
    setTasks(Array.isArray(value) ? value.filter(isTask) : []);
  }, [projectId]);

  useEffect(() => {
    void loadTasks().catch(() => setMessage("Board tasks are unavailable."));
  }, [loadTasks]);
  useEffect(() => {
    const updateActor = () => setActor(readActiveActor());
    updateActor();
    window.addEventListener(ACTIVE_ACTOR_CHANGED, updateActor);
    return () => window.removeEventListener(ACTIVE_ACTOR_CHANGED, updateActor);
  }, []);
  useEffect(
    () => connectBoardStream(actor.id, () => void loadTasks(), setConnected),
    [actor.id, loadTasks]
  );

  async function moveTask(task: Task, status: TaskStatus) {
    if (status === task.status) return;
    if (actor.role !== "product_manager" && actor.id !== task.assigneeUserId) {
      setMessage("Only the assignee or product manager can move this task.");
      return;
    }
    const response = await fetch(`/api/v1/tasks/${encodeURIComponent(task.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Actor-Id": actor.id },
      body: JSON.stringify({ status, version: task.version })
    });
    if (!response.ok) {
      setMessage(
        response.status === 409
          ? "The task changed; the board has been refreshed."
          : "Task move was not accepted."
      );
      await loadTasks();
      return;
    }
    const updated: unknown = await response.json();
    if (isTask(updated))
      setTasks((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setMessage(`${task.title} moved to ${LABELS[status]}.`);
  }

  return (
    <>
      <p className="stream-status" aria-live="polite">
        Live updates: {connected ? "connected" : "reconnecting"}
      </p>
      <div className="kanban-board" aria-label="Project Kanban board">
        {TASK_STATUSES.map((status) => (
          <section
            className="kanban-column"
            aria-labelledby={`column-${status}`}
            key={status}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              const task = tasks.find((item) => item.id === draggedTaskId);
              if (task) void moveTask(task, status);
              setDraggedTaskId(undefined);
            }}
          >
            <h2 id={`column-${status}`}>{LABELS[status]}</h2>
            <div className="kanban-cards">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <article
                    className="task-card"
                    draggable
                    key={task.id}
                    onDragStart={() => setDraggedTaskId(task.id)}
                    aria-label={`${task.title}, ${LABELS[task.status]}`}
                  >
                    <strong>{task.title}</strong>
                    <span>Assignee: {userName(task.assigneeUserId)}</span>
                    <label>
                      Status
                      <select
                        value={task.status}
                        onChange={(event) => void moveTask(task, event.target.value as TaskStatus)}
                      >
                        {TASK_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {LABELS[option]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}
              {!tasks.some((task) => task.status === status) && (
                <p className="empty-column">No tasks</p>
              )}
            </div>
          </section>
        ))}
      </div>
      <p className="feedback" role="status" aria-live="polite">
        {message || "Choose a task status or drag a card to move work."}
      </p>
    </>
  );
}

function isTask(value: unknown): value is Task {
  const task = value as Task;
  return (
    !!task &&
    typeof task.id === "string" &&
    typeof task.projectId === "string" &&
    typeof task.title === "string" &&
    typeof task.assigneeUserId === "string" &&
    TASK_STATUSES.includes(task.status) &&
    Number.isInteger(task.version)
  );
}

function userName(id: string) {
  return LOCAL_DEMO_USERS.find((user) => user.id === id)?.displayName ?? "Unknown user";
}
