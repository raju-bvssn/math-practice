// Core data types for Math Practice app

export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ResultType = 'correct' | 'incorrect';

export interface Question {
  id: string;
  operation: Operation;
  difficulty: Difficulty;
  operands: [number, number];
  questionText: string;
  correctAnswer: number;
  choices: number[];
  explanation: string;
  createdAt: number;
}

export interface AttemptRecord {
  timestamp: number;
  questionId: string;
  operation: Operation;
  result: ResultType;
}

export interface OperationStats {
  attempted: number;
  correct: number;
}

export interface Stats {
  totalAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  byOperation: {
    addition: OperationStats;
    subtraction: OperationStats;
    multiplication: OperationStats;
    division: OperationStats;
  };
  history: AttemptRecord[];
}

export interface MissedQuestionRecord {
  question: Question;
  missedCount: number;
  lastMissedAt: number;
}

export interface Settings {
  difficulty: Difficulty;
  operations: Operation[];
  sessionLength: number; // 0 = continuous mode
}

export interface UserData {
  stats: Stats;
  missedQuestions: { [questionId: string]: MissedQuestionRecord };
  settings: Settings;
}

