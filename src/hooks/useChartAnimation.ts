import { useEffect, useState } from 'react'

/** Recharts' default bar animation duration in milliseconds. */
export const DEFAULT_CHART_ANIMATION_MS = 400

/** Extra time allowed for an animation to settle before it is switched off. */
const ANIMATION_SETTLE_BUFFER_MS = 150

/**
 * Returns `true` while a chart should animate: on first mount and for a short window
 * after `trigger` (usually the chart data) changes. At all other times it returns `false`.
 *
 * Recharts restarts its enter animation whenever a series component re-renders with a
 * new props object (e.g. hover highlight, language switch). Each animation frame
 * re-renders every bar/point, which is extremely expensive for large datasets. Gating
 * `isAnimationActive` with this hook keeps the intended entrance/data-change animation
 * while making all other re-renders a single cheap pass.
 * @param trigger - Value whose identity change should replay the animation
 * @param animationMs - Duration of the chart animation being gated
 * @returns Whether `isAnimationActive` should currently be enabled
 */
export const useChartAnimation = (
  trigger: unknown,
  animationMs: number = DEFAULT_CHART_ANIMATION_MS,
): boolean => {
  const [isAnimating, setIsAnimating] = useState(true)
  const [lastTrigger, setLastTrigger] = useState(trigger)

  if (trigger !== lastTrigger) {
    setLastTrigger(trigger)
    setIsAnimating(true)
  }

  useEffect(() => {
    if (!isAnimating) {
      return
    }
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, animationMs + ANIMATION_SETTLE_BUFFER_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [isAnimating, lastTrigger, animationMs])

  return isAnimating
}
