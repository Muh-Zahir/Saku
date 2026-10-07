'use client';

import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function MetricCards({ metrics }) {
  const { totalSaldo, pertambahanSaldo, pemasukan, pengeluaran, pemasukanDesc } = metrics;

  const ratio = pemasukan > 0 
    ? ((pengeluaran / pemasukan) * 100).toFixed(1).replace('.', ',') 
    : '0';

  return (
    <section className="metrics-grid">
      {/* Card 1: Total Saldo (Primary Dark Green Card) */}
      <div className="metric-card metric-card-primary">
        <div className="metric-card-top">
          <span className="metric-label">Total saldo</span>
          <div className="metric-icon-wrap">
            <Wallet size={18} strokeWidth={2} />
          </div>
        </div>
        <div className="metric-value-huge">{formatSimpleIDR(totalSaldo)}</div>
        <div className="metric-trend trend-positive-tint">
          <TrendingUp className="trend-icon-desktop" size={15} strokeWidth={2.5} />
          <span>Bertambah {formatSimpleIDR(pertambahanSaldo)} bulan ini</span>
        </div>
      </div>

      {/* Card 2: Pemasukan Bulan Ini */}
      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-label">Pemasukan bulan ini</span>
          <div className="metric-icon-wrap-light income-accent">
            <ArrowDownLeft size={17} stroke="#059669" strokeWidth={2.4} />
          </div>
        </div>
        <div className="metric-value-huge text-dark">{formatSimpleIDR(pemasukan)}</div>
        <div className="metric-trend text-muted-sub">
          <ArrowDownLeft className="trend-icon-desktop" size={14} stroke="#059669" strokeWidth={2.4} />
          <span>{pemasukanDesc || 'Gaji & pekerjaan lepas'}</span>
        </div>
      </div>

      {/* Card 3: Pengeluaran Bulan Ini */}
      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-label">Pengeluaran bulan ini</span>
          <div className="metric-icon-wrap-light expense-accent">
            <ArrowUpRight size={17} stroke="#059669" strokeWidth={2.4} />
          </div>
        </div>
        <div className="metric-value-huge text-dark">{formatSimpleIDR(pengeluaran)}</div>
        <div className="metric-trend text-muted-sub">
          <ArrowUpRight className="trend-icon-desktop" size={14} stroke="#059669" strokeWidth={2.4} />
          <span>{ratio}% dari pemasukan</span>
        </div>
      </div>
    </section>
  );
}
