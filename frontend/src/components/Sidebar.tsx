import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MapPin, 
  FileCheck2, 
  Swords, 
  Trophy, 
  CalendarDays, 
  Sparkles, 
  Settings, 
  LogOut,
  Target,
  Compass
} from 'lucide-react';

interface SidebarProps {
  onOpenChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenChat }) => {
  const { activeView, setActiveView, logout, selectedCareer } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'skill-map', label: 'My Journey', icon: MapPin },
    { id: 'assessment', label: 'Knowledge Quests', icon: Swords },
    { id: 'skill-report', label: 'Skill Report', icon: FileCheck2 },
    { id: 'analytics', label: 'Progress Calendar', icon: CalendarDays },
    { id: 'leaderboard', label: 'Guild Leaderboard', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/80 hidden md:flex flex-col justify-between py-6 px-4 shrink-0 min-h-[calc(100vh-4rem)] bg-white/60">
      <div className="space-y-6">
        
        {/* Selected Career Goal Card */}
        {selectedCareer && (
          <div 
            onClick={() => setActiveView('career-selection')}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50 via-purple-50 to-sky-50 border border-brand-200 cursor-pointer hover:border-brand-400 transition-all group shadow-sm"
          >
            <div className="flex items-center space-x-2 text-[10px] text-brand-700 font-extrabold uppercase tracking-wider mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Heroic Career Path</span>
            </div>
            <div className="font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center justify-between text-sm">
              <span>{selectedCareer.name}</span>
              <span className="text-[11px] text-slate-500 font-normal underline">Change</span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-glow-celestial font-extrabold'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer AI & Logout */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <button
          onClick={onOpenChat}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-100 via-sky-100 to-amber-50 border border-brand-200 text-brand-900 hover:border-brand-400 transition-all text-xs font-extrabold shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>PathPilot AI Companion</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
