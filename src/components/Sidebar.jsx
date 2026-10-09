'use client';

import React from 'react';
import {
  LayoutGrid,
  ArrowUpDown,
  Wallet,
  PieChart,
  Target,
  BarChart3,
  Lightbulb,
  ArrowUpRight
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeNav, setActiveNav }) {
  const navItems = [
    { id: 'ringkasan', label: 'Ringkasan', icon: LayoutGrid },
    { id: 'transaksi', label: 'Transaksi', icon: ArrowUpDown },
    { id: 'dompet', label: 'Dompet', icon: Wallet },
    { id: 'anggaran', label: 'Anggaran', icon: PieChart },
    { id: 'target-tabungan', label: 'Target tabungan', icon: Target },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="appSidebar">
        <div className="sidebar-top">
          {/* Brand Logo */}
          <div className="brand-logo">
            <div className="logo-mark">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="7" fill="#134e3f"/>
                <circle cx="12" cy="12" r="7" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.3"/>
                <path d="M9 14.5C9 11.5 11.5 9 14.5 9C14.5 12 12 14.5 9 14.5Z" fill="#34d399"/>
                <path d="M12 9C12 6.5 14 4.5 16.5 4.5C16.5 7 14.5 9 12 9Z" fill="#a7f3d0"/>
                <path d="M8 13.5v2.5a1.5 1.5 0 001.5 1.5h4" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text">saku</span>
          </div>

          <div className="nav-section-title">KEUANGAN PRIBADI</div>

          {/* Navigation Menu */}
          <nav className="nav-menu" aria-label="Menu Utama">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveNav(item.id);
                    if (onClose) onClose();
                  }}
                >
                  <Icon className="nav-icon" size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          {/* Tip Card */}
          <div className="tip-card">
            <div className="tip-icon">
              <Lightbulb size={18} stroke="#0f766e" strokeWidth={2.2} />
            </div>
            <h4 className="tip-title">Langkah kecil, dampak besar.</h4>
            <p className="tip-desc">Catat pengeluaran rutin agar rencana keuanganmu tetap terarah.</p>
            <a 
              href="#tips" 
              className="tip-link"
              onClick={(e) => {
                e.preventDefault();
                alert('Tips: Sisihkan minimal 20% pemasukan bulanan untuk pos tabungan dan investasi sedini mungkin.');
              }}
            >
              <span>Baca tips keuangan</span>
              <ArrowUpRight size={13} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

