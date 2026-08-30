'use client';

import React, { useState } from 'react';
import { ExternalLink, Clock, BookOpen, Code2, Video, FileText, CheckCircle2, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import type { Recommendation } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { WhyRecommendation } from './WhyRecommendation';
import { apiClient } from '../../lib/api-client';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onLogStudy?: (resourceId: string, minutes: number) => Promise<void>;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onLogStudy,
}) => {
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  const getResourceTypeIcon = () => {
    switch (recommendation.resource_type?.toLowerCase()) {
      case 'project':
        return <Code2 className="w-3.5 h-3.5 text-[#007AFF]" />;
      case 'course':
        return <BookOpen className="w-3.5 h-3.5 text-[#007AFF]" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-[#FF3B30]" />;
      case 'practice':
        return <Sparkles className="w-3.5 h-3.5 text-[#FF9F0A]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#86868B]" />;
    }
  };

  const handleLogActivity = async () => {
    if (!onLogStudy) return;
    setLogging(true);
    try {
      await onLogStudy(recommendation.resource_id, recommendation.estimated_minutes);
      setLogged(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLogging(false);
    }
  };

  const handleFeedback = async (type: 'helpful' | 'too_hard' | 'too_easy' | 'dismissed') => {
    try {
      setFeedbackSent(type);
      await apiClient.sendRecommendationFeedback({
        resource_id: recommendation.resource_id,
        feedback_type: type,
        rating: type === 'helpful' ? 5 : 2,
      });
    } catch (e) {
      console.error('Feedback recording note:', e);
    }
  };

  return (
    <div className="surface-card rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
      <div className="space-y-3">
        {/* Top Meta Line */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A]">
              {getResourceTypeIcon()}
            </span>
            <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">
              {recommendation.resource_type} • {recommendation.provider}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-[#6E6E73] dark:text-[#AEAEB2]">
              <Clock className="w-3 h-3 text-[#86868B]" />
              {recommendation.estimated_minutes}m
            </span>
            <Badge
              variant={
                recommendation.difficulty === 'Beginner'
                  ? 'success'
                  : recommendation.difficulty === 'Intermediate'
                  ? 'primary'
                  : 'danger'
              }
              size="sm"
            >
              {recommendation.difficulty}
            </Badge>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {recommendation.title}
          </h3>
          <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-1 leading-relaxed line-clamp-2">
            {recommendation.description}
          </p>
        </div>

        {/* Competencies Taught */}
        {recommendation.skills_taught && recommendation.skills_taught.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recommendation.skills_taught.map((sk) => (
              <span
                key={sk}
                className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#AEAEB2] border border-[#E5E5EA] dark:border-[#38383A]"
              >
                {sk}
              </span>
            ))}
          </div>
        )}

        {/* Explainability Drawer */}
        <WhyRecommendation
          reasons={recommendation.explanation_reasons}
          relevanceScore={recommendation.relevance_score}
          matchTier={recommendation.match_tier}
          featureBreakdown={recommendation.feature_breakdown}
        />
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-[#E5E5EA] dark:border-[#38383A] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {recommendation.url ? (
            <a
              href={recommendation.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleFeedback('helpful')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#006EDB] text-white text-xs font-semibold transition-colors"
            >
              <span>Launch Resource</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <Button variant="primary" size="sm">
              Launch Resource
            </Button>
          )}

          {/* Feedback */}
          <div className="flex items-center gap-1 pl-2 border-l border-[#E5E5EA] dark:border-[#38383A]">
            <button
              onClick={() => handleFeedback('helpful')}
              className={`p-1 rounded border text-xs transition-colors cursor-pointer ${
                feedbackSent === 'helpful'
                  ? 'bg-[#EAF8EE] border-[#34C759]/30 text-[#34C759]'
                  : 'bg-white dark:bg-[#1C1C1E] border-[#D2D2D7] dark:border-[#38383A] text-[#86868B] hover:text-[#1D1D1F]'
              }`}
              title="Helpful"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleFeedback('too_hard')}
              className={`p-1 rounded border text-xs transition-colors cursor-pointer ${
                feedbackSent === 'too_hard'
                  ? 'bg-[#FFF0EF] border-[#FF3B30]/30 text-[#FF3B30]'
                  : 'bg-white dark:bg-[#1C1C1E] border-[#D2D2D7] dark:border-[#38383A] text-[#86868B] hover:text-[#1D1D1F]'
              }`}
              title="Too hard"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {onLogStudy && (
          <Button
            variant="secondary"
            size="sm"
            loading={logging}
            disabled={logged}
            onClick={handleLogActivity}
            icon={logged ? <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" /> : undefined}
          >
            {logged ? 'Logged (+50 XP)' : 'Log Completion'}
          </Button>
        )}
      </div>
    </div>
  );
};
