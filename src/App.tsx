import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AppHeader from './components/AppHeader';
import CountrySelector from './components/CountrySelector';
import InstitutionSelector from './components/InstitutionSelector';
import TransactionImporter from './components/TransactionImporter';
import ImportReview from './components/ImportReview';
import Dashboard from './components/Dashboard';
import { useAppStore } from './store/useAppStore';
import { useLanguageStore } from './store/useLanguageStore';
import styles from './App.module.css';

const App: React.FC = () => {
  const currentStep = useAppStore((s) => s.currentStep);
  const t = useLanguageStore((s) => s.t);

  // Dashboard has its own full layout
  if (currentStep === 'dashboard') {
    return (
      <>
        <AppHeader />
        <Dashboard />
      </>
    );
  }

  const stepLabels = [t.stepCountry, t.stepInstitution, t.stepImport, t.stepReview];

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
              const currentIdx = ['country', 'institution', 'import', 'review'].indexOf(currentStep);
              const isActive = idx === currentIdx;
              const isCompleted = idx < currentIdx;
              return (
                <React.Fragment key={step}>
                  {idx > 0 && (
                    <div className={`${styles['progress-connector']} ${isCompleted ? styles.completed : ''}`} />
                  )}
                  <div className={`${styles['progress-step']} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                    <div className={styles['progress-dot']}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className={styles['progress-label']}>{stepLabels[idx]}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {currentStep === 'country' && <CountrySelector key="country" />}
          {currentStep === 'institution' && <InstitutionSelector key="institution" />}
          {currentStep === 'import' && <TransactionImporter key="import" />}
          {currentStep === 'review' && <ImportReview key="review" />}
        </AnimatePresence>
      </div>
    </>
  );
};

export default App;
