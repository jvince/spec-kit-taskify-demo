import { expect, test } from "@playwright/test";

test("predefined users see attributed immutable comments and an explicit empty state", async ({
  page
}) => {
  const comments: Array<{
    id: string;
    taskId: string;
    authorUserId: string;
    body: string;
    createdAt: string;
  }> = [];
  await page.route("**/api/v1/tasks/tsk-comments/comments", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: comments });
    if (route.request().method() === "POST") {
      const input = route.request().postDataJSON() as { body: string };
      const actor = route.request().headers()["x-actor-id"];
      const comment = {
        id: `cmt-${comments.length + 1}`,
        taskId: "tsk-comments",
        authorUserId: actor,
        body: input.body,
        createdAt: new Date().toISOString()
      };
      comments.push(comment);
      return route.fulfill({ status: 201, json: comment });
    }
    return route.fulfill({ status: 405 });
  });
  await page.goto("/tasks/tsk-comments");
  await expect(page.getByText("No comments are available for this task.")).toBeVisible();
  await page.getByLabel("Active local-demo user").selectOption("usr-casey-eng");
  await page.getByRole("textbox", { name: "Comment" }).fill("Casey recorded this decision.");
  await page.getByRole("button", { name: "Add comment" }).click();
  await expect(page.getByText("Casey recorded this decision.")).toBeVisible();
  await expect(page.getByText("Casey Engineer", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /edit|delete/i })).toHaveCount(0);
  await page.getByLabel("Active local-demo user").selectOption("usr-blake-eng");
  await expect(page.getByText("Casey recorded this decision.")).toBeVisible();
});
