import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'qa_bugtracking',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function createLabelsAndTypesTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating labels and issue_types tables...');

    // Create labels table
    await client.query(`
      CREATE TABLE IF NOT EXISTS labels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3b82f6',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create issue_types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issue_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50) DEFAULT 'bug_report',
        color VARCHAR(7) DEFAULT '#ef4444',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default labels
    await client.query(`
      INSERT INTO labels (name, color, description) VALUES 
      ('bug', '#ef4444', 'Something is not working'),
      ('enhancement', '#10b981', 'New feature or request'),
      ('documentation', '#3b82f6', 'Improvements or additions to documentation'),
      ('duplicate', '#6b7280', 'This issue or pull request already exists'),
      ('good first issue', '#7c3aed', 'Good for newcomers'),
      ('help wanted', '#f59e0b', 'Extra attention is needed'),
      ('invalid', '#ef4444', 'This does not seem right'),
      ('question', '#ec4899', 'Further information is requested'),
      ('wontfix', '#374151', 'This will not be worked on')
      ON CONFLICT (name) DO NOTHING
    `);

    // Insert default issue types
    await client.query(`
      INSERT INTO issue_types (name, icon, color, description) VALUES 
      ('Bug', 'bug_report', '#ef4444', 'Something is not working properly'),
      ('Enhancement', 'lightbulb', '#10b981', 'New feature or improvement'),
      ('Correction', 'build', '#f59e0b', 'Fix or correction needed'),
      ('Task', 'task_alt', '#3b82f6', 'General task or work item'),
      ('Documentation', 'description', '#8b5cf6', 'Documentation related work')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('✅ Labels and issue_types tables created successfully');
    console.log('✅ Default data inserted successfully');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
createLabelsAndTypesTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });