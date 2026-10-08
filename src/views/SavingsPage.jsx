'use client';

import React from 'react';
import {
  Calendar,
  ChevronDown,
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
  ArrowRight,
  Trash2
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

const DEFAULT_SAVINGS = [
  { id: 's1', name: 'Dana darurat', targetDate: 'Target Des 2026', current: 15000000, target: 20000000, type: 'shield' },
  { id: 's2', name: 'Liburan ke Jepang', targetDate: 'Target Jun 2027', current: 5500000, target: 10000000, type: 'plane' },
  { id: 's3', name: 'Laptop baru', targetDate: 'Target Mar 2027', current: 4350000, target: 12000000, type: 'laptop' },
];

export default function SavingsPage({
  currentPeriod,
  savings = [],
  onOpenAddGoal,
  onDepositGoal,
  onDeleteGoal,
  onSwitchTab,
  addToast
}) {
  const savingsList = savings && savings.length > 0 ? savings : DEFAULT_SAVINGS;

  const totalCurrent = savingsList.reduce((sum, g) => sum + (Number(g.current) || 0), 0);
  const totalTarget = savingsList.reduce((sum, g) => sum + (Number(g.target) || 0), 0);
  const remainingTarget = Math.max(0, totalTarget - totalCurrent);
  const collectedPercent = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1).replace('.', ',') : '0';
  const activeCount = savingsList.filter((g) => g.current < g.target).length;
  const completedCount = savingsList.filter((g) => g.current >= g.target).length;

  const contributions = [
    { id: 'c-1', target: 'Dana darurat', date: '25 Sep 2026', source: 'BCA', amount: 3000000 },
    { id: 'c-2', target: 'Liburan ke Jepang', date: '25 Sep 2026', source: 'BCA', amount: 1250000 },
    { id: 'c-3', target: 'Laptop baru', date: '25 Sep 2026', source: 'BCA', amount: 900000 },
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

  const handleDepositPrompt = (goal) => {
    const input = prompt(`Masukkan nominal setoran untuk "${goal.name}" (Rp):`, '500000');
    if (!input) return;
    const amount = parseInt(input.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0) {
      alert('Nominal tidak valid!');
      return;
    }
    if (onDepositGoal) {
      onDepositGoal(goal.id, amount);
    } else {
      addToast(`Setoran Rp${amount.toLocaleString('id-ID')} ditambahkan ke ${goal.name}!`);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Mobile Plan Nav Switcher (Rencana) */}
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
            <span className="btn-period-left">
              <Calendar size={16} strokeWidth={2} />
              <span>{currentPeriod}</span>
            </span>
            <ChevronDown size={16} strokeWidth={2} className="btn-period-chevron" />
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

      {/* Top 3 Cards Dinamis */}
      <section className="metrics-grid">
        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Total terkumpul</span>
            <div className="metric-icon-wrap">
              <Target size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="metric-value-huge">{formatSimpleIDR(totalCurrent)}</div>
          <div className="metric-trend trend-positive-tint">
            <span>{collectedPercent}% dari total target {formatSimpleIDR(totalTarget)}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Sisa menuju semua target</span>
            <div className="metric-icon-wrap-light">
              <Flag size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">{formatSimpleIDR(remainingTarget)}</div>
          <div className="metric-trend text-muted-sub">
            <span>{activeCount} target aktif · {completedCount} target tercapai</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Alokasi tabungan</span>
            <div className="metric-icon-wrap-light">
              <ArrowDownLeft size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">{formatSimpleIDR(totalCurrent)}</div>
          <div className="metric-trend text-muted-sub">
            <span>Tersebar di {savingsList.length} pos target aktif</span>
          </div>
        </div>
      </section>

      {/* Large Goal Cards Grid */}
      <div className="savings-cards-grid-3">
        {savingsList.map((goal) => {
          const cur = Number(goal.current) || 0;
          const tgt = Number(goal.target) || 0;
          const ratio = tgt > 0 ? Math.min(100, (cur / tgt) * 100) : 0;
          const percentStr = ratio.toFixed(1).replace('.', ',');
          const remaining = Math.max(0, tgt - cur);

          return (
            <div key={goal.id} className="goal-detail-card">
              <div className="goal-card-top">
                <div className={`goal-illustration-box ${goal.type === 'laptop' ? 'goal-illustration-laptop' : ''}`}>
                  {getGoalIcon(goal.type)}
                </div>
                {onDeleteGoal ? (
                  <button 
                    className="btn-icon-ghost"
                    title={`Hapus target ${goal.name}`}
                    onClick={() => {
                      if (confirm(`Hapus target tabungan "${goal.name}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                  >
                    <Trash2 size={16} stroke="#ef4444" />
                  </button>
                ) : (
                  <button 
                    className="btn-icon-ghost"
                    onClick={() => addToast(`Target: ${goal.name}`)}
                  >
                    <MoreHorizontal size={18} stroke="#8c9e94" />
                  </button>
                )}
              </div>

              <div className="goal-card-content">
                <h3 className="goal-name">{goal.name}</h3>
                <div className="goal-date-badge">
                  <Calendar size={13} stroke="#8c9e94" />
                  <span>{goal.targetDate}</span>
                </div>

                <div className="goal-current-val">{formatSimpleIDR(cur)}</div>
                <div className="goal-target-val">dari {formatSimpleIDR(tgt)}</div>

                <div className="progress-track" style={{ height: '7px', margin: '14px 0 10px' }}>
                  <div className="progress-bar bar-green" style={{ width: `${ratio}%` }} />
                </div>

                <div className="goal-progress-footer">
                  <span className="goal-percent-text">{percentStr}% tercapai</span>
                  <span className="goal-remaining-text">
                    {remaining === 0 ? 'Target tercapai!' : `Sisa ${formatSimpleIDR(remaining)}`}
                  </span>
                </div>

                <button 
                  className="btn-deposit-action"
                  onClick={() => handleDepositPrompt(goal)}
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
              <p className="card-subtitle">Alokasi tabungan pada {currentPeriod}</p>
            </div>
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
            {formatSimpleIDR(totalCurrent)} pada target ini adalah alokasi saldo dompet, bukan uang tambahan. Setoran ke target tabungan disimpan langsung di database Saku.
          </p>
          <div className="unallocated-badge">
            Total target: <strong>{formatSimpleIDR(totalTarget)}</strong>
          </div>
          <button 
            className="card-action-link" 
            style={{ marginTop: '16px' }}
            onClick={onOpenAddGoal}
          >
            <span>Tambah target baru</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </section>
    </div>
  );
}
