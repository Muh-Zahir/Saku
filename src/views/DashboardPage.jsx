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

      {/* Middle Grid: Arus Kas & Anggaran */}
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

      {/* Bottom Grid: Transaksi Terbaru & Target Tabungan */}
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

