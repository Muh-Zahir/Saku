'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Sparkles
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export default function PeriodSelector({
  currentPeriod = 'Oktober 2026',
  onSelectPeriod
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Parse initial period
  const parsePeriod = (periodStr) => {
    if (!periodStr) return { month: 'Oktober', year: 2026 };
    const parts = String(periodStr).trim().split(/\s+/);
    if (parts.length >= 2) {
      const parsedYear = parseInt(parts[parts.length - 1], 10);
      const parsedMonth = parts.slice(0, parts.length - 1).join(' ');
      return {
        month: MONTH_NAMES.includes(parsedMonth) ? parsedMonth : 'Oktober',
        year: !isNaN(parsedYear) ? parsedYear : new Date().getFullYear()
      };
    }
    return { month: 'Oktober', year: new Date().getFullYear() };
  };

  const initial = parsePeriod(currentPeriod);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedYear, setSelectedYear] = useState(initial.year);

  // Sync state whenever currentPeriod changes or popup opens
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const p = parsePeriod(currentPeriod);
      setSelectedMonth(p.month);
      setSelectedYear(p.year);
    }
  }, [isOpen, currentPeriod]);

  // Real world current date for "Bulan Ini" badge
  const now = new Date();
  const realCurrentMonth = MONTH_NAMES[now.getMonth()];
  const realCurrentYear = now.getFullYear();

  const handleApply = (monthToApply = selectedMonth, yearToApply = selectedYear) => {
    const newPeriodStr = `${monthToApply} ${yearToApply}`;
    if (onSelectPeriod) {
      onSelectPeriod(newPeriodStr);
    }
    setIsOpen(false);
  };

  const handleSelectQuick = (type) => {
    if (type === 'this_month') {
      setSelectedMonth(realCurrentMonth);
      setSelectedYear(realCurrentYear);
      handleApply(realCurrentMonth, realCurrentYear);
    } else if (type === 'last_month') {
      const prevMonthIdx = (now.getMonth() - 1 + 12) % 12;
      const prevYear = now.getMonth() === 0 ? realCurrentYear - 1 : realCurrentYear;
      const prevMonthName = MONTH_NAMES[prevMonthIdx];
      setSelectedMonth(prevMonthName);
      setSelectedYear(prevYear);
      handleApply(prevMonthName, prevYear);
    }
  };

  const quickYears = [
    selectedYear - 1,
    selectedYear,
    selectedYear + 1
  ];

  return (
    <div className="period-selector-container">
      {/* Trigger Button on Header / Page */}
      <button
        className="btn-period-select"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="btn-period-left">
          <Calendar size={16} strokeWidth={2} />
          <span>{currentPeriod}</span>
        </span>
        <ChevronDown size={16} strokeWidth={2} className="btn-period-chevron" />
      </button>

      {/* Pop Up Modal (SSR Safe Portal) */}
      {isMounted && isOpen && ReactDOM.createPortal(
        <div
          className="modal-overlay period-modal-overlay"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-dialog period-popup-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header period-popup-header">
              <div className="period-popup-title-group">
                <div className="period-popup-icon-box">
                  <Calendar size={20} stroke="#059669" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="modal-title">Pilih Periode</h3>
                  <p className="modal-subtitle">Pilih bulan dan tahun keuanganmu</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup"
              >
                <X size={20} stroke="#4b5563" />
              </button>
            </div>

            {/* Quick Filter Shortcuts */}
            <div className="period-quick-shortcuts">
              <button
                type="button"
                className="btn-period-quick"
                onClick={() => handleSelectQuick('this_month')}
              >
                <Sparkles size={13} stroke="#059669" />
                <span>Bulan Ini ({realCurrentMonth} {realCurrentYear})</span>
              </button>
              <button
                type="button"
                className="btn-period-quick"
                onClick={() => handleSelectQuick('last_month')}
              >
                <span>Bulan Lalu</span>
              </button>
            </div>

            {/* Year Selector Navigation */}
            <div className="period-year-selector-bar">
              <button
                type="button"
                className="btn-year-arrow"
                onClick={() => setSelectedYear((y) => y - 1)}
                title="Tahun Sebelumnya"
                aria-label="Tahun Sebelumnya"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>

              <div className="period-year-display-wrap">
                <span className="period-year-main">{selectedYear}</span>
                <div className="period-year-pills">
                  {quickYears.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      className={`year-pill-btn ${selectedYear === yr ? 'active' : ''}`}
                      onClick={() => setSelectedYear(yr)}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn-year-arrow"
                onClick={() => setSelectedYear((y) => y + 1)}
                title="Tahun Berikutnya"
                aria-label="Tahun Berikutnya"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* 12 Months Grid */}
            <div className="period-months-grid">
              {MONTH_NAMES.map((monthName, idx) => {
                const isSelected = selectedMonth === monthName && initial.year === selectedYear;
                const isCurrentActive = selectedMonth === monthName;
                const isRealThisMonth = monthName === realCurrentMonth && selectedYear === realCurrentYear;

                return (
                  <button
                    key={monthName}
                    type="button"
                    className={`month-cell-btn ${isCurrentActive ? 'selected' : ''} ${isRealThisMonth ? 'is-today-month' : ''}`}
                    onClick={() => {
                      setSelectedMonth(monthName);
                    }}
                    onDoubleClick={() => {
                      handleApply(monthName, selectedYear);
                    }}
                  >
                    <div className="month-cell-content">
                      <span className="month-short">{MONTH_SHORT[idx]}</span>
                      <span className="month-full">{monthName}</span>
                    </div>
                    {isCurrentActive && (
                      <div className="month-check-icon">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                    {isRealThisMonth && !isCurrentActive && (
                      <span className="month-today-dot" title="Bulan Sekarang" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="period-popup-footer">
              <div className="period-selection-preview">
                <span className="preview-label">Periode dipilih:</span>
                <span className="preview-val">{selectedMonth} {selectedYear}</span>
              </div>

              <div className="period-popup-btn-group">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={() => handleApply(selectedMonth, selectedYear)}
                >
                  Terapkan Periode
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
