'use client';

import React from 'react';
import {
  Calendar,
  Plus,
  PieChart,
  Target,
  ArrowUpRight,
  Wallet,
  Edit3,
  AlertCircle,
  Copy,
  Info,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  MoreHorizontal
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function BudgetPage({
  currentPeriod,
  budgets,
  onOpenManageBudget,
  onOpenAddBudget,
  onSwitchTab,
  addToast
}) {
  const totalBudget = 9000000;
  const usedBudget = 7350000;
  const remainingBudget = 1650000;
  const usedPercent = 81.7;

  const detailedBudgets = [
    {
      id: 'db-1',
      name: 'Makan & minum',
      spent: 2100000,
      limit: 2500000,
      percent: 84,
      status: 'in_budget',
      remainingText: 'Sisa Rp400.000',
      noteText: 'Belum melewati batas',
      icon: 'utensils'
    },
    {
      id: 'db-2',
      name: 'Tempat tinggal',
      spent: 3000000,
      limit: 3000000,
      percent: 100,
      status: 'reached_limit',
      remainingText: 'Sisa Rp0',
      noteText: 'Seluruh anggaran terpakai',
      icon: 'home'
    },
    {
      id: 'db-3',
      name: 'Transportasi',
      spent: 850000,
      limit: 1200000,
      percent: 70.8,
      status: 'in_budget',
      remainingText: 'Sisa Rp350.000',
      noteText: 'Belum melewati batas',
      icon: 'car'
    },
    {
      id: 'db-4',
      name: 'Belanja',
      spent: 900000,
      limit: 1500000,
      percent: 60,
      status: 'in_budget',
      remainingText: 'Sisa Rp600.000',
      noteText: 'Belum melewati batas',
      icon: 'bag'
    },
    {
      id: 'db-5',
      name: 'Lainnya',
      spent: 500000,
      limit: 800000,
      percent: 62.5,
      status: 'in_budget',
      remainingText: 'Sisa Rp300.000',
      noteText: 'Belum melewati batas',
      icon: 'more'
    }
  ];

  const getCategoryIcon = (icon) => {
    switch (icon) {
      case 'utensils': return <Utensils size={16} stroke="#4a5c52" strokeWidth={2} />;
      case 'home': return <Home size={16} stroke="#4a5c52" strokeWidth={2} />;
      case 'car': return <Car size={16} stroke="#4a5c52" strokeWidth={2} />;
      case 'bag': return <ShoppingBag size={16} stroke="#4a5c52" strokeWidth={2} />;
      default: return <MoreHorizontal size={16} stroke="#4a5c52" strokeWidth={2} />;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Mobile Plan Nav Switcher (Rencana) — Screenshot 2 */}
      <div className="mobile-plan-nav mobile-only">
        <span className="plan-nav-title">Rencana</span>
        <div className="plan-nav-grid">
          <button className="plan-nav-card active" type="button">
            <PieChart size={24} stroke="#134e3f" strokeWidth={2} />
            <span>Anggaran</span>
          </button>
          <button 
            className="plan-nav-card" 
            type="button"
            onClick={() => onSwitchTab && onSwitchTab('target-tabungan')}
          >
            <Target size={24} stroke="#6b7280" strokeWidth={2} />
            <span>Target tabungan</span>
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Anggaran</h1>
          <p className="page-subtitle">Atur batas pengeluaran agar kebutuhan dan rencana tetap seimbang.</p>
        </div>

        <div className="page-actions">
          <button className="btn-period-select">
            <Calendar size={16} strokeWidth={2} />
            <span>{currentPeriod}</span>
          </button>
          <button className="btn-primary-action btn-add-tx-desktop" onClick={onOpenAddBudget}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah anggaran</span>
          </button>
        </div>

        {/* Mobile full-width CTA */}
        <button className="btn-catat-mobile mobile-only" onClick={onOpenAddBudget}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah anggaran</span>
        </button>
      </div>

      {/* Top 3 Cards */}
      <section className="metrics-grid">
        {/* Card 1: Total Anggaran */}
        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Total anggaran</span>
            <div className="metric-icon-wrap">
              <PieChart size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="metric-value-huge">Rp9.000.000</div>
          <div className="metric-trend trend-positive-tint">
            <span>5 kategori · September 2026</span>
          </div>
        </div>

        {/* Card 2: Sudah Digunakan */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Sudah digunakan</span>
            <div className="metric-icon-wrap-light">
              <ArrowUpRight size={17} stroke="#059669" strokeWidth={2.4} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp7.350.000</div>
          <div className="metric-trend text-muted-sub">
            <span>81,7% dari total anggaran bulan ini</span>
          </div>
        </div>

        {/* Card 3: Sisa Anggaran */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Sisa anggaran</span>
            <div className="metric-icon-wrap-light">
              <Wallet size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp1.650.000</div>
          <div className="metric-trend text-muted-sub">
            <span>18,3% anggaran belum digunakan</span>
          </div>
        </div>
      </section>

      {/* Split Grid: Left Details & Right Sidebars */}
      <section className="dashboard-split-grid bottom-grid">
        {/* Left Column: Anggaran Per Kategori */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Anggaran per kategori</h2>
              <p className="card-subtitle">Pengeluaran 1–30 September 2026</p>
            </div>
            <button className="btn-outline-sm" onClick={onOpenManageBudget}>
              <Edit3 size={13} strokeWidth={2} />
              <span>Edit anggaran</span>
            </button>
          </div>

          <div className="detailed-budget-list">
            {detailedBudgets.map((item) => {
              const isLimit = item.status === 'reached_limit';
              return (
                <div key={item.id} className="detailed-budget-card">
                  <div className="detail-budget-header">
                    <div className="detail-budget-left">
                      <div className="cat-icon-wrap">
                        {getCategoryIcon(item.icon)}
                      </div>
                      <span className="cat-title">{item.name}</span>
                    </div>
                    <div className="detail-budget-right">
                      <span className={`status-pill ${isLimit ? 'pill-amber' : 'pill-green'}`}>
                        {isLimit ? 'Batas tercapai' : 'Dalam anggaran'}
                      </span>
                      <button 
                        className="btn-icon-ghost"
                        onClick={onOpenManageBudget}
                        aria-label="Edit"
                      >
                        <Edit3 size={14} stroke="#8c9e94" />
                      </button>
                    </div>
                  </div>

                  <div className="detail-budget-amounts">
                    <span className="detail-spent">
                      {formatSimpleIDR(item.spent)} / {formatSimpleIDR(item.limit)}
                    </span>
                    <span className="detail-percent">{item.percent}%</span>
                  </div>

                  <div className="progress-track" style={{ height: '7px' }}>
                    <div 
                      className={`progress-bar ${isLimit ? 'bar-amber' : 'bar-green'}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>

                  <div className="detail-budget-footer">
                    <span className="detail-remaining">{item.remainingText}</span>
                    <span className="detail-note">{item.noteText}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="budget-footnote">
            <Info size={14} stroke="#8c9e94" />
            <span>Anggaran dihitung dari transaksi pengeluaran. Transfer antar dompet dan alokasi tabungan tidak termasuk.</span>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="budget-right-stack">
          {/* Card: Pemakaian Bulan Ini */}
          <div className="dashboard-card">
            <h2 className="card-title">Pemakaian bulan ini</h2>
            <p className="card-subtitle">Rp7.350.000 dari Rp9.000.000</p>
            <div className="big-stat-number">{usedPercent}%</div>
            <div className="progress-track" style={{ height: '8px', margin: '14px 0 16px' }}>
              <div className="progress-bar bar-green" style={{ width: `${usedPercent}%` }} />
            </div>
            <p className="widget-desc">
              Pengeluaran masih sesuai rencana. Kamu menyisakan Rp1.650.000 bulan ini.
            </p>
          </div>

          {/* Warning Card: Tempat Tinggal Mencapai Batas */}
          <div className="alert-card-warning">
            <div className="alert-card-top">
              <AlertCircle size={18} stroke="#d97706" strokeWidth={2.2} />
              <h3 className="alert-title">Tempat tinggal mencapai batas</h3>
            </div>
            <p className="alert-desc">
              Rp3.000.000 dari Rp3.000.000 sudah digunakan. Tinjau batas kategori ini sebelum mencatat pengeluaran tambahan.
            </p>
            <button className="alert-link" onClick={onOpenManageBudget}>
              <span>Tinjau anggaran</span>
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Card: Siapkan Bulan Berikutnya */}
          <div className="dashboard-card">
            <h2 className="card-title">Siapkan bulan berikutnya</h2>
            <p className="widget-desc" style={{ marginTop: '8px', marginBottom: '16px' }}>
              Gunakan alokasi September sebagai awal rencana Oktober. Kamu tetap bisa menyesuaikan setiap kategori.
            </p>
            <button 
              className="btn-outline-action"
              onClick={() => addToast('Alokasi anggaran disalin ke Oktober 2026')}
            >
              <Copy size={15} strokeWidth={2} />
              <span>Salin ke Oktober</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

