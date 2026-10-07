'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/Sidebar';

import Topbar from './components/Topbar';
import AddTransactionModal from './components/AddTransactionModal';
import ManageBudgetModal from './components/ManageBudgetModal';
import AddGoalModal from './components/AddGoalModal';
import TransferModal from './components/TransferModal';
import Toast from './components/Toast';

// Pages
import DashboardPage from './views/DashboardPage';
import TransactionsPage from './views/TransactionsPage';
import WalletsPage from './views/WalletsPage';
import BudgetPage from './views/BudgetPage';
import SavingsPage from './views/SavingsPage';
import ReportsPage from './views/ReportsPage';

import { Menu, Bell } from 'lucide-react';

const INITIAL_DATA = {
  profile: {
    name: 'Aditya Pratama',
    role: 'Akun pribadi',
    period: 'September 2026',
    lastSync: 'Diperbarui 30 Sep 2026, 20.45'
  },
  metrics: {
    totalSaldo: 24850000,
    pertambahanSaldo: 5150000,
    pemasukan: 12500000,
    pemasukanDesc: 'Gaji & pekerjaan lepas',
    pengeluaran: 7350000
  },
  cashflow: {
    weekly: [
      { label: '1–7 Sep', income: 600000, expense: 3600000 },
      { label: '8–14 Sep', income: 100000, expense: 1100000 },
      { label: '15–21 Sep', income: 100000, expense: 1200000 },
      { label: '22–30 Sep', income: 11700000, expense: 1450000 }
    ],
    monthly: [
      { label: 'Jun 2026', income: 11200000, expense: 6800000 },
      { label: 'Jul 2026', income: 11500000, expense: 7100000 },
      { label: 'Agu 2026', income: 12000000, expense: 6900000 },
      { label: 'Sep 2026', income: 12500000, expense: 7350000 }
    ]
  },
  budgets: [
    { id: 'b1', name: 'Makan & minum', spent: 2100000, limit: 2500000, color: 'green' },
    { id: 'b2', name: 'Tempat tinggal', spent: 3000000, limit: 3000000, color: 'amber' },
    { id: 'b3', name: 'Transportasi', spent: 850000, limit: 1200000, color: 'green' },
    { id: 'b4', name: 'Belanja', spent: 900000, limit: 1500000, color: 'green' },
    { id: 'b5', name: 'Lainnya', spent: 500000, limit: 800000, color: 'green' }
  ],
  transactions: [
    {
      id: 'tx-1',
      title: 'Belanja mingguan',
      date: '30 Sep 2026',
      category: 'Makan & minum',
      wallet: 'BCA',
      amount: -350000,
      type: 'expense',
      icon: 'shopping-bag'
    },
    {
      id: 'tx-2',
      title: 'Isi bensin',
      date: '29 Sep 2026',
      category: 'Transportasi',
      wallet: 'BCA',
      amount: -150000,
      type: 'expense',
      icon: 'fuel'
    },
    {
      id: 'tx-3',
      title: 'Kopi sore',
      date: '28 Sep 2026',
      category: 'Makan & minum',
      wallet: 'GoPay',
      amount: -45000,
      type: 'expense',
      icon: 'coffee'
    },
    {
      id: 'tx-4',
      title: 'Sepatu olahraga',
      date: '27 Sep 2026',
      category: 'Belanja',
      wallet: 'BCA',
      amount: -450000,
      type: 'expense',
      icon: 'shopping'
    },
    {
      id: 'tx-5',
      title: 'Gaji September',
      date: '25 Sep 2026',
      category: 'Gaji',
      wallet: 'BCA',
      amount: 12000000,
      type: 'income',
      icon: 'briefcase'
    }
  ],
  savings: [
    {
      id: 's1',
      name: 'Dana darurat',
      targetDate: 'Target Des 2026',
      current: 15000000,
      target: 20000000,
      type: 'shield'
    },
    {
      id: 's2',
      name: 'Liburan ke Jepang',
      targetDate: 'Target Jun 2027',
      current: 5500000,
      target: 10000000,
      type: 'plane'
    },
    {
      id: 's3',
      name: 'Laptop baru',
      targetDate: 'Target Mar 2027',
      current: 4350000,
      target: 12000000,
      type: 'laptop'
    }
  ]
};

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);

  const [activeNav, setActiveNav] = useState('ringkasan');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(data.profile.period);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isManageBudgetOpen, setIsManageBudgetOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Track client mount (untuk SSR-safe portal)
  const [isMounted, setIsMounted] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('saku_react_state');
      if (saved) setData(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed reading localStorage', e);
    }
  }, []);

  // Persist to localStorage on data changes
  useEffect(() => {
    try {
      localStorage.setItem('saku_react_state', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
  }, [data]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleAddTransaction = (newTx) => {
    setData((prev) => {
      const isExpense = newTx.amount < 0;
      const absAmount = Math.abs(newTx.amount);

      const nextMetrics = { ...prev.metrics };
      if (isExpense) {
        nextMetrics.totalSaldo -= absAmount;
        nextMetrics.pengeluaran += absAmount;
        nextMetrics.pertambahanSaldo -= absAmount;
      } else {
        nextMetrics.totalSaldo += absAmount;
        nextMetrics.pemasukan += absAmount;
        nextMetrics.pertambahanSaldo += absAmount;
      }

      const nextBudgets = prev.budgets.map((b) => {
        if (isExpense && b.name === newTx.category) {
          return { ...b, spent: b.spent + absAmount };
        }
        return b;
      });

      return {
        ...prev,
        metrics: nextMetrics,
        budgets: nextBudgets,
        transactions: [newTx, ...prev.transactions]
      };
    });

    addToast('Transaksi berhasil ditambahkan!');
  };

  const handleSaveBudgets = (newBudgets) => {
    setData((prev) => ({
      ...prev,
      budgets: newBudgets
    }));
    addToast('Anggaran bulanan berhasil diperbarui!');
  };

  const handleAddGoal = (newGoal) => {
    setData((prev) => ({
      ...prev,
      savings: [...prev.savings, newGoal]
    }));
    addToast('Target tabungan baru berhasil dibuat!');
  };

  const handleTransfer = ({ fromWallet, toWallet, amount }) => {
    addToast(`Berhasil mentransfer Rp${amount.toLocaleString('id-ID')} dari ${fromWallet} ke ${toWallet}!`);
  };

  const getPageTitle = () => {
    switch (activeNav) {
      case 'transaksi': return 'Transaksi';
      case 'dompet': return 'Dompet';
      case 'anggaran': return 'Anggaran';
      case 'target-tabungan': return 'Target tabungan';
      case 'laporan': return 'Laporan';
      default: return 'Ringkasan';
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="brand-logo" style={{ marginBottom: 0 }}>
          <div className="logo-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="7" fill="#134e3f" />
              <path d="M9 14.5C9 11.5 11.5 9 14.5 9C14.5 12 12 14.5 9 14.5Z" fill="#34d399" />
              <path d="M12 9C12 6.5 14 4.5 16.5 4.5C16.5 7 14.5 9 12 9Z" fill="#a7f3d0" />
              <path d="M8 13.5v2.5a1.5 1.5 0 001.5 1.5h4" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-text">saku</span>
        </div>
        <button className="icon-btn-ghost" onClick={() => addToast('Tidak ada notifikasi baru.')}>
          <Bell size={20} />
        </button>
      </header>

      {/* Sidebar Navigation (desktop) */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Topbar
          activeNavLabel={getPageTitle()}
          lastSync={data.profile.lastSync}
        />

        {/* Dynamic Page Router */}
        {activeNav === 'ringkasan' && (
          <DashboardPage
            data={data}
            currentPeriod={currentPeriod}
            setCurrentPeriod={setCurrentPeriod}
            onOpenAddTx={() => setIsAddTxOpen(true)}
            onOpenManageBudget={() => setIsManageBudgetOpen(true)}
            onOpenAddGoal={() => setIsAddGoalOpen(true)}
            addToast={addToast}
          />
        )}

        {activeNav === 'transaksi' && (
          <TransactionsPage
            currentPeriod={currentPeriod}
            onOpenAddTx={() => setIsAddTxOpen(true)}
            addToast={addToast}
          />
        )}

        {activeNav === 'dompet' && (
          <WalletsPage
            currentPeriod={currentPeriod}
            addToast={addToast}
            onOpenTransferModal={() => setIsTransferOpen(true)}
            onOpenAddWalletModal={() => addToast('Form pendaftaran rekening/dompet baru')}
          />
        )}

        {activeNav === 'anggaran' && (
          <BudgetPage
            currentPeriod={currentPeriod}
            budgets={data.budgets}
            onOpenManageBudget={() => setIsManageBudgetOpen(true)}
            onOpenAddBudget={() => setIsManageBudgetOpen(true)}
            addToast={addToast}
          />
        )}

        {activeNav === 'target-tabungan' && (
          <SavingsPage
            currentPeriod={currentPeriod}
            savings={data.savings}
            onOpenAddGoal={() => setIsAddGoalOpen(true)}
            onDeposit={() => setIsAddTxOpen(true)}
            addToast={addToast}
          />
        )}

        {activeNav === 'laporan' && (
          <ReportsPage
            currentPeriod={currentPeriod}
            addToast={addToast}
          />
        )}
      </main>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <ManageBudgetModal
        isOpen={isManageBudgetOpen}
        onClose={() => setIsManageBudgetOpen(false)}
        budgets={data.budgets}
        onSaveBudgets={handleSaveBudgets}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onTransfer={handleTransfer}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} />

      {/* Mobile Bottom Navigation — Portal langsung ke body, position:fixed dijamin bekerja */}
      {isMounted && ReactDOM.createPortal(
        <nav
          aria-label="Navigasi bawah"
          className="mobile-bottom-nav"
        >
          {[
            {
              id: 'ringkasan',
              label: 'Ringkasan',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              ),
            },
            {
              id: 'transaksi',
              label: 'Transaksi',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                  <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              ),
            },
            {
              id: 'dompet',
              label: 'Dompet',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                </svg>
              ),
            },
            {
              id: 'rencana',
              label: 'Rencana',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              ),
            },
            {
              id: 'lainnya',
              label: 'Lainnya',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              ),
            },
          ].map((item) => {
            const isActive =
              item.id === 'ringkasan' ? activeNav === 'ringkasan' :
              item.id === 'transaksi' ? activeNav === 'transaksi' :
              item.id === 'dompet' ? activeNav === 'dompet' :
              item.id === 'rencana' ? (activeNav === 'anggaran' || activeNav === 'target-tabungan') :
              item.id === 'lainnya' ? (isMobileMenuOpen || activeNav === 'laporan') : false;

            const handleClick = () => {
              if (item.id === 'rencana') {
                setActiveNav('anggaran');
              } else if (item.id === 'lainnya') {
                setIsMobileMenuOpen(true);
              } else {
                setActiveNav(item.id);
              }
            };

            return (
              <button
                key={item.id}
                className={`mobile-nav-item${isActive ? ' active' : ''}`}
                onClick={handleClick}
                aria-label={item.label}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>,
        document.body
      )}
    </div>
  );
}

