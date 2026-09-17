/**
 * Fix jobs table - Remove and recreate the companyId foreign key constraint
 * 
 * Run this script to fix the database schema issue:
 * node scripts/fix-jobs-table.mjs
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
});

async function fixJobsTable() {
  try {
    console.log('🔧 Fixing jobs table...');

    // Drop the existing foreign key constraint if it exists
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name LIKE '%jobs_companyId_fkey%' 
          AND table_name = 'jobs'
        ) THEN
          ALTER TABLE jobs DROP CONSTRAINT jobs_companyId_fkey;
        END IF;
      END $$;
    `);
    console.log('✅ Dropped old foreign key constraint (if existed)');

    // Ensure companyId column exists and is UUID type
    await sequelize.query(`
      ALTER TABLE jobs 
      ALTER COLUMN "companyId" TYPE UUID USING "companyId"::UUID,
      ALTER COLUMN "companyId" DROP NOT NULL,
      ALTER COLUMN "companyId" DROP DEFAULT;
    `);
    console.log('✅ Updated companyId column type and constraints');

    // Add the foreign key constraint properly
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'jobs_companyId_fkey' 
          AND table_name = 'jobs'
        ) THEN
          ALTER TABLE jobs 
          ADD CONSTRAINT jobs_companyId_fkey 
          FOREIGN KEY ("companyId") 
          REFERENCES companies(id) 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✅ Added foreign key constraint');

    console.log('✨ Jobs table fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing jobs table:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixJobsTable();
