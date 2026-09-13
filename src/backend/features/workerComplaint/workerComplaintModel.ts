/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";
import { Company } from "../companyCreation/companyModel";
import { Worker } from "../worker/workerModel";
import Onboarding from "../onBoarding/onBoardingModel";

/**
 * WorkerComplaint — a complaint filed by a company against a worker
 * for a specific onboarding/placement.
 *
 * Rules:
 *   - Every complaint is tied to a company, a worker, and an onboarding record.
 *   - category: attendance | misconduct | performance | policy_violation | damage | other.
 *   - severity: low | medium | high | critical.
 *   - status lifecycle: open → under_review → resolved | dismissed.
 *   - resolvedAt is set automatically when status becomes resolved / dismissed.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type ComplaintCategory =
  | "attendance"
  | "misconduct"
  | "performance"
  | "policy_violation"
  | "damage"
  | "other";

export type ComplaintSeverity = "low" | "medium" | "high" | "critical";

export type ComplaintStatus =
  | "open"
  | "under_review"
  | "resolved"
  | "dismissed";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface WorkerComplaintAttributes {
  id: string;
  companyId: string;
  workerId: string;
  onboardingId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  adminNote: string | null;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkerComplaintCreationAttributes
  extends Optional<
    WorkerComplaintAttributes,
    | "id"
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

class WorkerComplaint
  extends Model<WorkerComplaintAttributes, WorkerComplaintCreationAttributes>
  implements WorkerComplaintAttributes
{
  declare id: string;
  declare companyId: string;
  declare workerId: string;
  declare onboardingId: string;
  declare title: string;
  declare description: string;
  declare category: ComplaintCategory;
  declare severity: ComplaintSeverity;
  declare status: ComplaintStatus;
  declare adminNote: string | null;
  declare resolution: string | null;
  declare resolvedAt: Date | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // Association mixins
  declare company?: Company;
  declare worker?: Worker;
  declare onboarding?: Onboarding;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

WorkerComplaint.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "companies", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "workers", key: "id" },
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
        "attendance",
        "misconduct",
        "performance",
        "policy_violation",
        "damage",
        "other",
      ),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      allowNull: false,
      defaultValue: "medium",
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
    modelName: "WorkerComplaint",
    tableName: "worker_complaints",
    timestamps: true,
    indexes: [
      { fields: ["companyId"],    name: "idx_complaint_company" },
      { fields: ["workerId"],     name: "idx_complaint_worker" },
      { fields: ["onboardingId"], name: "idx_complaint_onboarding" },
      { fields: ["status"],       name: "idx_complaint_status" },
      { fields: ["severity"],     name: "idx_complaint_severity" },
      { fields: ["category"],     name: "idx_complaint_category" },
    ],
  },
);

/* ------------------------------------------------------------------ */
/* Associations                                                        */
/* ------------------------------------------------------------------ */

WorkerComplaint.belongsTo(Company,    { foreignKey: "companyId",    as: "company"    });
WorkerComplaint.belongsTo(Worker,     { foreignKey: "workerId",     as: "worker"     });
WorkerComplaint.belongsTo(Onboarding, { foreignKey: "onboardingId", as: "onboarding" });

Company.hasMany(WorkerComplaint,    { foreignKey: "companyId",    as: "complaints" });
Worker.hasMany(WorkerComplaint,     { foreignKey: "workerId",     as: "complaints" });
Onboarding.hasMany(WorkerComplaint, { foreignKey: "onboardingId", as: "complaints" });

export default WorkerComplaint;