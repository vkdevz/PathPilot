import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Trophy, Compass, User, LogOut, Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat }) => {
  const { user, setActiveView, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView(user ? 'dashboard' : 'landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-amber-400 p-[2px] shadow-glow-celestial">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-brand-600 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">
            Path<span className="text-brand-600">Pilot</span>
          </span>
        </div>

        {/* Dynamic Navigation for Logged In vs Guest */}
        {user ? (
          <div className="flex items-center space-x-3 sm:space-x-6">
            
            {/* Streak Counter */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs sm:text-sm font-extrabold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span>{user.streak} Days</span>
            </div>

            {/* XP Points */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 text-xs sm:text-sm font-extrabold">
              <Trophy className="w-4 h-4 text-brand-600" />
              <span>{user.xp} XP</span>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-105 text-white text-xs sm:text-sm font-bold shadow-glow-celestial transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">PathPilot AI</span>
            </button>

            {/* User Profile Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all">
                <div className="w-7 h-7 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-xs text-white">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:inline pr-2">{user.name}</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 py-2 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                <button
                  onClick={() => setActiveView('settings')}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="hidden md:flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Free to access</span>
            </span>

            <button
              onClick={() => setActiveView('auth')}
              className="text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Log In
            </button>

            <button
              onClick={() => setActiveView('auth')}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:scale-105 text-white font-bold text-xs shadow-glow-celestial transition-all"
            >
              Get Started
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
