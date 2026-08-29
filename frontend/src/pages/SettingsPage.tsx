import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Target, LogOut, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, selectedCareer, logout, setActiveView } = useAuth();
  
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'alex@pathpilot.ai');
  const [dailyGoal, setDailyGoal] = useState('20');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Profile & Account Settings
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Manage your hero profile, daily learning goals, and account details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm bg-white">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-brand-600" />
            <span>Personal Hero Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Career & Quest Preferences */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm bg-white">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <span>Quest Preferences</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Active Career Goal Track</label>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm">{selectedCareer?.name || 'Data Scientist'}</span>
                <button
                  type="button"
                  onClick={() => setActiveView('career-selection')}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-100 text-brand-800 border border-brand-200 text-xs font-black hover:bg-brand-200 transition-colors"
                >
                  Change Path
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Daily Quest Time Goal</label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
              >
                <option value="10">10 Minutes / day (Casual Quest)</option>
                <option value="20">20 Minutes / day (Recommended Quest)</option>
                <option value="45">45 Minutes / day (Serious Quest)</option>
                <option value="60">60 Minutes / day (Intensive Quest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-emerald-600 text-xs font-black flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Hero Preferences Saved Successfully!</span>
            </span>
          ) : <span />}

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs shadow-glow-celestial transition-all"
          >
            Save Changes
          </button>
        </div>

      </form>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-slate-200">
        <button
          onClick={logout}
          className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs flex items-center justify-center space-x-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Hero Account</span>
        </button>
      </div>

    </div>
  );
};
