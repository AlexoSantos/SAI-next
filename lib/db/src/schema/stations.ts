import { pgTable, serial, text, timestamp, varchar, doublePrecision, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stationsTable = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("planned"),
  type: varchar("type", { length: 50 }).notNull().default("meteorological"),
  lastReading: timestamp("last_reading"),
  batteryLevel: real("battery_level"),
  signalStrength: real("signal_strength"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStationSchema = createInsertSchema(stationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertStation = z.infer<typeof insertStationSchema>;
export type Station = typeof stationsTable.$inferSelect;
