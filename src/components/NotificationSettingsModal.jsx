'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Clock,
  Wallet,
  PieChart,
  Calendar,
  Sparkles,
  Target,
  BarChart2,
  Volume2,
  Check,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { requestPushPermission } from '../utils/notificationService';

export default function NotificationSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTestNotification,
  onTestBackgroundPush,
  addToast
}) {
  const [formSettings, setFormSettings] = useState(settings || {});
  const [pushStatus, setPushStatus] = useState('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormSettings(settings ? { ...settings } : {});
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPushStatus(Notification.permission);
      }
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setFormSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key, value) => {
    setFormSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRequestPush = async () => {
    setIsRequestingPermission(true);
    const perm = await requestPushPermission();
    setIsRequestingPermission(false);
    setPushStatus(perm);
    if (perm === 'granted') {
      addToast && addToast('Izin notifikasi HP/browser berhasil diaktifkan!', 'success');
    } else if (perm === 'denied') {
      addToast && addToast('Izin notifikasi diblokir browser. Buka setelan browser untuk mengizinkan.', 'error');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formSettings);
    addToast && addToast('Pengaturan notifikasi berhasil disimpan!');
    onClose();
  };

  const formatThresholdInput = (val) => {
    const num = parseInt(String(val || '').replace(/\D/g, ''), 10);
    return isNaN(num) ? '0' : num.toLocaleString('id-ID');
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-dialog notif-settings-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="notif-header-title-wrap">
            <div className="notif-settings-icon-box">
              <Bell size={20} strokeWidth={2.2} stroke="#059669" />
            </div>
            <div>
              <h2 className="modal-title">Pengaturan Notifikasi</h2>
              <p className="modal-subtitle">Atur preferensi pengingat, batas saldo, dan jam notifikasi</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={20} stroke="#4b5563" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="notif-settings-body">
          {/* Master Push Permission Banner */}
          <div className="push-permission-card">
            <div className="push-permission-info">
              <div className="push-badge-row">
                <ShieldCheck size={18} stroke="#059669" strokeWidth={2.2} />
                <span className="push-badge-title">Notifikasi Push Browser & HP</span>
                <span className={`status-pill ${pushStatus === 'granted' ? 'pill-green' : 'pill-amber'}`}>
                  {pushStatus === 'granted' ? 'Aktif' : pushStatus === 'denied' ? 'Diblokir' : 'Belum Aktif'}
                </span>
              </div>
              <p className="push-permission-desc">
                Agar pengingat muncul di layar HP atau desktop meskipun aplikasi sedang tertutup.
              </p>
            </div>
            {pushStatus !== 'granted' && (
              <button
                type="button"
                className="btn-enable-push"
                onClick={handleRequestPush}
                disabled={isRequestingPermission}
              >
                {isRequestingPermission ? 'Meminta izin...' : 'Aktifkan di HP / Browser'}
              </button>
            )}
          </div>

          {/* Master Switch */}
          <div className="setting-toggle-row master-toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Semua Notifikasi Saku</span>
              <span className="toggle-desc">Nyalakan atau matikan seluruh pengingat otomatis</span>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={formSettings.enabled}
                onChange={() => handleToggle('enabled')}
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          <div className={`settings-sub-group ${!formSettings.enabled ? 'is-disabled' : ''}`}>
            {/* 1. Pengingat Rutin Harian (Daily Expense Tracker) */}
            <div className="setting-card-item">
              <div className="setting-card-top">
                <div className="setting-item-icon icon-green">
                  <Clock size={18} strokeWidth={2.2} />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Pengingat Catat Harian</span>
                  <span className="setting-desc">
                    Hanya dikirim jika belum ada pengeluaran yang dicatat pada hari tersebut (Smart Suppression).
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formSettings.dailyReminder}
                    onChange={() => handleToggle('dailyReminder')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {formSettings.dailyReminder && (
                <div className="setting-inline-config">
                  <span className="config-label">Jam Pengingat:</span>
                  <input
                    type="time"
                    className="time-picker-input"
                    value={formSettings.dailyReminderTime || '20:00'}
                    onChange={(e) => handleChange('dailyReminderTime', e.target.value)}
                  />
                  <span className="config-hint">(Default pukul 20:00 malam)</span>
                </div>
              )}
            </div>

            {/* 2. Peringatan Saldo Menipis (Low Balance Alert) */}
            <div className="setting-card-item">
              <div className="setting-card-top">
                <div className="setting-item-icon icon-red">
                  <Wallet size={18} strokeWidth={2.2} />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Peringatan Saldo Menipis</span>
                  <span className="setting-desc">
                    Muncul saat total saldo gabungan seluruh dompet menyentuh atau berada di bawah batas minimum.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formSettings.lowBalanceAlert}
                    onChange={() => handleToggle('lowBalanceAlert')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {formSettings.lowBalanceAlert && (
                <div className="setting-inline-config">
                  <span className="config-label">Batas Minimum Saldo:</span>
                  <div className="nominal-input-box-sm">
                    <span className="nominal-prefix">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="nominal-field-sm"
                      value={formatThresholdInput(formSettings.lowBalanceThreshold)}
                      onChange={(e) => {
                        const raw = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                        handleChange('lowBalanceThreshold', raw);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Peringatan Anggaran (Budget Threshold 80% & 100%) */}
            <div className="setting-card-item">
              <div className="setting-card-top">
                <div className="setting-item-icon icon-amber">
                  <PieChart size={18} strokeWidth={2.2} />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Peringatan Batas Anggaran (80% & 100%)</span>
                  <span className="setting-desc">
                    Memberi peringatan dini saat pengeluaran kategori mencapai 80% dan saat melebihi batas 100%.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formSettings.budgetAlert}
                    onChange={() => handleToggle('budgetAlert')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {formSettings.budgetAlert && (
                <div className="setting-sub-checkboxes">
                  <label className="checkbox-sub-label">
                    <input
                      type="checkbox"
                      checked={formSettings.budgetThreshold80}
                      onChange={() => handleToggle('budgetThreshold80')}
                    />
                    <span>Waspada batas 80%</span>
                  </label>
                  <label className="checkbox-sub-label">
                    <input
                      type="checkbox"
                      checked={formSettings.budgetThreshold100}
                      onChange={() => handleToggle('budgetThreshold100')}
                    />
                    <span>Peringatan melewati batas 100%</span>
                  </label>
                </div>
              )}
            </div>

            {/* 4. Pengingat Jatuh Tempo Tagihan (Bill Due Date H-3 & H-1) */}
            <div className="setting-card-item">
              <div className="setting-card-top">
                <div className="setting-item-icon icon-amber">
                  <Calendar size={18} strokeWidth={2.2} />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Pengingat Tagihan (H-3 & H-1)</span>
                  <span className="setting-desc">
                    Memberikan pengingat sebelum tagihan rutin (listrik, air, kos, wifi) jatuh tempo.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formSettings.billReminder}
                    onChange={() => handleToggle('billReminder')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>

            {/* 5. Alokasi Gajian (Payday Allocation) */}
            <div className="setting-card-item">
              <div className="setting-card-top">
                <div className="setting-item-icon icon-mint">
                  <Sparkles size={18} strokeWidth={2.2} />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Pengingat Hari Gajian</span>
                  <span className="setting-desc">
                    Mengingatkan untuk langsung mengalokasikan gaji ke pos tabungan dan kebutuhan.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formSettings.paydayAlert}
                    onChange={() => handleToggle('paydayAlert')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {formSettings.paydayAlert && (
                <div className="setting-inline-config">
                  <span className="config-label">Tanggal Gajian:</span>
                  <select
                    className="payday-select"
                    value={formSettings.paydayDate || 25}
                    onChange={(e) => handleChange('paydayDate', parseInt(e.target.value, 10))}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Setiap tanggal {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 6. Milestone Target Tabungan (50%, 75%, 100%) */}
            <div className="setting-card-item">
              <div className="setting-card-top">
                <div className="setting-item-icon icon-purple">
                  <Target size={18} strokeWidth={2.2} />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Milestone Target Tabungan</span>
                  <span className="setting-desc">
                    Apresiasi dan pengingat saat tabungan mencapai progres 50%, 75%, dan 100%.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formSettings.savingsMilestone}
                    onChange={() => handleToggle('savingsMilestone')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>

            {/* 7. Ringkasan Mingguan (Weekly Summary) */}
            <div className="setting-card-item">
              <div className="setting-card-top">
                <div className="setting-item-icon icon-blue">
                  <BarChart2 size={18} strokeWidth={2.2} />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Evaluasi Keuangan Mingguan</span>
                  <span className="setting-desc">
                    Setiap hari Minggu pukul 19:00: Ringkasan perbandingan pengeluaran mingguan.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formSettings.weeklySummary}
                    onChange={() => handleToggle('weeklySummary')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>

            {/* 8. Suara Notifikasi */}
            <div className="setting-card-item">
              <div className="setting-card-top">
                <div className="setting-item-icon icon-green">
                  <Volume2 size={18} strokeWidth={2.2} />
                </div>
                <div className="setting-item-text">
                  <span className="setting-title">Suara & Efek Audio Notifikasi</span>
                  <span className="setting-desc">
                    Memutar nada lonceng lembut saat ada notifikasi atau saldo menipis.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formSettings.soundEnabled}
                    onChange={() => handleToggle('soundEnabled')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Test Notification Action */}
          <div className="test-notif-box">
            <div className="test-notif-left">
              <Send size={18} stroke="#059669" strokeWidth={2.2} />
              <div>
                <span className="test-notif-title">Uji Coba Notifikasi Sistem</span>
                <span className="test-notif-desc">
                  Pastikan izin notifikasi aktif agar bubble notifikasi muncul di layar HP / lockscreen.
                </span>
              </div>
            </div>
            <div className="test-notif-actions">
              <button
                type="button"
                className="btn-run-test-notif"
                onClick={() => onTestNotification && onTestNotification()}
              >
                Tes Pop-up Langsung
              </button>
              <button
                type="button"
                className="btn-run-test-notif btn-test-background"
                onClick={() => onTestBackgroundPush && onTestBackgroundPush(5)}
                title="Kirim notifikasi dalam 5 detik agar Anda sempat mengunci HP"
              >
                Tes Saat HP Ditutup (5 dtk)
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="notif-settings-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
