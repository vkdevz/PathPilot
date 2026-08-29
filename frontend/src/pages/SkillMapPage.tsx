import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Swords, Clock } from 'lucide-react';

export const SkillMapPage: React.FC = () => {
  const { selectedCareer, setActiveView } = useAuth();

  if (!selectedCareer) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No career path selected yet. Please select a career path.</p>
      </div>
    );
  }

  const categories = ['Foundation', 'Core Skills', 'Advanced Skills', 'Industry Readiness'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-100 text-brand-800 border border-brand-200 uppercase tracking-wider">
              Stage 2 — Role Market Skill Map
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
              Prototype Market Dataset • Live API Modular
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            What does the industry expect from a {selectedCareer.name}?
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            PathPilot has generated the required technical skill graph and prerequisite map for <strong className="text-brand-600">{selectedCareer.name}</strong>.
          </p>
        </div>

        <button
          onClick={() => setActiveView('assessment')}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-105 text-white font-extrabold text-sm shadow-glow-celestial transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Swords className="w-4 h-4" />
          <span>Discover What I Already Know</span>
        </button>
      </div>

      {/* Category Tiers / Realms */}
      <div className="space-y-8">
        {categories.map((catName, catIdx) => {
          const categorySkills = selectedCareer.skills.filter(s => s.category === catName);
          if (categorySkills.length === 0) return null;

          return (
            <div key={catName} className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  0{catIdx + 1}
                </div>
                <h3 className="text-xl font-black text-slate-900">{catName} Realm</h3>
                <span className="text-xs text-slate-500 font-semibold">({categorySkills.length} Modules)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 transition-all flex flex-col justify-between space-y-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-brand-50 text-brand-700 border border-brand-200">
                          Lvl {skill.level}
                        </span>
                        <span className="flex items-center space-x-1 text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{skill.estimated_minutes}m</span>
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">{skill.name}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{skill.description}</p>
                    </div>

                    {skill.prerequisites.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700">Prerequisites: </span>
                        <span>{skill.prerequisites.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* CTA Footer */}
      <div className="glass-panel p-8 rounded-3xl border border-brand-300 text-center space-y-4 shadow-soft-lg">
        <h3 className="text-2xl font-black text-slate-900">Ready to discover your starting power?</h3>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Take your 5-minute skill assessment to measure your current abilities and unlock your custom staircase roadmap.
        </p>
        <div>
          <button
            onClick={() => setActiveView('assessment')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-105 text-white font-black text-base shadow-glow-celestial transition-all flex items-center space-x-2 mx-auto"
          >
            <span>Begin Knowledge Quest</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
