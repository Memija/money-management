import React, { useCallback, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { useChartAnimation } from '../../../hooks/useChartAnimation'
import type { MerchantBrandInfo } from '../../../utils/category-icons'
import { CurrencyAxisTick } from '../../shared/ChartAxisTicks'
import { RenderWhenVisible } from '../../shared/RenderWhenVisible'
import { TopMerchantsTooltip } from './TopMerchantsTooltip'

import styles from './TopMerchantsChart.module.css'

const AMOUNT_TICK = <CurrencyAxisTick fill="var(--text-dim)" fontSize={11} />
const BAR_RADIUS: [number, number, number, number] = [0, 6, 6, 0]
const TOOLTIP_CURSOR = { fill: 'rgba(255,255,255,0.04)' }
const TOOLTIP_ESCAPE_VIEWBOX = { x: false, y: true }
const TOOLTIP_ANIMATION_MS = 150
const TOOLTIP_Z_INDEX = 9999
const Y_AXIS_WIDTH = { mobile: 85, desktop: 140 }
const CHART_RIGHT_MARGIN = { mobile: 12, desktop: 20 }
/** Max label characters before truncation, and the truncated length. */
const LABEL_LIMITS = {
  mobile: { maxChars: 10, truncateAt: 8, x: -80 },
  desktop: { maxChars: 18, truncateAt: 16, x: -136 },
}
const LABEL_DY = 4

interface HoveredLabel {
  name: string
  y: number
}

interface MerchantYAxisTickProps {
  x?: number
  y?: number
  payload?: { value: string }
  onHoverTick?: (info: HoveredLabel | null) => void
  isMobile?: boolean
}

const MerchantYAxisTick: React.FC<MerchantYAxisTickProps> = ({
  x = 0,
  y = 0,
  payload,
  onHoverTick,
  isMobile = false,
}) => {
  const fullName = payload?.value ?? ''
  const limits = isMobile ? LABEL_LIMITS.mobile : LABEL_LIMITS.desktop
  const isTruncated = fullName.length > limits.maxChars
  const displayName = isTruncated ? `${fullName.substring(0, limits.truncateAt)}…` : fullName
  const canShowHoverLabel = isTruncated && !isMobile

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={limits.x}
        y={0}
        dy={LABEL_DY}
        textAnchor="start"
        className={`${styles.yAxisTick} ${isTruncated ? styles.yAxisTickTruncated : ''}`}
        onMouseEnter={() => {
          if (canShowHoverLabel) {
            onHoverTick?.({ name: fullName, y })
          }
        }}
        onMouseLeave={() => {
          if (canShowHoverLabel) {
            onHoverTick?.(null)
          }
        }}
      >
        {displayName}
        {isTruncated && <title>{fullName}</title>}
      </text>
    </g>
  )
}

interface TopMerchantsChartProps {
  merchants: MerchantEntry[]
  /** Brand info per merchant name (stable reference) */
  brandInfos: Map<string, MerchantBrandInfo>
  totalExpenses: number
  isMobile: boolean
  onMerchantClick?: (merchantName: string) => void
}

/**
 * Horizontal bar chart of top merchants. Memoized and free of locale-bound props
 * (ticks and tooltip localize themselves), so a language switch doesn't re-render or
 * re-animate the bars.
 */
export const TopMerchantsChart: React.FC<TopMerchantsChartProps> = React.memo(
  ({ merchants, brandInfos, totalExpenses, isMobile, onMerchantClick }) => {
    const [hoveredLabel, setHoveredLabel] = useState<HoveredLabel | null>(null)
    const isAnimationActive = useChartAnimation(merchants)

    const margin = useMemo(
      () => ({
        left: 8,
        right: isMobile ? CHART_RIGHT_MARGIN.mobile : CHART_RIGHT_MARGIN.desktop,
        top: 4,
        bottom: 4,
      }),
      [isMobile],
    )
    const yAxisTick = useMemo(
      () => <MerchantYAxisTick onHoverTick={setHoveredLabel} isMobile={isMobile} />,
      [isMobile],
    )
    const tooltipContent = useMemo(
      () => (
        <TopMerchantsTooltip
          totalExpenses={totalExpenses}
          isMobile={isMobile}
          onMerchantClick={onMerchantClick}
        />
      ),
      [totalExpenses, isMobile, onMerchantClick],
    )
    const tooltipWrapperStyle = useMemo(
      () => ({
        zIndex: TOOLTIP_Z_INDEX,
        pointerEvents: isMobile ? ('auto' as const) : ('none' as const),
      }),
      [isMobile],
    )
    const cells = useMemo(
      () =>
        merchants.map((entry) => (
          <Cell key={entry.name} fill={brandInfos.get(entry.name)?.brandColor} />
        )),
      [merchants, brandInfos],
    )

    const handleBarClick = useCallback(
      (entry: unknown) => {
        if (isMobile) {
          return
        }
        const name = (entry as { name?: string } | undefined)?.name
        if (name) {
          onMerchantClick?.(name)
        }
      },
      [isMobile, onMerchantClick],
    )

    const handleMouseLeave = useCallback(() => {
      setHoveredLabel(null)
    }, [])

    return (
      <div className={styles.chartContainer} onMouseLeave={handleMouseLeave}>
        {!isMobile && hoveredLabel && (
          <div
            className={styles.axisTooltip}
            style={{ '--tooltip-top': `${hoveredLabel.y}px` } as React.CSSProperties}
          >
            {hoveredLabel.name}
          </div>
        )}
        <RenderWhenVisible>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={merchants} layout="vertical" margin={margin}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={AMOUNT_TICK} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={isMobile ? Y_AXIS_WIDTH.mobile : Y_AXIS_WIDTH.desktop}
                tick={yAxisTick}
              />
              <Tooltip
                wrapperStyle={tooltipWrapperStyle}
                allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
                animationDuration={TOOLTIP_ANIMATION_MS}
                content={tooltipContent}
                cursor={TOOLTIP_CURSOR}
              />
              <Bar
                dataKey="amount"
                radius={BAR_RADIUS}
                isAnimationActive={isAnimationActive}
                onClick={handleBarClick}
                className={!isMobile && onMerchantClick ? styles.merchantRowClickable : undefined}
              >
                {cells}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </RenderWhenVisible>
      </div>
    )
  },
)

TopMerchantsChart.displayName = 'TopMerchantsChart'
