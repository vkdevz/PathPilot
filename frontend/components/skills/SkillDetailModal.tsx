'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  CheckCircle2,
  Clock,
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
        <div className="py-12 text-center text-xs text-[#86868B] space-y-3">
          <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Traversing prerequisite DAG and downstream dependencies...</p>
        </div>
      ) : skillDetail ? (
        <div className="space-y-5">
          <p className="text-xs text-[#007AFF] font-medium -mt-2 mb-1">
            {skillDetail.domain || skillDetail.category} • Level {skillDetail.level} • {skillDetail.difficulty}
          </p>

          {/* Description & Overview */}
          <div className="p-4 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] space-y-2">
            <p className="text-xs sm:text-sm text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
              {skillDetail.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#6E6E73] dark:text-[#AEAEB2] border-t border-[#E5E5EA] dark:border-[#38383A]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                Est. {skillDetail.estimated_minutes} mins
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#007AFF]" />
                {skillDetail.resource_count || 0} Learning Resources
              </span>
              {graphData?.is_foundation && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF8EE] text-[#34C759] border border-[#34C759]/20">
                  Foundation Skill (Root)
                </span>
              )}
            </div>
          </div>

          {/* Upstream Prerequisites */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] uppercase tracking-wider">
                <ArrowUpRight className="w-4 h-4 text-[#FF9F0A]" />
                <span>Upstream Prerequisites ({graphData?.direct_prerequisites.length || 0})</span>
              </div>
              <span className="text-[11px] text-[#86868B]">Must be satisfied first</span>
            </div>

            {graphData && graphData.direct_prerequisites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {graphData.direct_prerequisites.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{p.name}</h5>
                      <span className="text-[10px] text-[#86868B]">{p.domain || p.category}</span>
                    </div>
                    <Badge variant="warning" size="sm">Prerequisite</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#6E6E73] dark:text-[#AEAEB2] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                <span>No upstream prerequisites required. You can start this skill directly!</span>
              </div>
            )}
          </div>

          {/* Downstream Unlocked Skills */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] uppercase tracking-wider">
                <ArrowDownRight className="w-4 h-4 text-[#007AFF]" />
                <span>Downstream Unlocked Skills ({graphData?.downstream_unlocked.length || 0})</span>
              </div>
              <span className="text-[11px] text-[#86868B]">Unlocked after mastering this skill</span>
            </div>

            {graphData && graphData.downstream_unlocked.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {graphData.downstream_unlocked.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{d.name}</h5>
                      <span className="text-[10px] text-[#86868B]">{d.domain || d.category} • Depth +{d.depth}</span>
                    </div>
                    <Badge variant="primary" size="sm">Unlocked</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
                Capstone competency with no further downstream prerequisites.
              </div>
            )}
          </div>

          {/* Modal Footer CTA */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Link href="/recommendations">
              <Button variant="primary" size="sm" icon={<BookOpen className="w-3.5 h-3.5" />}>
                View Learning Resources
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#86868B]">
          <p>Skill details unavailable.</p>
        </div>
      )}
    </Modal>
  );
};
