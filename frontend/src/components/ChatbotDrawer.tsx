import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { askChatbot } from '../services/api';
import { ChatMessage } from '../types';
import { Bot, Send, Sparkles, X, User } from 'lucide-react';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({ isOpen, onClose }) => {
  const { user, selectedCareer, assessmentReport } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello ${user?.name || 'Learner'}! 👋 I am PathPilot AI, your personal career companion. I've analyzed your skill profile for ${selectedCareer?.name || 'Data Scientist'}. What concept or quest can I help you master today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    const userContext = {
      name: user?.name,
      career_name: selectedCareer?.name,
      overall_score: assessmentReport?.overall_score || 62.5,
      weak_topics: assessmentReport?.weak_topics || [{ name: 'Statistics & Probability' }]
    };

    const replyText = await askChatbot(user?.id || 'usr_demo', query, userContext);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const quickPrompts = [
    "Why is Statistics marked as weak?",
    "Give me a practice question",
    "What should I study next?"
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Chat Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-glow-celestial">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">PathPilot AI</h3>
              <p className="text-xs text-emerald-600 font-extrabold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Context-Aware Career Companion</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50/60 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto">
          <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-full bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 text-xs font-bold whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-brand-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs font-semibold leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="block text-[10px] text-slate-400 mt-2 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-brand-700 text-xs font-bold p-3 bg-brand-50 rounded-xl border border-brand-200 w-48">
              <Sparkles className="w-4 h-4 animate-spin text-brand-600" />
              <span>Analyzing hero profile...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask PathPilot AI about concepts, roadmaps, or quests..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white shadow-glow-celestial transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
