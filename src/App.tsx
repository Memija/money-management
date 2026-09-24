import React, { Suspense } from 'react'

import AppHeader from './components/layout/AppHeader'
import { ErrorBoundary } from './components/shared/ErrorBoundary'

import CountrySelector from './components/CountrySelector'
import InstitutionSelector from './components/InstitutionSelector'
import TransactionImporter from './components/TransactionImporter'
import ImportReview from './components/ImportReview'

const LazyDashboard = React.lazy(() => import('./components/Dashboard'))
const Settings = React.lazy(() => import('./components/Settings'))

let preloadedDashboardComponent: React.ComponentType | null = null

const preloadDashboard = (): Promise<void> => {
  if (preloadedDashboardComponent) {
    return Promise.resolve()
  }
  return import('./components/Dashboard')
    .then((mod) => {
      preloadedDashboardComponent = mod.default
    })
    .catch(() => {})
}

// Preload dashboard immediately in the background
preloadDashboard()

import { useAppStore } from './store/useAppStore'
import { useLanguageStore } from './store/useLanguageStore'

import styles from './App.module.css'

const App: React.FC = () => {
  const currentStep = useAppStore((s) => s.currentStep)
  const t = useLanguageStore((s) => s.t)

  const loadingFallback = (
    <div className={styles['loading-fallback']}>
      {t.loading}
    </div>
  )

  // Ensure scroll is reset to top cleanly on each step transition
  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      // Ignore in non-browser or test environments
    }
  }, [currentStep])

  // Preload dashboard as soon as app is active
  React.useEffect(() => {
    preloadDashboard()
  }, [])

  // Dashboard has its own full layout
  if (currentStep === 'dashboard') {
    const ActiveDashboard = preloadedDashboardComponent || LazyDashboard
    return (
      <ErrorBoundary>
        <Suspense fallback={loadingFallback}>
          <AppHeader />
          <ActiveDashboard />
        </Suspense>
      </ErrorBoundary>
    )
  }

  // Settings has its own full layout as well
  if (currentStep === 'settings') {
    return (
      <ErrorBoundary>
        <Suspense fallback={loadingFallback}>
          <AppHeader />
          <Settings />
        </Suspense>
      </ErrorBoundary>
    )
  }

  const stepLabels = [t.stepCountry, t.stepInstitution, t.stepImport, t.stepReview]

  return (
    <>
      <AppHeader />
      <div className={`app-container ${styles['onboarding-layout']}`}>
        {/* Background ambient effects */}
        <div className={`${styles['ambient-glow']} ${styles['ambient-glow-1']}`} />
        <div className={`${styles['ambient-glow']} ${styles['ambient-glow-2']}`} />

        {/* Progress indicator */}
        <div className={styles['progress-wrapper']}>
          <div className={styles['progress-steps']}>
            {(['country', 'institution', 'import', 'review'] as const).map((step, idx) => {
              const currentIdx = ['country', 'institution', 'import', 'review'].indexOf(currentStep)
              const isActive = idx === currentIdx
              const isCompleted = idx < currentIdx
              return (
                <React.Fragment key={step}>
                  {idx > 0 && (
                    <div
                      className={`${styles['progress-connector']} ${isCompleted ? styles.completed : ''}`}
                    />
                  )}
                  <div
                    className={`${styles['progress-step']} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                  >
                    <div className={styles['progress-dot']}>{isCompleted ? '✓' : idx + 1}</div>
                    <span className={styles['progress-label']}>{stepLabels[idx]}</span>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>

        <ErrorBoundary>
          {currentStep === 'country' && <CountrySelector key="country" />}
          {currentStep === 'institution' && <InstitutionSelector key="institution" />}
          {currentStep === 'import' && <TransactionImporter key="import" />}
          {currentStep === 'review' && <ImportReview key="review" />}
        </ErrorBoundary>
      </div>
    </>
  )
}

export default App
