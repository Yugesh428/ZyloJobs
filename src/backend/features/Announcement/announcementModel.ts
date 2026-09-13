/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * Announcement — a platform-wide message shown to workers and/or companies.
 *
 * Rules:
 *   - type: info | warning | alert | update.
 *   - audience: all | workers | companies.
 *   - isPublished: false = draft, true = visible (default false).
 *   - publishedAt is auto-set when isPublished flips to true.
 *   - expiresAt: after this date the announcement is no longer shown.
 *   - createdBy is the admin name / ID who created it.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type AnnouncementType = "info" | "warning" | "alert" | "update";

export type AnnouncementAudience = "all" | "workers" | "companies";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface AnnouncementAttributes {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  audience: AnnouncementAudience;
  isPublished: boolean;
  publishedAt: Date | null;
  expiresAt: string | null;          // DATEONLY stored as "YYYY-MM-DD" string
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnnouncementCreationAttributes
  extends Optional<
    AnnouncementAttributes,
    | "id"
    | "isPublished"
    | "publishedAt"
    | "expiresAt"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

class Announcement
  extends Model<AnnouncementAttributes, AnnouncementCreationAttributes>
  implements AnnouncementAttributes
{
  declare id: string;
  declare title: string;
  declare body: string;
  declare type: AnnouncementType;
  declare audience: AnnouncementAudience;
  declare isPublished: boolean;
  declare publishedAt: Date | null;
  declare expiresAt: string | null;
  declare createdBy: string;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

Announcement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    type: {
      type: DataTypes.ENUM("info", "warning", "alert", "update"),
      allowNull: false,
      defaultValue: "info",
    },
    audience: {
      type: DataTypes.ENUM("all", "workers", "companies"),
      allowNull: false,
      defaultValue: "all",
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    expiresAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
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
    modelName: "Announcement",
    tableName: "announcements",
    timestamps: true,
    indexes: [
      { fields: ["type"],        name: "idx_announcement_type" },
      { fields: ["audience"],    name: "idx_announcement_audience" },
      { fields: ["isPublished"], name: "idx_announcement_published" },
      { fields: ["expiresAt"],   name: "idx_announcement_expires" },
      { fields: ["publishedAt"], name: "idx_announcement_published_at" },
    ],
  },
);

export default Announcement;