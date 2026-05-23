export type RiskLevel = "baixo" | "atenção" | "alto" | "crítico";

export type RiskInput = {
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  rainMm?: number;
  uvIndex?: number;
  aqi?: number;
  hotspots?: number;
  smokeDetected?: boolean;
  riverLevel?: number;
};

export type RiskOutput = {
  riskScore: number;
  level: RiskLevel;
  type: "fire" | "flood" | "smoke" | "heat" | "storm" | "air_quality" | "combined";
  confidence: number;
  summary: string;
  factors: string[];
  recommendedAction: string;
  priority: "monitorar" | "atenção" | "mobilizar" | "resposta imediata";
  generatedAt: string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function levelFromScore(score: number): RiskLevel {
  if (score < 25) return "baixo";
  if (score < 50) return "atenção";
  if (score < 75) return "alto";
  return "crítico";
}

export function calculateRisk(input: RiskInput = {}): RiskOutput {
  const temperature = input.temperature ?? 29;
  const humidity = input.humidity ?? 44;
  const windSpeed = input.windSpeed ?? 18;
  const rainMm = input.rainMm ?? 0;
  const uvIndex = input.uvIndex ?? 7;
  const aqi = input.aqi ?? 52;
  const hotspots = input.hotspots ?? 2;

  const fireScore = clamp(
    (temperature - 20) * 2.2 +
      Math.max(0, 65 - humidity) * 0.9 +
      windSpeed * 0.7 +
      uvIndex * 2 +
      hotspots * 8,
  );
  const floodScore = clamp(rainMm * 4 + Math.max(0, (input.riverLevel ?? 0) - 70) * 1.2);
  const smokeScore = clamp(aqi * 0.55 + hotspots * 10 + (input.smokeDetected ? 35 : 0));
  const heatScore = clamp((temperature - 24) * 4 + uvIndex * 3);
  const stormScore = clamp(windSpeed * 1.8 + rainMm * 2.2);

  const scores = [
    { type: "fire" as const, score: fireScore },
    { type: "flood" as const, score: floodScore },
    { type: "smoke" as const, score: smokeScore },
    { type: "heat" as const, score: heatScore },
    { type: "storm" as const, score: stormScore },
    { type: "air_quality" as const, score: clamp(aqi * 0.8) },
  ].sort((a, b) => b.score - a.score);

  const top = scores[0] ?? { type: "combined" as const, score: 0 };
  const riskScore = clamp(top.score);
  const level = levelFromScore(riskScore);
  const factors: string[] = [];
  if (temperature >= 30) factors.push("temperatura elevada");
  if (humidity <= 40) factors.push("baixa umidade");
  if (windSpeed >= 25) factors.push("vento forte");
  if (rainMm >= 20) factors.push("chuva intensa");
  if (aqi >= 100) factors.push("qualidade do ar degradada");
  if (hotspots > 0) factors.push("focos de calor próximos");
  if (input.smokeDetected) factors.push("fumaça detectada por sensor");

  const priority =
    riskScore >= 75 ? "resposta imediata" : riskScore >= 50 ? "mobilizar" : riskScore >= 25 ? "atenção" : "monitorar";

  return {
    riskScore,
    level,
    type: top.type,
    confidence: Number((0.72 + Math.min(0.22, factors.length * 0.035)).toFixed(2)),
    summary: `Risco ${level} para ${top.type} nas próximas horas.`,
    factors: factors.length ? factors : ["condições dentro da normalidade operacional"],
    recommendedAction:
      riskScore >= 75
        ? "Acionar Defesa Civil, emitir alerta público e preparar resposta operacional."
        : riskScore >= 50
          ? "Mobilizar equipe de prontidão e intensificar monitoramento."
          : riskScore >= 25
            ? "Manter atenção, revisar sensores e acompanhar evolução."
            : "Operação normal com monitoramento automático.",
    priority,
    generatedAt: new Date().toISOString(),
  };
}

export function buildRiskForecast(hours = 24) {
  return Array.from({ length: hours }, (_, i) => {
    const temperature = 24 + Math.sin(i / 3) * 5 + Math.random() * 2;
    const humidity = 55 - Math.sin(i / 4) * 18;
    return {
      hour: i,
      label: `${String(i).padStart(2, "0")}h`,
      ...calculateRisk({ temperature, humidity, windSpeed: 10 + Math.random() * 20, aqi: 35 + Math.random() * 70 }),
    };
  });
}
