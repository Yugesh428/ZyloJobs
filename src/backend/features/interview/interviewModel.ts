/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * Interview — scheduled interview for a shortlisted candidate.
 *
 * Rules:
 *   - Linked to a JobApplication (which links to job + worker).
 *   - Multiple rounds supported via `round` field (1, 2, 3...).
 *   - type = in-person → use `location` (physical address).
 *   - type = phone | video → use `meetingLink`.
 *   - Both location and meetingLink can be set (e.g. hybrid fallback).
 *   - status tracks the interview lifecycle.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type InterviewType =
  | "in-person"
  | "phone"
  | "video";

export type InterviewStatus =
  | "scheduled"   // created, awaiting confirmation
  | "confirmed"   // worker acknowledged
  | "completed"   // interview happened
  | "cancelled"   // called off
  | "no-show";    // worker didn't show up

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface InterviewAttributes {
  id: string;
  applicationId: string;      // FK → job_applications.id
  workerId: string;           // FK → workers.id      (denormalised for easy querying)
  jobId: string;              // FK → jobs.id          (denormalised for easy querying)
  round: number;              // 1 = first, 2 = second, etc.
  type: InterviewType;
  scheduledAt: Date;          // when the interview is set
  durationMinutes: number;    // expected duration e.g. 30, 60
  location: string | null;    // physical address (in-person)
  meetingLink: string | null; // video/phone call link
  notes: string | null;       // admin internal notes
  feedback: string | null;    // post-interview feedback
  status: InterviewStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InterviewCreationAttributes
  extends Optional<
    InterviewAttributes,
    | "id"
    | "round"
    | "durationMinutes"
    | "location"
    | "meetingLink"
    | "notes"
    | "feedback"
    | "status"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export class Interview
  extends Model<InterviewAttributes, InterviewCreationAttributes>
  implements InterviewAttributes
{
  declare id: string;
  declare applicationId: string;
  declare workerId: string;
  declare jobId: string;
  declare round: number;
  declare type: InterviewType;
  declare scheduledAt: Date;
  declare durationMinutes: number;
  declare location: string | null;
  declare meetingLink: string | null;
  declare notes: string | null;
  declare feedback: string | null;
  declare status: InterviewStatus;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

Interview.init(
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
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "workers", key: "id" },
      onDelete: "CASCADE",
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "jobs", key: "id" },
      onDelete: "CASCADE",
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    type: {
      type: DataTypes.ENUM("in-person", "phone", "video"),
      allowNull: false,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: { min: 5 },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("scheduled", "confirmed", "completed", "cancelled", "no-show"),
      allowNull: false,
      defaultValue: "scheduled",
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
    modelName: "Interview",
    tableName: "interviews",
    timestamps: true,
    indexes: [
      { fields: ["applicationId"], name: "idx_interview_application_id" },
      { fields: ["workerId"],      name: "idx_interview_worker_id"      },
      { fields: ["jobId"],         name: "idx_interview_job_id"         },
      { fields: ["status"],        name: "idx_interview_status"         },
      { fields: ["scheduledAt"],   name: "idx_interview_scheduled_at"   },
      // Prevent duplicate round for same application
      {
        unique: true,
        fields: ["applicationId", "round"],
        name: "uq_interview_application_round",
      },
    ],
  },
);

export default Interview;
