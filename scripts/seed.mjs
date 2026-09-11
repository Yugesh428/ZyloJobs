/**
 * Seed script — run with:
 *   node --env-file=.env scripts/seed.mjs
 *
 * Creates the `admins` table (if missing) and inserts the default admin.
 * Safe to re-run — existing admin is not duplicated.
 */

import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

// Inline model (no TS needed in .mjs)
const Admin = sequelize.define(
  "Admin",
  {
    id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name:     { type: DataTypes.STRING(120), allowNull: false },
    email:    { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
  },
  { tableName: "admins", timestamps: true },
);

async function seed() {
  await sequelize.authenticate();
  console.log("✅ DB connected");

  await Admin.sync({ alter: true });
  console.log("✅ admins table ready");

  const ADMIN_EMAIL = "admin@zylobrains.com";
  const ADMIN_PASS  = "Admin@123";

  const existing = await Admin.findOne({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log("ℹ️  Admin already exists — skipping insert");
  } else {
    const hash = await bcrypt.hash(ADMIN_PASS, 12);
    await Admin.create({ name: "ZYLO Admin", email: ADMIN_EMAIL, password: hash });
    console.log("🌱 Admin seeded:");
    console.log("   Email   :", ADMIN_EMAIL);
    console.log("   Password:", ADMIN_PASS);
  }

  await sequelize.close();
}

seed().catch((err) => { console.error(err); process.exit(1); });
