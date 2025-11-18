import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData, Question, Stats, Settings, MissedQuestionRecord } from '../types';
import { loadUserData, saveUserData } from '../lib/persistence';

interface UserDataContextType {
  stats: Stats;
  missedQuestions: { [questionId: string]: MissedQuestionRecord };
  settings: Settings;
  recordAttempt: (question: Question, gotIt: boolean) => void;
  recordMissedQuestion: (question: Question) => void;
  clearMissedQuestion: (questionId: string) => void;
  saveSettings: (settings: Settings) => void;
}

const defaultStats: Stats = {
  totalAttempted: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  byOperation: {
    addition: { attempted: 0, correct: 0 },
    subtraction: { attempted: 0, correct: 0 },
    multiplication: { attempted: 0, correct: 0 },
    division: { attempted: 0, correct: 0 },
  },
  history: [],
};

const defaultSettings: Settings = {
  difficulty: 'medium',
  operations: ['addition', 'multiplication'],
  sessionLength: 10,
};

const defaultUserData: UserData = {
  stats: defaultStats,
  missedQuestions: {},
  settings: defaultSettings,
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(() => {
    return loadUserData() || defaultUserData;
  });

  // Save to localStorage whenever userData changes
  useEffect(() => {
    saveUserData(userData);
  }, [userData]);

  const recordAttempt = (question: Question, gotIt: boolean) => {
    setUserData((prev) => {
      const newStats = { ...prev.stats };
      
      // Update totals
      newStats.totalAttempted++;
      if (gotIt) {
        newStats.totalCorrect++;
      } else {
        newStats.totalIncorrect++;
      }

      // Update per-operation stats
      newStats.byOperation[question.operation].attempted++;
      if (gotIt) {
        newStats.byOperation[question.operation].correct++;
      }

      // Add to history
      newStats.history.push({
        timestamp: Date.now(),
        questionId: question.id,
        operation: question.operation,
        result: gotIt ? 'correct' : 'incorrect',
      });

      // If missed, record it
      let newMissedQuestions = prev.missedQuestions;
      if (!gotIt) {
        const existing = prev.missedQuestions[question.id];
        newMissedQuestions = {
          ...prev.missedQuestions,
          [question.id]: {
            question,
            missedCount: existing ? existing.missedCount + 1 : 1,
            lastMissedAt: Date.now(),
          },
        };
      }

      return {
        ...prev,
        stats: newStats,
        missedQuestions: newMissedQuestions,
      };
    });
  };

  const recordMissedQuestion = (question: Question) => {
    setUserData((prev) => {
      const existing = prev.missedQuestions[question.id];
      return {
        ...prev,
        missedQuestions: {
          ...prev.missedQuestions,
          [question.id]: {
            question,
            missedCount: existing ? existing.missedCount + 1 : 1,
            lastMissedAt: Date.now(),
          },
        },
      };
    });
  };

  const clearMissedQuestion = (questionId: string) => {
    setUserData((prev) => {
      const newMissedQuestions = { ...prev.missedQuestions };
      delete newMissedQuestions[questionId];
      return {
        ...prev,
        missedQuestions: newMissedQuestions,
      };
    });
  };

  const saveSettings = (settings: Settings) => {
    setUserData((prev) => ({
      ...prev,
      settings,
    }));
  };

  return (
    <UserDataContext.Provider
      value={{
        stats: userData.stats,
        missedQuestions: userData.missedQuestions,
        settings: userData.settings,
        recordAttempt,
        recordMissedQuestion,
        clearMissedQuestion,
        saveSettings,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

