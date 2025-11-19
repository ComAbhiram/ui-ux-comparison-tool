-- UI/UX Comparison Tool - Supabase Database Schema
-- Run this SQL in Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('Admin', 'QA', 'Developer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('Active', 'Inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_type AS ENUM ('Bug', 'Enhancement', 'Correction');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_status AS ENUM ('Open', 'In Progress', 'Fixed', 'Closed', 'Reopen');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'user-' || generate_random_uuid(),
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

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'proj-' || generate_random_uuid(),
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

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'issue-' || generate_random_uuid(),
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

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sprints table (from enhanced migrations)
CREATE TABLE IF NOT EXISTS sprints (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'sprint-' || generate_random_uuid(),
  project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Planning',
  goal TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  issue_id VARCHAR(50) REFERENCES issues(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create epics table
CREATE TABLE IF NOT EXISTS epics (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'epic-' || generate_random_uuid(),
  project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Open',
  priority INTEGER DEFAULT 1,
  created_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, name)
);

-- Create issue_types table
CREATE TABLE IF NOT EXISTS issue_types (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, name)
);

-- Create issue_labels junction table
CREATE TABLE IF NOT EXISTS issue_labels (
  issue_id VARCHAR(50) REFERENCES issues(id) ON DELETE CASCADE,
  label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, label_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);
CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_epics_project ON epics(project_id);
CREATE INDEX IF NOT EXISTS idx_labels_project ON labels(project_id);
CREATE INDEX IF NOT EXISTS idx_issue_types_project ON issue_types(project_id);

-- Insert default admin user
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (id, name, email, password, role, status, avatar)
VALUES (
  'user-admin-001',
  'Admin User',
  'admin@example.com',
  '$2b$10$K5zz5fJ5Y5zM5fJ5Y5zM5e5zM5fJ5Y5zM5fJ5Y5zM5fJ5Y5zM5fJ5O',
  'Admin',
  'Active',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample project
INSERT INTO projects (id, name, description, client_name, start_date, end_date, status, progress, created_by)
VALUES (
  'proj-sample-001',
  'Sample Project',
  'A sample project to demonstrate the UI/UX Comparison Tool',
  'Sample Client',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'In Progress',
  25,
  'user-admin-001'
)
ON CONFLICT (id) DO NOTHING;

-- Insert default labels for sample project
INSERT INTO labels (project_id, name, color, description)
VALUES 
  ('proj-sample-001', 'Frontend', '#3B82F6', 'Frontend related issues'),
  ('proj-sample-001', 'Backend', '#EF4444', 'Backend related issues'),
  ('proj-sample-001', 'UI/UX', '#8B5CF6', 'User interface and experience'),
  ('proj-sample-001', 'Critical', '#DC2626', 'Critical priority'),
  ('proj-sample-001', 'Enhancement', '#10B981', 'Feature enhancement')
ON CONFLICT (project_id, name) DO NOTHING;

-- Insert default issue types for sample project
INSERT INTO issue_types (project_id, name, color, icon, description)
VALUES 
  ('proj-sample-001', 'Bug', '#EF4444', '🐛', 'Something isn\'t working'),
  ('proj-sample-001', 'Enhancement', '#10B981', '✨', 'New feature or improvement'),
  ('proj-sample-001', 'Correction', '#F59E0B', '🔧', 'Correction needed'),
  ('proj-sample-001', 'Documentation', '#6B7280', '📚', 'Documentation update')
ON CONFLICT (project_id, name) DO NOTHING;

-- Enable RLS (Row Level Security) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_types ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (you can modify these based on your needs)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Anyone can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Project creators can update" ON projects FOR UPDATE USING (created_by = auth.uid()::text);

CREATE POLICY "Anyone can view issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create issues" ON issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update issues" ON issues FOR UPDATE USING (true);

-- Similar policies for other tables
CREATE POLICY "Anyone can view activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create activities" ON activities FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view sprints" ON sprints FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage sprints" ON sprints FOR ALL USING (true);

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Anyone can view epics" ON epics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage epics" ON epics FOR ALL USING (true);

CREATE POLICY "Anyone can view labels" ON labels FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage labels" ON labels FOR ALL USING (true);

CREATE POLICY "Anyone can view issue types" ON issue_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage issue types" ON issue_types FOR ALL USING (true);