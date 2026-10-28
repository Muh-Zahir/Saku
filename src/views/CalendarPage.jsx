'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Repeat,
  DollarSign,
  CreditCard,
  Zap,
  Layers,
  Sparkles,
  Bell,
  Trash2,
  Edit2,
  CalendarDays,
  List,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { formatSimpleIDR, formatIDR } from '../utils/formatters';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function CalendarPage({
  currentPeriod = 'Oktober 2026',
  onSelectPeriod,
  schedules = [],
  transactions = [],
  wallets = [],
  paydayDate = 25,
  onOpenAddSchedule,
  onOpenEditSchedule,
  onTogglePaid,
  onDeleteSchedule,
  onOpenPaydaySetting,
  onMarkPaidWithTransaction,
  addToast
}) {
  // Parse month and year from currentPeriod
  const periodParts = String(currentPeriod).trim().split(/\s+/);
  const currentMonthName = periodParts[0] || 'Oktober';
  const currentYearNum = parseInt(periodParts[1], 10) || 2026;
  const currentMonthIndex = Math.max(0, MONTH_NAMES.indexOf(currentMonthName));

  // Mode Tampilan: 'grid' (Kalender Bulanan) atau 'agenda' (Daftar List)
  const [viewMode, setViewMode] = useState('grid');
  // Selected date for detailed view panel / bottom sheet
  const [selectedDate, setSelectedDate] = useState(null);
  // Filter for Agenda view
  const [agendaFilter, setAgendaFilter] = useState('all'); // 'all', 'debt', 'bill', 'installment', 'subscription', 'paid'

  // Modal dialog konfirmasi catat transaksi saat bayar utang/tagihan
  const [promptPaidItem, setPromptPaidItem] = useState(null);

  // Real world current date
  const now = new Date();
  const realTodayYear = now.getFullYear();
  const realTodayMonth = now.getMonth();
  const realTodayDate = now.getDate();
  const todayStr = `${realTodayYear}-${String(realTodayMonth + 1).padStart(2, '0')}-${String(realTodayDate).padStart(2, '0')}`;

  // =========================================================================
  // 1. HITUNG HITUNG MUNDUR GAJIAN (COUNTDOWN)
  // =========================================================================
  const paydayCountdown = useMemo(() => {
    let targetPayday = new Date(realTodayYear, realTodayMonth, paydayDate);
    // Jika hari ini sudah melewati tanggal gajian bulan ini, targetkan bulan depan
    if (now.getTime() >= targetPayday.getTime()) {
      targetPayday = new Date(realTodayYear, realTodayMonth + 1, paydayDate);
    }
    const diffMs = targetPayday.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Siklus: hitung berapa hari dari tanggal gajian sebelumnya
    let prevPayday = new Date(realTodayYear, realTodayMonth, paydayDate);
    if (now.getTime() < prevPayday.getTime()) {
      prevPayday = new Date(realTodayYear, realTodayMonth - 1, paydayDate);
    }
    const totalCycleMs = targetPayday.getTime() - prevPayday.getTime();
    const elapsedMs = Math.max(0, now.getTime() - prevPayday.getTime());
    const cycleProgress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalCycleMs) * 100)));
    const elapsedDays = Math.round(elapsedMs / (1000 * 60 * 60 * 24));

    const targetDateFormatted = `${paydayDate} ${MONTH_NAMES[targetPayday.getMonth()]} ${targetPayday.getFullYear()}`;

    return {
      daysRemaining,
      targetDateFormatted,
      cycleProgress,
      elapsedDays,
      isPaydayToday: realTodayDate === paydayDate,
    };
  }, [realTodayYear, realTodayMonth, realTodayDate, paydayDate]);

  // =========================================================================
  // 2. NAVIGASI BULAN
  // =========================================================================
  const handlePrevMonth = () => {
    const prevMonthIdx = (currentMonthIndex + 11) % 12;
    const prevYear = currentMonthIndex === 0 ? currentYearNum - 1 : currentYearNum;
    if (onSelectPeriod) {
      onSelectPeriod(`${MONTH_NAMES[prevMonthIdx]} ${prevYear}`);
    }
  };

  const handleNextMonth = () => {
    const nextMonthIdx = (currentMonthIndex + 1) % 12;
    const nextYear = currentMonthIndex === 11 ? currentYearNum + 1 : currentYearNum;
    if (onSelectPeriod) {
      onSelectPeriod(`${MONTH_NAMES[nextMonthIdx]} ${nextYear}`);
    }
  };

  const handleJumpToToday = () => {
    if (onSelectPeriod) {
      onSelectPeriod(`${MONTH_NAMES[realTodayMonth]} ${realTodayYear}`);
    }
    setSelectedDate(todayStr);
  };

  // =========================================================================
  // 3. GENERATE CALENDAR MATRIX
  // =========================================================================
  const calendarDays = useMemo(() => {
    const year = currentYearNum;
    const month = currentMonthIndex;

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Hari dalam seminggu untuk tgl 1 (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
    // Ubah agar hari Senin = 0, Minggu = 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Hari dari bulan sebelumnya
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days = [];

    // Padding bulan lalu
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevMonth = (month + 11) % 12;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Hari-hari bulan ini
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPayday: d === paydayDate,
      });
    }

    // Padding bulan depan agar total cell kelipatan 7 (35 atau 42 cell)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonth = (month + 1) % 12;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [currentYearNum, currentMonthIndex, todayStr, paydayDate]);

  // =========================================================================
  // 4. MAPPING JADWAL & TRANSAKSI KE TANGGAL
  // =========================================================================
  const { dateItemsMap, summaryMetrics } = useMemo(() => {
    const map = {};
    let totalUnpaidDebt = 0;
    let unpaidDebtCount = 0;
    let totalBillsThisMonth = 0;
    let unpaidBillsCount = 0;
    let totalPaidThisMonth = 0;
    let paidCountThisMonth = 0;

    const currentMonthPrefix = `${currentYearNum}-${String(currentMonthIndex + 1).padStart(2, '0')}`;

    // 1. Map Schedules
    schedules.forEach((item) => {
      let targetDateStr = item.due_date;

      // Jika recurring monthly, pasangkan ke bulan ini sesuai recurring_day atau tanggal due_date
      if (item.recurring === 'monthly') {
        const day = item.recurring_day || parseInt(item.due_date.split('-')[2], 10) || 1;
        targetDateStr = `${currentYearNum}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      if (!map[targetDateStr]) {
        map[targetDateStr] = { schedules: [], transactions: [] };
      }
      map[targetDateStr].schedules.push(item);

      // Metrik perhitungan untuk bulan ini
      if (targetDateStr.startsWith(currentMonthPrefix)) {
        if (item.is_paid) {
          totalPaidThisMonth += item.amount;
          paidCountThisMonth += 1;
        } else {
          if (item.type === 'debt') {
            totalUnpaidDebt += item.amount;
            unpaidDebtCount += 1;
          } else {
            totalBillsThisMonth += item.amount;
            unpaidBillsCount += 1;
          }
        }
      }
    });

    // 2. Map Transactions
    transactions.forEach((tx) => {
      let txDateStr = '';
      if (tx.date && /^\d{4}-\d{2}-\d{2}/.test(tx.date)) {
        txDateStr = tx.date.split('T')[0];
      } else if (tx.date) {
        // Coba ekstrak hari
        const match = String(tx.date).match(/^(\d{1,2})/);
        if (match) {
          const d = match[1].padStart(2, '0');
          txDateStr = `${currentYearNum}-${String(currentMonthIndex + 1).padStart(2, '0')}-${d}`;
        }
      }

      if (txDateStr) {
        if (!map[txDateStr]) {
          map[txDateStr] = { schedules: [], transactions: [] };
        }
        map[txDateStr].transactions.push(tx);
      }
    });

    return {
      dateItemsMap: map,
      summaryMetrics: {
        totalUnpaidDebt,
        unpaidDebtCount,
        totalBillsThisMonth,
        unpaidBillsCount,
        totalPaidThisMonth,
        paidCountThisMonth,
      },
    };
  }, [schedules, transactions, currentYearNum, currentMonthIndex]);

  // =========================================================================
  // 5. AGENDA FILTER & GROUPING
  // =========================================================================
  const filteredAgenda = useMemo(() => {
    let list = [...schedules];

    if (agendaFilter === 'debt') {
      list = list.filter((s) => s.type === 'debt');
    } else if (agendaFilter === 'bill') {
      list = list.filter((s) => s.type === 'bill');
    } else if (agendaFilter === 'installment') {
      list = list.filter((s) => s.type === 'installment');
    } else if (agendaFilter === 'subscription') {
      list = list.filter((s) => s.type === 'subscription');
    } else if (agendaFilter === 'paid') {
      list = list.filter((s) => s.is_paid);
    } else if (agendaFilter === 'unpaid') {
      list = list.filter((s) => !s.is_paid);
    }

    // Urutkan berdasarkan tanggal jatuh tempo terdekat
    list.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    // Hitung status jatuh tempo relatif
    return list.map((item) => {
      const targetTime = new Date(item.due_date).getTime();
      const todayTime = new Date(todayStr).getTime();
      const diffDays = Math.round((targetTime - todayTime) / (1000 * 60 * 60 * 24));

      let dueStatus = 'normal';
      let dueText = '';

      if (item.is_paid) {
        dueStatus = 'paid';
        dueText = item.paid_at ? `Lunas (${item.paid_at})` : 'Sudah Lunas';
      } else if (diffDays < 0) {
        dueStatus = 'overdue';
        dueText = `Lewat ${Math.abs(diffDays)} hari!`;
      } else if (diffDays === 0) {
        dueStatus = 'today';
        dueText = 'Jatuh tempo Hari Ini!';
      } else if (diffDays <= 3) {
        dueStatus = 'urgent';
        dueText = `${diffDays} hari lagi`;
      } else {
        dueStatus = 'upcoming';
        dueText = `${diffDays} hari lagi`;
      }

      return {
        ...item,
        dueStatus,
        dueText,
        diffDays,
      };
    });
  }, [schedules, agendaFilter, todayStr]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return null;
    const data = dateItemsMap[selectedDate] || { schedules: [], transactions: [] };
    const parts = selectedDate.split('-');
    const formatted = `${parseInt(parts[2], 10)} ${MONTH_NAMES[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    const isPayday = parseInt(parts[2], 10) === paydayDate;
    return {
      dateStr: selectedDate,
      formatted,
      isPayday,
      schedules: data.schedules,
      transactions: data.transactions,
    };
  }, [selectedDate, dateItemsMap, paydayDate]);

  // Format Helper
  const getTypeBadge = (type) => {
    switch (type) {
      case 'debt':
        return { label: 'Utang', color: '#e11d48', bg: '#ffe4e6', icon: CreditCard };
      case 'bill':
        return { label: 'Tagihan', color: '#d97706', bg: '#fef3c7', icon: Zap };
      case 'installment':
        return { label: 'Cicilan', color: '#7c3aed', bg: '#ede9fe', icon: Layers };
      case 'subscription':
        return { label: 'Langganan', color: '#0d9488', bg: '#ccfbf1', icon: Sparkles };
      default:
        return { label: 'Pengingat', color: '#0284c7', bg: '#e0f2fe', icon: Bell };
    }
  };

  const handleToggleClick = (item) => {
    if (!item.is_paid) {
      // Tampilkan prompt apakah ingin dicatat otomatis ke transaksi
      setPromptPaidItem(item);
    } else {
      // Langsung batalkan status lunas
      onTogglePaid(item.id, false);
      addToast(`Status "${item.title}" diubah menjadi Belum Lunas`, 'info');
    }
  };

  const handleConfirmPaidWithTransaction = (recordTransaction = true) => {
    if (!promptPaidItem) return;
    if (recordTransaction && onMarkPaidWithTransaction) {
      onMarkPaidWithTransaction(promptPaidItem);
    } else {
      onTogglePaid(promptPaidItem.id, true);
      addToast(`Jatuh tempo "${promptPaidItem.title}" ditandai sudah lunas!`, 'success');
    }
    setPromptPaidItem(null);
  };

  return (
    <div className="calendar-page-container">
      {/* 1. Header Halaman */}
      <div className="calendar-header-section">
        <div className="calendar-title-group">
          <div className="calendar-badge-tag">
            <CalendarDays size={15} />
            <span>AGENDA & TANGGAL PENTING</span>
          </div>
          <h1 className="calendar-page-title">Kalender Keuangan</h1>
          <p className="calendar-page-desc">
            Pantau hitung mundur hari gajian, jatuh tempo utang, tagihan rutin, dan riwayat pengeluaran harian.
          </p>
        </div>

        <div className="calendar-top-actions">
          {/* Mode Switcher Desktop & Mobile */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <CalendarIcon size={16} />
              <span>Kalender</span>
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === 'agenda' ? 'active' : ''}`}
              onClick={() => setViewMode('agenda')}
            >
              <List size={16} />
              <span>Agenda ({schedules.length})</span>
            </button>
          </div>

          {/* Tombol Tambah Jadwal */}
          <button
            type="button"
            className="btn-primary-action btn-add-schedule"
            onClick={() => onOpenAddSchedule(selectedDate || todayStr)}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Card: Countdown Menuju Gajian (Showstopper Widget) */}
      <div className="payday-hero-card">
        <div className="payday-hero-bg-glow" />
        <div className="payday-hero-content">
          <div className="payday-hero-left">
            <div className="payday-chip">
              <span className="payday-chip-dot" />
              <span>SIKLUS GAJIAN TIAP TGL {paydayDate}</span>
            </div>

            <div className="payday-countdown-main">
              {paydayCountdown.isPaydayToday ? (
                <>
                  <span className="payday-highlight-number">Hari Ini!</span>
                  <span className="payday-highlight-label">🎉 Selamat Gajian Tiba!</span>
                </>
              ) : (
                <>
                  <span className="payday-highlight-number">{paydayCountdown.daysRemaining}</span>
                  <div className="payday-number-label-group">
                    <span className="payday-highlight-unit">Hari Lagi</span>
                    <span className="payday-highlight-sub">Menuju Gajian Berikutnya</span>
                  </div>
                </>
              )}
            </div>

            <p className="payday-target-info">
              Gajian berikutnya jatuh pada <strong>{paydayCountdown.targetDateFormatted}</strong>.
              {paydayCountdown.daysRemaining > 0 && (
                <span> Bertahan hemat dan kontrol pos pengeluaran ya! 💪</span>
              )}
            </p>

            {/* Cycle Progress bar */}
            <div className="payday-cycle-progress-wrap">
              <div className="payday-cycle-progress-bar">
                <div
                  className="payday-cycle-progress-fill"
                  style={{ width: `${paydayCountdown.cycleProgress}%` }}
                />
              </div>
              <div className="payday-cycle-progress-labels">
                <span>Hari ke-{paydayCountdown.elapsedDays}</span>
                <span>{paydayCountdown.cycleProgress}% siklus berjalan</span>
              </div>
            </div>
          </div>

          <div className="payday-hero-right">
            <div className="payday-action-card">
              <div className="payday-action-icon">
                <SlidersHorizontal size={20} />
              </div>
              <div className="payday-action-text">
                <strong>Beda Tanggal Gajian?</strong>
                <p>Ubah tanggal gajian sesuai ketentuan kantormu (default tgl {paydayDate}).</p>
              </div>
              <button
                type="button"
                className="btn-payday-setting"
                onClick={onOpenPaydaySetting}
              >
                <span>Atur Tanggal Gajian</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Summary Metric Cards */}
      <div className="calendar-metrics-grid">
        <div className="cal-metric-card">
          <div className="cal-metric-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <Clock size={18} />
          </div>
          <div className="cal-metric-data">
            <span className="cal-metric-title">Hitung Mundur Gajian</span>
            <strong className="cal-metric-val">
              {paydayCountdown.isPaydayToday ? 'Hari Ini!' : `${paydayCountdown.daysRemaining} Hari`}
            </strong>
            <span className="cal-metric-desc">Tgl {paydayDate} tiap bulan</span>
          </div>
        </div>

        <div className="cal-metric-card">
          <div className="cal-metric-icon" style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}>
            <CreditCard size={18} />
          </div>
          <div className="cal-metric-data">
            <span className="cal-metric-title">Utang Belum Lunas</span>
            <strong className="cal-metric-val">
              {formatSimpleIDR(summaryMetrics.totalUnpaidDebt)}
            </strong>
            <span className="cal-metric-desc">
              {summaryMetrics.unpaidDebtCount} komitmen perlu dibayar
            </span>
          </div>
        </div>

        <div className="cal-metric-card">
          <div className="cal-metric-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Zap size={18} />
          </div>
          <div className="cal-metric-data">
            <span className="cal-metric-title">Tagihan & Cicilan Bulan Ini</span>
            <strong className="cal-metric-val">
              {formatSimpleIDR(summaryMetrics.totalBillsThisMonth)}
            </strong>
            <span className="cal-metric-desc">
              {summaryMetrics.unpaidBillsCount} tagihan menanti
            </span>
          </div>
        </div>

        <div className="cal-metric-card">
          <div className="cal-metric-icon" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="cal-metric-data">
            <span className="cal-metric-title">Sudah Dibayar Bulan Ini</span>
            <strong className="cal-metric-val">
              {formatSimpleIDR(summaryMetrics.totalPaidThisMonth)}
            </strong>
            <span className="cal-metric-desc">
              {summaryMetrics.paidCountThisMonth} kewajiban telah lunas
            </span>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT: GRID VIEW OR AGENDA VIEW */}
      {viewMode === 'grid' ? (
        <div className="calendar-grid-layout">
          {/* Calendar Main Grid Card */}
          <div className="calendar-board-card">
            {/* Board Header: Month Navigator */}
            <div className="calendar-board-header">
              <div className="calendar-month-nav">
                <button
                  type="button"
                  className="nav-month-btn"
                  onClick={handlePrevMonth}
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>
                <h2 className="current-month-display">
                  {currentMonthName} {currentYearNum}
                </h2>
                <button
                  type="button"
                  className="nav-month-btn"
                  onClick={handleNextMonth}
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="calendar-board-tools">
                <button
                  type="button"
                  className="btn-today-shortcut"
                  onClick={handleJumpToToday}
                >
                  Hari Ini
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="calendar-week-header-grid">
              {DAY_NAMES.map((name, i) => (
                <div
                  key={name}
                  className={`calendar-week-col-name ${i >= 5 ? 'weekend' : ''}`}
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="calendar-cells-grid">
              {calendarDays.map((cell) => {
                const cellData = dateItemsMap[cell.dateStr] || { schedules: [], transactions: [] };
                const hasSchedules = cellData.schedules.length > 0;
                const hasTransactions = cellData.transactions.length > 0;
                const isSelected = selectedDate === cell.dateStr;

                return (
                  <div
                    key={cell.dateStr}
                    className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${
                      cell.isToday ? 'is-today' : ''
                    } ${cell.isPayday ? 'is-payday-cell' : ''} ${isSelected ? 'is-selected-cell' : ''}`}
                    onClick={() => setSelectedDate(cell.dateStr)}
                  >
                    <div className="cell-top-bar">
                      <span className={`cell-day-number ${cell.isToday ? 'today-pill' : ''}`}>
                        {cell.dayNumber}
                      </span>
                      {cell.isPayday && (
                        <span className="cell-payday-badge" title="Hari Gajian!">
                          🚀 Gajian
                        </span>
                      )}
                    </div>

                    {/* Event indicators / pills */}
                    <div className="cell-events-container">
                      {cellData.schedules.slice(0, 3).map((item) => {
                        const badgeInfo = getTypeBadge(item.type);
                        return (
                          <div
                            key={item.id}
                            className={`cell-event-pill ${item.is_paid ? 'is-paid' : ''}`}
                            style={{
                              backgroundColor: item.is_paid ? '#f3f4f6' : badgeInfo.bg,
                              color: item.is_paid ? '#9ca3af' : badgeInfo.color,
                              borderColor: item.is_paid ? '#e5e7eb' : badgeInfo.bg,
                            }}
                            title={`${item.title} - ${formatSimpleIDR(item.amount)}`}
                          >
                            <span className="cell-event-dot" style={{ backgroundColor: item.is_paid ? '#9ca3af' : badgeInfo.color }} />
                            <span className="cell-event-title">{item.title}</span>
                          </div>
                        );
                      })}

                      {cellData.schedules.length > 3 && (
                        <span className="cell-more-badge">
                          +{cellData.schedules.length - 3} lainnya
                        </span>
                      )}

                      {/* Dot for logged transactions */}
                      {hasTransactions && (
                        <div className="cell-tx-indicator">
                          <span className="tx-mini-dot" />
                          <span className="tx-mini-count">{cellData.transactions.length} transaksi</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Detail Panel: Detail Tanggal yang Dipilih */}
          <div className="calendar-side-panel">
            {selectedDateEvents ? (
              <div className="selected-date-card">
                <div className="selected-date-header">
                  <div className="selected-date-title-wrap">
                    <span className="selected-date-sub">Detail Agenda Tanggal</span>
                    <h3 className="selected-date-title">{selectedDateEvents.formatted}</h3>
                  </div>
                  {selectedDateEvents.isPayday && (
                    <span className="payday-special-tag">🚀 Hari Gajian</span>
                  )}
                </div>

                {/* List Schedules on Selected Date */}
                <div className="selected-date-body">
                  <div className="section-label-group">
                    <span className="section-label">Jadwal Finansial ({selectedDateEvents.schedules.length})</span>
                    <button
                      type="button"
                      className="btn-add-on-date"
                      onClick={() => onOpenAddSchedule(selectedDateEvents.dateStr)}
                    >
                      <Plus size={14} />
                      <span>Tambah di Tanggal Ini</span>
                    </button>
                  </div>

                  {selectedDateEvents.schedules.length === 0 ? (
                    <div className="empty-date-state">
                      <p>Tidak ada utang atau tagihan jatuh tempo di tanggal ini.</p>
                      <button
                        type="button"
                        className="btn-inline-add"
                        onClick={() => onOpenAddSchedule(selectedDateEvents.dateStr)}
                      >
                        + Tambah jadwal bayar utang / tagihan
                      </button>
                    </div>
                  ) : (
                    <div className="selected-schedules-list">
                      {selectedDateEvents.schedules.map((item) => {
                        const badge = getTypeBadge(item.type);
                        return (
                          <div
                            key={item.id}
                            className={`schedule-item-card ${item.is_paid ? 'is-paid' : ''}`}
                          >
                            <div className="schedule-item-main">
                              <button
                                type="button"
                                className={`btn-check-toggle ${item.is_paid ? 'checked' : ''}`}
                                onClick={() => handleToggleClick(item)}
                                aria-label={item.is_paid ? 'Tandai belum dibayar' : 'Tandai sudah dibayar'}
                              >
                                {item.is_paid ? <Check size={14} strokeWidth={3} /> : null}
                              </button>

                              <div className="schedule-item-info">
                                <div className="schedule-item-title-row">
                                  <span
                                    className="schedule-item-type-badge"
                                    style={{ backgroundColor: badge.bg, color: badge.color }}
                                  >
                                    {badge.label}
                                  </span>
                                  {item.recurring === 'monthly' && (
                                    <span className="recurring-badge" title="Berulang tiap bulan">
                                      <Repeat size={11} /> Rutin
                                    </span>
                                  )}
                                  <span className={`schedule-item-title ${item.is_paid ? 'strike' : ''}`}>
                                    {item.title}
                                  </span>
                                </div>

                                {item.notes && (
                                  <p className="schedule-item-notes">{item.notes}</p>
                                )}

                                <div className="schedule-item-footer">
                                  <strong className="schedule-item-amount">
                                    {formatSimpleIDR(item.amount)}
                                  </strong>
                                  {item.wallet_name && (
                                    <span className="schedule-item-wallet">
                                      💳 {item.wallet_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="schedule-item-actions">
                              <button
                                type="button"
                                className="action-icon-btn edit-btn"
                                onClick={() => onOpenEditSchedule(item)}
                                title="Ubah jadwal"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn delete-btn"
                                onClick={() => {
                                  if (confirm(`Hapus jadwal "${item.title}"?`)) {
                                    onDeleteSchedule(item.id);
                                  }
                                }}
                                title="Hapus jadwal"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Riwayat Transaksi pada Tanggal Ini */}
                  {selectedDateEvents.transactions.length > 0 && (
                    <div className="selected-date-tx-section">
                      <span className="section-label">
                        Transaksi Dicatat ({selectedDateEvents.transactions.length})
                      </span>
                      <div className="selected-tx-list">
                        {selectedDateEvents.transactions.map((tx) => (
                          <div key={tx.id} className="selected-tx-item">
                            <div className="selected-tx-title-wrap">
                              <span className="selected-tx-title">{tx.title}</span>
                              <span className="selected-tx-cat">{tx.category} · {tx.wallet}</span>
                            </div>
                            <span className={`selected-tx-amt ${tx.type}`}>
                              {formatIDR(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="side-panel-placeholder">
                <div className="placeholder-icon">
                  <CalendarIcon size={32} />
                </div>
                <h4>Pilih Tanggal di Kalender</h4>
                <p>Klik tanggal mana saja di grid kalender untuk melihat atau menambahkan jadwal finansial pada tanggal tersebut.</p>
                <button
                  type="button"
                  className="btn-select-today"
                  onClick={handleJumpToToday}
                >
                  Lihat Hari Ini ({realTodayDate} {MONTH_NAMES[realTodayMonth]})
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 5. AGENDA / LIST VIEW (Optimal for Mobile & Quick Inspection) */
        <div className="calendar-agenda-view">
          {/* Agenda Filters */}
          <div className="agenda-filter-bar">
            {[
              { id: 'all', label: 'Semua Agenda' },
              { id: 'debt', label: 'Bayar Utang' },
              { id: 'bill', label: 'Tagihan Rutin' },
              { id: 'installment', label: 'Cicilan' },
              { id: 'subscription', label: 'Langganan' },
              { id: 'unpaid', label: 'Belum Lunas' },
              { id: 'paid', label: 'Sudah Lunas' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`agenda-filter-pill ${agendaFilter === f.id ? 'active' : ''}`}
                onClick={() => setAgendaFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredAgenda.length === 0 ? (
            <div className="empty-agenda-card">
              <div className="empty-agenda-icon">
                <CalendarDays size={36} />
              </div>
              <h3>Belum ada jadwal pada filter ini</h3>
              <p>Tambahkan tanggal jatuh tempo pembayaran utang, cicilan, atau tagihanmu.</p>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => onOpenAddSchedule(todayStr)}
              >
                <Plus size={16} />
                <span>Tambah Jadwal Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="agenda-cards-list">
              {filteredAgenda.map((item) => {
                const badge = getTypeBadge(item.type);
                return (
                  <div
                    key={item.id}
                    className={`agenda-card-item ${item.is_paid ? 'is-paid' : ''} ${
                      item.dueStatus === 'overdue' ? 'status-overdue' : ''
                    }`}
                  >
                    <div className="agenda-card-left">
                      <button
                        type="button"
                        className={`btn-check-toggle ${item.is_paid ? 'checked' : ''}`}
                        onClick={() => handleToggleClick(item)}
                        aria-label={item.is_paid ? 'Tandai belum dibayar' : 'Tandai sudah lunas'}
                      >
                        {item.is_paid && <Check size={15} strokeWidth={3} />}
                      </button>

                      <div className="agenda-card-details">
                        <div className="agenda-badge-row">
                          <span
                            className="agenda-cat-badge"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>

                          {item.recurring === 'monthly' && (
                            <span className="recurring-badge">
                              <Repeat size={11} /> Rutin Bulanan
                            </span>
                          )}

                          <span className={`due-badge ${item.dueStatus}`}>
                            {item.dueText}
                          </span>
                        </div>

                        <h4 className={`agenda-card-title ${item.is_paid ? 'strike' : ''}`}>
                          {item.title}
                        </h4>

                        {item.notes && (
                          <p className="agenda-card-notes">{item.notes}</p>
                        )}

                        <div className="agenda-card-meta">
                          <span className="meta-date">
                            📅 Jatuh tempo: <strong>{item.due_date}</strong>
                          </span>
                          {item.wallet_name && (
                            <span className="meta-wallet">
                              💳 {item.wallet_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="agenda-card-right">
                      <div className="agenda-amount-display">
                        <span className="agenda-amount-label">Nominal</span>
                        <strong className="agenda-amount-val">
                          {formatSimpleIDR(item.amount)}
                        </strong>
                      </div>

                      <div className="agenda-actions-row">
                        <button
                          type="button"
                          className="btn-agenda-edit"
                          onClick={() => onOpenEditSchedule(item)}
                          title="Ubah"
                        >
                          <Edit2 size={15} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-agenda-delete"
                          onClick={() => {
                            if (confirm(`Hapus jadwal "${item.title}"?`)) {
                              onDeleteSchedule(item.id);
                            }
                          }}
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Prompt Modal: Konfirmasi Catat ke Transaksi saat menandai Lunas */}
      {promptPaidItem && (
        <div className="modal-overlay" onClick={() => setPromptPaidItem(null)}>
          <div
            className="modal-dialog prompt-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Tandai Sudah Lunas</h3>
                <p className="modal-desc">
                  Keren! Kewajiban pembayaran "{promptPaidItem.title}" selesai.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPromptPaidItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="prompt-modal-body">
              <div className="prompt-amount-box">
                <span className="prompt-amount-label">Nominal Dibayar</span>
                <strong className="prompt-amount-val">
                  {formatSimpleIDR(promptPaidItem.amount)}
                </strong>
              </div>

              <p className="prompt-question">
                Apakah kamu ingin <strong>langsung mencatat pengeluaran ini</strong> ke riwayat transaksi Saku agar saldo dompet otomatis terpotong?
              </p>

              <div className="prompt-actions-column">
                <button
                  type="button"
                  className="btn-primary-action btn-record-tx"
                  onClick={() => handleConfirmPaidWithTransaction(true)}
                >
                  <Check size={16} />
                  <span>Ya, Tandai Lunas & Catat Pengeluaran</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => handleConfirmPaidWithTransaction(false)}
                >
                  <span>Hanya Tandai Lunas (Tanpa Potong Saldo)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
