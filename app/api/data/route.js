import { db, ensureDbReady } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/data - Mengambil seluruh data aplikasi tersinkronisasi dalam 1 panggilan
export async function GET(request) {
  try {
    await ensureDbReady();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'September 2026';

    const [walletsRes, txRes, budgetsRes, savingsRes] = await Promise.all([
      db.execute('SELECT * FROM wallets ORDER BY created_at ASC'),
      db.execute('SELECT * FROM transactions ORDER BY created_at DESC'),
      db.execute({
        sql: 'SELECT * FROM budgets WHERE period = ? ORDER BY limit_amount DESC',
        args: [period],
      }),
      db.execute('SELECT * FROM savings_goals ORDER BY created_at DESC'),
    ]);

    // Format wallets
    const totalSaldo = walletsRes.rows.reduce((sum, w) => sum + Number(w.balance || 0), 0);
    const wallets = walletsRes.rows.map((w) => ({
      ...w,
      balance: Number(w.balance || 0),
      share: totalSaldo > 0
        ? `${((Number(w.balance || 0) / totalSaldo) * 100).toFixed(1).replace('.', ',')}%`
        : '0%',
    }));

    // Format transactions
    const transactions = txRes.rows.map((tx) => ({
      ...tx,
      amount: Number(tx.amount || 0),
      wallet: tx.wallet_name || tx.wallet || 'BCA',
    }));

    // Calculate metrics dari transaksi
    let pemasukan = 0;
    let pengeluaran = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        pemasukan += Math.abs(tx.amount);
      } else if (tx.type === 'expense') {
        pengeluaran += Math.abs(tx.amount);
      }
    });

    const pertambahanSaldo = pemasukan - pengeluaran;

    // Format budgets
    let budgets = budgetsRes.rows.map((b) => ({
      id: b.id,
      name: b.name,
      spent: Number(b.spent || 0),
      limit: Number(b.limit_amount || b.limit || 0),
      color: b.color || 'green',
      period: b.period,
    }));

    // Jika budget untuk periode ini kosong, ambil budget default
    if (budgets.length === 0) {
      const allBudgets = await db.execute('SELECT * FROM budgets LIMIT 10');
      budgets = allBudgets.rows.map((b) => ({
        id: b.id,
        name: b.name,
        spent: Number(b.spent || 0),
        limit: Number(b.limit_amount || b.limit || 0),
        color: b.color || 'green',
        period: b.period,
      }));
    }

    // Format savings
    const savings = savingsRes.rows.map((s) => ({
      id: s.id,
      name: s.name,
      targetDate: s.target_date || 'Target Des 2026',
      current: Number(s.current_amount || 0),
      target: Number(s.target_amount || 0),
      type: s.type || 'target',
    }));

    const now = new Date();
    const lastSync = `Diperbarui ${now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}`;

    const monthShort = period.split(' ')[0] ? period.split(' ')[0].slice(0, 3) : 'Bln';
    const cashflow = {
      weekly: [
        { label: '1–7 ' + monthShort, income: 0, expense: 0 },
        { label: '8–14 ' + monthShort, income: 0, expense: 0 },
        { label: '15–21 ' + monthShort, income: 0, expense: 0 },
        { label: '22–31 ' + monthShort, income: pemasukan, expense: pengeluaran },
      ],
      monthly: [
        { label: 'Jul 2026', income: 0, expense: 0 },
        { label: 'Agu 2026', income: 0, expense: 0 },
        { label: 'Sep 2026', income: 0, expense: 0 },
        { label: period, income: pemasukan, expense: pengeluaran },
      ],
    };

    return NextResponse.json({
      profile: {
        period,
        lastSync,
      },
      metrics: {
        totalSaldo,
        pertambahanSaldo,
        pemasukan,
        pemasukanDesc: pemasukan > 0 ? 'Pemasukan bulan ini' : 'Belum ada pemasukan',
        pengeluaran,
      },
      cashflow,
      wallets,
      transactions,
      budgets,
      savings,
    });
  } catch (error) {
    console.error('GET /api/data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
