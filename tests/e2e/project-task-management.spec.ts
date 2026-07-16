import { expect, test } from "@playwright/test";

test("the local demo actor controls the Phase 3 project-management workspace", async ({ page }) => {
  const projects = [
    {
      id: "prj-product-launch",
      name: "Product Launch",
      createdByUserId: "usr-ada-pm",
      createdAt: "2026-01-01T00:00:00.000Z"
    }
  ];
  const tasks: Array<{
    id: string;
    projectId: string;
    title: string;
    assigneeUserId: string;
    status: string;
    version: number;
  }> = [];
  const notifications: Record<
    string,
    Array<{ id: string; eventType: string; taskId: string; createdAt: string }>
  > = {};
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const actorId = request.headers()["x-actor-id"];
    if (url.pathname === "/api/v1/projects" && request.method() === "GET")
      return route.fulfill({ json: projects });
    if (url.pathname === "/api/v1/projects" && request.method() === "POST") {
      const input = request.postDataJSON() as { name: string };
      const project = {
        id: "prj-browser-test",
        name: input.name,
        createdByUserId: actorId,
        createdAt: new Date().toISOString()
      };
      projects.push(project);
      return route.fulfill({ status: 201, json: project });
    }
    const taskMatch = /^\/api\/v1\/projects\/(prj-[a-z0-9-]+)\/tasks$/.exec(url.pathname);
    if (taskMatch && request.method() === "GET")
      return route.fulfill({ json: tasks.filter((task) => task.projectId === taskMatch[1]) });
    if (taskMatch && request.method() === "POST") {
      const input = request.postDataJSON() as { title: string; assigneeUserId: string };
      const task = {
        id: "tsk-browser-test",
        projectId: taskMatch[1],
        title: input.title,
        assigneeUserId: input.assigneeUserId,
        status: "todo",
        version: 1
      };
      tasks.push(task);
      notifications[input.assigneeUserId] = [
        {
          id: "ntf-browser-test",
          eventType: "task_assigned",
          taskId: task.id,
          createdAt: new Date().toISOString()
        }
      ];
      return route.fulfill({ status: 201, json: task });
    }
    if (url.pathname === "/api/v1/notifications" && request.method() === "GET")
      return route.fulfill({ json: notifications[actorId] ?? [] });
    return route.fulfill({ status: 404, json: { code: "not_found" } });
  });
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Projects and tasks" })).toBeVisible();
  await expect(page.getByLabel("Active local-demo user")).toHaveValue("usr-ada-pm");
  await expect(page.getByRole("heading", { name: "Create project" })).toBeVisible();
  await page.getByLabel("Project name").fill("Browser Project");
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByText("Project created.")).toBeVisible();
  await page.getByLabel("Task title").fill("Browser task");
  await page.getByRole("button", { name: "Create task" }).click();
  await expect(page.getByText("Task created and assigned.")).toBeVisible();
  await page.getByLabel("Active local-demo user").selectOption("usr-blake-eng");
  await expect(
    page.getByText("Only the product manager can create or assign work in this demo.")
  ).toBeVisible();
  await expect(page.getByText("Task Assigned for tsk-browser-test")).toBeVisible();
  await page.getByLabel("Active local-demo user").selectOption("usr-ada-pm");
  await expect(page.getByText("No notifications for this user.")).toBeVisible();
});
