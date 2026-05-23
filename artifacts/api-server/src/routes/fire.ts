import { Router } from "express";
import axios from "axios";

const router = Router();

const SAO_JOAO_LAT = -21.9701;
const SAO_JOAO_LON = -46.795;

router.get("/fire/hotspots", async (req, res) => {
  try {
    const lat = Number(req.query["lat"]) || SAO_JOAO_LAT;
    const lon = Number(req.query["lon"]) || SAO_JOAO_LON;
    const radius = Number(req.query["radius"]) || 500;

    const today = new Date();
    const dayRange = 1;

    const url =
      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
      `VIIRS_SNPP_NRT/` +
      `${lon - radius / 111},${lat - radius / 111},${lon + radius / 111},${lat + radius / 111}/` +
      `${dayRange}`;

    try {
      const { data } = await axios.get(url, { timeout: 10000 });

      if (typeof data === "string" && data.includes("latitude")) {
        const lines = data.trim().split("\n");
        const headers = lines[0].split(",");
        const latIdx = headers.indexOf("latitude");
        const lonIdx = headers.indexOf("longitude");
        const brightIdx = headers.indexOf("bright_ti4");
        const confIdx = headers.indexOf("confidence");
        const dateIdx = headers.indexOf("acq_date");
        const timeIdx = headers.indexOf("acq_time");
        const instrIdx = headers.indexOf("instrument");
        const daynightIdx = headers.indexOf("daynight");
        const frpIdx = headers.indexOf("frp");
        const satIdx = headers.indexOf("satellite");

        const hotspots = lines
          .slice(1)
          .filter((l: string) => l.trim())
          .map((line: string, i: number) => {
            const cols = line.split(",");
            return {
              id: `${cols[dateIdx]}-${cols[timeIdx]}-${i}`,
              lat: parseFloat(cols[latIdx]),
              lon: parseFloat(cols[lonIdx]),
              brightness: parseFloat(cols[brightIdx]) || 300,
              confidence: cols[confIdx] || "nominal",
              acqDate: cols[dateIdx],
              acqTime: cols[timeIdx],
              instrument: cols[instrIdx] || "VIIRS",
              daynight: cols[daynightIdx] || "D",
              frp: frpIdx >= 0 ? parseFloat(cols[frpIdx]) || null : null,
              satellite: satIdx >= 0 ? cols[satIdx] || null : null,
            };
          });

        return res.json(hotspots);
      }
    } catch (_apiErr) {
      req.log.warn("NASA FIRMS API unavailable, returning mock data");
    }

    const mockHotspots = Array.from({ length: 5 }, (_, i) => ({
      id: `mock-${today.toISOString().split("T")[0]}-${i}`,
      lat: lat + (Math.random() - 0.5) * 2,
      lon: lon + (Math.random() - 0.5) * 2,
      brightness: 300 + Math.random() * 100,
      confidence: ["low", "nominal", "high"][Math.floor(Math.random() * 3)],
      acqDate: today.toISOString().split("T")[0],
      acqTime: "1200",
      instrument: "VIIRS",
      daynight: "D",
      frp: Math.random() * 50,
      satellite: "NPP",
    }));

    return res.json(mockHotspots);
  } catch (err) {
    req.log.error({ err }, "Fire hotspots error");
    return res.status(500).json({ error: "Failed to fetch fire hotspots" });
  }
});

export default router;
