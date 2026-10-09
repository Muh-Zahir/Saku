'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export default function PeriodSelector({
  currentPeriod,
  onSelectPeriod,
  periods = [
    'September 2026',
    'Agustus 2026',
    'Juli 2026',
    'Juni 2026'
  ]
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <button
        className="btn-period-select"
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
      >
        <span className="btn-period-left">
          <Calendar size={16} strokeWidth={2} />
          <span>{currentPeriod}</span>
        </span>
        <ChevronDown size={16} strokeWidth={2} className="btn-period-chevron" />
      </button>

      {isDropdownOpen && (
        <div className="period-menu show">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              className={`period-option ${currentPeriod === p ? 'active' : ''}`}
              onClick={() => {
                if (onSelectPeriod) onSelectPeriod(p);
                setIsDropdownOpen(false);
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
