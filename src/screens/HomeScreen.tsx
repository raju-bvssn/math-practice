import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../contexts/UserDataContext';
import { Operation, Difficulty } from '../types';
import './HomeScreen.css';

function HomeScreen() {
  const { settings, saveSettings } = useUserData();
  const navigate = useNavigate();
  
  const [selectedOperations, setSelectedOperations] = useState<Operation[]>(settings.operations);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(settings.difficulty);
  const [sessionLength, setSessionLength] = useState(settings.sessionLength);

  const toggleOperation = (operation: Operation) => {
    setSelectedOperations((prev) =>
      prev.includes(operation)
        ? prev.filter((op) => op !== operation)
        : [...prev, operation]
    );
  };

  const handleStartPractice = () => {
    if (selectedOperations.length === 0) {
      alert('Please select at least one operation!');
      return;
    }

    saveSettings({
      difficulty: selectedDifficulty,
      operations: selectedOperations,
      sessionLength,
    });

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
            min="0"
            max="50"
            value={sessionLength}
            onChange={(e) => setSessionLength(Math.max(0, parseInt(e.target.value) || 0))}
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

