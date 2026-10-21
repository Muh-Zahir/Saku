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
 * Isi data awal otomatis jika database masih kosong (semua saldo dan nominal dimulai dari 0)
 */
export async function seedInitialData() {
  // Wallets default (saldo 0)
  const wallets = [
    { id: 'w-1', name: 'BCA', type: 'Rekening bank · •••• 4821', balance: 0, color: 'blue', icon: 'bank' },
    { id: 'w-2', name: 'GoPay', type: 'Dompet digital · •••• 7812', balance: 0, color: 'green', icon: 'phone' },
    { id: 'w-3', name: 'Tunai', type: 'Uang tunai · Dompet sehari-hari', balance: 0, color: 'amber', icon: 'cash' },
  ];
  for (const w of wallets) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO wallets (id, name, type, balance, color, icon) VALUES (?, ?, ?, ?, ?, ?)',
      args: [w.id, w.name, w.type, w.balance, w.color, w.icon],
    });
  }

  // Budgets default (spent 0, limit 0)
  const budgets = [
    { id: 'b1', name: 'Makan & minum', spent: 0, limit_amount: 0, color: 'green', period: 'Oktober 2026' },
    { id: 'b2', name: 'Tempat tinggal', spent: 0, limit_amount: 0, color: 'green', period: 'Oktober 2026' },
    { id: 'b3', name: 'Transportasi', spent: 0, limit_amount: 0, color: 'green', period: 'Oktober 2026' },
    { id: 'b4', name: 'Belanja', spent: 0, limit_amount: 0, color: 'green', period: 'Oktober 2026' },
    { id: 'b5', name: 'Lainnya', spent: 0, limit_amount: 0, color: 'green', period: 'Oktober 2026' },
  ];
  for (const b of budgets) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO budgets (id, name, spent, limit_amount, color, period) VALUES (?, ?, ?, ?, ?, ?)',
      args: [b.id, b.name, b.spent, b.limit_amount, b.color, b.period],
    });
  }
}

/**
 * Reset seluruh data database menjadi 0
 */
export async function resetDatabaseToZero() {
  await initializeDatabase();
  await db.execute('DELETE FROM transactions');
  await db.execute('DELETE FROM savings_goals');
  await db.execute('UPDATE wallets SET balance = 0');
  await db.execute('UPDATE budgets SET spent = 0, limit_amount = 0');
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
