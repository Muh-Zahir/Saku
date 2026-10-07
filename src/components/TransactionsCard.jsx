import React from 'react';
import { ArrowRight, ShoppingBag, Fuel, Coffee, Briefcase, Tag } from 'lucide-react';
import { formatIDR } from '../utils/formatters';

export default function TransactionsCard({ transactions }) {
  const getIcon = (iconName, category) => {
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

      <div className="table-responsive">
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
                        {getIcon(tx.icon, tx.category)}
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
    </div>
  );
}
