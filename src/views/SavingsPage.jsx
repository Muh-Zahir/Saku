'use client';

import React from 'react';
import {
  Calendar,
  Plus,
  Target,
  PieChart,
  Flag,
  ArrowDownLeft,
  ShieldCheck,
  Plane,
  Laptop,
  MoreHorizontal,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function SavingsPage({
  currentPeriod,
  savings,
  onOpenAddGoal,
  onDeposit,
  onSwitchTab,
  addToast
}) {
  const contributions = [
    { id: 'c-1', target: 'Dana darurat', date: '25 Sep 2026', source: 'BCA', amount: 3000000 },
    { id: 'c-2', target: 'Liburan ke Jepang', date: '25 Sep 2026', source: 'BCA', amount: 1250000 },
    { id: 'c-3', target: 'Laptop baru', date: '25 Sep 2026', source: 'BCA', amount: 900000 }
  ];

  const getGoalIcon = (type) => {
    switch (type) {
      case 'shield': return <ShieldCheck size={24} stroke="#059669" strokeWidth={2.2} />;
      case 'plane': return <Plane size={24} stroke="#059669" strokeWidth={2.2} />;
      default: return (
        <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
          <rect x="5.5" y="2" width="33" height="22" rx="2.5" stroke="#1f2937" strokeWidth="1.8" fill="#d1fae5" />
          <path d="M1 26.5h42a1.5 1.5 0 011.5 1.5v0.5a1 1 0 01-1 1H0.5a1 1 0 01-1-1v-0.5A1.5 1.5 0 011 26.5z" fill="#1f2937" />
        </svg>
      );
    }
  };

  return (
    <div className="page-wrapper">
      {/* Mobile Plan Nav Switcher (Rencana) — Screenshot 2 */}
      <div className="mobile-plan-nav mobile-only">
        <span className="plan-nav-title">Rencana</span>
        <div className="plan-nav-grid">
          <button 
            className="plan-nav-card" 
            type="button"
            onClick={() => onSwitchTab && onSwitchTab('anggaran')}
          >
            <PieChart size={24} stroke="#6b7280" strokeWidth={2} />
            <span>Anggaran</span>
          </button>
          <button className="plan-nav-card active" type="button">
            <Target size={24} stroke="#134e3f" strokeWidth={2} />
            <span>Target tabungan</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Target tabungan</h1>
          <p className="page-subtitle">Wujudkan rencana besarmu, satu setoran setiap waktu.</p>
        </div>

        <div className="page-actions">
          <button className="btn-period-select">
            <Calendar size={16} strokeWidth={2} />
            <span>{currentPeriod}</span>
          </button>
          <button className="btn-primary-action btn-add-tx-desktop" onClick={onOpenAddGoal}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah target</span>
          </button>
        </div>

        {/* Mobile full-width CTA */}
        <button className="btn-catat-mobile mobile-only" onClick={onOpenAddGoal}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah target</span>
        </button>
      </div>

      {/* Top 3 Cards */}
      <section className="metrics-grid">
        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Total terkumpul</span>
            <div className="metric-icon-wrap">
              <Target size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="metric-value-huge">Rp24.850.000</div>
          <div className="metric-trend trend-positive-tint">
            <span>59,2% dari total target Rp42.000.000</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Sisa menuju semua target</span>
            <div className="metric-icon-wrap-light">
              <Flag size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp17.150.000</div>
          <div className="metric-trend text-muted-sub">
            <span>3 target aktif · Tidak ada target selesai</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Setoran September</span>
            <div className="metric-icon-wrap-light">
              <ArrowDownLeft size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp5.150.000</div>
          <div className="metric-trend text-muted-sub">
            <span>Dialokasikan dari surplus bulan ini</span>
          </div>
        </div>
      </section>

      {/* 3 Large Goal Cards in a Row */}
      <div className="savings-cards-grid-3">
        {savings.map((goal) => {
          const ratio = (goal.current / goal.target) * 100;
          const percentStr = ratio.toFixed(goal.type === 'laptop' ? 1 : 0).replace('.', ',');
          const remaining = goal.target - goal.current;

          return (
            <div key={goal.id} className="goal-detail-card">
              <div className="goal-card-top">
                <div className={`goal-illustration-box ${goal.type === 'laptop' ? 'goal-illustration-laptop' : ''}`}>
                  {getGoalIcon(goal.type)}
                </div>
                <button 
                  className="btn-icon-ghost"
                  onClick={() => addToast(`Opsi target: ${goal.name}`)}
                >
                  <MoreHorizontal size={18} stroke="#8c9e94" />
                </button>
              </div>

              <div className="goal-card-content">
                <h3 className="goal-name">{goal.name}</h3>
                <div className="goal-date-badge">
                  <Calendar size={13} stroke="#8c9e94" />
                  <span>{goal.targetDate}</span>
                </div>

                <div className="goal-current-val">{formatSimpleIDR(goal.current)}</div>
                <div className="goal-target-val">dari {formatSimpleIDR(goal.target)}</div>

                <div className="progress-track" style={{ height: '7px', margin: '14px 0 10px' }}>
                  <div className="progress-bar bar-green" style={{ width: `${ratio}%` }} />
                </div>

                <div className="goal-progress-footer">
                  <span className="goal-percent-text">{percentStr}% tercapai</span>
                  <span className="goal-remaining-text">Sisa {formatSimpleIDR(remaining)}</span>
                </div>

                <button 
                  className="btn-deposit-action"
                  onClick={() => addToast(`Form setoran untuk ${goal.name} dibuka`)}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Tambah setoran</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Split Grid: Contributions & Policy Note */}
      <section className="dashboard-split-grid bottom-grid">
        {/* Left: Riwayat Kontribusi */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Riwayat kontribusi</h2>
              <p className="card-subtitle">Alokasi tabungan pada September 2026</p>
            </div>
            <button className="btn-outline-sm" onClick={() => addToast('Membuka riwayat alokasi lengkap')}>
              Lihat riwayat
            </button>
          </div>

          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '40%' }}>TARGET</th>
                  <th scope="col" style={{ width: '25%' }}>TANGGAL</th>
                  <th scope="col" style={{ width: '15%' }}>SUMBER</th>
                  <th scope="col" style={{ width: '20%', textAlign: 'right' }}>KONTRIBUSI</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td><span className="tx-title" style={{ fontSize: '13px' }}>{c.target}</span></td>
                    <td><span className="tx-date" style={{ fontSize: '12px' }}>{c.date}</span></td>
                    <td><span className="tx-wallet-text">{c.source}</span></td>
                    <td className="tx-amount-col tx-income">+{formatSimpleIDR(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Policy Info Card */}
        <div className="tip-card tip-card-clean" style={{ alignSelf: 'flex-start', padding: '22px' }}>
          <div className="tip-header-row">
            <Lightbulb size={20} stroke="#059669" strokeWidth={2.2} />
            <h3 className="tip-title-clean">Tabunganmu tetap bagian dari saldo.</h3>
          </div>
          <p className="tip-desc-clean" style={{ margin: '10px 0 16px', lineHeight: 1.55 }}>
            Rp24.850.000 pada target ini adalah alokasi saldo dompet, bukan uang tambahan. Setoran ke target tidak dihitung sebagai pengeluaran.
          </p>
          <div className="unallocated-badge">
            Saldo belum dialokasikan: <strong>Rp0</strong>
          </div>
          <button 
            className="card-action-link" 
            style={{ marginTop: '16px' }}
            onClick={() => addToast('Membuka pengaturan alokasi tabungan')}
          >
            <span>Kelola alokasi tabungan</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </section>
    </div>
  );
}

