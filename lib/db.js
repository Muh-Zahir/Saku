import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Validasi apakah credentials Turso asli sudah diisi atau masih placeholder
const hasValidTurso = Boolean(
  url &&
  authToken &&
  authToken !== 'isi_token_mu_disini' &&
  !authToken.startsWith('isi_') &&
  url.startsWith('libsql://')
);

// Jika di Turso/production gunakan Turso, jika lokal/tanpa token fallback ke SQLite lokal (file:saku.db)
export const db = createClient(
  hasValidTurso
    ? { url, authToken }
    : { url: 'file:saku.db' }
);

/**
 * Inisialisasi struktur tabel database
 */
export async function initializeDatabase() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT 'emerald',
      icon TEXT NOT NULL DEFAULT 'wallet',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      wallet_id TEXT,
      wallet_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
      icon TEXT NOT NULL DEFAULT 'circle',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      spent INTEGER NOT NULL DEFAULT 0,
      limit_amount INTEGER NOT NULL,
      color TEXT NOT NULL DEFAULT 'green',
      period TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_date TEXT NOT NULL,
      current_amount INTEGER NOT NULL DEFAULT 0,
      target_amount INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'target',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/**
 * Isi data awal otomatis jika database masih kosong
 */
export async function seedInitialData() {
  // Wallets
  const wallets = [
    { id: 'w-1', name: 'BCA', type: 'Rekening bank · •••• 4821', balance: 22000000, color: 'blue', icon: 'bank' },
    { id: 'w-2', name: 'GoPay', type: 'Dompet digital · •••• 7812', balance: 850000, color: 'green', icon: 'phone' },
    { id: 'w-3', name: 'Tunai', type: 'Uang tunai · Dompet sehari-hari', balance: 2000000, color: 'amber', icon: 'cash' },
  ];
  for (const w of wallets) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO wallets (id, name, type, balance, color, icon) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [w.id, w.name, w.type, w.balance, w.color, w.icon],
    });
  }

  // Transactions
  const transactions = [
    { id: 'tx-1', title: 'Belanja mingguan', date: '30 Sep 2026', category: 'Makan & minum', wallet_id: 'w-1', wallet_name: 'BCA', amount: -350000, type: 'expense', icon: 'shopping-bag' },
    { id: 'tx-2', title: 'Isi bensin', date: '29 Sep 2026', category: 'Transportasi', wallet_id: 'w-1', wallet_name: 'BCA', amount: -150000, type: 'expense', icon: 'fuel' },
    { id: 'tx-3', title: 'Kopi sore', date: '28 Sep 2026', category: 'Makan & minum', wallet_id: 'w-2', wallet_name: 'GoPay', amount: -45000, type: 'expense', icon: 'coffee' },
    { id: 'tx-4', title: 'Sepatu olahraga', date: '27 Sep 2026', category: 'Belanja', wallet_id: 'w-1', wallet_name: 'BCA', amount: -450000, type: 'expense', icon: 'shopping-bag' },
    { id: 'tx-5', title: 'Gaji September', date: '25 Sep 2026', category: 'Gaji', wallet_id: 'w-1', wallet_name: 'BCA', amount: 12000000, type: 'income', icon: 'briefcase' },
    { id: 'tx-6', title: 'Makan bersama keluarga', date: '24 Sep 2026', category: 'Makan & minum', wallet_id: 'w-1', wallet_name: 'BCA', amount: -355000, type: 'expense', icon: 'utensils' },
    { id: 'tx-7', title: 'Transportasi harian', date: '22 Sep 2026', category: 'Transportasi', wallet_id: 'w-2', wallet_name: 'GoPay', amount: -150000, type: 'expense', icon: 'car' },
    { id: 'tx-8', title: 'Perlengkapan rumah', date: '20 Sep 2026', category: 'Belanja', wallet_id: 'w-1', wallet_name: 'BCA', amount: -450000, type: 'expense', icon: 'shopping-bag' },
    { id: 'tx-9', title: 'Belanja bahan makanan', date: '18 Sep 2026', category: 'Makan & minum', wallet_id: 'w-1', wallet_name: 'BCA', amount: -600000, type: 'expense', icon: 'shopping-bag' },
    { id: 'tx-10', title: 'Langganan aplikasi', date: '16 Sep 2026', category: 'Lainnya', wallet_id: 'w-1', wallet_name: 'BCA', amount: -150000, type: 'expense', icon: 'refresh' },
    { id: 'tx-11', title: 'Bonus freelance proyek', date: '15 Sep 2026', category: 'Gaji', wallet_id: 'w-1', wallet_name: 'BCA', amount: 500000, type: 'income', icon: 'briefcase' },
    { id: 'tx-12', title: 'Sewa apartemen', date: '10 Sep 2026', category: 'Tempat tinggal', wallet_id: 'w-1', wallet_name: 'BCA', amount: -3000000, type: 'expense', icon: 'home' },
    { id: 'tx-13', title: 'Listrik & air', date: '08 Sep 2026', category: 'Tempat tinggal', wallet_id: 'w-1', wallet_name: 'BCA', amount: -450000, type: 'expense', icon: 'home' },
    { id: 'tx-14', title: 'Makan malam teman', date: '06 Sep 2026', category: 'Makan & minum', wallet_id: 'w-2', wallet_name: 'GoPay', amount: -250000, type: 'expense', icon: 'utensils' },
    { id: 'tx-15', title: 'Bensin luar kota', date: '05 Sep 2026', category: 'Transportasi', wallet_id: 'w-1', wallet_name: 'BCA', amount: -300000, type: 'expense', icon: 'fuel' },
    { id: 'tx-16', title: 'Buku pengembangan diri', date: '04 Sep 2026', category: 'Belanja', wallet_id: 'w-2', wallet_name: 'GoPay', amount: -180000, type: 'expense', icon: 'shopping-bag' },
    { id: 'tx-17', title: 'Snack & camilan', date: '02 Sep 2026', category: 'Makan & minum', wallet_id: 'w-3', wallet_name: 'Tunai', amount: -50000, type: 'expense', icon: 'coffee' },
    { id: 'tx-18', title: 'Donasi bulanan', date: '01 Sep 2026', category: 'Lainnya', wallet_id: 'w-1', wallet_name: 'BCA', amount: -350000, type: 'expense', icon: 'refresh' },
  ];
  for (const tx of transactions) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO transactions (id, title, date, category, wallet_id, wallet_name, amount, type, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [tx.id, tx.title, tx.date, tx.category, tx.wallet_id, tx.wallet_name, tx.amount, tx.type, tx.icon],
    });
  }

  // Budgets
  const budgets = [
    { id: 'b1', name: 'Makan & minum', spent: 2100000, limit: 2500000, color: 'green', period: 'September 2026' },
    { id: 'b2', name: 'Tempat tinggal', spent: 3000000, limit: 3000000, color: 'amber', period: 'September 2026' },
    { id: 'b3', name: 'Transportasi', spent: 850000, limit: 1200000, color: 'green', period: 'September 2026' },
    { id: 'b4', name: 'Belanja', spent: 900000, limit: 1500000, color: 'green', period: 'September 2026' },
    { id: 'b5', name: 'Lainnya', spent: 500000, limit: 800000, color: 'green', period: 'September 2026' },
  ];
  for (const b of budgets) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO budgets (id, name, spent, limit_amount, color, period) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [b.id, b.name, b.spent, b.limit, b.color, b.period],
    });
  }

  // Savings
  const savings = [
    { id: 's1', name: 'Dana darurat', targetDate: 'Target Des 2026', current: 15000000, target: 20000000, type: 'shield' },
    { id: 's2', name: 'Liburan ke Jepang', targetDate: 'Target Jun 2027', current: 5500000, target: 10000000, type: 'plane' },
    { id: 's3', name: 'Laptop baru', targetDate: 'Target Mar 2027', current: 4350000, target: 12000000, type: 'laptop' },
  ];
  for (const s of savings) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO savings_goals (id, name, target_date, current_amount, target_amount, type) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [s.id, s.name, s.targetDate, s.current, s.target, s.type],
    });
  }
}

let dbReadyPromise = null;

export async function ensureDbReady() {
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      await initializeDatabase();
      const countRes = await db.execute('SELECT COUNT(*) as cnt FROM wallets');
      if (Number(countRes.rows[0]?.cnt || 0) === 0) {
        await seedInitialData();
      }
    })().catch((err) => {
      dbReadyPromise = null;
      throw err;
    });
  }
  return dbReadyPromise;
}
