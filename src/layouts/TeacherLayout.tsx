import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu,
  School,
  X,
  UserCircle
} from 'lucide-react';

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/teacher', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col
        transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500/20 p-1.5 rounded-lg text-indigo-400">
               <School className="w-5 h-5" />
             </div>
             <span className="text-lg font-bold text-white tracking-tight">Teacher<span className="text-slate-400 font-medium">Panel</span></span>
          </div>
          {/* Close button on mobile */}
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/teacher'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'hover:bg-slate-800 hover:text-white'}
              `}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 bg-slate-800/50 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors border border-slate-700/50 hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>ចាកចេញ (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content (Right Side) */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
               <span className="font-black text-slate-800 md:text-lg">សាកលវិទ្យាល័យពុទ្ធិ</span>
               <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">Teacher</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <UserCircle className="w-6 h-6 text-indigo-600" />
                <span className="text-sm font-bold text-slate-700 max-w-[120px] truncate hidden sm:block">{user?.name}</span>
             </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 w-full relative">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
