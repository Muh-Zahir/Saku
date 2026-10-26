import { db, ensureDbReady } from '@/lib/db';
import { VAPID_PUBLIC_KEY } from '@/lib/vapid';
import { NextResponse } from 'next/server';

// GET /api/push/subscribe - Mengambil VAPID Public Key untuk pendaftaran push di client
export async function GET() {
  return NextResponse.json({
    publicKey: VAPID_PUBLIC_KEY,
  });
}

// POST /api/push/subscribe - Menyimpan langganan Push Notification Web ke database
export async function POST(request) {
  try {
    await ensureDbReady();

    const body = await request.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    const p256dh = keys?.p256dh || '';
    const auth = keys?.auth || '';
    const subId = `sub-${Buffer.from(endpoint).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-24)}`;

    await db.execute({
      sql: `INSERT OR REPLACE INTO push_subscriptions (id, endpoint, p256dh, auth, user_agent)
            VALUES (?, ?, ?, ?, ?)`,
      args: [subId, endpoint, p256dh, auth, userAgent || null],
    });

    console.log('[Push] Subscription saved successfully for endpoint:', endpoint.slice(0, 35) + '...');
    return NextResponse.json({ success: true, message: 'Push subscription registered successfully' });
  } catch (error) {
    console.error('POST /api/push/subscribe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/push/subscribe - Menghapus langganan jika user menonaktifkan notifikasi
export async function DELETE(request) {
  try {
    await ensureDbReady();

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint) {
      await db.execute({
        sql: 'DELETE FROM push_subscriptions WHERE endpoint = ?',
        args: [endpoint],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/push/subscribe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
