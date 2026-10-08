'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Download,
  Search,
  ChevronDown,
  Filter,
  ShoppingBag,
  Fuel,
  Coffee,
  Briefcase,
  Utensils,
  Car,
  Home,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

const DEFAULT_FULL_TRANSACTIONS = [
  { id: 'tx-1', title: 'Belanja mingguan', date: '30 Sep 2026', category: 'Makan & minum', wallet: 'BCA', amount: -350000, type: 'expense', icon: 'shopping-bag' },
  { id: 'tx-2', title: 'Isi bensin', date: '29 Sep 2026', category: 'Transportasi', wallet: 'BCA', amount: -150000, type: 'expense', icon: 'fuel' },
  { id: 'tx-3', title: 'Kopi sore', date: '28 Sep 2026', category: 'Makan & minum', wallet: 'GoPay', amount: -45000, type: 'expense', icon: 'coffee' },
  { id: 'tx-4', title: 'Sepatu olahraga', date: '27 Sep 2026', category: 'Belanja', wallet: 'BCA', amount: -450000, type: 'expense', icon: 'shopping-bag' },
  { id: 'tx-5', title: 'Gaji September', date: '25 Sep 2026', category: 'Gaji', wallet: 'BCA', amount: 12000000, type: 'income', icon: 'briefcase' },
  { id: 'tx-6', title: 'Makan bersama keluarga', date: '24 Sep 2026', category: 'Makan & minum', wallet: 'BCA', amount: -355000, type: 'expense', icon: 'utensils' },
  { id: 'tx-7', title: 'Transportasi harian', date: '22 Sep 2026', category: 'Transportasi', wallet: 'GoPay', amount: -150000, type: 'expense', icon: 'car' },
  { id: 'tx-8', title: 'Perlengkapan rumah', date: '20 Sep 2026', category: 'Belanja', wallet: 'BCA', amount: -450000, type: 'expense', icon: 'shopping-bag' },
  { id: 'tx-9', title: 'Belanja bahan makanan', date: '18 Sep 2026', category: 'Makan & minum', wallet: 'BCA', amount: -600000, type: 'expense', icon: 'shopping-bag' },
  { id: 'tx-10', title: 'Langganan aplikasi', date: '16 Sep 2026', category: 'Lainnya', wallet: 'BCA', amount: -150000, type: 'expense', icon: 'refresh' },
  // Extra items for page 2
  { id: 'tx-11', title: 'Bonus freelance proyek', date: '15 Sep 2026', category: 'Gaji', wallet: 'BCA', amount: 500000, type: 'income', icon: 'briefcase' },
  { id: 'tx-12', title: 'Sewa apartemen', date: '10 Sep 2026', category: 'Tempat tinggal', wallet: 'BCA', amount: -3000000, type: 'expense', icon: 'home' },
  { id: 'tx-13', title: 'Listrik & air', date: '08 Sep 2026', category: 'Tempat tinggal', wallet: 'BCA', amount: -450000, type: 'expense', icon: 'home' },
  { id: 'tx-14', title: 'Makan malam teman', date: '06 Sep 2026', category: 'Makan & minum', wallet: 'GoPay', amount: -250000, type: 'expense', icon: 'utensils' },
  { id: 'tx-15', title: 'Bensin luar kota', date: '05 Sep 2026', category: 'Transportasi', wallet: 'BCA', amount: -300000, type: 'expense', icon: 'fuel' },
  { id: 'tx-16', title: 'Buku pengembangan diri', date: '04 Sep 2026', category: 'Belanja', wallet: 'GoPay', amount: -180000, type: 'expense', icon: 'shopping-bag' },
  { id: 'tx-17', title: 'Snack & camilan', date: '02 Sep 2026', category: 'Makan & minum', wallet: 'Tunai', amount: -50000, type: 'expense', icon: 'coffee' },
  { id: 'tx-18', title: 'Donasi bulanan', date: '01 Sep 2026', category: 'Lainnya', wallet: 'BCA', amount: -350000, type: 'expense', icon: 'refresh' }
];

export default function TransactionsPage({
  currentPeriod,
  onOpenAddTx,
  addToast
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'income', 'expense'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedWallet, setSelectedWallet] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState([]);

  const pageSize = 10;

  const filtered = useMemo(() => {
    return DEFAULT_FULL_TRANSACTIONS.filter((tx) => {
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
        return tx.title.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
      }

      return true;
    });
  }, [activeTab, searchQuery, selectedCategory, selectedWallet]);

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

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Setiap pemasukan dan pengeluaran, tercatat dengan rapi.</p>
        </div>

        <div className="page-actions">
          <button className="btn-period-select">
            <Calendar size={16} strokeWidth={2} />
            <span>{currentPeriod}</span>
          </button>
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

      {/* Top 3 Cards */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Pemasukan bulan ini</span>
            <div className="metric-icon-wrap-light">
              <ArrowDownLeft size={17} stroke="#059669" strokeWidth={2.4} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp12.500.000</div>
          <div className="metric-trend text-muted-sub">
            <span>2 transaksi · Gaji &amp; pekerjaan lepas</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Pengeluaran bulan ini</span>
            <div className="metric-icon-wrap-light">
              <ArrowUpRight size={17} stroke="#059669" strokeWidth={2.4} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp7.350.000</div>
          <div className="metric-trend text-muted-sub">
            <span>16 transaksi · 5 kategori pengeluaran</span>
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
            <span>41,2% dari pemasukan berhasil disimpan</span>
          </div>
        </div>
      </section>

      {/* Main Riwayat Transaksi Card */}
      <div className="dashboard-card bottom-grid">
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <div>
            <h2 className="card-title">Riwayat transaksi</h2>
            <p className="card-subtitle">18 transaksi tercatat pada September 2026</p>
          </div>
          <button 
            className="btn-outline-sm"
            onClick={() => addToast('Mengekspor 18 transaksi ke CSV...')}
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
        </div>

        {/* Tab Filter: Semua, Pemasukan, Pengeluaran */}
        <div className="tx-filter-tabs">
          <button
            className={`tx-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          >
            Semua transaksi (18)
          </button>
          <button
            className={`tx-tab-btn ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => { setActiveTab('income'); setCurrentPage(1); }}
          >
            Pemasukan (2)
          </button>
          <button
            className={`tx-tab-btn ${activeTab === 'expense' ? 'active' : ''}`}
            onClick={() => { setActiveTab('expense'); setCurrentPage(1); }}
          >
            Pengeluaran (16)
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
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Semua">Semua kategori</option>
              <option value="Makan & minum">Makan &amp; minum</option>
              <option value="Transportasi">Transportasi</option>
              <option value="Belanja">Belanja</option>
              <option value="Tempat tinggal">Tempat tinggal</option>
              <option value="Gaji">Gaji</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <select
              className="tx-select-pill"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
            >
              <option value="Semua">Semua dompet</option>
              <option value="BCA">BCA</option>
              <option value="GoPay">GoPay</option>
              <option value="Tunai">Tunai</option>
            </select>

            <button className="tx-date-pill">
              <span>1–30 Sep 2026</span>
              <ChevronDown size={14} />
            </button>

            <button className="btn-outline-sm" style={{ padding: '7px 12px' }}>
              <Filter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '40px', paddingLeft: '12px' }}>
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
                <th scope="col" style={{ width: '36px' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((tx) => {
                const isIncome = tx.amount > 0;
                const formattedAmount = `${isIncome ? '+' : '-'}Rp${Math.abs(tx.amount).toLocaleString('id-ID')}`;
                const amountClass = isIncome ? 'tx-income' : 'tx-expense';
                const isChecked = checkedIds.includes(tx.id);

                return (
                  <tr key={tx.id} style={{ backgroundColor: isChecked ? '#f3f7f4' : undefined }}>
                    <td style={{ paddingLeft: '12px' }}>
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
                    <td>
                      <button 
                        className="btn-icon-ghost" 
                        onClick={() => addToast(`Opsi untuk: ${tx.title}`)}
                      >
                        <MoreHorizontal size={16} stroke="#8c9e94" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="tx-pagination-footer">
          <span className="pagination-info">
            Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} transaksi
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
              disabled={currentPage === totalPages}
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

