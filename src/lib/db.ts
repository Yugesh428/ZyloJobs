/**
 * Sequelize singleton — Node.js runtime only.
 * Never import this from middleware or Edge runtime code.
 */
import { Sequelize } from "sequelize";

// Guard: blow up early if somehow loaded in Edge
if (typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !== "undefined") {
  throw new Error("lib/db must not be imported in Edge runtime");
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// ── Singleton: reuse the connection across hot-reloads in dev ──────────────
const globalWithSequelize = globalThis as typeof globalThis & {
  _sequelize?: Sequelize;
};

if (!globalWithSequelize._sequelize) {
  globalWithSequelize._sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    // Only log in development
    logging: process.env.NODE_ENV === "development"
      ? (msg) => console.log("📊 [SQL]", msg)
      : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

export const sequelize = globalWithSequelize._sequelize;
