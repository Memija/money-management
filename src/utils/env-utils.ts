/**
 * Determines whether the application is running in a local or development environment.
 *
 * Checks:
 * 1. Vite's development flag (`import.meta.env.DEV`) - true during `npm run dev`
 * 2. Standard localhost and loopback hostnames (localhost, 127.0.0.1, [::1], *.localhost, *.local)
 */
export function isLocalEnvironment(): boolean {
  try {
    if (typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)) {
      return true
    }
  } catch {
    // Ignore environment resolution errors in non-standard runtimes
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname.toLowerCase()
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '[::1]' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local')
    )
  }

  return false
}
