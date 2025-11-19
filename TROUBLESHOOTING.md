# 🔧 Troubleshooting Guide - Issues Fixed

## Problems Identified

1. ✅ **Created projects not showing** - Backend returns snake_case but frontend expects camelCase
2. ✅ **Created users unable to login** - Missing `last_active` column in database
3. ❌ **PostgreSQL not installed/running** - Database connection failing
4. ❌ **Backend server not running** - No API to connect to

---

## What Was Fixed (Backend Code Updates)

### 1. Project Controller - Returns camelCase
**File:** `backend/src/controllers/projectController.js`

**Changes:**
- `getAllProjects()` now transforms database response to camelCase
- Includes full `members` array with user details
- `getProjectById()` returns camelCase format
- `createProject()` returns transformed project

**Before:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "issue_count": 5
}
```

**After:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "issueCount": 5,
  "members": [...]
}
```

### 2. User Controller - Returns camelCase
**File:** `backend/src/controllers/userController.js`

**Changes:**
- `getAllUsers()` transforms to camelCase with `lastActive`
- `getUserById()` returns camelCase format
- `createUser()` returns transformed user with `lastActive`

**Before:**
```json
{
  "created_at": "2024-01-01",
  "last_active": null
}
```

**After:**
```json
{
  "lastActive": "2024-11-05T10:30:00Z"
}
```

### 3. Database Schema Update
**File:** `backend/src/config/migrations.js`

**Added:**
- `last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP` column to users table

**Update Script Created:**
- `backend/src/config/update-schema.js` - Adds missing column to existing database
- New npm script: `npm run db:update`

---

## 🚀 How to Fix Your Setup

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Verify it's running
psql postgres -c "SELECT version();"
```

**Alternative - Postgres.app (easiest for macOS):**
1. Download from: https://postgresapp.com/
2. Move to Applications folder
3. Open Postgres.app
4. Click "Initialize" to create a new server
5. Server will start automatically

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Remember your password!
4. PostgreSQL will start automatically

---

### Step 2: Setup Database

```bash
# Navigate to backend folder
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/backend"

# Create database (if fresh install)
createdb ui_ux_comparison

# OR using psql
psql postgres
CREATE DATABASE ui_ux_comparison;
\q

# Run migrations (creates all tables)
npm run db:migrate

# Update schema (adds last_active column if database already exists)
npm run db:update
```

---

### Step 3: Configure Backend

**Check `backend/.env` file exists with correct credentials:**

```bash
cd backend
cat .env
```

**Should contain:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ui_ux_comparison
JWT_SECRET=your-secret-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

**If DB_USER or DB_PASSWORD is wrong, update it to match your PostgreSQL setup.**

---

### Step 4: Start Backend Server

```bash
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/backend"

# Install dependencies if not already done
npm install

# Start backend server
npm run dev
```

**You should see:**
```
🚀 Server is running on port 5000
✅ Database connected successfully
```

**If you see connection errors:**
- Check PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check database exists: `psql -U postgres -l | grep ui_ux_comparison`
- Check credentials in `.env` match your PostgreSQL setup

---

### Step 5: Start Frontend

**Open a NEW terminal window:**

```bash
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool"

# Install dependencies if not already done
npm install

# Start frontend
npm run dev
```

**Frontend runs on:** http://localhost:5173

---

### Step 6: Test Everything

1. **Open browser:** http://localhost:5173
2. **Login with:** admin@example.com / admin123
3. **Test Dashboard:**
   - Should see statistics cards
   - Should see existing projects
   - Click "Create New Project" → Fill form → Submit
   - **New project should appear immediately in the table** ✅

4. **Test User Management:**
   - Click "User Management" in sidebar
   - Should see list of users
   - Click "Add User" → Fill form → Submit
   - **New user should appear immediately** ✅
   - **New user can now login** ✅

5. **Test Project Details:**
   - Click on any project
   - Should see issues table
   - Click "Add Issue" → Fill form → Submit
   - **New issue should appear immediately** ✅

---

## Common Errors & Solutions

### Error: "ECONNREFUSED ::1:5432"
**Problem:** PostgreSQL is not running

**Solution:**
```bash
# macOS
brew services start postgresql@14

# Or restart
brew services restart postgresql@14

# Check status
brew services list | grep postgresql
```

### Error: "database does not exist"
**Problem:** Database not created

**Solution:**
```bash
createdb ui_ux_comparison
npm run db:migrate
```

### Error: "password authentication failed"
**Problem:** Wrong credentials in `.env`

**Solution:**
```bash
# Find your PostgreSQL user
psql -U postgres -c "SELECT current_user;"

# Update backend/.env with correct user/password
```

### Error: "relation 'users' does not exist"
**Problem:** Migrations not run

**Solution:**
```bash
cd backend
npm run db:migrate
npm run db:update
```

### Error: "User created but can't login"
**Problem:** Missing `last_active` column

**Solution:**
```bash
cd backend
npm run db:update
```

### Error: "Created project not showing"
**Problem:** Backend was returning wrong format (now fixed)

**Solution:**
- Make sure you pulled latest code changes
- Restart backend server: `npm run dev`
- Refresh browser

---

## Verification Checklist

Before testing, verify:

- [ ] PostgreSQL installed and running
- [ ] Database `ui_ux_comparison` exists
- [ ] Backend `.env` configured correctly
- [ ] Backend dependencies installed (`npm install`)
- [ ] Migrations run (`npm run db:migrate`)
- [ ] Schema updated (`npm run db:update`)
- [ ] Backend server running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 5173
- [ ] Browser console shows no errors

---

## What Changed in the Code

All API responses now use **camelCase** to match frontend expectations:

| Backend Column | Frontend Property |
|---------------|-------------------|
| start_date    | startDate         |
| end_date      | endDate           |
| issue_count   | issueCount        |
| created_at    | createdAt         |
| updated_at    | updatedAt         |
| last_active   | lastActive        |
| bug_id        | bugId             |
| module_name   | moduleName        |
| assigned_to   | assignedTo        |
| reported_by   | reportedBy        |

---

## Quick Test Script

Run this to verify everything works:

```bash
# Test backend health
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Should return JWT token and user data
```

---

## Need More Help?

1. Check backend terminal for error messages
2. Check frontend browser console (F12) for errors
3. Verify PostgreSQL is running: `ps aux | grep postgres`
4. Test database connection: `psql ui_ux_comparison -c "SELECT COUNT(*) FROM users;"`
5. Check backend logs for API request errors

---

**After following these steps, all issues should be resolved!** ✅

- ✅ Created projects will show immediately
- ✅ Created users can login
- ✅ All data persists to database
- ✅ All CRUD operations work
