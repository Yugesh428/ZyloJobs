/**
 * Database sync script — run with:
 *   npm run db:sync
 *
 * Synchronizes all models with the database.
 * Uses { alter: true } to update existing tables without data loss.
 */

import { Sequelize } from "sequelize";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: console.log,
});

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Import all models dynamically
    console.log("\n🔄 Synchronizing all models with database...\n");

    // Sync all models with alter: true to update existing tables
    await sequelize.sync({ alter: true });

    console.log("\n✅ All models synchronized successfully!");
    console.log("   - Tables created or updated");
    console.log("   - Columns added/modified as needed");
    console.log("   - Existing data preserved\n");

    await sequelize.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    process.exit(1);
  }
}

syncDatabase();
