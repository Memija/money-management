import type { DuplicateOverrideRule, ImportedAccount } from '../types'

export const toCanonicalTransactionKey = (t: {
  date: string
  amount: number
  description: string
}): string => {
  const normDesc = (t.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const normAmount = Number(t.amount).toFixed(2)
  return `${t.date}|${normAmount}|${normDesc}`
}

export const matchesDuplicateOverrideRule = (
  rule: DuplicateOverrideRule,
  tx: { description?: string; amount?: number; importedByRuleId?: string },
  institutionId?: string,
): boolean => {
  if (tx.importedByRuleId && tx.importedByRuleId === rule.id) {
    return true
  }
  if (
    rule.institutionId &&
    institutionId &&
    rule.institutionId !== 'unknown' &&
    institutionId !== 'unknown' &&
    rule.institutionId !== institutionId
  ) {
    return false
  }

  const amountsToMatch: number[] = []
  if (rule.amount !== undefined) {
    amountsToMatch.push(Number(rule.amount))
    amountsToMatch.push(-Number(rule.amount))
  }
  if (rule.modifications?.amount !== undefined) {
    amountsToMatch.push(Number(rule.modifications.amount))
    amountsToMatch.push(-Number(rule.modifications.amount))
  }

  if (amountsToMatch.length > 0 && tx.amount !== undefined) {
    const matchesAnyAmount = amountsToMatch.some((a) => Math.abs(Number(tx.amount) - a) < 0.005)
    if (!matchesAnyAmount) {
      return false
    }
  }

  const txDesc = (tx.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const rulePattern = (rule.descriptionPattern || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const modPattern = (rule.modifications?.description || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

  if (!rulePattern && !modPattern) {
    return false
  }

  const matchesDesc =
    (rulePattern && (txDesc.includes(rulePattern) || rulePattern.includes(txDesc))) ||
    (modPattern && (txDesc.includes(modPattern) || modPattern.includes(txDesc)))

  return Boolean(matchesDesc)
}

export const isModifiedTransactionForRule = (
  rule: DuplicateOverrideRule,
  tx: { description?: string; amount?: number; date?: string; importedByRuleId?: string },
  institutionId?: string,
): boolean => {
  if (!rule.modifications) {
    return false
  }
  if (
    rule.institutionId &&
    institutionId &&
    rule.institutionId !== 'unknown' &&
    institutionId !== 'unknown' &&
    rule.institutionId !== institutionId
  ) {
    return false
  }

  const mods = rule.modifications
  if (mods.amount !== undefined) {
    if (tx.amount === undefined) {
      return false
    }
    const modAmt = Number(mods.amount)
    if (Math.abs(Number(tx.amount) - modAmt) >= 0.005) {
      return false
    }
  }

  if (mods.description !== undefined) {
    const modDesc = mods.description.trim().toLowerCase().replace(/\s+/g, ' ')
    const txDesc = (tx.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
    if (!txDesc.includes(modDesc) && modDesc !== txDesc) {
      return false
    }
  }

  if (mods.amount === undefined && mods.description === undefined) {
    if (tx.importedByRuleId === rule.id) {
      return true
    }
    return false
  }

  return true
}

export const isOriginalTransactionMatchForRule = (
  rule: DuplicateOverrideRule,
  tx: { description?: string; amount?: number; date?: string },
  institutionId?: string,
): boolean => {
  if (
    rule.institutionId &&
    institutionId &&
    rule.institutionId !== 'unknown' &&
    institutionId !== 'unknown' &&
    rule.institutionId !== institutionId
  ) {
    return false
  }

  if (rule.amount !== undefined && tx.amount !== undefined) {
    const origAmt = Number(rule.amount)
    const matchesOrigAmt =
      Math.abs(Number(tx.amount) - origAmt) < 0.005 ||
      Math.abs(Number(tx.amount) - -origAmt) < 0.005
    if (!matchesOrigAmt) {
      return false
    }
  }

  const origPattern = (rule.descriptionPattern || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!origPattern) {
    return false
  }
  const txDesc = (tx.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  return txDesc.includes(origPattern) || origPattern === txDesc
}

export const sanitizeDuplicateOverrideRules = (
  rules?: DuplicateOverrideRule[],
): DuplicateOverrideRule[] => {
  if (!Array.isArray(rules)) {
    return []
  }
  const seenIds = new Set<string>()
  return rules
    .filter((r): r is DuplicateOverrideRule => Boolean(r && typeof r === 'object'))
    .map((rule, idx) => {
      let id = typeof rule.id === 'string' && rule.id.trim().length > 0 ? rule.id.trim() : ''
      if (!id || seenIds.has(id)) {
        id = `drule_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`
      }
      seenIds.add(id)
      return {
        ...rule,
        id,
        descriptionPattern: (rule.descriptionPattern || '').trim(),
        createdAt:
          rule.createdAt && !isNaN(new Date(rule.createdAt).getTime())
            ? rule.createdAt
            : new Date().toISOString(),
        applyCount:
          typeof rule.applyCount === 'number' && rule.applyCount > 0 ? rule.applyCount : 1,
      }
    })
}

export const countDuplicateTransactionsInAccounts = (
  importedAccounts: ImportedAccount[],
  duplicateOverrideRules: DuplicateOverrideRule[] = [],
): number => {
  let count = 0
  const ruleIdSet = new Set(duplicateOverrideRules.map((r) => r.id))
  for (const account of importedAccounts) {
    if (account.duplicateTransactions?.length) {
      count += account.duplicateTransactions.length
    }
    if (account.modifiedTransactions?.length) {
      count += account.modifiedTransactions.length
    }
    for (const tx of account.transactions) {
      if (tx.forceImport || tx.isDuplicate) {
        count++
        continue
      }
      if (tx.importedByRuleId && !ruleIdSet.has(tx.importedByRuleId)) {
        count++
        continue
      }
    }
  }
  return count
}
