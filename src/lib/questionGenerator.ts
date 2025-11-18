import { Question, Operation, Difficulty } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get operand ranges based on difficulty level and operation
 */
function getOperandRanges(operation: Operation, difficulty: Difficulty): { min: number; max: number } {
  switch (operation) {
    case 'addition':
    case 'subtraction':
      if (difficulty === 'easy') return { min: 0, max: 20 };
      if (difficulty === 'medium') return { min: 0, max: 100 };
      return { min: 0, max: 1000 }; // hard
    
    case 'multiplication':
      if (difficulty === 'easy') return { min: 0, max: 5 };
      if (difficulty === 'medium') return { min: 0, max: 12 };
      // hard: one factor 0-99, other 0-12 (handled separately)
      return { min: 0, max: 12 };
    
    case 'division':
      // For division, we'll handle this differently in the generation logic
      if (difficulty === 'easy') return { min: 1, max: 5 };
      if (difficulty === 'medium') return { min: 1, max: 12 };
      return { min: 1, max: 12 }; // hard
    
    default:
      return { min: 0, max: 10 };
  }
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
 * Generate multiplication question
 */
function generateMultiplication(difficulty: Difficulty): { a: number; b: number; answer: number } {
  const { min, max } = getOperandRanges('multiplication', difficulty);
  
  if (difficulty === 'hard') {
    // Hard: one factor 0-99, other 0-12
    const largeNum = randomInt(10, 99);
    const smallNum = randomInt(0, 12);
    const a = Math.random() > 0.5 ? largeNum : smallNum;
    const b = a === largeNum ? smallNum : largeNum;
    return { a, b, answer: a * b };
  }
  
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

/**
 * Get operation symbol for display
 */
function getOperationSymbol(operation: Operation): string {
  switch (operation) {
    case 'addition': return '+';
    case 'subtraction': return '−';
    case 'multiplication': return '×';
    case 'division': return '÷';
  }
}

/**
 * Generate smart distractors (wrong answers) for multiple choice
 */
function generateDistractors(
  correctAnswer: number,
  operation: Operation,
  difficulty: Difficulty,
  operands: [number, number]
): number[] {
  const distractors = new Set<number>();
  const [a, b] = operands;
  
  // Define offset ranges based on difficulty
  const offsets = difficulty === 'easy' 
    ? [-2, -1, 1, 2, 3] 
    : difficulty === 'medium'
    ? [-10, -5, -2, -1, 1, 2, 5, 10]
    : [-20, -10, -5, -1, 1, 5, 10, 20];
  
  // Add common mistakes based on operation
  if (operation === 'multiplication') {
    // Off-by-one factor mistakes
    if (a > 0) distractors.add((a - 1) * b);
    if (b > 0) distractors.add(a * (b - 1));
    distractors.add((a + 1) * b);
    distractors.add(a * (b + 1));
  } else if (operation === 'division') {
    // Common division mistakes
    distractors.add(correctAnswer - 1);
    distractors.add(correctAnswer + 1);
    if (correctAnswer > 1) distractors.add(correctAnswer - 2);
    distractors.add(correctAnswer + 2);
  } else if (operation === 'addition') {
    // Near misses
    distractors.add(a + b - 1);
    distractors.add(a + b + 1);
    distractors.add(a * b); // Common mistake: multiply instead
  } else if (operation === 'subtraction') {
    // Near misses and reversed operation
    distractors.add(b - a); // reversed
    if (a - b - 1 >= 0) distractors.add(a - b - 1);
    distractors.add(a - b + 1);
  }
  
  // Add offset-based distractors
  for (const offset of offsets) {
    const distractor = correctAnswer + offset;
    if (distractor >= 0) { // Avoid negative distractors for younger kids
      distractors.add(distractor);
    }
  }
  
  // Remove the correct answer if it was added
  distractors.delete(correctAnswer);
  
  // Convert to array and select 3 distractors
  const distractorArray = Array.from(distractors);
  const selectedDistractors: number[] = [];
  
  while (selectedDistractors.length < 3 && distractorArray.length > 0) {
    const index = randomInt(0, distractorArray.length - 1);
    selectedDistractors.push(distractorArray[index]);
    distractorArray.splice(index, 1);
  }
  
  // If we don't have enough unique distractors, generate more random ones
  while (selectedDistractors.length < 3) {
    const offset = randomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    const distractor = correctAnswer + offset;
    if (distractor >= 0 && distractor !== correctAnswer && !selectedDistractors.includes(distractor)) {
      selectedDistractors.push(distractor);
    }
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

