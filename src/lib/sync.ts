/**
 * syncDB — registers all models, defines associations, then syncs to the DB.
 * Call once at startup. Safe to call multiple times (singleton guard).
 */
import { sequelize } from "@/lib/db";

// ── Register models (import order: parent before child) ───────────────────────
import "@/lib/models/Admin";
import { Company }       from "@/backend/features/companyCreation/companyModel";
import { WorkerRequest } from "@/backend/features/workerRequest/workerRequestModel";
import { Worker }        from "@/backend/features/worker/workerModel";

// ── Singleton guard ───────────────────────────────────────────────────────────
let synced = false;
let associationsDefined = false;

export async function syncDB(): Promise<void> {
  if (synced) return;

  try {
    await sequelize.authenticate();
    console.log("✅ DB authenticated");

    // ── Associations (only define once) ──────────────────────────────────────
    if (!associationsDefined) {
      // Company ──< WorkerRequest  (one company → many requests)
      Company.hasMany(WorkerRequest, {
        foreignKey: "companyId",
        as: "workerRequests",
        onDelete: "CASCADE",
      });
      WorkerRequest.belongsTo(Company, {
        foreignKey: "companyId",
        as: "company",
      });

      associationsDefined = true;
      console.log("✅ Associations defined");
    }

    // Use force: false for production, alter: true can cause issues with FK constraints
    // For development with schema changes, consider using migrations instead
    await sequelize.sync({ alter: false });
    console.log("✅ All models synced");

    synced = true;
  } catch (err) {
    console.error("❌ syncDB failed:", err);
    throw err;
  }
}
