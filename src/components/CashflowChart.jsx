import React, { useState } from 'react';
import { formatSimpleIDR, formatIDR } from '../utils/formatters';

export default function CashflowChart({ cashflowData, netCashflow }) {
  const [activeTab, setActiveTab] = useState('weekly');

  const series = activeTab === 'weekly' ? cashflowData.weekly : cashflowData.monthly;
  const maxVal = 12000000; // 12 million base scale

  return (
    <div className="dashboard-card card-cashflow">
      <div className="card-header">
        <div>
          <h2 className="card-title">Arus kas</h2>
          <p className="card-subtitle">Pemasukan dan pengeluaran sepanjang bulan</p>
        </div>
        <div className="segmented-control" role="tablist">
          <button 
            className={`seg-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
            role="tab"
          >
            Mingguan
          </button>
          <button 
            className={`seg-btn ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
            role="tab"
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot dot-income"></span>
          <span>Pemasukan</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-expense"></span>
          <span>Pengeluaran</span>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="chart-container">
        <div className="chart-y-axis">
          <span>12 jt</span>
          <span>8 jt</span>
          <span>4 jt</span>
          <span>0</span>
        </div>

        <div className="chart-canvas-area">
          {series.map((item, index) => {
            const incomeHeight = Math.min(100, Math.max(3, (item.income / maxVal) * 100));
            const expenseHeight = Math.min(100, Math.max(3, (item.expense / maxVal) * 100));
            const tooltipIncome = `Masuk: ${formatSimpleIDR(item.income)}`;
            const tooltipExpense = `Keluar: ${formatSimpleIDR(item.expense)}`;

            return (
              <div key={index} className="chart-bar-group">
                <div className="bars-pair">
                  <div 
                    className="bar-col income" 
                    style={{ height: `${incomeHeight}%` }} 
                    data-tooltip={tooltipIncome}
                  />
                  <div 
                    className="bar-col expense" 
                    style={{ height: `${expenseHeight}%` }} 
                    data-tooltip={tooltipExpense}
                  />
                </div>
                <span className="bar-x-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-footer-cashflow">
        <span className="footer-label">Arus kas bersih bulan ini</span>
        <span className="footer-val-positive">
          {netCashflow >= 0 ? '+' : '-'}{formatSimpleIDR(netCashflow)}
        </span>
      </div>
    </div>
  );
}
