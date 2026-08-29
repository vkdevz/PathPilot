import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MarketIntelligenceEngine, CAREER_CATEGORIES, MarketRoleRequirement } from '../services/marketIntelligence';
import { Career } from '../types';
import { ArrowRight, CheckCircle2, Sparkles, Search, Compass, Target, Layers } from 'lucide-react';

export const CareerSelectionPage: React.FC = () => {
  const { setSelectedCareer, setActiveView } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All Categories');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('data_scientist');

  // Filter roles dynamically based on search and category
  let displayedRoles: MarketRoleRequirement[] = [];
  if (searchQuery.trim()) {
    displayedRoles = MarketIntelligenceEngine.searchRoles(searchQuery);
  } else {
    displayedRoles = MarketIntelligenceEngine.getRolesByCategory(activeCategory);
  }

  const selectedRole = MarketIntelligenceEngine.getRoleById(selectedRoleId);

  const handleRevealPath = () => {
    const careerObj: Career = MarketIntelligenceEngine.getCareerObject(selectedRoleId);
    setSelectedCareer(careerObj);
    setActiveView('skill-map');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Stage Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-black bg-brand-100 text-brand-800 border border-brand-200 uppercase tracking-wider">
          Stage 1 — Destination Discovery
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
          What do you want to become?
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          PathPilot dynamically maps current industry market expectations for technology careers across Data, AI, Cloud, Software, and Cybersecurity.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="max-w-4xl mx-auto mb-10 space-y-6">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any career role... (e.g., Data Scientist, Cloud Engineer, Cybersecurity, Penetration Tester)"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-sm sm:text-base text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CAREER_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat && !searchQuery;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(cat);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {displayedRoles.map((role) => {
          const isSelected = role.roleId === selectedRoleId;

          return (
            <div
              key={role.roleId}
              onClick={() => setSelectedRoleId(role.roleId)}
              className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 relative border flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-brand-50 via-white to-white border-brand-500 shadow-glow-celestial ring-2 ring-brand-400'
                  : 'glass-card border-slate-200 hover:border-brand-300 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-emerald-600 bg-emerald-50 p-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-3xl">
                    {role.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                    {role.category}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1">{role.roleName}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-2">{role.description}</p>

                {/* Market Intelligence Skills Preview */}
                <div className="pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Expected Market Skills ({role.skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.skills.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {s.name}
                        </span>
                      ))}
                      {role.skills.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-400">
                          +{role.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-brand-600">
                <span>{isSelected ? 'Role Selected ✓' : 'Select This Role'}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Role Expectation Banner & CTA */}
      <div className="sticky bottom-6 z-30 max-w-3xl mx-auto glass-panel p-6 rounded-3xl border border-brand-300 shadow-2xl bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-brand-700 text-xs font-black mb-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>PATHPILOT MARKET INTELLIGENCE</span>
          </div>
          <p className="text-slate-900 font-extrabold text-sm sm:text-base">
            PathPilot will build your journey based on the skills currently expected for <span className="text-brand-600">{selectedRole.roleName}</span>.
          </p>
        </div>

        <button
          onClick={handleRevealPath}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-105 text-white font-black text-base shadow-glow-celestial transition-all flex items-center justify-center space-x-2.5 whitespace-nowrap"
        >
          <span>Reveal My Path</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
