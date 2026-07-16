/** Routes visitors into the available local-demo workspace. */
export default function HomePage() {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <p className="eyebrow">Team productivity, deliberately secure</p>
      <h1 id="welcome-title">Taskify team workspace</h1>
      <p>
        Create projects, assign tasks, and view recipient-specific notifications using the fixed
        local-demo team.
      </p>
      <a className="primary-link" href="/projects">
        Open projects
      </a>
    </section>
  );
}
