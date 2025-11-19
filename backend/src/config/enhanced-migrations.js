import pool from './database.js';

const enhanceDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting enhanced database migration...');
    
    // Create ENUM types for new features
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE issue_priority AS ENUM ('P0', 'P1', 'P2', 'P3', 'P4');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE sprint_status AS ENUM ('Planning', 'Active', 'Completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE epic_status AS ENUM ('Open', 'In Progress', 'Done', 'Cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('✅ ENUMs created');
    
    // Add new columns to issues table
    await client.query(`
      ALTER TABLE issues
      ADD COLUMN IF NOT EXISTS priority issue_priority DEFAULT 'P2',
      ADD COLUMN IF NOT EXISTS labels TEXT[],
      ADD COLUMN IF NOT EXISTS epic_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS sprint_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS story_points INTEGER,
      ADD COLUMN IF NOT EXISTS time_estimate INTEGER, -- in minutes
      ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0, -- in minutes
      ADD COLUMN IF NOT EXISTS due_date DATE,
      ADD COLUMN IF NOT EXISTS resolution TEXT,
      ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✅ Issues table enhanced');
    
    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(50) PRIMARY KEY,
        issue_id VARCHAR(50) REFERENCES issues(id) ON DELETE CASCADE,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Comments table created');
    
    // Create issue_watchers junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issue_watchers (
        id SERIAL PRIMARY KEY,
        issue_id VARCHAR(50) REFERENCES issues(id) ON DELETE CASCADE,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(issue_id, user_id)
      );
    `);
    console.log('✅ Issue watchers table created');
    
    // Create sprints table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sprints (
        id VARCHAR(50) PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        goal TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status sprint_status NOT NULL DEFAULT 'Planning',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Sprints table created');
    
    // Create epics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS epics (
        id VARCHAR(50) PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status epic_status NOT NULL DEFAULT 'Open',
        color VARCHAR(7) DEFAULT '#3b82f6',
        start_date DATE,
        target_date DATE,
        created_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Epics table created');
    
    // Create saved_filters table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_filters (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        filter_query JSONB NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Saved filters table created');
    
    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        related_id VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Notifications table created');
    
    // Create time_logs table for detailed time tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_logs (
        id VARCHAR(50) PRIMARY KEY,
        issue_id VARCHAR(50) REFERENCES issues(id) ON DELETE CASCADE,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        time_spent INTEGER NOT NULL, -- in minutes
        work_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Time logs table created');
    
    // Add foreign key constraint for epic_id
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE issues
        ADD CONSTRAINT fk_issues_epic
        FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Add foreign key constraint for sprint_id
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE issues
        ADD CONSTRAINT fk_issues_sprint
        FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('✅ Foreign key constraints added');
    
    // Create indexes for performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_watchers_issue ON issue_watchers(issue_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_watchers_user ON issue_watchers(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_epics_project ON epics(project_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_issues_epic ON issues(epic_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_time_logs_issue ON time_logs(issue_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON saved_filters(user_id);');
    
    console.log('✅ Indexes created');
    
    console.log('🎉 Enhanced database migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during enhanced migration:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migrations
enhanceDatabase()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run enhanced migrations:', error);
    process.exit(1);
  });
