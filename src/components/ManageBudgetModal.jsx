'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
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
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

const PRESET_SUGGESTIONS = [
  'Kesehatan',
  'Pendidikan',
  'Hiburan',
  'Tagihan & Listrik',
  'Investasi',
  'Pakaian',
  'Zakat & Sedekah',
  'Perawatan Diri'
];

export default function ManageBudgetModal({
  isOpen,
  onClose,
  budgets = [],
  onSaveBudgets,
  onDeleteBudget,
  onAddBudget,
  initialMode = 'list',
  addToast
}) {
  const [editedBudgets, setEditedBudgets] = useState([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // New category inputs
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newLimitStr, setNewLimitStr] = useState('');
  const [addError, setAddError] = useState('');

  // Editing category name state
  const [editingNameId, setEditingNameId] = useState(null);
  const [tempName, setTempName] = useState('');

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditedBudgets(budgets ? [...budgets] : []);
      setIsAddFormOpen(initialMode === 'add');
      setNewCategoryName('');
      setNewLimitStr('');
      setAddError('');
      setEditingNameId(null);
      setDeleteConfirmId(null);
      setSearchQuery('');
    }
  }, [isOpen, budgets, initialMode]);

  if (!isOpen) return null;

  const getCategoryIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('makan') || n.includes('minum') || n.includes('kuliner') || n.includes('jajan') || n.includes('food')) {
      return <Utensils size={16} stroke="#134e3f" strokeWidth={2.2} />;
    }
    if (n.includes('tinggal') || n.includes('rumah') || n.includes('kos') || n.includes('sewa')) {
      return <Home size={16} stroke="#134e3f" strokeWidth={2.2} />;
    }
    if (n.includes('trans') || n.includes('bensin') || n.includes('ojek') || n.includes('motor') || n.includes('mobil') || n.includes('grab') || n.includes('gojek')) {
      return <Car size={16} stroke="#134e3f" strokeWidth={2.2} />;
    }
    if (n.includes('belanja') || n.includes('shop') || n.includes('pasar') || n.includes('mall')) {
      return <ShoppingBag size={16} stroke="#134e3f" strokeWidth={2.2} />;
    }
    if (n.includes('sehat') || n.includes('obat') || n.includes('medis') || n.includes('dokter') || n.includes('apotek')) {
      return <HeartPulse size={16} stroke="#059669" strokeWidth={2.2} />;
    }
    if (n.includes('didik') || n.includes('sekolah') || n.includes('kuliah') || n.includes('buku') || n.includes('kursus')) {
      return <GraduationCap size={16} stroke="#2563eb" strokeWidth={2.2} />;
    }
    if (n.includes('hiburan') || n.includes('game') || n.includes('nonton') || n.includes('liburan') || n.includes('hobi')) {
      return <Gamepad2 size={16} stroke="#d97706" strokeWidth={2.2} />;
    }
    if (n.includes('tagihan') || n.includes('listrik') || n.includes('air') || n.includes('wifi') || n.includes('pulsa') || n.includes('internet')) {
      return <Zap size={16} stroke="#ea580c" strokeWidth={2.2} />;
    }
    if (n.includes('invest') || n.includes('saham') || n.includes('crypto') || n.includes('emas')) {
      return <TrendingUp size={16} stroke="#059669" strokeWidth={2.2} />;
    }
    if (n.includes('pakaian') || n.includes('baju') || n.includes('fashion')) {
      return <Shirt size={16} stroke="#7c3aed" strokeWidth={2.2} />;
    }
    if (n.includes('sedekah') || n.includes('zakat') || n.includes('donasi') || n.includes('infaq')) {
      return <Gift size={16} stroke="#059669" strokeWidth={2.2} />;
    }
    if (n.includes('rawat') || n.includes('skincare') || n.includes('salon')) {
      return <Sparkles size={16} stroke="#db2777" strokeWidth={2.2} />;
    }
    return <MoreHorizontal size={16} stroke="#4a5c52" strokeWidth={2.2} />;
  };

  const handleLimitChange = (id, rawValue) => {
    const numeric = parseInt(String(rawValue).replace(/\D/g, ''), 10) || 0;
    setEditedBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, limit: numeric } : b))
    );
  };

  const handleStartRename = (item) => {
    setEditingNameId(item.id);
    setTempName(item.name);
  };

  const handleSaveRename = (id) => {
    const trimmed = tempName.trim();
    if (!trimmed) return;
    setEditedBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: trimmed } : b))
    );
    setEditingNameId(null);
    setTempName('');
  };

  const handleCancelRename = () => {
    setEditingNameId(null);
    setTempName('');
  };

  const handleDeleteItem = (id) => {
    setEditedBudgets((prev) => prev.filter((b) => b.id !== id));
    setDeleteConfirmId(null);
  };

  const handleAddNewCategory = (e) => {
    e?.preventDefault();
    setAddError('');

    const name = newCategoryName.trim();
    if (!name) {
      setAddError('Nama kategori wajib diisi.');
      return;
    }

    const isDuplicate = editedBudgets.some(
      (b) => b.name.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      setAddError(`Kategori "${name}" sudah ada dalam daftar.`);
      return;
    }

    const limitNum = parseInt(newLimitStr.replace(/\D/g, ''), 10);
    if (isNaN(limitNum) || limitNum < 0) {
      setAddError('Masukkan nominal batas anggaran yang valid.');
      return;
    }

    const newItem = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name,
      spent: 0,
      limit: limitNum,
      color: 'green',
    };

    setEditedBudgets((prev) => [...prev, newItem]);
    setNewCategoryName('');
    setNewLimitStr('');
    setAddError('');
    setIsAddFormOpen(false);
  };

  const handleSaveAll = () => {
    onSaveBudgets(editedBudgets);
    onClose();
  };

  const filteredBudgets = editedBudgets.filter((b) =>
    (b.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBudget = editedBudgets.reduce(
    (sum, b) => sum + (Number(b.limit) || 0),
    0
  );
  const totalSpent = editedBudgets.reduce(
    (sum, b) => sum + (Number(b.spent) || 0),
    0
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog modal-dialog-budget"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <PieChart size={20} stroke="#134e3f" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="modal-title">Kelola Kategori Anggaran</h3>
              <p className="modal-desc">
                Tambah kategori baru, ubah nominal batas, atau hapus pos anggaran.
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Payday Cycle Notice */}
        <div className="payday-modal-notice">
          <Sparkles size={15} stroke="#059669" strokeWidth={2.2} />
          <span>
            <strong>Siklus Gajian Aktif:</strong> Anggaran otomatis di-reset ke Rp 0 setiap tanggal 25 saat kamu gajian.
          </span>
        </div>

        {/* Modal Controls Bar */}
        <div className="budget-modal-controls">
          <div className="budget-search-wrap">
            <Search size={15} stroke="#8c9e94" />
            <input
              type="text"
              className="budget-search-input"
              placeholder="Cari kategori anggaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="budget-search-clear"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`btn-toggle-add-budget ${isAddFormOpen ? 'active' : ''}`}
            onClick={() => {
              setIsAddFormOpen(!isAddFormOpen);
              setAddError('');
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>{isAddFormOpen ? 'Tutup Form' : 'Tambah Kategori'}</span>
          </button>
        </div>

        {/* Form Tambah Kategori Baru (Collapsible / Prominent) */}
        {isAddFormOpen && (
          <div className="budget-add-card">
            <div className="budget-add-card-header">
              <div className="budget-add-badge">
                <Sparkles size={14} stroke="#059669" />
                <span>Pos Anggaran Baru</span>
              </div>
              <span className="budget-add-hint">
                Pilih rekomendasi atau ketik nama pos bebas
              </span>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="budget-suggestion-chips">
              {PRESET_SUGGESTIONS.map((preset) => {
                const isSelected = newCategoryName === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    className={`suggestion-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setNewCategoryName(preset);
                      setAddError('');
                    }}
                  >
                    + {preset}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddNewCategory} className="budget-add-form-grid">
              <div className="budget-add-field">
                <label className="budget-field-label">Nama Kategori</label>
                <input
                  type="text"
                  className="form-input budget-input-name"
                  placeholder="Contoh: Kesehatan, Liburan, Tagihan..."
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if (addError) setAddError('');
                  }}
                  autoFocus
                />
              </div>

              <div className="budget-add-field">
                <label className="budget-field-label">Batas Anggaran Bulanan</label>
                <div className="budget-nominal-input-wrap">
                  <span className="nominal-prefix">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-input budget-input-amount"
                    placeholder="0"
                    value={
                      newLimitStr
                        ? parseInt(newLimitStr.replace(/\D/g, ''), 10).toLocaleString('id-ID')
                        : ''
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setNewLimitStr(raw);
                      if (addError) setAddError('');
                    }}
                  />
                </div>
              </div>

              <div className="budget-add-actions">
                <button
                  type="submit"
                  className="btn-add-budget-submit"
                  disabled={!newCategoryName.trim()}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Tambahkan ke Daftar</span>
                </button>
              </div>
            </form>

            {addError && (
              <div className="budget-add-error">
                <AlertCircle size={14} />
                <span>{addError}</span>
              </div>
            )}
          </div>
        )}

        {/* Budget Items List */}
        <div className="budget-modal-body">
          {filteredBudgets.length === 0 ? (
            <div className="budget-empty-state">
              <div className="budget-empty-icon">
                <PieChart size={28} stroke="#8c9e94" />
              </div>
              <h4 className="budget-empty-title">
                {searchQuery ? 'Kategori tidak ditemukan' : 'Belum ada kategori anggaran'}
              </h4>
              <p className="budget-empty-desc">
                {searchQuery
                  ? `Tidak ada kategori yang cocok dengan "${searchQuery}".`
                  : 'Klik tombol "+ Tambah Kategori" di atas untuk menambahkan pos anggaran pertamamu.'}
              </p>
            </div>
          ) : (
            filteredBudgets.map((b) => {
              const isConfirmingDelete = deleteConfirmId === b.id;
              const isEditingName = editingNameId === b.id;
              const limitVal = Number(b.limit) || 0;
              const spentVal = Number(b.spent) || 0;

              return (
                <div
                  key={b.id}
                  className={`budget-edit-item-row ${isConfirmingDelete ? 'confirming-delete' : ''}`}
                >
                  {/* Left: Icon & Name */}
                  <div className="budget-item-main">
                    <div className="budget-item-cat-icon">
                      {getCategoryIcon(b.name)}
                    </div>

                    <div className="budget-item-info">
                      {isEditingName ? (
                        <div className="budget-rename-wrap">
                          <input
                            type="text"
                            className="budget-rename-input"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(b.id);
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn-rename-check"
                            onClick={() => handleSaveRename(b.id)}
                            title="Simpan nama"
                          >
                            <Check size={13} stroke="#059669" />
                          </button>
                          <button
                            type="button"
                            className="btn-rename-cancel"
                            onClick={handleCancelRename}
                            title="Batal"
                          >
                            <X size={13} stroke="#dc2626" />
                          </button>
                        </div>
                      ) : (
                        <div className="budget-title-row">
                          <span className="budget-edit-label">{b.name}</span>
                          <button
                            type="button"
                            className="btn-icon-subtle"
                            onClick={() => handleStartRename(b)}
                            title="Ubah nama kategori"
                          >
                            <Edit2 size={12} stroke="#8c9e94" />
                          </button>
                        </div>
                      )}

                      <div className="budget-item-meta">
                        <span>Terpakai: {formatSimpleIDR(spentVal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Limit Input & Delete Action */}
                  <div className="budget-item-actions">
                    <div className="budget-amount-input-wrap">
                      <span className="budget-amount-prefix">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="budget-amount-input"
                        value={limitVal.toLocaleString('id-ID')}
                        onChange={(e) => handleLimitChange(b.id, e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    {isConfirmingDelete ? (
                      <div className="budget-inline-confirm-delete">
                        <span className="confirm-delete-text">Hapus?</span>
                        <button
                          type="button"
                          className="btn-confirm-del-yes"
                          onClick={() => handleDeleteItem(b.id)}
                          title="Konfirmasi hapus"
                        >
                          Ya
                        </button>
                        <button
                          type="button"
                          className="btn-confirm-del-no"
                          onClick={() => setDeleteConfirmId(null)}
                          title="Batal"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-icon-delete"
                        onClick={() => setDeleteConfirmId(b.id)}
                        title={`Hapus kategori "${b.name}"`}
                        aria-label={`Hapus ${b.name}`}
                      >
                        <Trash2 size={15} stroke="#ef4444" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer budget-modal-footer">
          <div className="budget-modal-summary">
            <span className="summary-total-label">Total Alokasi Anggaran:</span>
            <span className="summary-total-value">
              {formatSimpleIDR(totalBudget)}
            </span>
            <span className="summary-total-count">
              ({editedBudgets.length} kategori)
            </span>
          </div>

          <div className="modal-actions-group">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn-submit"
              onClick={handleSaveAll}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
