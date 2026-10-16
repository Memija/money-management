import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { bs } from '../../../i18n/locales/bs'
import { de } from '../../../i18n/locales/de'
import { en } from '../../../i18n/locales/en'
import { TopMerchantsTooltip } from './TopMerchantsTooltip'

// Mutable language state for testing different locales
let currentLocale = 'en'
let currentT = en

vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: currentLocale,
      t: currentT,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      customCategories: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

describe('TopMerchantsTooltip', () => {
  const sampleMerchant: MerchantEntry = {
    name: 'Rewe',
    amount: 154.2,
    count: 3,
    category: 'Groceries',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    currentLocale = 'en'
    currentT = en
  })

  it('renders null when not active or without payload', () => {
    const { container: container1 } = render(
      <TopMerchantsTooltip active={false} payload={[{ value: 154.2, payload: sampleMerchant }]} />,
    )
    expect(container1.firstChild).toBeNull()

    const { container: container2 } = render(<TopMerchantsTooltip active={true} payload={[]} />)
    expect(container2.firstChild).toBeNull()
  })

  it('renders merchant details, total, count, and average in English', () => {
    render(
      <TopMerchantsTooltip
        active={true}
        payload={[{ value: 154.2, payload: sampleMerchant }]}
        totalExpenses={1000}
      />,
    )

    expect(screen.getByText('Rewe')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('Average per transaction')).toBeInTheDocument()
    expect(screen.getByText('Of total expenses')).toBeInTheDocument()
    expect(screen.getByText('15.4%')).toBeInTheDocument()
  })

  it('renders non-English (German) localization cleanly with proper labels and share formatting', () => {
    currentLocale = 'de'
    currentT = de

    render(
      <TopMerchantsTooltip
        active={true}
        payload={[{ value: 154.2, payload: sampleMerchant }]}
        totalExpenses={1000}
      />,
    )

    expect(screen.getByText('Rewe')).toBeInTheDocument()
    expect(screen.getByText('Lebensmittel')).toBeInTheDocument()
    expect(screen.getByText('Gesamt')).toBeInTheDocument()
    expect(screen.getByText('Anzahl Transaktionen')).toBeInTheDocument()
    expect(screen.getByText('Durchschnitt pro Transaktion')).toBeInTheDocument()
    expect(screen.getByText('Der Gesamtausgaben')).toBeInTheDocument()
    expect(screen.getByText('15.4%')).toBeInTheDocument()
  })

  it('renders non-English (Bosnian) localization cleanly with proper labels and share formatting', () => {
    currentLocale = 'bs'
    currentT = bs

    render(
      <TopMerchantsTooltip
        active={true}
        payload={[{ value: 154.2, payload: sampleMerchant }]}
        totalExpenses={1000}
      />,
    )

    expect(screen.getByText('Rewe')).toBeInTheDocument()
    expect(screen.getByText('Namirnice')).toBeInTheDocument()
    expect(screen.getByText('Ukupno')).toBeInTheDocument()
    expect(screen.getByText('Broj transakcija')).toBeInTheDocument()
    expect(screen.getByText('Prosječno po transakciji')).toBeInTheDocument()
    expect(screen.getByText('Od ukupnih troškova')).toBeInTheDocument()
    expect(screen.getByText('15.4%')).toBeInTheDocument()
  })

  it('renders per-transaction label when count is 1', () => {
    const singleChargeMerchant: MerchantEntry = {
      name: 'Netflix',
      amount: 17.99,
      count: 1,
      category: 'Entertainment',
    }

    render(
      <TopMerchantsTooltip
        active={true}
        payload={[{ value: 17.99, payload: singleChargeMerchant }]}
        totalExpenses={1000}
      />,
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Per transaction')).toBeInTheDocument()
  })

  it('renders clean average label on mobile instead of raw suffix abbreviations', () => {
    currentLocale = 'bs'
    currentT = bs

    render(
      <TopMerchantsTooltip
        active={true}
        payload={[{ value: 154.2, payload: sampleMerchant }]}
        totalExpenses={1000}
        isMobile={true}
      />,
    )

    // Should NOT display raw suffix abbreviation "/ tr." as a row label
    expect(screen.queryByText('/ tr.')).not.toBeInTheDocument()
    // Should display full or readable avg label (e.g. Prosječna transakcija or Prosječno po transakciji)
    expect(screen.getByText('Prosječna transakcija')).toBeInTheDocument()
  })

  it('handles mobile action click if provided', () => {
    const onMerchantClick = vi.fn()
    render(
      <TopMerchantsTooltip
        active={true}
        payload={[{ value: 154.2, payload: sampleMerchant }]}
        totalExpenses={1000}
        isMobile={true}
        onMerchantClick={onMerchantClick}
      />,
    )

    const btn = screen.getByRole('button', { name: /all transactions/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onMerchantClick).toHaveBeenCalledWith('Rewe')
  })
})
