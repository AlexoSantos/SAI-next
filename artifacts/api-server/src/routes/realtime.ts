import { Router } from "express";
import { addRealtimeClient, broadcastRealtime, createRealtimeEvent, getLastRealtimeEvents, getRealtimeStatus } from "../services/realtime";
import { calculateRisk } from "../services/risk-engine";

const router = Router();

type SensorPayload = {
  stationId: string;
  tenantId: string;
  topic: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  rainMm?: number;
  aqi?: number;
  smokeDetected?: boolean;
  riverLevel?: number;
};

function toNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseSensorPayload(body: unknown): { success: true; data: SensorPayload } | { success: false; error: string } {
  const input = (body ?? {}) as Record<string, unknown>;
  const stationId = String(input["stationId"] ?? "").trim();
  if (!stationId) return { success: false, error: "stationId obrigatório" };

  return {
    success: true,
    data: {
      stationId,
      tenantId: String(input["tenantId"] ?? "imperatech"),
      topic: String(input["topic"] ?? "sai/station/demo/climate"),
      temperature: toNumber(input["temperature"]),
      humidity: toNumber(input["humidity"]),
      windSpeed: toNumber(input["windSpeed"]),
      rainMm: toNumber(input["rainMm"]),
      aqi: toNumber(input["aqi"]),
      smokeDetected: typeof input["smokeDetected"] === "boolean" ? input["smokeDetected"] : undefined,
      riverLevel: toNumber(input["riverLevel"]),
    },
  };
}

router.get("/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const remove = addRealtimeClient(res);
  req.on("close", remove);
});

router.get("/realtime/status", (_req, res) => {
  res.json(getRealtimeStatus());
});

router.get("/realtime/events", (_req, res) => {
  res.json(getLastRealtimeEvents());
});

router.post("/realtime/simulate", (req, res) => {
  const type = String(req.body?.type ?? "weather:update");
  const event = createRealtimeEvent(type as never, {
    location: "São João da Boa Vista/SP",
    temperature: 31,
    humidity: 32,
    windSpeed: 28,
    message: "Evento simulado pelo SAI Mission Control",
  });
  broadcastRealtime(event);
  res.json(event);
});

router.post("/sensors/ingest", (req, res) => {
  const parsed = parseSensorPayload(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Payload inválido", details: parsed.error });
  }

  const reading = parsed.data;
  const risk = calculateRisk(reading);
  const stationEvent = createRealtimeEvent("station:update", reading, reading.tenantId);
  const riskEvent = createRealtimeEvent("risk:update", risk, reading.tenantId);

  broadcastRealtime(stationEvent);
  broadcastRealtime(riskEvent);

  if (risk.riskScore >= 75) {
    broadcastRealtime(
      createRealtimeEvent(
        "alert:new",
        {
          type: risk.type,
          severity: "critical",
          title: "Alerta crítico gerado automaticamente",
          description: risk.summary,
          recommendedAction: risk.recommendedAction,
        },
        reading.tenantId,
      ),
    );
  }

  return res.json({ accepted: true, reading, risk });
});

export default router;
