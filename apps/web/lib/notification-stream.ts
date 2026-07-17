/** Opens the active actor's authenticated event stream and refreshes after events or reconnects. */
export function connectBoardStream(
  actorId: string,
  refresh: () => void,
  onConnectionChange: (connected: boolean) => void = () => undefined
): () => void {
  let stopped = false;
  let source: EventSource | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;

  const connect = () => {
    if (stopped) return;
    source = new EventSource(`/api/v1/notifications/stream?actorId=${encodeURIComponent(actorId)}`);
    source.onopen = () => {
      onConnectionChange(true);
      refresh();
    };
    source.addEventListener("task.updated", refresh);
    source.onerror = () => {
      onConnectionChange(false);
      source?.close();
      if (!stopped) retry = setTimeout(connect, 500);
    };
  };
  connect();
  return () => {
    stopped = true;
    if (retry) clearTimeout(retry);
    source?.close();
  };
}
