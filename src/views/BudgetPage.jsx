'use client';

import React, { useState } from 'react';
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
  Trash2,
  AlertCircle,
  Copy,
  Info,
  Check,
  X,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Zap,
  TrendingUp,
  Shirt,
  Gift,
  Sparkles,
  MoreHorizontal
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';
import PeriodSelector from '../components/PeriodSelector';

const DEFAULT_BUDGETS = [
  { id: 'b1', name: 'Makan & minum', spent: 0, limit: 0, color: 'green' },
  { id: 'b2', name: 'Tempat tinggal', spent: 0, limit: 0, color: 'green' },
  { id: 'b3', name: 'Transportasi', spent: 0, limit: 0, color: 'green' },
  { id: 'b4', name: 'Belanja', spent: 0, limit: 0, color: 'green' },
  { id: 'b5', name: 'Lainnya', spent: 0, limit: 0, color: 'green' },
];

export default function BudgetPage({
  currentPeriod,
  onSelectPeriod,
  budgets = [],
  paydayCycle,
  onOpenManageBudget,
  onOpenAddBudget,
  onUpdateBudget,
  onDeleteBudget,
  onAddBudget,
  onSwitchTab,
  addToast
}) {
  const budgetList = budgets !== undefined ? budgets : DEFAULT_BUDGETS;
  const [cycleMode, setCycleMode] = useState('payday'); // 'payday' | 'calendar'

  // Helper untuk mendapatkan spent sesuai mode siklus yang dipilih (Siklus Gajian reset tgl 25 vs Bulan Penuh)
  const getSpent = (item) => {
    if (cycleMode === 'calendar') {
      return item.calendarSpent !== undefined ? Number(item.calendarSpent) : Number(item.spent) || 0;
    }
    return item.paydaySpent !== undefined ? Number(item.paydaySpent) : Number(item.spent) || 0;
  };

  // State untuk inline edit per item (nama + limit)
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');

  // State untuk inline confirm delete
  const [deletingId, setDeletingId] = useState(null);

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditValue(String(Number(item.limit) || 0));
    setDeletingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditValue('');
  };

  const handleSaveEdit = (itemId) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      addToast && addToast('Nama kategori tidak boleh kosong.', 'error');
      return;
    }

    const newLimit = parseInt(editValue.replace(/\D/g, ''), 10);
    if (isNaN(newLimit) || newLimit < 0) {
      addToast && addToast('Masukkan nominal anggaran yang valid.', 'error');
      return;
    }

    const updatedBudgets = budgetList.map((b) =>
      b.id === itemId ? { ...b, name: trimmedName, limit: newLimit } : b
    );

    if (onUpdateBudget) {
      onUpdateBudget(updatedBudgets);
    }
    addToast && addToast(`Anggaran "${trimmedName}" berhasil diperbarui!`);
    setEditingId(null);
    setEditName('');
    setEditValue('');
  };

  const handleDeleteItem = (item) => {
    if (onDeleteBudget) {
      onDeleteBudget(item.id);
    } else if (onUpdateBudget) {
      const remaining = budgetList.filter((b) => b.id !== item.id);
      onUpdateBudget(remaining);
      addToast && addToast(`Anggaran "${item.name}" berhasil dihapus.`);
    }
    setDeletingId(null);
  };

  const totalBudget = budgetList.reduce((sum, b) => sum + (Number(b.limit) || 0), 0);
  const usedBudget = budgetList.reduce((sum, b) => sum + getSpent(b), 0);
  const remainingBudget = Math.max(0, totalBudget - usedBudget);
  const usedPercent = totalBudget > 0 ? ((usedBudget / totalBudget) * 100).toFixed(1).replace('.', ',') : '0';
  const remainingPercent = totalBudget > 0 ? ((remainingBudget / totalBudget) * 100).toFixed(1).replace('.', ',') : '0';

  const overLimitBudgets = budgetList.filter((b) => Number(b.limit || 0) > 0 && getSpent(b) >= Number(b.limit || 0));

  const getCategoryIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('makan') || n.includes('minum') || n.includes('kuliner') || n.includes('jajan') || n.includes('food')) {
      return <Utensils size={16} stroke="#4a5c52" strokeWidth={2} />;
    }
    if (n.includes('tinggal') || n.includes('rumah') || n.includes('kos') || n.includes('sewa')) {
      return <Home size={16} stroke="#4a5c52" strokeWidth={2} />;
    }
    if (n.includes('trans') || n.includes('bensin') || n.includes('ojek') || n.includes('motor') || n.includes('mobil') || n.includes('grab') || n.includes('gojek')) {
      return <Car size={16} stroke="#4a5c52" strokeWidth={2} />;
    }
    if (n.includes('belanja') || n.includes('shop') || n.includes('pasar') || n.includes('mall')) {
      return <ShoppingBag size={16} stroke="#4a5c52" strokeWidth={2} />;
    }
    if (n.includes('sehat') || n.includes('obat') || n.includes('medis') || n.includes('dokter') || n.includes('apotek')) {
      return <HeartPulse size={16} stroke="#059669" strokeWidth={2} />;
    }
    if (n.includes('didik') || n.includes('sekolah') || n.includes('kuliah') || n.includes('buku') || n.includes('kursus')) {
      return <GraduationCap size={16} stroke="#2563eb" strokeWidth={2} />;
    }
    if (n.includes('hiburan') || n.includes('game') || n.includes('nonton') || n.includes('liburan') || n.includes('hobi')) {
      return <Gamepad2 size={16} stroke="#d97706" strokeWidth={2} />;
    }
    if (n.includes('tagihan') || n.includes('listrik') || n.includes('air') || n.includes('wifi') || n.includes('pulsa') || n.includes('internet')) {
      return <Zap size={16} stroke="#ea580c" strokeWidth={2} />;
    }
    if (n.includes('invest') || n.includes('saham') || n.includes('crypto') || n.includes('emas')) {
      return <TrendingUp size={16} stroke="#059669" strokeWidth={2} />;
    }
    if (n.includes('pakaian') || n.includes('baju') || n.includes('fashion')) {
      return <Shirt size={16} stroke="#7c3aed" strokeWidth={2} />;
    }
    if (n.includes('sedekah') || n.includes('zakat') || n.includes('donasi') || n.includes('infaq')) {
      return <Gift size={16} stroke="#059669" strokeWidth={2} />;
    }
    if (n.includes('rawat') || n.includes('skincare') || n.includes('salon')) {
      return <Sparkles size={16} stroke="#db2777" strokeWidth={2} />;
    }
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
          <button className="btn-primary-action btn-add-tx-desktop" onClick={onOpenAddBudget || onOpenManageBudget}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah kategori</span>
          </button>
          <button className="btn-outline-action desktop-only" onClick={onOpenManageBudget}>
            <Edit3 size={15} strokeWidth={2} />
            <span>Kelola anggaran</span>
          </button>
        </div>

        {/* Mobile full-width CTA */}
        <div className="mobile-only" style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <button className="btn-catat-mobile" style={{ flex: 1 }} onClick={onOpenAddBudget || onOpenManageBudget}>
            <Plus size={18} strokeWidth={2.5} />
            <span>Tambah pos</span>
          </button>
          <button className="btn-outline-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={onOpenManageBudget}>
            <Edit3 size={16} strokeWidth={2} />
            <span>Kelola</span>
          </button>
        </div>
      </div>

      {/* Banner Siklus Gajian (Reset tiap tgl 25) */}
      <div className="payday-banner-card">
        <div className="payday-banner-main">
          <div className="payday-icon-circle">
            <Sparkles size={20} stroke="#059669" strokeWidth={2.2} />
          </div>
          <div className="payday-banner-texts">
            <div className="payday-banner-badge-row">
              <span className="payday-banner-title">
                Siklus Gajian: {paydayCycle?.cycleLabel || '25 Okt – 24 Nov 2026'}
              </span>
              <span className="payday-pill-badge">
                ✨ Reset tiap tgl {paydayCycle?.resetDay || 25}
              </span>
            </div>
            <p className="payday-banner-desc">
              {cycleMode === 'payday'
                ? `Anggaran otomatis di-reset ke Rp 0 setiap tanggal ${paydayCycle?.resetDay || 25} saat gajian masuk. Menampilkan pengeluaran dari gaji baru.`
                : `Menampilkan seluruh pengeluaran dari awal hingga akhir bulan kalender (${paydayCycle?.calendarLabel || currentPeriod}).`}
            </p>
          </div>
        </div>

        <div className="payday-toggle-group">
          <button
            type="button"
            className={`payday-toggle-btn ${cycleMode === 'payday' ? 'active' : ''}`}
            onClick={() => setCycleMode('payday')}
          >
            Siklus Gajian (Tgl {paydayCycle?.resetDay || 25})
          </button>
          <button
            type="button"
            className={`payday-toggle-btn ${cycleMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setCycleMode('calendar')}
          >
            Bulan Penuh (1–31)
          </button>
        </div>
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
              <div className="card-header-actions" style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-outline-sm btn-header-add"
                  onClick={onOpenAddBudget || onOpenManageBudget}
                  title="Tambah kategori baru"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Tambah pos</span>
                </button>
                <button className="btn-outline-sm" onClick={onOpenManageBudget}>
                  <Edit3 size={13} strokeWidth={2} />
                  <span>Edit anggaran</span>
                </button>
              </div>
            </div>

            {budgetList.length === 0 ? (
              <div className="budget-page-empty-state">
                <div className="empty-state-icon-circle">
                  <PieChart size={32} stroke="#8c9e94" />
                </div>
                <h3 className="empty-state-title">Belum ada pos anggaran</h3>
                <p className="empty-state-desc">
                  Atur batas anggaran untuk kategori makanan, transportasi, belanja, atau pos keuangan lainnya.
                </p>
                <button
                  className="btn-primary-action"
                  onClick={onOpenAddBudget || onOpenManageBudget}
                  style={{ marginTop: '12px' }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Tambah Pos Anggaran</span>
                </button>
              </div>
            ) : (
              <div className="detailed-budget-list">
                {budgetList.map((item) => {
                  const limit = Number(item.limit) || 0;
                  const spent = getSpent(item);
                  const ratio = limit > 0 ? (spent / limit) * 100 : 0;
                  const percent = Math.min(100, Math.round(ratio));
                  const isLimit = limit > 0 && spent >= limit;
                  const remaining = Math.max(0, limit - spent);
                  const isEditing = editingId === item.id;
                  const isDeleting = deletingId === item.id;

                  return (
                    <div key={item.id} className="detailed-budget-card">
                      <div className="detail-budget-header">
                        <div className="detail-budget-left">
                          <div className="cat-icon-wrap">
                            {getCategoryIcon(item.name)}
                          </div>
                          {isEditing ? (
                            <input
                              type="text"
                              className="inline-edit-name-field"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Nama kategori"
                              autoFocus
                            />
                          ) : (
                            <span className="cat-title">{item.name}</span>
                          )}
                        </div>

                        <div className="detail-budget-right">
                          {!isEditing && (
                            <span className={`status-pill ${isLimit ? 'pill-amber' : 'pill-green'}`}>
                              {limit === 0 ? 'Belum diatur' : isLimit ? 'Batas tercapai' : 'Dalam anggaran'}
                            </span>
                          )}

                          {isEditing ? (
                            <div className="inline-edit-actions">
                              <button
                                className="btn-icon-confirm"
                                onClick={() => handleSaveEdit(item.id)}
                                aria-label="Simpan perubahan"
                                title="Simpan"
                              >
                                <Check size={14} stroke="#059669" />
                              </button>
                              <button
                                className="btn-icon-cancel"
                                onClick={handleCancelEdit}
                                aria-label="Batal edit"
                                title="Batal"
                              >
                                <X size={14} stroke="#dc2626" />
                              </button>
                            </div>
                          ) : isDeleting ? (
                            <div className="inline-delete-confirm-box">
                              <span className="delete-confirm-label">Hapus pos ini?</span>
                              <button
                                className="btn-confirm-yes"
                                onClick={() => handleDeleteItem(item)}
                                title="Ya, hapus pos ini"
                              >
                                Ya
                              </button>
                              <button
                                className="btn-confirm-no"
                                onClick={() => setDeletingId(null)}
                                title="Batal"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="budget-item-button-group">
                              <button 
                                className="btn-icon-ghost"
                                onClick={() => handleStartEdit(item)}
                                aria-label={`Edit ${item.name}`}
                                title="Ubah batas & nama anggaran"
                              >
                                <Edit3 size={14} stroke="#8c9e94" />
                              </button>
                              <button
                                className="btn-icon-ghost btn-delete-ghost"
                                onClick={() => setDeletingId(item.id)}
                                aria-label={`Hapus ${item.name}`}
                                title="Hapus kategori anggaran"
                              >
                                <Trash2 size={14} stroke="#ef4444" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="inline-edit-row">
                          <span className="detail-spent">{formatSimpleIDR(spent)} / </span>
                          <div className="inline-edit-input-wrap">
                            <span className="inline-edit-prefix">Rp</span>
                            <input
                              className="inline-edit-input"
                              type="text"
                              inputMode="numeric"
                              value={
                                editValue
                                  ? Number(editValue.replace(/\D/g, '')).toLocaleString('id-ID')
                                  : ''
                              }
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                setEditValue(raw);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(item.id);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="detail-budget-amounts">
                          <span className="detail-spent">
                            {formatSimpleIDR(spent)} / {formatSimpleIDR(limit)}
                          </span>
                          <span className="detail-percent">{percent}%</span>
                        </div>
                      )}

                      <div className="progress-track" style={{ height: '7px' }}>
                        <div 
                          className={`progress-bar ${isLimit ? 'bar-amber' : 'bar-green'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="detail-budget-footer">
                        <span className="detail-remaining">
                          {limit === 0 ? 'Batas belum diatur' : isLimit ? 'Batas habis' : `Sisa ${formatSimpleIDR(remaining)}`}
                        </span>
                        <span className="detail-note">
                          {limit === 0 ? 'Klik edit untuk atur batas limit' : isLimit ? 'Seluruh anggaran terpakai' : 'Belum melewati batas'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Dashed Add Category Button at bottom of list */}
                <button
                  type="button"
                  className="btn-add-budget-dashed"
                  onClick={onOpenAddBudget || onOpenManageBudget}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Tambah pos kategori anggaran baru</span>
                </button>
              </div>
            )}
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
                addToast && addToast('Membuka penyesuaian anggaran');
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
