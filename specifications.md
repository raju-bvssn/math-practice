# Math Practice — Software Specification

## Overview

**App name (working):** Math Practice
**Purpose:** A kid-friendly React web app for children (7–12) to practice addition, subtraction, multiplication and division using multiple-choice question cards. Cards flip to reveal answers. After checking the answer, the child reports whether they got it right or wrong. The app tracks per-operation & overall statistics and remembers which questions were missed. Data persists locally (browser `localStorage`).

## Key Features (summary)

* React single-page application (SPA).
* Four operations: addition, subtraction, multiplication, division.
* Random question generator with 3 difficulty levels: Easy / Medium / Hard.
* Multiple-choice cards (4 options). Options randomized.
* Card flip animation to reveal the correct answer.
* After flip: two action buttons — **"I got it"** and **"I missed it"**.
* Track incorrect questions and their retry counters.
* Statistics page showing totals attempted, correct, incorrect and per-operation accuracy, plus simple recent history.
* Local persistence via `localStorage` (optionally sync later).
* Accessible (ARIA & keyboard) and responsive for tablet/phone.

---

## UX Flow

1. **Home / Mode Selection**

   * Choose operation(s): Addition, Subtraction, Multiplication, Division (user may select one or multiple).
   * Choose difficulty: Easy / Medium / Hard (default: Medium).
   * Session length: Timed (e.g., 10 questions) or Continuous (user stops).
   * Start Practice button.

2. **Practice screen**

   * A single question card in the center.
   * Top: operation icon and difficulty badge.
   * Card front: question text (e.g., `7 × 8 = ?`) and four multiple-choice buttons.
   * When user selects a choice, card flips to show the correct answer and an explanation (optional), then shows two buttons: **I got it** / **I missed it**.
   * When user presses one of these, the result is recorded and the next card appears.

3. **Statistics screen**

   * Total attempted, total correct, total incorrect.
   * Accuracy % overall and per operation.
   * Recent activity (last 7 sessions or last 50 questions), simple chart or list (optional sparkline).
   * "Review Missed Questions" section showing questions user marked missed.

4. **Review Missed Questions**

   * Presents previously missed questions (prioritized by frequency missed).
   * Allows re-practice and removal when answered correctly by the user.

---

## Defaults & Rules (chosen)

### Difficulty ranges (numbers selected for ages 7–12)

* **Easy**

  * Addition/Subtraction: addends within 0–20.
  * Multiplication: factors 0–5.
  * Division: divisors 1–5, dividends chosen so result is integer and <= 20.
* **Medium (default)**

  * Addition/Subtraction: addends within 0–100.
  * Multiplication: factors 0–12.
  * Division: divisors 1–12, dividends chosen so result is integer and <= 144.
* **Hard**

  * Addition/Subtraction: addends within 0–1000 (include carrying).
  * Multiplication: one factor 0–99, other 0–12 (two-digit × one-digit).
  * Division: divisors 1–12, dividends possibly 2-digit such that quotient can be multi-digit but prefer integer results (no remainders).

**Division rule:** For user confidence, generate division problems with integer quotients (no remainders).

### Multiple-choice

* Exactly **4 options** per question (1 correct + 3 distractors).
* Distractors generated with rules:

  * Use offsets near the correct answer (e.g., ±1, ±2, ±5, ±10) depending on difficulty.
  * For multiplication/division use spectrally plausible distractors (e.g., swapped operands or off-by-one).
  * Avoid duplicate options, avoid negative distractors for younger difficulties.
  * Shuffle order randomly before display.

### Question generation

* Questions are randomly generated at run time according to chosen operations and difficulty.
* Ensure subtraction does not force negative results in Easy; Medium/Hard may include negative if desired (default: do not create negative results).
* Keep track of a deterministic seed option (dev mode) for reproducible test sessions.

---

## Data Model

### Question object (example)

```json
{
  "id": "uuid-v4",
  "operation": "multiplication",   // addition|subtraction|multiplication|division
  "difficulty": "medium",         // easy|medium|hard
  "operands": [7, 8],
  "questionText": "7 × 8 = ?",
  "correctAnswer": 56,
  "choices": [56, 54, 48, 63],
  "explanation": "7 times 8 is 56.",
  "createdAt": 1699999999999
}
```

### Stored user data (localStorage)

Key: `math-practice:userData` JSON:

```json
{
  "stats": {
    "totalAttempted": 123,
    "totalCorrect": 98,
    "totalIncorrect": 25,
    "byOperation": {
      "addition": {"attempted": 40, "correct": 34},
      "subtraction": {"attempted": 30, "correct": 20},
      "multiplication": {"attempted": 30, "correct": 28},
      "division": {"attempted": 23, "correct": 16}
    },
    "history": [
      {"timestamp": 1699999999999, "questionId": "uuid", "operation": "addition", "result": "correct"}
    ]
  },
  "missedQuestions": {
    "uuid-1": {"question": {...}, "missedCount": 3, "lastMissedAt": 1699999999999}
  },
  "settings": {
    "difficulty": "medium",
    "operations": ["addition","multiplication"],
    "sessionLength": 10
  }
}
```

---

## Architecture & Components

### Tech stack

* React (latest stable).
* TypeScript (recommended).
* State: React Context + hooks (or Zustand) — simple local app state.
* Styling: CSS Modules or Styled Components (pick one; default: CSS Modules).
* Build: Vite or Create React App (Vite recommended).
* Persistence: `localStorage`. Optional future sync: Firebase / backend REST API.
* Tests: Jest + React Testing Library for unit tests; Playwright or Cypress for E2E.

### Component tree (high level)

* `App` (router)

  * `Header` (nav to Home / Stats / Review)
  * `HomeScreen` (operation/difficulty/session setup)
  * `PracticeScreen`

    * `QuestionCard`

      * `CardFront` (question + choices)
      * `CardBack` (correct answer + explanation + I got it/I missed it)
    * `SessionProgressBar`
  * `StatsScreen`

    * `StatsSummary`
    * `PerOperationStats`
    * `RecentHistory`
  * `ReviewScreen` (missed questions)
  * `SettingsScreen` (optional)
  * `Footer`

### Key components detail

#### `QuestionCard`

* Props: `question`, `onAnswer(choice)`, `onResult(gotIt: boolean)`.
* Internal state: `selectedChoice`, `flipped`.
* Behaviour:

  * On choice click: set `selectedChoice`, animate flip to back, show correct answer.
  * Back view shows explanation and two buttons: **I got it** / **I missed it**.
  * If user presses either, call `onResult(true|false)` and reset for next question.

#### `PracticeScreen`

* Manages session queue of questions.
* Pulls new question(s) via `questionGenerator`.
* Calls persistence functions to update stats and missedQuestions.
* Shows progress (e.g., `Q 3 / 10`).

---

## State Management & Persistence

* Use a `UserDataContext` for stats, missed questions and settings.

* `UserDataContext` exposes:

  * `stats`, `missedQuestions`, `settings`
  * `recordAttempt(question, result)` — updates stats & history
  * `recordMissedQuestion(question)` — increments missedCount & stores question
  * `clearMissedQuestion(questionId)`
  * `saveSettings(settings)`
  * These functions also update `localStorage`.

* `questionGenerator` is a pure function that returns `Question` objects given `operation` & `difficulty`.

---

## Algorithms

### Question generation (pseudocode)

* Input: `operation`, `difficulty`
* Based on rules (see Difficulty ranges), pick operands `a`, `b`.
* For division: pick quotient `q` in range, pick divisor `d`, set dividend `a = q * d`.
* Compute `correct = op(a, b)`.
* Generate distractors:

  * Use set `distractors = {}` while size < 3:

    * For easy: pick `correct + randomChoice([-2,-1,1,2,3])`
    * For medium: random offsets from `[-10,-5,-2,2,5,10]` or swap digits
    * For multiplication: include `a*(b+1)` or `(a+1)*b`
    * Ensure no duplicates & not equal to `correct`.
* Shuffle `[correct, ...distractors]` (Fisher-Yates).

### Stats recording

* `recordAttempt`:

  * increment `totalAttempted`.
  * increment per-operation attempted.
  * if `result === correct`, increment correct counters else increment incorrect counters and call `recordMissedQuestion`.
  * push to `history` with timestamp & result.

### Missed question priority

* When showing review queue, sort missed questions by `missedCount` descending and `lastMissedAt` ascending.

---

## UI/Design & Accessibility

* Card flip: use CSS 3D transform and `prefers-reduced-motion` support.
* UI elements sized for tap targets (>= 44px).
* High color contrast, large font sizes (children aged 7–12).
* Keyboard accessible:

  * Tab to choices, Enter to select.
  * Space/Enter for I got it / I missed it.
* ARIA:

  * `role="button"` and `aria-pressed` for choices.
  * `aria-live="polite"` for feedback messages.
* Option to toggle sound effects (on/off) and to respect device mute.

---

## Acceptance Criteria (Examples)

1. Given difficulty Medium and operation Multiplication, when the session starts, the first question is a multiplication question with factors in 0–12.
2. Each question shows exactly 4 choices and one answer is correct.
3. When a choice is selected the card flips and shows the correct answer.
4. After flip, pressing **I got it** records the question as correct and updates overall and per-operation stats.
5. Pressing **I missed it** records the question in `missedQuestions` with `missedCount` incremented.
6. `Stats` screen shows totals and per-operation accuracy and displays the number of missed questions.
7. Data persists across page refreshes (via `localStorage`).

---

## Example UI Mock (text)

**Front of Card**

```
[ Multiplication ]    [Medium]

  7 × 8 = ?

  [ 56 ]  [ 54 ]
  [ 63 ]  [ 48 ]
```

**After Selecting One — Flip**

```
Correct answer: 56
Explanation: 7 groups of 8 equals 56.

[ I got it ]   [ I missed it ]
```

---

## Developer Tasks & Suggested Files

* `src/`

  * `App.tsx`
  * `index.tsx`
  * `contexts/UserDataContext.tsx`
  * `components/QuestionCard/QuestionCard.tsx`
  * `components/CardFlip/CardFlip.css`
  * `screens/HomeScreen.tsx`
  * `screens/PracticeScreen.tsx`
  * `screens/StatsScreen.tsx`
  * `lib/questionGenerator.ts`
  * `lib/persistence.ts`
  * `types.ts`
  * `tests/` — unit & integration tests

---

## Testing Plan

* Unit tests:

  * `questionGenerator` returns valid `Question` objects with unique choices.
  * distractor generation edge cases.
  * `recordAttempt` updates stats correctly.
* Component tests:

  * `QuestionCard` flips on choice and calls `onResult`.
* E2E:

  * Start session, answer few questions, verify stats update and missed questions recorded.
* Accessibility tests (axe-core integration).

---

## Metrics & Analytics (optional)

* In future, support anonymous analytics events (questions attempted, time per question) for product improvement. Use an opt-in parental consent toggle.

---

## Future Enhancements (roadmap)

* Multiple profiles (separate stats per child).
* Sync to cloud (Firebase) to persist across devices.
* Adaptive difficulty (algorithm that adjusts difficulty based on performance).
* Rewards: badges, stars, streaks.
* Timed mode and leaderboards (with parental controls).
* Printable worksheets from missed questions.

---

## Implementation Notes & Gotchas

* Keep division questions integer-only by construction to avoid confusion for younger kids.
* Avoid negative subtraction in Easy.
* Carefully generate distractors to avoid giving an obviously wrong set (e.g., not all distractors far from the right value).
* Respect `prefers-reduced-motion` to disable flip animations for users who prefer reduced motion.
