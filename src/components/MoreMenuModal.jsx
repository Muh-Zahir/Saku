'use client';

import React from 'react';
import {
  BarChart3,
  Target,
  PieChart,
  Repeat,
  Lightbulb,
  ChevronRight,
  Bell,
  Smartphone,
  X
} from 'lucide-react';

export default function MoreMenuModal({
  isOpen,
  onClose,
  activeNav,
  onSelectNav,
  onOpenManageBudget,
  onOpenTransferModal,
  onOpenNotifications,
  unreadNotifsCount = 0
}) {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'notifikasi',
      label: 'Notifikasi & Pengingat',
      desc: unreadNotifsCount > 0 ? `${unreadNotifsCount} notifikasi baru butuh perhatian` : 'Peringatan saldo, budget, tagihan & gajian',
      icon: Bell,
      color: '#059669',
      bgColor: '#ecfdf5',
      action: () => {
        onClose();
        if (onOpenNotifications) onOpenNotifications();
      }
    },
    {
      id: 'laporan',
      label: 'Laporan Keuangan',
      desc: 'Grafik dan analisis cashflow bulanan',
      icon: BarChart3,
      color: '#0f766e',
      bgColor: '#ecfdf5',
      action: () => {
        onSelectNav('laporan');
        onClose();
      }
    },
    {
      id: 'target-tabungan',
      label: 'Target Tabungan',
      desc: 'Pantau target & progres tabungan impian',
      icon: Target,
      color: '#0369a1',
      bgColor: '#f0f9ff',
      action: () => {
        onSelectNav('target-tabungan');
        onClose();
      }
    },
    {
      id: 'kelola-anggaran',
      label: 'Kelola Anggaran',
      desc: 'Sesuaikan alokasi & batas pengeluaran kategori',
      icon: PieChart,
      color: '#b45309',
      bgColor: '#fffbeb',
      action: () => {
        onClose();
        if (onOpenManageBudget) onOpenManageBudget();
      }
    },
    {
      id: 'transfer',
      label: 'Transfer Saldo',
      desc: 'Pindahkan saldo antar dompet atau rekening',
      icon: Repeat,
      color: '#4338ca',
      bgColor: '#eef2ff',
      action: () => {
        onClose();
        if (onOpenTransferModal) onOpenTransferModal();
      }
    },
    {
      id: 'pasang-aplikasi',
      label: 'Pasang Aplikasi di HP',
      desc: 'Pasang Saku di layar utama untuk akses cepat & notifikasi',
      icon: Smartphone,
      color: '#134e3f',
      bgColor: '#e6f4ea',
      action: () => {
        onClose();
        if (typeof window !== 'undefined' && window.__triggerPwaInstall) {
          window.__triggerPwaInstall();
        }
      }
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog more-menu-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-title">Menu Lainnya</h3>
            <p className="modal-desc">Akses cepat menu dan fitur lainnya</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup menu">
            <X size={18} />
          </button>
        </div>

        <div className="more-menu-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`more-menu-item ${isCurrent ? 'active' : ''}`}
                onClick={item.action}
              >
                <div
                  className="more-menu-icon"
                  style={{ backgroundColor: item.bgColor, color: item.color }}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div className="more-menu-info">
                  <div className="more-menu-label">{item.label}</div>
                  <div className="more-menu-sub">{item.desc}</div>
                </div>
                <ChevronRight size={18} className="more-menu-arrow" />
              </button>
            );
          })}
        </div>

        {/* Tip card in modal */}
        <div className="more-menu-footer">
          <div className="more-menu-tip">
            <div className="more-menu-tip-icon">
              <Lightbulb size={16} stroke="#0f766e" strokeWidth={2.2} />
            </div>
            <div className="more-menu-tip-content">
              <strong>Tips Keuangan</strong>
              <p>Sisihkan minimal 20% pemasukan bulanan untuk tabungan & dana darurat.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
