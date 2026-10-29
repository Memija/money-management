import { Component, type ErrorInfo, type ReactNode } from 'react'

import styles from './ErrorBoundary.module.css'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              className="primary-button"
              onClick={() => {
                const isChunkError =
                  this.state.error?.message?.includes('dynamically imported module') ||
                  this.state.error?.name === 'ChunkLoadError'
                if (
                  isChunkError &&
                  typeof window !== 'undefined' &&
                  typeof window.location?.reload === 'function'
                ) {
                  window.location.reload()
                  return
                }
                this.setState({ hasError: false, error: undefined })
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
