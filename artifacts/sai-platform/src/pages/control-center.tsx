import {
  useGetAnalyticsOverview,
  useGetRiskAnalysis,
  useGetAlerts,
  useGetSystemStatus,
} from "@workspace/api-client-react";
import { useAuthStore } from "../store/auth";
import { Activity, AlertTriangle, Flame, RadioTower, ShieldAlert, TrendingUp, Wind, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { LiveStatusBadge } from "../components/live-status-badge";
import { RiskScoreCard } from "../components/risk-score-card";

const RISK_SCORE_COLOR = (score: number) => {
  if (score <= 25) return "text-emerald-400";
  if (score <= 50) return "text-yellow-400";
  if (score <= 75) return "text-orange-400";
  return "text-red-400";
};

const RISK_COLOR: Record<string, string> = {
  low: "text-emerald-400",
  moderate: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
  extreme: "text-purple-400",
};

const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 6,
  fontSize: 12,
};

export default function ControlCenter() {
  const { user } = useAuthStore();
  const { data: overview } = useGetAnalyticsOverview();
  const { data: risk } = useGetRiskAnalysis();
  const { data: alerts } = useGetAlerts();
  const { data: sysStatus } = useGetSystemStatus();

  const activeAlerts = (alerts ?? []).filter((a) => a.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary/60 uppercase tracking-widest mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Imperatech Control Center
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            Bem-vindo, {user?.name ?? "Executive"} — {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-right space-y-2">
          <LiveStatusBadge />
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Modo</div>
          <div className="text-sm font-mono text-primary font-bold uppercase">SUPER ADMIN</div>
          {sysStatus && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              SISTEMA OPERACIONAL
            </div>
          )}
        </div>
      </div>

      <RiskScoreCard score={typeof risk?.score === "number" ? risk.score : 84} level={risk?.overallRisk ?? "crítico"} summary="Visão nacional executiva com priorização automática para Defesa Civil." />

      {/* Big KPI row */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de Alertas", value: overview.totalAlerts, icon: <AlertTriangle className="w-6 h-6" />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
            { label: "Alertas Críticos", value: overview.criticalAlerts, icon: <Activity className="w-6 h-6" />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { label: "Estações Ativas", value: overview.activeStations, icon: <RadioTower className="w-6 h-6" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Focos Ativos", value: overview.activeHotspots, icon: <Flame className="w-6 h-6" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-card border rounded-xl p-6 ${kpi.bg}`} data-testid={`exec-kpi-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className={`mb-3 ${kpi.color}`}>{kpi.icon}</div>
              <div className={`text-4xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-2">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Second KPI row */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "AQI Médio", value: `${Math.round(overview.avgAqi)}`, sub: "Qualidade do Ar", icon: <Wind className="w-5 h-5" />, color: "text-cyan-400" },
            { label: "Temp. Média", value: `${overview.avgTemperature.toFixed(1)}°C`, sub: "São João da Boa Vista", icon: <TrendingUp className="w-5 h-5" />, color: "text-blue-400" },
            { label: "Uptime", value: `${overview.systemUptime.toFixed(2)}%`, sub: "Sistema SAI", icon: <Activity className="w-5 h-5" />, color: "text-emerald-400" },
            { label: "Reqs 24h", value: overview.apisCalls24h.toLocaleString("pt-BR"), sub: "Chamadas de API", icon: <Zap className="w-5 h-5" />, color: "text-yellow-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-card-border rounded-xl p-5">
              <div className={`mb-2 ${kpi.color}`}>{kpi.icon}</div>
              <div className={`text-2xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts + Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts trend */}
        {overview && (
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider font-mono mb-4">Tendência de Alertas — 7 Dias</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={overview.alertsTrend}>
                <defs>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0,85%,60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0,85%,60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="value" stroke="hsl(0,85%,60%)" strokeWidth={2} fill="url(#alertGrad)" name="Alertas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Risk Summary */}
        {risk && (
          <div className="bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">Risco Nacional</h2>
              <span className={`text-2xl font-bold tabular-nums ${RISK_SCORE_COLOR(risk.score)}`}>{risk.score}</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground mb-4">Score de risco / 100</div>
            <div className="space-y-2">
              {[
                ["Enchente", risk.floodRisk],
                ["Incêndio", risk.fireRisk],
                ["Tempestade", risk.stormRisk],
                ["Calor", risk.heatRisk],
                ["Seca", risk.droughtRisk],
                ["Ar", risk.airQualityRisk],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={RISK_COLOR[value] ?? "text-foreground"}>{String(value).toUpperCase()}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border text-xs font-mono text-muted-foreground leading-relaxed">
              {risk.aiAnalysis?.slice(0, 120)}...
            </div>
          </div>
        )}
      </div>

      {/* Hotspots + Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {overview && (
          <div className="bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">Focos de Calor</h2>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={overview.hotspotsLast7Days}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="hsl(25,95%,55%)" radius={[4, 4, 0, 0]} name="Focos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">Alertas Ativos</h2>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="space-y-2">
            {activeAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 p-2 rounded bg-background/50 border border-border">
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                  alert.severity === "critical" || alert.severity === "extreme" ? "bg-red-500/20 text-red-400" :
                  alert.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>{alert.severity}</span>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{alert.title}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{alert.location}</div>
                </div>
              </div>
            ))}
            {activeAlerts.length === 0 && (
              <div className="text-center text-sm text-muted-foreground font-mono py-6">Nenhum alerta ativo</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
