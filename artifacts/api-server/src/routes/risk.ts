import { Router } from "express";
import { calculateRisk, buildRiskForecast } from "../services/risk-engine";

const router = Router();

router.get("/risk/current", (req, res) => {
  const temperature = Number(req.query["temperature"] ?? 30);
  const humidity = Number(req.query["humidity"] ?? 38);
  const windSpeed = Number(req.query["windSpeed"] ?? 22);
  const aqi = Number(req.query["aqi"] ?? 68);
  const hotspots = Number(req.query["hotspots"] ?? 3);
  res.json(calculateRisk({ temperature, humidity, windSpeed, aqi, hotspots }));
});

router.get("/risk/forecast", (req, res) => {
  const hours = Math.min(72, Math.max(6, Number(req.query["hours"] ?? 24)));
  res.json(buildRiskForecast(hours));
});

router.post("/risk/simulate", (req, res) => {
  res.json(calculateRisk(req.body ?? {}));
});

export default router;
