'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Code2, ExternalLink, FileText, Video, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { apiClient } from '../../../lib/api-client';

export default function ResourcePage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.resourceId as string;
  
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<any>(null);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  
  useEffect(() => {
    // In a real app we'd fetch the specific resource by ID from the backend.
    // For MVP, we can simulate fetching or fallback to a generic placeholder based on the ID.
    // Let's create a generic resource view.
    const fetchResource = async () => {
      try {
        // Since we don't have a GET /resources/:id endpoint yet, we'll mock the data 
        // to provide a functional native learning experience for the hackathon demo.
        setTimeout(() => {
          setResource({
            id: resourceId,
            title: 'Advanced Feature Engineering Techniques',
            description: 'Dive deep into feature engineering for machine learning models. Learn how to handle missing data, encode categorical variables, and create interaction terms to boost model performance.',
            type: 'Course',
            provider: 'PathPilot Original',
            difficulty: 'Intermediate',
            estimated_minutes: 45,
            skills_taught: ['Feature Engineering', 'Data Preprocessing', 'Python', 'Pandas'],
            content: `
## Overview

Feature engineering is the process of using domain knowledge to extract features (characteristics, properties, attributes) from raw data. The motivation is to use these extra features to improve the quality of results from a machine learning process, compared with supplying only raw data to the machine learning process.

### Key Concepts

1. **Handling Missing Values**: Imputation strategies (mean, median, mode) vs algorithmic handling.
2. **Encoding Categorical Variables**: One-hot encoding, label encoding, target encoding.
3. **Scaling and Normalization**: Min-Max scaling, Standard scaling (Z-score normalization).
4. **Feature Creation**: Polynomial features, interaction terms, domain-specific logic.

### Practical Exercise

Try implementing a target encoder for a high-cardinality categorical variable in Python.

\`\`\`python
import pandas as pd

def target_encode(train_df, test_df, col, target):
    # Calculate the global mean of the target
    global_mean = train_df[target].mean()
    
    # Calculate the mean of target for each category
    agg = train_df.groupby(col)[target].agg(['count', 'mean'])
    
    # Apply smoothing
    smoothing = 10
    smooth_mean = (agg['count'] * agg['mean'] + smoothing * global_mean) / (agg['count'] + smoothing)
    
    # Map to dataframes
    train_df[col + '_encoded'] = train_df[col].map(smooth_mean)
    test_df[col + '_encoded'] = test_df[col].map(smooth_mean).fillna(global_mean)
    
    return train_df, test_df
\`\`\`
            `
          });
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchResource();
  }, [resourceId]);

  const handleLogActivity = async () => {
    setLogging(true);
    try {
      await apiClient.logProgress(
        resourceId,
        resource?.estimated_minutes || 30,
        'completed'
      );
      setLogged(true);
    } catch (e) {
      console.error(e);
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
        return <Sparkles className="w-5 h-5 text-[#FF9F0A]" />;
      default:
        return <FileText className="w-5 h-5 text-[#86868B]" />;
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Loading Resource..." pageSubtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!resource) {
    return (
      <AppShell pageTitle="Resource Not Found" pageSubtitle="">
        <div className="text-center p-12">
          <p className="text-[#86868B]">The requested learning resource could not be found.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Learning Resource" pageSubtitle="Expand your knowledge">
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Header */}
          <div className="space-y-4 border-b border-[#E5E5EA] dark:border-[#38383A] pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A]">
                  {getResourceTypeIcon(resource.type)}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-0.5">
                    {resource.type} • {resource.provider}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                    {resource.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm font-medium text-[#6E6E73] dark:text-[#AEAEB2]">
                  <Clock className="w-4 h-4 text-[#86868B]" />
                  {resource.estimated_minutes} min
                </span>
                <Badge variant="primary">{resource.difficulty}</Badge>
              </div>
            </div>

            <p className="text-sm text-[#6E6E73] dark:text-[#AEAEB2] leading-relaxed max-w-3xl">
              {resource.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {resource.skills_taught.map((sk: string) => (
                <span
                  key={sk}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#FBFBFD] dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#E5E5EA] dark:border-[#38383A]"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Content Body */}
          <div className="prose dark:prose-invert max-w-none text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
            {/* Extremely simple markdown rendering for MVP demo */}
            {resource.content.split('\\n').map((paragraph: string, i: number) => {
              if (paragraph.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-semibold mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold mt-8 mb-4 border-b border-[#E5E5EA] dark:border-[#38383A] pb-2">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('\`\`\`python')) {
                const code = paragraph.replace('\`\`\`python', '').replace('\`\`\`', '');
                return (
                  <pre key={i} className="bg-[#1C1C1E] text-[#F5F5F7] p-4 rounded-xl overflow-x-auto my-4 text-xs font-mono border border-[#38383A]">
                    {code}
                  </pre>
                );
              }
              if (paragraph.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-3 leading-relaxed">{paragraph}</p>;
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-[#E5E5EA] dark:border-[#38383A] flex flex-wrap items-center justify-between gap-4 bg-[#FBFBFD] dark:bg-[#1C1C1E] p-4 rounded-xl">
            <div>
              <h4 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Finished studying?</h4>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-0.5">Log this activity to boost your XP and advance your roadmap.</p>
            </div>
            
            <Button
              variant={logged ? 'secondary' : 'primary'}
              loading={logging}
              disabled={logged}
              onClick={handleLogActivity}
              icon={logged ? <CheckCircle2 className="w-4 h-4 text-[#34C759]" /> : undefined}
            >
              {logged ? 'Completed (+50 XP)' : 'Log Completion'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
