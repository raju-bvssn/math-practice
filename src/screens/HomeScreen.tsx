/**
 * HomeScreen Component
 * 
 * Landing page where users configure their practice session settings
 * Features:
 * - Multi-select operations (addition, subtraction, multiplication, division)
 * - Difficulty level selection (easy, medium, hard)
 * - Session length configuration (including continuous mode)
 * - Settings persistence across sessions
 * - Input validation before starting practice
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../contexts/UserDataContext';
import { Operation, Difficulty } from '../types';
import { MIN_SESSION_LENGTH, MAX_SESSION_LENGTH } from '../constants';
import './HomeScreen.css';

function HomeScreen() {
  const { settings, saveSettings } = useUserData();
  const navigate = useNavigate();
  
  // Initialize local state from persisted user settings
  const [selectedOperations, setSelectedOperations] = useState<Operation[]>(settings.operations);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(settings.difficulty);
  const [sessionLength, setSessionLength] = useState(settings.sessionLength);

  /**
   * Toggles an operation in the selected operations list
   * Allows multi-select: users can practice multiple operation types in one session
   * 
   * @param operation - The operation to toggle (add/remove)
   */
  const toggleOperation = (operation: Operation) => {
    setSelectedOperations((prev) =>
      prev.includes(operation)
        ? prev.filter((op) => op !== operation) // Remove if already selected
        : [...prev, operation] // Add if not selected
    );
  };

  /**
   * Validates settings and starts a practice session
   * 
   * Validation:
   * - At least one operation must be selected
   * 
   * On success:
   * - Saves settings to persistent storage
   * - Navigates to practice screen
   */
  const handleStartPractice = () => {
    // Validation: Ensure at least one operation is selected
    if (selectedOperations.length === 0) {
      alert('Please select at least one operation!');
      return;
    }

    // Persist settings for future sessions
    saveSettings({
      difficulty: selectedDifficulty,
      operations: selectedOperations,
      sessionLength,
    });

    // Navigate to practice screen
    navigate('/practice');
  };

  return (
    <div className="home-screen">
      <h2>Welcome to Math Practice!</h2>
      <p className="subtitle">Choose your practice settings and start learning</p>

      <div className="settings-section">
        <h3>Select Operations</h3>
        <div className="operation-buttons">
          {(['addition', 'subtraction', 'multiplication', 'division'] as Operation[]).map((op) => (
            <button
              key={op}
              className={`operation-btn ${selectedOperations.includes(op) ? 'selected' : ''}`}
              onClick={() => toggleOperation(op)}
              aria-pressed={selectedOperations.includes(op)}
            >
              {op === 'addition' && '+ Addition'}
              {op === 'subtraction' && '− Subtraction'}
              {op === 'multiplication' && '× Multiplication'}
              {op === 'division' && '÷ Division'}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Select Difficulty</h3>
        <div className="difficulty-buttons">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              className={`difficulty-btn ${selectedDifficulty === diff ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(diff)}
              aria-pressed={selectedDifficulty === diff}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Session Length</h3>
        <div className="session-length">
          <input
            type="number"
            min={MIN_SESSION_LENGTH}
            max={MAX_SESSION_LENGTH}
            value={sessionLength}
            onChange={(e) => setSessionLength(Math.max(MIN_SESSION_LENGTH, parseInt(e.target.value) || MIN_SESSION_LENGTH))}
            aria-label="Session length"
          />
          <span className="hint">(0 = continuous mode)</span>
        </div>
      </div>

      <button className="start-button" onClick={handleStartPractice}>
        Start Practice
      </button>
    </div>
  );
}

export default HomeScreen;

