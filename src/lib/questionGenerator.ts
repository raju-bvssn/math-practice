/**
 * Question Generator Module
 * 
 * Generates math questions with appropriate difficulty levels and smart distractors.
 * Supports addition, subtraction, multiplication, and division operations.
 */

import { Question, Operation, Difficulty } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  OPERAND_RANGES,
  HARD_MULTIPLICATION_LARGE_FACTOR,
  HARD_MULTIPLICATION_SMALL_FACTOR,
  NUM_DISTRACTORS,
  DISTRACTOR_OFFSETS,
  MIN_DISTRACTOR_VALUE,
  FALLBACK_DISTRACTOR_OFFSET_RANGE,
  OPERATION_SYMBOLS,
} from '../constants';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a random integer between min and max (inclusive)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in the specified range
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retrieves operand ranges for a given operation and difficulty
 * Uses centralized constants for consistency
 * 
 * @param operation - The math operation type
 * @param difficulty - The difficulty level
 * @returns Object containing min and max operand values
 */
function getOperandRanges(operation: Operation, difficulty: Difficulty): { min: number; max: number } {
  return OPERAND_RANGES[operation][difficulty];
}

/**
 * Generate addition question
 */
function generateAddition(difficulty: Difficulty): { a: number; b: number; answer: number } {
  const { min, max } = getOperandRanges('addition', difficulty);
  const a = randomInt(min, max);
  const b = randomInt(min, max);
  return { a, b, answer: a + b };
}

/**
 * Generate subtraction question (no negative results)
 */
function generateSubtraction(difficulty: Difficulty): { a: number; b: number; answer: number } {
  const { min, max } = getOperandRanges('subtraction', difficulty);
  const a = randomInt(min, max);
  // Ensure b <= a to avoid negative results
  const b = randomInt(min, a);
  return { a, b, answer: a - b };
}

/**
 * Generates a multiplication question appropriate for the difficulty level
 * 
 * Hard mode uses a special strategy: one large factor (10-99) and one small factor (0-12)
 * to create more challenging problems while keeping them manageable
 * 
 * @param difficulty - The difficulty level
 * @returns Object with operands (a, b) and the correct answer
 */
function generateMultiplication(difficulty: Difficulty): { a: number; b: number; answer: number } {
  const { min, max } = getOperandRanges('multiplication', difficulty);
  
  if (difficulty === 'hard') {
    // Hard mode: Mix one large factor with one small factor for challenging problems
    const largeNum = randomInt(HARD_MULTIPLICATION_LARGE_FACTOR.min, HARD_MULTIPLICATION_LARGE_FACTOR.max);
    const smallNum = randomInt(HARD_MULTIPLICATION_SMALL_FACTOR.min, HARD_MULTIPLICATION_SMALL_FACTOR.max);
    
    // Randomly decide which operand is the large number
    const a = Math.random() > 0.5 ? largeNum : smallNum;
    const b = a === largeNum ? smallNum : largeNum;
    
    return { a, b, answer: a * b };
  }
  
  // Easy and medium: Both factors from the same range
  const a = randomInt(min, max);
  const b = randomInt(min, max);
  return { a, b, answer: a * b };
}

/**
 * Generate division question (integer quotients only)
 */
function generateDivision(difficulty: Difficulty): { a: number; b: number; answer: number } {
  const ranges = getOperandRanges('division', difficulty);
  
  // Generate divisor (b)
  const divisor = randomInt(ranges.min, ranges.max);
  
  // Generate quotient (answer) based on difficulty
  let quotient: number;
  if (difficulty === 'easy') {
    quotient = randomInt(1, 20); // Results up to 20
  } else if (difficulty === 'medium') {
    quotient = randomInt(1, 144 / divisor); // Results that keep dividend reasonable
  } else {
    // Hard: can have larger quotients
    quotient = randomInt(2, Math.min(99, Math.floor(1000 / divisor)));
  }
  
  // Calculate dividend: a = b × quotient
  const dividend = divisor * quotient;
  
  return { a: dividend, b: divisor, answer: quotient };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Retrieves the display symbol for a given operation
 * Uses centralized constants for consistency across the app
 * 
 * @param operation - The math operation type
 * @returns Unicode symbol for the operation
 */
function getOperationSymbol(operation: Operation): string {
  return OPERATION_SYMBOLS[operation];
}

// ============================================================================
// DISTRACTOR GENERATION
// ============================================================================

/**
 * Adds operation-specific common mistakes to the distractor pool
 * 
 * These distractors are based on typical student errors:
 * - Multiplication: Off-by-one factor errors
 * - Division: Off-by-one quotient errors
 * - Addition: Near misses and wrong operation (multiply instead)
 * - Subtraction: Reversed operands and near misses
 * 
 * @param distractors - Set to add distractors to
 * @param operation - The math operation
 * @param correctAnswer - The correct answer to the question
 * @param a - First operand
 * @param b - Second operand
 */
function addOperationSpecificDistractors(
  distractors: Set<number>,
  operation: Operation,
  correctAnswer: number,
  a: number,
  b: number
): void {
  switch (operation) {
    case 'multiplication':
      // Off-by-one factor mistakes (e.g., 3×4 vs 2×4 or 3×5)
      if (a > 0) distractors.add((a - 1) * b);
      if (b > 0) distractors.add(a * (b - 1));
      distractors.add((a + 1) * b);
      distractors.add(a * (b + 1));
      break;

    case 'division':
      // Common division mistakes: off-by-one or off-by-two
      distractors.add(correctAnswer - 1);
      distractors.add(correctAnswer + 1);
      if (correctAnswer > 1) distractors.add(correctAnswer - 2);
      distractors.add(correctAnswer + 2);
      break;

    case 'addition':
      // Near misses and the common mistake of multiplying instead
      distractors.add(a + b - 1);
      distractors.add(a + b + 1);
      distractors.add(a * b); // Common error: using wrong operation
      break;

    case 'subtraction':
      // Reversed operands and near misses
      distractors.add(b - a); // Classic mistake: reversing the order
      if (a - b - 1 >= MIN_DISTRACTOR_VALUE) {
        distractors.add(a - b - 1);
      }
      distractors.add(a - b + 1);
      break;
  }
}

/**
 * Adds offset-based distractors around the correct answer
 * Offsets are scaled based on difficulty level
 * 
 * @param distractors - Set to add distractors to
 * @param correctAnswer - The correct answer
 * @param difficulty - The difficulty level
 */
function addOffsetDistractors(
  distractors: Set<number>,
  correctAnswer: number,
  difficulty: Difficulty
): void {
  const offsets = DISTRACTOR_OFFSETS[difficulty];
  
  for (const offset of offsets) {
    const distractor = correctAnswer + offset;
    // Only include non-negative distractors (no negative numbers for kids)
    if (distractor >= MIN_DISTRACTOR_VALUE) {
      distractors.add(distractor);
    }
  }
}

/**
 * Selects a random subset of distractors from the pool
 * 
 * @param distractorPool - Array of possible distractors
 * @param count - Number of distractors to select
 * @returns Array of selected distractors
 */
function selectRandomDistractors(distractorPool: number[], count: number): number[] {
  const selected: number[] = [];
  const pool = [...distractorPool]; // Create a copy to avoid mutating input
  
  while (selected.length < count && pool.length > 0) {
    const index = randomInt(0, pool.length - 1);
    selected.push(pool[index]);
    pool.splice(index, 1); // Remove selected item from pool
  }
  
  return selected;
}

/**
 * Generates additional random distractors if needed
 * Used as a fallback when we don't have enough unique distractors
 * 
 * @param currentDistractors - Already selected distractors
 * @param correctAnswer - The correct answer (to avoid duplicates)
 * @param targetCount - Total number of distractors needed
 * @returns Updated array with additional distractors
 */
function fillRemainingDistractors(
  currentDistractors: number[],
  correctAnswer: number,
  targetCount: number
): number[] {
  const result = [...currentDistractors];
  const { min, max } = FALLBACK_DISTRACTOR_OFFSET_RANGE;
  
  // Generate random offsets until we have enough unique distractors
  while (result.length < targetCount) {
    const offset = randomInt(min, max) * (Math.random() > 0.5 ? 1 : -1);
    const distractor = correctAnswer + offset;
    
    // Ensure distractor is valid and unique
    if (
      distractor >= MIN_DISTRACTOR_VALUE &&
      distractor !== correctAnswer &&
      !result.includes(distractor)
    ) {
      result.push(distractor);
    }
  }
  
  return result;
}

/**
 * Generates smart distractors (wrong answers) for multiple choice questions
 * 
 * Strategy:
 * 1. Add operation-specific common mistakes
 * 2. Add offset-based distractors scaled to difficulty
 * 3. Randomly select from the pool
 * 4. Fill any remaining slots with random distractors
 * 
 * @param correctAnswer - The correct answer to the question
 * @param operation - The math operation type
 * @param difficulty - The difficulty level
 * @param operands - The operands used in the question [a, b]
 * @returns Array of distractor values
 */
function generateDistractors(
  correctAnswer: number,
  operation: Operation,
  difficulty: Difficulty,
  operands: [number, number]
): number[] {
  const distractorSet = new Set<number>();
  const [a, b] = operands;
  
  // Step 1: Add operation-specific mistakes (e.g., off-by-one errors)
  addOperationSpecificDistractors(distractorSet, operation, correctAnswer, a, b);
  
  // Step 2: Add offset-based distractors (scaled by difficulty)
  addOffsetDistractors(distractorSet, correctAnswer, difficulty);
  
  // Step 3: Remove the correct answer if it was accidentally added
  distractorSet.delete(correctAnswer);
  
  // Step 4: Convert to array and randomly select the needed number
  const distractorPool = Array.from(distractorSet);
  let selectedDistractors = selectRandomDistractors(distractorPool, NUM_DISTRACTORS);
  
  // Step 5: Fill any remaining slots with random distractors
  if (selectedDistractors.length < NUM_DISTRACTORS) {
    selectedDistractors = fillRemainingDistractors(
      selectedDistractors,
      correctAnswer,
      NUM_DISTRACTORS
    );
  }
  
  return selectedDistractors;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate explanation text for the answer
 */
function generateExplanation(operation: Operation, a: number, b: number, answer: number): string {
  switch (operation) {
    case 'addition':
      return `${a} plus ${b} equals ${answer}.`;
    case 'subtraction':
      return `${a} minus ${b} equals ${answer}.`;
    case 'multiplication':
      if (b <= 12) {
        return `${a} times ${b} equals ${answer}. Think of it as ${b} groups of ${a}.`;
      }
      return `${a} times ${b} equals ${answer}.`;
    case 'division':
      return `${a} divided by ${b} equals ${answer}. ${a} can be split into ${answer} groups of ${b}.`;
    default:
      return `The answer is ${answer}.`;
  }
}

/**
 * Main function to generate a complete question
 */
export function generateQuestion(operation: Operation, difficulty: Difficulty): Question {
  let a: number, b: number, answer: number;
  
  // Generate operands and answer based on operation
  switch (operation) {
    case 'addition':
      ({ a, b, answer } = generateAddition(difficulty));
      break;
    case 'subtraction':
      ({ a, b, answer } = generateSubtraction(difficulty));
      break;
    case 'multiplication':
      ({ a, b, answer } = generateMultiplication(difficulty));
      break;
    case 'division':
      ({ a, b, answer } = generateDivision(difficulty));
      break;
  }
  
  // Generate question text
  const symbol = getOperationSymbol(operation);
  const questionText = `${a} ${symbol} ${b} = ?`;
  
  // Generate distractors
  const distractors = generateDistractors(answer, operation, difficulty, [a, b]);
  
  // Create choices array and shuffle
  const choices = shuffleArray([answer, ...distractors]);
  
  // Generate explanation
  const explanation = generateExplanation(operation, a, b, answer);
  
  return {
    id: uuidv4(),
    operation,
    difficulty,
    operands: [a, b],
    questionText,
    correctAnswer: answer,
    choices,
    explanation,
    createdAt: Date.now(),
  };
}

