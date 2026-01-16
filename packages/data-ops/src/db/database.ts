import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let db: DrizzleDb;

/**
 * Sets up the database connection. Don't double initialize when a worker is hot
 * and has already been initialized.
 * @param bindingDb
 * @returns
 */
export function initDatabase(bindingDb: D1Database) {
  if (db) return;
  db = drizzle(bindingDb, { schema });
}

export function getDb(): DrizzleDb {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initDatabase() first with the D1 binding."
    );
  }
  return db;
}

export { schema };
