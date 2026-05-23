import { create } from "zustand";

export type RealtimeEvent = {
  id: string;
  type: string;
  tenantId?: string;
  timestamp: string;
  payload: Record<string, unknown>;
};

type RealtimeState = {
  connected: boolean;
  mode: "offline" | "sse" | "websocket-ready";
  lastEvent: RealtimeEvent | null;
  events: RealtimeEvent[];
  setConnected: (connected: boolean) => void;
  pushEvent: (event: RealtimeEvent) => void;
};

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  mode: "offline",
  lastEvent: null,
  events: [],
  setConnected: (connected) => set({ connected, mode: connected ? "sse" : "offline" }),
  pushEvent: (event) =>
    set((state) => ({
      lastEvent: event,
      events: [event, ...state.events].slice(0, 50),
    })),
}));
