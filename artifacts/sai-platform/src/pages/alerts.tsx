import { useState } from "react";
import { useGetAlerts } from "@workspace/api-client-react";
import { AlertTriangle, ShieldCheck, Filter, Flame, CloudRain, Wind, Thermometer, Droplets, Activity } from "lucide-react";

const SEVERITY_LABELS: Record<string, string> = {
  low: "Baixo",
  moderate: "Moderado",
  high: "Alto",
  critical: "Crítico",
  extreme: "Extremo",
};

const TYPE_LABELS: Record<string, string> = {
  flood: "Enchente",
  fire: "Incêndio",
  storm: "Tempestade",
  extreme_heat: "Calor Extremo",
  drought: "Seca",
  air_quality: "Qualidade do Ar",
  wind: "Vento",
  custom: "Personalizado",
};

function getTypeIcon(type: string) {
  const props = { className: "w-4 h-4" };
  switch (type) {
    case "fire": return <Flame {...props} />;
    case "flood": return <Droplets {...props} />;
    case "storm": return <CloudRain {...props} />;
    case "wind": return <Wind {...props} />;
    case "extreme_heat": return <Thermometer {...props} />;
    case "air_quality": return <Activity {...props} />;
    default: return <AlertTriangle {...props} />;
  }
}

const SEVERITY_CONFIG: Record<string, { bar: string; badge: string; card: string }> = {
  low: { bar: "bg-emerald-500", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", card: "border-l-emerald-500 bg-emerald-500/5" },
  moderate: { bar: "bg-yellow-500", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", card: "border-l-yellow-500 bg-yellow-500/5" },
  high: { bar: "bg-orange-500", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30", card: "border-l-orange-500 bg-orange-500/5" },
  critical: { bar: "bg-red-500", badge: "bg-red-500/20 text-red-400 border-red-500/30", card: "border-l-red-500 bg-red-500/5" },
  extreme: { bar: "bg-purple-500", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", card: "border-l-purple-500 bg-purple-500/5" },
};

const SEVERITIES = ["all", "low", "moderate", "high", "critical", "extreme"];
const TYPES = ["all", "fire", "flood", "storm", "extreme_heat", "drought", "air_quality", "wind", "custom"];

export default function Alerts() {
  const { data: alerts, isLoading } = useGetAlerts();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showActive, setShowActive] = useState<"all" | "active" | "inactive">("all");

  const filtered = (alerts ?? []).filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (showActive === "active" && !a.isActive) return false;
    if (showActive === "inactive" && a.isActive) return false;
    return true;
  });

  const active = (alerts ?? []).filter((a) => a.isActive).length;
  const critical = (alerts ?? []).filter((a) => a.severity === "critical" || a.severity === "extreme").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Central de Alertas</h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            {active} alertas ativos &bull; {critical} críticos
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {SEVERITIES.slice(1).map((sev) => {
          const cnt = (alerts ?? []).filter((a) => a.severity === sev).length;
          const cfg = SEVERITY_CONFIG[sev];
          return (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev === severityFilter ? "all" : sev)}
              className={`bg-card border border-card-border rounded-lg p-3 text-left transition-all ${severityFilter === sev ? "ring-1 ring-primary" : ""}`}
            >
              <div className={`text-lg font-bold tabular-nums ${cfg.badge.split(" ")[1]}`}>{cnt}</div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">{SEVERITY_LABELS[sev]}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-card border border-card-border rounded-lg p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono">Severidade:</span>
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`text-xs font-mono px-2 py-1 rounded border transition-all ${severityFilter === s ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-muted-foreground"}`}
            >
              {s === "all" ? "Todos" : SEVERITY_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono">Status:</span>
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setShowActive(s)}
              className={`text-xs font-mono px-2 py-1 rounded border transition-all ${showActive === s ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-muted-foreground"}`}
            >
              {s === "all" ? "Todos" : s === "active" ? "Ativos" : "Encerrados"}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-card border border-card-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mb-3" />
          <p className="font-mono text-sm">Nenhum alerta encontrado para os filtros selecionados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
            return (
              <div
                key={alert.id}
                data-testid={`alert-card-${alert.id}`}
                className={`border border-card-border border-l-4 rounded-lg p-4 ${cfg.card}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 flex-shrink-0 ${cfg.badge.split(" ")[1]}`}>
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{alert.title}</span>
                        {!alert.isActive && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Encerrado</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                        <span>{alert.location}</span>
                        <span className="text-border">•</span>
                        <span>{new Date(alert.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${cfg.badge}`}>
                      {SEVERITY_LABELS[alert.severity]}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground border border-border px-2 py-0.5 rounded">
                      {TYPE_LABELS[alert.type] ?? alert.type}
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
