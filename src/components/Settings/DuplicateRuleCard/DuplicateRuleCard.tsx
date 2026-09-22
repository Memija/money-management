import React from 'react'
import { Building2, Pencil, Repeat, Trash2 } from 'lucide-react'

import { findInstitution } from '../../../data/institutions'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { DuplicateOverrideRule } from '../../../types'

import styles from './DuplicateRuleCard.module.css'

export interface DuplicateRuleCardProps {
  rule: DuplicateOverrideRule
  onRevoke?: (rule: DuplicateOverrideRule) => void
  isModalPreview?: boolean
}

export const DuplicateRuleCard: React.FC<DuplicateRuleCardProps> = ({
  rule,
  onRevoke,
  isModalPreview = false,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatDate } = useFormatters()

  const inst = findInstitution(rule.institutionId || rule.institutionName)
  const amountText =
    rule.amount !== undefined ? formatCurrency(rule.amount) : t.anyAmount || 'Any amount'
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
    <div
      className={`${styles.ruleItem} ${isModalPreview ? styles.modalPreview : ''}`}
      data-testid={isModalPreview ? `modal-rule-preview-${rule.id}` : `duplicate-rule-item-${rule.id}`}
    >
      <div className={styles.ruleBankRow}>
        <div
          className={styles.bankInfo}
          data-testid={isModalPreview ? `modal-rule-inst-${rule.id}` : `rule-inst-${rule.id}`}
        >
          {inst?.logo ? (
            <img src={inst.logo} alt="" className={styles.bankLogo} />
          ) : (
            <Building2 size={15} aria-hidden="true" className={styles.bankIcon} />
          )}
          <span className={styles.bankName}>{instText}</span>
        </div>
        {!isModalPreview && onRevoke && (
          <button
            type="button"
            className={styles.revokeBtn}
            onClick={() => onRevoke(rule)}
            title={t.revokeRule || 'Revoke rule'}
            aria-label={`${t.revokeRule || 'Revoke rule'}: ${rule.descriptionPattern}`}
            data-testid={`revoke-duplicate-rule-btn-${rule.id}`}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={styles.ruleActionRow}>
        <span
          className={hasModifications ? styles.ruleModifiedBadge : styles.ruleActionBadge}
          data-testid={
            isModalPreview
              ? `modal-rule-action-badge-${rule.id}`
              : `rule-action-badge-${rule.id}`
          }
        >
          {hasModifications
            ? t.ruleDuplicatedAndModifiedLabel || 'Duplicated and modified'
            : t.ruleAllowDuplicateLabel || 'Allow duplicate'}
        </span>
      </div>

      <div
        className={styles.rulePattern}
        title={rule.descriptionPattern}
        data-testid={
          isModalPreview ? `modal-rule-pattern-${rule.id}` : `rule-pattern-${rule.id}`
        }
      >
        {rule.descriptionPattern}
      </div>

      <div className={styles.badgeRow}>
        <span
          className={`${styles.metaPill} ${rule.amount !== undefined ? styles.amountPill : ''}`}
          data-testid={
            isModalPreview ? `modal-rule-amount-${rule.id}` : `rule-amount-${rule.id}`
          }
        >
          {amountText}
        </span>

        <span
          className={`${styles.metaPill} ${styles.appliedPill}`}
          data-testid={
            isModalPreview ? `modal-rule-applied-${rule.id}` : `rule-applied-${rule.id}`
          }
        >
          <Repeat size={11} aria-hidden="true" />
          <span>{appliedWithDateText}</span>
        </span>
      </div>

      {hasModifications && rule.modifications && (
        <div
          className={styles.modificationsCard}
          data-testid={
            isModalPreview
              ? `modal-rule-modifications-${rule.id}`
              : `rule-modifications-${rule.id}`
          }
        >
          <div className={styles.modificationsHeader}>
            <Pencil size={12} className={styles.modIcon} aria-hidden="true" />
            <span className={styles.modificationsTitle}>
              {t.ruleModificationsTitle || 'Changes applied'}
            </span>
          </div>
          <div className={styles.modificationsList}>
            {rule.modifications.amount !== undefined && (
              <div
                className={styles.modRow}
                data-testid={
                  isModalPreview
                    ? `modal-rule-mod-amount-${rule.id}`
                    : `rule-mod-amount-${rule.id}`
                }
              >
                <span className={styles.modFieldLabel}>{t.amount || 'Amount'}:</span>
                <span className={styles.modOldVal}>
                  {rule.amount !== undefined ? formatCurrency(rule.amount) : '—'}
                </span>
                <span className={styles.modArrow} aria-hidden="true">
                  →
                </span>
                <span className={styles.modNewVal}>
                  {formatCurrency(rule.modifications.amount)}
                </span>
              </div>
            )}
            {rule.modifications.description !== undefined &&
              rule.modifications.description !== rule.descriptionPattern && (
                <div
                  className={styles.modRow}
                  data-testid={
                    isModalPreview
                      ? `modal-rule-mod-desc-${rule.id}`
                      : `rule-mod-desc-${rule.id}`
                  }
                >
                  <span className={styles.modFieldLabel}>
                    {t.description || 'Description'}:
                  </span>
                  <span className={styles.modOldVal}>{rule.descriptionPattern}</span>
                  <span className={styles.modArrow} aria-hidden="true">
                    →
                  </span>
                  <span className={styles.modNewVal}>
                    {rule.modifications.description}
                  </span>
                </div>
              )}
            {rule.modifications.category !== undefined && (
              <div
                className={styles.modRow}
                data-testid={
                  isModalPreview
                    ? `modal-rule-mod-cat-${rule.id}`
                    : `rule-mod-cat-${rule.id}`
                }
              >
                <span className={styles.modFieldLabel}>{t.category || 'Category'}:</span>
                <span className={styles.modNewVal}>{rule.modifications.category}</span>
              </div>
            )}
            {rule.modifications.date !== undefined && (
              <div
                className={styles.modRow}
                data-testid={
                  isModalPreview
                    ? `modal-rule-mod-date-${rule.id}`
                    : `rule-mod-date-${rule.id}`
                }
              >
                <span className={styles.modFieldLabel}>{t.date || 'Date'}:</span>
                <span className={styles.modNewVal}>
                  {formatDate(rule.modifications.date)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
