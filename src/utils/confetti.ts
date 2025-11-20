/**
 * Confetti animation utilities
 * Handles celebration effects for correct answers
 */

import confetti from 'canvas-confetti';
import {
  CONFETTI_PARTICLE_COUNT,
  CONFETTI_Z_INDEX,
  CONFETTI_ORIGIN_Y,
  CONFETTI_BURSTS,
} from '../constants';

/**
 * Checks if user has enabled reduced motion preference
 * Respects accessibility settings
 * @returns true if user prefers reduced motion
 */
function shouldReduceMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Triggers a multi-burst confetti animation
 * Creates a celebration effect with multiple confetti bursts at different angles
 * 
 * Features:
 * - Respects prefers-reduced-motion accessibility setting
 * - Multiple bursts with varying speeds and spreads for dynamic effect
 * - High z-index ensures confetti appears above all content
 */
export function triggerCelebrationConfetti(): void {
  // Skip animation if user prefers reduced motion
  if (shouldReduceMotion()) {
    return;
  }

  // Default configuration for all bursts
  const defaultConfig = {
    origin: { y: CONFETTI_ORIGIN_Y },
    zIndex: CONFETTI_Z_INDEX,
  };

  /**
   * Fires a single confetti burst with specific configuration
   * @param particleRatio - Percentage of total particles for this burst (0-1)
   * @param opts - Additional confetti options (spread, velocity, etc.)
   */
  function fireBurst(particleRatio: number, opts: confetti.Options): void {
    confetti({
      ...defaultConfig,
      ...opts,
      particleCount: Math.floor(CONFETTI_PARTICLE_COUNT * particleRatio),
    });
  }

  // Fire multiple bursts with different configurations for variety
  CONFETTI_BURSTS.forEach(({ ratio, ...opts }) => {
    fireBurst(ratio, opts);
  });
}

