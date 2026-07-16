import { isActorId } from "./index";
import { SEEDED_USERS } from "../../test-support/src/seed";
/** Resolves only allow-listed seeded actors; unrecognized headers fail closed. */
export function resolveActor(actorId: unknown) {
  return isActorId(actorId) ? (SEEDED_USERS.find((user) => user.id === actorId) ?? null) : null;
}
