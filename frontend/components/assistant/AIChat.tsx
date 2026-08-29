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
    <div className="relative my-2.5 rounded-xl bg-slate-950 border border-white/[0.08] overflow-hidden font-mono text-[11px]">
      <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-white/[0.06] text-[10px] text-slate-400">
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
        content: `👋 Hello! I am your **PathPilot AI Navigator**.\n\nI am calibrated directly to your **${careerTrack}** roadmap and active skill (**${activeSkill}**).\n\nAsk me about your prerequisite gaps, roadmap evolution reasons, or targeted study actions.`,
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
        content: `👋 Started a fresh session calibrated for **${careerTrack}** (**${activeSkill}**). What would you like to explore?`,
      },
    ]);
  };

  const contextualPrompts = [
    'Why is this my biggest gap?',
    'What should I learn next?',
    'Why did my roadmap change?',
    'How am I progressing?',
    'What should I focus on today?',
  ];

  return (
    <div className="surface-card rounded-2xl p-4 sm:p-5 flex flex-col h-[650px] shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">AI Learning Navigator</h3>
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>DB Grounded</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active Context: <span className="text-indigo-300 font-medium">{careerTrack}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartNewSession}
            title="Start New Session"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          <button
            onClick={() => reload()}
            title="Regenerate Last Response"
            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-white/[0.08] text-indigo-300'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-900 border border-white/[0.06] text-slate-200 rounded-tl-sm'
                }`}
              >
                <FormattedMessage content={m.content} />
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Consulting learner knowledge graph & recommendations...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Unable to connect to assistant stream. Please try again.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Quick Prompts */}
      <div className="pt-2 pb-2 border-t border-white/[0.04] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {contextualPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setInput(prompt)}
            className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-white/[0.06] text-[11px] text-slate-300 hover:text-white transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-2 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask AI Navigator about skills, gaps, or roadmap logic..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
