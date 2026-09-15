import { useEffect,useState } from 'react'

/**
 * Custom hook that returns whether the current window width is less than or equal to a given breakpoint.
 * Safe for SSR and handles window resize events cleanly.
 *
 * @param breakpoint - Max width in pixels to be considered mobile (default: 640)
 * @returns boolean indicating if current viewport is within mobile breakpoint
 */
export const useIsMobile = (breakpoint = 640): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= breakpoint
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint])

  return isMobile
}
