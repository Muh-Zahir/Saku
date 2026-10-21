'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AddTransactionModal from './components/AddTransactionModal';
import ManageBudgetModal from './components/ManageBudgetModal';
import AddGoalModal from './components/AddGoalModal';
import TransferModal from './components/TransferModal';
import AddWalletModal from './components/AddWalletModal';
import MoreMenuModal from './components/MoreMenuModal';
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
    period: 'Oktober 2026',
    lastSync: 'Belum ada transaksi'
  },
  metrics: {
    totalSaldo: 0,
    pertambahanSaldo: 0,
    pemasukan: 0,
    pemasukanDesc: 'Belum ada pemasukan',
    pengeluaran: 0
  },
  cashflow: {
    weekly: [
      { label: '1–7 Okt', income: 0, expense: 0 },
      { label: '8–14 Okt', income: 0, expense: 0 },
      { label: '15–21 Okt', income: 0, expense: 0 },
      { label: '22–31 Okt', income: 0, expense: 0 }
    ],
    monthly: [
      { label: 'Jul 2026', income: 0, expense: 0 },
      { label: 'Agu 2026', income: 0, expense: 0 },
      { label: 'Sep 2026', income: 0, expense: 0 },
      { label: 'Okt 2026', income: 0, expense: 0 }
    ]
  },
  wallets: [
    { id: 'w-1', name: 'BCA', type: 'Rekening bank · •••• 4821', balance: 0, share: '0%', icon: 'bank' },
    { id: 'w-2', name: 'GoPay', type: 'Dompet digital · •••• 7812', balance: 0, share: '0%', icon: 'phone' },
    { id: 'w-3', name: 'Tunai', type: 'Uang tunai · Dompet sehari-hari', balance: 0, share: '0%', icon: 'cash' }
  ],
  budgets: [
    { id: 'b1', name: 'Makan & minum', spent: 0, limit: 0, color: 'green' },
    { id: 'b2', name: 'Tempat tinggal', spent: 0, limit: 0, color: 'green' },
    { id: 'b3', name: 'Transportasi', spent: 0, limit: 0, color: 'green' },
    { id: 'b4', name: 'Belanja', spent: 0, limit: 0, color: 'green' },
    { id: 'b5', name: 'Lainnya', spent: 0, limit: 0, color: 'green' }
  ],
  transactions: [],
  savings: []
};

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);

  const [activeNav, setActiveNav] = useState('ringkasan');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(data.profile.period);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isManageBudgetOpen, setIsManageBudgetOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Track client mount (untuk SSR-safe portal)
  const [isMounted, setIsMounted] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Sinkronisasi data dari backend API
  const fetchServerData = useCallback(async (period = currentPeriod) => {
    try {
      const res = await fetch(`/api/data?period=${encodeURIComponent(period)}`);
      if (res.ok) {
        const serverData = await res.json();
        setData((prev) => ({
          ...prev,
          ...serverData,
          profile: {
            ...prev.profile,
            ...serverData.profile,
          },
        }));
      }
    } catch (e) {
      console.warn('Gagal menghubungi backend API, menggunakan data lokal:', e);
    }
  }, [currentPeriod]);

  // Hydrate from localStorage on client mount, lalu fetch dari database backend
  useEffect(() => {
    setIsMounted(true);
    try {
      const isClean = localStorage.getItem('saku_data_clean_v2');
      if (isClean === 'true') {
        const saved = localStorage.getItem('saku_react_state');
        if (saved) setData(JSON.parse(saved));
      } else {
        localStorage.setItem('saku_data_clean_v2', 'true');
        localStorage.setItem('saku_react_state', JSON.stringify(INITIAL_DATA));
        setData(INITIAL_DATA);
      }
    } catch (e) {
      console.warn('Failed reading localStorage', e);
    }
    fetchServerData();
  }, [fetchServerData]);

  // Persist to localStorage on data changes
  useEffect(() => {
    try {
      localStorage.setItem('saku_react_state', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
  }, [data]);

  // 1. TAMBAH TRANSAKSI
  const handleAddTransaction = async (newTx) => {
    const isExpense = newTx.amount < 0;
    const absAmount = Math.abs(newTx.amount);

    setData((prev) => {
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

      const nextBudgets = (prev.budgets || []).map((b) => {
        if (isExpense && b.name === newTx.category) {
          return { ...b, spent: Number(b.spent || 0) + absAmount };
        }
        return b;
      });

      const nextWallets = (prev.wallets || []).map((w) => {
        if (w.name === newTx.wallet || w.id === newTx.wallet_id) {
          const delta = isExpense ? -absAmount : absAmount;
          return { ...w, balance: Math.max(0, Number(w.balance || 0) + delta) };
        }
        return w;
      });

      return {
        ...prev,
        metrics: nextMetrics,
        budgets: nextBudgets,
        wallets: nextWallets,
        transactions: [newTx, ...(prev.transactions || [])],
      };
    });

    addToast('Transaksi berhasil ditambahkan!');

    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      fetchServerData();
    } catch (err) {
      console.error('Error saving transaction to server:', err);
    }
  };

  // 2. HAPUS TRANSAKSI
  const handleDeleteTransaction = async (txId) => {
    setData((prev) => {
      const targetTx = prev.transactions?.find((t) => t.id === txId);
      if (!targetTx) return prev;

      const isExpense = targetTx.amount < 0;
      const absAmount = Math.abs(targetTx.amount);
      const nextMetrics = { ...prev.metrics };

      if (isExpense) {
        nextMetrics.totalSaldo += absAmount;
        nextMetrics.pengeluaran = Math.max(0, nextMetrics.pengeluaran - absAmount);
        nextMetrics.pertambahanSaldo += absAmount;
      } else {
        nextMetrics.totalSaldo = Math.max(0, nextMetrics.totalSaldo - absAmount);
        nextMetrics.pemasukan = Math.max(0, nextMetrics.pemasukan - absAmount);
        nextMetrics.pertambahanSaldo -= absAmount;
      }

      const nextBudgets = (prev.budgets || []).map((b) => {
        if (isExpense && b.name === targetTx.category) {
          return { ...b, spent: Math.max(0, Number(b.spent || 0) - absAmount) };
        }
        return b;
      });

      const nextWallets = (prev.wallets || []).map((w) => {
        if (w.name === targetTx.wallet || w.id === targetTx.wallet_id) {
          const delta = isExpense ? absAmount : -absAmount;
          return { ...w, balance: Math.max(0, Number(w.balance || 0) + delta) };
        }
        return w;
      });

      return {
        ...prev,
        metrics: nextMetrics,
        budgets: nextBudgets,
        wallets: nextWallets,
        transactions: prev.transactions.filter((t) => t.id !== txId),
      };
    });

    addToast('Transaksi berhasil dihapus.');

    try {
      await fetch(`/api/transactions?id=${txId}`, { method: 'DELETE' });
      fetchServerData();
    } catch (err) {
      console.error('Error deleting transaction on server:', err);
    }
  };

  // 3. SIMPAN ANGGARAN
  const handleSaveBudgets = async (newBudgets) => {
    setData((prev) => ({
      ...prev,
      budgets: newBudgets,
    }));
    addToast('Anggaran bulanan berhasil diperbarui!');

    try {
      await fetch('/api/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgets: newBudgets, period: currentPeriod }),
      });
      fetchServerData();
    } catch (err) {
      console.error('Error saving budgets to server:', err);
    }
  };

  // 4. TAMBAH TARGET TABUNGAN
  const handleAddGoal = async (newGoal) => {
    setData((prev) => ({
      ...prev,
      savings: [...(prev.savings || []), newGoal],
    }));
    addToast('Target tabungan baru berhasil dibuat!');

    try {
      await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });
      fetchServerData();
    } catch (err) {
      console.error('Error saving goal to server:', err);
    }
  };

  // 5. DEPOSIT / SETORAN TABUNGAN
  const handleDepositGoal = async (goalId, depositAmount) => {
    setData((prev) => ({
      ...prev,
      savings: (prev.savings || []).map((g) =>
        g.id === goalId ? { ...g, current: Number(g.current || 0) + depositAmount } : g
      ),
    }));
    addToast(`Setoran Rp${depositAmount.toLocaleString('id-ID')} berhasil disimpan!`);

    try {
      await fetch('/api/savings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, deposit_amount: depositAmount }),
      });
      fetchServerData();
    } catch (err) {
      console.error('Error depositing to goal on server:', err);
    }
  };

  // 6. HAPUS TARGET TABUNGAN
  const handleDeleteGoal = async (goalId) => {
    setData((prev) => ({
      ...prev,
      savings: (prev.savings || []).filter((g) => g.id !== goalId),
    }));
    addToast('Target tabungan berhasil dihapus.');

    try {
      await fetch(`/api/savings?id=${goalId}`, { method: 'DELETE' });
      fetchServerData();
    } catch (err) {
      console.error('Error deleting goal on server:', err);
    }
  };

  // 7. TRANSFER ANTAR DOMPET
  const handleTransfer = async ({ fromWallet, toWallet, amount }) => {
    setData((prev) => {
      const nextWallets = (prev.wallets || []).map((w) => {
        if (w.name === fromWallet) {
          return { ...w, balance: Math.max(0, Number(w.balance || 0) - amount) };
        }
        if (w.name === toWallet) {
          return { ...w, balance: Number(w.balance || 0) + amount };
        }
        return w;
      });
      return { ...prev, wallets: nextWallets };
    });

    addToast(`Berhasil transfer Rp${amount.toLocaleString('id-ID')} dari ${fromWallet} ke ${toWallet}!`);

    try {
      await fetch('/api/wallets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromWallet, toWallet, amount }),
      });
      fetchServerData();
    } catch (err) {
      console.error('Error transferring on server:', err);
    }
  };

  // 8. TAMBAH DOMPET BARU
  const handleAddWallet = async (newWallet) => {
    setData((prev) => ({
      ...prev,
      wallets: [...(prev.wallets || []), newWallet],
      metrics: {
        ...prev.metrics,
        totalSaldo: (prev.metrics?.totalSaldo || 0) + Number(newWallet.balance || 0),
      },
    }));
    addToast(`Dompet "${newWallet.name}" berhasil dibuat!`);

    try {
      await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWallet),
      });
      fetchServerData();
    } catch (err) {
      console.error('Error adding wallet on server:', err);
    }
  };

  // 9. HAPUS DOMPET
  const handleDeleteWallet = async (walletId) => {
    setData((prev) => ({
      ...prev,
      wallets: (prev.wallets || []).filter((w) => w.id !== walletId),
    }));
    addToast('Dompet berhasil dihapus.');

    try {
      await fetch(`/api/wallets?id=${walletId}`, { method: 'DELETE' });
      fetchServerData();
    } catch (err) {
      console.error('Error deleting wallet on server:', err);
    }
  };

  const handleSelectPeriod = (p) => {
    setCurrentPeriod(p);
    fetchServerData(p);
    addToast(`Periode diubah ke ${p}`);
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
            </svg>
          </div>
          <span className="brand-name">Saku</span>
        </div>

        <div className="mobile-header-right">
          <button className="icon-btn-ghost" onClick={() => addToast('Tidak ada notifikasi baru.')} aria-label="Notifikasi">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar Navigation (desktop) */}
      <Sidebar
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
            setCurrentPeriod={handleSelectPeriod}
            onOpenAddTx={() => setIsAddTxOpen(true)}
            onOpenManageBudget={() => setIsManageBudgetOpen(true)}
            onOpenAddGoal={() => setIsAddGoalOpen(true)}
            addToast={addToast}
          />
        )}

        {activeNav === 'transaksi' && (
          <TransactionsPage
            transactions={data.transactions}
            onDeleteTransaction={handleDeleteTransaction}
            currentPeriod={currentPeriod}
            onSelectPeriod={handleSelectPeriod}
            onOpenAddTx={() => setIsAddTxOpen(true)}
            addToast={addToast}
          />
        )}

        {activeNav === 'dompet' && (
          <WalletsPage
            wallets={data.wallets}
            transactions={data.transactions}
            currentPeriod={currentPeriod}
            onSelectPeriod={handleSelectPeriod}
            addToast={addToast}
            onOpenTransferModal={() => setIsTransferOpen(true)}
            onOpenAddWalletModal={() => setIsAddWalletOpen(true)}
            onDeleteWallet={handleDeleteWallet}
          />
        )}

        {activeNav === 'anggaran' && (
          <BudgetPage
            currentPeriod={currentPeriod}
            onSelectPeriod={handleSelectPeriod}
            budgets={data.budgets}
            onOpenManageBudget={() => setIsManageBudgetOpen(true)}
            onOpenAddBudget={() => setIsManageBudgetOpen(true)}
            onUpdateBudget={handleSaveBudgets}
            onSwitchTab={setActiveNav}
            addToast={addToast}
          />
        )}

        {activeNav === 'target-tabungan' && (
          <SavingsPage
            currentPeriod={currentPeriod}
            onSelectPeriod={handleSelectPeriod}
            savings={data.savings}
            onOpenAddGoal={() => setIsAddGoalOpen(true)}
            onDepositGoal={handleDepositGoal}
            onDeleteGoal={handleDeleteGoal}
            onSwitchTab={setActiveNav}
            addToast={addToast}
          />
        )}

        {activeNav === 'laporan' && (
          <ReportsPage
            currentPeriod={currentPeriod}
            onSelectPeriod={handleSelectPeriod}
            metrics={data.metrics}
            transactions={data.transactions}
            budgets={data.budgets}
            addToast={addToast}
          />
        )}
      </main>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onAddTransaction={handleAddTransaction}
        wallets={data.wallets}
        budgets={data.budgets}
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
        wallets={data.wallets}
      />

      <AddWalletModal
        isOpen={isAddWalletOpen}
        onClose={() => setIsAddWalletOpen(false)}
        onAddWallet={handleAddWallet}
      />

      {/* Menu Lainnya Modal (Mobile Bottom Sheet) */}
      <MoreMenuModal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        activeNav={activeNav}
        onSelectNav={(navId) => {
          setActiveNav(navId);
          setIsMoreMenuOpen(false);
        }}
        onOpenManageBudget={() => setIsManageBudgetOpen(true)}
        onOpenTransferModal={() => setIsTransferOpen(true)}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} />

      {/* Mobile Bottom Navigation */}
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
              item.id === 'lainnya' ? (isMoreMenuOpen || activeNav === 'laporan') : false;

            const handleClick = () => {
              if (item.id === 'rencana') {
                setActiveNav('anggaran');
              } else if (item.id === 'lainnya') {
                setIsMoreMenuOpen(true);
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

