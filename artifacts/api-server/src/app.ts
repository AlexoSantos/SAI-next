import crypto from "node:crypto";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const allowedOrigins = (process.env["CORS_ORIGIN"] ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const rateLimitState = new Map<string, { count: number; resetAt: number }>();

function requestIdMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const requestId = req.headers["x-request-id"]?.toString() ?? crypto.randomUUID();
  res.setHeader("x-request-id", requestId);
  next();
}

function securityHeaders(_req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-frame-options", "DENY");
  res.setHeader("referrer-policy", "no-referrer");
  res.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
  next();
}

function simpleRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const current = rateLimitState.get(key);
  if (!current || current.resetAt < now) {
    rateLimitState.set(key, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  current.count += 1;
  if (current.count > 240) {
    return res.status(429).json({ error: "Muitas requisições. Tente novamente em instantes." });
  }
  return next();
}

app.use(requestIdMiddleware);
app.use(securityHeaders);
app.use(simpleRateLimit);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origem bloqueada por CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "Unhandled API error");
  res.status(500).json({ error: "Erro interno do SAI" });
});

export default app;
