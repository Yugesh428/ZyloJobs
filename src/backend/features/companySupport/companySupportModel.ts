/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";
import { Company } from "../companyCreation/companyModel";

/**
 * CompanySupportTicket — a support request submitted by a company.
 *
 * Rules:
 *   - Every ticket belongs to a company (companyId FK, always required).
 *   - Companies are the primary submitters.
 *   - category (company-specific): billing | worker_quality | staffing
 *               | onboarding | platform | account | other.
 *   - priority: low | medium | high | urgent (default medium).
 *   - status lifecycle: open → in_progress → resolved | closed.
 *   - resolvedAt is auto-set when status becomes resolved / closed.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type CompanySupportTicketCategory =
  | "billing"
  | "worker_quality"
  | "staffing"
  | "onboarding"
  | "platform"
  | "account"
  | "other";

export type CompanySupportTicketPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type CompanySupportTicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface CompanySupportTicketAttributes {
  id: string;
  companyId: string;               // submitter — always a company
  subject: string;
  message: string;
  category: CompanySupportTicketCategory;
  priority: CompanySupportTicketPriority;
  status: CompanySupportTicketStatus;
  assignedTo: string | null;       // admin name handling the ticket
  adminReply: string | null;
  resolvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanySupportTicketCreationAttributes
  extends Optional<
    CompanySupportTicketAttributes,
    | "id"
    | "priority"
    | "status"
    | "assignedTo"
    | "adminReply"
    | "resolvedAt"
    | "createdAt"
    | "updatedAt"
  > {}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

class CompanySupportTicket
  extends Model<
    CompanySupportTicketAttributes,
    CompanySupportTicketCreationAttributes
  >
  implements CompanySupportTicketAttributes
{
  declare id: string;
  declare companyId: string;
  declare subject: string;
  declare message: string;
  declare category: CompanySupportTicketCategory;
  declare priority: CompanySupportTicketPriority;
  declare status: CompanySupportTicketStatus;
  declare assignedTo: string | null;
  declare adminReply: string | null;
  declare resolvedAt: Date | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // Association mixin
  declare company?: Company;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

CompanySupportTicket.init(
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
      onUpdate: "CASCADE",
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    category: {
      type: DataTypes.ENUM(
        "billing",
        "worker_quality",
        "staffing",
        "onboarding",
        "platform",
        "account",
        "other",
      ),
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    adminReply: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    resolvedAt: {
      type: DataTypes.DATE,
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
    modelName: "CompanySupportTicket",
    tableName: "company_support_tickets",
    timestamps: true,
    indexes: [
      { fields: ["companyId"],  name: "idx_company_support_ticket_company" },
      { fields: ["status"],     name: "idx_company_support_ticket_status" },
      { fields: ["priority"],   name: "idx_company_support_ticket_priority" },
      { fields: ["category"],   name: "idx_company_support_ticket_category" },
      { fields: ["assignedTo"], name: "idx_company_support_ticket_assigned" },
    ],
  },
);

/* ------------------------------------------------------------------ */
/* Associations                                                        */
/* ------------------------------------------------------------------ */

CompanySupportTicket.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
});
Company.hasMany(CompanySupportTicket, {
  foreignKey: "companyId",
  as: "supportTickets",
});

export default CompanySupportTicket;