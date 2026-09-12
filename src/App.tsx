import React, { Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'

import AppHeader from './components/layout/AppHeader'
import { ErrorBoundary } from './components/shared/ErrorBoundary'

const Dashboard = React.lazy(() => import('./components/Dashboard'))
const ImportReview = React.lazy(() => import('./components/ImportReview'))
const CountrySelector = React.lazy(() => import('./components/CountrySelector'))
const InstitutionSelector = React.lazy(() => import('./components/InstitutionSelector'))
const TransactionImporter = React.lazy(() => import('./components/TransactionImporter'))
const Settings = React.lazy(() => import('./components/Settings'))
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

  // Dashboard has its own full layout
  if (currentStep === 'dashboard') {
    return (
      <ErrorBoundary>
        <Suspense fallback={loadingFallback}>
          <AppHeader />
          <Dashboard />
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
          <Suspense fallback={loadingFallback}>
            <AnimatePresence mode="wait">
              {currentStep === 'country' && <CountrySelector key="country" />}
              {currentStep === 'institution' && <InstitutionSelector key="institution" />}
              {currentStep === 'import' && <TransactionImporter key="import" />}
              {currentStep === 'review' && <ImportReview key="review" />}
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  )
}

export default App
