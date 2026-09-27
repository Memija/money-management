import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppStore } from '../../../store/useAppStore'
import { RestoreBackupPrompt } from './RestoreBackupPrompt'

describe('RestoreBackupPrompt', () => {
  beforeEach(() => {
    useAppStore.setState({
      importedAccounts: [],
      currentStep: 'country',
    })
  })

  it('renders restore button and divider by default', () => {
    render(<RestoreBackupPrompt idPrefix="test" />)

    expect(screen.getByTestId('test-restore-button')).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()
    expect(screen.getByTestId('test-restore-file-input')).toBeInTheDocument()
  })

  it('hides divider when showDivider is false', () => {
    render(<RestoreBackupPrompt idPrefix="test" showDivider={false} />)

    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    expect(screen.getByTestId('test-restore-button')).toBeInTheDocument()
  })

  it('uses custom buttonLabel if provided', () => {
    render(<RestoreBackupPrompt idPrefix="test" buttonLabel="Custom Restore Prompt" />)

    expect(screen.getByText('Custom Restore Prompt')).toBeInTheDocument()
  })

  it('triggers hidden file input when button is clicked', () => {
    render(<RestoreBackupPrompt idPrefix="test" />)

    const fileInput = screen.getByTestId('test-restore-file-input')
    const clickSpy = vi.spyOn(fileInput, 'click')

    const button = screen.getByTestId('test-restore-button')
    fireEvent.click(button)

    expect(clickSpy).toHaveBeenCalledTimes(1)
  })
})
