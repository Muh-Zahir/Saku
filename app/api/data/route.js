import { db, ensureDbReady, MONTH_NAMES_ID, parseDateComponents, getPaydayCycleInfo } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/data?period=... - Mengambil seluruh data aplikasi tersinkronisasi berdasarkan periode bulan yang dipilih
export async function GET(request) {
  try {
    await ensureDbReady();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'Oktober 2026';
    const cycleMode = searchParams.get('cycle') || 'payday'; // 'payday' atau 'calendar'
    const paydayDay = parseInt(searchParams.get('paydayDay') || '25', 10);

    const paydayCycle = getPaydayCycleInfo(period, paydayDay);

    const [walletsRes, txRes, budgetsRes, savingsRes, allTxRes] = await Promise.all([
      db.execute('SELECT * FROM wallets ORDER BY created_at ASC'),
      db.execute({
        sql: 'SELECT * FROM transactions WHERE period = ? ORDER BY date DESC, created_at DESC',
        args: [period],
      }),
      db.execute({
        sql: 'SELECT * FROM budgets WHERE period = ? ORDER BY limit_amount DESC',
        args: [period],
      }),
      db.execute('SELECT * FROM savings_goals ORDER BY created_at DESC'),
      // Ambil ringkasan seluruh transaksi untuk siklus gajian & grafik bulanan
      db.execute('SELECT period, type, category, amount, date FROM transactions'),
    ]);

    // 1. Wallets
    const totalSaldo = walletsRes.rows.reduce((sum, w) => sum + Number(w.balance || 0), 0);
    const wallets = walletsRes.rows.map((w) => ({
      ...w,
      balance: Number(w.balance || 0),
      share: totalSaldo > 0
        ? `${((Number(w.balance || 0) / totalSaldo) * 100).toFixed(1).replace('.', ',')}%`
        : '0%',
    }));

    // 2. Transaksi untuk periode yang dipilih
    const transactions = txRes.rows.map((tx) => ({
      ...tx,
      amount: Number(tx.amount || 0),
      wallet: tx.wallet_name || tx.wallet || 'BCA',
    }));

    // 3. Hitung metrics bulanan hanya dari transaksi pada periode ini
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

    // Filter seluruh pengeluaran untuk perhitungan siklus gajian (reset tiap tanggal 25)
    const allExpenses = allTxRes.rows.filter((t) => t.type === 'expense');

    // 4. Budgets untuk periode ini
    let budgets = budgetsRes.rows.map((b) => {
      // 1. Pengeluaran dalam siklus gajian (mulai tanggal 25 saat gajian masuk)
      const paydaySpent = allExpenses
        .filter((t) => {
          if (t.category !== b.name) return false;
          const { timestamp } = parseDateComponents(t.date, t.period);
          return timestamp >= paydayCycle.startTimestamp && timestamp <= paydayCycle.endTimestamp;
        })
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      // 2. Pengeluaran dalam 1 bulan kalender penuh (1 - 31)
      const calendarSpent = transactions
        .filter((t) => t.type === 'expense' && t.category === b.name)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      // 3. Pengeluaran pada siklus gajian sebelumnya (25 bulan lalu - 24 bulan ini)
      const previousCycleSpent = allExpenses
        .filter((t) => {
          if (t.category !== b.name) return false;
          const { timestamp } = parseDateComponents(t.date, t.period);
          return timestamp >= paydayCycle.prevStartTimestamp && timestamp <= paydayCycle.prevEndTimestamp;
        })
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      // Nilai spent aktif: gunakan paydaySpent secara default agar anggaran reset otomatis tiap tanggal 25
      const spent = cycleMode === 'calendar' ? calendarSpent : paydaySpent;

      return {
        id: b.id,
        name: b.name,
        spent,
        limit: Number(b.limit_amount || b.limit || 0),
        color: b.color || 'green',
        period: b.period,
        paydaySpent,
        calendarSpent,
        previousCycleSpent,
      };
    });

    // Jika budget untuk periode baru ini belum pernah dibuat, inisialisasi kategori standar
    if (budgets.length === 0) {
      const defaultCategories = [
        { name: 'Makan & minum', limit: 2500000, color: 'green' },
        { name: 'Tempat tinggal', limit: 2000000, color: 'green' },
        { name: 'Transportasi', limit: 1000000, color: 'green' },
        { name: 'Belanja', limit: 1500000, color: 'green' },
        { name: 'Lainnya', limit: 800000, color: 'green' },
      ];

      budgets = defaultCategories.map((c, i) => {
        const paydaySpent = allExpenses
          .filter((t) => {
            if (t.category !== c.name) return false;
            const { timestamp } = parseDateComponents(t.date, t.period);
            return timestamp >= paydayCycle.startTimestamp && timestamp <= paydayCycle.endTimestamp;
          })
          .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

        const calendarSpent = transactions
          .filter((t) => t.type === 'expense' && t.category === c.name)
          .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

        const spent = cycleMode === 'calendar' ? calendarSpent : paydaySpent;

        return {
          id: `b-${period.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
          name: c.name,
          spent,
          limit: c.limit,
          color: c.color,
          period,
          paydaySpent,
          calendarSpent,
        };
      });

      // Simpan ke database di latar belakang agar tersimpan permanen
      for (const b of budgets) {
        db.execute({
          sql: 'INSERT OR IGNORE INTO budgets (id, name, spent, limit_amount, color, period) VALUES (?, ?, ?, ?, ?, ?)',
          args: [b.id, b.name, b.spent, b.limit, b.color, b.period],
        }).catch(() => {});
      }
    }

    // 5. Savings
    const savings = savingsRes.rows.map((s) => ({
      id: s.id,
      name: s.name,
      targetDate: s.target_date || 'Target Des 2026',
      current: Number(s.current_amount || 0),
      target: Number(s.target_amount || 0),
      type: s.type || 'target',
    }));

    // 6. Hitung distribusi Cashflow Mingguan (1-7, 8-14, 15-21, 22-31) berdasarkan tanggal transaksi di bulan ini
    const monthShort = period.split(' ')[0] ? period.split(' ')[0].slice(0, 3) : 'Bln';
    const weeklyBuckets = [
      { label: `1–7 ${monthShort}`, income: 0, expense: 0 },
      { label: `8–14 ${monthShort}`, income: 0, expense: 0 },
      { label: `15–21 ${monthShort}`, income: 0, expense: 0 },
      { label: `22–31 ${monthShort}`, income: 0, expense: 0 },
    ];

    transactions.forEach((tx) => {
      // Ekstrak hari dari tanggal transaksi (misal: "08 Agu 2026" atau "2026-08-08")
      let day = 1;
      const rawDate = String(tx.date || '');
      const matchDay = rawDate.match(/^(\d{1,2})/);
      if (matchDay) {
        day = parseInt(matchDay[1], 10);
      } else if (rawDate.includes('-')) {
        const parts = rawDate.split('-');
        day = parseInt(parts[2] || '1', 10);
      }

      const absAmt = Math.abs(tx.amount);
      const bucketIdx = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;

      if (tx.type === 'income') {
        weeklyBuckets[bucketIdx].income += absAmt;
      } else if (tx.type === 'expense') {
        weeklyBuckets[bucketIdx].expense += absAmt;
      }
    });

    // 7. Hitung ringkasan Cashflow Bulanan dari seluruh transaksi di DB
    const periodTotals = {};
    allTxRes.rows.forEach((r) => {
      const p = r.period || 'Oktober 2026';
      if (!periodTotals[p]) {
        periodTotals[p] = { income: 0, expense: 0 };
      }
      const amt = Math.abs(Number(r.amount || 0));
      if (r.type === 'income') {
        periodTotals[p].income += amt;
      } else if (r.type === 'expense') {
        periodTotals[p].expense += amt;
      }
    });

    // Ambil 4 bulan umum untuk perbandingan
    const compareMonths = ['Agustus 2026', 'September 2026', 'Oktober 2026', 'November 2026'];
    const monthlyBuckets = compareMonths.map((m) => {
      const short = m.split(' ')[0].slice(0, 3) + ' ' + m.split(' ')[1];
      const data = periodTotals[m] || { income: 0, expense: 0 };
      return {
        label: short,
        income: data.income,
        expense: data.expense,
      };
    });

    const cashflow = {
      weekly: weeklyBuckets,
      monthly: monthlyBuckets,
    };

    const now = new Date();
    const lastSync = `Diperbarui ${now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}`;

    return NextResponse.json({
      profile: {
        period,
        lastSync,
      },
      metrics: {
        totalSaldo,
        pertambahanSaldo,
        pemasukan,
        pemasukanDesc: pemasukan > 0 ? `Pemasukan ${period}` : 'Belum ada pemasukan',
        pengeluaran,
        pengeluaranDesc: pengeluaran > 0 ? `Pengeluaran ${period}` : 'Belum ada pengeluaran',
      },
      cashflow,
      wallets,
      transactions,
      budgets,
      savings,
      paydayCycle,
    });
  } catch (error) {
    console.error('GET /api/data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
