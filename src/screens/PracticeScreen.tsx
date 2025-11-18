import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../contexts/UserDataContext';
import { generateQuestion } from '../lib/questionGenerator';
import QuestionCard from '../components/QuestionCard/QuestionCard';
import { Question } from '../types';
import './PracticeScreen.css';

function PracticeScreen() {
  const navigate = useNavigate();
  const { settings, recordAttempt } = useUserData();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  // Initialize session on mount
  useEffect(() => {
    if (settings.operations.length === 0) {
      // No operations selected, redirect to home
      navigate('/');
      return;
    }

    // Generate initial questions
    const initialQuestions = generateQuestionQueue();
    setQuestions(initialQuestions);
  }, []); // Empty dependency to run once on mount

  const generateQuestionQueue = (): Question[] => {
    const { operations, difficulty, sessionLength } = settings;
    const queue: Question[] = [];
    
    // If continuous mode (sessionLength = 0), start with 1 question
    const numQuestions = sessionLength === 0 ? 1 : sessionLength;

    for (let i = 0; i < numQuestions; i++) {
      // Randomly select an operation from the chosen operations
      const randomOperation = operations[Math.floor(Math.random() * operations.length)];
      const question = generateQuestion(randomOperation, difficulty);
      queue.push(question);
    }

    return queue;
  };

  const handleResult = (gotIt: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Record the attempt in the context
    recordAttempt(currentQuestion, gotIt);

    // Update session stats
    setSessionStats(prev => ({
      correct: gotIt ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }));

    // Add a small delay before moving to next question to allow card animation to complete
    setTimeout(() => {
      // Check if session should continue
      if (settings.sessionLength === 0) {
        // Continuous mode: generate another question
        const nextQuestion = generateQuestionQueue()[0];
        setQuestions(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Fixed session mode
        if (currentQuestionIndex + 1 >= questions.length) {
          // Session complete
          setSessionComplete(true);
        } else {
          // Move to next question
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }
    }, 300); // Wait for any exit animations
  };

  const handleEndSession = () => {
    navigate('/stats');
  };

  const handleStartNew = () => {
    // Reset and start a new session
    const newQuestions = generateQuestionQueue();
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setSessionComplete(false);
    setSessionStats({ correct: 0, total: 0 });
  };

  // Show loading if no questions yet
  if (questions.length === 0) {
    return (
      <div className="practice-screen loading">
        <p>Loading questions...</p>
      </div>
    );
  }

  // Show session complete screen
  if (sessionComplete) {
    const accuracy = sessionStats.total > 0 
      ? Math.round((sessionStats.correct / sessionStats.total) * 100) 
      : 0;

    return (
      <div className="practice-screen session-complete">
        <div className="complete-card">
          <div className="complete-icon">🎉</div>
          <h2>Session Complete!</h2>
          
          <div className="session-summary">
            <div className="summary-stat">
              <div className="stat-value">{sessionStats.total}</div>
              <div className="stat-label">Questions</div>
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

          <div className="complete-actions">
            <button className="action-button primary" onClick={handleStartNew}>
              Start New Session
            </button>
            <button className="action-button secondary" onClick={handleEndSession}>
              View All Stats
            </button>
            <button className="action-button tertiary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show current question
  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = settings.sessionLength === 0 
    ? currentQuestionIndex + 1 
    : currentQuestionIndex + 1;
  const totalQuestions = settings.sessionLength === 0 
    ? undefined 
    : settings.sessionLength;

  return (
    <div className="practice-screen">
      <div className="practice-header">
        <button className="end-session-button" onClick={handleEndSession}>
          End Session
        </button>
        <div className="session-info">
          {settings.sessionLength === 0 ? (
            <span>Continuous Mode • Question {questionNumber}</span>
          ) : (
            <span>Session Progress: {sessionStats.correct}/{sessionStats.total} correct</span>
          )}
        </div>
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        onResult={handleResult}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />
    </div>
  );
}

export default PracticeScreen;

