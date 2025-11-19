import pool from './database.js';

async function updateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating database schema...');
    
    // Add last_active column to users table if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'last_active'
        ) THEN
          ALTER TABLE users ADD COLUMN last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          RAISE NOTICE 'Added last_active column to users table';
        END IF;
      END $$;
    `);
    
    console.log('✅ Database schema updated successfully');
    
    // Update existing users to have last_active value
    await client.query(`
      UPDATE users 
      SET last_active = COALESCE(last_active, created_at, CURRENT_TIMESTAMP)
      WHERE last_active IS NULL
    `);
    
    console.log('✅ Updated existing users with last_active timestamps');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateDatabase();
