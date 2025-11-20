/**
 * Statistics Utility Functions
 * Provides reusable functions for calculating and formatting statistics
 */

/**
 * Calculates accuracy percentage from correct and total counts
 * 
 * @param correct - Number of correct answers
 * @param total - Total number of attempts
 * @returns Accuracy percentage (0-100), rounded to nearest integer
 * 
 * @example
 * calculateAccuracy(7, 10) // returns 70
 * calculateAccuracy(0, 0)  // returns 0 (handles division by zero)
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
}

/**
 * Formats a count with proper pluralization
 * 
 * @param count - The count to format
 * @param singular - Singular form of the word
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Formatted string with count and word
 * 
 * @example
 * formatCount(1, 'question') // returns "1 question"
 * formatCount(5, 'question') // returns "5 questions"
 * formatCount(1, 'try', 'tries') // returns "1 try"
 * formatCount(3, 'try', 'tries') // returns "3 tries"
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Session statistics interface
 */
export interface SessionStats {
  correct: number;
  total: number;
}

/**
 * Creates an initial session stats object
 * @returns New session stats with zero counts
 */
export function createInitialSessionStats(): SessionStats {
  return { correct: 0, total: 0 };
}

/**
 * Updates session stats after an attempt
 * 
 * @param current - Current session stats
 * @param wasCorrect - Whether the attempt was correct
 * @returns Updated session stats (immutable)
 */
export function updateSessionStats(current: SessionStats, wasCorrect: boolean): SessionStats {
  return {
    correct: wasCorrect ? current.correct + 1 : current.correct,
    total: current.total + 1,
  };
}

