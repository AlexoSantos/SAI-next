import { Router } from "express";
import axios from "axios";

const router = Router();

const KML_URL =
  "https://www.google.com/maps/d/kml?mid=1Sk0hSYMotHda-Yq_CXc9Dn9bsacVdNM&forcekml=1";
const CACHE_TTL_MS = 60 * 60 * 1000;

let kmlCache: { data: string; fetchedAt: number } | null = null;

router.get("/risk-areas/kml", async (req, res) => {
  try {
    const now = Date.now();
    if (kmlCache && now - kmlCache.fetchedAt < CACHE_TTL_MS) {
      res.setHeader("Content-Type", "text/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.send(kmlCache.data);
    }

    const { data } = await axios.get<string>(KML_URL, {
      timeout: 20000,
      headers: { "User-Agent": "SAI-Platform/1.0" },
      responseType: "text",
    });

    kmlCache = { data, fetchedAt: now };
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch risk areas KML");
    return res.status(502).json({ error: "Failed to fetch risk areas KML" });
  }
});

export default router;
