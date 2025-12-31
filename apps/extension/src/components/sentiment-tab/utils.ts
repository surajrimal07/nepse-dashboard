export function strengthToPercentage(strength: number): number {
  const clampedStrength = Math.max(-1, Math.min(1, strength))
  return Math.round((clampedStrength + 1) * 50 * 100) / 100
}
