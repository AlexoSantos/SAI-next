import { useState } from "react";
import {
  useGetCurrentWeather,
  useGetDailyForecast,
  useGetAirQuality,
  useGetAlerts,
  useGetAnalyticsOverview,
  useGetRiskAnalysis,
} from "@workspace/api-client-react";
import {
  Thermometer, Droplets, Wind, Eye, Gauge, Sun, CloudRain,
  CloudLightning, Cloud, Snowflake, Flame, AlertTriangle,
  ShieldCheck, Activity, TrendingUp, MapPin, Clock,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { LiveStatusBadge } from "../components/live-status-badge";
import { RiskScoreCard } from "../components/risk-score-card";

const SAO_JOAO = { lat: -21.9701, lon: -46.795 };

function getWeatherIcon(code: number) {
  if (code === 0) return <Sun className="w-5 h-5 text-yellow-400" />;
  if (code <= 3) return <Cloud className="w-5 h-5 text-slate-400" />;
  if (code <= 48) return <Cloud className="w-5 h-5 text-slate-500" />;
  if (code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />;
  if (code <= 77) return <Snowflake className="w-5 h-5 text-blue-200" />;
  if (code <= 82) return <CloudRain className="w-5 h-5 text-blue-500" />;
  return <CloudLightning className="w-5 h-5 text-yellow-300" />;
}

function windDegToDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return "text-emerald-400";
  if (aqi <= 100) return "text-yellow-400";
  if (aqi <= 150) return "text-orange-400";
  if (aqi <= 200) return "text-red-400";
  return "text-purple-400";
}

function getRiskColor(risk: string): string {
  const map: Record<string, string> = {
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    extreme: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };
  return map[risk] ?? map.low;
}

function getSeverityColor(sev: string): string {
  const map: Record<string, string> = {
    low: "border-l-emerald-500 bg-emerald-500/5",
    moderate: "border-l-yellow-500 bg-yellow-500/5",
    high: "border-l-orange-500 bg-orange-500/5",
    critical: "border-l-red-500 bg-red-500/5",
    extreme: "border-l-purple-500 bg-purple-500/5",
  };
  return map[sev] ?? map.low;
}

function StatCard({ label, value, unit, icon, sub }: { label: string; value: string | number; unit?: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-card border border-card-border rounded-lg p-4 flex flex-col gap-2" data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
      </div>
      {sub && <span className="text-xs text-muted-foreground font-mono">{sub}</span>}
    </div>
  );
}

export default function Dashboard() {
  const { data: weather, isLoading: wLoading } = useGetCurrentWeather({ lat: SAO_JOAO.lat, lon: SAO_JOAO.lon });
  const { data: daily } = useGetDailyForecast({ lat: SAO_JOAO.lat, lon: SAO_JOAO.lon });
  const { data: airQuality } = useGetAirQuality({ lat: SAO_JOAO.lat, lon: SAO_JOAO.lon });
  const { data: alerts } = useGetAlerts();
  const { data: overview } = useGetAnalyticsOverview();
  const { data: risk } = useGetRiskAnalysis();

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3"><h1 className="text-2xl font-bold tracking-tight">Dashboard Climático</h1><LiveStatusBadge /></div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground font-mono">
            <MapPin className="w-3.5 h-3.5" />
            <span>São João da Boa Vista, SP</span>
            <span className="text-border">•</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{now.toLocaleString("pt-BR")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            SISTEMA OPERACIONAL
          </span>
        </div>
      </div>

      {/* Main weather card */}
      {wLoading ? (
        <div className="bg-card border border-card-border rounded-lg p-6 h-40 animate-pulse" />
      ) : weather ? (
        <div className="bg-card border border-card-border rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="col-span-2 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                {getWeatherIcon(weather.conditionCode ?? 0)}
              </div>
              <div>
                <div className="text-5xl font-bold tabular-nums">{Math.round(weather.temperature)}°C</div>
                <div className="text-sm text-muted-foreground mt-1">{weather.condition}</div>
                <div className="text-xs text-muted-foreground font-mono">Sensação: {Math.round(weather.feelsLike)}°C</div>
              </div>
            </div>

            <StatCard label="Umidade" value={weather.humidity ?? 0} unit="%" icon={<Droplets className="w-4 h-4 text-blue-400" />} />
            <StatCard label="Pressão" value={Math.round(weather.pressure ?? 0)} unit="hPa" icon={<Gauge className="w-4 h-4 text-violet-400" />} />
            <StatCard label="Vento" value={Math.round(weather.windSpeed ?? 0)} unit="km/h" icon={<Wind className="w-4 h-4 text-cyan-400" />} sub={windDegToDir(weather.windDirection ?? 0)} />
            <StatCard label="Índice UV" value={Math.round(weather.uvIndex ?? 0)} icon={<Sun className="w-4 h-4 text-yellow-400" />} sub={(weather.uvIndex ?? 0) <= 2 ? "Baixo" : (weather.uvIndex ?? 0) <= 5 ? "Moderado" : "Alto"} />
            <StatCard label="Precipitação" value={weather.precipitation ?? 0} unit="mm" icon={<CloudRain className="w-4 h-4 text-blue-400" />} sub={`${weather.precipitationProbability ?? 0}% prob.`} />
            <StatCard label="Visibilidade" value={((weather.visibility ?? 0) / 1000).toFixed(1)} unit="km" icon={<Eye className="w-4 h-4 text-slate-400" />} />
            <StatCard label="Nuvens" value={weather.cloudCover ?? 0} unit="%" icon={<Cloud className="w-4 h-4 text-slate-400" />} />
            <StatCard label="Ponto de Orvalho" value={Math.round(weather.dewPoint ?? 0)} unit="°C" icon={<Thermometer className="w-4 h-4 text-teal-400" />} />
          </div>
        </div>
      ) : null}

      {/* Grid: charts, forecast, risk, air quality, alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temperature trend */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">Temperatura — Últimos 7 dias</h2>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          {overview?.temperatureLast7Days && (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={overview.temperatureLast7Days}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(190,100%,50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(190,100%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="hsl(190,100%,50%)" strokeWidth={2} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Air Quality */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <h2 className="font-semibold text-sm uppercase tracking-wider font-mono mb-4">Qualidade do Ar</h2>
          {airQuality ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">AQI</span>
                <span className={`text-3xl font-bold tabular-nums ${getAqiColor(airQuality.aqi)}`}>{airQuality.aqi}</span>
              </div>
              <div className={`text-center text-sm font-mono py-1.5 rounded border ${getAqiColor(airQuality.aqi)} border-current/30 bg-current/5`}>
                {airQuality.category}
              </div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { label: "PM2.5", value: airQuality.pm25.toFixed(1), unit: "μg/m³" },
                  { label: "PM10", value: airQuality.pm10.toFixed(1), unit: "μg/m³" },
                  { label: "NO₂", value: airQuality.no2.toFixed(1), unit: "μg/m³" },
                  { label: "O₃", value: airQuality.o3.toFixed(1), unit: "μg/m³" },
                  { label: "CO", value: airQuality.co.toFixed(2), unit: "mg/m³" },
                  { label: "SO₂", value: airQuality.so2.toFixed(1), unit: "μg/m³" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-muted-foreground">
                    <span>{item.label}</span>
                    <span className="text-foreground">{item.value} <span className="text-muted-foreground">{item.unit}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="animate-pulse h-40 bg-muted/20 rounded" />}
        </div>
      </div>

      {/* 7-day forecast */}
      {daily && daily.length > 0 && (
        <div className="bg-card border border-card-border rounded-lg p-5">
          <h2 className="font-semibold text-sm uppercase tracking-wider font-mono mb-4">Previsão — 7 Dias</h2>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {daily.slice(0, 7).map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-background/50 border border-border">
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })}
                </span>
                {getWeatherIcon(day.conditionCode)}
                <span className="text-sm font-bold">{Math.round(day.tempMax)}°</span>
                <span className="text-xs text-muted-foreground">{Math.round(day.tempMin)}°</span>
                <span className="text-xs text-blue-400 font-mono">{day.precipitationProbability}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Analysis */}
        {risk && (
          <div className="bg-card border border-card-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">Análise de Risco — IA</h2>
              <span className={`text-xs px-2 py-0.5 rounded border font-mono ${getRiskColor(risk.overallRisk)}`}>
                {risk.overallRisk.toUpperCase()}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {[
                { label: "Enchente", value: risk.floodRisk },
                { label: "Incêndio", value: risk.fireRisk },
                { label: "Tempestade", value: risk.stormRisk },
                { label: "Calor", value: risk.heatRisk },
                { label: "Seca", value: risk.droughtRisk },
                { label: "Qualidade do Ar", value: risk.airQualityRisk },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">{item.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border font-mono ${getRiskColor(item.value)}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground font-mono leading-relaxed border-t border-border pt-3">
              {risk.aiAnalysis}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-primary/60 font-mono">
              <Activity className="w-3 h-3" />
              <span>Score de risco: {risk.score}/100</span>
            </div>
          </div>
        )}

        {/* Active Alerts */}
        <div className="bg-card border border-card-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">Alertas Ativos</h2>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          {alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.filter((a) => a.isActive).slice(0, 4).map((alert) => (
                <div key={alert.id} className={`border-l-2 pl-3 py-2 rounded-r ${getSeverityColor(alert.severity)}`} data-testid={`alert-item-${alert.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-tight">{alert.title}</span>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${getRiskColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{alert.location}</div>
                </div>
              ))}
              {alerts.filter((a) => !a.isActive).length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{alerts.filter((a) => !a.isActive).length} alertas encerrados</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
              <span className="text-sm font-mono">Nenhum alerta ativo</span>
            </div>
          )}
        </div>
      </div>

      {/* Hotspots trend */}
      {overview?.hotspotsLast7Days && (
        <div className="bg-card border border-card-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">Focos de Calor — Últimos 7 Dias</h2>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={overview.hotspotsLast7Days}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(25,95%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
