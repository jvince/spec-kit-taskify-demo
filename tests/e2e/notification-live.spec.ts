import { expect, test } from "@playwright/test";

test("the global notification list refreshes from the active actor stream", async ({ page }) => {
  let notificationReads = 0;
  await page.route("**/api/v1/notifications", async (route) => {
    notificationReads += 1;
    return route.fulfill({
      json:
        notificationReads > 1
          ? [
              {
                id: "ntf-live",
                eventType: "task_assigned",
                taskId: "tsk-live",
                createdAt: "2026-07-18T00:00:00.000Z"
              }
            ]
          : []
    });
  });
  await page.route("**/api/v1/notifications/stream**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: "event: notification.created\ndata: {}\n\n"
    })
  );

  await page.goto("/");
  await expect(page.getByText("Task Assigned for tsk-live")).toBeVisible();
  await expect(page.getByText(/Live notifications: (connected|reconnecting)/)).toBeVisible();
});
