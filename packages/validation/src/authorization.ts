import type { User } from "../../contracts/src/index";
/** Requires the product-manager role for privileged mutations. */
export function isProductManager(actor: User): boolean {
  return actor.role === "product_manager";
}
