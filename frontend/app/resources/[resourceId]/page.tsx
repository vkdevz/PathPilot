'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  Video,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Award,
  Layers,
} from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../context/AuthContext';
import type { Resource } from '../../../types';

/**
 * Safe inline Markdown formatter supporting bold, italic, and inline code.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Regex to match `code`, **bold**, *italic*
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded text-xs font-mono bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#007AFF] border border-[#E5E5EA] dark:border-[#38383A]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
      return (
        <strong key={index} className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

/**
 * Safe, multi-element Markdown renderer for course curriculum, projects, and lab exercises.
 */
function MarkdownRenderer({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!content) {
    return (
      <p className="text-sm text-[#86868B] italic">
        Comprehensive study materials and interactive guidelines are loading.
      </p>
    );
  }

  // Normalize newlines
  const normalized = content.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  // Split into code blocks and markdown blocks
  const segments = normalized.split(/(```[\s\S]*?```)/g);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4 text-sm text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
      {segments.map((segment, segIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const firstLineBreak = segment.indexOf('\n');
          const lang = segment.slice(3, firstLineBreak > -1 ? firstLineBreak : 3).trim() || 'code';
          const codeBody = firstLineBreak > -1 ? segment.slice(firstLineBreak + 1, -3) : segment.slice(3, -3);

          return (
            <div key={segIdx} className="my-4 rounded-xl overflow-hidden border border-[#E5E5EA] dark:border-[#38383A] bg-[#1C1C1E] text-[#F5F5F7]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#2C2C2E] border-b border-[#38383A] text-xs">
                <span className="font-mono text-[#AEAEB2] uppercase text-[11px] font-semibold tracking-wider">
                  {lang}
                </span>
                <button
                  onClick={() => handleCopyCode(codeBody, segIdx)}
                  className="flex items-center gap-1 text-[11px] text-[#AEAEB2] hover:text-white transition-colors"
                >
                  {copiedIndex === segIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#34C759]" />
                      <span className="text-[#34C759]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-[#F5F5F7]">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Regular Markdown lines
        const lines = segment.split('\n');
        const elements: React.ReactNode[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();

          if (!trimmed) {
            continue;
          }

          if (trimmed.startsWith('# ')) {
            elements.push(
              <h1 key={`${segIdx}-${i}`} className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-6 mb-3">
                {trimmed.replace('# ', '')}
              </h1>
            );
          } else if (trimmed.startsWith('## ')) {
            elements.push(
              <h2 key={`${segIdx}-${i}`} className="text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-6 mb-2 border-b border-[#E5E5EA] dark:border-[#2C2C2E] pb-1.5">
                {trimmed.replace('## ', '')}
              </h2>
            );
          } else if (trimmed.startsWith('### ')) {
            elements.push(
              <h3 key={`${segIdx}-${i}`} className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-4 mb-2">
                {trimmed.replace('### ', '')}
              </h3>
            );
          } else if (trimmed.startsWith('> ')) {
            elements.push(
              <blockquote key={`${segIdx}-${i}`} className="border-l-4 border-[#007AFF] pl-3.5 py-1 text-xs italic text-[#6E6E73] dark:text-[#AEAEB2] bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-r-lg my-2">
                {renderInlineMarkdown(trimmed.replace('> ', ''))}
              </blockquote>
            );
          } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
            const isChecked = trimmed.startsWith('- [x] ');
            const labelText = trimmed.replace(/- \[[ x]\] /, '');
            elements.push(
              <div key={`${segIdx}-${i}`} className="flex items-center gap-2 text-xs py-0.5 text-[#1D1D1F] dark:text-[#F5F5F7]">
                <input type="checkbox" checked={isChecked} readOnly className="rounded text-[#007AFF] focus:ring-0 cursor-default" />
                <span>{renderInlineMarkdown(labelText)}</span>
              </div>
            );
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(
              <li key={`${segIdx}-${i}`} className="ml-4 list-disc text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed my-0.5">
                {renderInlineMarkdown(trimmed.replace(/^[-*] /, ''))}
              </li>
            );
          } else if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s(.*)$/);
            const num = match ? match[1] : '1';
            const body = match ? match[2] : trimmed;
            elements.push(
              <div key={`${segIdx}-${i}`} className="flex items-start gap-2 text-xs my-1 leading-relaxed">
                <span className="font-semibold text-[#007AFF] shrink-0 font-mono">{num}.</span>
                <span>{renderInlineMarkdown(body)}</span>
              </div>
            );
          } else {
            elements.push(
              <p key={`${segIdx}-${i}`} className="text-xs leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                {renderInlineMarkdown(trimmed)}
              </p>
            );
          }
        }

        return <React.Fragment key={segIdx}>{elements}</React.Fragment>;
      })}
    </div>
  );
}

export default function ResourcePage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.resourceId as string;
  const { refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<Resource | null>(null);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getResourceById(resourceId);
        if (data) {
          setResource(data);
        }
      } catch (err) {
        console.warn('Direct resource fetch note, using fallback resolver:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  const handleLogActivity = async () => {
    if (logged || logging) return;
    setLogging(true);
    try {
      const minutes = resource?.estimated_minutes || 30;
      const progressRes = await apiClient.logProgress(
        resource?.id || resourceId,
        minutes,
        'completed'
      );
      
      const xp = Math.max(20, Math.floor(minutes / 5) * 10);
      setEarnedXp(xp);
      setLogged(true);
      
      // LIVE XP REFRESH: Immediately refresh authenticated user state in AuthContext
      await refreshUser();
    } catch (e) {
      console.error('Error logging completion:', e);
    } finally {
      setLogging(false);
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'project':
        return <Code2 className="w-5 h-5 text-[#007AFF]" />;
      case 'course':
        return <BookOpen className="w-5 h-5 text-[#007AFF]" />;
      case 'video':
        return <Video className="w-5 h-5 text-[#FF3B30]" />;
      case 'practice':
      case 'lab':
        return <Sparkles className="w-5 h-5 text-[#FF9F0A]" />;
      default:
        return <FileText className="w-5 h-5 text-[#86868B]" />;
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Loading Resource..." pageSubtitle="Fetching verified learning curriculum">
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin" />
          <p className="text-xs text-[#86868B]">Loading verified educational content...</p>
        </div>
      </AppShell>
    );
  }

  if (!resource) {
    return (
      <AppShell pageTitle="Resource Not Found" pageSubtitle="">
        <div className="text-center p-12 space-y-4 surface-card rounded-2xl">
          <p className="text-sm text-[#86868B]">The requested learning resource could not be found.</p>
          <Button variant="outline" onClick={() => router.push('/recommendations')}>
            View Recommended Learning
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle={resource.title} pageSubtitle={`${resource.resource_type?.toUpperCase()} • ${resource.provider}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to recommendations
        </button>

        {logged && (
          <div className="p-4 rounded-2xl bg-[#EAF8EE] dark:bg-[#30D158]/15 border border-[#34C759]/30 flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#34C759] text-white">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Learning Milestone Completed!</h4>
                <p className="text-[11px] text-[#34C759] font-medium">+{earnedXp || 50} XP earned • User profile and roadmap live updated.</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.push('/progress')}>
              View Progress
            </Button>
          </div>
        )}

        <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Header */}
          <div className="space-y-4 border-b border-[#E5E5EA] dark:border-[#38383A] pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A]">
                  {getResourceTypeIcon(resource.resource_type)}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-0.5">
                    {resource.resource_type} • {resource.provider}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                    {resource.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] dark:text-[#AEAEB2]">
                  <Clock className="w-4 h-4 text-[#86868B]" />
                  {resource.estimated_minutes} min
                </span>
                <Badge variant="primary">{resource.difficulty}</Badge>
              </div>
            </div>

            <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] leading-relaxed max-w-3xl">
              {resource.description}
            </p>

            {resource.skills_taught && resource.skills_taught.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-[#86868B] uppercase mr-1">Skills Taught:</span>
                {resource.skills_taught.map((sk: string) => (
                  <span
                    key={sk}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#FBFBFD] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#E5E5EA] dark:border-[#38383A]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            )}

            {resource.url && (
              <div className="pt-2">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007AFF] hover:underline"
                >
                  <span>Open Official Documentation / Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Content Body with Real Markdown Rendering */}
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownRenderer content={resource.content || ''} />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-[#E5E5EA] dark:border-[#38383A] flex flex-wrap items-center justify-between gap-4 bg-[#FBFBFD] dark:bg-[#1C1C1E] p-4 rounded-xl">
            <div>
              <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Finished studying this topic?</h4>
              <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] mt-0.5">
                Log completion to earn XP (+{Math.max(20, Math.floor((resource.estimated_minutes || 30) / 5) * 10)} XP), record evidence, and unlock subsequent milestones.
              </p>
            </div>
            
            <Button
              variant={logged ? 'secondary' : 'primary'}
              loading={logging}
              disabled={logged}
              onClick={handleLogActivity}
              icon={logged ? <CheckCircle2 className="w-4 h-4 text-[#34C759]" /> : <Check className="w-4 h-4" />}
            >
              {logged ? `Completed (+${earnedXp || 50} XP)` : 'Log Completion'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

