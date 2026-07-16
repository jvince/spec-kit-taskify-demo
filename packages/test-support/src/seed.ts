import type { Project, User } from "../../contracts/src/index";

/** The exact fixed roster permitted by the no-login local demonstration. */
export const SEEDED_USERS: readonly User[] = [
  { id: "usr-ada-pm", displayName: "Ada Product", role: "product_manager" },
  { id: "usr-blake-eng", displayName: "Blake Engineer", role: "engineer" },
  { id: "usr-casey-eng", displayName: "Casey Engineer", role: "engineer" },
  { id: "usr-devon-eng", displayName: "Devon Engineer", role: "engineer" },
  { id: "usr-ellis-eng", displayName: "Ellis Engineer", role: "engineer" }
] as const;

/** Three predictable projects used by development, automated tests, and demonstrations. */
export const SAMPLE_PROJECTS: readonly Project[] = [
  {
    id: "prj-product-launch",
    name: "Product Launch",
    createdByUserId: "usr-ada-pm",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "prj-platform-reliability",
    name: "Platform Reliability",
    createdByUserId: "usr-ada-pm",
    createdAt: "2026-01-02T00:00:00.000Z"
  },
  {
    id: "prj-customer-feedback",
    name: "Customer Feedback",
    createdByUserId: "usr-ada-pm",
    createdAt: "2026-01-03T00:00:00.000Z"
  }
] as const;
