import { useUserData } from '../contexts/UserDataContext';
import { useNavigate } from 'react-router-dom';
import { Operation } from '../types';
import './StatsScreen.css';

function StatsScreen() {
  const { stats, missedQuestions, resetProgress } = useUserData();
  const navigate = useNavigate();

  const calculateAccuracy = (correct: number, attempted: number): number => {
    if (attempted === 0) return 0;
    return Math.round((correct / attempted) * 100);
  };

  const overallAccuracy = calculateAccuracy(stats.totalCorrect, stats.totalAttempted);

  const getOperationIcon = (operation: Operation): string => {
    switch (operation) {
      case 'addition': return '➕';
      case 'subtraction': return '➖';
      case 'multiplication': return '✖️';
      case 'division': return '➗';
    }
  };

  const getOperationColor = (operation: Operation): string => {
    switch (operation) {
      case 'addition': return '#4facfe';
      case 'subtraction': return '#f093fb';
      case 'multiplication': return '#ffeaa7';
      case 'division': return '#a29bfe';
    }
  };

  const missedCount = Object.keys(missedQuestions).length;
  const recentHistory = stats.history.slice(-10).reverse();

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone!')) {
      resetProgress();
    }
  };

  return (
    <div className="stats-screen">
      <div className="stats-header">
        <h2>📊 Your Progress</h2>
        <p className="stats-subtitle">Keep up the great work!</p>
      </div>

      {/* Overall Stats Card */}
      <div className="stats-card overall-stats">
        <h3>Overall Statistics</h3>
        <div className="overall-grid">
          <div className="stat-item">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats.totalAttempted}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.totalCorrect}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">❌</div>
            <div className="stat-value">{stats.totalIncorrect}</div>
            <div className="stat-label">Incorrect</div>
          </div>
          <div className="stat-item highlight">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{overallAccuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Per-Operation Stats */}
      <div className="stats-card operation-stats">
        <h3>Performance by Operation</h3>
        <div className="operations-grid">
          {(['addition', 'subtraction', 'multiplication', 'division'] as Operation[]).map((op) => {
            const opStats = stats.byOperation[op];
            const accuracy = calculateAccuracy(opStats.correct, opStats.attempted);
            return (
              <div 
                key={op} 
                className="operation-stat-card"
                style={{ borderLeftColor: getOperationColor(op) }}
              >
                <div className="operation-header">
                  <span className="operation-icon-large">{getOperationIcon(op)}</span>
                  <span className="operation-name">{op}</span>
                </div>
                <div className="operation-metrics">
                  <div className="metric">
                    <span className="metric-label">Attempted:</span>
                    <span className="metric-value">{opStats.attempted}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Correct:</span>
                    <span className="metric-value">{opStats.correct}</span>
                  </div>
                  <div className="metric accuracy-metric">
                    <span className="metric-label">Accuracy:</span>
                    <span className="metric-value">{accuracy}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${accuracy}%`,
                      backgroundColor: getOperationColor(op)
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missed Questions Summary */}
      {missedCount > 0 && (
        <div className="stats-card missed-summary">
          <div className="missed-header">
            <h3>⚠️ Questions to Review</h3>
            <div className="missed-count">{missedCount} question{missedCount !== 1 ? 's' : ''}</div>
          </div>
          <p className="missed-description">
            You have {missedCount} question{missedCount !== 1 ? 's' : ''} marked for review. 
            Practice makes perfect!
          </p>
          <button 
            className="review-button"
            onClick={() => navigate('/review')}
          >
            📚 Review Missed Questions
          </button>
        </div>
      )}

      {/* Recent Activity */}
      {recentHistory.length > 0 && (
        <div className="stats-card recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentHistory.map((record, index) => (
              <div 
                key={index} 
                className={`activity-item ${record.result}`}
              >
                <span className="activity-icon">{getOperationIcon(record.operation)}</span>
                <span className="activity-operation">{record.operation}</span>
                <span className={`activity-result ${record.result}`}>
                  {record.result === 'correct' ? '✓' : '✗'}
                </span>
                <span className="activity-time">
                  {new Date(record.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="stats-actions">
        <button 
          className="action-btn primary"
          onClick={() => navigate('/')}
        >
          🏠 Back to Home
        </button>
        <button 
          className="action-btn secondary"
          onClick={() => navigate('/practice')}
        >
          🚀 Start New Session
        </button>
        <button 
          className="action-btn danger"
          onClick={handleResetProgress}
          aria-label="Reset all progress"
        >
          🔄 Reset Progress
        </button>
      </div>
    </div>
  );
}

export default StatsScreen;

