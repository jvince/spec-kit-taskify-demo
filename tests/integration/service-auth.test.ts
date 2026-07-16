import { describe, expect, it } from "vitest";
import { hasServiceCredential } from "../../packages/contracts/src/service-auth";
describe("service credentials", () => {
  it("rejects missing or mismatched credentials", () => {
    expect(hasServiceCredential(null, "secret")).toBe(false);
    expect(hasServiceCredential("wrong", "secret")).toBe(false);
  });
});
