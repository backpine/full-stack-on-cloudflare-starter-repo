import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const linksTable = sqliteTable("links", {
  linkId: text("link_id").primaryKey(),
  accountId: text("account_id").notNull(),
  name: text("name").notNull(),
  destinations: text("destinations", { mode: "json" }).notNull().$type<{
    default: string;
    [countryCode: string]: string;
  }>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Link = typeof linksTable.$inferSelect;
export type NewLink = typeof linksTable.$inferInsert;
