import {
  useGetAnalyticsOverview,
  useGetRiskAnalysis,
} from "@workspace/api-client-react";
import {
  AlertTriangle, RadioTower, Flame, Wind, TrendingUp, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

function KpiCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-card border border-card-border rounded-lg p-5 flex flex-col gap-3`} data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
}

const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 6,
  fontSize: 12,
};

export default function Analytics() {
  const { data: overview, isLoading } = useGetAnalyticsOverview();
  const { data: risk } = useGetRiskAnalysis();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-card rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-card rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Monitoramento</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">Dados históricos e análises do sistema SAI</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total de Alertas" value={overview.totalAlerts} icon={<AlertTriangle className="w-5 h-5" />} color="bg-red-500/10 text-red-400" />
        <KpiCard label="Alertas Ativos" value={overview.activeAlerts} icon={<Activity className="w-5 h-5" />} color="bg-orange-500/10 text-orange-400" />
        <KpiCard label="Estações Ativas" value={overview.activeStations} icon={<RadioTower className="w-5 h-5" />} color="bg-emerald-500/10 text-emerald-400" />
        <KpiCard label="Focos Ativos" value={overview.activeHotspots} icon={<Flame className="w-5 h-5" />} color="bg-amber-500/10 text-amber-400" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Alertas Críticos" value={overview.criticalAlerts} icon={<AlertTriangle className="w-5 h-5" />} color="bg-purple-500/10 text-purple-400" />
        <KpiCard label="AQI Médio" value={Math.round(overview.avgAqi)} icon={<Wind className="w-5 h-5" />} color="bg-cyan-500/10 text-cyan-400" />
        <KpiCard label="Temperatura Média" value={`${overview.avgTemperature.toFixed(1)}°C`} icon={<TrendingUp className="w-5 h-5" />} color="bg-blue-500/10 text-blue-400" />
        <KpiCard label="Uptime do Sistema" value={`${overview.systemUptime.toFixed(2)}%`} icon={<Activity className="w-5 h-5" />} color="bg-emerald-500/10 text-emerald-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature trend */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <h2 className="font-semibold text-sm uppercase tracking-wider font-mono mb-4">Temperatura — 7 Dias (°C)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={overview.temperatureLast7Days}>
              <defs>
                <linearGradient id="tempGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(190,100%,50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(190,100%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="value" stroke="hsl(190,100%,50%)" strokeWidth={2} fill="url(#tempGrad2)" name="°C" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hotspots trend */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <h2 className="font-semibold text-sm uppercase tracking-wider font-mono mb-4">Focos de Calor — 7 Dias</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={overview.hotspotsLast7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="hsl(25,95%,55%)" radius={[4, 4, 0, 0]} name="Focos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts trend */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <h2 className="font-semibold text-sm uppercase tracking-wider font-mono mb-4">Tendência de Alertas — 7 Dias</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={overview.alertsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="value" stroke="hsl(0,85%,60%)" strokeWidth={2} dot={false} name="Alertas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk analysis breakdown */}
        {risk && (
          <div className="bg-card border border-card-border rounded-lg p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider font-mono mb-4">Análise de Risco Atual</h2>
            <div className="space-y-3">
              {[
                { label: "Enchente", value: risk.floodRisk, num: ["low","moderate","high","critical","extreme"].indexOf(risk.floodRisk) + 1 },
                { label: "Incêndio", value: risk.fireRisk, num: ["low","moderate","high","critical","extreme"].indexOf(risk.fireRisk) + 1 },
                { label: "Tempestade", value: risk.stormRisk, num: ["low","moderate","high","critical","extreme"].indexOf(risk.stormRisk) + 1 },
                { label: "Calor Extremo", value: risk.heatRisk, num: ["low","moderate","high","critical","extreme"].indexOf(risk.heatRisk) + 1 },
                { label: "Seca", value: risk.droughtRisk, num: ["low","moderate","high","critical","extreme"].indexOf(risk.droughtRisk) + 1 },
                { label: "Qualidade do Ar", value: risk.airQualityRisk, num: ["low","moderate","high","critical","extreme"].indexOf(risk.airQualityRisk) + 1 },
              ].map((item) => {
                const colors = ["bg-emerald-500", "bg-yellow-500", "bg-orange-500", "bg-red-500", "bg-purple-500"];
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground uppercase">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${colors[item.num - 1]}`}
                        style={{ width: `${(item.num / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Score de Risco Geral</span>
              <span className="text-primary font-bold">{risk.score}/100</span>
            </div>
          </div>
        )}
      </div>

      {/* API calls stat */}
      <div className="bg-card border border-card-border rounded-lg p-4 flex items-center justify-between">
        <div className="font-mono text-sm">
          <span className="text-muted-foreground">Chamadas de API nas últimas 24h: </span>
          <span className="text-primary font-bold">{overview.apisCalls24h.toLocaleString("pt-BR")}</span>
        </div>
        <div className="font-mono text-sm">
          <span className="text-muted-foreground">Uptime: </span>
          <span className="text-emerald-400 font-bold">{overview.systemUptime.toFixed(3)}%</span>
        </div>
      </div>
    </div>
  );
}
