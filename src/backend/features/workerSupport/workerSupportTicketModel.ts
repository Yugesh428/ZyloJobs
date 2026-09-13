/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";
import { Worker } from "../worker/workerModel";

/**
 * SupportTicket — a support request submitted by a worker.
 *
 * Rules:
 *   - Every ticket belongs to a worker (workerId FK, always required).
 *   - Workers are the primary submitters.
 *   - category: account | job | onboarding | attendance
 *               | payment | technical | other.
 *   - priority: low | medium | high | urgent (default medium).
 *   - status lifecycle: open → in_progress → resolved | closed.
 *   - resolvedAt is auto-set when status becomes resolved / closed.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export type SupportTicketCategory =
  | "account"
  | "job"
  | "onboarding"
  | "attendance"
  | "payment"
  | "technical"
  | "other";

export type SupportTicketPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

export interface SupportTicketAttributes {
  id: string;
  workerId: string;                // submitter — always a worker
  subject: string;
  message: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedTo: string | null;       // admin name handling the ticket
  adminReply: string | null;
  resolvedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupportTicketCreationAttributes
  extends Optional<
    SupportTicketAttributes,
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

class SupportTicket
  extends Model<SupportTicketAttributes, SupportTicketCreationAttributes>
  implements SupportTicketAttributes
{
  declare id: string;
  declare workerId: string;
  declare subject: string;
  declare message: string;
  declare category: SupportTicketCategory;
  declare priority: SupportTicketPriority;
  declare status: SupportTicketStatus;
  declare assignedTo: string | null;
  declare adminReply: string | null;
  declare resolvedAt: Date | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;

  // Association mixin
  declare worker?: Worker;
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

SupportTicket.init(
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
      references: { model: "workers", key: "id" },
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
        "account",
        "job",
        "onboarding",
        "attendance",
        "payment",
        "technical",
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
    modelName: "SupportTicket",
    tableName: "support_tickets",
    timestamps: true,
    indexes: [
      { fields: ["workerId"],   name: "idx_support_ticket_worker" },
      { fields: ["status"],     name: "idx_support_ticket_status" },
      { fields: ["priority"],   name: "idx_support_ticket_priority" },
      { fields: ["category"],   name: "idx_support_ticket_category" },
      { fields: ["assignedTo"], name: "idx_support_ticket_assigned" },
    ],
  },
);

/* ------------------------------------------------------------------ */
/* Associations                                                        */
/* ------------------------------------------------------------------ */

SupportTicket.belongsTo(Worker, { foreignKey: "workerId", as: "worker" });
Worker.hasMany(SupportTicket,   { foreignKey: "workerId", as: "supportTickets" });

export default SupportTicket;