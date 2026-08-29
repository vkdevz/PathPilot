'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  Check,
  Copy,
  PlusCircle,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface AIChatProps {
  careerTrack?: string;
  activeSkill?: string;
}

// Code Block with Copy Action
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'python' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-[11px]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400">
        <span className="uppercase font-semibold tracking-wider text-indigo-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-slate-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Formatted Message Renderer
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  // Parse code blocks vs regular text
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 leading-relaxed">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const lang = part.slice(3, firstLineEnd).trim() || 'python';
          const code = part.slice(firstLineEnd + 1, -3).trim();
          return <CodeBlock key={idx} code={code} language={lang} />;
        }

        // Render basic markdown (bold, lists)
        return (
          <div key={idx} className="whitespace-pre-wrap">
            {part}
          </div>
        );
      })}
    </div>
  );
};

export const AIChat: React.FC<AIChatProps> = ({
  careerTrack = 'Data Scientist',
  activeSkill = 'Python Foundations',
}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    setInput,
    setMessages,
  } = useChat({
    api: '/api/chat',
    body: {
      conversation_id: conversationId,
      active_skill: activeSkill,
    },
    initialMessages: [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `👋 Hello! I am your **PathPilot AI Learning Navigator**.\n\nI am grounded in your **${careerTrack}** roadmap and active milestone (**${activeSkill}**).\n\nI can explain tricky concepts, generate code exercises, breakdown quiz logic, or log your study progress. What would you like to explore?`,
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleStartNewSession = () => {
    setConversationId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `👋 Started a fresh session calibrated for **${careerTrack}** (**${activeSkill}**). What topic should we dive into?`,
      },
    ]);
  };

  const quickPrompts = [
    `Explain the core intuition behind ${activeSkill}`,
    `What are the prerequisites for this milestone?`,
    `Give me a 5-minute practical coding challenge`,
    `I studied for 30 minutes, please log my progress`,
  ];

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 flex flex-col h-[650px] border border-indigo-500/20 shadow-xl relative overflow-hidden">
      {/* Assistant Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center shadow-glow-cyan">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">AI Learning Navigator</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>DB Grounded</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Calibrated for: <span className="text-indigo-300 font-semibold">{careerTrack}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartNewSession}
            title="Start New Session"
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          <button
            onClick={() => reload()}
            title="Regenerate Last Response"
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-750 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'bg-slate-850 border border-slate-750 text-indigo-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                }`}
              >
                <FormattedMessage content={m.content} />
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-850 border border-slate-750 text-indigo-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Verifying roadmap context & synthesizing explanation...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Connection error. Click reload to retry response.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="pb-3 border-t border-slate-900 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Suggested prompts:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setInput(p)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-800 shrink-0">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={`Ask a question about ${activeSkill}...`}
            className="w-full px-4 py-3 pr-12 rounded-2xl bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
