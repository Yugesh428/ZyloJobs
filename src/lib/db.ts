import { Sequelize } from "sequelize";

// This module is Node.js only — never import from Edge runtime code.
if (typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !== "undefined") {
  throw new Error("lib/db must not be imported in Edge runtime");
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("🔗 Initializing Sequelize connection...");

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: (msg) => console.log("📊 [Sequelize]", msg),
});

// Test the connection immediately
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err));
