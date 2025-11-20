/**
 * ReviewScreen Component
 * 
 * Allows users to review and practice questions they previously answered incorrectly
 * Features:
 * - Smart sorting: prioritizes frequently missed questions
 * - Automatic removal of mastered questions
 * - Session statistics tracking
 * - Encouragement messaging for empty state
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../contexts/UserDataContext';
import QuestionCard from '../components/QuestionCard/QuestionCard';
import { CARD_ANIMATION_DELAY_MS } from '../constants';
import { calculateAccuracy, updateSessionStats, createInitialSessionStats, formatCount } from '../utils/stats';
import './ReviewScreen.css';

function ReviewScreen() {
  const navigate = useNavigate();
  const { missedQuestions, recordAttempt, clearMissedQuestion } = useUserData();
  
  // Local state for review session management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState(createInitialSessionStats());

  /**
   * Smart Question Sorting
   * Prioritizes questions that were:
   * 1. Missed most frequently (highest missedCount first)
   * 2. Missed longest ago (helps with retention/memory)
   * 
   * This ensures students review their weakest areas first
   */
  const sortedMissedQuestions = Object.entries(missedQuestions)
    .sort((a, b) => {
      // Primary sort: questions missed more times come first
      if (b[1].missedCount !== a[1].missedCount) {
        return b[1].missedCount - a[1].missedCount;
      }
      // Secondary sort: older missed questions come first (oldest first)
      return a[1].lastMissedAt - b[1].lastMissedAt;
    })
    .map(([_, record]) => record.question);

  const hasQuestions = sortedMissedQuestions.length > 0;

  /**
   * Handles the result of a review question attempt
   * 
   * Workflow:
   * 1. Records the attempt globally (updates stats)
   * 2. Updates local review session statistics
   * 3. Removes question from missed list if answered correctly
   * 4. Advances to next question or completes review
   * 
   * @param gotIt - Whether the user answered correctly
   */
  const handleResult = (gotIt: boolean) => {
    const currentQuestion = sortedMissedQuestions[currentQuestionIndex];
    
    // Record the attempt in global context (updates overall statistics)
    recordAttempt(currentQuestion, gotIt);

    // Update review session-specific statistics
    setSessionStats(prev => updateSessionStats(prev, gotIt));

    // If answered correctly, remove from missed questions list
    // This celebrates mastery and prevents redundant review
    if (gotIt) {
      clearMissedQuestion(currentQuestion.id);
    }

    // Delay transition to allow card flip animation to complete smoothly
    setTimeout(() => {
      // Check if we've reviewed all questions in this session
      if (currentQuestionIndex + 1 >= sortedMissedQuestions.length) {
        // Show completion screen with summary
        setReviewComplete(true);
      } else {
        // Move to the next question in the queue
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, CARD_ANIMATION_DELAY_MS);
  };

  /**
   * Restarts the review session from the beginning
   * Resets all local state for a fresh review attempt
   */
  const handleStartReview = () => {
    setCurrentQuestionIndex(0);
    setReviewComplete(false);
    setSessionStats(createInitialSessionStats());
  };

  /**
   * Navigates back to the statistics screen
   * Allows users to view overall progress
   */
  const handleBackToStats = () => {
    navigate('/stats');
  };

  // RENDER: Empty State (No Questions to Review)
  if (!hasQuestions) {
    return (
      <div className="review-screen empty">
        <div className="empty-card">
          <div className="empty-icon">🎉</div>
          <h2>Great Job!</h2>
          <p className="empty-message">
            You don't have any missed questions to review. You're doing amazing!
          </p>
          <div className="empty-actions">
            <button className="action-btn primary" onClick={() => navigate('/')}>
              🏠 Back to Home
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/practice')}>
              🚀 Start New Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Review Complete State
  if (reviewComplete) {
    // Calculate session accuracy percentage
    const accuracy = calculateAccuracy(sessionStats.correct, sessionStats.total);
    
    // Count remaining questions (may differ from original count if some were mastered)
    const remainingQuestions = Object.keys(missedQuestions).length;

    return (
      <div className="review-screen complete">
        <div className="complete-card">
          <div className="complete-icon">🌟</div>
          <h2>Review Complete!</h2>
          
          <div className="session-summary">
            <div className="summary-stat">
              <div className="stat-value">{sessionStats.total}</div>
              <div className="stat-label">Reviewed</div>
            </div>
            <div className="summary-stat">
              <div className="stat-value">{sessionStats.correct}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="summary-stat">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>

          {remainingQuestions > 0 && (
            <div className="remaining-notice">
              <p>You still have {formatCount(remainingQuestions, 'question')} to review.</p>
            </div>
          )}

          <div className="complete-actions">
            {remainingQuestions > 0 && (
              <button className="action-btn primary" onClick={handleStartReview}>
                🔄 Review Again
              </button>
            )}
            <button className="action-btn secondary" onClick={handleBackToStats}>
              📊 View Stats
            </button>
            <button className="action-btn tertiary" onClick={() => navigate('/')}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Active Review Session (Showing Question)
  const currentQuestion = sortedMissedQuestions[currentQuestionIndex];
  const missedRecord = missedQuestions[currentQuestion.id];

  return (
    <div className="review-screen">
      <div className="review-header">
        <div className="review-info">
          <h2>📚 Review Missed Questions</h2>
          <p className="review-progress">
            Question {currentQuestionIndex + 1} of {sortedMissedQuestions.length}
          </p>
        </div>
        <button className="back-button" onClick={handleBackToStats}>
          ← Back to Stats
        </button>
      </div>

      <div className="missed-info-card">
        <div className="missed-badge">
          ⚠️ Missed {formatCount(missedRecord.missedCount, 'time')}
        </div>
        <p className="missed-hint">
          Take your time and think carefully before answering!
        </p>
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        onResult={handleResult}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={sortedMissedQuestions.length}
      />
    </div>
  );
}

export default ReviewScreen;

