import { useGetSystemStatus, useGetApiStatus } from "@workspace/api-client-react";
import { Activity, Server, Database, Cpu, MemoryStick, Clock, CheckCircle, XCircle, AlertCircle, Zap, Users, Globe } from "lucide-react";

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    online: "bg-emerald-400",
    operational: "bg-emerald-400",
    offline: "bg-red-400",
    outage: "bg-red-400",
    degraded: "bg-yellow-400",
  };
  return (
    <span className={`w-2 h-2 rounded-full inline-block ${map[status] ?? "bg-gray-400"} ${status === "online" || status === "operational" ? "animate-pulse" : ""}`} />
  );
}

function MetricBar({ label, value, unit, color }: { label: string; value: number; unit?: string; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export default function Admin() {
  const { data: status, isLoading: sLoading } = useGetSystemStatus();
  const { data: apiStatus, isLoading: aLoading } = useGetApiStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel de Administração</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">Status do sistema SAI e conectividade de APIs externas</p>
      </div>

      {/* System status card */}
      {sLoading ? (
        <div className="h-48 bg-card border border-card-border rounded-lg animate-pulse" />
      ) : status ? (
        <div className="bg-card border border-card-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">Status do Sistema</h2>
            <div className="flex items-center gap-2 text-xs font-mono">
              <StatusDot status={status.status} />
              <span className={status.status === "operational" ? "text-emerald-400" : status.status === "degraded" ? "text-yellow-400" : "text-red-400"}>
                {status.status === "operational" ? "OPERACIONAL" : status.status === "degraded" ? "DEGRADADO" : "FALHA"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Versão", value: status.version, icon: <Server className="w-4 h-4 text-primary" /> },
              { label: "Usuários Ativos", value: status.activeUsers, icon: <Users className="w-4 h-4 text-cyan-400" /> },
              { label: "Requisições 24h", value: status.totalRequests24h.toLocaleString("pt-BR"), icon: <Zap className="w-4 h-4 text-yellow-400" /> },
              { label: "Taxa de Erro", value: `${status.errorRate.toFixed(2)}%`, icon: <AlertCircle className="w-4 h-4 text-red-400" /> },
            ].map((item) => (
              <div key={item.label} className="bg-background/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">{item.icon}<span className="text-[10px] font-mono uppercase text-muted-foreground">{item.label}</span></div>
                <div className="text-lg font-bold font-mono">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground mb-2">
                <Cpu className="w-3 h-3" />Recursos
              </div>
              <MetricBar label="CPU" value={status.cpu ?? 0} unit="%" color="bg-primary" />
              <MetricBar label="Memória" value={status.memory ?? 0} unit="%" color="bg-violet-500" />
              <MetricBar label="Uptime" value={Math.min(status.uptime, 100)} unit="%" color="bg-emerald-500" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground mb-2">
                <Database className="w-3 h-3" />Serviços
              </div>
              {[
                { label: "Banco de Dados", status: status.dbStatus },
                { label: "Cache", status: status.cacheStatus },
                { label: "API REST", status: "online" },
                { label: "WebSocket", status: "online" },
              ].map((svc) => (
                <div key={svc.label} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">{svc.label}</span>
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={svc.status} />
                    <span className={svc.status === "online" ? "text-emerald-400" : "text-red-400"}>{svc.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />Uptime Detalhado
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-400">{status.uptime.toFixed(3)}%</div>
              <div className="text-xs text-muted-foreground font-mono">SAI v{status.version}</div>
              <div className="text-xs text-muted-foreground font-mono">{status.totalRequests24h.toLocaleString("pt-BR")} reqs/24h</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* External API status */}
      <div className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider font-mono">APIs Externas</h2>
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>

        {aLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {(apiStatus ?? []).map((api, i) => (
              <div key={i} data-testid={`api-status-${i}`} className="flex items-center justify-between p-3 bg-background/50 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {api.status === "online" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : api.status === "degraded" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <StatusDot status={api.status} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{api.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{api.url}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-mono font-semibold ${api.status === "online" ? "text-emerald-400" : api.status === "degraded" ? "text-yellow-400" : "text-red-400"}`}>
                    {api.responseTime !== null ? `${api.responseTime}ms` : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{(api.successRate ?? 0).toFixed(1)}% uptime</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IoT Endpoints prepared */}
      <div className="bg-card border border-card-border rounded-lg p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wider font-mono mb-4">Endpoints IoT Preparados</h2>
        <div className="space-y-2">
          {["/api/iot", "/api/stations", "/api/sensors", "/api/mqtt", "/api/cameras"].map((ep) => (
            <div key={ep} className="flex items-center gap-3 p-2 bg-background/30 rounded border border-border text-xs font-mono">
              <span className="text-primary">GET/POST</span>
              <span className="text-foreground">{ep}</span>
              <span className="text-muted-foreground ml-auto">Preparado para integração futura</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground font-mono">
          Tópicos MQTT: sai/station/{"{id}"}/climate | river | smoke | camera | alerts
        </div>
      </div>
    </div>
  );
}
