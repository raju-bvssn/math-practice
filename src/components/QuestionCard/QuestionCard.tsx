import { useState, useEffect } from 'react';
import { Question } from '../../types';
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

  // Keyboard navigation: Press 1-4 to select answers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle keyboard if card is not flipped yet
      if (isFlipped) return;
      
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const index = parseInt(key) - 1;
        if (index < question.choices.length) {
          handleChoiceClick(question.choices[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, question.choices]);

  const handleChoiceClick = (choice: number) => {
    if (isFlipped) return; // Prevent selecting after flip
    
    setSelectedChoice(choice);
    setIsFlipped(true);
  };

  const handleResult = (gotIt: boolean) => {
    // Reset state for next question
    setSelectedChoice(null);
    setIsFlipped(false);
    
    // Call parent callback
    onResult(gotIt);
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#999';
    }
  };

  const getOperationIcon = () => {
    switch (question.operation) {
      case 'addition': return '➕';
      case 'subtraction': return '➖';
      case 'multiplication': return '✖️';
      case 'division': return '➗';
    }
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

