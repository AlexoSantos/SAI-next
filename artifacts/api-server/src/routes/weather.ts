import { Router } from "express";
import axios from "axios";

const router = Router();

const SAO_JOAO_LAT = -21.9701;
const SAO_JOAO_LON = -46.795;

const WMO_CONDITIONS: Record<number, string> = {
  0: "Céu limpo",
  1: "Principalmente limpo",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina com geada",
  51: "Chuvisco leve",
  53: "Chuvisco moderado",
  55: "Chuvisco denso",
  61: "Chuva leve",
  63: "Chuva moderada",
  65: "Chuva forte",
  71: "Neve leve",
  73: "Neve moderada",
  75: "Neve forte",
  77: "Grãos de neve",
  80: "Pancadas de chuva leve",
  81: "Pancadas de chuva moderada",
  82: "Pancadas de chuva forte",
  85: "Pancadas de neve leve",
  86: "Pancadas de neve forte",
  95: "Tempestade",
  96: "Tempestade com granizo leve",
  99: "Tempestade com granizo forte",
};

router.get("/weather/current", async (req, res) => {
  try {
    const lat = Number(req.query["lat"]) || SAO_JOAO_LAT;
    const lon = Number(req.query["lon"]) || SAO_JOAO_LON;

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,cloud_cover,visibility,dew_point_2m,precipitation_probability` +
      `&timezone=America%2FSao_Paulo` +
      `&wind_speed_unit=kmh`;

    const { data } = await axios.get(url, { timeout: 8000 });
    const c = data.current;

    return res.json({
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      pressure: c.pressure_msl,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      windGust: c.wind_gusts_10m,
      uvIndex: c.uv_index,
      precipitation: c.precipitation,
      precipitationProbability: c.precipitation_probability ?? 0,
      condition: WMO_CONDITIONS[c.weather_code] ?? "Desconhecido",
      conditionCode: c.weather_code,
      visibility: c.visibility ?? 10000,
      dewPoint: c.dew_point_2m,
      cloudCover: c.cloud_cover,
      location: "São João da Boa Vista, SP",
      lat,
      lon,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Weather current error");
    return res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

router.get("/weather/history", async (req, res) => {
  try {
    const lat = SAO_JOAO_LAT;
    const lon = SAO_JOAO_LON;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl` +
      `&timezone=America%2FSao_Paulo` +
      `&wind_speed_unit=kmh` +
      `&start_date=${fmt(startDate)}&end_date=${fmt(endDate)}`;

    const { data } = await axios.get(url, { timeout: 8000 });
    const h = data.hourly;

    const records = h.time
      .map((t: string, i: number) => ({
        timestamp: new Date(t).toISOString(),
        temperature: h.temperature_2m[i],
        humidity: h.relative_humidity_2m[i],
        precipitation: h.precipitation[i],
        windSpeed: h.wind_speed_10m[i],
        pressure: h.pressure_msl[i],
      }))
      .filter((_: unknown, i: number) => i % 3 === 0)
      .slice(0, 56);

    return res.json(records);
  } catch (err) {
    req.log.error({ err }, "Weather history error");
    return res.status(500).json({ error: "Failed to fetch weather history" });
  }
});

export default router;
