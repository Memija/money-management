import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Calendar, CopyCheck, Repeat, Sparkles, Trash2 } from 'lucide-react'

import { useFormatters } from '../../hooks/useFormatters'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'

import styles from './DuplicateRulesSettings.module.css'

export const DuplicateRulesSettings: React.FC = () => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatDate } = useFormatters()
  const duplicateOverrideRules = useAppStore((s) => s.duplicateOverrideRules) || []
  const removeDuplicateOverrideRule = useAppStore((s) => s.removeDuplicateOverrideRule)
  const clearDuplicateOverrideRules = useAppStore((s) => s.clearDuplicateOverrideRules)

  const hasRules = duplicateOverrideRules.length > 0

  return (
    <div className={styles.container} data-testid="duplicate-rules-settings">
      <div className={`glass-card ${styles.card}`}>
        <div className={styles.cardHeader}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.titleRow}>
              <CopyCheck size={20} className={styles.titleIcon} aria-hidden="true" />
              <h3 className={styles.title}>{t.duplicateRulesTitle || 'Duplicate Rules & Overrides'}</h3>
            </div>
            <p className={styles.description}>
              {t.duplicateRulesDesc ||
                'Rules automatically learned from your duplicate unlock decisions. Transactions matching these rules will not be flagged as duplicates on future imports.'}
            </p>
          </div>

          <div className={styles.headerActions}>
            <span className={styles.countBadge} data-testid="duplicate-rules-count">
              {duplicateOverrideRules.length}
            </span>
            {hasRules && (
              <button
                type="button"
                className={styles.clearAllBtn}
                onClick={clearDuplicateOverrideRules}
                title={t.clearAllRules || 'Clear all rules'}
                data-testid="clear-all-duplicate-rules-btn"
              >
                <Trash2 size={13} aria-hidden="true" />
                <span>{t.clearAllRules || 'Clear all'}</span>
              </button>
            )}
          </div>
        </div>

        {!hasRules ? (
          <div className={styles.emptyState} data-testid="duplicate-rules-empty">
            <div className={styles.emptyIconWrapper}>
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <h4 className={styles.emptyTitle}>
              {t.noDuplicateRules || 'No duplicate override rules yet'}
            </h4>
            <p className={styles.emptyDesc}>
              {t.noDuplicateRulesDesc ||
                'When you unlock a duplicate transaction during import and choose to remember it, the rule will appear here.'}
            </p>
          </div>
        ) : (
          <div className={styles.rulesList} data-testid="duplicate-rules-list">
            {duplicateOverrideRules.map((rule) => {
              const ruleTitle = (t.ruleAllowDuplicate || "Allow duplicate: '{desc}'").replace(
                '{desc}',
                rule.descriptionPattern,
              )

              const amountText =
                rule.amount !== undefined
                  ? formatCurrency(rule.amount)
                  : t.anyAmount || 'Any amount'

              const instText =
                rule.institutionName || t.allInstitutions || 'All institutions'

              const appliedText =
                rule.applyCount === 1
                  ? t.ruleAppliedOnce || 'Applied 1 time'
                  : (t.ruleAppliedTimes || 'Applied {count} times').replace(
                      '{count}',
                      String(rule.applyCount || 1),
                    )

              return (
                <motion.div
                  key={rule.id}
                  className={styles.ruleItem}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  data-testid={`duplicate-rule-item-${rule.id}`}
                >
                  <div className={styles.ruleLeft}>
                    <div className={styles.rulePatternRow}>
                      <span className={styles.rulePattern} title={ruleTitle}>
                        {ruleTitle}
                      </span>
                    </div>

                    <div className={styles.badgeRow}>
                      <span
                        className={`${styles.metaPill} ${rule.amount !== undefined ? styles.amountPill : ''}`}
                        data-testid={`rule-amount-${rule.id}`}
                      >
                        {amountText}
                      </span>

                      <span className={styles.metaPill} data-testid={`rule-inst-${rule.id}`}>
                        <Building2 size={11} aria-hidden="true" />
                        {instText}
                      </span>

                      <span
                        className={`${styles.metaPill} ${styles.appliedPill}`}
                        data-testid={`rule-applied-${rule.id}`}
                      >
                        <Repeat size={11} aria-hidden="true" />
                        {appliedText}
                      </span>

                      <span className={styles.metaPill} data-testid={`rule-date-${rule.id}`}>
                        <Calendar size={11} aria-hidden="true" />
                        {formatDate(rule.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.revokeBtn}
                    onClick={() => removeDuplicateOverrideRule(rule.id)}
                    title={t.revokeRule || 'Revoke rule'}
                    aria-label={`${t.revokeRule || 'Revoke rule'}: ${rule.descriptionPattern}`}
                    data-testid={`revoke-duplicate-rule-btn-${rule.id}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
