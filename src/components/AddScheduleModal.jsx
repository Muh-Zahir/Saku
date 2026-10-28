'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  Repeat,
  CreditCard,
  Zap,
  Sparkles,
  Layers,
  Bell,
  CalendarDays
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

const SCHEDULE_TYPES = [
  { id: 'debt', label: 'Bayar Utang', icon: CreditCard, color: '#e11d48', bg: '#ffe4e6', desc: 'Pinjaman / utang ke teman/bank' },
  { id: 'bill', label: 'Tagihan Rutin', icon: Zap, color: '#d97706', bg: '#fef3c7', desc: 'Listrik, air, kos, internet wifi' },
  { id: 'installment', label: 'Cicilan', icon: Layers, color: '#7c3aed', bg: '#ede9fe', desc: 'Cicilan gadget, motor, dsb.' },
  { id: 'subscription', label: 'Langganan', icon: Sparkles, color: '#0d9488', bg: '#ccfbf1', desc: 'Streaming, cloud, membership' },
  { id: 'reminder', label: 'Pengingat Lain', icon: Bell, color: '#0284c7', bg: '#e0f2fe', desc: 'Target bayar / komitmen dana' },
];

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSaveSchedule,
  wallets = [],
  initialData = null,
  defaultDate = ''
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('debt');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState('once');
  const [walletId, setWalletId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Sinkronisasi data awal saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setType(initialData.type || 'debt');
        setAmount(initialData.amount ? String(initialData.amount) : '');
        setDueDate(initialData.due_date || '');
        setRecurring(initialData.recurring || 'once');
        setWalletId(initialData.wallet_id || '');
        setNotes(initialData.notes || '');
      } else {
        setTitle('');
        setType('debt');
        setAmount('');
        const todayStr = new Date().toISOString().split('T')[0];
        setDueDate(defaultDate || todayStr);
        setRecurring('once');
        setWalletId(wallets[0]?.id || '');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, initialData, defaultDate, wallets]);

  if (!isOpen) return null;

  const handleAmountChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setAmount(rawVal);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama atau judul jadwal wajib diisi.');
      return;
    }
    if (!dueDate) {
      setError('Tanggal jatuh tempo wajib dipilih.');
      return;
    }

    const numAmount = Number(amount) || 0;
    const selectedWallet = wallets.find((w) => w.id === walletId) || wallets[0];
    const dueDay = parseInt(dueDate.split('-')[2], 10) || null;

    const payload = {
      ...(initialData ? { id: initialData.id } : {}),
      title: title.trim(),
      type,
      amount: numAmount,
      due_date: dueDate,
      recurring,
      recurring_day: recurring === 'monthly' ? dueDay : null,
      wallet_id: selectedWallet?.id || null,
      wallet_name: selectedWallet?.name || null,
      notes: notes.trim() || null,
      is_paid: initialData?.is_paid || false,
    };

    onSaveSchedule(payload);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog schedule-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheduleModalTitle"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <CalendarDays size={20} stroke="#134e3f" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="modal-title" id="scheduleModalTitle">
                {initialData ? 'Ubah Jadwal Finansial' : 'Tambah Jadwal & Pengingat'}
              </h3>
              <p className="modal-desc">
                Atur tanggal jatuh tempo bayar utang, tagihan bulanan, atau cicilan
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup form"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Pilih Tipe Jadwal */}
          <div className="form-group">
            <label className="form-label">Kategori Komitmen</label>
            <div className="schedule-type-grid">
              {SCHEDULE_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`schedule-type-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: isSelected ? t.color : '#e2e8f0',
                      backgroundColor: isSelected ? t.bg : '#ffffff'
                    }}
                    onClick={() => setType(t.id)}
                  >
                    <div
                      className="schedule-type-icon"
                      style={{ backgroundColor: isSelected ? t.color : t.bg, color: isSelected ? '#ffffff' : t.color }}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                    </div>
                    <div className="schedule-type-info">
                      <span className="schedule-type-title" style={{ color: isSelected ? t.color : 'var(--text-main)' }}>
                        {t.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Judul / Nama Komitmen */}
          <div className="form-group">
            <label className="form-label" htmlFor="scheduleTitle">
              Judul / Keterangan
            </label>
            <input
              id="scheduleTitle"
              type="text"
              className="form-input"
              placeholder={
                type === 'debt'
                  ? 'Contoh: Bayar Utang ke Budi / Pinjaman'
                  : type === 'bill'
                  ? 'Contoh: Tagihan Listrik PLN / IndiHome'
                  : type === 'installment'
                  ? 'Contoh: Cicilan Motor Honda ke-5'
                  : type === 'subscription'
                  ? 'Contoh: Netflix / Spotify Family'
                  : 'Contoh: Beli kado / DP sewa'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* 3. Nominal & Tanggal Jatuh Tempo */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="scheduleAmount">
                Nominal (Rp)
              </label>
              <div className="amount-input-wrap">
                <span className="currency-prefix">Rp</span>
                <input
                  id="scheduleAmount"
                  type="text"
                  inputMode="numeric"
                  className="form-input amount-field"
                  placeholder="0"
                  value={amount ? Number(amount).toLocaleString('id-ID') : ''}
                  onChange={handleAmountChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="scheduleDueDate">
                Tanggal Jatuh Tempo
              </label>
              <input
                id="scheduleDueDate"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 4. Pengulangan (Sekali vs Tiap Bulan) */}
          <div className="form-group">
            <label className="form-label">Siklus Pengulangan</label>
            <div className="recurring-segmented-control">
              <button
                type="button"
                className={`segmented-btn ${recurring === 'once' ? 'active' : ''}`}
                onClick={() => setRecurring('once')}
              >
                <span>Sekali Saja</span>
              </button>
              <button
                type="button"
                className={`segmented-btn ${recurring === 'monthly' ? 'active' : ''}`}
                onClick={() => setRecurring('monthly')}
              >
                <Repeat size={14} className="segmented-icon" />
                <span>Rutin Tiap Bulan</span>
              </button>
            </div>
            <p className="form-helper-text">
              {recurring === 'monthly'
                ? `Jadwal ini akan otomatis berulang setiap tanggal ${dueDate ? parseInt(dueDate.split('-')[2], 10) : '...'} setiap bulannya.`
                : 'Jadwal hanya berlaku satu kali pada tanggal jatuh tempo yang dipilih.'}
            </p>
          </div>

          {/* 5. Dompet Sumber Pembayaran (Opsional) */}
          {wallets && wallets.length > 0 && (
            <div className="form-group">
              <label className="form-label" htmlFor="scheduleWallet">
                Rencana Bayar dari Dompet (Opsional)
              </label>
              <select
                id="scheduleWallet"
                className="form-select"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
              >
                <option value="">Pilih dompet sumber...</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: {formatSimpleIDR(w.balance || 0)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 6. Catatan Tambahan */}
          <div className="form-group">
            <label className="form-label" htmlFor="scheduleNotes">
              Catatan / Info Penting (Opsional)
            </label>
            <input
              id="scheduleNotes"
              type="text"
              className="form-input"
              placeholder="Contoh: No. Virtual Account, Rekening Tujuan, atau Catatan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              {initialData ? 'Simpan Perubahan' : 'Tambahkan ke Kalender'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
