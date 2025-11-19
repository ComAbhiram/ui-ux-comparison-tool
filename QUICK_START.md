# 🚀 Quick Start Guide# Quick Start Guide



## Get Everything Running in 5 Minutes## 🚀 Getting Started



### PrerequisitesYour UI/UX Comparison Tool is ready to use! The application is currently running at:

- Node.js installed

- PostgreSQL installed and running**http://localhost:5173/**



---## 📝 Login Instructions



## Step 1: Setup Database (2 minutes)1. Open your browser and navigate to http://localhost:5173/

2. Select your role: Admin, QA, or Developer

```bash3. Enter any of these demo credentials:

# Start PostgreSQL (if not already running)

# macOS:### Admin Access

brew services start postgresql```

Email: sarah.johnson@company.com

# Create databaseRole: Admin

createdb ui_ux_comparisonPassword: any

```

# Or using psql:

psql postgres### Developer Access

CREATE DATABASE ui_ux_comparison;```

\qEmail: michael.chen@company.com

```Role: Developer

Password: any

---```



## Step 2: Start Backend (1 minute)### QA Access

```

```bashEmail: emily.rodriguez@company.com

# Navigate to backend folderRole: QA

cd backendPassword: any

```

# Install dependencies (first time only)

npm install## 🎯 Features to Explore



# Run database migration (first time only)### As Admin:

npm run db:migrate- ✅ View all projects on the Dashboard

- ✅ Manage users in User Management page

# Start backend server- ✅ Create new projects

npm run dev- ✅ View detailed project information

```- ✅ Track all issues

- ✅ Access Settings

✅ Backend should now be running at **http://localhost:5000**

### As Developer:

You should see:- ✅ View assigned projects

```- ✅ Track project issues

🚀 Server is running on port 5000- ✅ Update issue status

✅ Database connected successfully- ✅ View project activity

```- ✅ Manage profile



---### As QA:

- ✅ View assigned projects

## Step 3: Start Frontend (1 minute)- ✅ Report new issues

- ✅ Track issue status

Open a NEW terminal window:- ✅ View project details

- ✅ Manage profile

```bash

# Navigate to project root (if not already there)## 🎨 Theme Toggle

cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool"

Click the sun/moon icon in the header to switch between light and dark modes!

# Install dependencies (first time only)

npm install## 📂 Project Structure



# Start frontend```

npm run devui-ux-comparison-tool/

```├── src/

│   ├── components/       # UI components (Header, Sidebar, Layout)

✅ Frontend should now be running at **http://localhost:5173**│   ├── context/         # State management (Auth, Theme)

│   ├── data/            # Mock data

---│   ├── pages/           # Main pages

│   │   ├── Login.tsx

## Step 4: Test Login (30 seconds)│   │   ├── Dashboard.tsx

│   │   ├── UserManagement.tsx

1. Open browser: **http://localhost:5173**│   │   ├── ProjectDetails.tsx

2. Use default credentials:│   │   ├── Profile.tsx

   - **Email:** admin@example.com│   │   └── Settings.tsx

   - **Password:** admin123│   ├── types/           # TypeScript definitions

3. Click "Sign In"│   └── App.tsx          # Main app with routing

└── ...config files

✅ You should be redirected to the Dashboard!```



---## 🛠️ Development Commands



## Step 5: Verify Everything Works```bash

# Start development server

### Dashboardnpm run dev

- ✅ See project statistics

- ✅ Click "Create New Project"# Build for production

- ✅ New project saved to databasenpm run build



### User Management# Preview production build

- ✅ Click "User Management" in sidebarnpm run preview

- ✅ See list of users from database```

- ✅ Click "Add User" - create new user

## 💡 Tips

### Project Details

- ✅ Click on any project1. **Navigation**: Use the sidebar to navigate between pages

- ✅ See issues table2. **Project Details**: Click any project in the Dashboard to view details

- ✅ Click "Add Issue"3. **Issues Tab**: View and manage project issues

- ✅ Update issue status4. **Activity Tab**: See project activity timeline

5. **Profile**: Click your avatar in the header to access profile or logout

---

## 🔄 Stopping the Server

## 🎉 Success!

Press `Ctrl + C` in the terminal to stop the development server.

Your full-stack application is now running with:

- ✅ React frontend## ✨ Next Steps

- ✅ Express.js backend

- ✅ PostgreSQL database1. Explore different user roles by logging out and logging in with different credentials

- ✅ JWT authentication2. Try the dark mode toggle

3. Navigate through all pages to see the complete functionality

---4. Check the Project Details page for the issues tracking system



## Troubleshooting## 📚 Additional Documentation



### Backend won't startSee `README.md` for complete documentation including:

- Full feature list

**"database does not exist"**- Technical details

```bash- Project structure

createdb ui_ux_comparison- Build instructions

npm run db:migrate

```---



**"port 5000 already in use"****Enjoy exploring your UI/UX Comparison Tool!** 🎉

```bash
lsof -ti:5000 | xargs kill -9
```

### Frontend won't connect

- Check backend is running at http://localhost:5000
- Check .env file has: `VITE_API_BASE_URL=http://localhost:5000/api`

### Login not working

- Verify backend is running
- Check browser console for errors
- Re-run migration: `npm run db:migrate`

---

## Default Credentials

**Admin Account:**
- Email: admin@example.com
- Password: admin123

---

## Documentation

- 📖 **FRONTEND_INTEGRATION_COMPLETE.md** - Technical details
- 📖 **FULL_SETUP_GUIDE.md** - Comprehensive setup
- 📖 **backend/README.md** - API documentation
