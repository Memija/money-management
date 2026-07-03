import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useFormatters } from '../../hooks/useFormatters'
import { useTransactions } from '../../hooks/useTransactions'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { getCategoryLabel } from '../../utils/category-utils'
import { TransactionList } from './TransactionList'

import styles from './Dashboard.module.css'

const CATEGORY_COLORS = [
  '#10b981',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#8b5cf6',
  '#14b8a6',
  '#f43f5e',
  '#84cc16',
  '#06b6d4',
  '#a855f7',
  '#eab308',
]

const Dashboard: React.FC = () => {
  const { importedAccounts, resetImport } = useAppStore()
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatMonthYear } = useFormatters()

  const {
    allTransactions,
    filteredTx,
    searchTerm,
    setSearchTerm,
    selectedInstitution,
    setSelectedInstitution,
    sortOrder,
    setSortOrder,
  } = useTransactions()

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const expenses = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses }
  }, [allTransactions])

  // Category breakdown
  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {}
    allTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Other'
        map[cat] = (map[cat] || 0) + Math.abs(t.amount)
      })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        colorClass: styles[`cat-color-${i % CATEGORY_COLORS.length}`],
      }))
  }, [allTransactions])

  // Monthly spending chart
  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {}
    allTransactions.forEach((t) => {
      const month = t.date.substring(0, 7) // YYYY-MM
      if (!map[month]) map[month] = { income: 0, expense: 0 }
      if (t.type === 'income') map[month].income += t.amount
      else map[month].expense += Math.abs(t.amount)
    })
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        name: formatMonthYear(month),
        income: Math.round(data.income),
        expenses: Math.round(data.expense),
      }))
  }, [allTransactions, formatMonthYear])

  const institutionNames = useMemo(
    () => [...new Set(importedAccounts.map((a) => a.institutionName))],
    [importedAccounts],
  )

  return (
    <div className="app-container">
      <main className="container">
        {/* New Import Action */}
        <div className={styles['header-actions']}>
          <button
            className={styles['nav-reset-btn']}
            onClick={resetImport}
            title={t.newImport}
            id="reset-import"
          >
            {t.newImport}
          </button>
        </div>
        {/* Balance Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${styles['balance-hero']} glass`}
        >
          <p className={styles['balance-label']}>{t.totalBalance}</p>
          <h1 className={styles['balance-amount']}>{formatCurrency(balance)}</h1>
          <div className={styles['balance-stats']}>
            <div className={styles['stat-item']}>
              <div className={`${styles['icon-box']} ${styles['icon-income']}`}>
                <TrendingUp size={18} />
              </div>
              <div className={styles['stat-text-container']}>
                <p className={styles['stat-label']}>{t.income}</p>
                <p className={styles['stat-value']}>{formatCurrency(totalIncome)}</p>
              </div>
            </div>
            <div className={styles['stat-item']}>
              <div className={`${styles['icon-box']} ${styles['icon-expense']}`}>
                <TrendingDown size={18} />
              </div>
              <div className={styles['stat-text-container']}>
                <p className={styles['stat-label']}>{t.expenses}</p>
                <p className={styles['stat-value']}>{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Charts Grid */}
        <div className={styles['dashboard-grid']}>
          {/* Spending Overview Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`glass-card ${styles['col-span-8']}`}
          >
            <h3>{t.incomeVsExpenses}</h3>
            <div className={styles['chart-container']}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
                    tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 17, 21, 0.9)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="income" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`glass-card ${styles['col-span-4']}`}
          >
            <h3>{t.expenseCategories}</h3>
            <div className={`${styles['chart-container']} ${styles['chart-pie']}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryMap}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryMap.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 17, 21, 0.9)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles['category-list']}>
              {categoryMap.slice(0, 6).map((cat) => (
                <div key={cat.name} className={styles['category-item']}>
                  <div className={styles['category-name-container']}>
                    <div className={`${styles['category-dot']} ${cat.colorClass}`} />
                    <span className={styles['category-name']}>{getCategoryLabel(cat.name, t)}</span>
                  </div>
                  <span className={styles['category-value']}>{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Spending Area Chart */}
          {monthlyData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className={`glass-card ${styles['col-span-12']}`}
            >
              <h3>{t.spendingTrend}</h3>
              <div className={`${styles['chart-container']} ${styles['chart-area']}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
                      tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 17, 21, 0.9)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                      }}
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAmt)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Transactions Table */}
          <TransactionList
            filteredTx={filteredTx}
            institutionNames={institutionNames}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedInstitution={selectedInstitution}
            setSelectedInstitution={setSelectedInstitution}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
