// Labels and Issue Types management tables
import pool from './database.js';

const labelsMigrations = [
  // Create labels table
  `CREATE TABLE IF NOT EXISTS labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Create issue_types table
  `CREATE TABLE IF NOT EXISTS issue_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT 'task_alt',
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Create junction table for issue labels (many-to-many relationship)
  `CREATE TABLE IF NOT EXISTS issue_labels (
    id SERIAL PRIMARY KEY,
    issue_id VARCHAR(50) REFERENCES issues(id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(issue_id, label_id)
  )`,
  
  // Insert default labels
  `INSERT INTO labels (name, color, description) VALUES
    ('bug', '#d73a49', 'Something isn''t working'),
    ('enhancement', '#a2eeef', 'New feature or request'),
    ('documentation', '#0075ca', 'Improvements or additions to documentation'),
    ('question', '#cc317c', 'Further information is requested'),
    ('wontfix', '#ffffff', 'This will not be worked on'),
    ('duplicate', '#cfd3d7', 'This issue or pull request already exists'),
    ('good first issue', '#7057ff', 'Good for newcomers'),
    ('help wanted', '#008672', 'Extra attention is needed'),
    ('invalid', '#e4e669', 'This doesn''t seem right'),
    ('priority:high', '#d93f0b', 'High priority issue'),
    ('priority:low', '#0e8a16', 'Low priority issue')
  ON CONFLICT (name) DO NOTHING`,
  
  // Insert default issue types
  `INSERT INTO issue_types (name, icon, description, color) VALUES
    ('Bug', 'bug_report', 'Something isn''t working as expected', '#d73a49'),
    ('Enhancement', 'lightbulb', 'New feature or improvement request', '#a2eeef'),
    ('Correction', 'build', 'Fix or correction to existing functionality', '#0075ca')
  ON CONFLICT (name) DO NOTHING`,
  
  // Add indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_issue_labels_issue_id ON issue_labels(issue_id)`,
  `CREATE INDEX IF NOT EXISTS idx_issue_labels_label_id ON issue_labels(label_id)`,
  `CREATE INDEX IF NOT EXISTS idx_labels_name ON labels(name)`,
  `CREATE INDEX IF NOT EXISTS idx_issue_types_name ON issue_types(name)`,
];

const runLabelsMigrations = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Running labels and issue types migrations...');
    
    for (const migration of labelsMigrations) {
      console.log('Executing migration:', migration.substring(0, 50) + '...');
      await client.query(migration);
    }
    
    console.log('✅ Labels and issue types migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
};

runLabelsMigrations()
  .then(() => {
    console.log('✨ Labels setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run labels migrations:', error);
    process.exit(1);
  });