/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";
import JobApplication from "../jobApplication/jobApplicationModel";
import { Worker } from "../worker/workerModel";
import Job from "../jobCreation/jobCreationModel";
import { Company } from "../companyCreation/companyModel";

/**
 * Onboarding — tracks a worker's onboarding for an accepted application.
 *
 * Rules:
 *   - Tied to an application, worker, job, and placing company.
 *   - One onboarding record per application (unique applicationId).
 *   - status lifecycle: pending → offer_sent → documents_submitted
 *                       → active → terminated.
 *   - salaryPeriod: monthly | weekly | daily.
 *   - salaryAmount is stored as INTEGER in NPR (Rs.).
 *   - Document URLs are uploaded by admin and stored as paths.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type SalaryPeriod = "monthly" | "weekly" | "daily";

export type OnboardingStatus =
  | "pending"
  | "offer_sent"
  | "documents_submitted"
  | "active"
  | "terminated";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface OnboardingAttributes {
  id: string;
  applicationId: string;
  workerId: string;
  jobId: string;
  companyId: string;
  joiningDate: string;             // DATEONLY -> "YYYY-MM-DD"
  salaryAmount: number;            // INTEGER, NPR
  salaryPeriod: SalaryPeriod;
  status: OnboardingStatus;
  offerLetterUrl: string | null;
  contractUrl: string | null;
  citizenshipUrl: string | null;
  passportUrl: string | null;
  ppPhotoUrl: string | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OnboardingCreationAttributes
  extends Optional<
    OnboardingAttributes,
    | "id"
    | "status"
    | "offerLetterUrl"
    | "contractUrl"
    | "citizenshipUrl"
    | "passportUrl"
    | "ppPhotoUrl"
    | "notes"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

class Onboarding
  extends Model<OnboardingAttributes, OnboardingCreationAttributes>
  implements OnboardingAttributes
{
  declare id: string;
  declare applicationId: string;
  declare workerId: string;
  declare jobId: string;
  declare companyId: string;
  declare joiningDate: string;
  declare salaryAmount: number;
  declare salaryPeriod: SalaryPeriod;
  declare status: OnboardingStatus;
  declare offerLetterUrl: string | null;
  declare contractUrl: string | null;
  declare citizenshipUrl: string | null;
  declare passportUrl: string | null;
  declare ppPhotoUrl: string | null;
  declare notes: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // Association mixins
  declare application?: JobApplication;
  declare worker?: Worker;
  declare job?: Job;
  declare company?: Company;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

Onboarding.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "job_applications", key: "id" },
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
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "jobs", key: "id" },
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
    joiningDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    salaryAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    salaryPeriod: {
      type: DataTypes.ENUM("monthly", "weekly", "daily"),
      allowNull: false,
      defaultValue: "monthly",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "offer_sent",
        "documents_submitted",
        "active",
        "terminated",
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    offerLetterUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    contractUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    citizenshipUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    passportUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    ppPhotoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    notes: {
      type: DataTypes.TEXT,
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
    modelName: "Onboarding",
    tableName: "onboardings",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["applicationId"],
        name: "uq_onboarding_application",
      },
      { fields: ["workerId"],  name: "idx_onboarding_worker" },
      { fields: ["jobId"],     name: "idx_onboarding_job" },
      { fields: ["companyId"], name: "idx_onboarding_company" },
      { fields: ["status"],    name: "idx_onboarding_status" },
    ],
  },
);

/* ------------------------------------------------------------------ */
/* Associations                                                        */
/* ------------------------------------------------------------------ */

Onboarding.belongsTo(JobApplication, {
  foreignKey: "applicationId",
  as: "application",
});
Onboarding.belongsTo(Worker, { foreignKey: "workerId",  as: "worker"  });
Onboarding.belongsTo(Job,    { foreignKey: "jobId",     as: "job"     });
Onboarding.belongsTo(Company,{ foreignKey: "companyId", as: "company" });

JobApplication.hasOne(Onboarding, { foreignKey: "applicationId", as: "onboarding" });
Worker.hasMany(Onboarding,        { foreignKey: "workerId",      as: "onboardings" });
Job.hasMany(Onboarding,           { foreignKey: "jobId",         as: "onboardings" });
Company.hasMany(Onboarding,       { foreignKey: "companyId",     as: "onboardings" });

export default Onboarding;