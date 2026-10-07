'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Plus } from 'lucide-react';

export default function Header({ currentPeriod, onSelectPeriod, onOpenAddTransaction }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const periods = [
    'September 2026',
    'Agustus 2026',
    'Juli 2026',
    'Juni 2026'
  ];

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
    <div className="page-header">
      <div className="page-title-group">
        <h1 className="page-title">Keuanganmu, lebih terarah.</h1>
        <p className="page-subtitle">Halo, Aditya. Ini ringkasan perjalanan keuanganmu bulan ini.</p>
      </div>

      {/* Desktop: period selector + tombol tambah dalam satu row */}
      {/* Mobile: period selector + tombol ikon bulat dalam satu row inline */}
      <div className="page-actions">
        {/* Period Selector */}
        <div className="dropdown-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="btn-period-select"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Calendar size={16} strokeWidth={2} />
            <span>{currentPeriod}</span>
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>

          {isDropdownOpen && (
            <div className="period-menu show">
              {periods.map((p) => (
                <button
                  key={p}
                  className={`period-option ${currentPeriod === p ? 'active' : ''}`}
                  onClick={() => {
                    onSelectPeriod(p);
                    setIsDropdownOpen(false);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop CTA — teks lengkap */}
        <button className="btn-primary-action btn-add-tx-desktop" onClick={onOpenAddTransaction}>
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah transaksi</span>
        </button>

        {/* Mobile CTA — ikon bulat saja, hemat ruang */}
        <button className="btn-add-tx-mobile" onClick={onOpenAddTransaction} aria-label="Tambah transaksi">
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

