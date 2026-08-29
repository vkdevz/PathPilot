import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAssessmentQuestions, submitAssessment } from '../services/api';
import { Question } from '../types';
import { Swords, Clock, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const { user, selectedCareer, setAssessmentReport, setActiveView } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    async function load() {
      const careerId = selectedCareer?.id || 'data_scientist';
      const qList = await fetchAssessmentQuestions(careerId);
      setQuestions(qList);
      setLoading(false);
    }
    load();
  }, [selectedCareer]);

  useEffect(() => {
    if (loading || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-brand-600">
        <div className="flex flex-col items-center space-y-3">
          <Sparkles className="w-10 h-10 animate-spin" />
          <p className="font-extrabold text-slate-700">Generating Personalized Knowledge Quest...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>No questions found for this career path.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOption = userAnswers[currentQ.id];
  const isAnswered = selectedOption !== undefined;

  const handleSelect = (optionIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const answersPayload = Object.entries(userAnswers).map(([qId, optionIdx]) => ({
      question_id: qId,
      selected_option: optionIdx
    }));

    const userId = user?.id || 'usr_demo';
    const careerId = selectedCareer?.id || 'data_scientist';

    const report = await submitAssessment(userId, careerId, answersPayload);
    setAssessmentReport(report);
    setActiveView('skill-report');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Assessment Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-black text-brand-600 uppercase tracking-widest flex items-center space-x-1">
            <Swords className="w-4 h-4" />
            <span>Knowledge Quest — {selectedCareer?.name || 'Data Scientist'}</span>
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">
            Challenge {currentIndex + 1} of {questions.length}
          </h2>
        </div>

        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700">
          <Clock className="w-4 h-4 text-brand-600" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Hero Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-50 text-brand-700 border border-brand-200">
            Topic: {currentQ.skill_name}
          </span>
          <span className="text-xs font-black text-slate-500 uppercase">
            {currentQ.difficulty} Tier
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? 'bg-brand-50 border-brand-500 text-slate-900 font-extrabold shadow-glow-celestial'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                    isSelected ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm">{opt}</span>
                </div>

                {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold flex items-center space-x-2 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Challenge</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered || submitting}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 disabled:opacity-40 text-white text-xs font-black shadow-glow-celestial flex items-center space-x-2 hover:scale-105 transition-all"
          >
            <span>{currentIndex === questions.length - 1 ? 'Submit & Reveal Skill Power' : 'Next Challenge'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
