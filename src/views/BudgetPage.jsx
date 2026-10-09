'use client';

import React from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowRight,
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
import PeriodSelector from '../components/PeriodSelector';

const DEFAULT_BUDGETS = [
  { id: 'b1', name: 'Makan & minum', spent: 2100000, limit: 2500000, color: 'green' },
  { id: 'b2', name: 'Tempat tinggal', spent: 3000000, limit: 3000000, color: 'amber' },
  { id: 'b3', name: 'Transportasi', spent: 850000, limit: 1200000, color: 'green' },
  { id: 'b4', name: 'Belanja', spent: 900000, limit: 1500000, color: 'green' },
  { id: 'b5', name: 'Lainnya', spent: 500000, limit: 800000, color: 'green' },
];

export default function BudgetPage({
  currentPeriod,
  onSelectPeriod,
  budgets = [],
  onOpenManageBudget,
  onOpenAddBudget,
  onSwitchTab,
  addToast
}) {
  const budgetList = budgets && budgets.length > 0 ? budgets : DEFAULT_BUDGETS;

  const totalBudget = budgetList.reduce((sum, b) => sum + (Number(b.limit) || 0), 0);
  const usedBudget = budgetList.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
  const remainingBudget = Math.max(0, totalBudget - usedBudget);
  const usedPercent = totalBudget > 0 ? ((usedBudget / totalBudget) * 100).toFixed(1).replace('.', ',') : '0';
  const remainingPercent = totalBudget > 0 ? ((remainingBudget / totalBudget) * 100).toFixed(1).replace('.', ',') : '0';

  const overLimitBudgets = budgetList.filter((b) => Number(b.spent || 0) >= Number(b.limit || 0));

  const getCategoryIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('makan') || n.includes('minum')) return <Utensils size={16} stroke="#4a5c52" strokeWidth={2} />;
    if (n.includes('tinggal') || n.includes('rumah')) return <Home size={16} stroke="#4a5c52" strokeWidth={2} />;
    if (n.includes('trans') || n.includes('bensin')) return <Car size={16} stroke="#4a5c52" strokeWidth={2} />;
    if (n.includes('belanja')) return <ShoppingBag size={16} stroke="#4a5c52" strokeWidth={2} />;
    return <MoreHorizontal size={16} stroke="#4a5c52" strokeWidth={2} />;
  };

  return (
    <div className="page-wrapper">
      {/* Mobile Plan Nav Switcher (Rencana) */}
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

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Anggaran</h1>
          <p className="page-subtitle">Kendalikan pengeluaran bulananmu sebelum terjadi.</p>
        </div>

        <div className="page-actions">
          <PeriodSelector
            currentPeriod={currentPeriod}
            onSelectPeriod={onSelectPeriod}
          />
          <button className="btn-primary-action btn-add-tx-desktop" onClick={onOpenManageBudget}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Kelola anggaran</span>
          </button>
        </div>

        {/* Mobile full-width CTA */}
        <button className="btn-catat-mobile mobile-only" onClick={onOpenManageBudget}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Kelola anggaran</span>
        </button>
      </div>

      {/* Top 3 Cards Dinamis */}
      <section className="metrics-grid">
        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Total anggaran</span>
            <div className="metric-icon-wrap">
              <PieChart size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="metric-value-huge">{formatSimpleIDR(totalBudget)}</div>
          <div className="metric-trend trend-positive-tint">
            <span>Batas belanja untuk {currentPeriod}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Terpakai sejauh ini</span>
            <div className="metric-icon-wrap-light">
              <ArrowUpRight size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">{formatSimpleIDR(usedBudget)}</div>
          <div className="metric-trend text-muted-sub">
            <span>{usedPercent}% dari total anggaran terpakai</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Sisa anggaran</span>
            <div className="metric-icon-wrap-light">
              <Wallet size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">{formatSimpleIDR(remainingBudget)}</div>
          <div className="metric-trend text-muted-sub">
            <span>{remainingPercent}% anggaran belum digunakan</span>
          </div>
        </div>
      </section>

      {/* Split Grid: Left Details & Right Sidebars */}
      <section className="dashboard-split-grid bottom-grid">
        {/* Left Column: Anggaran Per Kategori */}
        <div className="budget-left-column">
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Anggaran per kategori</h2>
                <p className="card-subtitle">Pengeluaran untuk {currentPeriod}</p>
              </div>
              <button className="btn-outline-sm" onClick={onOpenManageBudget}>
                <Edit3 size={13} strokeWidth={2} />
                <span>Edit anggaran</span>
              </button>
            </div>

            <div className="detailed-budget-list">
              {budgetList.map((item) => {
                const limit = Number(item.limit) || 0;
                const spent = Number(item.spent) || 0;
                const ratio = limit > 0 ? (spent / limit) * 100 : 0;
                const percent = Math.min(100, Math.round(ratio));
                const isLimit = spent >= limit;
                const remaining = Math.max(0, limit - spent);

                return (
                  <div key={item.id} className="detailed-budget-card">
                    <div className="detail-budget-header">
                      <div className="detail-budget-left">
                        <div className="cat-icon-wrap">
                          {getCategoryIcon(item.name)}
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
                        {formatSimpleIDR(spent)} / {formatSimpleIDR(limit)}
                      </span>
                      <span className="detail-percent">{percent}%</span>
                    </div>

                    <div className="progress-track" style={{ height: '7px' }}>
                      <div 
                        className={`progress-bar ${isLimit ? 'bar-amber' : 'bar-green'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="detail-budget-footer">
                      <span className="detail-remaining">
                        {isLimit ? 'Batas habis' : `Sisa ${formatSimpleIDR(remaining)}`}
                      </span>
                      <span className="detail-note">
                        {isLimit ? 'Seluruh anggaran terpakai' : 'Belum melewati batas'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
            <p className="card-subtitle">{formatSimpleIDR(usedBudget)} dari {formatSimpleIDR(totalBudget)}</p>
            <div className="big-stat-number">{usedPercent}%</div>
            <div className="progress-track" style={{ height: '8px', margin: '14px 0 16px' }}>
              <div 
                className={`progress-bar ${usedBudget >= totalBudget ? 'bar-amber' : 'bar-green'}`} 
                style={{ width: `${Math.min(100, totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0)}%` }} 
              />
            </div>
            <p className="widget-desc">
              {remainingBudget > 0
                ? `Pengeluaran masih sesuai rencana. Kamu menyisakan ${formatSimpleIDR(remainingBudget)} bulan ini.`
                : 'Pengeluaran telah mencapai batas total anggaran.'}
            </p>
          </div>

          {/* Warning Card jika ada yang capai batas, jika tidak tip card */}
          {overLimitBudgets.length > 0 ? (
            <div className="alert-card-warning">
              <div className="alert-card-top">
                <AlertCircle size={18} stroke="#d97706" strokeWidth={2.2} />
                <h3 className="alert-title">{overLimitBudgets[0].name} mencapai batas</h3>
              </div>
              <p className="alert-desc">
                {formatSimpleIDR(overLimitBudgets[0].spent)} dari {formatSimpleIDR(overLimitBudgets[0].limit)} sudah digunakan. Tinjau batas kategori ini sebelum mencatat pengeluaran tambahan.
              </p>
              <button className="alert-link" onClick={onOpenManageBudget}>
                <span>Tinjau anggaran</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="tip-card tip-card-clean" style={{ padding: '20px' }}>
              <div className="tip-header-row">
                <AlertCircle size={20} stroke="#059669" strokeWidth={2.2} />
                <h3 className="tip-title-clean">Semua kategori aman</h3>
              </div>
              <p className="tip-desc-clean" style={{ margin: '8px 0 12px' }}>
                Seluruh pos pengeluaran masih berada dalam batas anggaran yang ditentukan.
              </p>
              <button className="card-action-link" onClick={onOpenManageBudget}>
                <span>Kelola anggaran</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* Card: Siapkan Bulan Berikutnya */}
          <div className="dashboard-card">
            <h2 className="card-title">Siapkan bulan berikutnya</h2>
            <p className="widget-desc" style={{ marginTop: '8px', marginBottom: '16px' }}>
              Gunakan alokasi {currentPeriod} sebagai awal rencana berikutnya. Kamu tetap bisa menyesuaikan setiap kategori.
            </p>
            <button 
              className="btn-outline-action"
              onClick={() => {
                onOpenManageBudget();
                addToast('Membuka penyesuaian anggaran');
              }}
            >
              <Copy size={15} strokeWidth={2} />
              <span>Kelola pos anggaran</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
