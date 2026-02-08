import { migrate } from 'drizzle-orm/node-postgres/migrator';
import db, { pool } from './connection';

async function runMigrate() {
  try {
    console.log('🔄 Running database migrations...');
    
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('✅ Database migrations completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigrate();
