import { Radio } from "lucide-react";
import { useRealtimeStore } from "../store/realtime";

export function LiveStatusBadge() {
  const connected = useRealtimeStore((s) => s.connected);
  const lastEvent = useRealtimeStore((s) => s.lastEvent);

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-widest ${
      connected
        ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
        : "border-slate-500/30 bg-slate-500/10 text-slate-400"
    }`}>
      <span className={`h-2 w-2 rounded-full ${connected ? "bg-cyan-300 animate-pulse" : "bg-slate-500"}`} />
      <Radio className="h-3.5 w-3.5" />
      {connected ? "AO VIVO" : "OFFLINE"}
      {lastEvent && <span className="hidden md:inline text-muted-foreground">· {lastEvent.type}</span>}
    </div>
  );
}
