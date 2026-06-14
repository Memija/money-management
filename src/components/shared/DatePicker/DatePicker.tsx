import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { getPublicHolidayName } from '../../../utils/holidays';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Select date...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or use today for the view
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format to YYYY-MM-DD local time
    const formatted = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && value) {
      const d = new Date(value);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  // Calendar logic
  const { days, blanks } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // 0 = Sunday, 1 = Monday. We want Monday as first day.
    let firstDayOfWeek = new Date(year, month, 1).getDay();
    // Adjust to Monday start (1-7)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    return {
      days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      blanks: Array.from({ length: firstDayOfWeek }, (_, i) => i)
    };
  }, [currentMonth]);

  // Localized months and weekdays
  const { locale, t } = useLanguageStore();

  const monthNames = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(2023, i, 1);
      const name = new Intl.DateTimeFormat(locale, { month: 'long' }).format(d);
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  }, [locale]);

  const weekdays = useMemo(() => {
    // January 2, 2023 was a Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2023, 0, 2 + i);
      const name = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  }, [locale]);

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear();
  };

  // Check if a day is selected
  const isSelected = (day: number) => {
    if (!value) return false;
    const selected = new Date(value);
    return selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear();
  };

  const isFuture = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d > today;
  };

  const isSunday = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return d.getDay() === 0;
  };

  const getHolidayKey = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return getPublicHolidayName(d, 'DE');
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef} title={placeholder || t.selectDatePlaceholder}>
      <div className={styles['input-wrapper']} onClick={toggleDropdown}>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder || t.selectDatePlaceholder}
          value={value}
          readOnly
        />
        {value ? (
          <button className={styles['clear-button']} onClick={handleClear} title="Clear date">
            <X size={12} />
          </button>
        ) : (
          <Calendar size={14} className={styles.icon} />
        )}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <button className={styles['nav-button']} onClick={handlePrevMonth} title="Previous month" aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button className={styles['nav-button']} onClick={handleNextMonth} title="Next month" aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.grid}>
            {weekdays.map((day, index) => (
              <div key={day} className={`${styles.weekday} ${index === 6 ? styles.sundayText : ''}`}>{day}</div>
            ))}

            {blanks.map(blank => (
              <div key={`blank-${blank}`} className={`${styles.day} ${styles.empty}`}></div>
            ))}

            {days.map(day => {
              const holidayKey = getHolidayKey(day);
              const holidayName = holidayKey ? t.holidays[holidayKey] : null;
              return (
                <div
                  key={day}
                  className={`
                  ${styles.day}
                  ${isToday(day) ? styles.today : ''}
                  ${isSelected(day) ? styles.selected : ''}
                  ${isSunday(day) || holidayKey ? styles.sundayText : ''}
                  ${isFuture(day) ? styles.future : ''}
                `}
                  title={holidayName || undefined}
                  onClick={() => handleDateSelect(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
