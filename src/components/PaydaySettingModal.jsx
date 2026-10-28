'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';

export default function PaydaySettingModal({
  isOpen,
  onClose,
  currentPaydayDate = 25,
  onSavePaydayDate
}) {
  const [selectedDay, setSelectedDay] = useState(currentPaydayDate);
  const [estimatedSalary, setEstimatedSalary] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedDay(currentPaydayDate || 25);
      const savedSalary = localStorage.getItem('saku_estimated_salary') || '';
      setEstimatedSalary(savedSalary);
    }
  }, [isOpen, currentPaydayDate]);

  if (!isOpen) return null;

  // Hitung hari menuju gajian berikutnya untuk preview real-time
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let nextPaydayDateObj = new Date(currentYear, currentMonth, selectedDay);
  if (now.getTime() >= nextPaydayDateObj.getTime()) {
    nextPaydayDateObj = new Date(currentYear, currentMonth + 1, selectedDay);
  }
  const diffMs = nextPaydayDateObj.getTime() - now.getTime();
  const daysUntilNext = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const nextPaydayFormatted = `${selectedDay} ${MONTH_NAMES[nextPaydayDateObj.getMonth()]} ${nextPaydayDateObj.getFullYear()}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSavePaydayDate) {
      onSavePaydayDate(Number(selectedDay));
    }
    if (estimatedSalary) {
      localStorage.setItem('saku_estimated_salary', estimatedSalary);
    } else {
      localStorage.removeItem('saku_estimated_salary');
    }
    onClose();
  };

  const commonPaydays = [25, 27, 28, 30, 1];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog payday-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paydayModalTitle"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Calendar size={20} stroke="#134e3f" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="modal-title" id="paydayModalTitle">Atur Tanggal Gajian</h3>
              <p className="modal-desc">
                Tentukan tanggal gajianmu agar hitung mundur berjalan akurat
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup pengaturan"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Quick choices */}
          <div className="form-group">
            <label className="form-label">Pilihan Cepat Tanggal Gajian</label>
            <div className="payday-quick-pills">
              {commonPaydays.map((day) => {
                const isActive = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    className={`payday-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span>Tanggal {day}</span>
                    {isActive && <Check size={14} className="pill-check" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Selector for 1 - 31 */}
          <div className="form-group">
            <label className="form-label" htmlFor="paydaySelect">
              Atau Pilih Tanggal Lain (1 – 31)
            </label>
            <select
              id="paydaySelect"
              className="form-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Setiap Tanggal {d}
                </option>
              ))}
            </select>
          </div>

          {/* Live Preview Card */}
          <div className="payday-preview-card">
            <div className="payday-preview-badge">🚀</div>
            <div className="payday-preview-content">
              <div className="payday-preview-title">
                {daysUntilNext === 0
                  ? '🎉 Hari ini gajianmu tiba!'
                  : `🚀 ${daysUntilNext} Hari Lagi Menuju Gajian!`}
              </div>
              <div className="payday-preview-sub">
                Gajian berikutnya: <strong>{nextPaydayFormatted}</strong>
              </div>
            </div>
          </div>

          {/* Estimasi Gaji (Opsional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="estimatedSalary">
              Estimasi Gaji Bulanan (Opsional)
            </label>
            <div className="amount-input-wrap">
              <span className="currency-prefix">Rp</span>
              <input
                id="estimatedSalary"
                type="text"
                inputMode="numeric"
                className="form-input amount-field"
                placeholder="0"
                value={estimatedSalary ? Number(estimatedSalary.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                onChange={(e) => setEstimatedSalary(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <p className="form-helper-text">
              Opsional, digunakan untuk pengingat alokasi tabungan dan anggaran saat gajian tiba.
            </p>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              Simpan Tanggal Gajian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
