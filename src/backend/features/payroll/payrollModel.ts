/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "@/lib/db";

/**
 * Payroll — tracks payments from companies to Zylo and from Zylo to workers.
 *
 * Flow:
 *   1. Admin creates payroll record for a billing period (month/week).
 *   2. Company pays Zylo (companyPaymentStatus).
 *   3. After company payment confirmed, Zylo pays worker (workerPaymentStatus).
 *
 * Rules:
 *   - One payroll record per worker per period.
 *   - grossSalary = base salary from onboarding.
 *   - overtimeAmount = calculated from attendance overtime.
 *   - deductions = any penalties or adjustments.
 *   - netAmount = grossSalary + overtimeAmount - deductions.
 *   - companyChargeAmount = what company pays Zylo (netAmount + service fee).
 *   - companyPaymentMethod: bank | esewa | khalti (for future integration).
 *   - workerPaymentMethod: bank | esewa | khalti (from WorkerPaymentMethod).
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type PayrollPeriod = "monthly" | "weekly" | "daily";

export type PaymentStatus = 
  | "pending"       // created, awaiting payment
  | "processing"    // payment initiated
  | "completed"     // payment confirmed
  | "failed"        // payment failed
  | "cancelled";    // cancelled by admin

export type PaymentMethodType = "bank" | "esewa" | "khalti";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface PayrollAttributes {
  id: string;
  onboardingId: string;           // FK → onboardings.id
  workerId: string;               // FK → workers.id (denormalised)
  companyId: string;              // FK → companies.id (denormalised)
  
  // Period
  period: PayrollPeriod;
  periodStartDate: string;        // DATEONLY "YYYY-MM-DD"
  periodEndDate: string;          // DATEONLY "YYYY-MM-DD"
  
  // Worker Salary Calculation
  grossSalary: number;            // INTEGER NPR (from onboarding)
  overtimeAmount: number;         // INTEGER NPR (calculated from attendance)
  bonusAmount: number;            // INTEGER NPR (optional bonus)
  deductions: number;             // INTEGER NPR (penalties, adjustments)
  netAmount: number;              // INTEGER NPR (gross + overtime + bonus - deductions)
  
  // Company Payment (Company → Zylo)
  companyChargeAmount: number;    // INTEGER NPR (netAmount + Zylo service fee)
  companyServiceFeePercent: number; // e.g. 10 for 10%
  companyPaymentMethod: PaymentMethodType;
  companyPaymentStatus: PaymentStatus;
  companyPaymentDate: Date | null;
  companyTransactionId: string | null;
  
  // Worker Payment (Zylo → Worker)
  workerPaymentMethod: PaymentMethodType;
  workerPaymentStatus: PaymentStatus;
  workerPaymentDate: Date | null;
  workerTransactionId: string | null;
  
  // Additional Info
  notes: string | null;           // admin notes
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollCreationAttributes
  extends Optional<
    PayrollAttributes,
    | "id"
    | "overtimeAmount"
    | "bonusAmount"
    | "deductions"
    | "companyServiceFeePercent"
    | "companyPaymentStatus"
    | "companyPaymentDate"
    | "companyTransactionId"
    | "workerPaymentStatus"
    | "workerPaymentDate"
    | "workerTransactionId"
    | "notes"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export class Payroll
  extends Model<PayrollAttributes, PayrollCreationAttributes>
  implements PayrollAttributes
{
  declare id: string;
  declare onboardingId: string;
  declare workerId: string;
  declare companyId: string;
  
  declare period: PayrollPeriod;
  declare periodStartDate: string;
  declare periodEndDate: string;
  
  declare grossSalary: number;
  declare overtimeAmount: number;
  declare bonusAmount: number;
  declare deductions: number;
  declare netAmount: number;
  
  declare companyChargeAmount: number;
  declare companyServiceFeePercent: number;
  declare companyPaymentMethod: PaymentMethodType;
  declare companyPaymentStatus: PaymentStatus;
  declare companyPaymentDate: Date | null;
  declare companyTransactionId: string | null;
  
  declare workerPaymentMethod: PaymentMethodType;
  declare workerPaymentStatus: PaymentStatus;
  declare workerPaymentDate: Date | null;
  declare workerTransactionId: string | null;
  
  declare notes: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

Payroll.init(
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
    
    // Period
    period: {
      type: DataTypes.ENUM("monthly", "weekly", "daily"),
      allowNull: false,
      defaultValue: "monthly",
    },
    periodStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    periodEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    
    // Worker Salary
    grossSalary: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    overtimeAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    bonusAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    deductions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    netAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    
    // Company Payment
    companyChargeAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    companyServiceFeePercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10.00,
      validate: { min: 0, max: 100 },
    },
    companyPaymentMethod: {
      type: DataTypes.ENUM("bank", "esewa", "khalti"),
      allowNull: false,
      defaultValue: "bank",
    },
    companyPaymentStatus: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    companyPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    companyTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    
    // Worker Payment
    workerPaymentMethod: {
      type: DataTypes.ENUM("bank", "esewa", "khalti"),
      allowNull: false,
      defaultValue: "bank",
    },
    workerPaymentStatus: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    workerPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    workerTransactionId: {
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
    modelName: "Payroll",
    tableName: "payrolls",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["onboardingId", "periodStartDate", "periodEndDate"],
        name: "uq_payroll_onboarding_period",
      },
      { fields: ["workerId"],              name: "idx_payroll_worker" },
      { fields: ["companyId"],             name: "idx_payroll_company" },
      { fields: ["period"],                name: "idx_payroll_period" },
      { fields: ["companyPaymentStatus"],  name: "idx_payroll_company_payment_status" },
      { fields: ["workerPaymentStatus"],   name: "idx_payroll_worker_payment_status" },
      { fields: ["periodStartDate"],       name: "idx_payroll_start_date" },
      { fields: ["periodEndDate"],         name: "idx_payroll_end_date" },
    ],
  },
);

export default Payroll;
