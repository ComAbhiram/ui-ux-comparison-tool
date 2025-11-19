import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
        
        {/* Attribution Footer */}
        <footer className="px-8 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-purple-500">code</span>
              Designed & Developed by 
              <span className="font-semibold text-slate-700 dark:text-slate-300">Abhiram P MOHAN</span>
              <span className="material-symbols-outlined text-sm text-red-500 animate-pulse">favorite</span>
            </p>
          </div>
        </footer>
      </div>
      
      {/* Sticky Attribution Badge - Mobile Visible */}
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg backdrop-blur-sm">
          <span className="material-symbols-outlined text-sm">code</span>
          <span className="text-xs font-medium">
            By Abhiram P MOHAN
          </span>
          <span className="material-symbols-outlined text-sm animate-pulse">favorite</span>
        </div>
      </div>
    </div>
  );
}
