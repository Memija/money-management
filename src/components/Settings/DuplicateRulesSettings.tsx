import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Building2, CopyCheck, Pencil, Repeat, Sparkles, Trash2 } from 'lucide-react'

import { findInstitution } from '../../data/institutions'
import { useFormatters } from '../../hooks/useFormatters'
import {
  matchesDuplicateOverrideRule,
  useAppStore,
} from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import type { DuplicateDeleteMode, DuplicateOverrideRule } from '../../types'
import { Modal } from '../shared/Modal'

import styles from './DuplicateRulesSettings.module.css'

export const DuplicateRulesSettings: React.FC = () => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatDate } = useFormatters()
  const rawRules = useAppStore((s) => s.duplicateOverrideRules)
  const rawAccounts = useAppStore((s) => s.importedAccounts)
  const duplicateOverrideRules = useMemo(() => rawRules ?? [], [rawRules])
  const importedAccounts = useMemo(() => rawAccounts ?? [], [rawAccounts])
  const removeDuplicateOverrideRule = useAppStore((s) => s.removeDuplicateOverrideRule)
  const clearDuplicateOverrideRules = useAppStore((s) => s.clearDuplicateOverrideRules)

  const [ruleToRevoke, setRuleToRevoke] = useState<{
    rule: DuplicateOverrideRule
    count: number
  } | null>(null)
  const [singleDeleteMode, setSingleDeleteMode] = useState<DuplicateDeleteMode>('both')

  const [isClearingAll, setIsClearingAll] = useState(false)
  const [clearAllDeleteMode, setClearAllDeleteMode] = useState<DuplicateDeleteMode>('both')

  const hasRules = duplicateOverrideRules.length > 0

  const getRuleImportedTransactionCount = (rule: DuplicateOverrideRule): number => {
    let count = 0
    for (const acc of importedAccounts) {
      for (const tx of acc.transactions) {
        if (tx.importedByRuleId === rule.id) {
          count++
        } else if (!tx.importedByRuleId && matchesDuplicateOverrideRule(rule, tx, acc.institutionId)) {
          count++
        }
      }
    }
    return count
  }

  const getTotalRulesImportedCount = (): number => {
    let count = 0
    for (const acc of importedAccounts) {
      for (const tx of acc.transactions) {
        if (tx.importedByRuleId) {
          count++
        } else if (
          duplicateOverrideRules.some((r) => matchesDuplicateOverrideRule(r, tx, acc.institutionId))
        ) {
          count++
        }
      }
    }
    return count
  }

  const handleRequestRevoke = (rule: DuplicateOverrideRule) => {
    const count = getRuleImportedTransactionCount(rule)
    setRuleToRevoke({ rule, count })
    setSingleDeleteMode('both')
  }

  const handleConfirmRevoke = () => {
    if (!ruleToRevoke) return
    removeDuplicateOverrideRule(ruleToRevoke.rule.id, singleDeleteMode)
    setRuleToRevoke(null)
  }

  const handleRequestClearAll = () => {
    setIsClearingAll(true)
    setClearAllDeleteMode('both')
  }

  const handleConfirmClearAll = () => {
    clearDuplicateOverrideRules(clearAllDeleteMode)
    setIsClearingAll(false)
  }

  return (
    <div className={styles.container} data-testid="duplicate-rules-settings">
      <div className={`glass-card ${styles.card}`}>
        <div className={styles.cardHeader}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.titleRow}>
              <CopyCheck size={20} className={styles.titleIcon} aria-hidden="true" />
              <h3 className={styles.title}>{t.duplicateRulesTitle || 'Duplicate Rules and Overrides'}</h3>
              <span className={styles.countBadge} data-testid="duplicate-rules-count">
                {duplicateOverrideRules.length}
              </span>
            </div>
            <p className={styles.description}>
              {t.duplicateRulesDesc ||
                'Rules automatically learned from your duplicate unlock decisions. Transactions matching these rules will not be flagged as duplicates on future imports.'}
            </p>
          </div>

          <div className={styles.headerActions}>
            {hasRules && (
              <button
                type="button"
                className={styles.clearAllBtn}
                onClick={handleRequestClearAll}
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
              const inst = findInstitution(rule.institutionId || rule.institutionName)
              const amountText =
                rule.amount !== undefined
                  ? formatCurrency(rule.amount)
                  : t.anyAmount || 'Any amount'

              const instText =
                rule.institutionName || inst?.name || t.allInstitutions || 'All institutions'

              const executionDate = formatDate(
                rule.lastAppliedAt || rule.createdAt || new Date().toISOString(),
              )

              const appliedWithDateText =
                rule.applyCount === 1
                  ? (t.ruleAppliedOnceOn || 'Applied 1 time • {date}').replace('{date}', executionDate)
                  : (t.ruleAppliedTimesLast || 'Applied {count} times • Last: {date}')
                    .replace('{count}', String(rule.applyCount || 1))
                    .replace('{date}', executionDate)

              const hasModifications = Boolean(
                rule.modifications &&
                  (rule.modifications.amount !== undefined ||
                    (rule.modifications.description !== undefined &&
                      rule.modifications.description !== rule.descriptionPattern) ||
                    rule.modifications.category !== undefined ||
                    rule.modifications.date !== undefined),
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
                  <div className={styles.ruleTopRow}>
                    <span className={styles.ruleActionBadge}>
                      {t.ruleAllowDuplicateLabel || 'Allow duplicate'}
                    </span>
                    <button
                      type="button"
                      className={styles.revokeBtn}
                      onClick={() => handleRequestRevoke(rule)}
                      title={t.revokeRule || 'Revoke rule'}
                      aria-label={`${t.revokeRule || 'Revoke rule'}: ${rule.descriptionPattern}`}
                      data-testid={`revoke-duplicate-rule-btn-${rule.id}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>

                  <div
                    className={styles.rulePattern}
                    title={rule.descriptionPattern}
                    data-testid={`rule-pattern-${rule.id}`}
                  >
                    {rule.descriptionPattern}
                  </div>

                  <div className={styles.badgeRow}>
                    <span
                      className={`${styles.metaPill} ${rule.amount !== undefined ? styles.amountPill : ''}`}
                      data-testid={`rule-amount-${rule.id}`}
                    >
                      {amountText}
                    </span>

                    <span className={styles.metaPill} data-testid={`rule-inst-${rule.id}`}>
                      {inst?.logo ? (
                        <img src={inst.logo} alt="" className={styles.pillBankLogo} />
                      ) : (
                        <Building2 size={11} aria-hidden="true" />
                      )}
                      <span>{instText}</span>
                    </span>

                    <span
                      className={`${styles.metaPill} ${styles.appliedPill}`}
                      data-testid={`rule-applied-${rule.id}`}
                    >
                      <Repeat size={11} aria-hidden="true" />
                      <span>{appliedWithDateText}</span>
                    </span>
                  </div>

                  {hasModifications && rule.modifications && (
                    <div className={styles.modificationsCard} data-testid={`rule-modifications-${rule.id}`}>
                      <div className={styles.modificationsHeader}>
                        <Pencil size={12} className={styles.modIcon} aria-hidden="true" />
                        <span className={styles.modificationsTitle}>
                          {t.ruleModificationsTitle || 'Changes applied'}
                        </span>
                      </div>
                      <div className={styles.modificationsList}>
                        {rule.modifications.amount !== undefined && (
                          <div className={styles.modRow} data-testid={`rule-mod-amount-${rule.id}`}>
                            <span className={styles.modFieldLabel}>{t.amount || 'Amount'}:</span>
                            <span className={styles.modOldVal}>
                              {rule.amount !== undefined ? formatCurrency(rule.amount) : '—'}
                            </span>
                            <span className={styles.modArrow} aria-hidden="true">→</span>
                            <span className={styles.modNewVal}>
                              {formatCurrency(rule.modifications.amount)}
                            </span>
                          </div>
                        )}
                        {rule.modifications.description !== undefined &&
                          rule.modifications.description !== rule.descriptionPattern && (
                            <div className={styles.modRow} data-testid={`rule-mod-desc-${rule.id}`}>
                              <span className={styles.modFieldLabel}>{t.description || 'Description'}:</span>
                              <span className={styles.modOldVal}>{rule.descriptionPattern}</span>
                              <span className={styles.modArrow} aria-hidden="true">→</span>
                              <span className={styles.modNewVal}>{rule.modifications.description}</span>
                            </div>
                          )}
                        {rule.modifications.category !== undefined && (
                          <div className={styles.modRow} data-testid={`rule-mod-cat-${rule.id}`}>
                            <span className={styles.modFieldLabel}>{t.category || 'Category'}:</span>
                            <span className={styles.modNewVal}>{rule.modifications.category}</span>
                          </div>
                        )}
                        {rule.modifications.date !== undefined && (
                          <div className={styles.modRow} data-testid={`rule-mod-date-${rule.id}`}>
                            <span className={styles.modFieldLabel}>{t.date || 'Date'}:</span>
                            <span className={styles.modNewVal}>{formatDate(rule.modifications.date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Revoke Single Rule Modal */}
      <Modal
        isOpen={Boolean(ruleToRevoke)}
        onClose={() => setRuleToRevoke(null)}
        title={t.revokeRuleConfirmTitle || 'Revoke Duplicate Rule'}
        maxWidth="480px"
        footer={
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`secondary-button ${styles.modalCancelBtn}`}
              onClick={() => setRuleToRevoke(null)}
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              type="button"
              className={styles.modalConfirmBtn}
              onClick={handleConfirmRevoke}
              data-testid="confirm-revoke-rule-btn"
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>
                {singleDeleteMode === 'both'
                  ? t.deleteDuplicateBothBtn || 'Delete Rule and Data'
                  : singleDeleteMode === 'data_only'
                    ? t.deleteDuplicateDataOnlyBtn || 'Delete Imported Data Only'
                    : t.deleteDuplicateRuleOnlyBtn || 'Delete Rule Only'}
              </span>
            </button>
          </div>
        }
      >
        {ruleToRevoke && (() => {
          const revokeInst = findInstitution(
            ruleToRevoke.rule.institutionId || ruleToRevoke.rule.institutionName,
          )
          const revokeAmountText =
            ruleToRevoke.rule.amount !== undefined
              ? formatCurrency(ruleToRevoke.rule.amount)
              : t.anyAmount || 'Any amount'
          const revokeInstText =
            ruleToRevoke.rule.institutionName ||
            revokeInst?.name ||
            t.allInstitutions ||
            'All institutions'

          return (
            <div className={styles.modalBody}>
              <div className={styles.modalInfoBox}>
                <AlertTriangle size={20} className={styles.modalWarningIcon} aria-hidden="true" />
                <div className={styles.modalInfoText}>
                  <p className={styles.modalRuleTitle}>
                    {ruleToRevoke.rule.descriptionPattern}
                  </p>
                  <div className={styles.modalRuleMetaRow}>
                    <span className={styles.modalAmount}>{revokeAmountText}</span>
                    <span className={styles.modalDotSeparator}>•</span>
                    <span className={styles.modalBankWithLogo}>
                      {revokeInst?.logo ? (
                        <img src={revokeInst.logo} alt="" className={styles.modalBankLogo} />
                      ) : (
                        <Building2 size={13} aria-hidden="true" />
                      )}
                      <span>{revokeInstText}</span>
                    </span>
                  </div>
                </div>
              </div>

              {ruleToRevoke.count > 0 ? (
                <div
                  className={styles.optionsList}
                  role="radiogroup"
                  aria-label={t.deleteDuplicateBoth || 'Deletion options'}
                >
                  <label
                    className={`${styles.optionCard} ${singleDeleteMode === 'both' ? styles.optionCardActive : ''}`}
                    data-testid="delete-mode-both-label"
                  >
                    <div className={styles.radioWrapper}>
                      <input
                        type="radio"
                        name="single-delete-mode"
                        value="both"
                        checked={singleDeleteMode === 'both'}
                        onChange={() => setSingleDeleteMode('both')}
                        className={styles.radioInput}
                        data-testid="delete-mode-both-radio"
                      />
                    </div>
                    <div className={styles.optionContent}>
                      <span className={styles.optionTitle}>{t.deleteDuplicateBoth || 'Delete rule and imported data'}</span>
                      <span className={styles.optionDesc}>
                        {(t.deleteDuplicateBothDesc || 'Revoke the rule and permanently delete {count} transaction(s) imported by it.').replace(
                          '{count}',
                          String(ruleToRevoke.count),
                        )}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`${styles.optionCard} ${singleDeleteMode === 'rule_only' ? styles.optionCardActive : ''}`}
                    data-testid="delete-mode-rule-only-label"
                  >
                    <div className={styles.radioWrapper}>
                      <input
                        type="radio"
                        name="single-delete-mode"
                        value="rule_only"
                        checked={singleDeleteMode === 'rule_only'}
                        onChange={() => setSingleDeleteMode('rule_only')}
                        className={styles.radioInput}
                        data-testid="delete-mode-rule-only-radio"
                      />
                    </div>
                    <div className={styles.optionContent}>
                      <span className={styles.optionTitle}>{t.deleteDuplicateRuleOnly || 'Delete rule only'}</span>
                      <span className={styles.optionDesc}>
                        {(t.deleteDuplicateRuleOnlyDesc || 'Revoke the rule, but keep all {count} previously imported transaction(s) in your accounts.').replace(
                          '{count}',
                          String(ruleToRevoke.count),
                        )}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`${styles.optionCard} ${singleDeleteMode === 'data_only' ? styles.optionCardActive : ''}`}
                    data-testid="delete-mode-data-only-label"
                  >
                    <div className={styles.radioWrapper}>
                      <input
                        type="radio"
                        name="single-delete-mode"
                        value="data_only"
                        checked={singleDeleteMode === 'data_only'}
                        onChange={() => setSingleDeleteMode('data_only')}
                        className={styles.radioInput}
                        data-testid="delete-mode-data-only-radio"
                      />
                    </div>
                    <div className={styles.optionContent}>
                      <span className={styles.optionTitle}>{t.deleteDuplicateDataOnly || 'Delete imported data only'}</span>
                      <span className={styles.optionDesc}>
                        {(t.deleteDuplicateDataOnlyDesc || 'Permanently delete {count} transaction(s) imported by this rule, but keep the rule active for future imports.').replace(
                          '{count}',
                          String(ruleToRevoke.count),
                        )}
                      </span>
                    </div>
                  </label>
                </div>
              ) : (
                <p className={styles.modalNoTxNote}>
                  {t.noTransactionsInPeriod ||
                    'No transactions currently in your accounts were imported by this rule.'}
                </p>
              )}
            </div>
          )
        })()}
      </Modal>

      {/* Clear All Rules Modal */}
      <Modal
        isOpen={isClearingAll}
        onClose={() => setIsClearingAll(false)}
        title={t.clearAllRules || 'Clear all rules'}
        maxWidth="480px"
        footer={
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`secondary-button ${styles.modalCancelBtn}`}
              onClick={() => setIsClearingAll(false)}
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              type="button"
              className={styles.modalConfirmBtn}
              onClick={handleConfirmClearAll}
              data-testid="confirm-clear-all-rules-btn"
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>
                {clearAllDeleteMode === 'both'
                  ? t.deleteDuplicateBothBtn || 'Delete Rules and Data'
                  : clearAllDeleteMode === 'data_only'
                    ? t.deleteDuplicateDataOnlyBtn || 'Delete Imported Data Only'
                    : t.deleteDuplicateRuleOnlyBtn || 'Delete Rules Only'}
              </span>
            </button>
          </div>
        }
      >
        <div className={styles.modalBody}>
          <p className={styles.modalRuleSub}>
            {t.clearAllRulesConfirmDesc ||
              'Are you sure you want to remove all duplicate override rules? Choose how to handle transactions that were imported by these rules.'}
          </p>

          {getTotalRulesImportedCount() > 0 ? (
            <div
              className={styles.optionsList}
              role="radiogroup"
              aria-label={t.deleteDuplicateBoth || 'Deletion options'}
            >
              <label
                className={`${styles.optionCard} ${clearAllDeleteMode === 'both' ? styles.optionCardActive : ''}`}
                data-testid="clear-all-mode-both-label"
              >
                <div className={styles.radioWrapper}>
                  <input
                    type="radio"
                    name="clear-all-delete-mode"
                    value="both"
                    checked={clearAllDeleteMode === 'both'}
                    onChange={() => setClearAllDeleteMode('both')}
                    className={styles.radioInput}
                    data-testid="clear-all-mode-both-radio"
                  />
                </div>
                <div className={styles.optionContent}>
                  <span className={styles.optionTitle}>{t.deleteDuplicateBoth || 'Delete rules and imported data'}</span>
                  <span className={styles.optionDesc}>
                    {(t.clearAllDuplicateBothDesc || 'Delete all rules and permanently remove {count} transaction(s) imported by them.').replace(
                      '{count}',
                      String(getTotalRulesImportedCount()),
                    )}
                  </span>
                </div>
              </label>

              <label
                className={`${styles.optionCard} ${clearAllDeleteMode === 'rule_only' ? styles.optionCardActive : ''}`}
                data-testid="clear-all-mode-rule-only-label"
              >
                <div className={styles.radioWrapper}>
                  <input
                    type="radio"
                    name="clear-all-delete-mode"
                    value="rule_only"
                    checked={clearAllDeleteMode === 'rule_only'}
                    onChange={() => setClearAllDeleteMode('rule_only')}
                    className={styles.radioInput}
                    data-testid="clear-all-mode-rule-only-radio"
                  />
                </div>
                <div className={styles.optionContent}>
                  <span className={styles.optionTitle}>{t.deleteDuplicateRuleOnly || 'Delete rules only'}</span>
                  <span className={styles.optionDesc}>
                    {(t.clearAllDuplicateRuleOnlyDesc || 'Delete all rules, but keep all {count} imported transaction(s) in your accounts.').replace(
                      '{count}',
                      String(getTotalRulesImportedCount()),
                    )}
                  </span>
                </div>
              </label>

              <label
                className={`${styles.optionCard} ${clearAllDeleteMode === 'data_only' ? styles.optionCardActive : ''}`}
                data-testid="clear-all-mode-data-only-label"
              >
                <div className={styles.radioWrapper}>
                  <input
                    type="radio"
                    name="clear-all-delete-mode"
                    value="data_only"
                    checked={clearAllDeleteMode === 'data_only'}
                    onChange={() => setClearAllDeleteMode('data_only')}
                    className={styles.radioInput}
                    data-testid="clear-all-mode-data-only-radio"
                  />
                </div>
                <div className={styles.optionContent}>
                  <span className={styles.optionTitle}>{t.deleteDuplicateDataOnly || 'Delete imported data only'}</span>
                  <span className={styles.optionDesc}>
                    {(t.clearAllDuplicateDataOnlyDesc || 'Delete all {count} transaction(s) imported by rules, but keep all rules active.').replace(
                      '{count}',
                      String(getTotalRulesImportedCount()),
                    )}
                  </span>
                </div>
              </label>
            </div>
          ) : (
            <p className={styles.modalNoTxNote}>
              {t.noTransactionsInPeriod ||
                'No transactions currently in your accounts were imported by these rules.'}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
