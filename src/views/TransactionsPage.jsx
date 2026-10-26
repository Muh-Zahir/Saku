'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Download,
  Search,
  ChevronDown,
  ShoppingBag,
  Fuel,
  Coffee,
  Briefcase,
  Utensils,
  Car,
  Home,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';
import PeriodSelector from '../components/PeriodSelector';

const DEFAULT_FULL_TRANSACTIONS = [];

export default function TransactionsPage({
  transactions = [],
  onDeleteTransaction,
  currentPeriod,
  onSelectPeriod,
  onOpenAddTx,
  addToast
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'income', 'expense'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedWallet, setSelectedWallet] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState([]);

  const rawTxList = transactions || [];
  const pageSize = 10;

  // Filter transaksi khusus untuk periode bulan yang sedang aktif
  const periodTxList = useMemo(() => {
    if (!currentPeriod) return rawTxList;
    return rawTxList.filter((tx) => !tx.period || tx.period === currentPeriod);
  }, [rawTxList, currentPeriod]);

  // Reset pagination saat periode berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [currentPeriod]);

  // Perhitungan dinamis khusus bulan aktif
  const incomeList = periodTxList.filter((tx) => tx.type === 'income');
  const expenseList = periodTxList.filter((tx) => tx.type === 'expense');
  const totalIncome = incomeList.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalExpense = expenseList.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const netCashflow = totalIncome - totalExpense;
  const savingRate = totalIncome > 0
    ? `${((netCashflow / totalIncome) * 100).toFixed(1).replace('.', ',')}%`
    : '0%';

  // Ambil opsi kategori & dompet dari data bulan aktif
  const categoryOptions = useMemo(() => {
    const set = new Set(periodTxList.map((t) => t.category).filter(Boolean));
    return ['Semua', ...Array.from(set)];
  }, [periodTxList]);

  const walletOptions = useMemo(() => {
    const set = new Set(periodTxList.map((t) => t.wallet).filter(Boolean));
    return ['Semua', ...Array.from(set)];
  }, [periodTxList]);

  const filtered = useMemo(() => {
    return periodTxList.filter((tx) => {
      // Tab filter
      if (activeTab === 'income' && tx.type !== 'income') return false;
      if (activeTab === 'expense' && tx.type !== 'expense') return false;

      // Category filter
      if (selectedCategory !== 'Semua' && tx.category !== selectedCategory) return false;

      // Wallet filter
      if (selectedWallet !== 'Semua' && tx.wallet !== selectedWallet) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (tx.title && tx.title.toLowerCase().includes(q)) ||
          (tx.category && tx.category.toLowerCase().includes(q)) ||
          (tx.wallet && tx.wallet.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [periodTxList, activeTab, searchQuery, selectedCategory, selectedWallet]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getIcon = (icon) => {
    switch (icon) {
      case 'shopping-bag': return <ShoppingBag size={17} />;
      case 'fuel': return <Fuel size={17} />;
      case 'coffee': return <Coffee size={17} />;
      case 'briefcase': return <Briefcase size={17} />;
      case 'utensils': return <Utensils size={17} />;
      case 'car': return <Car size={17} />;
      case 'home': return <Home size={17} />;
      case 'refresh': return <RefreshCw size={17} />;
      default: return <ShoppingBag size={17} />;
    }
  };

  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setCheckedIds(paginatedRows.map((r) => r.id));
    } else {
      setCheckedIds([]);
    }
  };

  const handleToggleRow = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (!onDeleteTransaction) return;
    if (confirm(`Yakin ingin menghapus ${checkedIds.length} transaksi terpilih?`)) {
      checkedIds.forEach((id) => onDeleteTransaction(id));
      setCheckedIds([]);
      addToast(`${checkedIds.length} transaksi berhasil dihapus.`);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Judul', 'Tanggal', 'Kategori', 'Dompet', 'Tipe', 'Nominal'];
    const rows = filtered.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.date || '',
      `"${t.category || ''}"`,
      `"${t.wallet || ''}"`,
      t.type,
      t.amount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `transaksi-saku-${(currentPeriod || 'periode').replace(/\s+/g, '-').toLowerCase()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Berhasil mengekspor ${filtered.length} transaksi ke CSV!`);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Setiap pemasukan dan pengeluaran, tercatat dengan rapi.</p>
        </div>

        <div className="page-actions">
          <PeriodSelector
            currentPeriod={currentPeriod}
            onSelectPeriod={onSelectPeriod}
          />
          <button className="btn-primary-action btn-add-tx-desktop" onClick={onOpenAddTx}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah transaksi</span>
          </button>
        </div>

        {/* Mobile full-width CTA */}
        <button className="btn-catat-mobile mobile-only" onClick={onOpenAddTx}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah transaksi</span>
        </button>
      </div>

      {/* Top 3 Cards Dinamis */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Pemasukan bulan ini</span>
            <div className="metric-icon-wrap-light">
              <ArrowDownLeft size={17} stroke="#059669" strokeWidth={2.4} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">{formatSimpleIDR(totalIncome)}</div>
          <div className="metric-trend text-muted-sub">
            <span>{incomeList.length} transaksi pemasukan</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Pengeluaran bulan ini</span>
            <div className="metric-icon-wrap-light">
              <ArrowUpRight size={17} stroke="#059669" strokeWidth={2.4} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">{formatSimpleIDR(totalExpense)}</div>
          <div className="metric-trend text-muted-sub">
            <span>{expenseList.length} transaksi pengeluaran</span>
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
            <span>{savingRate} dari pemasukan berhasil disimpan</span>
          </div>
        </div>
      </section>

      {/* Main Riwayat Transaksi Card */}
      <div className="dashboard-card bottom-grid">
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <div>
            <h2 className="card-title">Riwayat transaksi</h2>
            <p className="card-subtitle">{periodTxList.length} transaksi tercatat pada {currentPeriod}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {checkedIds.length > 0 && onDeleteTransaction && (
              <button
                className="btn-outline-sm"
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
                onClick={handleDeleteSelected}
              >
                <Trash2 size={14} />
                <span>Hapus ({checkedIds.length})</span>
              </button>
            )}
            <button 
              className="btn-outline-sm"
              onClick={handleExportCSV}
            >
              <Download size={14} />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Filter: Semua, Pemasukan, Pengeluaran */}
        <div className="tx-filter-tabs">
          <button
            className={`tx-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          >
            Semua transaksi ({periodTxList.length})
          </button>
          <button
            className={`tx-tab-btn ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => { setActiveTab('income'); setCurrentPage(1); }}
          >
            Pemasukan ({incomeList.length})
          </button>
          <button
            className={`tx-tab-btn ${activeTab === 'expense' ? 'active' : ''}`}
            onClick={() => { setActiveTab('expense'); setCurrentPage(1); }}
          >
            Pengeluaran ({expenseList.length})
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="tx-toolbar-row">
          <div className="tx-search-box">
            <Search size={16} stroke="#8c9e94" />
            <input
              type="text"
              className="tx-search-input"
              placeholder="Cari nama atau catatan transaksi..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="tx-filter-group">
            <select
              className="tx-select-pill"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Semua' ? 'Semua kategori' : cat}
                </option>
              ))}
            </select>

            <select
              className="tx-select-pill"
              value={selectedWallet}
              onChange={(e) => { setSelectedWallet(e.target.value); setCurrentPage(1); }}
            >
              {walletOptions.map((wal) => (
                <option key={wal} value={wal}>
                  {wal === 'Semua' ? 'Semua dompet' : wal}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="table-responsive desktop-only">
          <table className="transactions-table">
            <thead>
              <tr>
                <th scope="col" className="th-checkbox">
                  <input
                    type="checkbox"
                    checked={paginatedRows.length > 0 && checkedIds.length === paginatedRows.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th scope="col" className="th-tx">TRANSAKSI</th>
                <th scope="col" className="th-cat">KATEGORI</th>
                <th scope="col" className="th-wallet">DOMPET</th>
                <th scope="col" className="th-amount">JUMLAH</th>
                <th scope="col" className="th-action"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#8c9e94' }}>
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const formattedAmount = `${isIncome ? '+' : '-'}${formatSimpleIDR(Math.abs(tx.amount))}`;
                  const amountClass = isIncome ? 'tx-income' : 'tx-expense';
                  const isChecked = checkedIds.includes(tx.id);

                  return (
                    <tr key={tx.id} style={{ backgroundColor: isChecked ? '#f3f7f4' : undefined }}>
                      <td style={{ paddingLeft: '14px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(tx.id)}
                        />
                      </td>
                      <td>
                        <div className="tx-cell">
                          <div className="tx-icon-wrap">
                            {getIcon(tx.icon)}
                          </div>
                          <div className="tx-meta">
                            <span className="tx-title">{tx.title}</span>
                            <span className="tx-date">{tx.date}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="tx-cat-text">{tx.category}</span></td>
                      <td><span className="tx-wallet-text">{tx.wallet}</span></td>
                      <td className={`tx-amount-col ${amountClass}`}>{formattedAmount}</td>
                      <td className="tx-action-cell">
                        {onDeleteTransaction ? (
                          <button 
                            className="btn-icon-ghost tx-trash-btn" 
                            title="Hapus transaksi"
                            onClick={() => {
                              if (confirm(`Hapus transaksi "${tx.title}"?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                          >
                            <Trash2 size={15} stroke="#8c9e94" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Interactive List View */}
        <div className="tx-mobile-container mobile-only">
          {paginatedRows.length > 0 && (
            <div className="tx-mobile-select-bar">
              <label className="tx-select-all-label">
                <input
                  type="checkbox"
                  checked={paginatedRows.length > 0 && checkedIds.length === paginatedRows.length}
                  onChange={handleToggleSelectAll}
                />
                <span>Pilih Semua ({paginatedRows.length})</span>
              </label>
              {checkedIds.length > 0 && onDeleteTransaction && (
                <button
                  className="btn-delete-checked-mobile"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 size={13} stroke="#dc2626" />
                  <span>Hapus ({checkedIds.length})</span>
                </button>
              )}
            </div>
          )}

          <div className="transactions-mobile-list">
            {paginatedRows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 14px', color: '#8c9e94' }}>
                Tidak ada transaksi yang cocok dengan filter.
              </div>
            ) : (
              paginatedRows.map((tx) => {
                const isIncome = tx.type === 'income';
                const formattedAmount = `${isIncome ? '+' : '-'}${formatSimpleIDR(Math.abs(tx.amount))}`;
                const amountClass = isIncome ? 'tx-income' : 'tx-expense';
                const isChecked = checkedIds.includes(tx.id);

                return (
                  <div
                    key={tx.id}
                    className={`tx-mobile-card ${isChecked ? 'is-checked' : ''}`}
                  >
                    <div className="tx-mobile-card-top">
                      <div className="tx-mobile-check-wrap">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(tx.id)}
                          aria-label={`Pilih ${tx.title}`}
                        />
                      </div>
                      <div className="tx-mobile-icon-box">
                        {getIcon(tx.icon)}
                      </div>
                      <div className="tx-mobile-info">
                        <span className="tx-mobile-title">{tx.title}</span>
                        <div className="tx-mobile-tags">
                          <span className="tx-tag-date">{tx.date}</span>
                          {tx.category && <span className="tx-tag-badge">{tx.category}</span>}
                          {tx.wallet && <span className="tx-tag-badge wallet-badge">{tx.wallet}</span>}
                        </div>
                      </div>
                      <div className="tx-mobile-amount-box">
                        <span className={`tx-mobile-amount ${amountClass}`}>
                          {formattedAmount}
                        </span>
                        {onDeleteTransaction && (
                          <button
                            className="tx-mobile-del-btn"
                            title="Hapus transaksi"
                            onClick={() => {
                              if (confirm(`Hapus transaksi "${tx.title}"?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                          >
                            <Trash2 size={14} stroke="#ef4444" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="tx-pagination-footer">
          <span className="pagination-info">
            Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} transaksi
          </span>

          <div className="pagination-controls">
            <button
              className="btn-page-nav"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`page-num-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn-page-nav"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
