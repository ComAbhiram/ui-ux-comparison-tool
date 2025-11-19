import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-10 py-3 bg-white dark:bg-background-dark sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
          {user?.role === 'Admin' ? 'Admin Dashboard' : user?.role === 'Developer' ? 'My Projects' : 'QA Dashboard'}
        </h2>
        
        {/* Developer Attribution */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full border border-purple-200/50 dark:border-purple-700/50">
          <span className="material-symbols-outlined text-sm text-purple-600 dark:text-purple-400">code</span>
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
            Crafted by Abhiram P MOHAN
          </span>
          <span className="material-symbols-outlined text-sm text-pink-500 animate-pulse">favorite</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-soft-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Notifications</h3>
              <div className="space-y-2">
                <div className="text-xs text-slate-600 dark:text-slate-400 p-2 rounded bg-slate-50 dark:bg-slate-800">
                  No new notifications
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: `url(${user?.avatar})` }}
            ></div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-soft-lg overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                <p className="text-xs text-primary mt-1">{user?.role}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">account_circle</span>
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
