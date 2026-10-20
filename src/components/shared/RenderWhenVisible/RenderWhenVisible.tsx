import React, { useCallback, useEffect, useState } from 'react'

import styles from './RenderWhenVisible.module.css'

/** Distance (px) outside the viewport at which content is mounted/resumed ahead of time. */
const DEFAULT_PRELOAD_MARGIN_PX = 400

interface FreezeUpdatesProps {
  isFrozen: boolean
  children: React.ReactNode
}

/**
 * Skips re-rendering its subtree while `isFrozen` is true and catches up with the latest
 * children as soon as it unfreezes. Purely a performance boundary: state and effects inside
 * the subtree stay alive.
 */
const FreezeUpdates = React.memo(
  ({ children }: FreezeUpdatesProps) => <>{children}</>,
  (_prev, next) => next.isFrozen,
)
FreezeUpdates.displayName = 'FreezeUpdates'

interface VisibilityState {
  isVisible: boolean
  hasMounted: boolean
}

const canObserve = (): boolean => typeof IntersectionObserver !== 'undefined'

/**
 * Checks whether an element is within the viewport extended by a margin.
 * @param el - Element to measure
 * @param marginPx - Extra distance above and below the viewport
 */
const isNearViewport = (el: HTMLElement, marginPx: number): boolean => {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight + marginPx && rect.bottom > -marginPx
}

export interface RenderWhenVisibleProps {
  children: React.ReactNode
  /** Additionally freezes updates (e.g. while a fullscreen copy is shown on top) */
  isPaused?: boolean
  /** Distance (px) outside the viewport at which content is mounted/resumed early */
  preloadMarginPx?: number
  /** Extra class for the wrapper; by default it fills its (sized) parent */
  className?: string
}

/**
 * Defers expensive content (e.g. charts) until it approaches the viewport, then keeps it
 * mounted but frozen whenever it scrolls away again. Period/account changes therefore only
 * re-render what is on screen; off-screen content catches up once when it comes back.
 * Without IntersectionObserver support it renders normally.
 */
export const RenderWhenVisible = ({
  children,
  isPaused = false,
  preloadMarginPx = DEFAULT_PRELOAD_MARGIN_PX,
  className,
}: RenderWhenVisibleProps) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [visibility, setVisibility] = useState<VisibilityState>(() => {
    const isVisible = !canObserve()
    return { isVisible, hasMounted: isVisible }
  })

  // Runs at commit (before paint): content already on screen renders without a blank frame
  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node)
      if (node && canObserve() && isNearViewport(node, preloadMarginPx)) {
        setVisibility((prev) =>
          prev.isVisible && prev.hasMounted ? prev : { isVisible: true, hasMounted: true },
        )
      }
    },
    [preloadMarginPx],
  )

  useEffect(() => {
    if (!element || !canObserve()) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return
        }
        const isVisible = entry.isIntersecting
        setVisibility((prev) =>
          prev.isVisible === isVisible && (prev.hasMounted || !isVisible)
            ? prev
            : { isVisible, hasMounted: prev.hasMounted || isVisible },
        )
      },
      { rootMargin: `${preloadMarginPx}px 0px` },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, preloadMarginPx])

  const isFrozen = isPaused || !visibility.isVisible

  return (
    <div ref={containerRef} className={`${styles.container} ${className ?? ''}`}>
      {visibility.hasMounted && <FreezeUpdates isFrozen={isFrozen}>{children}</FreezeUpdates>}
    </div>
  )
}
