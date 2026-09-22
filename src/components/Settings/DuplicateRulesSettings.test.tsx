import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DuplicateOverrideRule } from '../../types/transaction'
import { DuplicateRulesSettings } from './DuplicateRulesSettings'

const mockRemoveDuplicateOverrideRule = vi.fn()
const mockClearDuplicateOverrideRules = vi.fn()

let mockDuplicateRules: DuplicateOverrideRule[] = [
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

let mockImportedAccounts: Array<{
  institutionId: string
  transactions: Array<{ id: string; importedByRuleId?: string; description: string; amount: number }>
}> = []

vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'en',
      t: {
        duplicateRulesTitle: 'Duplicate Rules and Overrides',
        duplicateRulesDesc: 'Rules automatically learned from duplicate decisions.',
        noDuplicateRules: 'No duplicate override rules yet',
        noDuplicateRulesDesc: 'When you unlock a duplicate transaction, it will appear here.',
        ruleAllowDuplicate: "Allow duplicate: '{desc}'",
        ruleAllowDuplicateLabel: 'Allow duplicate',
        ruleDuplicatedAndModifiedLabel: 'Duplicated and modified',
        ruleAppliedTimes: 'Applied {count} times',
        ruleAppliedOnce: 'Applied 1 time',
        ruleAppliedOnceOn: 'Applied 1 time • {date}',
        ruleAppliedTimesLast: 'Applied {count} times • Last: {date}',
        clearAllRulesConfirmDesc: 'Are you sure you want to remove all duplicate override rules?',
        anyAmount: 'Any amount',
        allInstitutions: 'All institutions',
        revokeRule: 'Revoke rule',
        clearAllRules: 'Clear all rules',
        revokeRuleConfirmTitle: 'Revoke Duplicate Rule',
        deleteRuleTransactionsOption: 'Also delete {count} transaction(s) imported by this rule',
        deleteDuplicateBoth: 'Delete rule and imported data',
        deleteDuplicateBothDesc: 'Revoke the rule and permanently delete {count} transaction(s) imported by it.',
        deleteDuplicateRuleOnly: 'Delete rule only',
        deleteDuplicateRuleOnlyDesc: 'Revoke the rule, but keep all {count} previously imported transaction(s) in your accounts.',
        deleteDuplicateDataOnly: 'Delete imported data only',
        deleteDuplicateDataOnlyDesc: 'Permanently delete {count} transaction(s) imported by this rule, but keep the rule active for future imports.',
        deleteDuplicateBothBtn: 'Delete Rule and Data',
        deleteDuplicateRuleOnlyBtn: 'Delete Rule Only',
        deleteDuplicateDataOnlyBtn: 'Delete Imported Data Only',
        clearAllDuplicateBothDesc: 'Delete all rules and permanently remove {count} transaction(s) imported by them.',
        clearAllDuplicateRuleOnlyDesc: 'Delete all rules, but keep all {count} imported transaction(s) in your accounts.',
        clearAllDuplicateDataOnlyDesc: 'Delete all {count} transaction(s) imported by rules, but keep all rules active.',
        duplicateTransactionsDetectedTitle: 'Duplicate transactions detected',
        duplicateTransactionsDetectedDesc:
          'Found {count} duplicate transaction(s) in your accounts. Resetting will remove duplicates and recalculate your Dashboard balance.',
        resetDuplicateCalculations: 'Reset Calculations and Remove Duplicates',
        duplicatesResetSuccess:
          'Calculations reset successfully. {count} duplicate transaction(s) removed.',
        cancel: 'Cancel',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('../../store/useAppStore', () => ({
  matchesDuplicateOverrideRule: vi.fn(),
  useAppStore: vi.fn((selector) => {
    const state = {
      duplicateOverrideRules: mockDuplicateRules,
      importedAccounts: mockImportedAccounts,
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
    mockImportedAccounts = [
      {
        institutionId: 'chase',
        transactions: [
          { id: 'tx-1', importedByRuleId: 'drule_1', description: 'Gym Membership', amount: -45.0 },
          { id: 'tx-2', importedByRuleId: 'drule_1', description: 'Gym Membership', amount: -45.0 },
        ],
      },
    ]
  })

  it('renders existing rules with description, amount, institution, and applied count', () => {
    render(<DuplicateRulesSettings />)

    expect(screen.getByText('Allow duplicate')).toBeInTheDocument()
    expect(screen.getByText('Gym Membership')).toBeInTheDocument()
    expect(screen.getByTestId('rule-amount-drule_1')).toHaveTextContent('€45.00')
    expect(screen.getByTestId('rule-inst-drule_1')).toHaveTextContent('Chase')
    expect(screen.getByTestId('rule-applied-drule_1')).toHaveTextContent('Applied 3 times • Last: 2026-09-18')
    expect(screen.getByTestId('duplicate-rules-count')).toHaveTextContent('1')
  })

  it('opens confirmation modal and calls removeDuplicateOverrideRule with "both" option by default', () => {
    render(<DuplicateRulesSettings />)

    const revokeBtn = screen.getByTestId('revoke-duplicate-rule-btn-drule_1')
    fireEvent.click(revokeBtn)

    // Modal opens with 3 options
    expect(screen.getByText('Revoke Duplicate Rule')).toBeInTheDocument()
    expect(screen.getByTestId('delete-mode-both-radio')).toBeChecked()
    expect(screen.getByText('Revoke the rule and permanently delete 2 transaction(s) imported by it.')).toBeInTheDocument()

    // Verify rule preview in modal is organized in the same manner as normal display:
    expect(screen.getByTestId('modal-rule-preview-drule_1')).toBeInTheDocument()
    expect(screen.getByTestId('modal-rule-inst-drule_1')).toHaveTextContent('Chase')
    expect(screen.getByTestId('modal-rule-action-badge-drule_1')).toHaveTextContent('Allow duplicate')
    expect(screen.getByTestId('modal-rule-pattern-drule_1')).toHaveTextContent('Gym Membership')
    expect(screen.getByTestId('modal-rule-amount-drule_1')).toHaveTextContent('€45.00')
    expect(screen.getByTestId('modal-rule-applied-drule_1')).toHaveTextContent('Applied 3 times • Last: 2026-09-18')

    // Confirm revoke
    const confirmBtn = screen.getByTestId('confirm-revoke-rule-btn')
    fireEvent.click(confirmBtn)

    expect(mockRemoveDuplicateOverrideRule).toHaveBeenCalledWith('drule_1', 'both')
  })

  it('allows selecting "rule_only" option before confirming revocation', () => {
    render(<DuplicateRulesSettings />)

    const revokeBtn = screen.getByTestId('revoke-duplicate-rule-btn-drule_1')
    fireEvent.click(revokeBtn)

    const ruleOnlyRadio = screen.getByTestId('delete-mode-rule-only-radio')
    fireEvent.click(ruleOnlyRadio)

    const confirmBtn = screen.getByTestId('confirm-revoke-rule-btn')
    fireEvent.click(confirmBtn)

    expect(mockRemoveDuplicateOverrideRule).toHaveBeenCalledWith('drule_1', 'rule_only')
  })

  it('allows selecting "data_only" option before confirming revocation', () => {
    render(<DuplicateRulesSettings />)

    const revokeBtn = screen.getByTestId('revoke-duplicate-rule-btn-drule_1')
    fireEvent.click(revokeBtn)

    const dataOnlyRadio = screen.getByTestId('delete-mode-data-only-radio')
    fireEvent.click(dataOnlyRadio)

    const confirmBtn = screen.getByTestId('confirm-revoke-rule-btn')
    fireEvent.click(confirmBtn)

    expect(mockRemoveDuplicateOverrideRule).toHaveBeenCalledWith('drule_1', 'data_only')
  })

  it('opens confirmation modal when clicking Clear all button and handles 3 deletion modes', () => {
    render(<DuplicateRulesSettings />)

    const clearBtn = screen.getByTestId('clear-all-duplicate-rules-btn')
    fireEvent.click(clearBtn)

    expect(screen.getByTestId('confirm-clear-all-rules-btn')).toBeInTheDocument()
    expect(screen.getByTestId('clear-all-mode-both-radio')).toBeChecked()

    // Select data_only for clearing
    fireEvent.click(screen.getByTestId('clear-all-mode-data-only-radio'))

    fireEvent.click(screen.getByTestId('confirm-clear-all-rules-btn'))
    expect(mockClearDuplicateOverrideRules).toHaveBeenCalledWith('data_only')
  })

  it('displays empty state when there are no duplicate override rules', () => {
    mockDuplicateRules = []
    mockImportedAccounts = []
    render(<DuplicateRulesSettings />)

    expect(screen.getByText('No duplicate override rules yet')).toBeInTheDocument()
    expect(screen.queryByTestId('clear-all-duplicate-rules-btn')).not.toBeInTheDocument()
  })

  it('renders exact changes made and apply count when rule has modifications', () => {
    mockDuplicateRules = [
      {
        id: 'drule_mod_1',
        descriptionPattern: 'ANEL O. BILJANA MEMIC GENODEF1S01 KREDITRATE',
        amount: -502.58,
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        createdAt: '2026-09-20T10:00:00.000Z',
        lastAppliedAt: '2026-09-20T12:00:00.000Z',
        applyCount: 57,
        modifications: {
          amount: 502.58,
          description: 'ANEL O. BILJANA MEMIC GENODEF1S01 KREDITRATE ADJUSTED',
          category: 'Loans',
          date: '2026-09-20',
        },
      },
    ]

    render(<DuplicateRulesSettings />)

    // Pill should say "Duplicated and modified" instead of "Allow duplicate"
    expect(screen.getByTestId('rule-action-badge-drule_mod_1')).toHaveTextContent('Duplicated and modified')
    expect(screen.queryByText('Allow duplicate')).not.toBeInTheDocument()

    // Bank logo and name first on its own row
    expect(screen.getByTestId('rule-inst-drule_mod_1')).toHaveTextContent('Commerzbank')

    // Original transaction values shown
    expect(screen.getByTestId('rule-pattern-drule_mod_1')).toHaveTextContent('ANEL O. BILJANA MEMIC GENODEF1S01 KREDITRATE')
    expect(screen.getByTestId('rule-amount-drule_mod_1')).toHaveTextContent('€502.58')
    expect(screen.getByTestId('rule-applied-drule_mod_1')).toHaveTextContent('Applied 57 times • Last: 2026-09-20')

    // Exact changes applied card
    expect(screen.getByTestId('rule-modifications-drule_mod_1')).toBeInTheDocument()
    expect(screen.getByText('Changes applied')).toBeInTheDocument()

    // Amount modification row: shows old amount and new amount
    const amountMod = screen.getByTestId('rule-mod-amount-drule_mod_1')
    expect(amountMod).toBeInTheDocument()
    expect(amountMod).toHaveTextContent('Amount:')
    expect(amountMod).toHaveTextContent('→')
    expect(amountMod).toHaveTextContent('€502.58')

    // Description modification row
    const descMod = screen.getByTestId('rule-mod-desc-drule_mod_1')
    expect(descMod).toBeInTheDocument()
    expect(descMod).toHaveTextContent('ANEL O. BILJANA MEMIC GENODEF1S01 KREDITRATE ADJUSTED')

    // Category and Date modification rows
    expect(screen.getByTestId('rule-mod-cat-drule_mod_1')).toHaveTextContent('Loans')
    expect(screen.getByTestId('rule-mod-date-drule_mod_1')).toHaveTextContent('2026-09-20')

    // Open delete confirmation modal for modified rule
    const revokeBtn = screen.getByTestId('revoke-duplicate-rule-btn-drule_mod_1')
    fireEvent.click(revokeBtn)

    // Modal organizes data in the same manner as normal display
    expect(screen.getByTestId('modal-rule-preview-drule_mod_1')).toBeInTheDocument()
    expect(screen.getByTestId('modal-rule-inst-drule_mod_1')).toHaveTextContent('Commerzbank')
    expect(screen.getByTestId('modal-rule-action-badge-drule_mod_1')).toHaveTextContent('Duplicated and modified')
    expect(screen.getByTestId('modal-rule-pattern-drule_mod_1')).toHaveTextContent('ANEL O. BILJANA MEMIC GENODEF1S01 KREDITRATE')
    expect(screen.getByTestId('modal-rule-amount-drule_mod_1')).toHaveTextContent('€502.58')
    expect(screen.getByTestId('modal-rule-modifications-drule_mod_1')).toBeInTheDocument()
  })

  it('does not render duplicate-cleanup-banner and keeps settings page clean', () => {
    render(<DuplicateRulesSettings />)

    expect(screen.queryByTestId('duplicate-cleanup-banner')).not.toBeInTheDocument()
    expect(screen.queryByText('Duplicate transactions detected')).not.toBeInTheDocument()
  })
})
