'use client';

import React, { useState, useEffect } from 'react';
import { Repeat, X } from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function TransferModal({ isOpen, onClose, onTransfer, wallets = [] }) {
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amountStr, setAmountStr] = useState('');

  useEffect(() => {
    if (wallets.length >= 2) {
      setFromWallet(wallets[0].name);
      setToWallet(wallets[1].name);
    } else if (wallets.length === 1) {
      setFromWallet(wallets[0].name);
      setToWallet(wallets[0].name);
    }
  }, [wallets]);

  if (!isOpen) return null;

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawAmount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (!rawAmount || rawAmount <= 0) {
      alert('Masukkan nominal transfer yang valid!');
      return;
    }
    if (fromWallet === toWallet) {
      alert('Dompet asal dan tujuan tidak boleh sama!');
      return;
    }
    onTransfer({ fromWallet, toWallet, amount: rawAmount });
    onClose();
    setAmountStr('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Repeat size={20} stroke="#134e3f" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="modal-title">Transfer Antar Dompet</h3>
              <p className="modal-desc">Pindahkan saldo antar rekening tanpa mengubah total saldo.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Dari Dompet</label>
              <select 
                className="form-select"
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value)}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name} ({formatSimpleIDR(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ke Dompet</label>
              <select 
                className="form-select"
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value)}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name} ({formatSimpleIDR(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              Kirim Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
