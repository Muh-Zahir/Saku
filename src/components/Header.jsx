'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Plus } from 'lucide-react';

export default function Header({ currentPeriod, onSelectPeriod, onOpenAddTransaction, lastSync = 'Diperbarui 30 Sep 2026, 20.45' }) {
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
      <div className="page-actions">
        {/* Period Selector */}
        <div className="dropdown-wrapper" ref={dropdownRef}>
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
      </div>

      {/* Mobile full-width CTA — hanya tampil di mobile */}
      <button className="btn-catat-mobile mobile-only" onClick={onOpenAddTransaction}>
        <Plus size={18} strokeWidth={2.5} />
        <span>Tambah transaksi</span>
      </button>

      {/* Mobile last updated info — hanya tampil di mobile */}
      <div className="mobile-last-sync mobile-only">
        <span className="sync-bullet">•</span>
        <span>{lastSync}</span>
      </div>
    </div>
  );
}
