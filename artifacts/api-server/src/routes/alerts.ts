import { Router } from "express";
import { db, alertsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await db
      .select()
      .from(alertsTable)
      .orderBy(alertsTable.createdAt);

    return res.json(
      alerts.map((a) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        description: a.description,
        location: a.location,
        lat: a.lat,
        lon: a.lon,
        radius: a.radius,
        isActive: a.isActive,
        expiresAt: a.expiresAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Get alerts error");
    return res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.get("/alerts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"]);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const [alert] = await db
      .select()
      .from(alertsTable)
      .where(eq(alertsTable.id, id))
      .limit(1);

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    return res.json({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      location: alert.location,
      lat: alert.lat,
      lon: alert.lon,
      radius: alert.radius,
      isActive: alert.isActive,
      expiresAt: alert.expiresAt?.toISOString() ?? null,
      createdAt: alert.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Get alert error");
    return res.status(500).json({ error: "Failed to fetch alert" });
  }
});

export default router;
