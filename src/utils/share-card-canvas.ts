/**
 * Social Share Card Canvas Renderer
 * Generates an ultra-crisp 1200x675 PNG financial snapshot card
 * using the HTML5 Canvas API (zero external dependencies).
 */

export type ShareCardTheme = 'emerald' | 'cyan' | 'violet' | 'sunset'

export interface ShareCardCategory {
  name: string
  amount: number
  percent: number
  color?: string
}

export interface ShareCardData {
  periodLabel: string
  currencySymbol: string
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  topCategories: ShareCardCategory[]
  maskAmounts: boolean
  theme?: ShareCardTheme
}

interface ThemeConfig {
  primary: string
  secondary: string
  glow: string
  accentGradient: [string, string]
}

const THEMES: Record<ShareCardTheme, ThemeConfig> = {
  emerald: {
    primary: '#10b981',
    secondary: '#059669',
    glow: 'rgba(16, 185, 129, 0.18)',
    accentGradient: ['#34d399', '#059669'],
  },
  cyan: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.18)',
    accentGradient: ['#38bdf8', '#0284c7'],
  },
  violet: {
    primary: '#a855f7',
    secondary: '#7c3aed',
    glow: 'rgba(168, 85, 247, 0.18)',
    accentGradient: ['#c084fc', '#7c3aed'],
  },
  sunset: {
    primary: '#f59e0b',
    secondary: '#d97706',
    glow: 'rgba(245, 158, 11, 0.18)',
    accentGradient: ['#fbbf24', '#ea580c'],
  },
}

/**
 * Draws a rounded rectangle path on canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const r = Math.min(radius, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/**
 * Formats currency amount or returns masked placeholder
 */
function formatAmount(
  amount: number,
  currencySymbol: string,
  masked: boolean,
): string {
  if (masked) {
    return `${currencySymbol}••••`
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencySymbol === '$' ? 'USD' : currencySymbol === '£' ? 'GBP' : 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Renders the social share card into a 1200x675 canvas
 */
export function renderShareCardToCanvas(
  data: ShareCardData,
  canvas?: HTMLCanvasElement,
): HTMLCanvasElement {
  const targetCanvas = canvas || document.createElement('canvas')
  const width = 1200
  const height = 675

  targetCanvas.width = width
  targetCanvas.height = height

  const ctx = targetCanvas.getContext('2d')
  if (!ctx) return targetCanvas

  const themeKey = data.theme || 'emerald'
  const theme = THEMES[themeKey] || THEMES.emerald

  // 1. Sleek Background Canvas
  ctx.fillStyle = '#090d16'
  ctx.fillRect(0, 0, width, height)

  // Ambient radial glows
  const glow1 = ctx.createRadialGradient(250, 150, 20, 250, 150, 480)
  glow1.addColorStop(0, theme.glow)
  glow1.addColorStop(1, 'rgba(9, 13, 22, 0)')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, width, height)

  const glow2 = ctx.createRadialGradient(1000, 500, 30, 1000, 500, 420)
  glow2.addColorStop(0, 'rgba(56, 189, 248, 0.08)')
  glow2.addColorStop(1, 'rgba(9, 13, 22, 0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, width, height)

  // Subtle grid lines for high-tech aesthetic
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)'
  ctx.lineWidth = 1
  for (let x = 60; x < width; x += 60) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 60; y < height; y += 60) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Card Outer Container Border with subtle luminous outline
  drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 24)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 2. Header Area: Brand + Badge + Period
  const headerY = 96

  // Saldio Brand Dot & Logo
  const logoX = 80
  ctx.fillStyle = theme.primary
  ctx.beginPath()
  ctx.arc(logoX + 10, headerY - 6, 9, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = '700 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('Saldio', logoX + 30, headerY)

  // Badge: "100% PRIVATE & LOCAL"
  const badgeX = logoX + 130
  const badgeY = headerY - 24
  drawRoundedRect(ctx, badgeX, badgeY, 180, 30, 15)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('100% PRIVATE & LOCAL', badgeX + 16, badgeY + 19)

  // Period label on the right
  ctx.textAlign = 'right'
  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(data.periodLabel, width - 80, headerY)
  ctx.textAlign = 'left'

  // Header separator line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.beginPath()
  ctx.moveTo(80, 130)
  ctx.lineTo(width - 80, 130)
  ctx.stroke()

  // 3. Main Hero Metrics: Left Side (Savings Rate & Balances)
  const leftX = 80
  const leftW = 480
  const mainY = 165

  // Hero Card: Savings Rate
  drawRoundedRect(ctx, leftX, mainY, leftW, 200, 18)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
  ctx.stroke()

  // Savings Rate Label & Icon
  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('SAVINGS RATE', leftX + 28, mainY + 44)

  // Savings Rate Big Number
  const rateValue = `${Math.round(data.savingsRate)}%`
  const rateGradient = ctx.createLinearGradient(leftX + 28, mainY + 60, leftX + 28, mainY + 130)
  rateGradient.addColorStop(0, theme.accentGradient[0])
  rateGradient.addColorStop(1, theme.accentGradient[1])
  ctx.fillStyle = rateGradient
  ctx.font = '800 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(rateValue, leftX + 28, mainY + 124)

  // Savings status subtitle
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  const savingsStatus =
    data.savingsRate >= 40
      ? '🌟 Outstanding financial discipline'
      : data.savingsRate >= 20
        ? '📈 Solid savings momentum'
        : data.savingsRate > 0
          ? '🌱 Positive net savings'
          : '⚠️ Budget deficit this period'
  ctx.fillText(savingsStatus, leftX + 28, mainY + 168)

  // Cash Flow Stats: Income vs Expenses Rows
  const flowY = 385
  const flowH = 150
  drawRoundedRect(ctx, leftX, flowY, leftW, flowH, 18)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
  ctx.stroke()

  // Income stat
  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('Total Income', leftX + 28, flowY + 36)
  ctx.fillStyle = '#10b981'
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(formatAmount(data.totalIncome, data.currencySymbol, data.maskAmounts), leftX + 28, flowY + 64)

  // Expense stat
  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('Total Expenses', leftX + 190, flowY + 36)
  ctx.fillStyle = '#f43f5e'
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(formatAmount(data.totalExpenses, data.currencySymbol, data.maskAmounts), leftX + 190, flowY + 64)

  // Net Result stat
  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(data.netSavings >= 0 ? 'Net Saved' : 'Net Deficit', leftX + 345, flowY + 36)
  ctx.fillStyle = data.netSavings >= 0 ? theme.primary : '#f43f5e'
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  const netPrefix = data.netSavings > 0 ? '+' : ''
  const netFormatted = data.maskAmounts
    ? `${netPrefix}${data.currencySymbol}••••`
    : `${netPrefix}${formatAmount(data.netSavings, data.currencySymbol, false)}`
  ctx.fillText(netFormatted, leftX + 345, flowY + 64)

  // Dual Progress Bar (Income vs Expense Ratio)
  const barY = flowY + 98
  const barW = leftW - 56
  const barH = 16
  drawRoundedRect(ctx, leftX + 28, barY, barW, barH, 8)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.fill()

  const expenseRatio = data.totalIncome > 0
    ? Math.min(1, Math.max(0, data.totalExpenses / data.totalIncome))
    : 1
  const expenseBarW = Math.round(barW * expenseRatio)

  if (expenseBarW > 0) {
    drawRoundedRect(ctx, leftX + 28, barY, expenseBarW, barH, 8)
    ctx.fillStyle = '#f43f5e'
    ctx.fill()
  }

  // 4. Right Side: Top Spending Categories Breakdown
  const rightX = 600
  const rightW = width - 80 - rightX
  const rightH = 370
  drawRoundedRect(ctx, rightX, mainY, rightW, rightH, 18)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = '700 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('Top Spending Categories', rightX + 28, mainY + 44)

  const cats = data.topCategories.slice(0, 4)
  const catStartY = mainY + 70
  const catRowH = 68

  cats.forEach((cat, idx) => {
    const cy = catStartY + idx * catRowH
    const itemColor = cat.color || theme.primary

    // Category Rank & Name
    ctx.fillStyle = itemColor
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(`#${idx + 1}`, rightX + 28, cy + 20)

    ctx.fillStyle = '#f1f5f9'
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(cat.name, rightX + 54, cy + 20)

    // Right side: Percentage and Amount
    ctx.textAlign = 'right'
    ctx.fillStyle = '#94a3b8'
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const catAmountStr = data.maskAmounts
      ? `${cat.percent}%`
      : `${formatAmount(cat.amount, data.currencySymbol, false)} (${cat.percent}%)`
    ctx.fillText(catAmountStr, rightX + rightW - 28, cy + 20)
    ctx.textAlign = 'left'

    // Percentage Progress Track
    const catBarY = cy + 32
    const catBarW = rightW - 56
    drawRoundedRect(ctx, rightX + 28, catBarY, catBarW, 10, 5)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.fill()

    const fillW = Math.max(8, Math.round((catBarW * Math.min(100, cat.percent)) / 100))
    drawRoundedRect(ctx, rightX + 28, catBarY, fillW, 10, 5)
    ctx.fillStyle = itemColor
    ctx.fill()
  })

  // 5. Watermark Footer
  const footerY = height - 60
  ctx.fillStyle = '#64748b'
  ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('saldio.app  •  100% Private & Local Finance  •  No Tracking', 80, footerY)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#64748b'
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('Self-Hosted & Private', width - 80, footerY)
  ctx.textAlign = 'left'

  return targetCanvas
}

/**
 * Converts canvas to PNG Blob
 */
export function getShareCardBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create PNG blob from canvas'))
      }
    }, 'image/png')
  })
}

/**
 * Triggers a direct download of the snapshot image
 */
export function downloadShareCard(canvas: HTMLCanvasElement, filename = 'saldio-snapshot.png'): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/**
 * Copies the share card image directly to the system clipboard
 */
export async function copyShareCardImage(canvas: HTMLCanvasElement): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copying is not supported in this browser')
  }

  const blob = await getShareCardBlob(canvas)
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob }),
  ])
  return true
}

/**
 * Generates an aesthetic text summary for social media posts (X, Reddit, LinkedIn)
 */
export function generateShareSummaryText(data: ShareCardData): string {
  const rateSymbol = data.savingsRate >= 0 ? '📈' : '📉'
  const netEmoji = data.netSavings >= 0 ? '💰' : '⚠️'
  const lines: string[] = [
    `📊 My Financial Snapshot • ${data.periodLabel}`,
    `${rateSymbol} Savings Rate: ${Math.round(data.savingsRate)}%`,
  ]

  if (!data.maskAmounts) {
    lines.push(
      `💵 Income: ${formatAmount(data.totalIncome, data.currencySymbol, false)}`,
      `💳 Expenses: ${formatAmount(data.totalExpenses, data.currencySymbol, false)}`,
      `${netEmoji} Net: ${data.netSavings > 0 ? '+' : ''}${formatAmount(data.netSavings, data.currencySymbol, false)}`,
    )
  }

  if (data.topCategories.length > 0) {
    const topCats = data.topCategories
      .slice(0, 3)
      .map((c) => `${c.name} (${c.percent}%)`)
      .join(', ')
    lines.push(`🏆 Top Expenses: ${topCats}`)
  }

  lines.push('', '🔒 100% Private, Local-First Finance with Saldio', '👉 https://saldio.app')

  return lines.join('\n')
}
