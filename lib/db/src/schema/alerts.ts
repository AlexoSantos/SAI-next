import { pgTable, serial, text, timestamp, varchar, doublePrecision, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 50 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  lat: doublePrecision("lat"),
  lon: doublePrecision("lon"),
  radius: real("radius"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
