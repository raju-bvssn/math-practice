import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserDataProvider } from './contexts/UserDataContext';
import HomeScreen from './screens/HomeScreen';
import PracticeScreen from './screens/PracticeScreen';
import StatsScreen from './screens/StatsScreen';
import ReviewScreen from './screens/ReviewScreen';
import './App.css';

function App() {
  return (
    <UserDataProvider>
      <Router>
        <div className="app">
          <header className="app-header">
            <h1>Math Practice</h1>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/stats">Stats</Link>
              <Link to="/review">Review</Link>
            </nav>
          </header>
          
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/practice" element={<PracticeScreen />} />
              <Route path="/stats" element={<StatsScreen />} />
              <Route path="/review" element={<ReviewScreen />} />
            </Routes>
          </main>
          
          <footer className="app-footer">
            <p>Math Practice - Keep Learning! 🎯</p>
          </footer>
        </div>
      </Router>
    </UserDataProvider>
  );
}

export default App;

