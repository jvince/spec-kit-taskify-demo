"use client";

import { ActiveUserSelector } from "../../components/active-user-selector";
import { ProjectTaskForm } from "../../components/project-task-form";

/** Renders the local-demo project and task-management workspace. */
export default function ProjectsPage() {
  return (
    <section className="workspace" aria-labelledby="workspace-title">
      <div className="workspace-header">
        <div>
          <p className="eyebrow">Local demonstration</p>
          <h1 id="workspace-title">Projects and tasks</h1>
        </div>
        <ActiveUserSelector />
      </div>
      <p className="local-demo-note">
        This selector changes the local demo actor only; it is not a login or authorization system.
      </p>
      <ProjectTaskForm />
    </section>
  );
}
