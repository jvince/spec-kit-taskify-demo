import type { Project, User } from "../../../packages/contracts/src/index";

interface WorkspaceOverviewProps {
  projects: readonly Project[];
  users: readonly User[];
}

/** Displays the fixed people and project seed that makes the local demo immediately usable. */
export function WorkspaceOverview({ projects, users }: WorkspaceOverviewProps) {
  return (
    <div className="workspace-grid workspace-overview">
      <section className="panel" aria-labelledby="roster-title" data-testid="workspace-roster">
        <h2 id="roster-title">People</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <strong>{user.displayName}</strong>
              <span>{user.role === "product_manager" ? "Product manager" : "Engineer"}</span>
            </li>
          ))}
        </ul>
      </section>
      <section
        className="panel"
        aria-labelledby="sample-projects-title"
        data-testid="workspace-projects"
      >
        <h2 id="sample-projects-title">Sample projects</h2>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <a href={`/projects/${project.id}`}>{project.name}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
