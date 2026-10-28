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

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MONTH_SHORT_MAP = {
  jan: 'Januari',
  feb: 'Februari',
  mar: 'Maret',
  apr: 'April',
  mei: 'Mei',
  jun: 'Juni',
  jul: 'Juli',
  agu: 'Agustus',
  agt: 'Agustus',
  sep: 'September',
  okt: 'Oktober',
  oct: 'Oktober',
  nov: 'November',
  des: 'Desember',
  dec: 'Desember',
};

/**
 * Konversi tanggal (ISO YYYY-MM-DD atau formatted string "23 Okt 2026") menjadi nama periode "Oktober 2026"
 */
export function getPeriodFromDate(dateStr, fallbackPeriod = 'Oktober 2026') {
  if (!dateStr || dateStr === 'Hari ini') return fallbackPeriod;

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.split('-');
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES_ID[monthIdx]} ${year}`;
    }
  }

  // Format "26 Okt 2026" atau "26 Oktober 2026"
  const parts = String(dateStr).trim().split(/\s+/);
  if (parts.length >= 3) {
    const monthPart = parts[1].toLowerCase().replace('.', '');
    const year = parts[2];
    const fullMonth = MONTH_SHORT_MAP[monthPart] || MONTH_NAMES_ID.find((m) => m.toLowerCase().startsWith(monthPart));
    if (fullMonth) {
      return `${fullMonth} ${year}`;
    }
  }

  return fallbackPeriod;
}

/**
 * Parse tanggal transaksi (ISO, string Indonesia, atau 'Hari ini')
 * menjadi objek { day, month (0-11), year, timestamp }
 */
export function parseDateComponents(dateStr, fallbackPeriod = 'Oktober 2026') {
  if (!dateStr || dateStr === 'Hari ini') {
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
      timestamp: now.getTime(),
    };
  }

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return {
      day,
      month,
      year,
      timestamp: new Date(year, month, day, 12, 0, 0).getTime(),
    };
  }

  // Format "25 Okt 2026" atau "26 Oktober 2026"
  const parts = String(dateStr).trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10) || 1;
    const monthKey = parts[1].toLowerCase().replace('.', '');
    const year = parseInt(parts[2], 10) || 2026;
    let monthIdx = MONTH_NAMES_ID.findIndex((m) => m.toLowerCase().startsWith(monthKey));
    if (monthIdx < 0) {
      const full = MONTH_SHORT_MAP[monthKey];
      monthIdx = full ? MONTH_NAMES_ID.findIndex((m) => m.toLowerCase() === full.toLowerCase()) : 9;
    }
    const finalMonth = monthIdx >= 0 ? monthIdx : 9;
    return {
      day,
      month: finalMonth,
      year,
      timestamp: new Date(year, finalMonth, day, 12, 0, 0).getTime(),
    };
  }

  const now = new Date();
  return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear(), timestamp: now.getTime() };
}

/**
 * Mendapatkan informasi siklus gajian (Payday Cycle) untuk periode yang dipilih
 * Siklus gajian dimulai tanggal 25 bulan M s/d tanggal 24 bulan M+1.
 * Contoh untuk "Oktober 2026" dengan resetDay = 25:
 * Siklus saat ini: 25 Okt 2026 – 24 Nov 2026
 * Siklus sebelumnya: 25 Sep 2026 – 24 Okt 2026
 */
export function getPaydayCycleInfo(periodStr = 'Oktober 2026', paydayDay = 25) {
  const parts = String(periodStr).trim().split(/\s+/);
  const monthName = parts[0] || 'Oktober';
  const year = parseInt(parts[1], 10) || 2026;

  let monthIdx = MONTH_NAMES_ID.findIndex((m) => m.toLowerCase() === monthName.toLowerCase());
  if (monthIdx < 0) monthIdx = 9;

  // Tanggal mulai siklus gajian periode ini: tgl 25 bulan ini pukul 00:00:00
  const startDate = new Date(year, monthIdx, paydayDay, 0, 0, 0, 0);

  // Tanggal akhir siklus gajian: tgl 24 bulan depan pukul 23:59:59
  const nextMonthIdx = (monthIdx + 1) % 12;
  const nextYear = monthIdx === 11 ? year + 1 : year;
  const endDate = new Date(nextYear, nextMonthIdx, paydayDay - 1, 23, 59, 59, 999);

  // Tanggal mulai siklus sebelumnya: tgl 25 bulan lalu pukul 00:00:00
  const prevMonthIdx = (monthIdx + 11) % 12;
  const prevYear = monthIdx === 0 ? year - 1 : year;
  const prevStartDate = new Date(prevYear, prevMonthIdx, paydayDay, 0, 0, 0, 0);
  const prevEndDate = new Date(year, monthIdx, paydayDay - 1, 23, 59, 59, 999);

  const startMonthShort = MONTH_NAMES_ID[monthIdx].slice(0, 3);
  const nextMonthShort = MONTH_NAMES_ID[nextMonthIdx].slice(0, 3);
  const prevMonthShort = MONTH_NAMES_ID[prevMonthIdx].slice(0, 3);

  const cycleLabel = `${paydayDay} ${startMonthShort} – ${paydayDay - 1} ${nextMonthShort} ${year !== nextYear ? `${year}/${nextYear}` : year}`;
  const previousCycleLabel = `${paydayDay} ${prevMonthShort} – ${paydayDay - 1} ${startMonthShort} ${prevYear !== year ? `${prevYear}/${year}` : year}`;

  const lastDayOfMonth = new Date(year, monthIdx + 1, 0).getDate();
  const calendarLabel = `1 – ${lastDayOfMonth} ${monthName} ${year}`;

  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  // Apakah hari ini sudah melewati atau sama dengan tanggal 25 di bulan ini?
  const isCurrentlyPastPayday = todayDay >= paydayDay;

  // Hitung hari menuju tanggal 25 berikutnya
  let nextPaydayDate = new Date(todayYear, todayMonth, paydayDay);
  if (now.getTime() >= nextPaydayDate.getTime()) {
    nextPaydayDate = new Date(todayYear, todayMonth + 1, paydayDay);
  }
  const diffMs = nextPaydayDate.getTime() - now.getTime();
  const daysUntilNextReset = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    enabled: true,
    resetDay: paydayDay,
    cycleLabel,
    previousCycleLabel,
    calendarLabel,
    startTimestamp: startDate.getTime(),
    endTimestamp: endDate.getTime(),
    prevStartTimestamp: prevStartDate.getTime(),
    prevEndTimestamp: prevEndDate.getTime(),
    lastResetDate: `${paydayDay} ${MONTH_NAMES_ID[monthIdx]} ${year}`,
    nextResetDate: `${paydayDay} ${MONTH_NAMES_ID[nextMonthIdx]} ${nextYear}`,
    daysUntilNextReset,
    isCurrentlyPastPayday,
    statusText: `Anggaran otomatis di-reset tiap tgl ${paydayDay} (Gajian).`,
  };
}


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
      period TEXT NOT NULL DEFAULT 'Oktober 2026',
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

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS financial_schedules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'debt',
      amount INTEGER NOT NULL DEFAULT 0,
      due_date TEXT NOT NULL,
      recurring TEXT NOT NULL DEFAULT 'once',
      recurring_day INTEGER,
      wallet_id TEXT,
      wallet_name TEXT,
      notes TEXT,
      is_paid INTEGER NOT NULL DEFAULT 0,
      paid_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrasi kolom period jika tabel transactions sudah ada sebelumnya
  try {
    await db.execute('ALTER TABLE transactions ADD COLUMN period TEXT');
  } catch (e) {
    // kolom sudah ada
  }

  // Backfill period yang kosong
  try {
    await db.execute(`
      UPDATE transactions 
      SET period = 'Oktober 2026' 
      WHERE period IS NULL OR period = ''
    `);
  } catch (e) {}
}

/**
 * Isi data awal otomatis lengkap untuk beberapa bulan:
 * Agustus 2026, September 2026, Oktober 2026, dan November 2026
 * Agar fitur filter bulan memiliki data yang nyata, relevan, dan berbeda di setiap bulan!
 */
export async function seedInitialData(force = false) {
  if (force) {
    await db.execute('DELETE FROM transactions');
    await db.execute('DELETE FROM budgets');
    await db.execute('DELETE FROM wallets');
    await db.execute('DELETE FROM savings_goals');
  }

  // 1. Wallets
  const wallets = [
    { id: 'w-1', name: 'BCA', type: 'Rekening bank · •••• 4821', balance: 14500000, color: 'blue', icon: 'bank' },
    { id: 'w-2', name: 'GoPay', type: 'Dompet digital · •••• 7812', balance: 2850000, color: 'green', icon: 'phone' },
    { id: 'w-3', name: 'Tunai', type: 'Uang tunai · Dompet sehari-hari', balance: 1450000, color: 'amber', icon: 'cash' },
  ];
  for (const w of wallets) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO wallets (id, name, type, balance, color, icon) VALUES (?, ?, ?, ?, ?, ?)',
      args: [w.id, w.name, w.type, w.balance, w.color, w.icon],
    });
  }

  // 2. Anggaran per bulan (Agustus, September, Oktober, November 2026)
  const monthlyBudgets = [
    // AGUSTUS 2026
    { id: 'b-agu-1', name: 'Makan & minum', limit_amount: 2500000, color: 'green', period: 'Agustus 2026' },
    { id: 'b-agu-2', name: 'Tempat tinggal', limit_amount: 2000000, color: 'green', period: 'Agustus 2026' },
    { id: 'b-agu-3', name: 'Transportasi', limit_amount: 1000000, color: 'green', period: 'Agustus 2026' },
    { id: 'b-agu-4', name: 'Belanja', limit_amount: 1500000, color: 'green', period: 'Agustus 2026' },
    { id: 'b-agu-5', name: 'Lainnya', limit_amount: 800000, color: 'green', period: 'Agustus 2026' },

    // SEPTEMBER 2026
    { id: 'b-sep-1', name: 'Makan & minum', limit_amount: 2500000, color: 'green', period: 'September 2026' },
    { id: 'b-sep-2', name: 'Tempat tinggal', limit_amount: 2000000, color: 'green', period: 'September 2026' },
    { id: 'b-sep-3', name: 'Transportasi', limit_amount: 1000000, color: 'green', period: 'September 2026' },
    { id: 'b-sep-4', name: 'Belanja', limit_amount: 1500000, color: 'green', period: 'September 2026' },
    { id: 'b-sep-5', name: 'Lainnya', limit_amount: 800000, color: 'green', period: 'September 2026' },

    // OKTOBER 2026 (Bulan Berjalan)
    { id: 'b-okt-1', name: 'Makan & minum', limit_amount: 2500000, color: 'green', period: 'Oktober 2026' },
    { id: 'b-okt-2', name: 'Tempat tinggal', limit_amount: 2000000, color: 'green', period: 'Oktober 2026' },
    { id: 'b-okt-3', name: 'Transportasi', limit_amount: 1000000, color: 'green', period: 'Oktober 2026' },
    { id: 'b-okt-4', name: 'Belanja', limit_amount: 1500000, color: 'green', period: 'Oktober 2026' },
    { id: 'b-okt-5', name: 'Lainnya', limit_amount: 800000, color: 'green', period: 'Oktober 2026' },

    // NOVEMBER 2026 (Rencana Bulan Depan)
    { id: 'b-nov-1', name: 'Makan & minum', limit_amount: 2500000, color: 'green', period: 'November 2026' },
    { id: 'b-nov-2', name: 'Tempat tinggal', limit_amount: 2000000, color: 'green', period: 'November 2026' },
    { id: 'b-nov-3', name: 'Transportasi', limit_amount: 1000000, color: 'green', period: 'November 2026' },
    { id: 'b-nov-4', name: 'Belanja', limit_amount: 1500000, color: 'green', period: 'November 2026' },
    { id: 'b-nov-5', name: 'Lainnya', limit_amount: 800000, color: 'green', period: 'November 2026' },
  ];

  for (const b of monthlyBudgets) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO budgets (id, name, spent, limit_amount, color, period) VALUES (?, ?, ?, ?, ?, ?)',
      args: [b.id, b.name, 0, b.limit_amount, b.color, b.period],
    });
  }

  // 3. Transaksi Data Riil per Bulan
  const initialTransactions = [
    // ==========================================
    // AGUSTUS 2026
    // ==========================================
    {
      id: 'tx-agu-01',
      title: 'Gaji Pokok Agustus',
      date: '01 Agu 2026',
      category: 'Gaji',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: 9500000,
      type: 'income',
      icon: 'briefcase',
      notes: 'Gaji bulanan kantor pusat',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-02',
      title: 'Pembayaran Sewa Kost',
      date: '02 Agu 2026',
      category: 'Tempat tinggal',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: -1800000,
      type: 'expense',
      icon: 'home',
      notes: 'Sewa kost periode Agustus',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-03',
      title: 'Belanja Bulanan Supermarket',
      date: '05 Agu 2026',
      category: 'Belanja',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -850000,
      type: 'expense',
      icon: 'shopping-bag',
      notes: 'Bahan masakan & perlengkapan mandi',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-04',
      title: 'Isi Bensin & Saldo Tol',
      date: '08 Agu 2026',
      category: 'Transportasi',
      wallet_id: 'w-3',
      wallet_name: 'Tunai',
      amount: -250000,
      type: 'expense',
      icon: 'fuel',
      notes: 'Bensin motor dan e-toll',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-05',
      title: 'Makan Siang & Kopi Mingguan',
      date: '12 Agu 2026',
      category: 'Makan & minum',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -420000,
      type: 'expense',
      icon: 'coffee',
      notes: 'Makan siang hari kerja',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-06',
      title: 'Bonus Proyek Aplikasi Web',
      date: '15 Agu 2026',
      category: 'Investasi',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: 2000000,
      type: 'income',
      icon: 'briefcase',
      notes: 'Insentif milestone 1 klien',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-07',
      title: 'Beli Pakaian Kerja Formal',
      date: '18 Agu 2026',
      category: 'Belanja',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: -450000,
      type: 'expense',
      icon: 'shopping-bag',
      notes: 'Kemeja dan celana kantor',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-08',
      title: 'Servis Rutin Kendaraan',
      date: '22 Agu 2026',
      category: 'Transportasi',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: -500000,
      type: 'expense',
      icon: 'fuel',
      notes: 'Ganti ban dan oli mesin',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-09',
      title: 'Makan Malam Akhir Pekan',
      date: '25 Agu 2026',
      category: 'Makan & minum',
      wallet_id: 'w-3',
      wallet_name: 'Tunai',
      amount: -680000,
      type: 'expense',
      icon: 'coffee',
      notes: 'Makan bersama keluarga',
      period: 'Agustus 2026',
    },
    {
      id: 'tx-agu-10',
      title: 'Tagihan Listrik & Internet',
      date: '28 Agu 2026',
      category: 'Lainnya',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -450000,
      type: 'expense',
      icon: 'home',
      notes: 'PLN token dan IndiHome',
      period: 'Agustus 2026',
    },

    // ==========================================
    // SEPTEMBER 2026
    // ==========================================
    {
      id: 'tx-sep-01',
      title: 'Gaji Pokok September',
      date: '01 Sep 2026',
      category: 'Gaji',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: 9500000,
      type: 'income',
      icon: 'briefcase',
      notes: 'Gaji bulanan September',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-02',
      title: 'Sewa Kost Bulanan',
      date: '02 Sep 2026',
      category: 'Tempat tinggal',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: -1800000,
      type: 'expense',
      icon: 'home',
      notes: 'Sewa kost periode September',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-03',
      title: 'Belanja Bahan Dapur & Makanan',
      date: '06 Sep 2026',
      category: 'Belanja',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -650000,
      type: 'expense',
      icon: 'shopping-bag',
      notes: 'Bahan masak mingguan',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-04',
      title: 'Bensin Motor & Ojek Online',
      date: '10 Sep 2026',
      category: 'Transportasi',
      wallet_id: 'w-3',
      wallet_name: 'Tunai',
      amount: -220000,
      type: 'expense',
      icon: 'fuel',
      notes: 'Bensin Pertamax 2 minggu',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-05',
      title: 'Makan Siang & Kopi Kantor',
      date: '14 Sep 2026',
      category: 'Makan & minum',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -380000,
      type: 'expense',
      icon: 'coffee',
      notes: 'Makan siang warteg & es kopi',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-06',
      title: 'Proyek Desain UI/UX Freelance',
      date: '17 Sep 2026',
      category: 'Investasi',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: 1800000,
      type: 'income',
      icon: 'briefcase',
      notes: 'Pembayaran project landing page',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-07',
      title: 'Perlengkapan Meja Kerja',
      date: '20 Sep 2026',
      category: 'Belanja',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -450000,
      type: 'expense',
      icon: 'shopping-bag',
      notes: 'Lampu meja dan organizer',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-08',
      title: 'Ganti Oli & Cuci Kendaraan',
      date: '23 Sep 2026',
      category: 'Transportasi',
      wallet_id: 'w-3',
      wallet_name: 'Tunai',
      amount: -400000,
      type: 'expense',
      icon: 'fuel',
      notes: 'Servis rutin berkala',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-09',
      title: 'Wisata Kuliner Akhir Pekan',
      date: '26 Sep 2026',
      category: 'Makan & minum',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -520000,
      type: 'expense',
      icon: 'coffee',
      notes: 'Kuliner malam bersama teman',
      period: 'September 2026',
    },
    {
      id: 'tx-sep-10',
      title: 'Paket Data & Langganan Musik',
      date: '29 Sep 2026',
      category: 'Lainnya',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: -350000,
      type: 'expense',
      icon: 'circle',
      notes: 'Telkomsel & Spotify Premium',
      period: 'September 2026',
    },

    // ==========================================
    // OKTOBER 2026 (Bulan Berjalan)
    // ==========================================
    {
      id: 'tx-okt-01',
      title: 'Gaji Pokok Oktober',
      date: '01 Okt 2026',
      category: 'Gaji',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: 9500000,
      type: 'income',
      icon: 'briefcase',
      notes: 'Gaji bulanan reguler',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-02',
      title: 'Pembayaran Sewa Kost',
      date: '02 Okt 2026',
      category: 'Tempat tinggal',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: -1800000,
      type: 'expense',
      icon: 'home',
      notes: 'Lunas sewa kamar bulan Oktober',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-03',
      title: 'Belanja Kebutuhan Pokok Superindo',
      date: '05 Okt 2026',
      category: 'Belanja',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -520000,
      type: 'expense',
      icon: 'shopping-bag',
      notes: 'Beras, minyak, sabun, buah',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-04',
      title: 'Isi Bensin Pertamax Penuh',
      date: '09 Okt 2026',
      category: 'Transportasi',
      wallet_id: 'w-3',
      wallet_name: 'Tunai',
      amount: -180000,
      type: 'expense',
      icon: 'fuel',
      notes: 'SPBU Pertamina',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-05',
      title: 'Makan Siang & Kopi Kenangan',
      date: '12 Okt 2026',
      category: 'Makan & minum',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -250000,
      type: 'expense',
      icon: 'coffee',
      notes: 'Makan siang bareng tim',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-06',
      title: 'Dividen Reksa Dana Pasar Uang',
      date: '16 Okt 2026',
      category: 'Investasi',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: 450000,
      type: 'income',
      icon: 'briefcase',
      notes: 'Hasil bagi hasil bulanan Bibit',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-07',
      title: 'Beli Buku Pemrograman & Catatan',
      date: '19 Okt 2026',
      category: 'Belanja',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -300000,
      type: 'expense',
      icon: 'shopping-bag',
      notes: 'Buku teknologi di Gramedia',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-08',
      title: 'Ongkos KRL Commuterline & Gojek',
      date: '22 Okt 2026',
      category: 'Transportasi',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -300000,
      type: 'expense',
      icon: 'fuel',
      notes: 'Transport harian bolak-balik kantor',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-09',
      title: 'Traktir Ulang Tahun Sahabat',
      date: '24 Okt 2026',
      category: 'Makan & minum',
      wallet_id: 'w-3',
      wallet_name: 'Tunai',
      amount: -450000,
      type: 'expense',
      icon: 'coffee',
      notes: 'Makan malam santai',
      period: 'Oktober 2026',
    },
    {
      id: 'tx-okt-10',
      title: 'Donasi & Sedekah Jumat',
      date: '25 Okt 2026',
      category: 'Lainnya',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -250000,
      type: 'expense',
      icon: 'circle',
      notes: 'Penyaluran sedekah online',
      period: 'Oktober 2026',
    },

    // ==========================================
    // NOVEMBER 2026 (Rencana Bulan Depan)
    // ==========================================
    {
      id: 'tx-nov-01',
      title: 'Estimasi Gaji Pokok November',
      date: '01 Nov 2026',
      category: 'Gaji',
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      amount: 9500000,
      type: 'income',
      icon: 'briefcase',
      notes: 'Gaji masuk awal bulan',
      period: 'November 2026',
    },
    {
      id: 'tx-nov-02',
      title: 'Belanja Awal Bulan Bahan Pokok',
      date: '02 Nov 2026',
      category: 'Belanja',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -200000,
      type: 'expense',
      icon: 'shopping-bag',
      notes: 'Belanja perlengkapan awal bulan',
      period: 'November 2026',
    },
    {
      id: 'tx-nov-03',
      title: 'Isi Saldo E-Toll & Bensin',
      date: '03 Nov 2026',
      category: 'Transportasi',
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      amount: -120000,
      type: 'expense',
      icon: 'fuel',
      notes: 'Persiapan mobilitas',
      period: 'November 2026',
    },
    {
      id: 'tx-nov-04',
      title: 'Sarapan & Kopi Pagi',
      date: '04 Nov 2026',
      category: 'Makan & minum',
      wallet_id: 'w-3',
      wallet_name: 'Tunai',
      amount: -75000,
      type: 'expense',
      icon: 'coffee',
      notes: 'Roti bakar dan kopi pagi',
      period: 'November 2026',
    },
  ];

  for (const tx of initialTransactions) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO transactions 
            (id, title, date, category, wallet_id, wallet_name, amount, type, icon, notes, period)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        tx.id,
        tx.title,
        tx.date,
        tx.category,
        tx.wallet_id,
        tx.wallet_name,
        tx.amount,
        tx.type,
        tx.icon,
        tx.notes,
        tx.period,
      ],
    });
  }

  // 4. Sinkronisasi akumulasi spent pada anggaran per bulan dari data transaksi di atas
  for (const b of monthlyBudgets) {
    const spentRes = await db.execute({
      sql: `SELECT SUM(ABS(amount)) as total 
            FROM transactions 
            WHERE type = 'expense' AND category = ? AND period = ?`,
      args: [b.name, b.period],
    });
    const spentVal = Number(spentRes.rows[0]?.total || 0);
    await db.execute({
      sql: 'UPDATE budgets SET spent = ? WHERE id = ?',
      args: [spentVal, b.id],
    });
  }

  // 5. Target Tabungan
  const savings = [
    { id: 's-1', name: 'Dana Darurat 6 Bulan', target_date: 'Target Des 2026', current_amount: 15000000, target_amount: 30000000, type: 'emergency' },
    { id: 's-2', name: 'Liburan Akhir Tahun', target_date: 'Target Des 2026', current_amount: 3500000, target_amount: 8000000, type: 'vacation' },
    { id: 's-3', name: 'Investasi Saham & Gadget', target_date: 'Target Mar 2027', current_amount: 4200000, target_amount: 12000000, type: 'gadget' },
  ];
  for (const s of savings) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO savings_goals (id, name, target_date, current_amount, target_amount, type) VALUES (?, ?, ?, ?, ?, ?)',
      args: [s.id, s.name, s.target_date, s.current_amount, s.target_amount, s.type],
    });
  }

  // 6. Jadwal Finansial (Utang, Tagihan, Cicilan, dsb.)
  const schedules = [
    {
      id: 'sch-1',
      title: 'Bayar Utang Laptop ke Budi',
      type: 'debt',
      amount: 450000,
      due_date: '2026-10-30',
      recurring: 'once',
      recurring_day: null,
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      notes: 'Pelunasan sisa pinjaman ram laptop',
      is_paid: 0,
      paid_at: null,
    },
    {
      id: 'sch-2',
      title: 'Tagihan Listrik PLN',
      type: 'bill',
      amount: 285000,
      due_date: '2026-10-20',
      recurring: 'monthly',
      recurring_day: 20,
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      notes: 'Tagihan listrik bulanan rumah',
      is_paid: 1,
      paid_at: '2026-10-20',
    },
    {
      id: 'sch-3',
      title: 'Internet WiFi IndiHome',
      type: 'bill',
      amount: 375000,
      due_date: '2026-11-05',
      recurring: 'monthly',
      recurring_day: 5,
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      notes: 'Jatuh tempo setiap tanggal 5 awal bulan',
      is_paid: 0,
      paid_at: null,
    },
    {
      id: 'sch-4',
      title: 'Cicilan Motor Honda',
      type: 'installment',
      amount: 850000,
      due_date: '2026-11-12',
      recurring: 'monthly',
      recurring_day: 12,
      wallet_id: 'w-1',
      wallet_name: 'BCA',
      notes: 'Cicilan bulan ke-8 dari 12',
      is_paid: 0,
      paid_at: null,
    },
    {
      id: 'sch-5',
      title: 'Langganan Spotify & Netflix',
      type: 'subscription',
      amount: 186000,
      due_date: '2026-11-16',
      recurring: 'monthly',
      recurring_day: 16,
      wallet_id: 'w-2',
      wallet_name: 'GoPay',
      notes: 'Paket keluarga langganan bulanan',
      is_paid: 0,
      paid_at: null,
    },
    {
      id: 'sch-6',
      title: 'Bayar Utang Kas Kelas / Teman',
      type: 'debt',
      amount: 150000,
      due_date: '2026-11-02',
      recurring: 'once',
      recurring_day: null,
      wallet_id: 'w-3',
      wallet_name: 'Tunai',
      notes: 'Uang makan bersama tempo lalu',
      is_paid: 0,
      paid_at: null,
    },
  ];

  for (const item of schedules) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO financial_schedules 
            (id, title, type, amount, due_date, recurring, recurring_day, wallet_id, wallet_name, notes, is_paid, paid_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.title,
        item.type,
        item.amount,
        item.due_date,
        item.recurring,
        item.recurring_day,
        item.wallet_id,
        item.wallet_name,
        item.notes,
        item.is_paid,
        item.paid_at,
      ],
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
  await db.execute('DELETE FROM financial_schedules');
  await db.execute('UPDATE wallets SET balance = 0');
  await db.execute('UPDATE budgets SET spent = 0, limit_amount = 0');
}

let dbReadyPromise = null;

export async function ensureDbReady() {
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      await initializeDatabase();
      const countRes = await db.execute('SELECT COUNT(*) as cnt FROM transactions');
      if (Number(countRes.rows[0]?.cnt || 0) === 0) {
        await seedInitialData(true);
      } else {
        // Cek jika tabel schedules masih kosong, tambahkan initial data
        const schCount = await db.execute('SELECT COUNT(*) as cnt FROM financial_schedules');
        if (Number(schCount.rows[0]?.cnt || 0) === 0) {
          const starterSchedules = [
            {
              id: 'sch-1',
              title: 'Bayar Utang Laptop ke Budi',
              type: 'debt',
              amount: 450000,
              due_date: '2026-10-30',
              recurring: 'once',
              recurring_day: null,
              wallet_id: 'w-1',
              wallet_name: 'BCA',
              notes: 'Pelunasan sisa pinjaman ram laptop',
              is_paid: 0,
              paid_at: null,
            },
            {
              id: 'sch-2',
              title: 'Tagihan Listrik PLN',
              type: 'bill',
              amount: 285000,
              due_date: '2026-10-20',
              recurring: 'monthly',
              recurring_day: 20,
              wallet_id: 'w-2',
              wallet_name: 'GoPay',
              notes: 'Tagihan listrik bulanan rumah',
              is_paid: 1,
              paid_at: '2026-10-20',
            },
            {
              id: 'sch-3',
              title: 'Internet WiFi IndiHome',
              type: 'bill',
              amount: 375000,
              due_date: '2026-11-05',
              recurring: 'monthly',
              recurring_day: 5,
              wallet_id: 'w-1',
              wallet_name: 'BCA',
              notes: 'Jatuh tempo setiap tanggal 5 awal bulan',
              is_paid: 0,
              paid_at: null,
            },
            {
              id: 'sch-4',
              title: 'Cicilan Motor Honda',
              type: 'installment',
              amount: 850000,
              due_date: '2026-11-12',
              recurring: 'monthly',
              recurring_day: 12,
              wallet_id: 'w-1',
              wallet_name: 'BCA',
              notes: 'Cicilan bulan ke-8 dari 12',
              is_paid: 0,
              paid_at: null,
            },
            {
              id: 'sch-5',
              title: 'Langganan Spotify & Netflix',
              type: 'subscription',
              amount: 186000,
              due_date: '2026-11-16',
              recurring: 'monthly',
              recurring_day: 16,
              wallet_id: 'w-2',
              wallet_name: 'GoPay',
              notes: 'Paket keluarga langganan bulanan',
              is_paid: 0,
              paid_at: null,
            },
            {
              id: 'sch-6',
              title: 'Bayar Utang Kas Kelas / Teman',
              type: 'debt',
              amount: 150000,
              due_date: '2026-11-02',
              recurring: 'once',
              recurring_day: null,
              wallet_id: 'w-3',
              wallet_name: 'Tunai',
              notes: 'Uang makan bersama tempo lalu',
              is_paid: 0,
              paid_at: null,
            },
          ];
          for (const item of starterSchedules) {
            await db.execute({
              sql: `INSERT OR REPLACE INTO financial_schedules 
                    (id, title, type, amount, due_date, recurring, recurring_day, wallet_id, wallet_name, notes, is_paid, paid_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                item.id,
                item.title,
                item.type,
                item.amount,
                item.due_date,
                item.recurring,
                item.recurring_day,
                item.wallet_id,
                item.wallet_name,
                item.notes,
                item.is_paid,
                item.paid_at,
              ],
            });
          }
        }
      }
    })().catch((err) => {
      dbReadyPromise = null;
      throw err;
    });
  }
  return dbReadyPromise;
}
