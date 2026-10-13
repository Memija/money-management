import { useEffect, useState } from 'react'

/** Long enough for the shared Modal's spring exit animation to finish. */
export const DEFAULT_UNMOUNT_DELAY_MS = 600

/**
 * Keeps a component mounted while `isOpen` is true and for `delayMs` after it turns false.
 *
 * Use it to mount heavy modals only when needed, without cutting off their exit
 * animation. While closed, the modal (and all its hooks) is fully unmounted, so it
 * costs nothing when its parent re-renders (e.g. on a language switch).
 * @param isOpen - Whether the component is currently open
 * @param delayMs - How long to stay mounted after closing
 * @returns Whether the component should be rendered
 */
export const useDeferredUnmount = (
  isOpen: boolean,
  delayMs: number = DEFAULT_UNMOUNT_DELAY_MS,
): boolean => {
  const [shouldRender, setShouldRender] = useState(isOpen)

  if (isOpen && !shouldRender) {
    setShouldRender(true)
  }

  useEffect(() => {
    if (isOpen || !shouldRender) {
      return
    }
    const timer = setTimeout(() => {
      setShouldRender(false)
    }, delayMs)
    return () => {
      clearTimeout(timer)
    }
  }, [isOpen, shouldRender, delayMs])

  return isOpen || shouldRender
}
