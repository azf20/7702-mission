import { boolean, integer, pgTable, timestamp } from "drizzle-orm/pg-core";

export const chains = pgTable("chains", {
  id: integer("id").primaryKey(),
  eip7702Enabled: boolean("eip7702_enabled").notNull(),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).notNull(),
});
