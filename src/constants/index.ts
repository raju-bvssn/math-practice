/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values for maintainability
 */

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

/** Delay in ms before transitioning to next question after answer submission */
export const CARD_ANIMATION_DELAY_MS = 300;

// ============================================================================
// SESSION CONFIGURATION CONSTANTS
// ============================================================================

/** Minimum session length (0 = continuous mode with unlimited questions) */
export const MIN_SESSION_LENGTH = 0;

/** Maximum session length to prevent overly long sessions */
export const MAX_SESSION_LENGTH = 50;

// ============================================================================
// QUESTION GENERATION CONSTANTS
// ============================================================================

/** Number of wrong answer choices to generate for each question */
export const NUM_DISTRACTORS = 3;

/** Total number of choices presented (1 correct + distractors) */
export const TOTAL_CHOICES = 4;

/** Keyboard keys mapped to answer choices (1-4) */
export const ANSWER_KEYS = ['1', '2', '3', '4'];

// ============================================================================
// DIFFICULTY RANGE CONSTANTS
// ============================================================================

/**
 * Operand ranges for different operations and difficulty levels
 * Used to generate appropriate question difficulty
 */
export const OPERAND_RANGES = {
  addition: {
    easy: { min: 0, max: 20 },
    medium: { min: 0, max: 100 },
    hard: { min: 0, max: 1000 },
  },
  subtraction: {
    easy: { min: 0, max: 20 },
    medium: { min: 0, max: 100 },
    hard: { min: 0, max: 1000 },
  },
  multiplication: {
    easy: { min: 0, max: 5 },
    medium: { min: 0, max: 12 },
    hard: { min: 0, max: 12 }, // Hard mode has special logic for one large factor
  },
  division: {
    easy: { min: 1, max: 5 },
    medium: { min: 1, max: 12 },
    hard: { min: 1, max: 12 },
  },
} as const;

/** Special range for hard multiplication - one factor is larger */
export const HARD_MULTIPLICATION_LARGE_FACTOR = { min: 10, max: 99 };
export const HARD_MULTIPLICATION_SMALL_FACTOR = { min: 0, max: 12 };

// ============================================================================
// DISTRACTOR GENERATION CONSTANTS
// ============================================================================

/**
 * Offset values used to generate plausible wrong answers
 * Organized by difficulty level
 */
export const DISTRACTOR_OFFSETS = {
  easy: [-2, -1, 1, 2, 3],
  medium: [-10, -5, -2, -1, 1, 2, 5, 10],
  hard: [-20, -10, -5, -1, 1, 5, 10, 20],
} as const;

/** Minimum value for distractors (avoid negative numbers for kids) */
export const MIN_DISTRACTOR_VALUE = 0;

/** Fallback offset range when generating additional random distractors */
export const FALLBACK_DISTRACTOR_OFFSET_RANGE = { min: 1, max: 5 };

// ============================================================================
// CONFETTI ANIMATION CONSTANTS
// ============================================================================

/** Total number of confetti particles to create */
export const CONFETTI_PARTICLE_COUNT = 200;

/** Z-index to ensure confetti appears above all other elements */
export const CONFETTI_Z_INDEX = 9999;

/** Y-position origin for confetti (0 = top, 1 = bottom) */
export const CONFETTI_ORIGIN_Y = 0.7;

/**
 * Configuration for multi-burst confetti effect
 * Each burst has different spread, velocity, and particle ratio for variety
 */
export const CONFETTI_BURSTS = [
  { ratio: 0.25, spread: 26, startVelocity: 55 },
  { ratio: 0.2, spread: 60 },
  { ratio: 0.35, spread: 100, decay: 0.91, scalar: 0.8 },
  { ratio: 0.1, spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 },
  { ratio: 0.1, spread: 120, startVelocity: 45 },
] as const;

// ============================================================================
// SOUND EFFECT CONSTANTS
// ============================================================================

/** Default state for sound effects (can be toggled by user) */
export const SOUND_ENABLED_DEFAULT = true;

/** Volume level for sound effects (0.0 to 1.0) */
export const SOUND_VOLUME = 0.3;

/** Duration of each musical note in milliseconds */
export const SOUND_NOTE_DURATION_MS = 150;

/**
 * Musical notes for success sound (ascending major scale)
 * Frequencies in Hz: C5, E5, G5, C6 (C major chord arpeggio)
 * Creates a cheerful, uplifting sound
 */
export const SOUND_SUCCESS_NOTES = [
  523.25, // C5
  659.25, // E5
  783.99, // G5
  1046.50, // C6
] as const;

/**
 * Musical notes for incorrect answer sound (gentle descending tones)
 * Frequencies in Hz: E4, D4 (gentle, neutral notification)
 * Intentionally subtle and non-punitive to maintain positive learning environment
 */
export const SOUND_INCORRECT_NOTES = [
  329.63, // E4
  293.66, // D4
] as const;

/** Duration of incorrect answer sound notes (shorter and gentler than success) */
export const SOUND_INCORRECT_NOTE_DURATION_MS = 120;

// ============================================================================
// UI THEME CONSTANTS
// ============================================================================

/**
 * Color scheme for difficulty levels
 * Using Material Design color palette
 */
export const DIFFICULTY_COLORS = {
  easy: '#4caf50',    // Green
  medium: '#ff9800',  // Orange
  hard: '#f44336',    // Red
  default: '#999',    // Gray fallback
} as const;

/**
 * Operation icons using Unicode emoji
 */
export const OPERATION_ICONS = {
  addition: '➕',
  subtraction: '➖',
  multiplication: '✖️',
  division: '➗',
} as const;

/**
 * Operation symbols for question text
 */
export const OPERATION_SYMBOLS = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
} as const;

