"use client";

import { useCallback, useEffect, useState } from "react";
import { ACTIVE_ACTOR_CHANGED, readActiveActor } from "../lib/active-actor";

interface NotificationItem {
  id: string;
  eventType: string;
  taskId: string;
  createdAt: string;
}

/** Lists and live-refreshes notifications owned by the selected local-demo actor. */
export function NotificationList() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [message, setMessage] = useState("Loading notifications…");
  const [streamStatus, setStreamStatus] = useState("connecting");
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
      const notifications = Array.isArray(body) ? body.filter(isNotification) : [];
      setItems(notifications);
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
  useEffect(() => {
    let source: EventSource | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const connect = () => {
      if (stopped) return;
      setStreamStatus("connecting");
      source = new EventSource(
        `/api/v1/notifications/stream?actorId=${encodeURIComponent(readActiveActor().id)}`
      );
      source.onopen = () => {
        setStreamStatus("connected");
        void load();
      };
      source.addEventListener("notification.created", () => void load());
      source.onerror = () => {
        setStreamStatus("reconnecting");
        source?.close();
        if (!stopped) retry = setTimeout(connect, 500);
      };
    };
    const reconnectForActor = () => {
      source?.close();
      if (retry) clearTimeout(retry);
      connect();
    };
    connect();
    window.addEventListener(ACTIVE_ACTOR_CHANGED, reconnectForActor);
    return () => {
      stopped = true;
      if (retry) clearTimeout(retry);
      source?.close();
      window.removeEventListener(ACTIVE_ACTOR_CHANGED, reconnectForActor);
    };
  }, [load]);

  return (
    <section
      className="panel notifications global-notifications"
      aria-labelledby="notifications-title"
    >
      <div className="section-heading">
        <h2 id="notifications-title">Notifications</h2>
        <button type="button" className="text-button" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      <p className="stream-status" aria-live="polite">
        Live notifications: {streamStatus}
      </p>
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
        <p aria-live="polite">{message || "No notifications for this user."}</p>
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
