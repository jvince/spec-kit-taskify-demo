import { expect, test } from "@playwright/test";

test("the initial workspace shows its fixed seed and persists or resets the active actor", async ({
  page
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Taskify team workspace" })).toBeVisible();
  await expect(page.getByLabel("Active local-demo user")).toHaveValue("usr-ada-pm");
  await expect(page.getByTestId("workspace-roster").getByRole("listitem")).toHaveCount(5);
  await expect(page.getByText("Product manager", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Engineer", { exact: true })).toHaveCount(4);
  await expect(page.getByTestId("workspace-projects").getByRole("listitem")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Product Launch" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Platform Reliability" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Customer Feedback" })).toBeVisible();

  await page.getByLabel("Active local-demo user").selectOption("usr-devon-eng");
  await page.reload();
  await expect(page.getByLabel("Active local-demo user")).toHaveValue("usr-devon-eng");

  await page.getByRole("button", { name: "Reset active user" }).click();
  await expect(page.getByLabel("Active local-demo user")).toHaveValue("usr-ada-pm");
  await page.reload();
  await expect(page.getByLabel("Active local-demo user")).toHaveValue("usr-ada-pm");
  await expect(page.getByRole("link", { name: /open all projects/i })).toHaveAttribute(
    "href",
    "/projects"
  );
});
