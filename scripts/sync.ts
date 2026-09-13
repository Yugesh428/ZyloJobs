/**
 * Database sync script
 * Run with: npm run db:sync
 * 
 * This script imports all models and synchronizes them with the database.
 * Uses { alter: true } to update existing tables without data loss.
 */

import { sequelize } from "../src/lib/db";

// Import all models to register them with Sequelize
import "../src/backend/features/companyCreation/companyModel";
import "../src/backend/features/worker/workerModel";
import "../src/backend/features/jobCategoryCreation/jobCategoryCreationModel";
import "../src/backend/features/jobCreation/jobCreationModel";
import "../src/backend/features/jobApplication/jobApplicationModel";
import "../src/backend/features/interview/interviewModel";
import "../src/backend/features/onBoarding/onBoardingModel";
import "../src/backend/features/attendance/attendanceModel";
import "../src/backend/features/paymentMethod/paymentMethodModel";
import "../src/backend/features/workerComplaint/workerComplaintModel";
import "../src/backend/features/companyComplaint/companyComplaintModel";
import "../src/backend/features/workerSupport/workerSupportTicketModel";
import "../src/backend/features/companySupport/companySupportModel";
import "../src/backend/features/Announcement/announcementModel";
import "../src/backend/features/workerRequest/workerRequestModel";

async function syncDatabase() {
  try {
    console.log("🔗 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully\n");

    console.log("🔄 Synchronizing all models with database...\n");

    // Sync all models with alter: true to update existing tables
    await sequelize.sync({ alter: true });

    console.log("\n✅ All models synchronized successfully!");
    console.log("   - Tables created or updated");
    console.log("   - Columns added/modified as needed");
    console.log("   - Existing data preserved\n");

    // List all registered models
    const models = Object.keys(sequelize.models);
    console.log(`📋 Registered models (${models.length}):`);
    models.forEach((model) => console.log(`   - ${model}`));
    console.log("");

    await sequelize.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    process.exit(1);
  }
}

syncDatabase();
