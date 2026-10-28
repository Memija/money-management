import React, { Suspense } from 'react'

import CountrySelector from './components/CountrySelector'
import AppFooter from './components/layout/AppFooter'
import AppHeader from './components/layout/AppHeader'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { useAppStore } from './store/useAppStore'
import { useLanguageStore } from './store/useLanguageStore'

import styles from './App.module.css'

if (typeof window !== 'undefined') {
  ;(window as unknown as { __store: unknown }).__store = useAppStore
}

const loadInstitutionSelector = () => import('./components/InstitutionSelector')
const loadTransactionImporter = () => import('./components/TransactionImporter')
const loadImportReview = () => import('./components/ImportReview')

const LazyDashboard = React.lazy(() => import('./components/Dashboard'))
const Settings = React.lazy(() => import('./components/Settings'))
const InstitutionSelector = React.lazy(loadInstitutionSelector)
const TransactionImporter = React.lazy(loadTransactionImporter)
const ImportReview = React.lazy(loadImportReview)

/** Warms the module cache for all onboarding steps so step transitions don't suspend. */
const prefetchOnboardingSteps = (): void => {
  for (const load of [loadInstitutionSelector, loadTransactionImporter, loadImportReview]) {
    load().catch((error: unknown) => {
      console.warn('Failed to prefetch onboarding step:', error)
    })
  }
}

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

const LoadingFallback: React.FC = () => {
  const loading = useLanguageStore((s) => s.t.loading)
  return <div className={styles['loading-fallback']}>{loading}</div>
}

const OnboardingProgress: React.FC<{ currentStep: string }> = ({ currentStep }) => {
  const t = useLanguageStore((s) => s.t)
  const stepLabels = [t.stepCountry, t.stepInstitution, t.stepImport, t.stepReview]

  return (
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
  )
}

const App: React.FC = () => {
  const currentStep = useAppStore((s) => s.currentStep)

  const [hasHydrated, setHasHydrated] = React.useState(() => {
    return useAppStore.persist?.hasHydrated?.() ?? true
  })

  React.useEffect(() => {
    if (useAppStore.persist?.hasHydrated?.()) {
      setHasHydrated(true)
      return
    }
    const unsub = useAppStore.persist?.onFinishHydration?.(() => {
      setHasHydrated(true)
    })
    return () => {
      unsub?.()
    }
  }, [])

  React.useEffect(() => {
    if (hasHydrated && typeof useAppStore.getState === 'function') {
      useAppStore.getState().autoRecategorizeUneditedTransactions?.()
    }
  }, [hasHydrated])

  // Ensure scroll is reset to top cleanly on each step transition
  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      // Ignore in non-browser or test environments
    }
  }, [currentStep])

  const isDashboardStep = currentStep === 'dashboard'
  React.useEffect(() => {
    if (isDashboardStep) {
      preloadDashboard()
    }
  }, [isDashboardStep])

  React.useEffect(() => {
    if (!hasHydrated) {
      return
    }
    const handleFirstInteraction = (): void => {
      prefetchOnboardingSteps()
      preloadDashboard()
    }
    window.addEventListener('pointerdown', handleFirstInteraction, { once: true, passive: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true, passive: true })
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [hasHydrated])

  // Dashboard has its own full layout
  if (currentStep === 'dashboard') {
    const ActiveDashboard = preloadedDashboardComponent || LazyDashboard
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <div className={styles['app-shell']}>
            <AppHeader />
            <ActiveDashboard />
            <AppFooter />
          </div>
        </Suspense>
      </ErrorBoundary>
    )
  }

  // Settings has its own full layout as well
  if (currentStep === 'settings') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <div className={styles['app-shell']}>
            <AppHeader />
            <Settings />
            <AppFooter />
          </div>
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <div className={styles['app-shell']}>
      <AppHeader />
      <div className={`app-container ${styles['onboarding-layout']}`}>
        {/* Background ambient effects */}
        <div className={`${styles['ambient-glow']} ${styles['ambient-glow-1']}`} />
        <div className={`${styles['ambient-glow']} ${styles['ambient-glow-2']}`} />

        {/* Progress indicator */}
        <OnboardingProgress currentStep={currentStep} />

        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {currentStep === 'country' && <CountrySelector key="country" />}
            {currentStep === 'institution' && <InstitutionSelector key="institution" />}
            {currentStep === 'import' && <TransactionImporter key="import" />}
            {currentStep === 'review' && <ImportReview key="review" />}
          </Suspense>
        </ErrorBoundary>
      </div>
      <AppFooter />
    </div>
  )
}

export default App
