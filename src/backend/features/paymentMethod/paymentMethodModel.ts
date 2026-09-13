/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * WorkerPaymentMethod — how Zylo pays the worker.
 *
 * Rules:
 *   - One active payment method per worker (unique workerId).
 *   - method: bank | esewa | khalti
 *   - bankName + bankBranch required only when method = "bank".
 *   - isVerified is set by admin before first payout — default false.
 *   - accountNumber is sensitive — never log its value.
 *   - Zylo pays workers directly; company is not involved here.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type PaymentMethodType = "bank" | "esewa" | "khalti";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface WorkerPaymentMethodAttributes {
  id: string;
  workerId: string;              // FK → workers.id  (unique — one per worker)
  method: PaymentMethodType;
  accountName: string;           // full name on the account
  accountNumber: string;         // bank acc / eSewa no / Khalti no
  bankName: string | null;       // required when method = "bank"
  bankBranch: string | null;     // optional extra for bank
  isVerified: boolean;           // admin verifies before first payout
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkerPaymentMethodCreationAttributes
  extends Optional<
    WorkerPaymentMethodAttributes,
    "id" | "bankName" | "bankBranch" | "isVerified" | "createdAt" | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export class WorkerPaymentMethod
  extends Model<WorkerPaymentMethodAttributes, WorkerPaymentMethodCreationAttributes>
  implements WorkerPaymentMethodAttributes
{
  declare id: string;
  declare workerId: string;
  declare method: PaymentMethodType;
  declare accountName: string;
  declare accountNumber: string;
  declare bankName: string | null;
  declare bankBranch: string | null;
  declare isVerified: boolean;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

WorkerPaymentMethod.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,                           // one method per worker
      references: { model: "workers", key: "id" },
      onDelete: "CASCADE",
    },
    method: {
      type: DataTypes.ENUM("bank", "esewa", "khalti"),
      allowNull: false,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    bankBranch: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: "WorkerPaymentMethod",
    tableName: "worker_payment_methods",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["workerId"], name: "uq_payment_method_worker" },
      { fields: ["method"],                 name: "idx_payment_method_type"  },
      { fields: ["isVerified"],             name: "idx_payment_method_verified" },
    ],
  },
);

export default WorkerPaymentMethod;
