'use client';

import React from 'react';
import { ChevronRight, Bell } from 'lucide-react';

export default function Topbar({ activeNavLabel = 'Ringkasan', lastSync = 'Diperbarui 30 Sep 2026, 20.45' }) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span className="bc-muted">Keuangan pribadi</span>
        <ChevronRight className="bc-separator" size={14} strokeWidth={2.5} />
        <span className="bc-current">{activeNavLabel}</span>
      </div>

      <div className="topbar-right">
        <div className="sync-status">
          <span className="pulse-dot"></span>
          <span className="sync-text">{lastSync}</span>
        </div>
        <button 
          className="notif-btn" 
          aria-label="Notifikasi"
          onClick={() => alert('Tidak ada notifikasi baru.')}
        >
          <Bell size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

