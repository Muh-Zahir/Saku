'use client';

import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
            <Wallet size={19} stroke="#ffffff" strokeWidth={2} />
          </div>
        </div>
        <div className="metric-value-huge">{formatSimpleIDR(totalSaldo)}</div>
        <div className="metric-sub-text text-primary-sub">
          Bertambah {formatSimpleIDR(pertambahanSaldo)} bulan ini
        </div>
      </div>

      {/* Card 2: Pemasukan Bulan Ini */}
      <div className="metric-card metric-card-white">
        <div className="metric-card-top">
          <span className="metric-label">Pemasukan bulan ini</span>
          <div className="metric-icon-wrap-green">
            <ArrowDownLeft size={19} stroke="#059669" strokeWidth={2.4} />
          </div>
        </div>
        <div className="metric-value-huge text-dark">{formatSimpleIDR(pemasukan)}</div>
        <div className="metric-sub-text">
          {pemasukanDesc || 'Gaji & pekerjaan lepas'}
        </div>
      </div>

      {/* Card 3: Pengeluaran Bulan Ini */}
      <div className="metric-card metric-card-white">
        <div className="metric-card-top">
          <span className="metric-label">Pengeluaran bulan ini</span>
          <div className="metric-icon-wrap-green">
            <ArrowUpRight size={19} stroke="#059669" strokeWidth={2.4} />
          </div>
        </div>
        <div className="metric-value-huge text-dark">{formatSimpleIDR(pengeluaran)}</div>
        <div className="metric-sub-text">
          {ratio}% dari pemasukan
        </div>
      </div>
    </section>
  );
}
