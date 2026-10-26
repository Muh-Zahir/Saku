import { db, ensureDbReady } from '@/lib/db';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from '@/lib/vapid';
import webpush from 'web-push';
import { NextResponse } from 'next/server';

// Inisialisasi konfigurasi VAPID untuk web-push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// POST /api/push/send - Mengirim Push Notification ke seluruh perangkat yang terdaftar
export async function POST(request) {
  try {
    await ensureDbReady();

    const body = await request.json();
    const {
      title = 'Saku — Keuangan Pribadi',
      message = 'Periksa kondisi keuangan dan anggaranmu hari ini.',
      url = '/',
      target = null,
      tag = 'saku-alert',
      delaySeconds = 0,
    } = body;

    // Ambil seluruh langganan push dari database
    const subsRes = await db.execute('SELECT * FROM push_subscriptions');
    const subscriptions = subsRes.rows;

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        sentCount: 0,
        message: 'Belum ada perangkat yang mengaktifkan izin Push Notification.',
      });
    }

    // Jika ada penundaan (delaySeconds), tunggu sebelum mengirim (misal agar user sempat kunci HP)
    if (delaySeconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
    }

    const payload = JSON.stringify({
      title,
      message,
      url,
      target,
      tag,
      timestamp: Date.now(),
    });

    let sentCount = 0;
    const staleEndpoints = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload, {
            urgency: 'high',
            TTL: 60 * 60 * 24, // 24 jam
          });
          sentCount++;
        } catch (err) {
          console.warn('[Push] Error sending to endpoint:', sub.endpoint.slice(0, 30), err.statusCode || err.message);
          // Hapus endpoint yang sudah kedaluwarsa (HTTP 410 atau 404)
          if (err.statusCode === 410 || err.statusCode === 404) {
            staleEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // Bersihkan langganan kadaluwarsa dari database
    if (staleEndpoints.length > 0) {
      for (const ep of staleEndpoints) {
        await db.execute({
          sql: 'DELETE FROM push_subscriptions WHERE endpoint = ?',
          args: [ep],
        });
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalDevices: subscriptions.length,
      message: `Notifikasi berhasil dikirim ke ${sentCount} perangkat.`,
    });
  } catch (error) {
    console.error('POST /api/push/send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
