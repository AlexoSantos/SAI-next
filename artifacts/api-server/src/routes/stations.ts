import { Router } from "express";
import { db, stationsTable } from "@workspace/db";

const router = Router();

router.get("/stations", async (req, res) => {
  try {
    const stations = await db.select().from(stationsTable);

    return res.json(
      stations.map((s) => ({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lon: s.lon,
        status: s.status,
        type: s.type,
        lastReading: s.lastReading?.toISOString() ?? null,
        batteryLevel: s.batteryLevel,
        signalStrength: s.signalStrength,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Get stations error");
    return res.status(500).json({ error: "Failed to fetch stations" });
  }
});

export default router;
