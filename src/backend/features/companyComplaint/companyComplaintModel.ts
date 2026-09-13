/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";
import { Worker } from "../worker/workerModel";
import { Company } from "../companyCreation/companyModel";
import Onboarding from "../onBoarding/onBoardingModel";

/**
 * CompanyComplaint — a complaint filed by a worker against a company
 * for a specific onboarding/placement.
 *
 * Rules:
 *   - Every complaint is filed by a worker against a company,
 *     tied to a specific onboarding/placement.
 *   - category (workplace only): harassment | unsafe_conditions
 *               | overwork | discrimination | contract_violation | other.
 *   - severity: low | medium | high | critical.
 *   - status lifecycle: open → under_review → resolved | dismissed.
 *   - isAnonymous: when true, worker identity is hidden from the company
 *     (admins still see who filed it).
 *   - resolvedAt is auto-set when status becomes resolved / dismissed.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type CompanyComplaintCategory =
  | "harassment"
  | "unsafe_conditions"
  | "overwork"
  | "discrimination"
  | "contract_violation"
  | "other";

export type CompanyComplaintSeverity = "low" | "medium" | "high" | "critical";

export type CompanyComplaintStatus =
  | "open"
  | "under_review"
  | "resolved"
  | "dismissed";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface CompanyComplaintAttributes {
  id: string;
  workerId: string;                 // who filed it
  companyId: string;                // who it's against
  onboardingId: string;
  title: string;
  description: string;
  category: CompanyComplaintCategory;
  severity: CompanyComplaintSeverity;
  isAnonymous: boolean;
  status: CompanyComplaintStatus;
  adminNote: string | null;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyComplaintCreationAttributes
  extends Optional<
    CompanyComplaintAttributes,
    | "id"
    | "isAnonymous"
    | "status"
    | "adminNote"
    | "resolution"
    | "resolvedAt"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

class CompanyComplaint
  extends Model<CompanyComplaintAttributes, CompanyComplaintCreationAttributes>
  implements CompanyComplaintAttributes
{
  declare id: string;
  declare workerId: string;
  declare companyId: string;
  declare onboardingId: string;
  declare title: string;
  declare description: string;
  declare category: CompanyComplaintCategory;
  declare severity: CompanyComplaintSeverity;
  declare isAnonymous: boolean;
  declare status: CompanyComplaintStatus;
  declare adminNote: string | null;
  declare resolution: string | null;
  declare resolvedAt: Date | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // Association mixins
  declare worker?: Worker;
  declare company?: Company;
  declare onboarding?: Onboarding;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

CompanyComplaint.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "workers", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "companies", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    onboardingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "onboardings", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    category: {
      type: DataTypes.ENUM(
        "harassment",
        "unsafe_conditions",
        "overwork",
        "discrimination",
        "contract_violation",
        "other",
      ),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      allowNull: false,
      defaultValue: "medium",
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("open", "under_review", "resolved", "dismissed"),
      allowNull: false,
      defaultValue: "open",
    },
    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    resolvedAt: {
      type: DataTypes.DATE,
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
    modelName: "CompanyComplaint",
    tableName: "company_complaints",
    timestamps: true,
    indexes: [
      { fields: ["workerId"],     name: "idx_company_complaint_worker" },
      { fields: ["companyId"],    name: "idx_company_complaint_company" },
      { fields: ["onboardingId"], name: "idx_company_complaint_onboarding" },
      { fields: ["status"],       name: "idx_company_complaint_status" },
      { fields: ["severity"],     name: "idx_company_complaint_severity" },
      { fields: ["category"],     name: "idx_company_complaint_category" },
      { fields: ["isAnonymous"],  name: "idx_company_complaint_anonymous" },
    ],
  },
);

/* ------------------------------------------------------------------ */
/* Associations                                                        */
/* ------------------------------------------------------------------ */

CompanyComplaint.belongsTo(Worker,     { foreignKey: "workerId",     as: "worker"     });
CompanyComplaint.belongsTo(Company,    { foreignKey: "companyId",    as: "company"    });
CompanyComplaint.belongsTo(Onboarding, { foreignKey: "onboardingId", as: "onboarding" });

Worker.hasMany(CompanyComplaint,     { foreignKey: "workerId",     as: "companyComplaints" });
Company.hasMany(CompanyComplaint,    { foreignKey: "companyId",    as: "companyComplaints" });
Onboarding.hasMany(CompanyComplaint, { foreignKey: "onboardingId", as: "companyComplaints" });

export default CompanyComplaint;