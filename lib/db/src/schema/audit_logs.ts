import { pgTable, serial, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  resource: text("resource"),
  details: text("details"),
  ip: varchar("ip", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogsTable.$inferSelect;
