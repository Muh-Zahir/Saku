'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  wallets = [],
  budgets = [],
}) {
  const [type, setType] = useState('expense');
  const [amountStr, setAmountStr] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Makan & minum');
  const [wallet, setWallet] = useState('BCA');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      if (wallets && wallets.length > 0) {
        setWallet(wallets[0].name);
      }
    }
  }, [isOpen, wallets]);

  if (!isOpen) return null;

  const defaultCategories = [
    'Makan & minum',
    'Transportasi',
    'Belanja',
    'Tempat tinggal',
    'Gaji',
    'Investasi',
    'Lainnya',
  ];

  // Gabungkan kategori dari anggaran jika ada
  const budgetCategories = budgets ? budgets.map((b) => b.name) : [];
  const allCategories = Array.from(new Set([...budgetCategories, ...defaultCategories]));

  const walletOptions =
    wallets && wallets.length > 0
      ? wallets.map((w) => w.name)
      : ['BCA', 'GoPay', 'Tunai'];

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw) {
      setAmountStr(parseInt(raw, 10).toLocaleString('id-ID'));
    } else {
      setAmountStr('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawAmount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (!rawAmount || rawAmount <= 0) {
      alert('Masukkan nominal yang valid!');
      return;
    }

    const formattedDate = date
      ? new Date(date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Hari ini';

    const selectedWalletObj = wallets.find((w) => w.name === wallet);

    const newTx = {
      id: `tx-${Date.now()}`,
      title: title.trim(),
      amount: type === 'expense' ? -rawAmount : rawAmount,
      category,
      wallet_id: selectedWalletObj?.id || null,
      wallet,
      wallet_name: wallet,
      date: formattedDate,
      type,
      icon:
        type === 'income'
          ? 'briefcase'
          : category === 'Transportasi'
          ? 'fuel'
          : category === 'Belanja'
          ? 'shopping-bag'
          : category === 'Makan & minum'
          ? 'coffee'
          : category === 'Tempat tinggal'
          ? 'home'
          : 'shopping-bag',
    };

    onAddTransaction(newTx);
    onClose();
    // reset
    setAmountStr('');
    setTitle('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Plus size={20} stroke="#134e3f" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="modal-title">Tambah Transaksi</h3>
              <p className="modal-desc">Catat pengeluaran atau pemasukan baru ke dalam Saku.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Tipe Transaksi Toggle */}
          <div className="form-group">
            <label className="form-label">Tipe Transaksi</label>
            <div className="type-toggle-group">
              <button 
                type="button" 
                className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setType('expense')}
              >
                Pengeluaran
              </button>
              <button 
                type="button" 
                className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                onClick={() => setType('income')}
              >
                Pemasukan
              </button>
            </div>
          </div>

          {/* Nominal */}
          <div className="form-group">
            <label className="form-label">Nominal (Rp)</label>
            <div className="amount-input-wrap">
              <span className="currency-prefix">Rp</span>
              <input
                type="text"
                className="form-input amount-field"
                placeholder="0"
                value={amountStr}
                onChange={handleAmountChange}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Nama Transaksi</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Belanja mingguan, Makan siang"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category & Wallet */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select 
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dompet / Rekening</label>
              <select 
                className="form-select"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
              >
                {walletOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input 
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
