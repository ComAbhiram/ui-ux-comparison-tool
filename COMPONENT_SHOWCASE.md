# 📸 Component Showcase

## Pages Overview

### 🔐 1. Login Page (`/login`)
**Route:** `/login`
**Access:** Public
**Features:**
- Role selector (Admin, QA, Developer)
- Email and password inputs
- Demo credentials display
- Responsive design
- Theme-aware styling

**Demo Credentials Card:**
```
Admin: sarah.johnson@company.com
Developer: michael.chen@company.com
QA: emily.rodriguez@company.com
Password: any
```

---

### 📊 2. Dashboard (`/dashboard`)
**Route:** `/dashboard` or `/`
**Access:** All authenticated users
**Features:**
- Welcome message with user name
- Projects table with:
  - Project name and description
  - Status badges (Active, Completed, On Hold, Cancelled)
  - Issue count
  - Progress bar with percentage
  - Team member avatars
  - Timeline dates
  - Quick view action
- Create New Project button (Admin only)
- Responsive table layout

**Table Columns:**
- Project Name (with description)
- Status (badge)
- Issues (count)
- Progress (bar + percentage)
- Members (avatar stack)
- Timeline (start/end dates)
- Actions (view button)

---

### 👥 3. User Management (`/users`)
**Route:** `/users`
**Access:** Admin only
**Features:**
- Page heading with description
- Add User button
- Users table with:
  - User avatar and name
  - Email address
  - Role badge (Admin, Developer, QA)
  - Status badge (Active, Inactive)
  - Last active timestamp
  - Edit and delete actions
- Add User modal (basic structure)

**Role Badge Colors:**
- Admin: Purple
- Developer: Blue
- QA: Orange

---

### 📁 4. Project Details (`/projects/:id`)
**Route:** `/projects/[projectId]`
**Access:** All authenticated users
**Features:**
- Breadcrumb navigation
- Project header with title and description
- Report New Issue button
- Info cards showing:
  - Project status
  - Progress percentage
  - Open issues count
  - Team members count
- Tabs: Issues | Activity
- Issues table with columns:
  - Bug ID
  - Module name
  - Type (Bug, Enhancement, Correction)
  - Severity (Low, Medium, High, Critical)
  - Status (Open, In Progress, Fixed, Closed)
  - Assigned developer with avatar
  - Description preview
- Activity feed showing:
  - User avatar
  - Action type
  - Details
  - Timestamp

**Severity Colors:**
- Critical: Red
- High: Orange
- Medium: Yellow
- Low: Green

**Status Colors:**
- Open: Blue
- In Progress: Purple
- Fixed: Green
- Closed: Gray
- Reopen: Orange

---

### 👤 5. Profile Page (`/profile`)
**Route:** `/profile`
**Access:** All authenticated users
**Features:**
- Page heading
- Profile card with:
  - Large avatar (80px)
  - Name and email
  - Role badge
  - Edit Profile button
- Personal Information section:
  - Full Name (editable)
  - Email Address (editable)
  - Role (read-only)
  - Status (read-only)
- Account Statistics cards:
  - Projects count
  - Issues Reported count
  - Issues Resolved count
- Save/Cancel buttons (when editing)

---

### ⚙️ 6. Settings Page (`/settings`)
**Route:** `/settings`
**Access:** Admin (can be extended to all users)
**Features:**

**Appearance Section:**
- Theme toggle (Light/Dark mode)
- Visual toggle switch

**Notifications Section:**
- Email Notifications toggle
- Push Notifications toggle
- Visual toggle switches

**Security Section:**
- Change Password button
- Two-Factor Authentication button
- Icons and descriptions

**Danger Zone:**
- Delete Account button
- Red warning styling

---

## 🧩 Reusable Components

### Layout (`Layout.tsx`)
- Wraps all authenticated pages
- Contains Sidebar and Header
- Outlet for page content

### Sidebar (`Sidebar.tsx`)
**Features:**
- App logo with role indicator
- Navigation items:
  - Dashboard
  - Users (Admin only)
  - My Profile
  - Settings (Admin only)
- Active state highlighting
- Role-based filtering

### Header (`Header.tsx`)
**Features:**
- Page title (dynamic based on role)
- Theme toggle button
- Notifications dropdown
- User profile menu with:
  - Avatar
  - Name, email, role
  - My Profile link
  - Logout button
- Dropdown menus with click-away detection

---

## 🎨 Design Tokens

### Colors
```javascript
primary: "#197fe6"           // Primary blue
background-light: "#f6f7f8"  // Light mode background
background-dark: "#111921"   // Dark mode background
card-light: "#ffffff"        // Light mode cards
card-dark: "#18232f"         // Dark mode cards
```

### Typography
```javascript
Font Family: Inter
Font Weights: 400, 500, 600, 700, 800, 900
```

### Spacing
- Padding: p-4, p-6, p-8
- Gaps: gap-2, gap-4, gap-6
- Margins: mb-4, mb-6, mt-2

### Border Radius
- Default: 0.5rem
- Large: 0.75rem
- XL: 1rem
- Full: 9999px (circles)

### Shadows
- soft: Subtle shadow for cards
- soft-lg: Larger shadow for modals

---

## 📱 Responsive Breakpoints

```javascript
sm: 640px   // Small devices
md: 768px   // Medium devices  
lg: 1024px  // Large devices
xl: 1280px  // Extra large
```

**Responsive Features:**
- Grid layouts adapt to screen size
- Tables become scrollable on mobile
- Sidebar can be collapsed (structure ready)
- Modal sizes adjust

---

## 🎭 State Management

### AuthContext
- Current user
- Login function
- Logout function
- isAuthenticated flag

### ThemeContext
- isDark flag
- toggleTheme function
- Persistent in localStorage

---

## 🔗 Navigation Flow

```
Login (/login)
    ↓
Dashboard (/dashboard)
    ├─→ Project Details (/projects/:id)
    │       ├─→ Issues Tab
    │       └─→ Activity Tab
    ├─→ User Management (/users) [Admin only]
    ├─→ Profile (/profile)
    └─→ Settings (/settings) [Admin only]
        
Profile Menu (Header)
    ├─→ My Profile
    └─→ Logout → Login
```

---

## 🎨 Interactive Elements

### Buttons
- Primary: Blue background, white text
- Secondary: Border, transparent background
- Danger: Red styling
- Icon buttons: Rounded, hover effect

### Tables
- Hover row effect
- Clickable rows
- Sticky headers
- Responsive scroll

### Badges
- Status indicators
- Role indicators
- Severity levels
- Rounded with colored backgrounds

### Toggle Switches
- Theme toggle
- Notification settings
- Smooth transitions
- Visual feedback

### Dropdowns
- Notifications
- Profile menu
- Click outside to close
- Smooth animations

---

## 🌈 Theme Comparison

### Light Mode
- White backgrounds (#ffffff)
- Dark text (#111827)
- Subtle borders (#d0dbe7)
- Clean, professional look

### Dark Mode
- Dark backgrounds (#111921)
- Light text (#f8fafc)
- Subtle borders (#334155)
- Easy on the eyes

**Toggle Location:** Top right in header (sun/moon icon)

---

## 🚀 Performance Features

- Vite for fast HMR (Hot Module Replacement)
- Code splitting with React Router
- Optimized bundle size
- Lazy loading ready structure
- Efficient re-renders with React best practices

---

## 💡 Tips for Customization

1. **Colors:** Edit `tailwind.config.js`
2. **Mock Data:** Edit `src/data/mockData.ts`
3. **Routes:** Edit `src/App.tsx`
4. **Layout:** Edit `src/components/Layout.tsx`
5. **Types:** Edit `src/types/index.ts`

---

This showcase covers all major components and pages in the application. Each element is fully functional and ready to use! 🎉
