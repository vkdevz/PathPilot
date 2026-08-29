import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signup, setActiveView } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login(name || 'Alex Rivera', email || 'alex@pathpilot.ai');
    } else {
      signup(name || 'Alex Rivera', email || 'alex@pathpilot.ai');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl relative space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div 
            onClick={() => setActiveView('landing')}
            className="inline-flex items-center space-x-2 cursor-pointer mb-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-glow-celestial">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl text-slate-900">
              Path<span className="text-brand-600">Pilot</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {isLogin ? 'Welcome Back Hero' : 'Begin Your Heroic Journey'}
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Free to access • No payment required
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              isLogin ? 'bg-brand-600 text-white shadow-glow-celestial' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              !isLogin ? 'bg-brand-600 text-white shadow-glow-celestial' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@pathpilot.ai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-[1.02] text-white font-extrabold text-xs uppercase tracking-wider shadow-glow-celestial transition-all flex items-center justify-center space-x-2"
          >
            <span>{isLogin ? 'Sign In to Journey' : 'Create Free Hero Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            onClick={() => login('Alex Rivera', 'alex@pathpilot.ai')}
            className="w-full py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center space-x-2 border border-emerald-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Continue as Demo Guest (Free Access)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
