import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal Content</div>
}

describe('ErrorBoundary', () => {
  const originalError = console.error

  beforeAll(() => {
    // Suppress console.error so our test output stays clean when we intentionally throw
    console.error = vi.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal Content')).toBeInTheDocument()
  })

  it('renders default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders custom fallback when provided and a child throws', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error View</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Error View')).toBeInTheDocument()
    // Default UI should not be there
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('resets error state when "Try again" button is clicked', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Rerender so it won't throw on the next render (simulating the underlying issue being fixed)
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    // Click the try again button
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    await user.click(tryAgainButton)

    // Should now render the children again
    expect(screen.getByText('Normal Content')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
})
