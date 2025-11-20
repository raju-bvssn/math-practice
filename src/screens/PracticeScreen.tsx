/**
 * PracticeScreen Component
 * 
 * Manages a practice session where users answer math questions
 * Features:
 * - Fixed-length or continuous mode sessions
 * - Real-time progress tracking
 * - Session completion summary with statistics
 * - Automatic recording of attempts and missed questions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../contexts/UserDataContext';
import { generateQuestion } from '../lib/questionGenerator';
import QuestionCard from '../components/QuestionCard/QuestionCard';
import { Question } from '../types';
import { CARD_ANIMATION_DELAY_MS } from '../constants';
import { calculateAccuracy, updateSessionStats, createInitialSessionStats } from '../utils/stats';
import './PracticeScreen.css';

function PracticeScreen() {
  const navigate = useNavigate();
  const { settings, recordAttempt } = useUserData();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState(createInitialSessionStats());

  /**
   * Session Initialization Effect
   * Runs once on component mount to set up the practice session
   * - Validates that operations are selected
   * - Generates initial question queue
   */
  useEffect(() => {
    // Redirect to home if no operations are selected
    if (settings.operations.length === 0) {
      navigate('/');
      return;
    }

    // Generate initial set of questions for the session
    const initialQuestions = generateQuestionQueue();
    setQuestions(initialQuestions);
  }, []); // Empty dependency array = run once on mount

  /**
   * Generates a queue of questions for the practice session
   * 
   * - For fixed-length sessions: generates all questions upfront
   * - For continuous mode: generates one question at a time
   * - Questions are randomized from selected operations
   * 
   * @returns Array of Question objects
   */
  const generateQuestionQueue = (): Question[] => {
    const { operations, difficulty, sessionLength } = settings;
    const queue: Question[] = [];
    
    // Continuous mode (sessionLength = 0) starts with just 1 question
    const numQuestions = sessionLength === 0 ? 1 : sessionLength;

    for (let i = 0; i < numQuestions; i++) {
      // Randomly select an operation from user's chosen operations
      const randomOperation = operations[Math.floor(Math.random() * operations.length)];
      const question = generateQuestion(randomOperation, difficulty);
      queue.push(question);
    }

    return queue;
  };

  /**
   * Handles the result of a question attempt
   * 
   * Workflow:
   * 1. Records attempt in global context (updates stats and missed questions)
   * 2. Updates local session statistics
   * 3. Waits for card animation to complete
   * 4. Advances to next question or completes session
   * 
   * @param gotIt - Whether the user answered correctly
   */
  const handleResult = (gotIt: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Record the attempt globally (updates overall stats and missed questions)
    recordAttempt(currentQuestion, gotIt);

    // Update session-specific statistics
    setSessionStats(prev => updateSessionStats(prev, gotIt));

    // Delay before transitioning to allow card flip animation to complete smoothly
    setTimeout(() => {
      if (settings.sessionLength === 0) {
        // CONTINUOUS MODE: Generate and add the next question
        const nextQuestion = generateQuestionQueue()[0];
        setQuestions(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // FIXED SESSION MODE: Check if we've reached the end
        if (currentQuestionIndex + 1 >= questions.length) {
          // All questions answered - show completion screen
          setSessionComplete(true);
        } else {
          // More questions remain - advance to next
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }
    }, CARD_ANIMATION_DELAY_MS);
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
    setSessionStats(createInitialSessionStats());
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
    const accuracy = calculateAccuracy(sessionStats.correct, sessionStats.total);

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

