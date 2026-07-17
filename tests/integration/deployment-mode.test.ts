import { describe, expect, it } from "vitest";
import { isLocalDemo } from "../../apps/web/app/api/v1/_lib/deployment-mode";
import { proxyServiceRequest } from "../../apps/web/app/api/v1/_lib/service-proxy";
import { GET as streamNotifications } from "../../apps/web/app/api/v1/notifications/stream/route";
describe("deployment mode", () => {
  it("fails closed unless local demo is explicit", () => {
    expect(isLocalDemo()).toBe(false);
  });
  it("rejects BFF requests before any upstream is selected", async () => {
    const response = await proxyServiceRequest(
      new Request("http://taskify/api/v1/projects", { headers: { "X-Actor-Id": "usr-ada-pm" } }),
      ["projects"]
    );
    expect(response.status).toBe(403);
  });
  it("reconstructs notification stream requests without cloning framework request state", async () => {
    const response = await streamNotifications(
      new Request("http://taskify/api/v1/notifications/stream?actorId=usr-ada-pm")
    );
    expect(response.status).toBe(403);
  });
});
