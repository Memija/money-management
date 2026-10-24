import React from 'react'

import { APP_CONFIG } from '../../../config/app-config'

import styles from './AppFooter.module.css'

export interface AppFooterProps {
  className?: string
}

export const AppFooter: React.FC<AppFooterProps> = ({ className }) => {
  return (
    <footer
      className={`${styles['app-footer']}${className ? ` ${className}` : ''}`}
      role="contentinfo"
      data-testid="app-footer"
    >
      <div className={styles['app-footer-inner']}>
        <span
          className={styles['version-badge']}
          data-testid="app-footer-version"
          aria-label={`Version ${APP_CONFIG.version}`}
        >
          v{APP_CONFIG.version}
        </span>
      </div>
    </footer>
  )
}

export default AppFooter
