import { afterEach, describe, expect, it } from "vitest";
import { errorResponse } from "../../apps/web/app/api/v1/_lib/response";
import { proxyServiceRequest } from "../../apps/web/app/api/v1/_lib/service-proxy";

const originalEnvironment = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("privacy-safe diagnostics", () => {
  it("returns only a stable safe category and opaque correlation id", async () => {
    const response = errorResponse("validation_error", 400);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toEqual({
      code: "validation_error",
      message: "The request is invalid.",
      correlationId: expect.stringMatching(/^req-[a-z0-9-]{8,64}$/)
    });
    expect(JSON.stringify(body)).not.toMatch(/credential|sqlite|stack|request body/i);
  });

  it("does not echo credentials, origins, or raw payloads when the BFF fails closed", async () => {
    process.env.TASKIFY_DEPLOYMENT_MODE = "local-demo";
    process.env.TASKIFY_PROJECT_SERVICE_ORIGIN = "not a valid origin";
    process.env.TASKIFY_SERVICE_CREDENTIAL = "secret-credential-value-123456";
    const rawPayload = "private raw request body";
    const response = await proxyServiceRequest(
      new Request("http://localhost/api/v1/projects", {
        method: "POST",
        headers: { "X-Actor-Id": "usr-ada-pm", "Content-Type": "application/json" },
        body: rawPayload
      }),
      ["projects"]
    );
    const text = await response.text();
    expect(response.status).toBe(404);
    expect(text).not.toContain(rawPayload);
    expect(text).not.toContain(process.env.TASKIFY_SERVICE_CREDENTIAL);
    expect(text).not.toContain(process.env.TASKIFY_PROJECT_SERVICE_ORIGIN);
  });
});
