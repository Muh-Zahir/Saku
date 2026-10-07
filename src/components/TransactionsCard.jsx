'use client';

import React from 'react';
import { ArrowRight, ShoppingBag, Fuel, Coffee, Briefcase, Tag } from 'lucide-react';

export default function TransactionsCard({ transactions }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'shopping-bag':
        return <ShoppingBag size={18} strokeWidth={2} />;
      case 'fuel':
        return <Fuel size={18} strokeWidth={2} />;
      case 'coffee':
        return <Coffee size={18} strokeWidth={2} />;
      case 'shopping':
        return <ShoppingBag size={18} strokeWidth={2} />;
      case 'briefcase':
        return <Briefcase size={18} strokeWidth={2} />;
      default:
        return <Tag size={18} strokeWidth={2} />;
    }
  };

  return (
    <div className="dashboard-card card-transactions">
      <div className="card-header">
        <h2 className="card-title">Transaksi terbaru</h2>
        <button 
          className="card-action-link"
          onClick={() => alert('Membuka riwayat transaksi lengkap...')}
        >
          <span>Lihat semua</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="table-responsive desktop-only">
        <table className="transactions-table">
          <thead>
            <tr>
              <th scope="col" className="th-tx">TRANSAKSI</th>
              <th scope="col" className="th-cat">KATEGORI</th>
              <th scope="col" className="th-wallet">DOMPET</th>
              <th scope="col" className="th-amount">JUMLAH</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((tx) => {
              const isIncome = tx.amount > 0;
              const formattedAmount = `${isIncome ? '+' : '-'}Rp${Math.abs(tx.amount).toLocaleString('id-ID')}`;
              const amountClass = isIncome ? 'tx-income' : 'tx-expense';

              return (
                <tr key={tx.id}>
                  <td>
                    <div className="tx-cell">
                      <div className="tx-icon-wrap">
                        {getIcon(tx.icon)}
                      </div>
                      <div className="tx-meta">
                        <span className="tx-title">{tx.title}</span>
                        <span className="tx-date">{tx.date}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="tx-cat-text">{tx.category}</span></td>
                  <td><span className="tx-wallet-text">{tx.wallet}</span></td>
                  <td className={`tx-amount-col ${amountClass}`}>{formattedAmount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile List View (sesuai Screenshot 3) */}
      <div className="transactions-mobile-list mobile-only">
        {transactions.slice(0, 5).map((tx) => {
          const isIncome = tx.amount > 0;
          const formattedAmount = `${isIncome ? '+' : '-'}Rp${Math.abs(tx.amount).toLocaleString('id-ID')}`;
          const amountClass = isIncome ? 'tx-income' : 'tx-expense';

          return (
            <div key={tx.id} className="tx-mobile-item">
              <div className="tx-mobile-icon-box">
                {getIcon(tx.icon)}
              </div>
              <div className="tx-mobile-info">
                <span className="tx-mobile-title">{tx.title}</span>
                <span className="tx-mobile-sub">{tx.date} · {tx.wallet}</span>
                <span className="tx-mobile-cat">{tx.category}</span>
              </div>
              <div className={`tx-mobile-amount ${amountClass}`}>
                {formattedAmount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
