'use client';

import React, { useState } from 'react';
import { Wallet, X } from 'lucide-react';

export default function AddWalletModal({ isOpen, onClose, onAddWallet }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Rekening bank');
  const [balanceStr, setBalanceStr] = useState('');
  const [icon, setIcon] = useState('bank');

  if (!isOpen) return null;

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setBalanceStr(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'Rekening bank') setIcon('bank');
    else if (newType === 'Dompet digital') setIcon('phone');
    else setIcon('cash');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawBalance = parseInt(balanceStr.replace(/\D/g, '') || '0', 10);

    if (!name.trim()) {
      alert('Mohon isi nama dompet/rekening!');
      return;
    }

    const newWallet = {
      id: `w-${Date.now()}`,
      name: name.trim(),
      type: `${type} · Aktif`,
      balance: rawBalance,
      color: type === 'Dompet digital' ? 'emerald' : type === 'Uang tunai' ? 'amber' : 'blue',
      icon,
    };

    onAddWallet(newWallet);
    onClose();
    setName('');
    setBalanceStr('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Wallet size={20} stroke="#134e3f" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="modal-title">Tambah Dompet / Rekening</h3>
              <p className="modal-desc">Pantau saldo rekening bank, dompet digital, atau uang tunai.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nama Dompet / Bank</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: BCA, Mandiri, GoPay, Tunai..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Jenis Akun</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="Rekening bank">Rekening Bank</option>
                <option value="Dompet digital">Dompet Digital (E-Wallet)</option>
                <option value="Uang tunai">Uang Tunai</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ikon</label>
              <select
                className="form-select"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                <option value="bank">Bank</option>
                <option value="phone">Smartphone / E-Wallet</option>
                <option value="cash">Uang Kertas</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Saldo Awal (Rp)</label>
            <div className="amount-input-wrap">
              <span className="currency-prefix">Rp</span>
              <input
                type="text"
                className="form-input amount-field"
                placeholder="0"
                value={balanceStr}
                onChange={handleAmountChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              Simpan Dompet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
