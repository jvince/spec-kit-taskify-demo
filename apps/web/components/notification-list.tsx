"use client";

import { useCallback, useEffect, useState } from "react";
import { ACTIVE_ACTOR_CHANGED, readActiveActor } from "../lib/active-actor";

interface NotificationItem {
  id: string;
  eventType: string;
  taskId: string;
  createdAt: string;
}

/** Lists only the selected actor's notifications through the browser-facing BFF route. */
export function NotificationList() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [message, setMessage] = useState("Loading notifications…");
  const load = useCallback(async () => {
    const actor = readActiveActor();
    setMessage("Loading notifications…");
    try {
      const response = await fetch("/api/v1/notifications", {
        headers: { "X-Actor-Id": actor.id },
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Notifications are unavailable.");
      const body: unknown = await response.json();
      const notifications = Array.isArray(body) ? body : [];
      setItems(notifications.filter(isNotification));
      setMessage(notifications.length === 0 ? "No notifications for this user." : "");
    } catch {
      setItems([]);
      setMessage("Notifications are unavailable right now.");
    }
  }, []);
  useEffect(() => {
    void load();
    window.addEventListener(ACTIVE_ACTOR_CHANGED, load);
    return () => window.removeEventListener(ACTIVE_ACTOR_CHANGED, load);
  }, [load]);
  return (
    <section className="panel notifications" aria-labelledby="notifications-title">
      <div className="section-heading">
        <h2 id="notifications-title">Notifications</h2>
        <button type="button" className="text-button" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{humanizeEvent(item.eventType)}</strong> for {item.taskId}
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p aria-live="polite">{message}</p>
      )}
    </section>
  );
}

function isNotification(value: unknown): value is NotificationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["id", "eventType", "taskId", "createdAt"].every((key) => typeof item[key] === "string");
}

function humanizeEvent(eventType: string) {
  return eventType.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
