'use client';

import React, { useEffect, useState } from 'react';
import {
  Bot,
  Sparkles,
  HelpCircle,
  Code2,
  Compass,
  History,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Zap,
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
      pageSubtitle="Grounded learning navigator calibrated directly to your target career track, verified skills, and roadmap milestones."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat UI Main Area (3 Cols) */}
        <div className="lg:col-span-3">
          <AIChat
            careerTrack={roadmap?.career_name || 'Data Scientist'}
            activeSkill={activeMilestone?.skill_name || 'Python Foundations'}
          />
        </div>

        {/* Right Sidebar: Contextual Learner Guidance */}
        <div className="space-y-4">
          {/* Active Context Card */}
          <div className="surface-card rounded-2xl p-5 space-y-3 shadow-sm">
            <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-wider block">
              Active Learner Context
            </span>
            <div>
              <span className="text-xs text-[#6E6E73] dark:text-[#AEAEB2]">Target Track:</span>
              <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {roadmap?.career_name || 'Data Scientist'}
              </h4>
            </div>

            {activeMilestone && (
              <div className="pt-2 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
                <span className="text-xs text-[#6E6E73] dark:text-[#AEAEB2]">Active Milestone:</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                  <h4 className="text-xs font-bold text-[#007AFF]">
                    {activeMilestone.skill_name}
                  </h4>
                </div>
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          {conversations.length > 0 && (
            <div className="surface-card rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Recent Sessions</span>
              </div>
              <div className="space-y-2">
                {conversations.slice(0, 3).map((conv) => (
                  <div
                    key={conv.id}
                    className="p-2.5 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] space-y-1 hover:border-[#007AFF]/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[11px] truncate max-w-[150px]">
                        {conv.title}
                      </span>
                      <span className="text-[10px] text-[#86868B]">{conv.message_count} msgs</span>
                    </div>
                    <p className="text-[10px] text-[#6E6E73] dark:text-[#AEAEB2] truncate">
                      {conv.last_message_preview}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controlled Capabilities Guide */}
          <div className="surface-card rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7]">
              Supported Navigator Actions
            </h4>

            <div className="space-y-2.5 text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
              <div className="flex items-start gap-2">
                <Compass className="w-3.5 h-3.5 text-[#007AFF] shrink-0 mt-0.5" />
                <span>Immediate next milestone & prioritized study plan</span>
              </div>

              <div className="flex items-start gap-2">
                <Layers className="w-3.5 h-3.5 text-[#FF9F0A] shrink-0 mt-0.5" />
                <span>Prerequisite gap & bottleneck attribution</span>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#34C759] shrink-0 mt-0.5" />
                <span>Adaptive roadmap calibration reasons & history</span>
              </div>

              <div className="flex items-start gap-2">
                <Code2 className="w-3.5 h-3.5 text-[#007AFF] shrink-0 mt-0.5" />
                <span>Production Python & SQL patterns for active skills</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
