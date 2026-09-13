import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type CompanyType    = "Private" | "Public" | "NGO" | "Government" | "Other";
export type CompanyStatus  = "pending" | "active" | "suspended";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface CompanyAttributes {
  id: string;
  companyName: string;
  companyCode: string;
  companyType: CompanyType;
  industry: string;
  email: string;                    // login email
  password: string;                 // bcrypt hash — never returned in API
  status: CompanyStatus;            // pending → active → suspended
  registrationNumber: string | null;
  panNumber: string | null;
  companyDescription: string | null;
  companyLogo: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CompanySafeAttributes = Omit<CompanyAttributes, "password">;

export interface CompanyCreationAttributes
  extends Optional<
    CompanyAttributes,
    | "id"
    | "companyType"
    | "status"
    | "registrationNumber"
    | "panNumber"
    | "companyDescription"
    | "companyLogo"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export class Company
  extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes
{
  declare id: string;
  declare companyName: string;
  declare companyCode: string;
  declare companyType: CompanyType;
  declare industry: string;
  declare email: string;
  declare password: string;
  declare status: CompanyStatus;
  declare registrationNumber: string | null;
  declare panNumber: string | null;
  declare companyDescription: string | null;
  declare companyLogo: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  /** Return all fields except password — safe for API responses */
  toSafeJSON(): CompanySafeAttributes {
    const { password: _pw, ...safe } = this.toJSON() as CompanyAttributes;
    return safe;
  }
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

Company.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    companyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    companyType: {
      type: DataTypes.ENUM("Private", "Public", "NGO", "Government", "Other"),
      allowNull: false,
      defaultValue: "Private",
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "active", "suspended"),
      allowNull: false,
      defaultValue: "pending",
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    companyDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    companyLogo: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Company",
    tableName: "companies",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["companyCode"], name: "uq_company_code" },
      { unique: true, fields: ["email"],       name: "uq_company_email" },
      { fields: ["companyName"],               name: "idx_company_name"  },
      { fields: ["companyType"],               name: "idx_company_type"  },
      { fields: ["industry"],                  name: "idx_company_industry" },
      { fields: ["status"],                    name: "idx_company_status" },
    ],
  },
);

export default Company;
