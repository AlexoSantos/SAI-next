# SAI — Sistema de Alerta Inteligente

National climate intelligence platform for Imperatech. Real-time weather, fire hotspot, air quality, and risk analysis for São João da Boa Vista/SP (lat: -21.9701, lon: -46.7950). NASA Mission Control / Palantir Gotham aesthetic, dark mode only.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000/8080)
- `pnpm --filter @workspace/sai-platform run dev` — run the frontend (port 20228)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, Tailwind CSS v4, shadcn/ui, zustand, recharts, react-leaflet
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sai-platform/` — React+Vite frontend (preview path `/`)
- `artifacts/api-server/` — Express API server (preview path `/api`)
- `lib/api-client-react/` — Generated hooks + custom fetch (from OpenAPI spec)
- `lib/api-spec/` — OpenAPI spec (`openapi.yaml`) — source of truth for API contract
- `lib/db/` — Drizzle schema, migrations, seed data
- `lib/db/src/schema/index.ts` — DB schema (users, stations, alerts, audit_logs)
- `artifacts/sai-platform/src/pages/` — All page components (dashboard, map, analytics, alerts, stations, admin, control-center)
- `artifacts/sai-platform/src/store/auth.ts` — Zustand auth store with JWT token management

## Architecture decisions

- Contract-first API: OpenAPI spec drives Orval codegen for React Query hooks and Zod schemas
- JWT auth stored in localStorage (`sai_token` key), wired to custom-fetch via `setAuthTokenGetter`
- All external data from public APIs: Open-Meteo (weather/forecast/air quality), NASA FIRMS (fire hotspots), RainViewer (radar tiles)
- PostgreSQL seeded with stations, alerts, and two users on first `db push`
- Leaflet map loaded dynamically (async import) to avoid SSR issues; dark tile from CartoDB

## Product

**SAI** is a full-stack national climate intelligence platform:
- **Dashboard** — Real-time weather (temp, humidity, wind, UV, AQI), 7-day forecast, AI risk analysis, active alerts
- **Map** — Interactive Leaflet map with dark CartoDB tiles, RainViewer radar overlay, NASA fire hotspots, IoT station markers
- **Analytics** — Historical charts (temperature, hotspots, alerts trend), KPI cards, system uptime
- **Alerts** — Central alert management with severity/type/status filtering
- **Stations** — IoT infrastructure monitoring with battery, signal, and last-reading status
- **Admin** — System health, external API status, IoT endpoint registry
- **Control Center** — Executive dashboard (super_admin only) with big KPIs and risk overview

## User preferences

- Three theme modes: light, dark, and system (follows OS preference) — toggle in the sidebar footer
- Brazilian Portuguese labels for all UI content
- NASA Mission Control / Palantir Gotham aesthetic (deep navy bg dark / light cool slate light, electric cyan primary)
- Monospace font for labels, data values, and system messages
- Location: São João da Boa Vista, SP — lat: -21.9701, lon: -46.7950

## Credentials (seeded)

- CEO / super_admin: `ceo@imperatech.ai` / `IMPERATECH_MASTER_2026`
- Admin: `admin@sai.gov` / `SAI_MASTER_2026`

## Gotchas

- `pnpm --filter @workspace/sai-platform run typecheck` — must pass before deploying
- Leaflet CSS must be dynamically imported inside the async `initMap()` function to avoid SSR issues
- The API server binds to port 8080 (workflow-assigned `PORT`); the proxy routes `/api/*` to it
- `setAuthTokenGetter` must be called at module load time (not inside a component) so it's active before any API call
- RainViewer radar URL: `https://tilecache.rainviewer.com/v2/radar/nowcast/256/{z}/{x}/{y}/6/1_1.png`
- IoT MQTT topic pattern: `sai/station/{id}/climate | river | smoke | camera | alerts`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
