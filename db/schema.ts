import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const algorithms = sqliteTable("algorithms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  language: text("language").notNull(),
  complexity: text("complexity").notNull(),
  description: text("description").notNull(),
  code: text("code").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  favorite: integer("favorite", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});

export type Algorithm = typeof algorithms.$inferSelect;
export type NewAlgorithm = typeof algorithms.$inferInsert;
