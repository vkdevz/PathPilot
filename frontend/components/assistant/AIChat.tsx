'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import {
  Bot,
  Send,
  User,
  RefreshCw,
  AlertCircle,
  Check,
  Copy,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';


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
    <div className="relative my-2.5 rounded-xl bg-[#1C1C1E] border border-[#38383A] overflow-hidden font-mono text-[11px]">
      <div className="flex items-center justify-between px-3 py-1 bg-[#2C2C2E] border-b border-[#38383A] text-[10px] text-[#AEAEB2]">
        <span className="uppercase font-semibold tracking-wider text-[#0A84FF]">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-[#30D158]" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[#F5F5F7] leading-relaxed">
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
    append,
  } = useChat({
    api: '/api/chat',
    streamProtocol: 'text',
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

  const handlePromptClick = (prompt: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : '';
    append(
      { role: 'user', content: prompt },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    );
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('pathpilot_token') : '';
    handleSubmit(e, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
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
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">AI Learning Navigator</h3>
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-[#EAF8EE] text-[#34C759] border border-[#34C759]/20">
                <ShieldCheck className="w-3 h-3" />
                <span>DB Grounded</span>
              </span>
            </div>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
              Active Context: <span className="text-[#007AFF] font-medium">{careerTrack}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartNewSession}
            title="Start New Session"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D2D2D7] dark:border-[#38383A] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-[#007AFF]" />
            <span>New Session</span>
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
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                  isUser
                    ? 'bg-[#007AFF] text-white'
                    : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-[#007AFF]'
                }`}
              >
                {isUser ? 'You' : <Sparkles className="w-3 h-3" />}
              </div>

              <div
                className={`p-3.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#007AFF] text-white rounded-tr-sm'
                    : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-tl-sm'
                }`}
              >
                <FormattedMessage content={m.content} />
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#6E6E73] p-2">
            <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
            <span>Consulting learner knowledge graph & recommendations...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-[#FFF0EF] border border-[#FF3B30]/20 text-[#FF3B30] text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF3B30]" />
              <span>{error.message || 'Unable to connect to assistant stream. Please try again.'}</span>
            </div>
            <button
              onClick={() => reload()}
              className="text-xs font-semibold underline text-[#FF3B30] hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Quick Prompts */}
      <div className="pt-2 pb-2 border-t border-[#E5E5EA] dark:border-[#38383A] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {contextualPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handlePromptClick(prompt)}
            className="shrink-0 px-2.5 py-1 rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-white dark:hover:bg-[#38383A] border border-[#E5E5EA] dark:border-[#38383A] text-[11px] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={onFormSubmit} className="pt-2 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask AI Navigator about skills, gaps, or roadmap logic..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF] transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-[#007AFF] hover:bg-[#006EDB] disabled:opacity-40 text-white transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
