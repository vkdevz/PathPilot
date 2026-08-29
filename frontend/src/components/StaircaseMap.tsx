import React, { useState } from 'react';
import { Skill, Recommendation } from '../types';
import { CheckCircle2, Lock, Star, Play, Sparkles, Clock, ArrowRight, Shield, Award, AlertTriangle, Zap, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaircaseMapProps {
  skills: Skill[];
  topicScores?: Record<string, number>;
  recommendations?: Recommendation[];
  completedSkillIds?: string[];
  onSelectSkill: (skill: Skill) => void;
  onCompleteSkill?: (skillId: string) => void;
  targetRoleName?: string;
}

// Custom Original SVG Anime Hero Avatar Component
const AnimeHeroAvatar: React.FC<{ isMoving?: boolean }> = ({ isMoving }) => (
  <div className={`relative flex flex-col items-center justify-center transition-all duration-700 transform ${isMoving ? '-translate-y-4 scale-110' : 'animate-bounce'}`} style={{ animationDuration: '3s' }}>
    {/* Celestial Aura Ring */}
    <div className="absolute -inset-2 bg-gradient-to-tr from-brand-400 via-amber-300 to-sky-400 rounded-full blur-md opacity-80 animate-pulse" />
    
    {/* Anime Character Container */}
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-600 via-brand-600 to-sky-500 border-2 border-amber-300 shadow-xl flex items-center justify-center overflow-visible">
      {/* SVG Anime Hero Head & Outfit */}
      <svg className="w-10 h-10 overflow-visible" viewBox="0 0 100 100" fill="none">
        {/* Hair Back */}
        <path d="M20 50 C 15 20, 85 20, 80 50 C 90 70, 75 90, 75 90 C 75 90, 25 90, 25 90 C 25 90, 10 70, 20 50 Z" fill="#312E81" />
        
        {/* Face */}
        <ellipse cx="50" cy="52" rx="26" ry="24" fill="#FDE68A" />
        
        {/* Eyes (Expressive Anime Eyes) */}
        <ellipse cx="38" cy="48" rx="5" ry="7" fill="#1E1B4B" />
        <ellipse cx="62" cy="48" rx="5" ry="7" fill="#1E1B4B" />
        {/* Eye Highlights */}
        <circle cx="36" cy="45" r="2" fill="#FFFFFF" />
        <circle cx="60" cy="45" r="2" fill="#FFFFFF" />
        
        {/* Anime Hair Bangs */}
        <path d="M24 40 Q 35 25 50 40 Q 65 25 76 40 Q 50 15 24 40 Z" fill="#4338CA" />
        <path d="M42 35 Q 50 20 58 35 Z" fill="#6366F1" />
        
        {/* Confident Smile */}
        <path d="M43 62 Q 50 68 57 62" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        
        {/* Hero Headband / Crown */}
        <rect x="25" y="32" width="50" height="6" rx="3" fill="#F59E0B" />
        <circle cx="50" cy="35" r="4" fill="#60A5FA" />
      </svg>
    </div>

    {/* Hero Floating Title Badge */}
    <div className="absolute -top-6 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider border border-amber-200 shadow-md flex items-center space-x-1 whitespace-nowrap">
      <span>⚡ HERO</span>
    </div>
  </div>
);

export const StaircaseMap: React.FC<StaircaseMapProps> = ({
  skills,
  topicScores = {},
  recommendations = [],
  completedSkillIds = [],
  onSelectSkill,
  onCompleteSkill,
  targetRoleName = 'Career Destination'
}) => {
  const [selectedSkillNode, setSelectedSkillNode] = useState<Skill | null>(null);
  const [heroMovingId, setHeroMovingId] = useState<string | null>(null);

  // Sort skills chronologically by level / prerequisite chain
  const sortedSkills = [...skills].sort((a, b) => a.level - b.level);
  const completedSet = new Set(completedSkillIds);

  // Find active step index: first uncompleted skill whose prerequisites are satisfied
  let activeIndex = sortedSkills.findIndex(s => {
    if (completedSet.has(s.id)) return false;
    // Check if prerequisites are satisfied
    const prereqsDone = s.prerequisites.every(pId => completedSet.has(pId));
    return prereqsDone;
  });

  if (activeIndex === -1) {
    // If all completed or none unlocked, active is last or first
    const uncompleted = sortedSkills.findIndex(s => !completedSet.has(s.id));
    activeIndex = uncompleted !== -1 ? uncompleted : sortedSkills.length - 1;
  }

  const handleStepComplete = (skill: Skill) => {
    setHeroMovingId(skill.id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (onCompleteSkill) {
      onCompleteSkill(skill.id);
    }

    setTimeout(() => {
      setHeroMovingId(null);
      setSelectedSkillNode(null);
    }, 800);
  };

  // Zigzag alignment offset calculation for mountain staircase aesthetic
  const getOffsetClass = (index: number) => {
    const step = index % 4;
    switch (step) {
      case 0: return 'translate-x-0';
      case 1: return 'translate-x-8 sm:translate-x-20';
      case 2: return 'translate-x-16 sm:translate-x-40';
      case 3: return 'translate-x-8 sm:translate-x-20';
      default: return 'translate-x-0';
    }
  };

  return (
    <div className="relative py-12 px-4 flex flex-col items-center w-full max-w-4xl mx-auto">
      
      {/* Career Goal Trophy Header */}
      <div className="mb-10 text-center flex flex-col items-center space-y-2 z-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 border-4 border-amber-100 shadow-glow-gold flex items-center justify-center text-3xl sm:text-4xl animate-pulse">
          🏆
        </div>
        <span className="px-4 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-widest">
          CAREER DESTINATION
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{targetRoleName}</h2>
      </div>

      {/* Staircase Pathway Container */}
      <div className="w-full flex flex-col items-center relative z-10 space-y-10 sm:space-y-14">
        
        {/* Background Glowing Energy Beam Path */}
        <div className="absolute top-12 bottom-12 w-2 bg-gradient-to-b from-amber-400 via-brand-500 to-sky-400 opacity-40 rounded-full blur-[2px] pointer-events-none" />

        {/* Reverse mapping so Career Goal is at TOP and START is at BOTTOM */}
        {[...sortedSkills].reverse().map((skill, reverseIndex) => {
          const originalIndex = sortedSkills.length - 1 - reverseIndex;
          const score = topicScores[skill.id] || 0;
          const isCompleted = completedSet.has(skill.id) || score >= 80;
          const isActive = originalIndex === activeIndex;

          // Check if prerequisites are satisfied
          const prereqsSatisfied = skill.prerequisites.length === 0 || skill.prerequisites.every(p => completedSet.has(p));
          const isLocked = !isCompleted && !prereqsSatisfied;

          const isWeak = !isCompleted && score > 0 && score < 50;
          const isModerate = !isCompleted && score >= 50 && score < 80;

          // Node style mapping based on state
          let nodeBg = 'bg-white border-slate-300 text-slate-400';
          let statusBadge = 'Locked Step';
          let statusColor = 'bg-slate-100 text-slate-500 border-slate-200';

          if (isCompleted) {
            nodeBg = 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-300 text-white shadow-glow-emerald';
            statusBadge = '✨ Mastered Milestone';
            statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          } else if (isActive) {
            nodeBg = 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 border-amber-300 text-white shadow-glow-celestial ring-4 ring-amber-300/60 animate-pulse';
            statusBadge = '⚡ ACTIVE QUEST';
            statusColor = 'bg-brand-100 text-brand-800 border-brand-300';
          } else if (isWeak) {
            nodeBg = 'bg-rose-50 border-rose-300 text-rose-600 shadow-sm';
            statusBadge = '⚠ Skill Gap Needed';
            statusColor = 'bg-rose-100 text-rose-800 border-rose-300';
          } else if (isModerate) {
            nodeBg = 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm';
            statusBadge = '🟡 Developing';
            statusColor = 'bg-amber-100 text-amber-800 border-amber-300';
          }

          return (
            <div
              key={skill.id}
              className={`flex items-center space-x-4 sm:space-x-6 transition-all duration-500 ${getOffsetClass(originalIndex)}`}
            >
              
              {/* Anime Character Avatar positioned on the Active Step */}
              {isActive && (
                <div className="absolute -left-14 sm:-left-18 z-30 pointer-events-none">
                  <AnimeHeroAvatar isMoving={heroMovingId === skill.id} />
                </div>
              )}

              {/* Staircase Step Node Button */}
              <button
                onClick={() => {
                  setSelectedSkillNode(skill);
                  onSelectSkill(skill);
                }}
                className={`relative group w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-3 flex flex-col items-center justify-center transition-all transform hover:scale-115 active:scale-95 ${nodeBg}`}
              >
                {/* Level / Step Badge */}
                <span className="absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-white border border-slate-300 text-brand-700 shadow-sm">
                  Step {originalIndex + 1}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.5]" />
                ) : isActive ? (
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                ) : isLocked ? (
                  <Lock className="w-7 h-7 text-slate-400" />
                ) : (
                  <Play className="w-7 h-7 text-slate-600 ml-1" />
                )}
              </button>

              {/* Step Card Description */}
              <div
                onClick={() => {
                  setSelectedSkillNode(skill);
                  onSelectSkill(skill);
                }}
                className={`cursor-pointer glass-panel p-4 sm:p-5 rounded-3xl border transition-all duration-300 w-64 sm:w-80 ${
                  isActive
                    ? 'border-brand-400 bg-white/90 shadow-xl ring-2 ring-brand-200'
                    : 'border-slate-200 bg-white/70 hover:border-brand-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusColor}`}>
                    {statusBadge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{skill.estimated_minutes}m</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-brand-600 transition-colors">
                  {skill.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{skill.description}</p>
              </div>

            </div>
          );
        })}

      </div>

      {/* Staircase Start Base */}
      <div className="mt-12 pt-6 border-t-2 border-dashed border-slate-200 text-center z-10 flex flex-col items-center">
        <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-black text-slate-600 flex items-center space-x-2">
          <Compass className="w-4 h-4 text-brand-600" />
          <span>STARTING POINT — NOVICE APPRENTICE</span>
        </div>
      </div>

      {/* Selected Skill Modal Details */}
      {selectedSkillNode && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-3xl border border-brand-200 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-5">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-100 text-brand-800 border border-brand-200">
                  {selectedSkillNode.category}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">{selectedSkillNode.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSkillNode(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              {selectedSkillNode.description}
            </p>

            {/* Tools & Prerequisites */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500">Estimated Effort:</span>
                <span className="font-extrabold text-slate-900 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  <span>{selectedSkillNode.estimated_minutes} Minutes</span>
                </span>
              </div>

              {selectedSkillNode.tools && selectedSkillNode.tools.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-500 block">Current Industry Tools:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedSkillNode.tools.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-extrabold text-slate-800 text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedSkillNode(null)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Close
              </button>
              
              <button
                onClick={() => handleStepComplete(selectedSkillNode)}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 hover:scale-105 text-white text-xs font-black shadow-glow-celestial flex items-center justify-center space-x-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Mark Quest Complete!</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
