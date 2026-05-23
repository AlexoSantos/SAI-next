import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/system/health", (_req, res) => {
  res.json({
    status: "operational",
    mode: "SAI Mission Control",
    database: "configured",
    redis: process.env["REDIS_URL"] ? "configured" : "not_configured",
    mqtt: process.env["MQTT_URL"] ? "configured" : "not_configured",
    externalApis: {
      openMeteo: "configured",
      nasaFirms: process.env["NASA_FIRMS_API_KEY"] ? "configured" : "public_or_mock",
      noaa: process.env["NOAA_API_KEY"] ? "configured" : "not_configured",
      rainViewer: "configured",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
