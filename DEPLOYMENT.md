# SAI — Deploy gratuito recomendado

## Diagnóstico

O frontend React/Vite pode subir na Vercel. A API Express com realtime/SSE, banco PostgreSQL e futuras filas Redis/MQTT deve ficar em um host separado.

## Arquitetura gratuita recomendada

- Frontend: Vercel
- API Express: Render, Railway ou Fly.io
- PostgreSQL: Neon
- Redis: Upstash
- MQTT: HiveMQ Cloud
- Banco local opcional: Docker/Postgres

## Rodar local

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/sai-platform run dev
```

Frontend:
```txt
http://localhost:20228
```

API:
```txt
http://localhost:8080/api/healthz
http://localhost:8080/api/system/health
```

## Variáveis Vercel

Configure no projeto Vercel:

```env
VITE_API_URL=https://sua-api.onrender.com
VITE_WS_URL=wss://sua-api.onrender.com
BASE_PATH=/
```

## Variáveis API

Configure no Render/Railway/Fly:

```env
PORT=8080
DATABASE_URL=
SESSION_SECRET=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CORS_ORIGIN=https://seu-projeto.vercel.app
REDIS_URL=
MQTT_URL=
MQTT_USERNAME=
MQTT_PASSWORD=
NASA_FIRMS_API_KEY=
NOAA_API_KEY=
```

## Testes rápidos

Health:
```bash
curl http://localhost:8080/api/system/health
```

Realtime SSE:
```bash
curl -N http://localhost:8080/api/realtime/stream
```

Simular evento:
```bash
curl -X POST http://localhost:8080/api/realtime/simulate   -H "Content-Type: application/json"   -d '{"type":"weather:update"}'
```

Simular sensor:
```bash
curl -X POST http://localhost:8080/api/sensors/ingest   -H "Content-Type: application/json"   -d '{"stationId":"sjbv-001","temperature":34,"humidity":28,"windSpeed":32,"aqi":92,"smokeDetected":true}'
```

Risk Engine:
```bash
curl http://localhost:8080/api/risk/current
curl http://localhost:8080/api/risk/forecast
```

## Importante

O arquivo `vercel.json` contém uma rewrite de exemplo para `/api/*`. Troque `https://SUA-API-RENDER-OU-RAILWAY.com` pela URL real da API.

## Checklist antes do deploy

```bash
pnpm run typecheck
pnpm run build
```

Se falhar:
1. copie o erro;
2. corrija no Antigravity;
3. rode novamente.
