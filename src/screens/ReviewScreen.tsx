import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../contexts/UserDataContext';
import QuestionCard from '../components/QuestionCard/QuestionCard';
import './ReviewScreen.css';

function ReviewScreen() {
  const navigate = useNavigate();
  const { missedQuestions, recordAttempt, clearMissedQuestion } = useUserData();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  // Sort missed questions by missedCount (descending) and lastMissedAt (ascending)
  const sortedMissedQuestions = Object.entries(missedQuestions)
    .sort((a, b) => {
      if (b[1].missedCount !== a[1].missedCount) {
        return b[1].missedCount - a[1].missedCount;
      }
      return a[1].lastMissedAt - b[1].lastMissedAt;
    })
    .map(([_, record]) => record.question);

  const hasQuestions = sortedMissedQuestions.length > 0;

  const handleResult = (gotIt: boolean) => {
    const currentQuestion = sortedMissedQuestions[currentQuestionIndex];
    
    // Record the attempt
    recordAttempt(currentQuestion, gotIt);

    // Update session stats
    setSessionStats(prev => ({
      correct: gotIt ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }));

    // If they got it right, remove from missed questions
    if (gotIt) {
      clearMissedQuestion(currentQuestion.id);
    }

    // Add a small delay before moving to next question
    setTimeout(() => {
      // Move to next question or complete
      if (currentQuestionIndex + 1 >= sortedMissedQuestions.length) {
        setReviewComplete(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300); // Wait for any exit animations
  };

  const handleStartReview = () => {
    setCurrentQuestionIndex(0);
    setReviewComplete(false);
    setSessionStats({ correct: 0, total: 0 });
  };

  const handleBackToStats = () => {
    navigate('/stats');
  };

  // No questions to review
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

  // Review complete
  if (reviewComplete) {
    const accuracy = sessionStats.total > 0 
      ? Math.round((sessionStats.correct / sessionStats.total) * 100) 
      : 0;
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
              <p>You still have {remainingQuestions} question{remainingQuestions !== 1 ? 's' : ''} to review.</p>
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

  // Show current question for review
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
          ⚠️ Missed {missedRecord.missedCount} time{missedRecord.missedCount !== 1 ? 's' : ''}
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

