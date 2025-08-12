export function lerpDisplacementStrength(
  current: number,
  target: number,
  frameDuration: number,
  transitionDurationMs: number
) {
  if (current === target) {
    return current;
  }
  const lerpFactor = frameDuration / transitionDurationMs;
  return current + (target - current) * lerpFactor;
}
