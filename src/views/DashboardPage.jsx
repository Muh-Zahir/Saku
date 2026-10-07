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
      {/* Breadcrumb — hanya tampil di mobile */}
      <nav className="mobile-breadcrumb" aria-label="Breadcrumb">
        <span>Beranda</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Ringkasan</span>
      </nav>

      {/* Page header: judul + subtitle + period selector + tombol catat */}
      <Header
        currentPeriod={currentPeriod}
        onSelectPeriod={(p) => {
          setCurrentPeriod(p);
          addToast(`Periode diubah ke ${p}`);
        }}
        onOpenAddTransaction={onOpenAddTx}
      />

      {/* 3 Metric Cards */}
      <MetricCards metrics={data.metrics} />

      {/* Arus Kas */}
      <CashflowChart
        cashflowData={data.cashflow}
        netCashflow={netCashflow}
      />

      {/* Anggaran */}
      <BudgetCard
        budgets={data.budgets}
        onOpenManageBudget={onOpenManageBudget}
      />

      {/* Transaksi Terbaru */}
      <TransactionsCard transactions={data.transactions} />

      {/* Target Tabungan */}
      <SavingsCard
        savings={data.savings}
        onOpenAddGoal={onOpenAddGoal}
      />
    </>
  );
}
