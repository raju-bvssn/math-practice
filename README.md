# Math Practice App

A kid-friendly React web application for children (ages 7-12) to practice addition, subtraction, multiplication, and division using interactive multiple-choice question cards.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

Build the app for production:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 📁 Project Structure

```
math-practice/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/         # React Context providers
│   │   └── UserDataContext.tsx
│   ├── lib/              # Utilities and core logic
│   │   ├── persistence.ts
│   │   └── questionGenerator.ts
│   ├── screens/          # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── PracticeScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── ReviewScreen.tsx
│   ├── App.tsx           # Main app component with routing
│   ├── App.css           # App-level styles
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles and CSS reset
│   └── types.ts          # TypeScript type definitions
├── public/               # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md            # This file
```

## ✨ Features

- **Multiple Operations**: Practice addition, subtraction, multiplication, and division
- **Difficulty Levels**: Easy, Medium, and Hard with age-appropriate ranges
- **Multiple Choice**: 4 smart answer choices with realistic distractors
- **Card Flip Animation**: Beautiful 3D card flip reveals with glowing borders
- **Progress Tracking**: Comprehensive statistics dashboard with visual charts
- **Missed Questions Review**: Prioritized review system that removes mastered questions
- **Session Management**: Fixed length or continuous mode practice sessions
- **Local Persistence**: All data automatically saved in browser localStorage
- **Kid-Friendly UI**: Vibrant gradients, playful animations, and Comic Sans font
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Feedback**: Animated success/error indicators with explanations

## 🎯 Implementation Status

### Completed Phases ✅

**Phase 1: Project Setup** ✅
- React + Vite + TypeScript setup
- Folder structure
- React Router
- Basic global CSS + reset

**Phase 2: App Layout & Basic Navigation** ✅
- Complete routing system
- Navigation header and footer
- All screen placeholders

**Phase 3: Data Models & Types** ✅
- Complete TypeScript type definitions
- Question, UserData, Stats models

**Phase 4: Local Storage Utility** ✅
- Load/save functions
- Persistent data storage

**Phase 5: UserDataContext (State Management)** ✅
- React Context implementation
- Stats tracking
- Settings management
- Missed questions tracking

**Phase 6: Difficulty & Operation Settings UI** ✅
- Beautiful, interactive HomeScreen
- Operation selection
- Difficulty selection
- Session length configuration

**Phase 7: Question Generator (Core Logic)** ✅
- All 4 operations (add/subtract/multiply/divide)
- All 3 difficulty levels
- Smart distractor generation
- Integer-only division
- No negative subtraction

**Phase 8-11: Practice Screen & Question Cards** ✅
- Fully functional QuestionCard component
- 3D card flip animation
- Multiple choice interface
- Result tracking
- Session management
- Progress tracking
- Stats integration

**🎨 Kid-Friendly UI Enhancements** ✅
- Vibrant gradient backgrounds
- Playful animations
- Comic Sans font family
- Colorful buttons and cards
- Engaging visual feedback
- Smooth transitions

**Phase 12: Statistics Page** ✅
- Overall statistics with animated cards
- Per-operation accuracy with progress bars
- Recent activity timeline
- Visual feedback and color-coded metrics
- Link to review missed questions

**Phase 13: Review Missed Questions** ✅
- Prioritized by missed count
- Card-by-card review interface
- Automatic removal on correct answer
- Empty state for no missed questions
- Review complete summary

### 🎉 Core App Complete!
All essential features are now implemented and fully functional! The app includes:
- Complete question generation for all operations and difficulties
- Interactive practice sessions with card flip animations
- Comprehensive statistics tracking
- Missed questions review system
- Data persistence with localStorage
- Beautiful, kid-friendly UI throughout

### Optional Future Enhancements
- Sound effects and audio feedback
- Multiple user profiles
- Cloud sync (Firebase)
- Adaptive difficulty
- Rewards and badges system
- Printable worksheets

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS Modules** - Component styling
- **localStorage** - Data persistence

## 📝 License

This project is for educational purposes.

