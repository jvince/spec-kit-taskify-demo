import { describe, expect, it } from "vitest";
import { notificationRecipients } from "../../services/notification-service/src/events";
describe("notification recipients", () => {
  it("excludes actors and deduplicates comment recipients", () => {
    expect(
      notificationRecipients("comment_added", "usr-ada-pm", "usr-ada-pm", "usr-ada-pm")
    ).toEqual([]);
  });
  it("notifies the manager for an engineer status change", () => {
    expect(
      notificationRecipients("task_status_changed", "usr-blake-eng", "usr-blake-eng", "usr-ada-pm")
    ).toEqual(["usr-ada-pm"]);
  });
  it("implements the complete recipient matrix without notifying the actor", () => {
    expect(
      notificationRecipients("task_assigned", "usr-ada-pm", "usr-blake-eng", "usr-ada-pm")
    ).toEqual(["usr-blake-eng"]);
    expect(
      notificationRecipients("task_reassigned", "usr-ada-pm", "usr-casey-eng", "usr-ada-pm")
    ).toEqual(["usr-casey-eng"]);
    expect(
      notificationRecipients("task_status_changed", "usr-ada-pm", "usr-blake-eng", "usr-ada-pm")
    ).toEqual(["usr-blake-eng"]);
    expect(
      notificationRecipients("comment_added", "usr-devon-eng", "usr-blake-eng", "usr-ada-pm")
    ).toEqual(["usr-blake-eng", "usr-ada-pm"]);
  });
});
