'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import MetricCards from '../components/MetricCards';
import CashflowChart from '../components/CashflowChart';
import BudgetCard from '../components/BudgetCard';
import TransactionsCard from '../components/TransactionsCard';
import SavingsCard from '../components/SavingsCard';

export default function DashboardPage({
  data,
  currentPeriod,
  setCurrentPeriod,
  onOpenAddTx,
  onOpenManageBudget,
  onOpenAddGoal,
  addToast
}) {
  const netCashflow = data.metrics.pemasukan - data.metrics.pengeluaran;

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

      {/* Desktop: 2-column grid | Mobile: single column via CSS */}
      <section className="dashboard-split-grid">
        <CashflowChart
          cashflowData={data.cashflow}
          netCashflow={netCashflow}
        />
        <BudgetCard
          budgets={data.budgets}
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
