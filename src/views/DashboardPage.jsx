'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import MetricCards from '../components/MetricCards';
import CashflowChart from '../components/CashflowChart';
import BudgetCard from '../components/BudgetCard';
import TransactionsCard from '../components/TransactionsCard';
import SavingsCard from '../components/SavingsCard';

import { CalendarDays, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage({
  data,
  currentPeriod,
  setCurrentPeriod,
  onOpenAddTx,
  onOpenManageBudget,
  onOpenAddGoal,
  onNavigateToCalendar,
  paydayDate = 25,
  addToast
}) {
  const netCashflow = data.metrics.pemasukan - data.metrics.pengeluaran;

  // Hitung hari menuju gajian berikutnya untuk banner ringkas
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  let targetPayday = new Date(currentYear, currentMonth, paydayDate);
  if (now.getTime() >= targetPayday.getTime()) {
    targetPayday = new Date(currentYear, currentMonth + 1, paydayDate);
  }
  const daysUntilPayday = Math.max(0, Math.ceil((targetPayday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const unpaidSchedulesCount = (data.schedules || []).filter((s) => !s.is_paid).length;

  return (
    <>
      {/* Breadcrumb — hanya tampil di mobile via CSS */}
      <nav className="mobile-breadcrumb" aria-label="Breadcrumb">
        <span>Keuangan pribadi</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Ringkasan</span>
      </nav>

      {/* Page header: judul + subtitle + period selector + tombol catat */}
      <Header
        currentPeriod={currentPeriod}
        onSelectPeriod={(p) => {
          if (setCurrentPeriod) setCurrentPeriod(p);
        }}
        onOpenAddTransaction={onOpenAddTx}
        lastSync={data.profile.lastSync}
      />

      {/* 3 Metric Cards */}
      <MetricCards metrics={data.metrics} />

      {/* Mini Interactive Payday & Calendar Banner */}
      <div className="dashboard-payday-banner" onClick={onNavigateToCalendar}>
        <div className="dash-banner-left">
          <div className="dash-banner-icon">
            <CalendarDays size={20} />
          </div>
          <div className="dash-banner-info">
            <span className="dash-banner-title">
              {daysUntilPayday === 0
                ? '🎉 Hari ini Gajian!'
                : `🚀 ${daysUntilPayday} Hari Lagi Menuju Gajian (Tgl ${paydayDate})`}
            </span>
            <span className="dash-banner-sub">
              {unpaidSchedulesCount > 0
                ? `Ada ${unpaidSchedulesCount} jadwal bayar utang & tagihan menanti jatuh tempo.`
                : 'Semua komitmen tagihan dan utang telah lunas. Keuanganmu aman!'}
            </span>
          </div>
        </div>
        <div className="dash-banner-right">
          <span className="dash-banner-cta">Lihat Kalender</span>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Desktop: 2-column grid | Mobile: single column via CSS */}
      <section className="dashboard-split-grid">
        <CashflowChart
          cashflowData={data.cashflow}
          netCashflow={netCashflow}
        />
        <BudgetCard
          budgets={data.budgets}
          paydayCycle={data.paydayCycle}
          onOpenManageBudget={onOpenManageBudget}
        />
      </section>

      {/* Desktop: 2-column grid | Mobile: single column via CSS */}
      <section className="dashboard-split-grid bottom-grid">
        <TransactionsCard transactions={data.transactions} />
        <SavingsCard
          savings={data.savings}
          onOpenAddGoal={onOpenAddGoal}
        />
      </section>
    </>
  );
}
