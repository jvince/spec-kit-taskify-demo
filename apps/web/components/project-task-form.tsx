"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ACTIVE_ACTOR_CHANGED,
  LOCAL_DEMO_USERS,
  readActiveActor,
  type ActiveActor
} from "../lib/active-actor";

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  assigneeUserId: string;
  status: string;
  version: number;
}

const safeProjectName = /^[A-Za-z0-9 _.,'()-]{3,120}$/;
const safeTaskTitle = /^[A-Za-z0-9 _.,'()-]{3,160}$/;

/** Provides product-manager-only project, task assignment, and reassignment controls. */
export function ProjectTaskForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectId, setProjectId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Match the server-rendered default, then restore local-demo state after hydration.
  const [actor, setActor] = useState<ActiveActor>(LOCAL_DEMO_USERS[0]);
  const headers = () => ({
    "Content-Type": "application/json",
    "X-Actor-Id": readActiveActor().id
  });
  async function loadProjects() {
    const response = await fetch("/api/v1/projects", {
      headers: { "X-Actor-Id": readActiveActor().id }
    });
    if (!response.ok) throw new Error("Projects are unavailable.");
    const value: unknown = await response.json();
    const loaded = Array.isArray(value) ? value.filter(isProject) : [];
    setProjects(loaded);
    if (!projectId && loaded[0]) setProjectId(loaded[0].id);
  }
  async function loadTasks(nextProjectId: string) {
    if (!nextProjectId) return setTasks([]);
    const response = await fetch(`/api/v1/projects/${encodeURIComponent(nextProjectId)}/tasks`, {
      headers: { "X-Actor-Id": readActiveActor().id }
    });
    if (!response.ok) return setTasks([]);
    const value: unknown = await response.json();
    setTasks(Array.isArray(value) ? value.filter(isTask) : []);
  }
  useEffect(() => {
    void loadProjects().catch((reason: unknown) => setError(messageFor(reason)));
  }, []);
  useEffect(() => {
    const refreshActor = () => setActor(readActiveActor());
    refreshActor();
    window.addEventListener(ACTIVE_ACTOR_CHANGED, refreshActor);
    return () => window.removeEventListener(ACTIVE_ACTOR_CHANGED, refreshActor);
  }, []);
  useEffect(() => {
    void loadTasks(projectId);
  }, [projectId]);

  if (actor.role !== "product_manager")
    return (
      <p className="notice">Only the product manager can create or assign work in this demo.</p>
    );

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("projectName") ?? "").trim();
    if (!safeProjectName.test(name))
      return setError("Project names must be 3–120 permitted characters.");
    await run(async () => {
      const response = await fetch("/api/v1/projects", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ name })
      });
      if (!response.ok)
        throw new Error(await responseMessage(response, "Project could not be created."));
      formElement.reset();
      await loadProjects();
      setNotice("Project created.");
    });
  }
  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("taskTitle") ?? "").trim();
    const assigneeUserId = String(form.get("assigneeUserId") ?? "");
    if (!projectId) return setError("Choose a project first.");
    if (!safeTaskTitle.test(title))
      return setError("Task titles must be 3–160 permitted characters.");
    await run(async () => {
      const response = await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/tasks`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ title, assigneeUserId })
      });
      if (!response.ok)
        throw new Error(await responseMessage(response, "Task could not be created."));
      formElement.reset();
      await loadTasks(projectId);
      setNotice("Task created and assigned.");
    });
  }
  async function reassignTask(task: Task, assigneeUserId: string) {
    if (assigneeUserId === task.assigneeUserId) return;
    await run(async () => {
      const response = await fetch(`/api/v1/tasks/${encodeURIComponent(task.id)}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ assigneeUserId, version: task.version })
      });
      if (!response.ok)
        throw new Error(await responseMessage(response, "Task could not be reassigned."));
      await loadTasks(projectId);
      setNotice("Task reassigned. The new assignee will receive a notification.");
    });
  }
  async function run(action: () => Promise<void>) {
    setError("");
    setNotice("");
    try {
      await action();
    } catch (reason) {
      setError(messageFor(reason));
    }
  }

  return (
    <div className="workspace-grid">
      <section className="panel" aria-labelledby="project-form-title">
        <h2 id="project-form-title">Create project</h2>
        <form onSubmit={(event) => void createProject(event)}>
          <label>
            Project name
            <input name="projectName" required maxLength={120} />
          </label>
          <button type="submit">Create project</button>
        </form>
      </section>
      <section className="panel" aria-labelledby="task-form-title">
        <h2 id="task-form-title">Create and assign task</h2>
        <form onSubmit={(event) => void createTask(event)}>
          <label>
            Project
            <select
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              required
            >
              <option value="">Choose a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Task title
            <input name="taskTitle" required maxLength={160} />
          </label>
          <label>
            Assignee
            <select name="assigneeUserId" required>
              {LOCAL_DEMO_USERS.filter((user) => user.role === "engineer").map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Create task</button>
        </form>
      </section>
      <section className="panel tasks" aria-labelledby="tasks-title">
        <h2 id="tasks-title">Tasks</h2>
        {tasks.length ? (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>Status: {task.status.replace("_", " ")}</span>
                <label>
                  Assignee
                  <select
                    value={task.assigneeUserId}
                    onChange={(event) => void reassignTask(task, event.target.value)}
                  >
                    {LOCAL_DEMO_USERS.filter((user) => user.role === "engineer").map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks in this project yet.</p>
        )}
      </section>
      {(notice || error) && (
        <p className={error ? "feedback error" : "feedback"} role="status">
          {error || notice}
        </p>
      )}
    </div>
  );
}

function isProject(value: unknown): value is Project {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as Project).id === "string" &&
    typeof (value as Project).name === "string"
  );
}
function isTask(value: unknown): value is Task {
  const task = value as Task;
  return (
    !!task &&
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.version === "number" &&
    typeof task.assigneeUserId === "string" &&
    typeof task.status === "string"
  );
}
function messageFor(reason: unknown) {
  return reason instanceof Error ? reason.message : "The request could not be completed.";
}
async function responseMessage(response: Response, fallback: string) {
  const body: unknown = await response.json().catch(() => null);
  return body &&
    typeof body === "object" &&
    typeof (body as { message?: unknown }).message === "string"
    ? (body as { message: string }).message
    : fallback;
}
