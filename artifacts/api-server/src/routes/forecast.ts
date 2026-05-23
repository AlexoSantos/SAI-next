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
  95: "Tempestade",
  96: "Tempestade com granizo",
  99: "Tempestade forte",
};

router.get("/forecast/hourly", async (req, res) => {
  try {
    const lat = Number(req.query["lat"]) || SAO_JOAO_LAT;
    const lon = Number(req.query["lon"]) || SAO_JOAO_LON;

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,uv_index` +
      `&timezone=America%2FSao_Paulo` +
      `&wind_speed_unit=kmh` +
      `&forecast_days=2`;

    const { data } = await axios.get(url, { timeout: 8000 });
    const h = data.hourly;

    const now = new Date();
    const result = h.time
      .map((t: string, i: number) => ({
        timestamp: new Date(t).toISOString(),
        temperature: h.temperature_2m[i],
        feelsLike: h.apparent_temperature[i],
        humidity: h.relative_humidity_2m[i],
        precipitation: h.precipitation[i],
        precipitationProbability: h.precipitation_probability[i] ?? 0,
        windSpeed: h.wind_speed_10m[i],
        windDirection: h.wind_direction_10m[i],
        condition: WMO_CONDITIONS[h.weather_code[i]] ?? "Desconhecido",
        conditionCode: h.weather_code[i],
        cloudCover: h.cloud_cover[i],
        uvIndex: h.uv_index[i] ?? 0,
      }))
      .filter((item: { timestamp: string }) => new Date(item.timestamp) >= now)
      .slice(0, 24);

    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Hourly forecast error");
    return res.status(500).json({ error: "Failed to fetch hourly forecast" });
  }
});

router.get("/forecast/daily", async (req, res) => {
  try {
    const lat = Number(req.query["lat"]) || SAO_JOAO_LAT;
    const lon = Number(req.query["lon"]) || SAO_JOAO_LON;

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset` +
      `&timezone=America%2FSao_Paulo` +
      `&wind_speed_unit=kmh` +
      `&forecast_days=7`;

    const { data } = await axios.get(url, { timeout: 8000 });
    const d = data.daily;

    const result = d.time.map((date: string, i: number) => ({
      date,
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      humidity: d.relative_humidity_2m_max[i],
      precipitation: d.precipitation_sum[i],
      precipitationProbability: d.precipitation_probability_max[i] ?? 0,
      windSpeed: d.wind_speed_10m_max[i],
      windDirection: d.wind_direction_10m_dominant[i],
      condition: WMO_CONDITIONS[d.weather_code[i]] ?? "Desconhecido",
      conditionCode: d.weather_code[i],
      uvIndex: d.uv_index_max[i] ?? 0,
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
    }));

    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Daily forecast error");
    return res.status(500).json({ error: "Failed to fetch daily forecast" });
  }
});

export default router;
