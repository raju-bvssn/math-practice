/**
 * Sound effect utilities
 * Handles celebratory sounds for correct answers
 */

import {
  SOUND_ENABLED_DEFAULT,
  SOUND_SUCCESS_NOTES,
  SOUND_INCORRECT_NOTES,
  SOUND_VOLUME,
  SOUND_NOTE_DURATION_MS,
  SOUND_INCORRECT_NOTE_DURATION_MS,
} from '../constants';

/**
 * Checks if audio should be played based on user preferences
 * Can be extended to check localStorage settings for sound preferences
 * 
 * @returns true if sound should be played
 */
function shouldPlaySound(): boolean {
  // Check if user has sound enabled (default: true)
  const soundEnabled = localStorage.getItem('soundEnabled');
  if (soundEnabled === 'false') {
    return false;
  }
  
  // Respect prefers-reduced-motion as it often indicates sensory sensitivities
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return false;
  }
  
  return SOUND_ENABLED_DEFAULT;
}

/**
 * Plays a single musical note using Web Audio API
 * 
 * @param frequency - Frequency in Hz (e.g., 523.25 for C5)
 * @param duration - Duration in milliseconds
 * @param audioContext - Web Audio context
 */
function playNote(frequency: number, duration: number, audioContext: AudioContext): void {
  // Create oscillator (tone generator)
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Configure oscillator
  oscillator.type = 'sine'; // Smooth, pleasant tone
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  // Configure volume envelope (fade in/out for smoother sound)
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(SOUND_VOLUME, audioContext.currentTime + 0.01); // Quick fade in
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000); // Fade out
  
  // Connect nodes: oscillator -> gain -> speakers
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Play the note
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

/**
 * Plays a cheerful success melody using ascending musical notes
 * Creates a pleasant "success" sound using Web Audio API
 * 
 * Features:
 * - Respects user sound preferences
 * - Respects prefers-reduced-motion accessibility setting
 * - Uses ascending musical scale for positive feedback
 * - No external audio files needed
 */
export function playSuccessSound(): void {
  // Skip sound if user preferences indicate it shouldn't play
  if (!shouldPlaySound()) {
    return;
  }
  
  try {
    // Create audio context (Web Audio API)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play ascending notes with slight delay between each
    // This creates a cheerful, celebratory melody
    SOUND_SUCCESS_NOTES.forEach((frequency, index) => {
      setTimeout(() => {
        playNote(frequency, SOUND_NOTE_DURATION_MS, audioContext);
      }, index * 80); // 80ms delay between notes for a quick ascending melody
    });
    
    // Clean up audio context after all notes finish
    setTimeout(() => {
      audioContext.close();
    }, SOUND_SUCCESS_NOTES.length * 80 + SOUND_NOTE_DURATION_MS);
    
  } catch (error) {
    // Fail silently if Web Audio API is not supported
    // This ensures the app still works on older browsers
    console.warn('Web Audio API not supported:', error);
  }
}

/**
 * Plays a gentle notification sound for incorrect answers
 * Uses descending tones to indicate an incorrect response
 * Intentionally subtle and non-punitive to maintain positive learning environment
 * 
 * Features:
 * - Respects user sound preferences
 * - Respects prefers-reduced-motion accessibility setting
 * - Uses gentle descending tones (not harsh or negative)
 * - Shorter and softer than success sound
 * - Educational principle: mistakes are learning opportunities, not failures
 */
export function playIncorrectSound(): void {
  // Skip sound if user preferences indicate it shouldn't play
  if (!shouldPlaySound()) {
    return;
  }
  
  try {
    // Create audio context (Web Audio API)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play gentle descending notes with slight delay between each
    // This creates a neutral, non-punitive notification
    SOUND_INCORRECT_NOTES.forEach((frequency, index) => {
      setTimeout(() => {
        playNote(frequency, SOUND_INCORRECT_NOTE_DURATION_MS, audioContext);
      }, index * 100); // 100ms delay between notes for a gentle descending tone
    });
    
    // Clean up audio context after all notes finish
    setTimeout(() => {
      audioContext.close();
    }, SOUND_INCORRECT_NOTES.length * 100 + SOUND_INCORRECT_NOTE_DURATION_MS);
    
  } catch (error) {
    // Fail silently if Web Audio API is not supported
    console.warn('Web Audio API not supported:', error);
  }
}

/**
 * Toggles sound on/off and persists the preference
 * 
 * @param enabled - Whether sound should be enabled
 */
export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem('soundEnabled', String(enabled));
}

/**
 * Gets the current sound enabled state
 * 
 * @returns true if sound is enabled
 */
export function isSoundEnabled(): boolean {
  const soundEnabled = localStorage.getItem('soundEnabled');
  return soundEnabled === null ? SOUND_ENABLED_DEFAULT : soundEnabled === 'true';
}

