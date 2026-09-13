import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "@/lib/db";

// ── Attribute interfaces ──────────────────────────────────────────────────────

export interface AdminAttributes {
  id: number;
  name: string;
  email: string;
  password: string; // bcrypt hash
  createdAt?: Date;
  updatedAt?: Date;
}

type AdminCreationAttributes = Optional<AdminAttributes, "id" | "createdAt" | "updatedAt">;

// ── Model class ───────────────────────────────────────────────────────────────

export class Admin
  extends Model<AdminAttributes, AdminCreationAttributes>
  implements AdminAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// ── Init ──────────────────────────────────────────────────────────────────────

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "admins",
    timestamps: true,
  },
);

export default Admin;
