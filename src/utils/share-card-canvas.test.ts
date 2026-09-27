import { describe, expect, it, vi } from 'vitest'

import {
  downloadShareCard,
  generateShareSummaryText,
  renderShareCardToCanvas,
  type ShareCardData,
} from './share-card-canvas'

describe('share-card-canvas', () => {
  const sampleData: ShareCardData = {
    periodLabel: 'September 2026',
    currencySymbol: '€',
    totalIncome: 5000,
    totalExpenses: 3200,
    netSavings: 1800,
    savingsRate: 36,
    topCategories: [
      { name: 'Food & Dining', amount: 800, percent: 25, color: '#f59e0b' },
      { name: 'Housing', amount: 1200, percent: 37.5, color: '#3b82f6' },
    ],
    maskAmounts: true,
    theme: 'emerald',
  }

  it('renders onto canvas with 1200x675 dimensions', () => {
    const canvas = document.createElement('canvas')
    const result = renderShareCardToCanvas(sampleData, canvas)

    expect(result.width).toBe(1200)
    expect(result.height).toBe(675)
  })

  it('generates text summary with masked amounts by default', () => {
    const summary = generateShareSummaryText(sampleData)
    expect(summary).toContain('My Financial Snapshot • September 2026')
    expect(summary).toContain('Savings Rate: 36%')
    expect(summary).toContain('Food & Dining (25%)')
    expect(summary).toContain('https://saldio.app')
    // Income and expense amounts should not appear when masked
    expect(summary).not.toContain('5000')
    expect(summary).not.toContain('3200')
  })

  it('generates text summary with unmasked amounts when maskAmounts is false', () => {
    const unmaskedData: ShareCardData = {
      ...sampleData,
      maskAmounts: false,
    }
    const summary = generateShareSummaryText(unmaskedData)
    expect(summary).toContain('Income: €5,000')
    expect(summary).toContain('Expenses: €3,200')
    expect(summary).toContain('Net: +€1,800')
  })

  it('triggers download with specified filename', () => {
    const canvas = document.createElement('canvas')
    const clickSpy = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      set download(val: string) {
        expect(val).toBe('test-card.png')
      },
      set href(_val: string) {},
      click: clickSpy,
    } as unknown as HTMLElement)

    downloadShareCard(canvas, 'test-card.png')
    expect(clickSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
  })
})
