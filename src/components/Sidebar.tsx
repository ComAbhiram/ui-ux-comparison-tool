import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['Admin', 'QA', 'Developer'] },
    { path: '/projects', icon: 'folder', label: 'Projects', roles: ['Admin', 'QA', 'Developer'] },
    { path: '/issues', icon: 'bug_report', label: 'Issues', roles: ['Admin', 'QA', 'Developer'] },
    { path: '/board', icon: 'grid_view', label: 'Board', roles: ['Admin', 'QA', 'Developer'] },
    { path: '/users', icon: 'group', label: 'Users', roles: ['Admin'] },
    { path: '/profile', icon: 'account_circle', label: 'My Profile', roles: ['Admin', 'QA', 'Developer'] },
    { path: '/settings', icon: 'settings', label: 'Settings', roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark sticky top-0">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-lg">compare</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-normal text-slate-900 dark:text-white">
                QA Bugtracking Tool
              </h1>
              <p className="text-sm font-normal leading-normal text-slate-500 dark:text-slate-400">
                {user?.role} Workspace
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 mt-4">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-normal transition-colors ${
                    isActive
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <p>{item.label}</p>
              </NavLink>
            ))}
            
            {/* External QA Track Link */}
            <a
              href="https://qateamiss.github.io/QAtrack/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-normal transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined">track_changes</span>
              <p>QA Track</p>
              <span className="material-symbols-outlined text-xs ml-auto">open_in_new</span>
            </a>
          </nav>
        </div>
      </div>
    </aside>
  );
}
