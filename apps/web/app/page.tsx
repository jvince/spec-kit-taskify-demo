import { SAMPLE_PROJECTS, SEEDED_USERS } from "../../../packages/test-support/src/seed";
import { ActiveUserSelector } from "../components/active-user-selector";
import { WorkspaceOverview } from "../components/workspace-overview";

/** Presents the ready-to-use seeded workspace without collecting login credentials. */
export default function HomePage() {
  return (
    <main className="workspace" aria-labelledby="welcome-title">
      <div className="workspace-header">
        <div>
          <p className="eyebrow">Ready-to-use local demo</p>
          <h1 id="welcome-title">Taskify team workspace</h1>
        </div>
        <ActiveUserSelector />
      </div>
      <p className="local-demo-note">
        Choose a predefined actor to explore this seeded workspace. This selector is local-demo
        context, not authentication, and collects no credentials.
      </p>
      <WorkspaceOverview projects={SAMPLE_PROJECTS} users={SEEDED_USERS} />
      <a className="primary-link workspace-action" href="/projects">
        Open all projects
      </a>
    </main>
  );
}
