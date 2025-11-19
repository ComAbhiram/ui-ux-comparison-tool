# Quick Start Guide

## 🚀 Getting Started

Your UI/UX Comparison Tool is ready to use! The application is currently running at:

**http://localhost:5173/**

## 📝 Login Instructions

1. Open your browser and navigate to http://localhost:5173/
2. Select your role: Admin, QA, or Developer
3. Enter any of these demo credentials:

### Admin Access
```
Email: sarah.johnson@company.com
Role: Admin
Password: any
```

### Developer Access
```
Email: michael.chen@company.com
Role: Developer
Password: any
```

### QA Access
```
Email: emily.rodriguez@company.com
Role: QA
Password: any
```

## 🎯 Features to Explore

### As Admin:
- ✅ View all projects on the Dashboard
- ✅ Manage users in User Management page
- ✅ Create new projects
- ✅ View detailed project information
- ✅ Track all issues
- ✅ Access Settings

### As Developer:
- ✅ View assigned projects
- ✅ Track project issues
- ✅ Update issue status
- ✅ View project activity
- ✅ Manage profile

### As QA:
- ✅ View assigned projects
- ✅ Report new issues
- ✅ Track issue status
- ✅ View project details
- ✅ Manage profile

## 🎨 Theme Toggle

Click the sun/moon icon in the header to switch between light and dark modes!

## 📂 Project Structure

```
ui-ux-comparison-tool/
├── src/
│   ├── components/       # UI components (Header, Sidebar, Layout)
│   ├── context/         # State management (Auth, Theme)
│   ├── data/            # Mock data
│   ├── pages/           # Main pages
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── ProjectDetails.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── types/           # TypeScript definitions
│   └── App.tsx          # Main app with routing
└── ...config files
```

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 💡 Tips

1. **Navigation**: Use the sidebar to navigate between pages
2. **Project Details**: Click any project in the Dashboard to view details
3. **Issues Tab**: View and manage project issues
4. **Activity Tab**: See project activity timeline
5. **Profile**: Click your avatar in the header to access profile or logout

## 🔄 Stopping the Server

Press `Ctrl + C` in the terminal to stop the development server.

## ✨ Next Steps

1. Explore different user roles by logging out and logging in with different credentials
2. Try the dark mode toggle
3. Navigate through all pages to see the complete functionality
4. Check the Project Details page for the issues tracking system

## 📚 Additional Documentation

See `README.md` for complete documentation including:
- Full feature list
- Technical details
- Project structure
- Build instructions

---

**Enjoy exploring your UI/UX Comparison Tool!** 🎉
