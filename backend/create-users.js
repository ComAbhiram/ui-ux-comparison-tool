import bcrypt from 'bcrypt';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'db.gybzidbnkccnjcctczwf.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'ComAbhiram@123',
});

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
       ON CONFLICT (email) DO UPDATE SET 
       password = EXCLUDED.password,
       role = EXCLUDED.role
       RETURNING id, name, email, role`,
      ['Admin User', 'admin@example.com', hashedPassword, 'Admin', 'Active']
    );
    
    console.log('✅ Admin user created:', result.rows[0]);
    
    // Also create test user
    const testPassword = await bcrypt.hash('test123', 10);
    const testResult = await pool.query(
      `INSERT INTO users (name, email, password, role, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
       ON CONFLICT (email) DO UPDATE SET 
       password = EXCLUDED.password,
       role = EXCLUDED.role
       RETURNING id, name, email, role`,
      ['Test User', 'test@example.com', testPassword, 'Developer', 'Active']
    );
    
    console.log('✅ Test user created:', testResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();