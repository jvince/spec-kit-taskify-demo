# Release tracking

Taskify uses Changesets to record release-relevant changes in this monorepo. A changeset captures
the semantic-version bump and changelog summary at the same time as the implementation change.

## Contributor workflow

1. Run `npm run changeset` after completing a release-relevant change.
2. Select each impacted package. Include `@taskify/contracts` and every affected service for a
   REST-contract change.
3. Choose patch for a compatible fix, minor for a compatible feature, or major for a breaking
   API, behavior, or migration change.
4. Commit the generated `.changeset/*.md` file with the implementation.

No changeset is required for documentation-only, test-only, or CI-only work.

## Release-maintainer workflow

Run `npm run changeset:status` to inspect the pending plan. When a release is approved, run
`npm run changeset:version`, review all version and changelog changes, test them, and commit the
result. Packages are private: changesets updates versions for traceability but does not publish or
create tags automatically.
