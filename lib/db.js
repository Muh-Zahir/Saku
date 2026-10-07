import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is not set');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is not set');
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Initialize database schema - run once on first deploy
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
      wallet_id TEXT NOT NULL,
      wallet_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
      icon TEXT NOT NULL DEFAULT 'circle',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (wallet_id) REFERENCES wallets(id)
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

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY DEFAULT 'default',
      name TEXT NOT NULL DEFAULT 'User',
      role TEXT NOT NULL DEFAULT 'Akun pribadi',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
