import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DuplicateRulesSettings } from './DuplicateRulesSettings'

const mockRemoveDuplicateOverrideRule = vi.fn()
const mockClearDuplicateOverrideRules = vi.fn()

let mockDuplicateRules = [
  {
    id: 'drule_1',
    descriptionPattern: 'Gym Membership',
    amount: -45.0,
    institutionId: 'chase',
    institutionName: 'Chase',
    createdAt: '2026-09-18T10:00:00.000Z',
    applyCount: 3,
  },
]

vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'en',
      t: {
        duplicateRulesTitle: 'Duplicate Rules & Overrides',
        duplicateRulesDesc: 'Rules automatically learned from duplicate decisions.',
        noDuplicateRules: 'No duplicate override rules yet',
        noDuplicateRulesDesc: 'When you unlock a duplicate transaction, it will appear here.',
        ruleAllowDuplicate: "Allow duplicate: '{desc}'",
        ruleAppliedTimes: 'Applied {count} times',
        ruleAppliedOnce: 'Applied 1 time',
        anyAmount: 'Any amount',
        allInstitutions: 'All institutions',
        revokeRule: 'Revoke rule',
        clearAllRules: 'Clear all rules',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      duplicateOverrideRules: mockDuplicateRules,
      removeDuplicateOverrideRule: mockRemoveDuplicateOverrideRule,
      clearDuplicateOverrideRules: mockClearDuplicateOverrideRules,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('../../hooks/useFormatters', () => ({
  useFormatters: () => ({
    formatCurrency: (n: number) => `€${Math.abs(n).toFixed(2)}`,
    formatDate: (d: string) => d.slice(0, 10),
  }),
}))

describe('DuplicateRulesSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDuplicateRules = [
      {
        id: 'drule_1',
        descriptionPattern: 'Gym Membership',
        amount: -45.0,
        institutionId: 'chase',
        institutionName: 'Chase',
        createdAt: '2026-09-18T10:00:00.000Z',
        applyCount: 3,
      },
    ]
  })

  it('renders existing rules with description, amount, institution, and applied count', () => {
    render(<DuplicateRulesSettings />)

    expect(screen.getByText("Allow duplicate: 'Gym Membership'")).toBeInTheDocument()
    expect(screen.getByTestId('rule-amount-drule_1')).toHaveTextContent('€45.00')
    expect(screen.getByTestId('rule-inst-drule_1')).toHaveTextContent('Chase')
    expect(screen.getByTestId('rule-applied-drule_1')).toHaveTextContent('Applied 3 times')
    expect(screen.getByTestId('duplicate-rules-count')).toHaveTextContent('1')
  })

  it('calls removeDuplicateOverrideRule when clicking revoke button', () => {
    render(<DuplicateRulesSettings />)

    const revokeBtn = screen.getByTestId('revoke-duplicate-rule-btn-drule_1')
    fireEvent.click(revokeBtn)

    expect(mockRemoveDuplicateOverrideRule).toHaveBeenCalledWith('drule_1')
  })

  it('calls clearDuplicateOverrideRules when clicking Clear all button', () => {
    render(<DuplicateRulesSettings />)

    const clearBtn = screen.getByTestId('clear-all-duplicate-rules-btn')
    fireEvent.click(clearBtn)

    expect(mockClearDuplicateOverrideRules).toHaveBeenCalled()
  })

  it('displays empty state when there are no duplicate override rules', () => {
    mockDuplicateRules = []
    render(<DuplicateRulesSettings />)

    expect(screen.getByText('No duplicate override rules yet')).toBeInTheDocument()
    expect(screen.queryByTestId('clear-all-duplicate-rules-btn')).not.toBeInTheDocument()
  })
})
