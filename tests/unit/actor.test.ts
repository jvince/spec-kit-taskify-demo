import { describe, expect, it } from "vitest";
import { resolveActor } from "../../packages/validation/src/actor";
describe("active actor", () => {
  it("fails closed for unknown actors", () => {
    expect(resolveActor("usr-unknown")).toBeNull();
  });
  it("resolves a seeded actor", () => {
    expect(resolveActor("usr-ada-pm")?.role).toBe("product_manager");
  });
});
