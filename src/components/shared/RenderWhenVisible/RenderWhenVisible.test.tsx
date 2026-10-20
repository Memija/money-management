import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RenderWhenVisible } from './RenderWhenVisible'

type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void

const FAR_BELOW_VIEWPORT_PX = 10_000

let observerCallback: ObserverCallback | null = null

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observerCallback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

const setIntersecting = (isIntersecting: boolean) => {
  act(() => {
    observerCallback?.([{ isIntersecting }])
  })
}

const Value = ({ value }: { value: string }) => <span data-testid="value">{value}</span>

describe('RenderWhenVisible', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    observerCallback = null
  })

  it('should render children immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(
      <RenderWhenVisible>
        <Value value="a" />
      </RenderWhenVisible>,
    )
    expect(screen.getByTestId('value')).toHaveTextContent('a')
  })

  describe('with IntersectionObserver', () => {
    beforeEach(() => {
      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    })

    it('should defer mounting until the content approaches the viewport', () => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        top: FAR_BELOW_VIEWPORT_PX,
        bottom: FAR_BELOW_VIEWPORT_PX + 100,
      } as DOMRect)
      render(
        <RenderWhenVisible>
          <Value value="a" />
        </RenderWhenVisible>,
      )
      expect(screen.queryByTestId('value')).not.toBeInTheDocument()

      setIntersecting(true)
      expect(screen.getByTestId('value')).toHaveTextContent('a')
    })

    it('should freeze updates while off-screen and catch up when visible again', () => {
      const { rerender } = render(
        <RenderWhenVisible>
          <Value value="a" />
        </RenderWhenVisible>,
      )
      expect(screen.getByTestId('value')).toHaveTextContent('a')

      setIntersecting(false)
      rerender(
        <RenderWhenVisible>
          <Value value="b" />
        </RenderWhenVisible>,
      )
      expect(screen.getByTestId('value')).toHaveTextContent('a')

      setIntersecting(true)
      expect(screen.getByTestId('value')).toHaveTextContent('b')
    })

    it('should freeze updates while paused', () => {
      const { rerender } = render(
        <RenderWhenVisible isPaused>
          <Value value="a" />
        </RenderWhenVisible>,
      )
      rerender(
        <RenderWhenVisible isPaused>
          <Value value="b" />
        </RenderWhenVisible>,
      )
      expect(screen.getByTestId('value')).toHaveTextContent('a')

      rerender(
        <RenderWhenVisible>
          <Value value="b" />
        </RenderWhenVisible>,
      )
      expect(screen.getByTestId('value')).toHaveTextContent('b')
    })
  })
})
