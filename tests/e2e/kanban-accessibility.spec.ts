import { expect, test } from "@playwright/test";

test("board controls are keyboard operable, visibly focused, and announce status changes", async ({
  page
}) => {
  const task = {
    id: "tsk-accessible",
    projectId: "prj-accessible",
    title: "Keyboard-ready task",
    assigneeUserId: "usr-blake-eng",
    status: "todo",
    version: 1
  };
  await page.addInitScript(() =>
    localStorage.setItem("taskify.local-demo.active-actor", "usr-blake-eng")
  );
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith("/notifications/stream"))
      return route.fulfill({ status: 200, contentType: "text/event-stream", body: ": ready\n\n" });
    if (path.endsWith("/notifications")) return route.fulfill({ json: [] });
    if (path.endsWith("/projects/prj-accessible/tasks")) return route.fulfill({ json: [task] });
    if (path.endsWith("/tasks/tsk-accessible") && request.method() === "PATCH") {
      const input = request.postDataJSON() as { status: string; version: number };
      task.status = input.status;
      task.version = input.version + 1;
      return route.fulfill({ json: task });
    }
    return route.fulfill({ status: 404 });
  });

  await page.goto("/projects/prj-accessible");
  const status = page.getByRole("article", { name: /Keyboard-ready task/ }).getByLabel("Status");
  await status.focus();
  await expect(status).toBeFocused();
  expect(await status.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
    "none"
  );
  await status.press("End");
  await status.press("Enter");
  await expect(page.getByRole("status")).toContainText("Keyboard-ready task moved to Done.");
  await expect(status).toHaveValue("done");

  for (const control of await page.locator("button, a, input, select, textarea").all())
    expect(
      (await control.getAttribute("aria-label")) || (await control.textContent()) || ""
    ).not.toBe("");
});
