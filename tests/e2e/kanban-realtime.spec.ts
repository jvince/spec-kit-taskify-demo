import { expect, test, type Page } from "@playwright/test";

test("four-column board moves work and refreshes a second client", async ({ browser }) => {
  const tasks = [
    {
      id: "tsk-board",
      projectId: "prj-board",
      title: "Ship board",
      assigneeUserId: "usr-blake-eng",
      status: "todo",
      version: 1
    }
  ];
  const context = await browser.newContext();
  const first = await context.newPage();
  const second = await context.newPage();
  const wire = async (page: Page) =>
    page.route("**/api/v1/**", async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (path.endsWith("/notifications/stream"))
        return route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: 'event: task.updated\ndata: {"taskId":"tsk-board"}\n\n'
        });
      if (path.endsWith("/projects/prj-board/tasks")) return route.fulfill({ json: tasks });
      if (path.endsWith("/tasks/tsk-board") && request.method() === "PATCH") {
        const input = request.postDataJSON() as { status: string; version: number };
        tasks[0] = { ...tasks[0], status: input.status, version: input.version + 1 };
        return route.fulfill({ json: tasks[0] });
      }
      return route.fulfill({ status: 404 });
    });
  await wire(first);
  await wire(second);
  await first.addInitScript(() =>
    localStorage.setItem("taskify.local-demo.active-actor", "usr-blake-eng")
  );
  await second.addInitScript(() =>
    localStorage.setItem("taskify.local-demo.active-actor", "usr-blake-eng")
  );
  await first.goto("/projects/prj-board");
  await second.goto("/projects/prj-board");
  for (const heading of ["To Do", "In Progress", "In Review", "Done"])
    await expect(first.getByRole("heading", { name: heading })).toBeVisible();
  for (const destination of [
    { label: "In Progress", value: "in_progress" },
    { label: "In Review", value: "in_review" },
    { label: "Done", value: "done" }
  ]) {
    await first
      .getByRole("article", { name: /^Ship board,/ })
      .dragTo(first.getByRole("region", { name: destination.label }));
    await expect(first.getByLabel("Status")).toHaveValue(destination.value);
    await expect(second.getByLabel("Status")).toHaveValue(destination.value);
  }
  await expect(second.getByText("Assignee: Blake Engineer")).toBeVisible();
  expect(tasks[0].projectId).toBe("prj-board");
  expect(tasks[0].assigneeUserId).toBe("usr-blake-eng");
  await context.close();
});

test("an empty board retains every column", async ({ page }) => {
  await page.route("**/api/v1/**", (route) =>
    new URL(route.request().url()).pathname.endsWith("/notifications/stream")
      ? route.fulfill({ status: 200, contentType: "text/event-stream", body: ": connected\n\n" })
      : route.fulfill({ json: [] })
  );
  await page.goto("/projects/prj-empty");
  await expect(page.getByText("No tasks")).toHaveCount(4);
});
