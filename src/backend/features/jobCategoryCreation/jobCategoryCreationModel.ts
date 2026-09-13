/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * JobCategory — a classification for job roles (e.g. IT, Security, Hospitality).
 *
 * Rules:
 *   - name is required and unique.
 *   - code is a unique internal identifier (used for lookups/reference).
 *   - isActive controls whether the category is selectable in new requests.
 */

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface JobCategoryAttributes {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobCategoryCreationAttributes extends Optional<
  JobCategoryAttributes,
  "id" | "description" | "isActive" | "createdAt" | "updatedAt"
> {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

class JobCategory
  extends Model<JobCategoryAttributes, JobCategoryCreationAttributes>
  implements JobCategoryAttributes
{
  declare id: string;
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare isActive: boolean;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

JobCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: "JobCategory",
    tableName: "job_categories",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name"],
        name: "uq_job_category_name",
      },
      {
        unique: true,
        fields: ["code"],
        name: "uq_job_category_code",
      },
      { fields: ["isActive"], name: "idx_job_category_active" },
    ],
  },
);

export default JobCategory;
