import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { APP_CONFIG } from '../../../config/app-config'
import AppFooter from './AppFooter'

describe('AppFooter', () => {
  it('renders with role="contentinfo" and correct testid', () => {
    render(<AppFooter />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveAttribute('data-testid', 'app-footer')
  })

  it('displays the configured application version with a "v" prefix', () => {
    render(<AppFooter />)
    const versionBadge = screen.getByTestId('app-footer-version')
    expect(versionBadge).toBeInTheDocument()
    expect(versionBadge).toHaveTextContent(`v${APP_CONFIG.version}`)
    expect(versionBadge).toHaveAttribute('aria-label', `Version ${APP_CONFIG.version}`)
  })

  it('applies custom className if provided', () => {
    render(<AppFooter className="custom-footer-class" />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('custom-footer-class')
  })
})
