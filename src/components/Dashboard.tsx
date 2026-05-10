import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useLanguageStore } from '../store/useLanguageStore';
import type { Transaction } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import styles from './Dashboard.module.css';

const CATEGORY_COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6',
  '#8b5cf6', '#14b8a6', '#f43f5e', '#84cc16', '#06b6d4',
  '#a855f7', '#eab308',
];

/** Map from internal category key to translation key */
const categoryI18nKeys: Record<string, keyof TranslationStrings> = {
  Salary: 'catSalary',
  Rent: 'catRent',
  Groceries: 'catGroceries',
  'Dining Out': 'catDiningOut',
  Shopping: 'catShopping',
  Transport: 'catTransport',
  Entertainment: 'catEntertainment',
  Insurance: 'catInsurance',
  Utilities: 'catUtilities',
  Healthcare: 'catHealthcare',
  Savings: 'catSavings',
  Transfers: 'catTransfers',
  Other: 'catOther',
};

function categorize(desc: string): string {
  const d = desc.toLowerCase();
  if (/gehalt|salary|lohn|einkommen|income/.test(d)) return 'Salary';
  if (/miete|rent|wohnung|housing/.test(d)) return 'Rent';
  if (/rewe|edeka|aldi|lidl|netto|penny|supermarkt|market|grocery|lebensmittel/.test(d))
    return 'Groceries';
  if (/restaurant|cafe|starbucks|mcdonalds|burger|pizza|essen/.test(d))
    return 'Dining Out';
  if (/amazon|ebay|zalando|shop|kauf|purchase/.test(d)) return 'Shopping';
  if (/db |bahn|mvg|uber|bolt|taxi|tank|fuel|benzin|diesel|transport/.test(d))
    return 'Transport';
  if (/netflix|spotify|disney|kino|cinema|gym|fitness|sport|entertainment/.test(d))
    return 'Entertainment';
  if (/versicherung|insurance|allianz|huk/.test(d)) return 'Insurance';
  if (/strom|gas|energie|wasser|internet|telekom|vodafone|o2|utility/.test(d))
    return 'Utilities';
  if (/arzt|apotheke|doctor|pharmacy|health|kranken/.test(d)) return 'Healthcare';
  if (/sparkonto|saving|tagesgeld|festgeld/.test(d)) return 'Savings';
  if (/paypal|klarna|transfer|überweisung/.test(d)) return 'Transfers';
  return 'Other';
}

const Dashboard: React.FC = () => {
  const { importedAccounts, resetImport } = useAppStore();
  const t = useLanguageStore((s) => s.t);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const allTransactions: Transaction[] = useMemo(() => {
    return importedAccounts.flatMap((a) =>
      a.transactions.map((t) => ({ ...t, category: categorize(t.description) }))
    );
  }, [importedAccounts]);

  const filteredTx = useMemo(() => {
    let txs = allTransactions;
    if (selectedInstitution !== 'all') {
      txs = txs.filter((t) => t.institution === selectedInstitution);
    }
    if (searchTerm) {
      txs = txs.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortOrder) {
      case 'newest':
        txs = [...txs].sort((a, b) => b.date.localeCompare(a.date));
        break;
      case 'oldest':
        txs = [...txs].sort((a, b) => a.date.localeCompare(b.date));
        break;
      case 'highest':
        txs = [...txs].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      case 'lowest':
        txs = [...txs].sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        break;
    }
    return txs;
  }, [allTransactions, selectedInstitution, searchTerm, sortOrder]);

  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  // Category breakdown
  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    allTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + Math.abs(t.amount);
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));
  }, [allTransactions]);

  // Monthly spending chart
  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    allTransactions.forEach((t) => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!map[month]) map[month] = { income: 0, expense: 0 };
      if (t.type === 'income') map[month].income += t.amount;
      else map[month].expense += Math.abs(t.amount);
    });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        name: new Date(month + '-01').toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
        income: Math.round(data.income),
        expenses: Math.round(data.expense),
      }));
  }, [allTransactions]);

  const institutionNames = [...new Set(importedAccounts.map((a) => a.institutionName))];

  const formatCurrency = (val: number) =>
    val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  /** Get translated category name */
  const getCategoryLabel = (catKey: string): string => {
    const i18nKey = categoryI18nKeys[catKey];
    if (i18nKey && t[i18nKey]) return t[i18nKey] as string;
    return catKey;
  };

  return (
    <div className="app-container">
      <main className="container">
        {/* New Import Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.totalBalance}</p>
          <h1 className={styles['balance-amount']}>{formatCurrency(balance)}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                className={styles['icon-box']}
                style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}
              >
                <TrendingUp size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.income}</p>
                <p style={{ fontWeight: 600 }}>{formatCurrency(totalIncome)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                className={styles['icon-box']}
                style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}
              >
                <TrendingDown size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.expenses}</p>
                <p style={{ fontWeight: 600 }}>{formatCurrency(totalExpenses)}</p>
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
            <div className={styles['chart-container']} style={{ height: '200px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              {categoryMap.slice(0, 6).map((cat) => (
                <div
                  key={cat.name}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: cat.color,
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>{getCategoryLabel(cat.name)}</span>
                  </div>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(cat.value)}</span>
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
              <div className={styles['chart-container']} style={{ height: '220px' }}>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`glass-card ${styles['col-span-12']}`}
          >
            <div className={styles['transactions-header']}>
              <h3>{t.allTransactions}</h3>
              <div className={styles['transactions-controls']}>
                <div className={styles['tx-search-wrapper']}>
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles['tx-search-input']}
                    id="tx-search"
                  />
                </div>
                {institutionNames.length > 1 && (
                  <select
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    className={styles['tx-filter-select']}
                    id="institution-filter"
                  >
                    <option value="all">{t.allInstitutions}</option>
                    {institutionNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className={styles['tx-filter-select']}
                  id="sort-order"
                >
                  <option value="newest">{t.newestFirst}</option>
                  <option value="oldest">{t.oldestFirst}</option>
                  <option value="highest">{t.highestAmount}</option>
                  <option value="lowest">{t.lowestAmount}</option>
                </select>
              </div>
            </div>

            <div className={styles['transaction-list']}>
              {filteredTx.slice(0, 100).map((tx) => (
                <div key={tx.id} className={styles['transaction-item']}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      className={styles['icon-box']}
                      style={{
                        background:
                          tx.type === 'income'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(244, 63, 94, 0.1)',
                        color: tx.type === 'income' ? 'var(--primary)' : '#f43f5e',
                      }}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft size={18} />
                      ) : (
                        <ArrowUpRight size={18} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600 }}>{tx.description}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {tx.date} • {tx.institution}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p
                      className={tx.type === 'income' ? styles['amount-positive'] : styles['amount-negative']}
                      style={{ fontWeight: 700 }}
                    >
                      {tx.type === 'income' ? '+' : ''}
                      {formatCurrency(tx.amount)}
                    </p>
                    <span className={styles['category-badge']}>{getCategoryLabel(tx.category || 'Other')}</span>
                  </div>
                </div>
              ))}
              {filteredTx.length > 100 && (
                <p className="more-rows" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-dim)' }}>
                  {t.showingOf.replace('{shown}', '100').replace('{total}', String(filteredTx.length))}
                </p>
              )}
              {filteredTx.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  {t.noTransactionsMatch}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
