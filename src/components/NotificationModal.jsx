'use client';

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  Clock,
  Calendar,
  PieChart,
  Target,
  BarChart2,
  Wallet,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function NotificationModal({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDeleteNotification,
  onActionClick,
  onOpenSettings,
  onTestNotification,
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'alerts', 'reminders'

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filterTab === 'alerts') return n.category === 'alert';
    if (filterTab === 'reminders') return n.category === 'reminder' || n.category === 'milestone';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotifIcon = (type, category) => {
    switch (type) {
      case 'low_balance':
        return (
          <div className="notif-icon-box icon-red">
            <Wallet size={18} strokeWidth={2.2} />
          </div>
        );
      case 'budget_100':
        return (
          <div className="notif-icon-box icon-red">
            <AlertTriangle size={18} strokeWidth={2.2} />
          </div>
        );
      case 'budget_80':
        return (
          <div className="notif-icon-box icon-amber">
            <PieChart size={18} strokeWidth={2.2} />
          </div>
        );
      case 'daily_reminder':
        return (
          <div className="notif-icon-box icon-green">
            <Clock size={18} strokeWidth={2.2} />
          </div>
        );
      case 'bill_due':
        return (
          <div className="notif-icon-box icon-amber">
            <Calendar size={18} strokeWidth={2.2} />
          </div>
        );
      case 'payday':
        return (
          <div className="notif-icon-box icon-mint">
            <Sparkles size={18} strokeWidth={2.2} />
          </div>
        );
      case 'savings_milestone':
        return (
          <div className="notif-icon-box icon-purple">
            <Target size={18} strokeWidth={2.2} />
          </div>
        );
      case 'weekly_summary':
        return (
          <div className="notif-icon-box icon-blue">
            <BarChart2 size={18} strokeWidth={2.2} />
          </div>
        );
      default:
        return (
          <div className="notif-icon-box icon-green">
            <Bell size={18} strokeWidth={2.2} />
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Baru saja';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-dialog notif-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header notif-modal-header">
          <div className="notif-header-title-wrap">
            <div className="notif-bell-badge-wrap">
              <Bell size={20} strokeWidth={2.2} stroke="#134e3f" />
              {unreadCount > 0 && <span className="notif-badge-count">{unreadCount}</span>}
            </div>
            <div>
              <h2 className="modal-title">Pusat Notifikasi</h2>
              <p className="modal-subtitle">
                {unreadCount > 0 ? `${unreadCount} notifikasi baru butuh perhatianmu` : 'Semua notifikasi telah dibaca'}
              </p>
            </div>
          </div>

          <div className="notif-header-actions">
            <button
              className="btn-icon-ghost"
              title="Pengaturan Notifikasi"
              onClick={() => {
                onClose();
                onOpenSettings && onOpenSettings();
              }}
              aria-label="Pengaturan Notifikasi"
            >
              <Settings size={18} stroke="#4b5563" />
            </button>
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Tutup"
            >
              <X size={20} stroke="#4b5563" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Quick Action Bar */}
        <div className="notif-toolbar-bar">
          <div className="notif-filter-tabs">
            <button
              className={`notif-tab ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              Semua ({notifications.length})
            </button>
            <button
              className={`notif-tab ${filterTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setFilterTab('alerts')}
            >
              Peringatan
            </button>
            <button
              className={`notif-tab ${filterTab === 'reminders' ? 'active' : ''}`}
              onClick={() => setFilterTab('reminders')}
            >
              Pengingat
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="notif-quick-actions">
              {unreadCount > 0 && (
                <button
                  className="btn-text-action"
                  onClick={onMarkAllAsRead}
                  title="Tandai semua dibaca"
                >
                  <CheckCheck size={14} />
                  <span>Baca Semua</span>
                </button>
              )}
              <button
                className="btn-text-action text-danger"
                onClick={onClearAll}
                title="Hapus semua notifikasi"
              >
                <Trash2 size={13} />
                <span>Bersihkan</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications List Body */}
        <div className="notif-list-body">
          {filteredNotifs.length === 0 ? (
            <div className="notif-empty-state">
              <div className="empty-notif-circle">
                <Bell size={32} stroke="#9ca3af" />
              </div>
              <h3 className="empty-notif-title">Belum ada notifikasi</h3>
              <p className="empty-notif-desc">
                Peringatan saldo menipis, batas anggaran 80%/100%, pengingat catat harian pukul 20:00, dan gajian akan muncul di sini.
              </p>
              {onTestNotification && (
                <button
                  type="button"
                  className="btn-test-notif-outline"
                  onClick={onTestNotification}
                >
                  <Sparkles size={15} stroke="#059669" />
                  <span>Kirim Notifikasi Uji Coba</span>
                </button>
              )}
            </div>
          ) : (
            <div className="notif-items-wrapper">
              {filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`notif-card-item ${!item.read ? 'is-unread' : ''}`}
                  onClick={() => onMarkAsRead && onMarkAsRead(item.id)}
                >
                  <div className="notif-card-left">
                    {getNotifIcon(item.type, item.category)}
                  </div>

                  <div className="notif-card-center">
                    <div className="notif-card-header-line">
                      <h4 className="notif-item-title">{item.title}</h4>
                      <span className="notif-time-ago">{formatTimestamp(item.timestamp)}</span>
                    </div>

                    <p className="notif-item-message">{item.message}</p>

                    {/* Actionable Shortcut Button */}
                    {item.action && (
                      <div className="notif-action-row">
                        <button
                          type="button"
                          className="btn-notif-action-pill"
                          onClick={(e) => {
                            e.stopPropagation();
                            onActionClick && onActionClick(item.action.target);
                            onMarkAsRead && onMarkAsRead(item.id);
                            onClose();
                          }}
                        >
                          <span>{item.action.label}</span>
                          <ArrowRight size={13} strokeWidth={2.4} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="notif-card-right">
                    <button
                      type="button"
                      className="btn-notif-delete-single"
                      title="Hapus notifikasi"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification && onDeleteNotification(item.id);
                      }}
                      aria-label="Hapus notifikasi"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="notif-modal-footer">
          <div className="notif-footer-hint">
            <Info size={14} stroke="#059669" />
            <span>Notifikasi otomatis dievaluasi secara cerdas saat ada transaksi atau perubahan saldo.</span>
          </div>
          <button
            type="button"
            className="btn-outline-action btn-sm-manage"
            onClick={() => {
              onClose();
              onOpenSettings && onOpenSettings();
            }}
          >
            <Settings size={15} strokeWidth={2} />
            <span>Pengaturan Pengingat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
