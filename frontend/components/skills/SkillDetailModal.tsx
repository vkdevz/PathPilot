'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiClient } from '../../lib/api-client';
import type { PrerequisiteGraphResponse, SkillDetail } from '../../types';

interface SkillDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillSlug: string | null;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  isOpen,
  onClose,
  skillSlug,
}) => {
  const [graphData, setGraphData] = useState<PrerequisiteGraphResponse | null>(null);
  const [skillDetail, setSkillDetail] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !skillSlug) {
      setGraphData(null);
      setSkillDetail(null);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [graphRes, detailRes] = await Promise.allSettled([
          apiClient.getSkillPrerequisitesGraph(skillSlug),
          apiClient.getSkillDetail(skillSlug),
        ]);

        if (graphRes.status === 'fulfilled') setGraphData(graphRes.value);
        if (detailRes.status === 'fulfilled') setSkillDetail(detailRes.value);
      } catch (err) {
        console.error('Error loading skill detail modal:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, skillSlug]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={skillDetail ? skillDetail.name : 'Skill Graph Explorer'}
      maxWidth="xl"
    >
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Traversing prerequisite DAG and downstream dependencies...</p>
        </div>
      ) : skillDetail ? (
        <div className="space-y-6">
          <p className="text-xs text-indigo-400 font-medium -mt-3 mb-2">
            {skillDetail.domain || skillDetail.category} • Level {skillDetail.level} • {skillDetail.difficulty}
          </p>
          {/* Description & Overview */}

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {skillDetail.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Est. {skillDetail.estimated_minutes} mins
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                {skillDetail.resource_count || 0} Learning Resources
              </span>
              {graphData?.is_foundation && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Foundation Skill (Root)
                </span>
              )}
            </div>
          </div>

          {/* Upstream Prerequisites */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>Upstream Prerequisites ({graphData?.direct_prerequisites.length || 0})</span>
              </div>
              <span className="text-[11px] text-slate-500">Must be satisfied first</span>
            </div>

            {graphData && graphData.direct_prerequisites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {graphData.direct_prerequisites.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">{p.name}</h5>
                      <span className="text-[10px] text-slate-400">{p.domain || p.category}</span>
                    </div>
                    <Badge variant="amber" size="sm">Prerequisite</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No upstream prerequisites required. You can start this skill directly!</span>
              </div>
            )}
          </div>

          {/* Downstream Unlocked Skills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <ArrowDownRight className="w-4 h-4 text-cyan-400" />
                <span>Downstream Unlocked Skills ({graphData?.downstream_unlocked.length || 0})</span>
              </div>
              <span className="text-[11px] text-slate-500">Unlocked after mastering this skill</span>
            </div>

            {graphData && graphData.downstream_unlocked.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {graphData.downstream_unlocked.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">{d.name}</h5>
                      <span className="text-[10px] text-slate-400">{d.domain || d.category} • Depth +{d.depth}</span>
                    </div>
                    <Badge variant="cyan" size="sm">Unlocked</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400">
                Capstone competency with no further downstream prerequisites.
              </div>
            )}
          </div>

          {/* Modal Footer CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Link href="/recommendations">
              <Button variant="glow" size="sm" icon={<BookOpen className="w-3.5 h-3.5" />}>
                View Learning Resources
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          <p>Skill details unavailable.</p>
        </div>
      )}
    </Modal>
  );
};
