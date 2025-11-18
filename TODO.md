# ✅ Math Practice App — Implementation TODO List (Easy → Hard)

## 1. **Project Setup (Very Easy)** ✅

* [x] Create React project (Vite recommended)
* [x] Install TypeScript
* [x] Set up folder structure (`components/`, `screens/`, `contexts/`, `lib/`)
* [x] Install React Router
* [x] Add basic global CSS + reset

---

## 2. **App Layout & Basic Navigation** ✅

* [x] Create `App.tsx` with router
* [x] Create placeholder screens:

  * [x] HomeScreen
  * [x] PracticeScreen
  * [x] StatsScreen
  * [x] ReviewScreen
* [x] Create basic navigation header and footer

---

## 3. **Data Models & Types** ✅

* [x] Define `Question` type
* [x] Define `UserData` type (stats, settings, missed questions)
* [x] Create `types.ts`

---

## 4. **Local Storage Utility** ✅

* [x] Create `persistence.ts` utilities for:

  * [x] loadUserData()
  * [x] saveUserData()
* [x] Test loading + saving

---

## 5. **UserDataContext (State Management)** ✅

* [x] Create React Context for:

  * [x] stats
  * [x] settings
  * [x] missedQuestions
* [x] Add functions:

  * [x] recordAttempt()
  * [x] recordMissedQuestion()
  * [x] clearMissedQuestion()
  * [x] saveSettings()
* [x] Persist to localStorage on changes

---

## 6. **Difficulty & Operation Settings UI** ✅

* [x] Implement HomeScreen selection widgets

  * [x] Choose operations (checkboxes)
  * [x] Choose difficulty level
  * [x] Choose session length (optional)
* [x] Store choices in `settings`

---

## 7. **Question Generator (Core Logic)** ✅

* [x] Create `questionGenerator.ts`

  * [x] Generate operands based on difficulty
  * [x] Implement each operation (add/subtract/multiply/divide)
  * [x] Ensure division results in integers
  * [x] Prevent negative subtraction results (Easy/Medium)
* [x] Generate distractors (4-choice set)
* [x] Shuffle answer options

---

## 8. **Basic QuestionCard (Front Side Only)** ✅

* [x] Render question text
* [x] Render multiple-choice buttons
* [x] Fire `onAnswer(choice)` callback

---

## 9. **Card Flip Animation** ✅

* [x] Add CSS 3D flip container
* [x] Structure card into front/back
* [x] Flip when user selects a choice

---

## 10. **Card Back: Answer & Result Buttons** ✅

* [x] Show correct answer
* [x] Add explanation text
* [x] Add "I got it" and "I missed it" buttons
* [x] Call `onResult(gotIt)`

---

## 11. **Practice Session Flow** ✅

* [x] Implement session queue (generate next question)
* [x] Track progress (e.g., Q3 of 10)
* [x] Reset card state after each question
* [x] Write results into context (stats + missedQuestions)

---

## 12. **Statistics Page (Medium Difficulty)** ✅

* [x] Display totals (attempted, correct, incorrect)
* [x] Display per-operation accuracy
* [x] Display recent activity timeline
* [x] Compute accuracy percentages

---

## 13. **Review Missed Questions (Medium)** ✅

* [x] Load missed questions from context
* [x] Sort by missedCount descending
* [x] Show a list OR card-by-card review mode
* [x] Allow user to retry missed questions
* [x] On success, optionally remove from list

---

## 14. **Persistent UX Enhancements**

* [ ] Auto-save settings to localStorage
* [ ] Dark mode toggle (optional)
* [ ] Ability to reset progress

---

## 15. **Accessibility & Child-Friendly UI**

* [ ] Keyboard navigation for choices
* [ ] ARIA labels for card & buttons
* [ ] Large touch-friendly buttons
* [ ] Color contrast compliance

---

## 16. **Polish & Animations (Hard)**

* [ ] Smooth question transition animation
* [ ] Sound effects (toggleable)
* [ ] Animated success/failure feedback
* [ ] Reduce-motion support

---

## 17. **Optional Advanced Features (Hardest / Future)**

* [ ] Adaptive difficulty based on accuracy
* [ ] Multiple user profiles
* [ ] Cloud sync (Firebase/Backend)
* [ ] Streaks / rewards / badges
* [ ] Printable worksheets
* [ ] Parent dashboard