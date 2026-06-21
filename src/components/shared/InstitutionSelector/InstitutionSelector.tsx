import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Building2,
  ArrowLeft,
  Landmark,
  Smartphone,
  TrendingUp,
  ChevronRight,
  CreditCard,
  Banknote,
  Briefcase,
  Globe,
  Leaf,
  Wallet,
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { institutionsByCountry, categoryOrder } from '../../../data/institutions';
import type { FinancialInstitution, InstitutionCategory } from '../../../types';
import styles from './InstitutionSelector.module.css';

/* ─── icon / colour maps ─── */

const typeIcons: Record<FinancialInstitution['type'], React.ReactNode> = {
  bank: <Landmark size={18} />,
  neobank: <Smartphone size={18} />,
  credit_union: <Building2 size={18} />,
  brokerage: <TrendingUp size={18} />,
  insurance: <Building2 size={18} />,
};

const categoryIcons: Record<InstitutionCategory, React.ReactNode> = {
  traditional: <Landmark size={14} />,
  sparkasse: <Banknote size={14} />,
  volksbank: <Building2 size={14} />,
  direct: <Globe size={14} />,
  neobank: <Smartphone size={14} />,
  landesbank: <Briefcase size={14} />,
  brokerage: <TrendingUp size={14} />,
  specialized: <Leaf size={14} />,
  payment: <Wallet size={14} />,
  other: <Building2 size={14} />,
};

/** Map InstitutionCategory to translation key */
const categoryTranslationKeys: Record<InstitutionCategory, 'catTraditional' | 'catSparkasse' | 'catVolksbank' | 'catDirect' | 'catNeobank' | 'catLandesbank' | 'catBrokerage' | 'catSpecialized' | 'catPayment' | 'catOther'> = {
  traditional: 'catTraditional',
  sparkasse: 'catSparkasse',
  volksbank: 'catVolksbank',
  direct: 'catDirect',
  neobank: 'catNeobank',
  landesbank: 'catLandesbank',
  brokerage: 'catBrokerage',
  specialized: 'catSpecialized',
  payment: 'catPayment',
  other: 'catOther',
};


const InstitutionSelector: React.FC = () => {
  const { selectedCountry, selectInstitution, setStep } = useAppStore();
  const t = useLanguageStore((s) => s.t);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<InstitutionCategory | 'all'>('all');

  const institutions = useMemo(() => {
    return selectedCountry
      ? institutionsByCountry[selectedCountry.code] || []
      : [];
  }, [selectedCountry]);


  /* Determine which categories actually have institutions */
  const availableCategories = useMemo(() => {
    const cats = new Set(institutions.map((i) => i.category));
    return categoryOrder.filter((c) => cats.has(c));
  }, [institutions]);

  /* Filter by search + category */
  const filtered = useMemo(() => {
    return institutions.filter((inst) => {
      const matchesSearch = inst.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'all' || inst.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [institutions, search, activeCategory]);

  /* Group by category for display */
  const grouped = useMemo(() => {
    const map = new Map<InstitutionCategory, FinancialInstitution[]>();
    for (const inst of filtered) {
      const arr = map.get(inst.category) || [];
      arr.push(inst);
      map.set(inst.category, arr);
    }
    // Preserve display order
    return categoryOrder
      .filter((c) => map.has(c))
      .map((c) => ({ category: c, institutions: map.get(c)! }));
  }, [filtered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="onboarding-container"
    >
      <button className="back-button" onClick={() => setStep('country')} id="back-to-country">
        <ArrowLeft size={18} />
        <span>{t.back}</span>
      </button>

      <div className="onboarding-header">
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles['country-badge-top']}
          >
            <img src={selectedCountry.flag} alt="" className={styles['country-flag-sm']} />
            <span>{t.countries[selectedCountry.code as keyof typeof t.countries]}</span>
          </motion.div>
        )}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="onboarding-icon"
        >
          <Building2 size={32} />
        </motion.div>
        <h1 className="onboarding-title">{t.selectInstitutionTitle}</h1>
        <p className="onboarding-subtitle">
          {t.selectInstitutionSubtitle}
        </p>
      </div>

      {/* Search */}
      <div className={styles['institution-search-bar']}>
        <Search size={18} className={styles['search-icon']} />
        <input
          type="text"
          placeholder={t.searchInstitutions}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles['institution-search-input']}
          id="institution-search"
          name="institution-search"
        />
      </div>

      {/* Category Filter Tags */}
      <div className={styles['category-tags-wrapper']}>
        <div className={styles['category-tags']}>
          <button
            className={`${styles['category-tag']} ${activeCategory === 'all' ? styles.active : ''}`}
            onClick={() => setActiveCategory('all')}
            id="filter-all"
          >
            <CreditCard size={14} />
            <span>{t.all}</span>
            <span className={styles['category-tag-count']}>{institutions.length}</span>
          </button>
          {availableCategories.map((cat) => {
            const count = institutions.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                className={`${styles['category-tag']} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}
                id={`filter-${cat}`}
                data-category={cat}
              >
                {categoryIcons[cat]}
                <span>{t[categoryTranslationKeys[cat]]}</span>
                <span className={styles['category-tag-count']}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Institution List */}
      <div className={styles['institution-list']}>
        {grouped.length === 0 ? (
          <div className={styles['institution-empty']}>
            <p>{t.noInstitutionsFound}</p>
          </div>
        ) : (
          grouped.map(({ category, institutions: insts }) => (
            <div key={category} className={styles['institution-group']}>
              {activeCategory === 'all' && (
                <div className={styles['institution-group-header']}>
                  <span
                    className={styles['institution-type-badge']}
                    data-category={category}
                  >
                    {categoryIcons[category]}
                    {t[categoryTranslationKeys[category]]}
                  </span>
                  <span className={styles['institution-count']}>{insts.length}</span>
                </div>
              )}
              {insts.map((inst, idx) => (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={styles['institution-item']}
                  onClick={() => selectInstitution(inst)}
                  id={`institution-${inst.id}`}
                >
                  <div className={styles['institution-item-left']}>
                    <div
                      className={`${styles['institution-item-icon']} ${inst.logo ? styles['has-logo'] : ''}`}
                      data-category={inst.category}
                    >
                      {inst.logo ? (
                        <img src={inst.logo} alt="" className={styles['institution-logo']} />
                      ) : (
                        typeIcons[inst.type]
                      )}
                    </div>
                    <div>
                      <span className={styles['institution-name']}>{inst.name}</span>
                      <span className={styles['institution-type-label']}>
                        {t[categoryTranslationKeys[inst.category]]}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className={styles['institution-chevron']} />
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>

    </motion.div>
  );
};

export default InstitutionSelector;
