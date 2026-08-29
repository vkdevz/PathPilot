'use client';

import React, { useEffect, useState } from 'react';
import {
  Bot,
  Sparkles,
  HelpCircle,
  Code2,
  Compass,
  History,
  MessageSquare,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import type { LearningPath, ConversationSummary } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { AIChat } from '../../components/assistant/AIChat';

export default function AssistantPage() {
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  useEffect(() => {
    apiClient.getRoadmap().then(setRoadmap).catch(console.error);
    apiClient.getAIConversations().then(setConversations).catch(console.error);
  }, []);

  const items = roadmap?.items || roadmap?.milestones || [];
  const activeMilestone =
    items.find((m) => m.status === 'available') ||
    items.find((m) => m.status === 'in_progress') ||
    items[0];

  return (
    <AppShell
      pageTitle="AI Learning Navigator"
      pageSubtitle="Your personal technical mentor grounded in your verified learning roadmap and skills."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chat UI Main Area (3 Cols) */}
        <div className="lg:col-span-3">
          <AIChat
            careerTrack={roadmap?.career_name || 'Data Scientist'}
            activeSkill={activeMilestone?.skill_name || 'Machine Learning Fundamentals'}
          />
        </div>

        {/* Right Sidebar: Contextual Learner Guidance */}
        <div className="space-y-6">
          {/* Active Context Card */}
          <div className="glass-panel rounded-3xl p-6 space-y-3">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Active Learner Context
            </span>
            <div>
              <span className="text-xs text-slate-400">Target Track:</span>
              <h4 className="text-sm font-bold text-white">
                {roadmap?.career_name || 'Data Scientist'}
              </h4>
            </div>

            {activeMilestone && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">Current Milestone:</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <h4 className="text-xs font-bold text-indigo-300">
                    {activeMilestone.skill_name}
                  </h4>
                </div>
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          {conversations.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Recent Sessions</span>
              </div>
              <div className="space-y-2">
                {conversations.slice(0, 3).map((conv) => (
                  <div
                    key={conv.id}
                    className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1 hover:border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-[11px] truncate max-w-[150px]">
                        {conv.title}
                      </span>
                      <span className="text-[10px] text-slate-500">{conv.message_count} msgs</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {conv.last_message_preview}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities Guide */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Assistant Capabilities
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Code2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Explain algorithmic implementations & write Python/SQL snippets.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Break down quiz question rationale and statistical intuition.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Provide industry context on how skills are evaluated in interviews.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
