import { db, initializeDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/seed - Initialize DB with sample data
export async function GET() {
  try {
    await initializeDatabase();

    // Check if already seeded
    const existing = await db.execute('SELECT COUNT(*) as count FROM wallets');
    if (existing.rows[0].count > 0) {
      return NextResponse.json({ message: 'Database already seeded', seeded: false });
    }

    // Seed wallets
    const wallets = [
      { id: 'w-bca', name: 'BCA', type: 'bank', balance: 18500000, color: 'blue', icon: 'building-2' },
      { id: 'w-gopay', name: 'GoPay', type: 'ewallet', balance: 1350000, color: 'green', icon: 'wallet' },
      { id: 'w-cash', name: 'Tunai', type: 'cash', balance: 5000000, color: 'amber', icon: 'banknotes' },
    ];

    for (const w of wallets) {
      await db.execute({
        sql: 'INSERT INTO wallets (id, name, type, balance, color, icon) VALUES (?, ?, ?, ?, ?, ?)',
        args: [w.id, w.name, w.type, w.balance, w.color, w.icon],
      });
    }

    // Seed transactions
    const transactions = [
      { id: 'tx-1', title: 'Belanja mingguan', date: '30 Sep 2026', category: 'Makan & minum', wallet_id: 'w-bca', wallet_name: 'BCA', amount: -350000, type: 'expense', icon: 'shopping-bag' },
      { id: 'tx-2', title: 'Isi bensin', date: '29 Sep 2026', category: 'Transportasi', wallet_id: 'w-bca', wallet_name: 'BCA', amount: -150000, type: 'expense', icon: 'fuel' },
      { id: 'tx-3', title: 'Kopi sore', date: '28 Sep 2026', category: 'Makan & minum', wallet_id: 'w-gopay', wallet_name: 'GoPay', amount: -45000, type: 'expense', icon: 'coffee' },
      { id: 'tx-4', title: 'Sepatu olahraga', date: '27 Sep 2026', category: 'Belanja', wallet_id: 'w-bca', wallet_name: 'BCA', amount: -450000, type: 'expense', icon: 'shopping' },
      { id: 'tx-5', title: 'Gaji September', date: '25 Sep 2026', category: 'Gaji', wallet_id: 'w-bca', wallet_name: 'BCA', amount: 12000000, type: 'income', icon: 'briefcase' },
    ];

    for (const tx of transactions) {
      await db.execute({
        sql: 'INSERT INTO transactions (id, title, date, category, wallet_id, wallet_name, amount, type, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [tx.id, tx.title, tx.date, tx.category, tx.wallet_id, tx.wallet_name, tx.amount, tx.type, tx.icon],
      });
    }

    // Seed budgets (current period)
    const period = new Date().toISOString().slice(0, 7);
    const budgets = [
      { id: 'b1', name: 'Makan & minum', spent: 2100000, limit_amount: 2500000, color: 'green' },
      { id: 'b2', name: 'Tempat tinggal', spent: 3000000, limit_amount: 3000000, color: 'amber' },
      { id: 'b3', name: 'Transportasi', spent: 850000, limit_amount: 1200000, color: 'green' },
      { id: 'b4', name: 'Belanja', spent: 900000, limit_amount: 1500000, color: 'green' },
      { id: 'b5', name: 'Lainnya', spent: 500000, limit_amount: 800000, color: 'green' },
    ];

    for (const b of budgets) {
      await db.execute({
        sql: 'INSERT INTO budgets (id, name, spent, limit_amount, color, period) VALUES (?, ?, ?, ?, ?, ?)',
        args: [b.id, b.name, b.spent, b.limit_amount, b.color, period],
      });
    }

    // Seed savings goals
    const savings = [
      { id: 's1', name: 'Dana darurat', target_date: 'Target Des 2026', current_amount: 15000000, target_amount: 20000000, type: 'shield' },
      { id: 's2', name: 'Liburan ke Jepang', target_date: 'Target Jun 2027', current_amount: 5500000, target_amount: 10000000, type: 'plane' },
      { id: 's3', name: 'Laptop baru', target_date: 'Target Mar 2027', current_amount: 4350000, target_amount: 12000000, type: 'laptop' },
    ];

    for (const s of savings) {
      await db.execute({
        sql: 'INSERT INTO savings_goals (id, name, target_date, current_amount, target_amount, type) VALUES (?, ?, ?, ?, ?, ?)',
        args: [s.id, s.name, s.target_date, s.current_amount, s.target_amount, s.type],
      });
    }

    return NextResponse.json({ message: 'Database seeded successfully!', seeded: true });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
