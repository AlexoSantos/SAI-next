import type { Response } from "express";

export type RealtimeEventType =
  | "weather:update"
  | "fire:update"
  | "air:update"
  | "station:update"
  | "alert:new"
  | "alert:updated"
  | "risk:update"
  | "system:health"
  | "sensor:reading";

export type RealtimeEvent = {
  id: string;
  type: RealtimeEventType;
  tenantId?: string;
  timestamp: string;
  payload: Record<string, unknown>;
};

const clients = new Set<Response>();
const lastEvents: RealtimeEvent[] = [];

function pushHistory(event: RealtimeEvent) {
  lastEvents.unshift(event);
  if (lastEvents.length > 100) lastEvents.pop();
}

export function createRealtimeEvent(
  type: RealtimeEventType,
  payload: Record<string, unknown>,
  tenantId = "imperatech",
): RealtimeEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    tenantId,
    timestamp: new Date().toISOString(),
    payload,
  };
}

export function broadcastRealtime(event: RealtimeEvent) {
  pushHistory(event);
  const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
  for (const client of clients) {
    client.write(data);
  }
}

export function addRealtimeClient(res: Response) {
  clients.add(res);
  res.write(`event: system:health\ndata: ${JSON.stringify(createRealtimeEvent("system:health", {
    status: "connected",
    clients: clients.size,
    mode: "sse-fallback",
  }))}\n\n`);

  return () => {
    clients.delete(res);
  };
}

export function getRealtimeStatus() {
  return {
    mode: "sse-fallback",
    clients: clients.size,
    eventsBuffered: lastEvents.length,
    topics: [
      "sai/station/{id}/climate",
      "sai/station/{id}/river",
      "sai/station/{id}/smoke",
      "sai/station/{id}/camera",
      "sai/station/{id}/alerts",
    ],
  };
}

export function getLastRealtimeEvents() {
  return lastEvents;
}
