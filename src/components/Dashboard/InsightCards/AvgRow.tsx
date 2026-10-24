import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

import styles from './AvgRow.module.css'

export interface AvgRowProps {
  label: string
  value: string
  barWidth: number
  color: 'emerald' | 'rose' | 'blue' | 'amber'
  customColor?: string
  delay: number
  icon: React.ReactNode
  onClick?: () => void
}

export const AvgRow: React.FC<AvgRowProps> = ({
  label,
  value,
  barWidth,
  color,
  customColor,
  delay,
  icon,
  onClick,
}) => (
  <div
    className={`${styles['avg-row']} ${onClick ? styles['avg-row-clickable'] : ''}`}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick()
            }
          }
        : undefined
    }
    aria-label={onClick ? `View ${label} details` : undefined}
  >
    <div
      className={`${styles['avg-icon']} ${styles[`avg-icon-${color}`]}`}
      style={customColor ? { backgroundColor: `${customColor}18`, color: customColor } : undefined}
    >
      {icon}
    </div>
    <div className={styles['avg-row-content']}>
      <div className={styles['avg-row-header']}>
        <span className={styles['avg-row-label']} title={label}>
          {label}
        </span>
        <span
          className={`${styles['avg-row-value']} ${styles[`avg-value-${color}`]} privacy-blur`}
          style={customColor ? { color: customColor } : undefined}
        >
          {value}
        </span>
      </div>
      <div className={styles['avg-bar-track']}>
        <motion.div
          className={`${styles['avg-bar-fill']} ${styles[`avg-bar-${color}`]}`}
          style={customColor ? { backgroundColor: customColor } : undefined}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
    {onClick && <ArrowUpRight size={12} className={styles['avg-row-chevron']} />}
  </div>
)
