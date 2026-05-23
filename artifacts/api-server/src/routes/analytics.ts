import { Router } from "express";
import { db, alertsTable, stationsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

function generateTrend(days: number, min: number, max: number) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
    result.push({
      label,
      value: Math.round((min + Math.random() * (max - min)) * 10) / 10,
    });
  }
  return result;
}

router.get("/analytics/overview", async (req, res) => {
  try {
    const [allAlerts, activeAlerts, criticalAlerts, allStations, activeStations] =
      await Promise.all([
        db.select({ count: count() }).from(alertsTable),
        db
          .select({ count: count() })
          .from(alertsTable)
          .where(eq(alertsTable.isActive, true)),
        db
          .select({ count: count() })
          .from(alertsTable)
          .where(eq(alertsTable.severity, "critical")),
        db.select({ count: count() }).from(stationsTable),
        db
          .select({ count: count() })
          .from(stationsTable)
          .where(eq(stationsTable.status, "online")),
      ]);

    return res.json({
      totalAlerts: allAlerts[0]?.count ?? 0,
      activeAlerts: activeAlerts[0]?.count ?? 0,
      criticalAlerts: criticalAlerts[0]?.count ?? 0,
      activeStations: activeStations[0]?.count ?? 0,
      activeHotspots: Math.floor(Math.random() * 15) + 3,
      avgAqi: Math.round(30 + Math.random() * 40),
      avgTemperature: Math.round((22 + Math.random() * 8) * 10) / 10,
      systemUptime: 99.7 + Math.random() * 0.3,
      apisCalls24h: Math.floor(8000 + Math.random() * 4000),
      alertsTrend: generateTrend(7, 0, 8),
      hotspotsLast7Days: generateTrend(7, 2, 18),
      temperatureLast7Days: generateTrend(7, 18, 32),
    });
  } catch (err) {
    req.log.error({ err }, "Analytics overview error");
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/analytics/risk", async (req, res) => {
  try {
    const riskLevels = ["low", "moderate", "high", "critical", "extreme"] as const;
    const baseRisk = riskLevels[Math.floor(Math.random() * 3)];

    return res.json({
      overallRisk: baseRisk,
      floodRisk: riskLevels[Math.floor(Math.random() * 3)],
      fireRisk: riskLevels[1 + Math.floor(Math.random() * 3)],
      stormRisk: riskLevels[Math.floor(Math.random() * 3)],
      heatRisk: riskLevels[1 + Math.floor(Math.random() * 2)],
      droughtRisk: riskLevels[Math.floor(Math.random() * 3)],
      airQualityRisk: riskLevels[Math.floor(Math.random() * 2)],
      score: Math.round(25 + Math.random() * 45),
      aiAnalysis:
        "Análise IA: Condições meteorológicas estáveis para São João da Boa Vista. Monitoramento de focos de incêndio recomendado na região norte. Probabilidade de chuvas moderadas nos próximos 3 dias. Qualidade do ar dentro dos padrões aceitáveis. Nenhum risco iminente de enchentes detectado.",
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Risk analysis error");
    return res.status(500).json({ error: "Failed to fetch risk analysis" });
  }
});

export default router;
