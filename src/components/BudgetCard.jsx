'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function BudgetCard({ budgets, onOpenManageBudget }) {
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalRatio = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1).replace('.', ',') : 0;

  return (
    <div className="dashboard-card card-budget">
      <div className="card-header">
        <div>
          <h2 className="card-title">Anggaran</h2>
          <p className="card-subtitle">
            {formatSimpleIDR(totalSpent)} dari {formatSimpleIDR(totalLimit)} · {totalRatio}%
          </p>
        </div>
        <button className="card-action-link" onClick={onOpenManageBudget}>
          <span>Kelola</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Desktop Budget View (persis sesuai screenshot laptop) */}
      <div className="budget-items-list desktop-only">
        {budgets.map((item) => {
          const limit = Number(item.limit) || 0;
          const spent = Number(item.spent) || 0;
          const percentage = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
          const isOverOrMax = limit > 0 && spent >= limit;
          const barColorClass = isOverOrMax ? 'bar-amber' : 'bar-green';

          return (
            <div key={item.id} className="budget-item">
              <div className="budget-item-top">
                <span className="budget-name">{item.name}</span>
                <span className="budget-amount">
                  {formatSimpleIDR(spent)} / {formatSimpleIDR(limit)}
                </span>
              </div>
              <div className="progress-track">
                <div 
                  className={`progress-bar ${barColorClass}`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Budget View (persis sesuai screenshot mobile) */}
      <div className="budget-items-list mobile-only">
        {budgets.map((item) => {
          const limit = Number(item.limit) || 0;
          const spent = Number(item.spent) || 0;
          const ratio = limit > 0 ? (spent / limit) * 100 : 0;
          const isOverOrMax = limit > 0 && spent >= limit;
          const formattedPercent = limit > 0 ? (ratio >= 100 ? '100%' : ratio % 1 === 0 ? ratio.toFixed(0) + '%' : ratio.toFixed(1).replace('.', ',') + '%') : '0%';
          const barColorClass = isOverOrMax ? 'bar-amber' : 'bar-green';
          const percentColorClass = isOverOrMax ? 'text-amber-percent' : 'text-green-percent';

          return (
            <div key={item.id} className="budget-item-mobile">
              <div className="budget-item-header-row">
                <span className="budget-name">{item.name}</span>
                <span className={`budget-percentage ${percentColorClass}`}>
                  {formattedPercent}
                </span>
              </div>
              <div className="budget-item-sub-row">
                {formatSimpleIDR(item.spent)} / {formatSimpleIDR(item.limit)}
              </div>
              <div className="progress-track">
                <div 
                  className={`progress-bar ${barColorClass}`} 
                  style={{ width: `${Math.min(100, ratio)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
