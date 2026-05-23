import { useGetStations } from "@workspace/api-client-react";
import { RadioTower, Battery, Signal, Clock, MapPin, Activity } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  online: { label: "Online", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  offline: { label: "Offline", color: "bg-red-500/20 text-red-400 border-red-500/30", dot: "bg-red-400" },
  maintenance: { label: "Manutenção", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", dot: "bg-yellow-400" },
  planned: { label: "Planejada", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", dot: "bg-blue-400" },
};

const TYPE_LABELS: Record<string, string> = {
  meteorological: "Meteorológica",
  hydrological: "Hidrológica",
  air_quality: "Qualidade do Ar",
  fire_detection: "Detecção de Incêndio",
  multi: "Multi-sensor",
};

function BatteryBar({ level }: { level: number | null }) {
  if (level === null) return <span className="text-muted-foreground font-mono text-xs">N/A</span>;
  const color = level > 50 ? "bg-emerald-500" : level > 20 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs font-mono tabular-nums">{level.toFixed(0)}%</span>
    </div>
  );
}

function SignalBars({ strength }: { strength: number | null }) {
  if (strength === null) return <span className="text-muted-foreground font-mono text-xs">N/A</span>;
  const quality = strength > -65 ? "Excelente" : strength > -75 ? "Bom" : strength > -85 ? "Regular" : "Fraco";
  const color = strength > -65 ? "text-emerald-400" : strength > -75 ? "text-yellow-400" : "text-red-400";
  return (
    <span className={`text-xs font-mono ${color}`}>{strength} dBm ({quality})</span>
  );
}

export default function Stations() {
  const { data: stations, isLoading } = useGetStations();

  const online = (stations ?? []).filter((s) => s.status === "online").length;
  const offline = (stations ?? []).filter((s) => s.status === "offline").length;
  const maintenance = (stations ?? []).filter((s) => s.status === "maintenance").length;
  const planned = (stations ?? []).filter((s) => s.status === "planned").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estações IoT</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Infraestrutura de monitoramento em campo — {(stations ?? []).length} estações registradas
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Online", count: online, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Offline", count: offline, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Manutenção", count: maintenance, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Planejada", count: planned, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-card-border rounded-lg p-4">
            <div className={`w-8 h-8 rounded-md ${item.bg} flex items-center justify-center mb-2`}>
              <RadioTower className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.count}</div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Future IoT note */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <Activity className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-400 font-mono">Infraestrutura IoT Preparada</p>
          <p className="text-xs text-blue-400/70 mt-1">
            O SAI está preparado para integração com estações físicas ESP32/LoRa via MQTT. 
            Suporte a sensores climáticos, ultrassônicos, fumaça, câmeras e estações hidrológicas.
            Tópicos MQTT: sai/station/{"{id}"}/climate, river, smoke, camera, alerts
          </p>
        </div>
      </div>

      {/* Stations list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-card border border-card-border rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {(stations ?? []).map((station) => {
            const cfg = STATUS_CONFIG[station.status] ?? STATUS_CONFIG.planned;
            return (
              <div
                key={station.id}
                data-testid={`station-card-${station.id}`}
                className="bg-card border border-card-border rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <RadioTower className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{station.name}</span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block mr-1 ${station.status === "online" ? "animate-pulse" : ""}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {TYPE_LABELS[station.type] ?? station.type}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-muted-foreground text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <MapPin className="w-3 h-3" />
                      {station.lat.toFixed(4)}, {station.lon.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono uppercase mb-1.5">
                      <Battery className="w-3 h-3" />
                      Bateria
                    </div>
                    <BatteryBar level={station.batteryLevel ?? null} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono uppercase mb-1.5">
                      <Signal className="w-3 h-3" />
                      Sinal
                    </div>
                    <SignalBars strength={station.signalStrength ?? null} />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono uppercase mb-1.5">
                      <Clock className="w-3 h-3" />
                      Última Leitura
                    </div>
                    <span className="text-xs font-mono">
                      {station.lastReading
                        ? new Date(station.lastReading).toLocaleString("pt-BR")
                        : "Sem leituras"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
