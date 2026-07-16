/** Allows the seeded actor selector only in an explicitly local demo deployment. */
export function isLocalDemo(): boolean {
  return process.env.TASKIFY_DEPLOYMENT_MODE === "local-demo";
}
