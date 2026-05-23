import { useEffect } from "react";
import { useRealtimeStore } from "../store/realtime";

function getApiBase() {
  const envBase = import.meta.env.VITE_API_URL as string | undefined;
  if (!envBase) return "";
  return envBase.replace(/\/api\/?$/, "");
}

export function useRealtime() {
  const setConnected = useRealtimeStore((s) => s.setConnected);
  const pushEvent = useRealtimeStore((s) => s.pushEvent);

  useEffect(() => {
    const base = getApiBase();
    const source = new EventSource(`${base}/api/realtime/stream`);

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    const eventTypes = [
      "weather:update",
      "fire:update",
      "air:update",
      "station:update",
      "alert:new",
      "alert:updated",
      "risk:update",
      "system:health",
      "sensor:reading",
    ];

    const handlers = eventTypes.map((type) => {
      const handler = (message: MessageEvent) => {
        try {
          pushEvent(JSON.parse(message.data));
        } catch {
          // ignore malformed event
        }
      };
      source.addEventListener(type, handler);
      return { type, handler };
    });

    return () => {
      handlers.forEach(({ type, handler }) => source.removeEventListener(type, handler));
      source.close();
      setConnected(false);
    };
  }, [pushEvent, setConnected]);
}
