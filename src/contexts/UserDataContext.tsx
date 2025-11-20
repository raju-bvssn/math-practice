/**
 * User Data Context
 * 
 * Provides global state management for:
 * - User statistics (attempts, correct/incorrect counts, history)
 * - Missed questions tracking
 * - User settings (operations, difficulty, session length)
 * 
 * Features:
 * - Automatic persistence to localStorage
 * - Centralized state updates
 * - Type-safe context API
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData, Question, Stats, Settings, MissedQuestionRecord, Operation } from '../types';
import { loadUserData, saveUserData } from '../lib/persistence';

// ============================================================================
// TYPES
// ============================================================================

interface UserDataContextType {
  stats: Stats;
  missedQuestions: { [questionId: string]: MissedQuestionRecord };
  settings: Settings;
  recordAttempt: (question: Question, gotIt: boolean) => void;
  recordMissedQuestion: (question: Question) => void;
  clearMissedQuestion: (questionId: string) => void;
  saveSettings: (settings: Settings) => void;
  resetProgress: () => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default statistics state
 * Used for new users and when resetting progress
 */
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

/**
 * Default user settings
 * Medium difficulty with addition and multiplication selected
 */
const defaultSettings: Settings = {
  difficulty: 'medium',
  operations: ['addition', 'multiplication'],
  sessionLength: 10,
};

/**
 * Complete default user data structure
 */
const defaultUserData: UserData = {
  stats: defaultStats,
  missedQuestions: {},
  settings: defaultSettings,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates or updates a missed question record
 * 
 * @param existingRecord - Previous record if this question was missed before
 * @param question - The question that was missed
 * @returns Updated missed question record
 */
function createMissedQuestionRecord(
  existingRecord: MissedQuestionRecord | undefined,
  question: Question
): MissedQuestionRecord {
  return {
    question,
    missedCount: existingRecord ? existingRecord.missedCount + 1 : 1,
    lastMissedAt: Date.now(),
  };
}

/**
 * Updates statistics for a question attempt
 * 
 * @param currentStats - Current statistics object
 * @param question - The question that was attempted
 * @param gotIt - Whether the answer was correct
 * @returns Updated statistics object
 */
function updateStatsWithAttempt(
  currentStats: Stats,
  question: Question,
  gotIt: boolean
): Stats {
  const newStats = { ...currentStats };
  
  // Update overall totals
  newStats.totalAttempted++;
  if (gotIt) {
    newStats.totalCorrect++;
  } else {
    newStats.totalIncorrect++;
  }

  // Update per-operation statistics
  const operation = question.operation as Operation;
  newStats.byOperation[operation].attempted++;
  if (gotIt) {
    newStats.byOperation[operation].correct++;
  }

  // Add to history log
  newStats.history.push({
    timestamp: Date.now(),
    questionId: question.id,
    operation: question.operation,
    result: gotIt ? 'correct' : 'incorrect',
  });

  return newStats;
}

/**
 * Updates missed questions collection
 * Only updates if the question was answered incorrectly
 * 
 * @param currentMissed - Current missed questions collection
 * @param question - The question that was attempted
 * @param gotIt - Whether the answer was correct
 * @returns Updated missed questions collection
 */
function updateMissedQuestions(
  currentMissed: { [questionId: string]: MissedQuestionRecord },
  question: Question,
  gotIt: boolean
): { [questionId: string]: MissedQuestionRecord } {
  // If answered correctly, no update needed
  if (gotIt) {
    return currentMissed;
  }

  // Question was missed - create or update the record
  const existing = currentMissed[question.id];
  return {
    ...currentMissed,
    [question.id]: createMissedQuestionRecord(existing, question),
  };
}

// ============================================================================
// CONTEXT SETUP
// ============================================================================

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

/**
 * UserDataProvider Component
 * 
 * Wraps the application to provide global user data state
 * - Loads data from localStorage on mount
 * - Auto-saves changes to localStorage
 * - Provides functions to update data
 */
export function UserDataProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or use defaults
  const [userData, setUserData] = useState<UserData>(() => {
    return loadUserData() || defaultUserData;
  });

  /**
   * Auto-save Effect
   * Persists user data to localStorage whenever it changes
   */
  useEffect(() => {
    saveUserData(userData);
  }, [userData]);

  /**
   * Records a question attempt
   * Updates statistics, history, and missed questions if incorrect
   * 
   * @param question - The question that was attempted
   * @param gotIt - Whether the user answered correctly
   */
  const recordAttempt = (question: Question, gotIt: boolean) => {
    setUserData((prev) => {
      // Update statistics with this attempt
      const newStats = updateStatsWithAttempt(prev.stats, question, gotIt);
      
      // Update missed questions collection if incorrect
      const newMissedQuestions = updateMissedQuestions(prev.missedQuestions, question, gotIt);

      return {
        ...prev,
        stats: newStats,
        missedQuestions: newMissedQuestions,
      };
    });
  };

  /**
   * Explicitly records a missed question
   * Used by review mode to track questions that need review
   * 
   * @param question - The question to mark as missed
   */
  const recordMissedQuestion = (question: Question) => {
    setUserData((prev) => {
      const existing = prev.missedQuestions[question.id];
      return {
        ...prev,
        missedQuestions: {
          ...prev.missedQuestions,
          [question.id]: createMissedQuestionRecord(existing, question),
        },
      };
    });
  };

  /**
   * Clears a question from the missed questions list
   * Called when a user successfully answers a previously missed question
   * 
   * @param questionId - ID of the question to remove from missed list
   */
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

  /**
   * Updates user settings
   * Settings include operations, difficulty, and session length
   * 
   * @param settings - New settings object
   */
  const saveSettings = (settings: Settings) => {
    setUserData((prev) => ({
      ...prev,
      settings,
    }));
  };

  /**
   * Resets all progress (statistics and missed questions)
   * Preserves user settings
   * Used when user wants to start fresh
   */
  const resetProgress = () => {
    setUserData({
      stats: defaultStats,
      missedQuestions: {},
      settings: userData.settings, // Keep existing settings
    });
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
        resetProgress,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

/**
 * Hook to access user data context
 * Must be used within a UserDataProvider
 * 
 * @returns User data context value
 * @throws Error if used outside UserDataProvider
 */
export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
