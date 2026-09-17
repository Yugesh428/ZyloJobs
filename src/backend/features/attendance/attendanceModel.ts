/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * Attendance — daily clock-in / clock-out record for an active worker.
 *
 * Design principles:
 *   - One record per worker per workDate (unique: workerId + workDate).
 *   - clockIn and clockOut are stored as full timestamps.
 *   - workedMinutes is computed on clockOut and stored for fast reporting.
 *   - overtimeMinutes = max(0, workedMinutes - scheduledMinutes).
 *   - status reflects the day outcome, not the punch state.
 *   - leaveType is only set when status = "leave".
 *   - adminNote allows corrections / override context.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type AttendanceStatus =
  | "present"      // clocked in and out normally
  | "absent"       // no clock-in, no approved leave
  | "half_day"     // worked < 50% of scheduled hours
  | "leave"        // approved leave (see leaveType)
  | "holiday"      // public / company holiday
  | "late"         // clocked in but arrived late
  | "early_leave"; // clocked out before scheduled end

export type LeaveType =
  | "annual"
  | "sick"
  | "unpaid"
  | "maternity"
  | "paternity"
  | "other";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface AttendanceAttributes {
  id: string;
  onboardingId: string;          // FK → onboardings.id
  workerId: string;              // FK → workers.id  (denormalised)
  companyId: string;             // FK → companies.id (denormalised)
  workDate: string;              // DATEONLY "YYYY-MM-DD"
  clockIn: Date | null;          // actual clock-in timestamp
  clockOut: Date | null;         // actual clock-out timestamp
  workedMinutes: number | null;  // computed on clockOut
  overtimeMinutes: number | null;// max(0, worked - scheduled)
  scheduledMinutes: number;      // e.g. 480 for 8h shift
  status: AttendanceStatus;
  leaveType: LeaveType | null;   // only when status = "leave"
  adminNote: string | null;      // admin correction note
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceCreationAttributes
  extends Optional<
    AttendanceAttributes,
    | "id"
    | "clockIn"
    | "clockOut"
    | "workedMinutes"
    | "overtimeMinutes"
    | "leaveType"
    | "adminNote"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export class Attendance
  extends Model<AttendanceAttributes, AttendanceCreationAttributes>
  implements AttendanceAttributes
{
  declare id: string;
  declare onboardingId: string;
  declare workerId: string;
  declare companyId: string;
  declare workDate: string;
  declare clockIn: Date | null;
  declare clockOut: Date | null;
  declare workedMinutes: number | null;
  declare overtimeMinutes: number | null;
  declare scheduledMinutes: number;
  declare status: AttendanceStatus;
  declare leaveType: LeaveType | null;
  declare adminNote: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

Attendance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    onboardingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "onboardings", key: "id" },
      onDelete: "CASCADE",
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "workers", key: "id" },
      onDelete: "CASCADE",
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "companies", key: "id" },
      onDelete: "CASCADE",
    },
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clockIn: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    workedMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: { min: 0 },
    },
    overtimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      validate: { min: 0 },
    },
    scheduledMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 480, // 8 hours
      validate: { min: 1 },
    },
    status: {
      type: DataTypes.ENUM(
        "present",
        "absent",
        "half_day",
        "leave",
        "holiday",
        "late",
        "early_leave",
      ),
      allowNull: false,
      defaultValue: "absent",
    },
    leaveType: {
      type: DataTypes.ENUM(
        "annual",
        "sick",
        "unpaid",
        "maternity",
        "paternity",
        "other",
      ),
      allowNull: true,
      defaultValue: null,
    },
    adminNote: {
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
    modelName: "Attendance",
    tableName: "attendances",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["workerId", "workDate"],
        name: "uq_attendance_worker_date",
      },
      { fields: ["onboardingId"], name: "idx_attendance_onboarding" },
      { fields: ["workerId"],     name: "idx_attendance_worker"     },
      { fields: ["companyId"],    name: "idx_attendance_company"    },
      { fields: ["workDate"],     name: "idx_attendance_date"       },
      { fields: ["status"],       name: "idx_attendance_status"     },
    ],
  },
);

export default Attendance;

/* ------------------------------------------------------------------ */
/* Associations                                                        */
/* ------------------------------------------------------------------ */

import { Worker } from "../worker/workerModel";
import { Company } from "../companyCreation/companyModel";
import Onboarding from "../onBoarding/onBoardingModel";

Attendance.belongsTo(Worker, {
  foreignKey: "workerId",
  as: "worker",
});

Attendance.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
});

Attendance.belongsTo(Onboarding, {
  foreignKey: "onboardingId",
  as: "onboarding",
});
