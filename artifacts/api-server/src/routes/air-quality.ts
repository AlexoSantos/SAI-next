import { Router } from "express";
import axios from "axios";

const router = Router();

const SAO_JOAO_LAT = -21.9701;
const SAO_JOAO_LON = -46.795;

function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return "Bom";
  if (aqi <= 100) return "Moderado";
  if (aqi <= 150) return "Insalubre para grupos sensíveis";
  if (aqi <= 200) return "Insalubre";
  if (aqi <= 300) return "Muito insalubre";
  return "Perigoso";
}

router.get("/air-quality/current", async (req, res) => {
  try {
    const lat = Number(req.query["lat"]) || SAO_JOAO_LAT;
    const lon = Number(req.query["lon"]) || SAO_JOAO_LON;

    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi` +
      `&timezone=America%2FSao_Paulo`;

    const { data } = await axios.get(url, { timeout: 8000 });
    const c = data.current;

    const euroAqi = c.european_aqi ?? 0;
    const usAqi = Math.round(euroAqi * 1.2);

    return res.json({
      aqi: usAqi,
      category: getAqiCategory(usAqi),
      pm25: c.pm2_5 ?? 0,
      pm10: c.pm10 ?? 0,
      no2: c.nitrogen_dioxide ?? 0,
      o3: c.ozone ?? 0,
      co: c.carbon_monoxide ?? 0,
      so2: c.sulphur_dioxide ?? 0,
      nh3: null,
      location: "São João da Boa Vista, SP",
      lat,
      lon,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Air quality error");
    return res.status(500).json({
      aqi: 42,
      category: "Bom",
      pm25: 8.2,
      pm10: 15.4,
      no2: 12.1,
      o3: 68.3,
      co: 0.4,
      so2: 2.1,
      nh3: null,
      location: "São João da Boa Vista, SP",
      lat: SAO_JOAO_LAT,
      lon: SAO_JOAO_LON,
      updatedAt: new Date().toISOString(),
    });
  }
});

export default router;
