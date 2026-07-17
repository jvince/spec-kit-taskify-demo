"use client";

import { useEffect, useState } from "react";
import {
  ACTIVE_ACTOR_CHANGED,
  LOCAL_DEMO_USERS,
  readActiveActor,
  resetActiveActor,
  setActiveActor
} from "../lib/active-actor";

/** Lets a visitor switch among the fixed local-demo actors; it is not an authentication control. */
export function ActiveUserSelector() {
  const [actorId, setActorId] = useState(LOCAL_DEMO_USERS[0].id);
  useEffect(() => {
    const sync = () => setActorId(readActiveActor().id);
    sync();
    window.addEventListener(ACTIVE_ACTOR_CHANGED, sync);
    return () => window.removeEventListener(ACTIVE_ACTOR_CHANGED, sync);
  }, []);

  return (
    <div className="actor-controls">
      <label className="actor-selector">
        <span>Viewing as</span>
        <select
          aria-label="Active local-demo user"
          value={actorId}
          onChange={(event) => {
            setActiveActor(event.target.value);
            setActorId(event.target.value);
          }}
        >
          {LOCAL_DEMO_USERS.map((actor) => (
            <option key={actor.id} value={actor.id}>
              {actor.displayName} (
              {actor.role === "product_manager" ? "Product manager" : "Engineer"})
            </option>
          ))}
        </select>
      </label>
      <button
        className="text-button"
        type="button"
        onClick={() => setActorId(resetActiveActor().id)}
      >
        Reset active user
      </button>
    </div>
  );
}
