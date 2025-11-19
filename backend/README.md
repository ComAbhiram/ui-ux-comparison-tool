# UI/UX Comparison Tool - Backend Setup

## Prerequisites

1. **PostgreSQL** (version 12 or higher)
   - Mac: `brew install postgresql@15`
   - Windows: Download from https://www.postgresql.org/download/
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Node.js** (version 18 or higher)

## Quick Start

### 1. Install PostgreSQL and Start Service

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
- Start PostgreSQL service from Services app or use `pg_ctl`

### 2. Create Database

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Or on macOS/Linux without password
psql postgres

# Create the database
CREATE DATABASE ui_ux_comparison;

# Exit psql
\q
```

### 3. Configure Environment

The `.env` file is already created with default settings:
- Database: `ui_ux_comparison`
- User: `postgres`
- Password: `postgres`
- Port: `5432`

**Update the `.env` file if your PostgreSQL has different credentials!**

### 4. Run Database Migrations

```bash
cd backend
npm run db:migrate
```

This will create all tables and a default admin user:
- **Email:** admin@example.com
- **Password:** admin123

### 5. Start the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on **http://localhost:5000**

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (Admin/QA)
- `PUT /api/projects/:id` - Update project (Admin/QA)
- `DELETE /api/projects/:id` - Delete project (Admin only)
- `POST /api/projects/:id/members` - Add member (Admin/QA)
- `DELETE /api/projects/:id/members/:userId` - Remove member (Admin/QA)

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/:id` - Get issue by ID
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Activities
- `GET /api/activities/project/:projectId` - Get project activities
- `POST /api/activities` - Create activity log

## Database Schema

### Tables
1. **users** - User accounts with roles (Admin, QA, Developer)
2. **projects** - Project information
3. **project_members** - Project team members
4. **issues** - Bug tracking and issues
5. **activities** - Activity logs and timeline

### ENUM Types
- `user_role`: Admin, QA, Developer
- `user_status`: Active, Inactive
- `project_status`: Planning, In Progress, On Hold, Completed, Cancelled
- `issue_type`: Bug, Enhancement, Correction
- `issue_severity`: Low, Medium, High, Critical
- `issue_status`: Open, In Progress, Fixed, Closed, Reopen

## Troubleshooting

### "password authentication failed for user postgres"
Update the password in `.env`:
```
DB_PASSWORD=your_actual_password
```

### "database ui_ux_comparison does not exist"
Create the database:
```bash
psql -U postgres -c "CREATE DATABASE ui_ux_comparison;"
```

### Port 5000 already in use
Change the port in `.env`:
```
PORT=5001
```

### Cannot connect to PostgreSQL
Check if PostgreSQL is running:
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Check connection
psql -U postgres -c "SELECT version();"
```

## Testing the API

### Using curl

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Get Users (with token):**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman or Thunder Client (VS Code)
1. Import the API endpoints
2. Set base URL to `http://localhost:5000`
3. Add Authorization header with Bearer token after login

## Development

### Database Reset
To reset the database and re-run migrations:
```bash
psql -U postgres -c "DROP DATABASE ui_ux_comparison;"
psql -U postgres -c "CREATE DATABASE ui_ux_comparison;"
npm run db:migrate
```

### View Database
```bash
psql -U postgres -d ui_ux_comparison

# List tables
\dt

# View table structure
\d users

# Query data
SELECT * FROM users;

# Exit
\q
```
