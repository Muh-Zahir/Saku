'use client';

import React from 'react';
import {
  Calendar,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Home,
  Clock,
  FileText
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function ReportsPage({ currentPeriod, addToast }) {
  const categoryDist = [
    { name: 'Makan & minum', amount: 2100000, percent: '28,6%', dotColor: '#059669' },
    { name: 'Tempat tinggal', amount: 3000000, percent: '40,8%', dotColor: '#134e3f' },
    { name: 'Transportasi', amount: 850000, percent: '11,6%', dotColor: '#2dd4bf' },
    { name: 'Belanja', amount: 900000, percent: '12,2%', dotColor: '#34d399' },
    { name: 'Lainnya', amount: 500000, percent: '6,8%', dotColor: '#a7f3d0' }
  ];

  const weeklyBreakdown = [
    { period: '1–7 Sep 2026', income: 500000, expense: 3500000, net: -3000000 },
    { period: '8–14 Sep 2026', income: 0, expense: 1100000, net: -1100000 },
    { period: '15–21 Sep 2026', income: 0, expense: 1250000, net: -1250000 },
    { period: '22–30 Sep 2026', income: 12000000, expense: 1500000, net: 10500000 }
  ];

  const chartWeeks = [
    { label: '1–7 Sep', income: 500000, expense: 3500000 },
    { label: '8–14 Sep', income: 0, expense: 1100000 },
    { label: '15–21 Sep', income: 0, expense: 1250000 },
    { label: '22–30 Sep', income: 12000000, expense: 1500000 }
  ];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Laporan</h1>
          <p className="page-subtitle">Pahami pola keuanganmu dan ambil langkah berikutnya dengan lebih yakin.</p>
        </div>

        <div className="page-actions">
          <button className="btn-period-select">
            <Calendar size={16} strokeWidth={2} />
            <span>{currentPeriod}</span>
          </button>
          <button 
            className="btn-primary-action btn-add-tx-desktop" 
            onClick={() => addToast('Mengunduh paket laporan bulanan (PDF & CSV)...')}
          >
            <Download size={16} strokeWidth={2.2} />
            <span>Ekspor laporan</span>
          </button>
        </div>

        {/* Mobile full-width CTA */}
        <button className="btn-catat-mobile mobile-only" onClick={() => addToast('Mengunduh paket laporan bulanan (PDF & CSV)...')}>
          <Download size={18} strokeWidth={2.2} />
          <span>Ekspor laporan</span>
        </button>
      </div>

      {/* Top 3 Cards */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total pemasukan</span>
            <div className="metric-icon-wrap-light">
              <ArrowDownLeft size={17} stroke="#059669" strokeWidth={2.4} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp12.500.000</div>
          <div className="metric-trend text-muted-sub">
            <span>Gaji Rp12.000.000 · Freelance Rp500.000</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total pengeluaran</span>
            <div className="metric-icon-wrap-light">
              <ArrowUpRight size={17} stroke="#059669" strokeWidth={2.4} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp7.350.000</div>
          <div className="metric-trend text-muted-sub">
            <span>58,8% dari pemasukan September</span>
          </div>
        </div>

        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Arus kas bersih</span>
            <div className="metric-icon-wrap">
              <TrendingUp size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="metric-value-huge">+Rp5.150.000</div>
          <div className="metric-trend trend-positive-tint">
            <span>Rasio tabungan bulan ini: 41,2%</span>
          </div>
        </div>
      </section>

      {/* Middle Split Grid: Arus Kas & Pengeluaran Per Kategori */}
      <section className="dashboard-split-grid">
        {/* Left: Arus Kas September Bar Chart */}
        <div className="dashboard-card card-cashflow">
          <div className="card-header">
            <div>
              <h2 className="card-title">Arus kas September</h2>
              <p className="card-subtitle">Pemasukan dan pengeluaran sepanjang bulan</p>
            </div>
            <div className="segmented-control">
              <span className="seg-btn active">Mingguan</span>
            </div>
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot dot-income"></span>
              <span>Pemasukan</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-expense"></span>
              <span>Pengeluaran</span>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-y-axis">
              <span>12 jt</span>
              <span>8 jt</span>
              <span>4 jt</span>
              <span>0</span>
            </div>
            <div className="chart-canvas-area">
              {chartWeeks.map((item, index) => {
                const incomeH = Math.min(100, Math.max(3, (item.income / 12000000) * 100));
                const expenseH = Math.min(100, Math.max(3, (item.expense / 12000000) * 100));
                return (
                  <div key={index} className="chart-bar-group">
                    <div className="bars-pair">
                      <div className="bar-col income" style={{ height: `${incomeH}%` }} />
                      <div className="bar-col expense" style={{ height: `${expenseH}%` }} />
                    </div>
                    <span className="bar-x-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-footer-cashflow">
            <span className="footer-label">Surplus September 2026</span>
            <span className="footer-val-positive">+Rp5.150.000</span>
          </div>
        </div>

        {/* Right: Pengeluaran Per Kategori Donut */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pengeluaran per kategori</h2>
              <p className="card-subtitle">Distribusi Rp7.350.000 bulan ini</p>
            </div>
          </div>

          {/* Donut Chart Visual */}
          <div className="donut-section-wrapper">
            <div className="donut-chart-container">
              <svg width="120" height="120" viewBox="0 0 42 42" className="donut-svg">
                <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f2" strokeWidth="6" />
                {/* Tempat tinggal 40.8% */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#134e3f" strokeWidth="6" strokeDasharray="40.8 59.2" strokeDashoffset="25" />
                {/* Makan & minum 28.6% */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#059669" strokeWidth="6" strokeDasharray="28.6 71.4" strokeDashoffset="-15.8" />
                {/* Belanja 12.2% */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#34d399" strokeWidth="6" strokeDasharray="12.2 87.8" strokeDashoffset="-44.4" />
                {/* Transportasi 11.6% */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#2dd4bf" strokeWidth="6" strokeDasharray="11.6 88.4" strokeDashoffset="-56.6" />
                {/* Lainnya 6.8% */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#a7f3d0" strokeWidth="6" strokeDasharray="6.8 93.2" strokeDashoffset="-68.2" />
              </svg>
              <div className="donut-center-label">
                <span className="donut-count">5</span>
                <span className="donut-sub">kategori</span>
              </div>
            </div>

            <div className="donut-leader-card">
              <span className="leader-hint">Pengeluaran terbesar</span>
              <h4 className="leader-name">Tempat tinggal</h4>
              <span className="leader-val">40,8%</span>
            </div>
          </div>

          <div className="category-breakdown-list">
            {categoryDist.map((c, i) => (
              <div key={i} className="cat-breakdown-row">
                <div className="cat-breakdown-name">
                  <span className="legend-dot" style={{ backgroundColor: c.dotColor }} />
                  <span>{c.name}</span>
                </div>
                <div className="cat-breakdown-nums">
                  <span className="cat-amount">{formatSimpleIDR(c.amount)}</span>
                  <span className="cat-pct">{c.percent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Insight Cards in a Row */}
      <div className="insights-grid-3">
        <div className="insight-card">
          <div className="insight-icon-box">
            <TrendingUp size={18} stroke="#059669" strokeWidth={2.2} />
          </div>
          <h4 className="insight-title">Arus kas tetap positif</h4>
          <p className="insight-desc">
            41,2% pemasukan tersimpan. Seluruh surplus Rp5.150.000 telah dialokasikan ke target tabungan.
          </p>
        </div>

        <div className="insight-card">
          <div className="insight-icon-box">
            <Home size={18} stroke="#059669" strokeWidth={2.2} />
          </div>
          <h4 className="insight-title">Biaya tempat tinggal dominan</h4>
          <p className="insight-desc">
            Rp3.000.000 atau 40,8% pengeluaran. Anggaran kategori ini sudah mencapai batas 100%.
          </p>
        </div>

        <div className="insight-card">
          <div className="insight-icon-box">
            <Clock size={18} stroke="#059669" strokeWidth={2.2} />
          </div>
          <h4 className="insight-title">Pengeluaran di bawah anggaran</h4>
          <p className="insight-desc">
            Kamu menggunakan 81,7% anggaran. Sisa Rp1.650.000 memberi ruang untuk bulan berikutnya.
          </p>
        </div>
      </div>

      {/* Bottom Table: Rincian Arus Kas Mingguan */}
      <div className="dashboard-card bottom-grid">
        <div className="card-header">
          <div>
            <h2 className="card-title">Rincian arus kas mingguan</h2>
          </div>
          <div className="page-actions" style={{ gap: '8px' }}>
            <button className="btn-outline-sm" onClick={() => addToast('Mengunduh rincian PDF...')}>
              <FileText size={14} />
              <span>Unduh PDF</span>
            </button>
            <button className="btn-outline-sm" onClick={() => addToast('Mengunduh spreadsheet CSV...')}>
              <Download size={14} />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '28%' }}>PERIODE</th>
                <th scope="col" style={{ width: '24%' }}>PEMASUKAN</th>
                <th scope="col" style={{ width: '24%' }}>PENGELUARAN</th>
                <th scope="col" style={{ width: '24%', textAlign: 'right' }}>ARUS KAS BERSIH</th>
              </tr>
            </thead>
            <tbody>
              {weeklyBreakdown.map((row, idx) => (
                <tr key={idx}>
                  <td><span className="tx-title" style={{ fontSize: '13px' }}>{row.period}</span></td>
                  <td><span className="tx-wallet-text">{formatSimpleIDR(row.income)}</span></td>
                  <td><span className="tx-wallet-text">{formatSimpleIDR(row.expense)}</span></td>
                  <td className={`tx-amount-col ${row.net >= 0 ? 'tx-income' : 'tx-expense'}`}>
                    {row.net >= 0 ? '+' : '-'}{formatSimpleIDR(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

