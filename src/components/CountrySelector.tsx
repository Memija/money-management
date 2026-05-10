import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Globe, Lock } from 'lucide-react';
import { countries } from '../data/countries';
import { useAppStore } from '../store/useAppStore';
import { useLanguageStore } from '../store/useLanguageStore';
import type { Country } from '../types';
import styles from './CountrySelector.module.css';

const CountrySelector: React.FC = () => {
  const selectCountry = useAppStore((s) => s.selectCountry);
  const t = useLanguageStore((s) => s.t);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Country | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    if (!country.supported) return;
    setSelected(country);
    setIsOpen(false);
    setSearch('');
  };

  const handleContinue = () => {
    if (selected) {
      selectCountry(selected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="onboarding-container"
    >
      <div className="onboarding-header">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="onboarding-icon"
        >
          <Globe size={32} />
        </motion.div>
        <h1 className="onboarding-title">{t.welcomeTitle}</h1>
        <p className="onboarding-subtitle">
          {t.welcomeSubtitle}
        </p>
      </div>

      <div className={styles['country-selector-wrapper']} ref={dropdownRef}>
        <div
          className={`${styles['country-dropdown-trigger']} ${isOpen ? styles.active : ''} ${selected ? styles['has-value'] : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          id="country-selector"
        >
          {selected ? (
            <div className={styles['country-option-content']}>
              <img
                src={selected.flag}
                alt={`${selected.name} flag`}
                className={styles['country-flag']}
              />
              <span>{selected.name}</span>
            </div>
          ) : (
            <span className={styles['placeholder-text']}>{t.selectCountryPlaceholder}</span>
          )}
          <ChevronDown
            size={18}
            className={`${styles['dropdown-chevron']} ${isOpen ? styles.rotated : ''}`}
          />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={styles['country-dropdown-menu']}
            >
              <div className={styles['country-search-wrapper']}>
                <Search size={16} className={styles['search-icon']} />
                <input
                  type="text"
                  placeholder={t.searchCountries}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles['country-search-input']}
                  id="country-search"
                  autoFocus
                />
              </div>
              <div className={styles['country-list']}>
                {filtered.length === 0 ? (
                  <div className={styles['country-empty']}>{t.noCountriesFound}</div>
                ) : (
                  filtered.map((country) => (
                    <div
                      key={country.code}
                      className={`${styles['country-option']} ${!country.supported ? styles.disabled : ''} ${
                        selected?.code === country.code ? styles.selected : ''
                      }`}
                      onClick={() => handleSelect(country)}
                      id={`country-${country.code}`}
                    >
                      <div className={styles['country-option-content']}>
                        <img
                          src={country.flag}
                          alt={`${country.name} flag`}
                          className={styles['country-flag']}
                        />
                        <span>{country.name}</span>
                      </div>
                      {!country.supported && (
                        <div className={styles['coming-soon-badge']}>
                          <Lock size={10} />
                          <span>{t.soon}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <motion.button
        whileHover={{ scale: selected ? 1.02 : 1 }}
        whileTap={{ scale: selected ? 0.98 : 1 }}
        className={`primary-button ${!selected ? 'disabled' : ''}`}
        onClick={handleContinue}
        disabled={!selected}
        id="continue-button"
      >
        {t.continue}
      </motion.button>
    </motion.div>
  );
};

export default CountrySelector;
