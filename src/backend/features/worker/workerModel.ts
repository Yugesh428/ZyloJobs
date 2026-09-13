/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * Worker — customers who can directly register and login to find work.
 *
 * Rules:
 *   - email is unique, required
 *   - password is hashed (bcrypt), never returned in responses
 *   - status: active | inactive | suspended
 *   - availability: available | employed | not_looking
 *   - Workers self-register and are immediately active (no approval needed)
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type WorkerStatus = "active" | "inactive" | "suspended";
export type AvailabilityStatus = "available" | "employed" | "not_looking";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface WorkerAttributes {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  jobCategory: string;
  skills: string[] | null;
  experienceYears: number | null;
  bio: string | null;
  resumeUrl: string | null;
  avatarUrl: string | null;
  status: WorkerStatus;
  availability: AvailabilityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkerCreationAttributes
  extends Optional<
    WorkerAttributes,
    | "id"
    | "skills"
    | "experienceYears"
    | "bio"
    | "resumeUrl"
    | "avatarUrl"
    | "status"
    | "availability"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export class Worker
  extends Model<WorkerAttributes, WorkerCreationAttributes>
  implements WorkerAttributes
{
  declare id: string;
  declare fullName: string;
  declare email: string;
  declare password: string;
  declare phone: string;
  declare location: string;
  declare jobCategory: string;
  declare skills: string[] | null;
  declare experienceYears: number | null;
  declare bio: string | null;
  declare resumeUrl: string | null;
  declare avatarUrl: string | null;
  declare status: WorkerStatus;
  declare availability: AvailabilityStatus;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  /**
   * toSafeJSON — exclude password from response
   */
  toSafeJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = this.toJSON();
    return safe;
  }
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

Worker.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    jobCategory: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: null,
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: { min: 0 },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      allowNull: false,
      defaultValue: "active",
    },
    availability: {
      type: DataTypes.ENUM("available", "employed", "not_looking"),
      allowNull: false,
      defaultValue: "available",
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
    modelName: "Worker",
    tableName: "workers",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
        name: "uq_worker_email",
      },
      { fields: ["status"],       name: "idx_worker_status" },
      { fields: ["availability"], name: "idx_worker_availability" },
      { fields: ["jobCategory"],  name: "idx_worker_job_category" },
      { fields: ["location"],     name: "idx_worker_location" },
    ],
  },
);
