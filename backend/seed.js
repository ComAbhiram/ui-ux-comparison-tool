import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'ui_ux_comparison',
  password: '',
  port: 5432,
});

async function seedData() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding sample data...');

    // Create a test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    await client.query(
      `INSERT INTO users (name, email, password, role, last_active) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       ON CONFLICT (email) DO NOTHING`,
      ['John Developer', 'john@example.com', hashedPassword, 'Developer']
    );

    // Get user IDs
    const adminResult = await client.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    const johnResult = await client.query('SELECT id FROM users WHERE email = $1', ['john@example.com']);
    
    if (!adminResult.rows[0]) {
      console.log('❌ Admin user not found. Please run migrations first.');
      return;
    }
    
    const adminId = adminResult.rows[0].id;
    const johnId = johnResult.rows[0] ? johnResult.rows[0].id : adminId;

    // Create sample projects
    const project1 = await client.query(
      `INSERT INTO projects (name, description, start_date, end_date, status, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['E-commerce Website Redesign', 'Complete UI/UX overhaul of the main e-commerce platform', '2025-01-15', '2025-03-30', 'In Progress', adminId]
    );

    const project2 = await client.query(
      `INSERT INTO projects (name, description, start_date, end_date, status, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Mobile App UI Update', 'Modernize mobile application interface', '2025-02-01', '2025-04-15', 'In Progress', adminId]
    );

    const project3 = await client.query(
      `INSERT INTO projects (name, description, start_date, end_date, status, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Dashboard Analytics Tool', 'Create new analytics dashboard', '2024-12-01', '2025-01-31', 'Completed', adminId]
    );

    if (project1.rows[0]) {
      // Add project members
      await client.query(
        `INSERT INTO project_members (project_id, user_id) 
         VALUES ($1, $2), ($1, $3) 
         ON CONFLICT DO NOTHING`,
        [project1.rows[0].id, adminId, johnId]
      );

      // Create sample issues
      await client.query(
        `INSERT INTO issues (project_id, bug_id, module_name, description, severity, status, assigned_to, reported_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [project1.rows[0].id, 'BUG-001', 'Shopping Cart', 'Cart total not updating correctly', 'High', 'Open', johnId, adminId]
      );

      await client.query(
        `INSERT INTO issues (project_id, bug_id, module_name, description, severity, status, assigned_to, reported_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [project1.rows[0].id, 'BUG-002', 'Checkout', 'Payment gateway timeout', 'Critical', 'In Progress', johnId, adminId]
      );
    }

    if (project2.rows[0]) {
      await client.query(
        `INSERT INTO project_members (project_id, user_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [project2.rows[0].id, johnId]
      );

      await client.query(
        `INSERT INTO issues (project_id, bug_id, module_name, description, severity, status, assigned_to, reported_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [project2.rows[0].id, 'BUG-003', 'User Profile', 'Profile image not displaying', 'Medium', 'Open', johnId, adminId]
      );
    }

    console.log('✅ Sample data created successfully!');
    console.log('   Projects: 3 (2 active, 1 completed)');
    console.log('   Users: 2 (admin + john)');
    console.log('   Issues: 3');
    console.log('\n📊 Refresh your browser to see the data!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();
