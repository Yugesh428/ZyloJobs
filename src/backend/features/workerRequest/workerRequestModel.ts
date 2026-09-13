/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type ExperienceRequired = "Fresher" | "1-2 years" | "3-5 years" | "5+ years";
export type WorkType           = "On-site" | "Remote" | "Hybrid";
export type RequestStatus      = "pending" | "processing" | "fulfilled" | "cancelled";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface WorkerRequestAttributes {
  id: string;
  companyId: string;                // FK → companies.id
  department: string;
  numberOfWorkers: number;
  jobRole: string;
  requiredSkills: string[] | null;
  experienceRequired: ExperienceRequired;
  jobLocation: string;
  workType: WorkType;
  workingHours: string;
  responsibilities: string | null;
  status: RequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkerRequestCreationAttributes
  extends Optional<
    WorkerRequestAttributes,
    "id" | "requiredSkills" | "responsibilities" | "status" | "createdAt" | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export class WorkerRequest
  extends Model<WorkerRequestAttributes, WorkerRequestCreationAttributes>
  implements WorkerRequestAttributes
{
  declare id: string;
  declare companyId: string;
  declare department: string;
  declare numberOfWorkers: number;
  declare jobRole: string;
  declare requiredSkills: string[] | null;
  declare experienceRequired: ExperienceRequired;
  declare jobLocation: string;
  declare workType: WorkType;
  declare workingHours: string;
  declare responsibilities: string | null;
  declare status: RequestStatus;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

WorkerRequest.init(
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
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberOfWorkers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    jobRole: {
      type: DataTypes.STRING,
      allowNull: false,
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
    },
    workType: {
      type: DataTypes.ENUM("On-site", "Remote", "Hybrid"),
      allowNull: false,
      defaultValue: "On-site",
    },
    workingHours: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: "WorkerRequest",
    tableName: "worker_requests",
    timestamps: true,
    indexes: [
      { fields: ["companyId"],          name: "idx_wr_company_id"   },
      { fields: ["department"],         name: "idx_wr_department"   },
      { fields: ["experienceRequired"], name: "idx_wr_experience"   },
      { fields: ["workType"],           name: "idx_wr_work_type"    },
      { fields: ["status"],             name: "idx_wr_status"       },
    ],
  },
);

export default WorkerRequest;
