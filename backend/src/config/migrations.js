import pool from './database.js';
import bcrypt from 'bcrypt';

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');
    
    // Create ENUM types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('Admin', 'QA', 'Developer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_status AS ENUM ('Active', 'Inactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE project_status AS ENUM ('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE issue_type AS ENUM ('Bug', 'Enhancement', 'Correction');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE issue_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE issue_status AS ENUM ('Open', 'In Progress', 'Fixed', 'Closed', 'Reopen');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'Developer',
        department VARCHAR(100),
        phone VARCHAR(20),
        status user_status NOT NULL DEFAULT 'Active',
        avatar TEXT,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');
    
    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        client_name VARCHAR(255),
        start_date DATE,
        end_date DATE,
        status project_status NOT NULL DEFAULT 'Planning',
        progress INTEGER DEFAULT 0,
        created_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Projects table created');
    
    // Create project_members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );
    `);
    console.log('✅ Project members table created');
    
    // Create issues table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id VARCHAR(50) PRIMARY KEY,
        bug_id VARCHAR(50) UNIQUE NOT NULL,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        module_name VARCHAR(255) NOT NULL,
        type issue_type NOT NULL,
        severity issue_severity NOT NULL,
        status issue_status NOT NULL DEFAULT 'Open',
        description TEXT NOT NULL,
        assigned_to VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        reported_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        screenshots TEXT[],
        related_links JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Issues table created');
    
    // Create activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Activities table created');
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id);');
    console.log('✅ Indexes created');
    
    // Create default admin user (password: admin123)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (id, name, email, password, role, status, avatar)
      VALUES (
        'user-admin-001',
        'Admin User',
        'admin@example.com',
        $1,
        'Admin',
        'Active',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
      )
      ON CONFLICT (email) DO UPDATE SET password = $1;
    `, [hashedPassword]);
    console.log('✅ Default admin user created (email: admin@example.com, password: admin123)');
    
    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migrations
createTables()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  });
