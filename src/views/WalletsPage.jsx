'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Calendar,
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
  Repeat
} from 'lucide-react';
import { formatSimpleIDR } from '../utils/formatters';

export default function WalletsPage({
  currentPeriod,
  addToast,
  onOpenTransferModal,
  onOpenAddWalletModal
}) {
  const [wallets, setWallets] = useState([
    {
      id: 'w-1',
      name: 'BCA',
      type: 'Rekening bank · •••• 4821',
      balance: 22000000,
      share: '88,5%',
      icon: 'bank'
    },
    {
      id: 'w-2',
      name: 'GoPay',
      type: 'Dompet digital · •••• 7812',
      balance: 850000,
      share: '3,4%',
      icon: 'phone'
    },
    {
      id: 'w-3',
      name: 'Tunai',
      type: 'Uang tunai · Dompet sehari-hari',
      balance: 2000000,
      share: '8,1%',
      icon: 'cash'
    }
  ]);

  const recentMovements = [
    { id: 'm-1', title: 'Belanja mingguan', meta: '30 Sep 2026 · BCA', amount: -350000, type: 'out' },
    { id: 'm-2', title: 'Isi bensin', meta: '29 Sep 2026 · BCA', amount: -150000, type: 'out' },
    { id: 'm-3', title: 'Kopi sore', meta: '28 Sep 2026 · GoPay', amount: -45000, type: 'out' },
    { id: 'm-4', title: 'Sepatu olahraga', meta: '27 Sep 2026 · BCA', amount: -450000, type: 'out' },
    { id: 'm-5', title: 'Gaji September', meta: '25 Sep 2026 · BCA', amount: 12000000, type: 'in' }
  ];

  const getWalletIcon = (icon) => {
    if (icon === 'bank') return <Landmark size={18} stroke="#059669" strokeWidth={2.2} />;
    if (icon === 'phone') return <Smartphone size={18} stroke="#059669" strokeWidth={2.2} />;
    return <Banknote size={18} stroke="#059669" strokeWidth={2.2} />;
  };

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
            <Calendar size={16} strokeWidth={2} />
            <span>{currentPeriod}</span>
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

      {/* Top 3 Cards */}
      <section className="metrics-grid">
        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Total saldo</span>
            <div className="metric-icon-wrap">
              <Wallet size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="metric-value-huge">Rp24.850.000</div>
          <div className="metric-trend trend-positive-tint">
            <span>Saldo gabungan dari 3 dompet aktif</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Saldo awal September</span>
            <div className="metric-icon-wrap-light">
              <Calendar size={17} stroke="#059669" strokeWidth={2.2} />
            </div>
          </div>
          <div className="metric-value-huge text-dark">Rp19.700.000</div>
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
          <div className="metric-value-huge text-dark">+Rp5.150.000</div>
          <div className="metric-trend text-muted-sub">
            <span>Rp12.500.000 masuk · Rp7.350.000 keluar</span>
          </div>
        </div>
      </section>

      {/* Dompet Saya Section */}
      <div className="section-header-row">
        <h2 className="section-title">Dompet saya</h2>
        <span className="section-badge">3 dompet aktif</span>
      </div>

      <div className="wallet-cards-grid">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="wallet-item-card">
            <div className="wallet-card-header">
              <div className="wallet-icon-box">
                {getWalletIcon(wallet.icon)}
              </div>
              <div className="wallet-title-wrap">
                <h3 className="wallet-name">{wallet.name}</h3>
                <span className="wallet-type">{wallet.type}</span>
              </div>
              <button 
                className="wallet-action-dots" 
                onClick={() => addToast(`Pengaturan dompet ${wallet.name}`)}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="wallet-balance-box">
              <span className="balance-label">Saldo saat ini</span>
              <div className="balance-val">{formatSimpleIDR(wallet.balance)}</div>
            </div>

            <div className="wallet-card-footer">
              <span className="share-text">{wallet.share} dari total saldo</span>
              <button 
                className="btn-outline-sm" 
                onClick={() => addToast(`Buka rincian ${wallet.name}`)}
              >
                Kelola
              </button>
            </div>
          </div>
        ))}
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
            <button className="card-action-link" onClick={() => addToast('Membuka riwayat lengkap pergerakan saldo')}>
              <span>Lihat semua</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="movement-list">
            {recentMovements.map((m) => {
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
            })}
          </div>
        </div>

        {/* Right: Pindahkan Saldo & Note Card */}
        <div className="wallet-right-column">
          {/* Card Pindahkan Saldo */}
          <div className="dashboard-card">
            <h2 className="card-title">Pindahkan saldo</h2>
            <p className="card-subtitle">Transfer antar dompet tanpa mengubah total saldo.</p>

            <div className="transfer-quick-box">
              <div className="wallet-pill">BCA</div>
              <ArrowRight size={16} stroke="#8c9e94" strokeWidth={2.5} />
              <div className="wallet-pill">GoPay</div>
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
              Rp24.850.000 telah dialokasikan ke target tabungan. Alokasi ini bagian dari saldo dompet, bukan saldo tambahan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

