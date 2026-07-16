# Taskify changesets

Use `npm run changeset` for each release-relevant change. Select every affected workspace
package and use semantic versioning: patch for compatible fixes, minor for compatible features,
and major for breaking contracts or migrations.

Changes to production services or `@taskify/contracts` require a changeset. Include every service
affected by a shared contract change. Documentation, tests, and CI-only changes do not require one.

Run `npm run changeset:status` to review the pending release plan. Release maintainers run
`npm run changeset:version`, review the resulting versions and changelogs, and commit that output.
Packages remain private and are versioned for deployment traceability; this configuration never
publishes or tags them automatically.
