'use client';

import React, { useState } from 'react';
import { ExternalLink, Clock, Sparkles, BookOpen, Code2, Video, FileText, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';
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
        return <Code2 className="w-4 h-4 text-cyan-400" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'practice':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
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
        rating: type === 'helpful' ? 5 : 2
      });
    } catch (e) {
      console.error('Feedback recording note:', e);
    }
  };

  return (
    <div className="glass-panel-interactive rounded-3xl p-6 flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              {getResourceTypeIcon()}
            </div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              {recommendation.resource_type} • {recommendation.provider}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" /> ~{recommendation.estimated_minutes}m
            </span>
            <Badge
              variant={
                recommendation.difficulty === 'Beginner'
                  ? 'emerald'
                  : recommendation.difficulty === 'Intermediate'
                  ? 'indigo'
                  : 'rose'
              }
            >
              {recommendation.difficulty}
            </Badge>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {recommendation.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
            {recommendation.description}
          </p>
        </div>

        {/* Skills Covered */}
        {recommendation.skills_taught && recommendation.skills_taught.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recommendation.skills_taught.map((sk) => (
              <span
                key={sk}
                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-850 text-slate-300 border border-slate-750"
              >
                {sk}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Why this? explanation */}
        <WhyRecommendation
          reasons={recommendation.explanation_reasons}
          relevanceScore={recommendation.relevance_score}
          matchTier={recommendation.match_tier}
          featureBreakdown={recommendation.feature_breakdown}
        />
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {recommendation.url ? (
            <a
              href={recommendation.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleFeedback('helpful')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Launch Resource</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <Button variant="primary" size="sm">
              Launch Resource
            </Button>
          )}

          {/* Feedback Rating Icons */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={() => handleFeedback('helpful')}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                feedbackSent === 'helpful'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Helpful recommendation"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleFeedback('too_hard')}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                feedbackSent === 'too_hard'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Too hard for my current level"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {onLogStudy && (
          <Button
            variant="outline"
            size="sm"
            loading={logging}
            disabled={logged}
            onClick={handleLogActivity}
            icon={logged ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : undefined}
          >
            {logged ? 'Logged (+50 XP)' : 'Log Completed Study'}
          </Button>
        )}
      </div>
    </div>
  );
};
