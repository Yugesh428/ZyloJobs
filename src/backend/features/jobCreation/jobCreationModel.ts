/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * Job — a staffing job posting.
 *
 * Rules:
 *   - No company association — jobs are posted generically.
 *   - status tracks the job lifecycle.
 *   - experienceRequired: Fresher | 1-2 years | 3-5 years | 5+ years.
 *   - workType: On-site | Remote | Hybrid.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type ExperienceRequired =
  | "Fresher"
  | "1-2 years"
  | "3-5 years"
  | "5+ years";

export type WorkType = "On-site" | "Remote" | "Hybrid";

export type JobStatus = "pending" | "processing" | "fulfilled" | "cancelled";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface JobAttributes {
  id: string;
  companyId: string | null;              // FK → companies.id (optional - jobs can be posted generically)
  jobRole: string;
  department: string;
  numberOfWorkers: number;
  requiredSkills: string[] | null;
  experienceRequired: ExperienceRequired;
  jobLocation: string;
  workType: WorkType;
  workingHours: string;
  responsibilities: string | null;
  status: JobStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobCreationAttributes extends Optional<
  JobAttributes,
  "id" | "companyId" | "requiredSkills" | "responsibilities" | "status" | "createdAt" | "updatedAt"
> {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

class Job
  extends Model<JobAttributes, JobCreationAttributes>
  implements JobAttributes
{
  declare id: string;
  declare companyId: string | null;
  declare jobRole: string;
  declare department: string;
  declare numberOfWorkers: number;
  declare requiredSkills: string[] | null;
  declare experienceRequired: ExperienceRequired;
  declare jobLocation: string;
  declare workType: WorkType;
  declare workingHours: string;
  declare responsibilities: string | null;
  declare status: JobStatus;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "companies",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    jobRole: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    numberOfWorkers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    requiredSkills: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: null,
    },
    experienceRequired: {
      type: DataTypes.ENUM("Fresher", "1-2 years", "3-5 years", "5+ years"),
      allowNull: false,
      defaultValue: "Fresher",
    },
    jobLocation: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    workType: {
      type: DataTypes.ENUM("On-site", "Remote", "Hybrid"),
      allowNull: false,
      defaultValue: "On-site",
    },
    workingHours: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "fulfilled", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
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
    modelName: "Job",
    tableName: "jobs",
    timestamps: true,
    indexes: [
      { fields: ["companyId"], name: "idx_job_company" },
      { fields: ["status"], name: "idx_job_status" },
      { fields: ["department"], name: "idx_job_department" },
      { fields: ["experienceRequired"], name: "idx_job_experience" },
      { fields: ["workType"], name: "idx_job_work_type" },
    ],
  },
);

export default Job;
