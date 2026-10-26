'use client';

import { formatSimpleIDR } from './formatters';

export const DEFAULT_NOTIF_SETTINGS = {
  enabled: true,
  dailyReminder: true,
  dailyReminderTime: '20:00',
  lowBalanceAlert: true,
  lowBalanceThreshold: 100000, // Rp 100.000
  budgetAlert: true,
  budgetThreshold80: true,
  budgetThreshold100: true,
  billReminder: true,
  paydayAlert: true,
  paydayDate: 25,
  savingsMilestone: true,
  weeklySummary: true,
  soundEnabled: true,
};

const SETTINGS_KEY = 'saku_notification_settings_v1';
const NOTIFS_KEY = 'saku_notifications_list_v1';
const SUPPRESSED_KEYS = 'saku_notif_suppressed_keys_v1';

// Load stored settings from localStorage
export function loadNotifSettings() {
  if (typeof window === 'undefined') return DEFAULT_NOTIF_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIF_SETTINGS;
    return { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_NOTIF_SETTINGS;
  }
}

// Save settings to localStorage
export function saveNotifSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

// Load notification list
export function loadNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Save notification list
export function saveNotifications(notifs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs.slice(0, 50))); // Keep up to 50
  } catch (e) {}
}

// Load suppressed trigger keys (so we don't spam the user)
function loadSuppressedKeys() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SUPPRESSED_KEYS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Save suppressed trigger keys
function saveSuppressedKeys(keys) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUPPRESSED_KEYS, JSON.stringify(keys));
  } catch (e) {}
}

// Play notification sound if enabled
export function playChime() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    
    // Pleasant double chime: 587Hz (D5) -> 880Hz (A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) {
    // AudioContext might be blocked before first user gesture
  }
}

// Helper untuk konversi VAPID public key
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Daftarkan browser/HP ke Push Notification server agar notifikasi bisa muncul saat aplikasi ditutup
export async function subscribeToPushNotifications() {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] ServiceWorker or PushManager not supported');
    return null;
  }
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      // Ambil VAPID public key dari server
      const res = await fetch('/api/push/subscribe');
      const { publicKey } = await res.json();
      if (!publicKey) return null;

      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // Simpan ke database backend
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      }),
    });

    console.log('[Push] Device registered for background notifications successfully!');
    return subscription;
  } catch (err) {
    console.warn('[Push] Failed to subscribe for background push:', err);
    return null;
  }
}

// Request browser Web Push notification permission
export async function requestPushPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Otomatis daftarkan langganan background push
      subscribeToPushNotifications().catch(() => {});
    }
    return permission;
  } catch (err) {
    return 'denied';
  }
}

// Trigger Web Push Notification langsung di perangkat (menampilkan bubble sistem Android/iOS/Desktop)
export async function sendPushNotification(title, options = {}) {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  const notifOptions = {
    body: options.body || options.message || 'Buka Saku untuk melihat detailnya.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: options.tag || `saku-notif-${Date.now()}`,
    renotify: true,
    data: {
      url: options.url || '/',
      actionTarget: options.actionTarget || null,
      ...options.data,
    },
    actions: [
      { action: 'open', title: 'Buka Saku' }
    ],
    ...options,
  };

  // Di Android Chrome & PWA, HARUS menggunakan ServiceWorkerRegistration.showNotification()
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notifOptions);
        return true;
      }
    } catch (swErr) {
      console.warn('[Push] ServiceWorker showNotification error:', swErr);
    }
  }

  // Fallback desktop browser Notification constructor
  try {
    const notif = new Notification(title, notifOptions);
    if (options.actionTarget && options.onAction) {
      notif.onclick = () => {
        window.focus();
        options.onAction(options.actionTarget);
        notif.close();
      };
    }
    return true;
  } catch (err) {
    console.warn('Browser notification error:', err);
    return false;
  }
}

// Mengirim Push Notification dari server (berfungsi saat HP dikunci atau PWA ditutup)
export async function triggerServerPushNotification({
  title,
  message,
  url = '/',
  target = null,
  delaySeconds = 0,
}) {
  try {
    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        message,
        url,
        target,
        delaySeconds,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('triggerServerPushNotification error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Intelligent Notification Evaluator:
 * Evaluates budget, balance, daily logging, bills, payday, and milestones
 * and returns newly generated notifications.
 */
export function evaluateNotifications(data, settings = DEFAULT_NOTIF_SETTINGS) {
  if (!settings.enabled || !data) return [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday

  const todayDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;
  const monthPeriodStr = data.profile?.period || `${currentMonth + 1}-${currentYear}`;

  const suppressed = loadSuppressedKeys();
  const newNotifs = [];

  const addIfNew = (key, notifPayload) => {
    if (suppressed[key]) return false;
    suppressed[key] = Date.now();
    newNotifs.push({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      read: false,
      ...notifPayload,
    });
    return true;
  };

  // =========================================================================
  // 1. SALDO MENIPIS WARNING
  // =========================================================================
  if (settings.lowBalanceAlert) {
    const totalSaldo = data.wallets ? data.wallets.reduce((s, w) => s + (Number(w.balance) || 0), 0) : (data.metrics?.totalSaldo || 0);
    const threshold = Number(settings.lowBalanceThreshold) || 100000;

    // Trigger if balance drops to or below threshold
    if (totalSaldo <= threshold) {
      const key = `low_balance_${todayDateStr}`;
      addIfNew(key, {
        type: 'low_balance',
        category: 'alert',
        title: 'Saldo Dompet Menipis!',
        message: `Perhatian! Total saldo dompetmu tersisa ${formatSimpleIDR(totalSaldo)} (di bawah batas ${formatSimpleIDR(threshold)}). Batasi pengeluaran non-primer agar tetap aman.`,
        action: {
          label: 'Lihat Dompet',
          target: 'dompet',
        },
      });
    }
  }

  // =========================================================================
  // 2. DAILY EXPENSE TRACKER (Pengingat Rutin Harian)
  // Trigger: Pukul settings.dailyReminderTime (misal 20:00) jika user_has_logged_today == false
  // =========================================================================
  if (settings.dailyReminder) {
    const [targetHour, targetMin] = (settings.dailyReminderTime || '20:00').split(':').map((v) => parseInt(v, 10) || 0);
    const isPastTargetTime = currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMin);

    if (isPastTargetTime) {
      // Check if user has logged any transaction today
      const hasLoggedToday = (data.transactions || []).some((tx) => {
        if (!tx.date) return false;
        // Check date matching today's day number or ISO string
        const dayMatch = String(tx.date).match(/\b(\d{1,2})\b/);
        if (dayMatch && parseInt(dayMatch[1], 10) === currentDate) {
          return true;
        }
        return String(tx.date).includes(todayDateStr);
      });

      if (!hasLoggedToday) {
        const key = `daily_log_${todayDateStr}`;
        addIfNew(key, {
          type: 'daily_reminder',
          category: 'reminder',
          title: 'Pengingat Catat Pengeluaran',
          message: 'Sudah catat pengeluaranmu hari ini? Cuma butuh 10 detik biar keuangan tetap terkontrol.',
          action: {
            label: 'Catat Sekarang',
            target: 'add_tx',
          },
        });
      }
    }
  }

  // =========================================================================
  // 3. BUDGET & LIMIT ALERTS (Peringatan Anggaran 80% & 100%)
  // =========================================================================
  if (settings.budgetAlert && data.budgets && data.budgets.length > 0) {
    data.budgets.forEach((b) => {
      const limit = Number(b.limit) || 0;
      const spent = Number(b.spent) || 0;
      if (limit <= 0) return;

      const ratio = spent / limit;
      const percent = Math.round(ratio * 100);

      // 100% threshold reached or exceeded
      if (ratio >= 1.0 && settings.budgetThreshold100) {
        const overspent = spent - limit;
        const key = `budget_100_${b.id}_${monthPeriodStr}`;
        addIfNew(key, {
          type: 'budget_100',
          category: 'alert',
          title: `Batas Anggaran ${b.name} Terlewati!`,
          message: overspent > 0
            ? `Kamu telah melewati batas budget ${b.name} bulan ini sebesar ${formatSimpleIDR(overspent)}.`
            : `Kamu telah mencapai 100% batas budget ${b.name} (${formatSimpleIDR(limit)}).`,
          action: {
            label: 'Sesuaikan Anggaran',
            target: 'anggaran',
          },
        });
      }
      // 80% threshold reached (between 80% and 99.9%)
      else if (ratio >= 0.8 && settings.budgetThreshold80) {
        const key = `budget_80_${b.id}_${monthPeriodStr}`;
        addIfNew(key, {
          type: 'budget_80',
          category: 'alert',
          title: `Waspada Budget ${b.name}`,
          message: `Waspada! Budget ${b.name} kamu sudah terpakai ${percent}% bulan ini.`,
          action: {
            label: 'Tinjau Anggaran',
            target: 'anggaran',
          },
        });
      }
    });
  }

  // =========================================================================
  // 4. BILL DUE DATE WARNING (H-3 dan H-1)
  // =========================================================================
  if (settings.billReminder) {
    // Check any transactions / recurring tagihan categorized as tagihan or utilities
    const tagihanItems = (data.budgets || []).filter((b) => {
      const n = (b.name || '').toLowerCase();
      return n.includes('tagihan') || n.includes('listrik') || n.includes('air') || n.includes('wifi') || n.includes('sewa');
    });

    // In finance apps, bills typically recur around end of month or 1st-5th.
    // If user has a tagihan category with a budget set, notify around late/early month
    tagihanItems.forEach((bill) => {
      const billKey = `bill_due_${bill.id}_${monthPeriodStr}`;
      // Trigger H-3 reminder if day is between 25-28
      if (currentDate >= 25 && currentDate <= 28) {
        addIfNew(billKey, {
          type: 'bill_due',
          category: 'reminder',
          title: `Pengingat Tagihan ${bill.name}`,
          message: `Tagihan ${bill.name} sebesar ${formatSimpleIDR(bill.limit || 250000)} jatuh tempo sebentar lagi. Jangan lupa bayar tepat waktu!`,
          action: {
            label: 'Catat Pembayaran',
            target: 'add_tx',
          },
        });
      }
    });
  }

  // =========================================================================
  // 5. PAYDAY ALLOCATION (Pengingat Hari Gajian)
  // =========================================================================
  if (settings.paydayAlert) {
    const paydayDay = Number(settings.paydayDate) || 25;
    if (currentDate === paydayDay) {
      const key = `payday_${currentYear}_${currentMonth}`;
      addIfNew(key, {
        type: 'payday',
        category: 'reminder',
        title: 'Hari Gajian Tiba! 🎉',
        message: 'Hari ini gajian! Yuk, langsung alokasikan gajimu ke pos tabungan dan kebutuhan sebelum terpakai untuk hal lain.',
        action: {
          label: 'Alokasikan Tabungan',
          target: 'target-tabungan',
        },
      });
    }
  }

  // =========================================================================
  // 6. SAVINGS PROGRESS MILESTONES (50%, 75%, 100%)
  // =========================================================================
  if (settings.savingsMilestone && data.savings && data.savings.length > 0) {
    data.savings.forEach((goal) => {
      const current = Number(goal.current) || 0;
      const target = Number(goal.target) || 0;
      if (target <= 0) return;

      const ratio = current / target;

      if (ratio >= 1.0) {
        const key = `savings_milestone_${goal.id}_100`;
        addIfNew(key, {
          type: 'savings_milestone',
          category: 'milestone',
          title: `Target Tercapai: ${goal.name}! 🎯`,
          message: `Selamat! Target tabungan ${goal.name} telah 100% tercapai (${formatSimpleIDR(current)}). Kerja bagus!`,
          action: {
            label: 'Lihat Pencapaian',
            target: 'target-tabungan',
          },
        });
      } else if (ratio >= 0.75) {
        const key = `savings_milestone_${goal.id}_75`;
        addIfNew(key, {
          type: 'savings_milestone',
          category: 'milestone',
          title: `Milestone: ${goal.name}`,
          message: `Sedikit lagi! Target ${goal.name} kamu sudah mencapai 75% (${formatSimpleIDR(current)} dari ${formatSimpleIDR(target)}).`,
          action: {
            label: 'Tambah Setoran',
            target: 'target-tabungan',
          },
        });
      } else if (ratio >= 0.5) {
        const key = `savings_milestone_${goal.id}_50`;
        addIfNew(key, {
          type: 'savings_milestone',
          category: 'milestone',
          title: `Setengah Jalan: ${goal.name}`,
          message: `Mantap! Target ${goal.name} kamu sudah mencapai 50% (${formatSimpleIDR(current)}). Pertahankan konsistensi!`,
          action: {
            label: 'Lihat Target',
            target: 'target-tabungan',
          },
        });
      }
    });
  }

  // =========================================================================
  // 7. FINANCIAL INSIGHTS: WEEKLY SUMMARY (Minggu pukul 19:00)
  // =========================================================================
  if (settings.weeklySummary && currentDayOfWeek === 0 && currentHour >= 19) {
    // Week number of year
    const firstDayOfYear = new Date(currentYear, 0, 1);
    const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    const key = `weekly_summary_${currentYear}_w${weekNum}`;
    addIfNew(key, {
      type: 'weekly_summary',
      category: 'insight',
      title: 'Laporan Keuangan Mingguan Siap',
      message: 'Laporan keuangan minggu ini sudah siap! Cek perbandingan pengeluaran dan evaluasi cashflowmu di sini.',
      action: {
        label: 'Lihat Laporan',
        target: 'laporan',
      },
    });
  }

  if (newNotifs.length > 0) {
    saveSuppressedKeys(suppressed);
  }

  return newNotifs;
}
