import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
          Manage your application preferences and settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-soft p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Theme</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-slate-200 dark:bg-primary"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-soft p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Receive email updates about your projects
                </p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  emailNotifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Push Notifications
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Receive push notifications in your browser
                </p>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  pushNotifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-soft p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Security</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                  lock
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Change Password
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Update your account password
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                  security
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add an extra layer of security
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 shadow-soft p-6">
          <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                  delete_forever
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium text-red-900 dark:text-red-400">
                    Delete Account
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-500">
                    Permanently delete your account and all data
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-red-400">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
