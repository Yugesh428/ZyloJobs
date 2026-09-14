/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * JobApplication — a worker's application for a job posting.
 *
 * Rules:
 *   - One worker can only apply once per job (unique: jobId + workerId).
 *   - cvUrl stores the local file path (dev) or S3 URL (prod).
 *   - If cvUrl is null, fall back to worker.resumeUrl at the controller level.
 *   - status tracks the application lifecycle.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface JobApplicationAttributes {
  id: string;
  jobId: string;             // FK → jobs.id
  workerId: string;          // FK → workers.id
  status: ApplicationStatus;
  coverNote: string | null;
  cvUrl: string | null;      // uploaded CV for this application (optional)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobApplicationCreationAttributes
  extends Optional<
    JobApplicationAttributes,
    "id" | "status" | "coverNote" | "cvUrl" | "createdAt" | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export class JobApplication
  extends Model<JobApplicationAttributes, JobApplicationCreationAttributes>
  implements JobApplicationAttributes
{
  declare id: string;
  declare jobId: string;
  declare workerId: string;
  declare status: ApplicationStatus;
  declare coverNote: string | null;
  declare cvUrl: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // Associations
  declare job?: {
    id: string;
    jobRole: string;
  };
  declare worker?: {
    id: string;
    fullName: string;
    email: string;
  };
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

JobApplication.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "jobs", key: "id" },
      onDelete: "CASCADE",
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "workers", key: "id" },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("applied", "reviewing", "shortlisted", "rejected", "hired"),
      allowNull: false,
      defaultValue: "applied",
    },
    coverNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    cvUrl: {
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
    modelName: "JobApplication",
    tableName: "job_applications",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["jobId", "workerId"],
        name: "uq_application_job_worker",
      },
      { fields: ["jobId"],    name: "idx_application_job_id"    },
      { fields: ["workerId"], name: "idx_application_worker_id" },
      { fields: ["status"],   name: "idx_application_status"    },
    ],
  },
);

/* ------------------------------------------------------------------ */
/* Associations (defined after init to avoid circular deps)           */
/* ------------------------------------------------------------------ */

// Import models for associations (using dynamic import to avoid circular deps)
import("../jobCreation/jobCreationModel").then((module) => {
  const Job = module.default;
  JobApplication.belongsTo(Job, {
    foreignKey: "jobId",
    as: "job",
  });
});

import("../worker/workerModel").then((module) => {
  const { Worker } = module;
  JobApplication.belongsTo(Worker, {
    foreignKey: "workerId",
    as: "worker",
  });
});

export default JobApplication;
