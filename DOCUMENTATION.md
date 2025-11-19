# QA Bugtracking Tool - Complete Documentation

A comprehensive bug tracking and quality assurance management system built with modern web technologies. This application provides JIRA-like functionality for managing projects, tracking issues, organizing sprints, and facilitating team collaboration.

## Table of Contents

- [Overview](#overview)
- [Why Choose QA Bugtracking Tool](#why-choose-qa-bugtracking-tool)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)

---

## Overview

The QA Bugtracking Tool is a full-stack web application designed to streamline quality assurance processes and bug tracking workflows. It provides role-based access control, comprehensive issue management, sprint planning, and real-time collaboration features.

### Key Capabilities

- **Project Management**: Create and manage multiple projects with customizable workflows
- **Issue Tracking**: Track bugs, enhancements, and corrections with detailed metadata
- **Sprint Planning**: Organize work into sprints with goals and timelines
- **Team Collaboration**: Comments, watchers, and activity tracking
- **Role-Based Access**: Different capabilities for Admin, QA, and Developer roles
- **Advanced Filtering**: Search and filter issues by multiple criteria
- **Time Tracking**: Estimate and log time spent on issues

---

## Why Choose QA Bugtracking Tool

### Comparison with Existing Tools

#### vs. GitLab Issue Tracking

**GitLab Limitations**:
- ❌ Primarily designed for developer workflows, not QA-focused
- ❌ Complex interface overwhelming for non-technical QA teams
- ❌ Issue tracking mixed with code repositories and CI/CD pipelines
- ❌ Limited customization for QA-specific workflows
- ❌ Steep learning curve for QA team members
- ❌ Requires Git knowledge to navigate effectively
- ❌ No dedicated severity levels (Low, Medium, High, Critical)
- ❌ Limited role-based access tailored for QA processes

**QA Bugtracking Tool Advantages**:
- ✅ **QA-First Design**: Built specifically for quality assurance workflows
- ✅ **Simple, Clean Interface**: Easy to use for all team members regardless of technical background
- ✅ **Dedicated Bug Tracking**: Focused solely on issue management without code repository clutter
- ✅ **Auto-Generated Bug IDs**: Unique bug IDs (e.g., BUG-1762419854648-001) for easy reference
- ✅ **Severity-Based Prioritization**: Clear severity levels (Low, Medium, High, Critical) tailored for QA
- ✅ **Role-Specific Views**: Customized interfaces for Admin, QA, and Developer roles
- ✅ **Quick Onboarding**: Team members can start tracking bugs within minutes
- ✅ **No Git Required**: Pure web interface with no version control complexity

#### vs. Google Sheets

**Google Sheets Limitations**:
- ❌ Manual data entry with high risk of human error
- ❌ No data validation or enforced workflows
- ❌ Limited search and filtering capabilities
- ❌ No automatic timestamps or audit trails
- ❌ Difficult to track issue history and changes
- ❌ No role-based permissions (view-only vs edit access)
- ❌ Poor scalability - slow with hundreds of issues
- ❌ No notifications or alerts for updates
- ❌ Manual ID generation prone to duplicates
- ❌ No structured comments or collaboration features
- ❌ Requires constant file sharing and version management
- ❌ No integration with project timelines or sprints

**QA Bugtracking Tool Advantages**:
- ✅ **Automated Workflows**: Auto-generated IDs, timestamps, and status tracking
- ✅ **Data Integrity**: Built-in validation ensures complete and accurate data
- ✅ **Advanced Search**: Powerful filtering by status, severity, assignee, project, etc.
- ✅ **Complete Audit Trail**: Every change is logged with user and timestamp
- ✅ **Issue History**: View full timeline of updates, comments, and status changes
- ✅ **Role-Based Security**: Granular permissions for Admin, QA, and Developer roles
- ✅ **High Performance**: Database-backed system handles thousands of issues efficiently
- ✅ **Real-Time Notifications**: Automatic alerts for assignments and updates
- ✅ **Guaranteed Unique IDs**: Database-enforced unique bug identifiers
- ✅ **Structured Collaboration**: Threaded comments, mentions, and watchers
- ✅ **Central Access**: Single URL accessible to entire team with individual logins
- ✅ **Sprint Integration**: Link issues to sprints and epics for agile planning

#### vs. Google Docs

**Google Docs Limitations**:
- ❌ Unstructured text documents difficult to search
- ❌ No standardized bug report format
- ❌ Manual formatting required for each bug
- ❌ Cannot filter or sort issues
- ❌ Version history cluttered with minor edits
- ❌ No way to track bug status (Open, In Progress, Fixed)
- ❌ Screenshots embedded as images with no metadata
- ❌ Difficult to assign bugs to specific team members
- ❌ No reporting or analytics capabilities
- ❌ Collaboration limited to comments on text
- ❌ No deadline tracking or time estimation
- ❌ Multiple documents required for multiple projects

**QA Bugtracking Tool Advantages**:
- ✅ **Structured Data**: Every bug follows consistent format with required fields
- ✅ **Instant Search**: Find any issue by ID, keyword, assignee, or project in seconds
- ✅ **Standardized Templates**: Consistent bug reporting across entire team
- ✅ **Multi-Field Filtering**: Sort and filter by any combination of criteria
- ✅ **Clean Change Tracking**: Activity log shows meaningful changes only
- ✅ **Status Workflow**: Clear progression from Open → In Progress → Fixed → Closed
- ✅ **Screenshot Management**: Upload and view multiple screenshots per issue
- ✅ **Clear Ownership**: Assign issues to specific users with automatic notifications
- ✅ **Built-in Analytics**: Dashboard shows metrics, trends, and team performance
- ✅ **Contextual Collaboration**: Comments tied directly to specific issues
- ✅ **Time Management**: Set due dates, estimate hours, and log time spent
- ✅ **Project Organization**: Manage unlimited projects in single centralized system

### Key Differentiators

#### 1. Purpose-Built for QA Teams
Unlike general-purpose tools, this application is specifically designed for quality assurance workflows with features QA teams actually need.

#### 2. Zero Configuration Required
- No complex setup or integrations
- Works out of the box with sensible defaults
- Intuitive interface requires minimal training

#### 3. Complete Bug Lifecycle Management
Track bugs from initial report through development, testing, and closure with full audit trail at every step.

#### 4. Centralized Single Source of Truth
- All bugs in one place
- No scattered spreadsheets or documents
- Consistent data structure across projects

#### 5. Role-Based Workflows
Different interfaces and capabilities for Admin, QA, and Developer roles ensure everyone sees what's relevant to them.

#### 6. Advanced Reporting & Analytics
- Real-time dashboards
- Filter by any criteria
- Export capabilities
- Historical trend analysis

#### 7. Scalability
Handles projects with thousands of issues without performance degradation - something spreadsheets simply cannot do.

#### 8. Professional Bug IDs
Auto-generated unique identifiers (BUG-1762419854648-001) provide professional, unambiguous bug references.

#### 9. Agile Sprint Integration
Built-in sprint planning and epic management align bug tracking with modern agile development practices.

#### 10. Data Security & Backup
- Database-backed with automatic backups
- User authentication and authorization
- Protected against accidental data loss
- Proper data recovery mechanisms

### Cost-Benefit Analysis

| Aspect | Google Sheets/Docs | GitLab | QA Bugtracking Tool |
|--------|-------------------|---------|---------------------|
| **Setup Time** | 1-2 hours (template creation) | 4-8 hours (learning curve) | 15 minutes |
| **Learning Curve** | Easy but limited | Steep for non-developers | Minimal for all roles |
| **QA Workflow Fit** | Poor (manual workarounds) | Moderate (dev-focused) | Excellent (purpose-built) |
| **Scalability** | Poor (100+ issues) | Good | Excellent |
| **Data Integrity** | Low (manual entry) | Good | Excellent (validation) |
| **Search/Filter** | Basic | Moderate | Advanced |
| **Collaboration** | Basic comments | Good (dev-centric) | Excellent (QA-centric) |
| **Reporting** | Manual/Limited | Good | Excellent |
| **Mobile Access** | Good (read-only) | Moderate | Good |
| **Cost** | Free | Free (limited) / Paid | Self-hosted (free) |
| **Maintenance** | Manual cleanup | Requires admin | Automated |

### When to Use This Tool

**Perfect For**:
- QA teams tracking bugs across multiple projects
- Organizations needing professional bug tracking without JIRA complexity/cost
- Teams currently using spreadsheets who need better organization
- Agile teams requiring sprint planning with bug tracking
- Companies wanting self-hosted solution with data control
- Teams of 5-100 members needing role-based access

**Consider Alternatives If**:
- You need issue tracking integrated with source code (use GitLab)
- You only have 1-2 projects with <20 bugs (spreadsheet may suffice)
- You require enterprise features like SSO, SAML (use JIRA)
- Your team is already heavily invested in another ecosystem

### Real-World Benefits

**For QA Teams**:
- Spend less time on documentation, more time testing
- Professional bug reports with consistent format
- Easy to demonstrate testing coverage to management
- Clear status of all open issues at a glance

**For Development Teams**:
- Clear, structured bug reports with all necessary details
- Easy to track what's assigned to you
- Understand priority through severity levels
- No ambiguity about bug status or ownership

**For Management**:
- Real-time visibility into testing progress
- Metrics and trends for data-driven decisions
- Professional reporting for stakeholders
- Proof of systematic quality assurance process

---

## Features

### 1. Dashboard

**Description**: Central hub displaying project overview and key metrics

**Functionalities**:
- View all projects with status indicators
- Quick statistics: total projects, active projects, team members
- Project creation modal with validation
- Status distribution visualization
- Recent activity feed

**Role Access**: All roles (Admin, QA, Developer)

### 2. Project Management

**Description**: Comprehensive project lifecycle management

**Functionalities**:
- Create new projects with:
  - Project name and description
  - Start and end dates
  - Initial status (Planning, In Progress, On Hold, Completed, Cancelled)
  - Project manager assignment
  - Team member selection
- View project list with filtering options
- Project details page showing:
  - Team members
  - Issues summary
  - Activity timeline
  - Project statistics
- Add/remove team members from projects
- Update project status

**Role Access**: 
- Admin: Full access
- QA: View and create projects
- Developer: View projects

### 3. Issue Tracking

**Description**: Detailed bug and issue management system

**Functionalities**:
- Create issues with:
  - Module name (summary)
  - Issue type (Bug, Enhancement, Correction)
  - Severity level (Low, Medium, High, Critical)
  - Status (Open, In Progress, Fixed, Closed, Reopen)
  - Detailed description
  - Assignee selection
  - Related links
  - Screenshot attachments
- Auto-generated unique bug IDs (e.g., BUG-1762419854648-001)
- View all issues across projects
- Filter issues by:
  - Project
  - Status
  - Severity
  - Type
  - Assignee
- Search issues by keyword
- Sort by multiple fields
- View issue details with:
  - Full description
  - Comments thread
  - Activity history
  - Related metadata

**Role Access**:
- Admin: Full access
- QA: Create, view, and update issues
- Developer: View and update assigned issues

### 4. Sprint Management

**Description**: Agile sprint planning and tracking

**Functionalities**:
- Create sprints with:
  - Sprint name
  - Sprint goal
  - Start and end dates
  - Associated project
- Sprint statuses: Planning, Active, Completed
- Assign issues to sprints
- View sprint progress
- Track sprint velocity
- Sprint burndown visualization

**Role Access**:
- Admin: Full access
- QA: Create and manage sprints
- Developer: View sprints

### 5. Epic Management

**Description**: Organize large features and initiatives

**Functionalities**:
- Create epics with:
  - Epic name
  - Description
  - Status (Open, In Progress, Done, Cancelled)
  - Color coding
- Link issues to epics
- Track epic progress
- View epic hierarchy

**Role Access**:
- Admin: Full access
- QA: Create and manage epics
- Developer: View epics

### 6. Board View

**Description**: Kanban-style visual board for issue management

**Functionalities**:
- Visual representation of issue workflow
- Drag-and-drop issue status updates
- Column-based organization (Open, In Progress, Fixed, Closed)
- Quick issue preview
- Filter by sprint, assignee, or labels

**Role Access**: All roles

### 7. User Management

**Description**: Admin panel for managing users and roles (Admin only)

**Functionalities**:
- View all users with details:
  - Name, email, role
  - Status (Active/Inactive)
  - Last active timestamp
- Create new users
- Edit user details
- Change user roles
- Activate/deactivate users
- Filter users by role and status

**Role Access**: Admin only

### 8. Comments & Collaboration

**Description**: Communication and collaboration on issues

**Functionalities**:
- Add comments to issues
- Edit and delete own comments
- View comment history
- User mentions
- Timestamp tracking
- Comment threading

**Role Access**: All roles

### 9. Activity Tracking

**Description**: Audit trail of all project activities

**Functionalities**:
- Automatic activity logging for:
  - Issue creation and updates
  - Project changes
  - Status transitions
  - Assignment changes
  - Comment additions
- Activity timeline view
- Filter by date and user
- Activity notifications

**Role Access**: All roles

### 10. Profile Management

**Description**: User profile and settings

**Functionalities**:
- View personal information
- Update profile details
- Change password
- View assigned issues
- Activity history
- Preferences settings

**Role Access**: All roles

### 11. Time Tracking

**Description**: Track time spent on issues

**Functionalities**:
- Estimate time for issues (in minutes/hours)
- Log time spent
- View time reports
- Time allocation analytics
- Remaining time calculations

**Role Access**: All roles

### 12. Watchers System

**Description**: Follow issues and receive updates

**Functionalities**:
- Add yourself as watcher to issues
- Receive notifications on issue updates
- View all watched issues
- Manage watcher list
- Automatic reporter watching

**Role Access**: All roles

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework for building interactive user interfaces |
| **TypeScript** | 5.2.2 | Type-safe JavaScript development |
| **Vite** | 4.5.14 | Fast build tool and development server |
| **React Router DOM** | 6.20.0 | Client-side routing and navigation |
| **Tailwind CSS** | 3.3.5 | Utility-first CSS framework for styling |
| **Lucide React** | Latest | Icon library for consistent UI icons |
| **Axios** | Latest | HTTP client for API requests |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x+ | JavaScript runtime environment |
| **Express.js** | 4.18.2 | Web application framework |
| **PostgreSQL** | 14.19 | Relational database management system |
| **pg** | 8.11.3 | PostgreSQL client for Node.js |
| **bcryptjs** | 2.4.3 | Password hashing and authentication |
| **jsonwebtoken** | 9.0.2 | JWT token generation and validation |
| **cors** | 2.8.5 | Cross-origin resource sharing middleware |
| **dotenv** | 16.3.1 | Environment variable management |
| **nodemon** | 3.1.10 | Development server auto-restart |

### Development Tools

- **ESLint**: Code linting and quality checks
- **Git**: Version control
- **VS Code**: Recommended IDE

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Components (TypeScript)                       │  │
│  │  - Pages (Dashboard, Projects, Issues, etc.)         │  │
│  │  - Components (Modals, Cards, Forms)                 │  │
│  │  - Routing (React Router)                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  State Management                                     │  │
│  │  - React Hooks (useState, useEffect)                 │  │
│  │  - Context API (if applicable)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Layer (Axios)                                    │  │
│  │  - API Service Functions                             │  │
│  │  - HTTP Interceptors                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                    │  │
│  │  - Middleware (CORS, Body Parser, Auth)              │  │
│  │  - Route Handlers                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers                                          │  │
│  │  - projectController                                  │  │
│  │  - issueController                                    │  │
│  │  - userController                                     │  │
│  │  - sprintController                                   │  │
│  │  - commentController                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Layer (PostgreSQL)                          │  │
│  │  - Connection Pool                                    │  │
│  │  - Query Execution                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  - users                  - issue_watchers                   │
│  - projects               - time_logs                        │
│  - issues                 - issue_labels                     │
│  - comments               - labels                           │
│  - sprints                - project_members                  │
│  - epics                  - activities                       │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
ui-ux-comparison-tool/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database connection configuration
│   │   ├── controllers/
│   │   │   ├── projectController.js  # Project CRUD operations
│   │   │   ├── issueController.js    # Issue management
│   │   │   ├── userController.js     # User management
│   │   │   ├── sprintController.js   # Sprint operations
│   │   │   ├── epicController.js     # Epic management
│   │   │   ├── commentController.js  # Comment operations
│   │   │   └── activityController.js # Activity logging
│   │   ├── middleware/
│   │   │   └── auth.js               # Authentication middleware
│   │   ├── routes/
│   │   │   ├── projects.js           # Project routes
│   │   │   ├── issues.js             # Issue routes
│   │   │   ├── users.js              # User routes
│   │   │   ├── sprints.js            # Sprint routes
│   │   │   ├── epics.js              # Epic routes
│   │   │   └── comments.js           # Comment routes
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_sprints.sql
│   │   │   ├── 003_add_epics.sql
│   │   │   └── 004_add_watchers.sql
│   │   └── server.js                 # Express server setup
│   ├── package.json
│   └── .env                          # Environment variables
│
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   ├── Header.tsx                # Top navigation bar
│   │   └── ...                       # Other reusable components
│   ├── pages/
│   │   ├── Dashboard.tsx             # Main dashboard
│   │   ├── Projects.tsx              # Projects list
│   │   ├── ProjectDetails.tsx        # Project detail view
│   │   ├── Issues.tsx                # Issues list
│   │   ├── Board.tsx                 # Kanban board
│   │   ├── Sprints.tsx               # Sprint management
│   │   └── MyProfile.tsx             # User profile
│   ├── services/
│   │   └── api.ts                    # API service layer
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   ├── App.tsx                       # Main application component
│   ├── main.tsx                      # Application entry point
│   └── index.css                     # Global styles
│
├── public/                           # Static assets
├── package.json
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
└── DOCUMENTATION.md                  # This file
```

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn package manager
- Git (optional)

### Step 1: Clone or Download

```bash
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool"
```

### Step 2: Database Setup

1. **Create PostgreSQL Database**:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ui_ux_comparison;

# Exit psql
\q
```

2. **Configure Database Connection**:

Edit `backend/.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ui_ux_comparison
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
```

3. **Run Database Migrations**:

```bash
cd backend
npm run db:migrate
```

This will create all necessary tables and seed initial data.

### Step 3: Install Dependencies

**Backend**:
```bash
cd backend
npm install
```

**Frontend**:
```bash
cd ..
npm install
```

### Step 4: Start Servers

**Backend** (in one terminal):
```bash
cd backend
npm run dev
```
Server will start on `http://localhost:5000`

**Frontend** (in another terminal):
```bash
npm run dev
```
Application will open on `http://localhost:5173`

---

## Configuration

### Environment Variables

**Backend** (`backend/.env`):

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ui_ux_comparison
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Database Configuration

PostgreSQL connection settings in `backend/src/config/database.js`:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Frontend Configuration

Vite configuration in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Usage Guide

### Initial Setup

1. **First Login**:
   - Default admin credentials are seeded during migration
   - Login with admin account to set up the system

2. **Create Users**:
   - Navigate to User Management (Admin only)
   - Add team members with appropriate roles
   - Assign roles: Admin, QA, or Developer

3. **Create First Project**:
   - Go to Dashboard
   - Click "New Project"
   - Fill in project details
   - Select project manager and team members
   - Submit to create project

### Daily Workflow

**For QA Team**:

1. **Create Issues**:
   - Open project details
   - Click "Add Issue"
   - Fill in module name, type, severity
   - Assign to developer
   - Add description and screenshots
   - Submit

2. **Track Progress**:
   - View issues in Issues page
   - Filter by status, severity
   - Update issue status as work progresses
   - Add comments for clarification

3. **Sprint Planning**:
   - Navigate to Sprints
   - Create new sprint
   - Set sprint goal and dates
   - Assign issues to sprint
   - Monitor sprint progress

**For Developers**:

1. **View Assigned Issues**:
   - Check Dashboard for assigned issues
   - Filter by your assignments
   - View issue details

2. **Update Status**:
   - Open issue details
   - Change status (Open → In Progress → Fixed)
   - Log time spent
   - Add comments on progress

3. **Collaborate**:
   - Add comments to issues
   - Request clarification from QA
   - Update issue descriptions with findings

**For Admins**:

1. **Manage Users**:
   - Add/edit users
   - Assign roles
   - Monitor user activity

2. **Oversee Projects**:
   - View all projects
   - Monitor project health
   - Reassign resources as needed

3. **Generate Reports**:
   - View activity logs
   - Analyze issue trends
   - Track team performance

---

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include token in header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/projects` | Get all projects | Yes |
| GET | `/projects/:id` | Get project by ID | Yes |
| POST | `/projects` | Create new project | Yes (Admin/QA) |
| PUT | `/projects/:id` | Update project | Yes (Admin/PM) |
| DELETE | `/projects/:id` | Delete project | Yes (Admin) |
| POST | `/projects/:id/members` | Add team member | Yes (Admin/PM) |
| DELETE | `/projects/:id/members/:userId` | Remove member | Yes (Admin/PM) |

**Create Project Request**:
```json
{
  "name": "Project Name",
  "description": "Project description",
  "startDate": "2025-11-01",
  "endDate": "2025-12-31",
  "status": "Planning",
  "projectManager": "user-id",
  "members": ["user-id-1", "user-id-2"]
}
```

#### Issues

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/issues` | Get all issues (with filters) | Yes |
| GET | `/issues/:id` | Get issue by ID | Yes |
| POST | `/issues` | Create new issue | Yes |
| PUT | `/issues/:id` | Update issue | Yes |
| DELETE | `/issues/:id` | Delete issue | Yes (Admin) |
| POST | `/issues/:id/watchers` | Add watcher | Yes |
| DELETE | `/issues/:id/watchers/:userId` | Remove watcher | Yes |

**Create Issue Request**:
```json
{
  "projectId": "project-id",
  "moduleName": "Login Page",
  "type": "Bug",
  "severity": "High",
  "status": "Open",
  "description": "Detailed issue description",
  "assignedTo": "user-id",
  "relatedLinks": ["http://example.com"],
  "screenshots": []
}
```

**Query Parameters** for GET `/issues`:
- `projectId`: Filter by project
- `status`: Filter by status
- `severity`: Filter by severity
- `type`: Filter by type
- `search`: Search in bug ID, module name, description
- `sortBy`: Sort field (default: created_at)
- `sortOrder`: asc or desc (default: desc)

#### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Yes |
| GET | `/users/:id` | Get user by ID | Yes |
| POST | `/users` | Create new user | Yes (Admin) |
| PUT | `/users/:id` | Update user | Yes (Admin/Self) |
| DELETE | `/users/:id` | Delete user | Yes (Admin) |
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | User registration | No |

#### Sprints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/sprints` | Get all sprints | Yes |
| GET | `/sprints/:id` | Get sprint by ID | Yes |
| POST | `/sprints` | Create new sprint | Yes (Admin/QA) |
| PUT | `/sprints/:id` | Update sprint | Yes (Admin/QA) |
| DELETE | `/sprints/:id` | Delete sprint | Yes (Admin) |
| POST | `/sprints/:id/issues` | Add issue to sprint | Yes |

#### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/issues/:issueId/comments` | Get issue comments | Yes |
| POST | `/issues/:issueId/comments` | Add comment | Yes |
| PUT | `/comments/:id` | Update comment | Yes (Owner) |
| DELETE | `/comments/:id` | Delete comment | Yes (Owner/Admin) |

#### Activities

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/projects/:projectId/activities` | Get project activities | Yes |
| GET | `/activities` | Get all activities | Yes (Admin) |

---

## Database Schema

### Tables Overview

1. **users**: User accounts and authentication
2. **projects**: Project information
3. **project_members**: Many-to-many relationship for project teams
4. **issues**: Bug and issue tracking
5. **comments**: Issue comments
6. **sprints**: Sprint management
7. **epics**: Epic management
8. **issue_watchers**: Users watching issues
9. **time_logs**: Time tracking entries
10. **issue_labels**: Issue tagging
11. **labels**: Label definitions
12. **activities**: Activity audit log

### Key Tables

**users**:
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'QA', 'Developer')),
  avatar TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**projects**:
```sql
CREATE TABLE projects (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled')),
  start_date DATE,
  end_date DATE,
  project_manager VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**issues**:
```sql
CREATE TABLE issues (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
  bug_id VARCHAR(255) UNIQUE NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('Bug', 'Enhancement', 'Correction')),
  severity VARCHAR(50) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status VARCHAR(50) CHECK (status IN ('Open', 'In Progress', 'Fixed', 'Closed', 'Reopen')),
  description TEXT,
  assigned_to VARCHAR(255) REFERENCES users(id),
  reported_by VARCHAR(255) REFERENCES users(id),
  screenshots TEXT[],
  related_links TEXT[],
  sprint_id VARCHAR(255) REFERENCES sprints(id),
  epic_id VARCHAR(255) REFERENCES epics(id),
  time_estimate INTEGER,
  time_spent INTEGER,
  due_date DATE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enums

- **User Roles**: Admin, QA, Developer
- **Project Status**: Planning, In Progress, On Hold, Completed, Cancelled
- **Issue Type**: Bug, Enhancement, Correction
- **Issue Severity**: Low, Medium, High, Critical
- **Issue Status**: Open, In Progress, Fixed, Closed, Reopen
- **Sprint Status**: Planning, Active, Completed
- **Epic Status**: Open, In Progress, Done, Cancelled

---

## Development

### Running in Development Mode

**Backend**:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend**:
```bash
npm run dev  # Uses Vite dev server with HMR
```

### Building for Production

**Frontend**:
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

**Backend**:
```bash
cd backend
npm start
```

### Code Quality

**Linting**:
```bash
npm run lint
```

**Type Checking**:
```bash
npm run type-check
```

### Testing

Currently, the application does not include automated tests. Consider adding:
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Cypress or Playwright

---

## Deployment

### Production Checklist

- [ ] Set strong JWT_SECRET in environment variables
- [ ] Use production PostgreSQL database
- [ ] Enable SSL for database connections
- [ ] Configure CORS for production domain
- [ ] Set NODE_ENV=production
- [ ] Build frontend with `npm run build`
- [ ] Set up reverse proxy (nginx)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up backup strategy for database
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (e.g., Sentry)

### Deployment Options

**Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)**
- Deploy backend as Node.js process (use PM2 for process management)
- Serve frontend static files with nginx
- Use PostgreSQL managed database or self-hosted

**Option 2: Platform as a Service**
- Frontend: Vercel, Netlify
- Backend: Render, Railway, Heroku
- Database: Supabase, Railway, AWS RDS

**Option 3: Containerized (Docker)**
- Create Dockerfiles for frontend and backend
- Use docker-compose for local development
- Deploy to Kubernetes or container platforms

### Environment Variables for Production

```env
# Backend
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=ui_ux_comparison
DB_USER=prod_user
DB_PASSWORD=strong_password
JWT_SECRET=very_strong_secret_key
CORS_ORIGIN=https://your-domain.com

# Frontend (build time)
VITE_API_URL=https://api.your-domain.com
```

---

## Troubleshooting

### Common Issues

**1. Backend won't start - "Port 5000 already in use"**
```bash
# Find and kill process on port 5000
lsof -ti :5000 | xargs kill -9
```

**2. Database connection errors**
- Verify PostgreSQL is running
- Check credentials in .env file
- Ensure database exists
- Check firewall rules

**3. Frontend can't connect to backend**
- Verify backend is running on port 5000
- Check CORS configuration
- Verify API base URL in frontend

**4. Migration errors**
- Check database permissions
- Ensure migrations haven't been run already
- Review migration SQL syntax

**5. Build errors**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Review TypeScript errors

---

## Contributing

### Development Workflow

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

### Code Style

- Follow existing code patterns
- Use TypeScript for type safety
- Write meaningful commit messages
- Comment complex logic
- Keep functions small and focused

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For issues, questions, or support:
- Create an issue in the repository
- Contact the development team
- Refer to this documentation

---

## Changelog

### Version 1.0.0 (November 2025)

**Initial Release**
- Complete project management system
- Issue tracking with bug IDs
- Sprint and epic management
- User management with roles
- Comments and collaboration
- Activity tracking
- Time logging
- Watchers system
- Board view
- Advanced filtering and search

---

## Future Enhancements

### Planned Features

1. **Notifications System**
   - Email notifications
   - In-app notifications
   - Notification preferences

2. **File Upload**
   - Screenshot upload for issues
   - Attachment support
   - File preview

3. **Advanced Reporting**
   - Burndown charts
   - Velocity tracking
   - Custom reports
   - Export to PDF/Excel

4. **Integration**
   - Slack integration
   - Email integration
   - Webhook support

5. **Mobile App**
   - React Native mobile application
   - Push notifications

6. **Advanced Search**
   - Full-text search
   - Saved filters
   - Advanced query builder

7. **Automation**
   - Workflow automation
   - Auto-assignment rules
   - SLA tracking

8. **API Enhancements**
   - GraphQL API
   - Real-time updates with WebSockets
   - API rate limiting

---

**Last Updated**: November 6, 2025  
**Version**: 1.0.0  
**Maintained by**: Development Team
