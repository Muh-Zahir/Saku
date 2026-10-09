'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import PeriodSelector from './PeriodSelector';

export default function Header({
  currentPeriod,
  onSelectPeriod,
  onOpenAddTransaction,
  lastSync = 'Diperbarui 30 Sep 2026, 20.45'
}) {
  return (
    <div className="page-header">
      <div className="page-title-group">
        <h1 className="page-title">Keuanganmu, lebih terarah.</h1>
        <p className="page-subtitle">Halo, Aditya. Ini ringkasan perjalanan keuanganmu bulan ini.</p>
      </div>

      {/* Desktop: period selector + tombol tambah dalam satu row */}
      <div className="page-actions">
        {/* Period Selector Dropdown */}
        <PeriodSelector
          currentPeriod={currentPeriod}
          onSelectPeriod={onSelectPeriod}
        />

        {/* Desktop CTA */}
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
    </div>
  );
}
