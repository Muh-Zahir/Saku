'use client';

import React from 'react';
import {
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Home,
  Clock,
  FileText
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';
import PeriodSelector from '../components/PeriodSelector';

export default function ReportsPage({
  currentPeriod,
  onSelectPeriod,
  addToast,
  metrics = {},
  transactions = [],
  budgets = []
}) {
  const txIncome = transactions
    .filter(t => t.type === 'income' || Number(t.amount) > 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const txExpense = transactions
    .filter(t => t.type === 'expense' || Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const totalIncome = metrics && metrics.pemasukan !== undefined ? Number(metrics.pemasukan) : txIncome;
  const totalExpense = metrics && metrics.pengeluaran !== undefined ? Number(metrics.pengeluaran) : txExpense;
  const netCashflow = totalIncome - totalExpense;

  // Kategori pengeluaran
  const catMap = {};
  transactions.forEach(t => {
    if (t.type === 'expense' || Number(t.amount) < 0) {
      const cat = t.category || 'Lainnya';
      const amt = Math.abs(Number(t.amount) || 0);
      catMap[cat] = (catMap[cat] || 0) + amt;
    }
  });

  if (Object.keys(catMap).length === 0 && budgets.some(b => (b.spent || 0) > 0)) {
    budgets.forEach(b => {
      if ((b.spent || 0) > 0) {
        catMap[b.category] = (catMap[b.category] || 0) + b.spent;
      }
    });
  }

  const palette = ['#059669', '#134e3f', '#2dd4bf', '#34d399', '#a7f3d0', '#6ee7b7', '#047857'];
  const totalCatExpense = Object.values(catMap).reduce((a, b) => a + b, 0) || totalExpense || 0;

  const categoryDist = Object.entries(catMap)
    .map(([name, amount], idx) => {
      const pctNum = totalCatExpense > 0 ? (amount / totalCatExpense) * 100 : 0;
      return {
        name,
        amount,
        pctNum,
        percent: pctNum.toFixed(1).replace('.', ',') + '%',
        dotColor: palette[idx % palette.length]
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const topCategory = categoryDist.length > 0 ? categoryDist[0] : null;

  // Donut SVG dash calculations
  let accumulatedOffset = 25;
  const donutSegments = categoryDist.map(cat => {
    const dashArray = cat.pctNum + ' ' + (100 - cat.pctNum);
    const dashOffset = accumulatedOffset;
    accumulatedOffset -= cat.pctNum;
    return {
      ...cat,
      dashArray,
      dashOffset
    };
  });

  // Rincian mingguan
  const defaultWeeks = [
    { label: '1?7', period: '1?7 ' + (currentPeriod || 'Bulan ini'), income: 0, expense: 0 },
    { label: '8?14', period: '8?14 ' + (currentPeriod || 'Bulan ini'), income: 0, expense: 0 },
    { label: '15?21', period: '15?21 ' + (currentPeriod || 'Bulan ini'), income: 0, expense: 0 },
    { label: '22?31', period: '22?31 ' + (currentPeriod || 'Bulan ini'), income: 0, expense: 0 }
  ];

  transactions.forEach(tx => {
    const amt = Math.abs(Number(tx.amount) || 0);
    const isInc = tx.type === 'income' || Number(tx.amount) > 0;
    let day = 1;
    if (tx.date) {
      const m = String(tx.date).match(/\b(\d{1,2})\b/);
      if (m) day = parseInt(m[1], 10);
    }
    let weekIdx = 0;
    if (day <= 7) weekIdx = 0;
    else if (day <= 14) weekIdx = 1;
    else if (day <= 21) weekIdx = 2;
    else weekIdx = 3;

    if (isInc) defaultWeeks[weekIdx].income += amt;
    else defaultWeeks[weekIdx].expense += amt;
  });

  const weeklyBreakdown = defaultWeeks.map(w => ({
    ...w,
    net: w.income - w.expense
  }));

  const maxChartVal = Math.max(1, ...weeklyBreakdown.map(w => Math.max(w.income, w.expense)));

  const expenseRatioText = totalIncome > 0
    ? ((totalExpense / totalIncome) * 100).toFixed(1).replace('.', ',') + '% dari pemasukan ' + (currentPeriod || 'bulan ini')
    : '0% dari pemasukan';

  const savingsRatioText = totalIncome > 0 && netCashflow > 0
    ? 'Rasio tabungan: ' + ((netCashflow / totalIncome) * 100).toFixed(1).replace('.', ',') + '%'
    : (netCashflow >= 0 ? 'Arus kas seimbang' : 'Defisit kas');

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Laporan</h1>
          <p className="page-subtitle">Pahami pola keuanganmu dan ambil langkah berikutnya dengan lebih yakin.</p>
        </div>

        <div className="page-actions">
          <PeriodSelector
            currentPeriod={currentPeriod}
            onSelectPeriod={onSelectPeriod}
          />
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
          <div className="metric-value-huge text-dark">{formatSimpleIDR(totalIncome)}</div>
          <div className="metric-trend text-muted-sub">
            <span>{totalIncome > 0 ? 'Pemasukan tercatat periode ini' : 'Belum ada pemasukan'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total pengeluaran</span>
            <div className="metric-icon-wrap-light">
              <ArrowUpRight size={17} stroke="#059669" strokeWidth={2.4} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">{formatSimpleIDR(totalExpense)}</div>
          <div className="metric-trend text-muted-sub">
            <span>{expenseRatioText}</span>
          </div>
        </div>

        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Arus kas bersih</span>
            <div className="metric-icon-wrap">
              <TrendingUp size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="metric-value-huge">
            {netCashflow >= 0 ? '+' : '-'}{formatSimpleIDR(Math.abs(netCashflow))}
          </div>
          <div className="metric-trend trend-positive-tint">
            <span>{savingsRatioText}</span>
          </div>
        </div>
      </section>

      {/* Middle Split Grid: Arus Kas & Pengeluaran Per Kategori */}
      <section className="dashboard-split-grid">
        {/* Left: Arus Kas Bar Chart */}
        <div className="dashboard-card card-cashflow">
          <div className="card-header">
            <div>
              <h2 className="card-title">Arus kas mingguan</h2>
              <p className="card-subtitle">Pemasukan vs pengeluaran {currentPeriod || 'bulan ini'}</p>
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
              <span>{maxChartVal > 1 ? formatSimpleIDR(maxChartVal) : 'Rp 0'}</span>
              <span>{maxChartVal > 1 ? formatSimpleIDR(Math.round(maxChartVal * 0.66)) : 'Rp 0'}</span>
              <span>{maxChartVal > 1 ? formatSimpleIDR(Math.round(maxChartVal * 0.33)) : 'Rp 0'}</span>
              <span>0</span>
            </div>
            <div className="chart-canvas-area">
              {weeklyBreakdown.map((item, index) => {
                const incomeH = maxChartVal > 1 && item.income > 0
                  ? Math.min(100, Math.max(4, (item.income / maxChartVal) * 100))
                  : 0;
                const expenseH = maxChartVal > 1 && item.expense > 0
                  ? Math.min(100, Math.max(4, (item.expense / maxChartVal) * 100))
                  : 0;
                return (
                  <div key={index} className="chart-bar-group">
                    <div className="bars-pair">
                      <div className="bar-col income" style={{ height: incomeH + '%' }} />
                      <div className="bar-col expense" style={{ height: expenseH + '%' }} />
                    </div>
                    <span className="bar-x-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-footer-cashflow">
            <span className="footer-label">
              {netCashflow >= 0 ? ('Surplus ' + (currentPeriod || 'Bulan ini')) : ('Defisit ' + (currentPeriod || 'Bulan ini'))}
            </span>
            <span className={netCashflow >= 0 ? 'footer-val-positive' : 'footer-val-negative'}>
              {netCashflow >= 0 ? '+' : '-'}{formatSimpleIDR(Math.abs(netCashflow))}
            </span>
          </div>
        </div>

        {/* Right: Pengeluaran Per Kategori Donut */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pengeluaran per kategori</h2>
              <p className="card-subtitle">Distribusi {formatSimpleIDR(totalExpense)} periode ini</p>
            </div>
          </div>

          {/* Donut Chart Visual */}
          <div className="donut-section-wrapper">
            <div className="donut-chart-container">
              <svg width="120" height="120" viewBox="0 0 42 42" className="donut-svg">
                <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f2" strokeWidth="6" />
                {donutSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    className="donut-segment"
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={seg.dotColor}
                    strokeWidth="6"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                  />
                ))}
              </svg>
              <div className="donut-center-label">
                <span className="donut-count">{categoryDist.length}</span>
                <span className="donut-sub">kategori</span>
              </div>
            </div>

            <div className="donut-leader-card">
              <span className="leader-hint">Pengeluaran terbesar</span>
              <h4 className="leader-name">{topCategory ? topCategory.name : '-'}</h4>
              <span className="leader-val">{topCategory ? topCategory.percent : '0%'}</span>
            </div>
          </div>

          <div className="category-breakdown-list">
            {categoryDist.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '13px' }}>
                Belum ada transaksi pengeluaran tercatat untuk periode ini.
              </p>
            ) : (
              categoryDist.map((c, i) => (
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3 Insight Cards in a Row */}
      <div className="insights-grid-3">
        <div className="insight-card">
          <div className="insight-icon-box">
            <TrendingUp size={18} stroke="#059669" strokeWidth={2.2} />
          </div>
          <h4 className="insight-title">
            {totalIncome === 0 && totalExpense === 0
              ? 'Belum ada transaksi'
              : netCashflow >= 0 ? 'Arus kas surplus' : 'Arus kas defisit'}
          </h4>
          <p className="insight-desc">
            {totalIncome === 0 && totalExpense === 0
              ? 'Mulai catat pemasukan dan pengeluaran harianmu untuk melihat analisis arus kas otomatis.'
              : netCashflow >= 0
                ? ('Surplus ' + formatSimpleIDR(Math.abs(netCashflow)) + ' tercatat pada periode ini.')
                : ('Pengeluaran melebihi pemasukan sebesar ' + formatSimpleIDR(Math.abs(netCashflow)) + '.')}
          </p>
        </div>

        <div className="insight-card">
          <div className="insight-icon-box">
            <Home size={18} stroke="#059669" strokeWidth={2.2} />
          </div>
          <h4 className="insight-title">
            {topCategory ? ('Biaya ' + topCategory.name.toLowerCase() + ' dominan') : 'Kategori pengeluaran'}
          </h4>
          <p className="insight-desc">
            {topCategory
              ? (formatSimpleIDR(topCategory.amount) + ' atau ' + topCategory.percent + ' dari total pengeluaran tercatat.')
              : 'Belum ada data pengeluaran kategori untuk dianalisis.'}
          </p>
        </div>

        <div className="insight-card">
          <div className="insight-icon-box">
            <Clock size={18} stroke="#059669" strokeWidth={2.2} />
          </div>
          <h4 className="insight-title">Status anggaran</h4>
          <p className="insight-desc">
            {budgets.length > 0 && budgets.some(b => b.limit > 0)
              ? ('Kamu memiliki ' + budgets.filter(b => b.limit > 0).length + ' pos anggaran aktif untuk memantau batas belanja.')
              : 'Atur batas anggaran per kategori di menu Anggaran untuk membatasi pengeluaran bulanan.'}
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
                  <td className={'tx-amount-col ' + (row.net >= 0 ? 'tx-income' : 'tx-expense')}>
                    {row.net >= 0 ? '+' : '-'}{formatSimpleIDR(Math.abs(row.net))}
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