'use client';

import React from 'react';
import {
  Wallet,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  Plus,
  Landmark,
  Smartphone,
  Banknote,
  MoreHorizontal,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Repeat,
  Trash2
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

const DEFAULT_WALLETS = [
  { id: 'w-1', name: 'BCA', type: 'Rekening bank · •••• 4821', balance: 22000000, share: '88,5%', icon: 'bank' },
  { id: 'w-2', name: 'GoPay', type: 'Dompet digital · •••• 7812', balance: 850000, share: '3,4%', icon: 'phone' },
  { id: 'w-3', name: 'Tunai', type: 'Uang tunai · Dompet sehari-hari', balance: 2000000, share: '8,1%', icon: 'cash' },
];

export default function WalletsPage({
  wallets = [],
  transactions = [],
  currentPeriod,
  addToast,
  onOpenTransferModal,
  onOpenAddWalletModal,
  onDeleteWallet,
}) {
  const walletList = wallets && wallets.length > 0 ? wallets : DEFAULT_WALLETS;

  const totalSaldo = walletList.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);

  // Perhitungan pemasukan dan pengeluaran dari transaksi
  const incomeTotal = transactions
    ? transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0)
    : 12500000;
  const expenseTotal = transactions
    ? transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
    : 7350000;
  const netChange = incomeTotal - expenseTotal;

  // Recent movements dari transaksi aktual
  const recentMovements = (transactions && transactions.length > 0 ? transactions.slice(0, 5) : []).map((t) => ({
    id: t.id,
    title: t.title,
    meta: `${t.date} · ${t.wallet || 'BCA'}`,
    amount: Math.abs(t.amount),
    type: t.type === 'income' ? 'in' : 'out',
  }));

  const getWalletIcon = (icon) => {
    if (icon === 'bank') return <Landmark size={18} stroke="#059669" strokeWidth={2.2} />;
    if (icon === 'phone') return <Smartphone size={18} stroke="#059669" strokeWidth={2.2} />;
    return <Banknote size={18} stroke="#059669" strokeWidth={2.2} />;
  };

  const firstWallet = walletList[0]?.name || 'BCA';
  const secondWallet = walletList[1]?.name || (walletList[0]?.name || 'GoPay');

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Dompet</h1>
          <p className="page-subtitle">Semua rekening dan dompetmu, dalam satu tempat.</p>
        </div>

        <div className="page-actions">
          <button className="btn-period-select">
            <span className="btn-period-left">
              <Calendar size={16} strokeWidth={2} />
              <span>{currentPeriod}</span>
            </span>
            <ChevronDown size={16} strokeWidth={2} className="btn-period-chevron" />
          </button>
          <button className="btn-primary-action btn-add-tx-desktop" onClick={onOpenAddWalletModal}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah dompet</span>
          </button>
        </div>

        {/* Mobile full-width CTA */}
        <button className="btn-catat-mobile mobile-only" onClick={onOpenAddWalletModal}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah dompet</span>
        </button>
      </div>

      {/* Top 3 Cards Dinamis */}
      <section className="metrics-grid">
        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Total saldo</span>
            <div className="metric-icon-wrap">
              <Wallet size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="metric-value-huge">{formatSimpleIDR(totalSaldo)}</div>
          <div className="metric-trend trend-positive-tint">
            <span>Saldo gabungan dari {walletList.length} dompet aktif</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Saldo awal {currentPeriod}</span>
            <div className="metric-icon-wrap-light">
              <Calendar size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">
            {formatSimpleIDR(Math.max(0, totalSaldo - netChange))}
          </div>
          <div className="metric-trend text-muted-sub">
            <span>Sebelum pemasukan &amp; pengeluaran bulan ini</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Perubahan saldo</span>
            <div className="metric-icon-wrap-light">
              <ArrowUpDown size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">
            {netChange >= 0 ? '+' : '-'}{formatSimpleIDR(Math.abs(netChange))}
          </div>
          <div className="metric-trend text-muted-sub">
            <span>{formatSimpleIDR(incomeTotal)} masuk · {formatSimpleIDR(expenseTotal)} keluar</span>
          </div>
        </div>
      </section>

      {/* Dompet Saya Section */}
      <div className="section-header-row">
        <h2 className="section-title">Dompet saya</h2>
        <span className="section-badge">{walletList.length} dompet aktif</span>
      </div>

      <div className="wallet-cards-grid">
        {walletList.map((wallet) => {
          const shareStr = totalSaldo > 0
            ? `${((wallet.balance / totalSaldo) * 100).toFixed(1).replace('.', ',')}%`
            : '0%';

          return (
            <div key={wallet.id} className="wallet-item-card">
              <div className="wallet-card-header">
                <div className="wallet-icon-box">
                  {getWalletIcon(wallet.icon)}
                </div>
                <div className="wallet-title-wrap">
                  <h3 className="wallet-name">{wallet.name}</h3>
                  <span className="wallet-type">{wallet.type}</span>
                </div>
                {onDeleteWallet && walletList.length > 1 ? (
                  <button 
                    className="wallet-action-dots" 
                    title={`Hapus dompet ${wallet.name}`}
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus dompet "${wallet.name}"?`)) {
                        onDeleteWallet(wallet.id);
                      }
                    }}
                  >
                    <Trash2 size={16} stroke="#ef4444" />
                  </button>
                ) : (
                  <button 
                    className="wallet-action-dots" 
                    onClick={() => addToast(`Dompet ${wallet.name} aktif`)}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                )}
              </div>

              <div className="wallet-balance-box">
                <span className="balance-label">Saldo saat ini</span>
                <div className="balance-val">{formatSimpleIDR(wallet.balance)}</div>
              </div>

              <div className="wallet-card-footer">
                <span className="share-text">{shareStr} dari total saldo</span>
                <button 
                  className="btn-outline-sm" 
                  onClick={onOpenTransferModal}
                >
                  Transfer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Split Grid */}
      <section className="dashboard-split-grid bottom-grid">
        {/* Left: Pergerakan Saldo Terbaru */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pergerakan saldo terbaru</h2>
              <p className="card-subtitle">Transaksi terakhir di seluruh dompet</p>
            </div>
          </div>

          <div className="movement-list">
            {recentMovements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8c9e94' }}>
                Belum ada pergerakan transaksi tercatat.
              </div>
            ) : (
              recentMovements.map((m) => {
                const isIncome = m.type === 'in';
                return (
                  <div key={m.id} className="movement-row">
                    <div className="movement-left">
                      <div className="movement-icon-circle">
                        {isIncome ? (
                          <ArrowDownLeft size={16} stroke="#059669" strokeWidth={2.4} />
                        ) : (
                          <ArrowUpRight size={16} stroke="#4a5c52" strokeWidth={2.4} />
                        )}
                      </div>
                      <div className="movement-meta">
                        <span className="movement-title">{m.title}</span>
                        <span className="movement-sub">{m.meta}</span>
                      </div>
                    </div>
                    <div className={`movement-amount ${isIncome ? 'text-income-green' : 'text-dark-bold'}`}>
                      {isIncome ? '+' : '-'}{formatSimpleIDR(m.amount)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Pindahkan Saldo & Note Card */}
        <div className="wallet-right-column">
          {/* Card Pindahkan Saldo */}
          <div className="dashboard-card">
            <h2 className="card-title">Pindahkan saldo</h2>
            <p className="card-subtitle">Transfer antar dompet tanpa mengubah total saldo.</p>

            <div className="transfer-quick-box">
              <div className="wallet-pill">{firstWallet}</div>
              <ArrowRight size={16} stroke="#8c9e94" strokeWidth={2.5} />
              <div className="wallet-pill">{secondWallet}</div>
            </div>

            <button className="btn-transfer-action" onClick={onOpenTransferModal}>
              <Repeat size={16} strokeWidth={2.2} />
              <span>Transfer antar dompet</span>
            </button>
          </div>

          {/* Info Card */}
          <div className="tip-card tip-card-clean">
            <div className="tip-header-row">
              <ShieldCheck size={20} stroke="#059669" strokeWidth={2.2} />
              <h3 className="tip-title-clean">Satu saldo, tujuan yang terarah.</h3>
            </div>
            <p className="tip-desc-clean">
              Saldo terhubung langsung ke database Saku. Setiap penambahan atau transfer langsung disinkronkan secara aman.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
