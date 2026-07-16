"use client";

/** A predefined local-demo participant available without authentication. */
export interface ActiveActor {
  id: string;
  displayName: string;
  role: "product_manager" | "engineer";
}

/** Fixed, deliberately small roster for the local demonstration deployment mode. */
export const LOCAL_DEMO_USERS: readonly ActiveActor[] = [
  { id: "usr-ada-pm", displayName: "Ada Product", role: "product_manager" },
  { id: "usr-blake-eng", displayName: "Blake Engineer", role: "engineer" },
  { id: "usr-casey-eng", displayName: "Casey Engineer", role: "engineer" },
  { id: "usr-devon-eng", displayName: "Devon Engineer", role: "engineer" },
  { id: "usr-ellis-eng", displayName: "Ellis Engineer", role: "engineer" }
] as const;

const STORAGE_KEY = "taskify.local-demo.active-actor";
export const ACTIVE_ACTOR_CHANGED = "taskify:active-actor-changed";

/** Returns the selected allow-listed actor, defaulting to the product manager for a fresh demo. */
export function readActiveActor(): ActiveActor {
  if (typeof window === "undefined") return LOCAL_DEMO_USERS[0];
  const id = window.localStorage.getItem(STORAGE_KEY);
  return LOCAL_DEMO_USERS.find((actor) => actor.id === id) ?? LOCAL_DEMO_USERS[0];
}

/** Persists only an allow-listed local-demo actor and notifies subscribed client components. */
export function setActiveActor(actorId: string): ActiveActor {
  const actor = LOCAL_DEMO_USERS.find((candidate) => candidate.id === actorId);
  if (!actor) throw new Error("The selected local-demo user is not recognized.");
  window.localStorage.setItem(STORAGE_KEY, actor.id);
  window.dispatchEvent(new Event(ACTIVE_ACTOR_CHANGED));
  return actor;
}
