import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Career, AssessmentReport } from '../types';

interface AuthContextType {
  user: User | null;
  selectedCareer: Career | null;
  assessmentReport: AssessmentReport | null;
  activeView: string;
  login: (name: string, email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  setSelectedCareer: (career: Career) => void;
  setAssessmentReport: (report: AssessmentReport) => void;
  setActiveView: (view: string) => void;
  addXP: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pathpilot_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedCareer, setSelectedCareerState] = useState<Career | null>(() => {
    const saved = localStorage.getItem('pathpilot_career');
    return saved ? JSON.parse(saved) : null;
  });

  const [assessmentReport, setAssessmentReportState] = useState<AssessmentReport | null>(() => {
    const saved = localStorage.getItem('pathpilot_report');
    return saved ? JSON.parse(saved) : null;
  });

  // Persistent active view state
  const [activeView, setActiveViewState] = useState<string>(() => {
    const savedView = localStorage.getItem('pathpilot_active_view');
    if (savedView) return savedView;
    const savedUser = localStorage.getItem('pathpilot_user');
    const savedCareer = localStorage.getItem('pathpilot_career');
    const savedReport = localStorage.getItem('pathpilot_report');

    if (savedUser) {
      if (savedReport) return 'dashboard';
      if (savedCareer) return 'skill-map';
      return 'career-selection';
    }
    return 'landing';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pathpilot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pathpilot_user');
    }
  }, [user]);

  const setActiveView = (view: string) => {
    setActiveViewState(view);
    localStorage.setItem('pathpilot_active_view', view);
  };

  const login = (name: string, email: string) => {
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name || 'Alex Rivera',
      email: email || 'alex@pathpilot.ai',
      xp: 2250,
      streak: 7
    };
    setUser(newUser);
    localStorage.setItem('pathpilot_user', JSON.stringify(newUser));

    if (assessmentReport) {
      setActiveView('dashboard');
    } else if (selectedCareer) {
      setActiveView('skill-map');
    } else {
      setActiveView('career-selection');
    }
  };

  const signup = (name: string, email: string) => {
    login(name, email);
  };

  const logout = () => {
    setUser(null);
    setSelectedCareerState(null);
    setAssessmentReportState(null);
    localStorage.clear();
    setActiveViewState('landing');
  };

  const setSelectedCareer = (career: Career) => {
    setSelectedCareerState(career);
    if (user) {
      setUser({ ...user, selectedCareer: career.id });
    }
    localStorage.setItem('pathpilot_career', JSON.stringify(career));
  };

  const setAssessmentReport = (report: AssessmentReport) => {
    setAssessmentReportState(report);
    localStorage.setItem('pathpilot_report', JSON.stringify(report));
  };

  const addXP = (amount: number) => {
    if (user) {
      const updated = { ...user, xp: user.xp + amount };
      setUser(updated);
      localStorage.setItem('pathpilot_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedCareer,
        assessmentReport,
        activeView,
        login,
        signup,
        logout,
        setSelectedCareer,
        setAssessmentReport,
        setActiveView,
        addXP
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
