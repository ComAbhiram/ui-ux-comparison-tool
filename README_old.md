# UI/UX Comparison Tool

A comprehensive project management and issue tracking system built with React, TypeScript, and Tailwind CSS. This application provides role-based access for Admin, QA, and Developer users to manage projects, track issues, and collaborate effectively.

## Features

### 🔐 Authentication
- Role-based login (Admin, QA, Developer)
- Secure authentication with context-based state management
- Demo credentials available for testing

### 👥 User Management (Admin Only)
- View all users with detailed information
- Add, edit, and delete user accounts
- Role-based access control
- User status tracking

### 📊 Dashboard
- Project overview with status indicators
- Progress tracking
- Issue statistics
- Quick access to project details

### 🎯 Project Management
- Comprehensive project listing
- Project details with timeline
- Team member management
- Status tracking (Active, Completed, On Hold, Cancelled)

### 🐛 Issue Tracking
- Create and manage issues
- Issue categorization (Bug, Enhancement, Correction)
- Severity levels (Low, Medium, High, Critical)
- Status workflow (Open, In Progress, Fixed, Closed, Reopen)
- Assignment to team members
- Detailed issue descriptions

### 📈 Activity Feed
- Real-time project activity tracking
- User action history
- Timestamp-based activity log

### 🎨 Theme Support
- Light and dark mode
- Persistent theme preferences
- System-wide theme toggle

### 👤 User Profile
- Personal information management
- Account statistics
- Profile editing capabilities

### ⚙️ Settings
- Appearance customization
- Notification preferences
- Security settings
- Account management

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **Icons**: Material Symbols
- **Fonts**: Inter

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd ui-ux-comparison-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Demo Credentials

You can log in with any of these demo accounts:

### Admin
- **Email**: sarah.johnson@company.com
- **Role**: Admin
- **Password**: any

### Developer
- **Email**: michael.chen@company.com
- **Role**: Developer
- **Password**: any

### QA
- **Email**: emily.rodriguez@company.com
- **Role**: QA
- **Password**: any

## Project Structure

```
ui-ux-comparison-tool/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── data/            # Mock data
│   │   └── mockData.ts
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── ProjectDetails.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
└── README.md           # Project documentation
```

## Features by Role

### Admin
- Full access to all features
- User management
- Project creation and management
- View all issues across projects
- System settings

### QA
- View assigned projects
- Report and track issues
- Update issue status
- View project activity

### Developer
- View assigned projects
- Update issue status
- Mark issues as fixed
- View project timeline

## Color Scheme

The application uses a carefully selected color palette:

- **Primary**: #197fe6 (Blue)
- **Background Light**: #f6f7f8
- **Background Dark**: #111921
- **Card Light**: #ffffff
- **Card Dark**: #18232f

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a demo project created based on design specifications. For modifications:

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is created for demonstration purposes.

## Acknowledgments

- Design inspiration from modern UI/UX patterns
- Material Symbols for icons
- Tailwind CSS for styling utilities
- React community for excellent documentation
