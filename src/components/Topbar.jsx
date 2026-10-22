'use client';

import React from 'react';
import { ChevronRight, Bell } from 'lucide-react';

export default function Topbar({
  activeNavLabel = 'Ringkasan',
  lastSync = 'Diperbarui 30 Sep 2026, 20.45',
  unreadCount = 0,
  onOpenNotifications
}) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span className="bc-muted">Keuangan pribadi</span>
        <ChevronRight className="bc-separator" size={14} strokeWidth={2.5} />
        <span className="bc-current">{activeNavLabel}</span>
      </div>

      <div className="topbar-right">
        <button 
          className="notif-btn" 
          aria-label="Notifikasi"
          onClick={onOpenNotifications}
        >
          <Bell size={18} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="topbar-notif-dot">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

