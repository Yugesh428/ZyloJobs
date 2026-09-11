/**
 * Call once at app startup (or from the seed script) to sync all models.
 * Uses { alter: false } in production – safe for existing tables.
 */
import { sequelize } from "@/lib/db";
import "@/lib/models/Admin";

export async function syncDB() {
  await sequelize.sync({ alter: true });
}
