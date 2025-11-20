/**
 * QuestionCard Component
 * 
 * Displays a math question with multiple choice answers
 * Features:
 * - Card flip animation showing results
 * - Keyboard navigation (keys 1-4)
 * - Confetti celebration for correct answers
 * - Accessibility support (ARIA labels, keyboard hints)
 */

import { useState, useEffect } from 'react';
import { Question } from '../../types';
import { triggerCelebrationConfetti } from '../../utils/confetti';
import { playSuccessSound, playIncorrectSound } from '../../utils/sound';
import { ANSWER_KEYS, DIFFICULTY_COLORS, OPERATION_ICONS } from '../../constants';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  onResult: (gotIt: boolean) => void;
  questionNumber?: number;
  totalQuestions?: number;
}

function QuestionCard({ question, onResult, questionNumber, totalQuestions }: QuestionCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  /**
   * Keyboard Navigation Effect
   * Allows users to select answers using number keys (1-4)
   * Enhances accessibility and provides faster interaction
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle keyboard input if card hasn't been flipped yet
      if (isFlipped) return;
      
      const key = e.key;
      // Check if pressed key is one of the answer keys
      if (ANSWER_KEYS.includes(key)) {
        const index = parseInt(key) - 1;
        // Ensure the index is valid for the current number of choices
        if (index < question.choices.length) {
          handleChoiceClick(question.choices[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    // Cleanup event listener on unmount or when dependencies change
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, question.choices]);

  /**
   * Handles user clicking on an answer choice
   * Flips the card to show result and triggers celebration if correct
   * 
   * @param choice - The numeric value of the selected choice
   */
  const handleChoiceClick = (choice: number) => {
    // Prevent selecting another answer after card has been flipped
    if (isFlipped) return;
    
    setSelectedChoice(choice);
    setIsFlipped(true);
    
    // Provide immediate audio feedback based on correctness
    if (choice === question.correctAnswer) {
      // Celebrate correct answer with confetti and success sound
      triggerCelebrationConfetti();
      playSuccessSound();
    } else {
      // Gentle audio notification for incorrect answer (non-punitive)
      playIncorrectSound();
    }
  };

  /**
   * Handles user acknowledgement of the result
   * Determines actual correctness and notifies parent component
   * 
   * @param _userAcknowledgement - User's self-assessment (not used for actual tracking)
   */
  const handleResult = (_userAcknowledgement: boolean) => {
    // Determine correctness based on actual selected answer, not user's claim
    const actuallyGotItRight = selectedChoice === question.correctAnswer;
    
    // Reset component state for next question
    setSelectedChoice(null);
    setIsFlipped(false);
    
    // Notify parent component with actual result
    onResult(actuallyGotItRight);
  };

  /**
   * Retrieves the color associated with the question's difficulty level
   * Uses centralized theme constants for consistency
   * 
   * @returns Hex color code for the difficulty
   */
  const getDifficultyColor = (): string => {
    return DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS.default;
  };

  /**
   * Retrieves the icon emoji for the question's operation
   * Uses centralized constants for consistency
   * 
   * @returns Unicode emoji representing the operation
   */
  const getOperationIcon = (): string => {
    return OPERATION_ICONS[question.operation];
  };

  return (
    <div className="question-card-wrapper">
      {/* Progress indicator */}
      {questionNumber && totalQuestions && (
        <div className="question-progress">
          Question {questionNumber} of {totalQuestions}
        </div>
      )}

      {/* Card container with flip effect */}
      <div className={`question-card ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div className="card-face card-front">
          <div className="card-header">
            <div className="operation-badge">
              <span className="operation-icon">{getOperationIcon()}</span>
              <span className="operation-text">{question.operation}</span>
            </div>
            <div 
              className="difficulty-badge" 
              style={{ backgroundColor: getDifficultyColor() }}
            >
              {question.difficulty}
            </div>
          </div>

          <div className="question-text">
            {question.questionText}
          </div>

          <div className="choices-grid">
            {question.choices.map((choice, index) => (
              <button
                key={index}
                className={`choice-button ${selectedChoice === choice ? 'selected' : ''}`}
                onClick={() => handleChoiceClick(choice)}
                disabled={isFlipped}
                aria-label={`Answer choice ${index + 1}: ${choice}. Press ${index + 1} on keyboard to select.`}
                data-key={index + 1}
              >
                <span className="key-hint">{index + 1}</span>
                {choice}
              </button>
            ))}
          </div>
        </div>

        {/* Back of card */}
        <div className="card-face card-back">
          <div className="result-header">
            <div className={`result-icon ${selectedChoice === question.correctAnswer ? 'correct' : 'incorrect'}`}>
              {selectedChoice === question.correctAnswer ? '✓' : '✗'}
            </div>
          </div>

          <div className="correct-answer-section">
            <div className="label">Correct Answer:</div>
            <div className="correct-answer">{question.correctAnswer}</div>
          </div>

          <div className="explanation">
            {question.explanation}
          </div>

          <div className="result-buttons">
            <button
              className="result-button got-it"
              onClick={() => handleResult(true)}
              aria-label="I got it right"
            >
              ✓ I got it
            </button>
            <button
              className="result-button missed-it"
              onClick={() => handleResult(false)}
              aria-label="I missed it"
            >
              ✗ I missed it
            </button>
          </div>

          <div className="hint-text">
            Be honest! This helps track your progress.
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;

