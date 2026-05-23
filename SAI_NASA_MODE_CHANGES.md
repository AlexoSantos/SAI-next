# SAI NASA MODE — mudanças aplicadas

## Implementado nesta versão

- Hardening básico da API:
  - headers de segurança
  - CORS por env
  - rate limit simples
  - request id
  - error handler global

- Realtime inicial:
  - endpoint SSE `/api/realtime/stream`
  - status `/api/realtime/status`
  - eventos recentes `/api/realtime/events`
  - simulação `/api/realtime/simulate`
  - ingestão de sensores `/api/sensors/ingest`

- Preparação MQTT:
  - topics oficiais documentados
  - ingestão HTTP compatível com payloads de sensores

- Risk Intelligence Engine:
  - endpoint `/api/risk/current`
  - endpoint `/api/risk/forecast`
  - endpoint `/api/risk/simulate`
  - score 0-100
  - classificação baixo/atenção/alto/crítico
  - recomendação operacional

- Frontend:
  - hook `useRealtime`
  - Zustand realtime store
  - componente `LiveStatusBadge`
  - componente `RiskScoreCard`
  - indicador AO VIVO no Dashboard
  - indicador AO VIVO no Control Center
  - base URL via `VITE_API_URL`

- Deploy:
  - `.env.example`
  - `vercel.json`
  - `DEPLOYMENT.md`

## Próximas fases recomendadas

1. Redis + BullMQ
2. MQTT real com broker HiveMQ/EMQX
3. multi-tenant no banco
4. refresh token/MFA
5. audit logs imutáveis
6. NOAA avançado
7. camadas satelitais
8. heatmap nacional
