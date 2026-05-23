import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { spawnSync } from "node:child_process";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function resolveInternalHost(url: string): string {
  try {
    const u = new URL(url);
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) {
      const r = spawnSync(
        "node",
        [
          "-e",
          `const{Resolver}=require('dns');const r=new Resolver();r.setServers(['127.0.0.11']);r.resolve4(${JSON.stringify(u.hostname)},(e,a)=>{if(!e&&a&&a[0])process.stdout.write(a[0]);});`,
        ],
        { timeout: 4000, encoding: "utf8" },
      );
      const ip = (r.stdout ?? "").trim();
      if (ip) {
        u.hostname = ip;
        return u.toString();
      }
    }
  } catch {}
  return url;
}

const connectionString = resolveInternalHost(process.env.DATABASE_URL);

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
